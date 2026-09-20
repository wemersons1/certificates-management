<?php

namespace App\Console\Commands;

use App\Models\Course;
use App\Models\DocumentTemplate;
use App\Models\DocumentTemplateFrame;
use App\Services\Gemini\GeminiService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GenerateCertificateHtml extends Command
{
    protected $signature = 'certificate:generate-html
                            {input? : Caminho do arquivo de entrada (.pdf ou .docx)}
                            {--output= : Caminho do HTML de saida}
                            {--meta-output= : Caminho do JSON de metadados de saida}
                            {--course-id= : ID do curso para vincular o frame gerado}
                            {--entity-id= : ID da entidade dona do frame}';
    protected $description = 'Converte PDF ou DOCX para HTML equivalente';

    private string $tmpDir;
    private array  $meta         = [];
    private array  $generationMeta = [
        'mask_values' => [],
        'orientation' => null,
    ];
    private array  $pageImages   = [];
    private array  $processedImages = [];

    public function handle(): int
    {
        $inputPath = $this->resolveInputPath((string) $this->argument('input'));

        if ($inputPath === null) {
            $defaultDocxPath = storage_path('app/CERTIFICADO.docx');
            $defaultPdfPath = storage_path('app/CERTIFICADO_1.pdf');
            $this->error("Arquivo nao encontrado. Informe um .pdf ou .docx (padrao: {$defaultPdfPath} ou {$defaultDocxPath}).");
            return self::FAILURE;
        }

        $extension = strtolower(pathinfo($inputPath, PATHINFO_EXTENSION));
        if (! in_array($extension, ['pdf', 'docx'], true)) {
            $this->error('Formato nao suportado. Use apenas arquivos .pdf ou .docx.');
            return self::FAILURE;
        }

        $outputPath = $this->resolveOutputPath($inputPath, (string) $this->option('output'));
        $this->tmpDir = sys_get_temp_dir() . '/cert_' . uniqid();
        mkdir($this->tmpDir, 0755, true);

        try {
            if ($extension === 'pdf') {
                $html = $this->convertPdfToHtml($inputPath);
            } else {
                $html = $this->convertDocxToHtml($inputPath);
            }
            if (empty($html)) {
                $this->error('Falha ao converter arquivo para HTML.');
                return self::FAILURE;
            }

            $this->info('Salvando HTML...');
   
            file_put_contents($outputPath, $html);

            $metaOutputPath = trim((string) $this->option('meta-output'));
            if ($metaOutputPath !== '') {
                $this->writeGenerationMeta($metaOutputPath, $html, $extension);
            }

            $courseId  = trim((string) $this->option('course-id'));
            $entityId  = trim((string) $this->option('entity-id'));
            if ($courseId !== '' && $entityId !== '') {
                $this->persistFrameImagesToS3AndLinkToCourse($html, (int) $courseId, (int) $entityId);
            }

            $this->info("✅ Concluído! Arquivo: {$outputPath}");

        } finally {
            $this->cleanup();
        }

        return self::SUCCESS;
    }

    private function resolveInputPath(string $input): ?string
    {
        $input = trim($input);
        $candidates = [];

        if ($input === '') {
            // Para testes atuais, PDF _1 e' prioridade quando nenhum arquivo e' informado.
            $candidates[] = storage_path('app/CERTIFICADO_1.pdf');
            $candidates[] = storage_path('app/CERTIFICADO.docx');
            $candidates[] = storage_path('app/CERTIFICADO.pdf');
        } else {
            $candidates[] = $input;
            $candidates[] = base_path($input);
            $candidates[] = storage_path('app/' . ltrim($input, '/'));
        }

        foreach ($candidates as $candidate) {
            if (is_file($candidate)) {
                return $candidate;
            }
        }

        return null;
    }

    private function resolveOutputPath(string $inputPath, string $outputOption): string
    {
        $outputOption = trim($outputOption);

        if ($outputOption === '') {
            $filename = pathinfo($inputPath, PATHINFO_FILENAME) . '.html';
            return storage_path('app/' . $filename);
        }

        $outputPath = $outputOption;
        if (! str_starts_with($outputPath, '/')) {
            $outputPath = base_path($outputPath);
        }

        $dir = dirname($outputPath);
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        return $outputPath;
    }

    private function convertPdfToHtml(string $pdfPath): string
    {
        $this->meta = $this->analyzePdf($pdfPath);

        $widthMm = $this->ptToMm((float) ($this->meta['width_pt'] ?? 595.0));
        $heightMm = $this->ptToMm((float) ($this->meta['height_pt'] ?? 842.0));
  
        if ($this->hasCommand('pdftohtml')) {
            $this->info('[PDF] Convertendo com pdftohtml...');
            $outBase = $this->tmpDir . '/pdf_saida';
            shell_exec('pdftohtml -c -hidden -enc UTF-8 -noframes ' . escapeshellarg($pdfPath) . ' ' . escapeshellarg($outBase) . ' 2>/dev/null');
            $generatedHtml = $outBase . '.html';
            if (is_file($generatedHtml)) {
                $html = file_get_contents($generatedHtml) ?: '';
                if ($html !== '') {
                    $html = $this->inlineLocalAssets($html, dirname($generatedHtml));
                    $html = $this->normalizePdfLikeHtml($html, pathinfo($pdfPath, PATHINFO_FILENAME));
                    $html = $this->applyMasksWithClaude($html);
                    $html = $this->stripUnderlinesFromHtml($html);
                    return $this->injectPrintStyle($html, $widthMm, $heightMm);
                }
            }

            $this->warn('pdftohtml nao retornou HTML util. Aplicando fallback interno.');
        }
      
        $this->info('[PDF] Aplicando fallback interno (sem IA)...');
        $this->pageImages = $this->rasterizePages($pdfPath);
        $rawImages = $this->extractImages($pdfPath);
        $this->processedImages = $this->processImages($rawImages);


        $pagesText = $this->extractEditableText($pdfPath);

        $html = $this->buildEditableHtml($pagesText);
        if ($html === '') {
            return $this->buildRasterFallbackHtml();
        }

        $html = $this->applyMasksWithClaude($html);
        $html = $this->stripUnderlinesFromHtml($html);

        return $html;
    }

    private function convertDocxToHtml(string $docxPath): string
    {
        $docxPage = $this->extractDocxPageSize($docxPath);
        $widthMm = (float) ($docxPage['width_mm'] ?? 210.0);
        $heightMm = (float) ($docxPage['height_mm'] ?? 297.0);

        // Fluxo primário: DOCX → PDF (LibreOffice) → HTML (pdftohtml).
        // Produz HTML no mesmo formato do fluxo PDF direto: posicionamento absoluto,
        // extração de moldura confiável (≥85% da página) e escala automática no editor.
        if ($this->hasCommand('soffice') && $this->hasCommand('pdftohtml')) {
            $this->info('[DOCX] Convertendo via PDF intermediário (soffice → pdftohtml)...');
            shell_exec('soffice --headless --convert-to pdf --outdir ' . escapeshellarg($this->tmpDir) . ' ' . escapeshellarg($docxPath) . ' 2>/dev/null');

            $generatedPdf = $this->tmpDir . '/' . pathinfo($docxPath, PATHINFO_FILENAME) . '.pdf';
            if (! is_file($generatedPdf)) {
                $pdfCandidates = glob($this->tmpDir . '/*.pdf') ?: [];
                if ($pdfCandidates !== []) {
                    $generatedPdf = (string) reset($pdfCandidates);
                }
            }

            if (is_file($generatedPdf) && filesize($generatedPdf) > 0) {
                $html = $this->convertPdfToHtml($generatedPdf);
                if ($html !== '') {
                    return $this->injectPrintStyle($html, $widthMm, $heightMm);
                }
            }

            $this->warn('[DOCX] Conversão via PDF falhou. Tentando HTML direto como fallback.');
        }

        // Fallback: DOCX → HTML direto via LibreOffice.
        // Envolve o conteúdo em div.WordSection1 para compatibilidade com o editor.
        if ($this->hasCommand('soffice')) {
            $this->info('[DOCX] Fallback: convertendo com LibreOffice → HTML direto...');
            shell_exec('soffice --headless --convert-to html --outdir ' . escapeshellarg($this->tmpDir) . ' ' . escapeshellarg($docxPath) . ' 2>/dev/null');

            $generatedPath = $this->tmpDir . '/' . pathinfo($docxPath, PATHINFO_FILENAME) . '.html';
            if (! is_file($generatedPath)) {
                $htmlCandidates = glob($this->tmpDir . '/*.html') ?: [];
                if ($htmlCandidates !== []) {
                    $generatedPath = (string) reset($htmlCandidates);
                }
            }

            if (is_file($generatedPath)) {
                $html = file_get_contents($generatedPath) ?: '';
                if ($html !== '') {
                    $html = $this->inlineLocalAssets($html, dirname($generatedPath));
                    $html = $this->wrapLibreOfficeHtmlInWordSection($html, $widthMm, $heightMm);
                    $html = $this->applyMasksWithClaude($html);
                    $html = $this->stripUnderlinesFromHtml($html);
                    return $this->injectPrintStyle($html, $widthMm, $heightMm);
                }
            }

            $this->warn('[DOCX] Conversão direta para HTML também falhou. Tentando conversores alternativos.');
        }

        if ($this->hasCommand('pandoc')) {
            $this->info('[DOCX] Convertendo com pandoc...');
            $outPath = $this->tmpDir . '/docx_saida.html';
            shell_exec('pandoc ' . escapeshellarg($docxPath) . ' -f docx -t html5 --standalone -o ' . escapeshellarg($outPath) . ' 2>/dev/null');

            if (is_file($outPath)) {
                $html = file_get_contents($outPath) ?: '';
                if ($html !== '') {
                    $html = $this->inlineLocalAssets($html, dirname($outPath));
                    $html = $this->stripUnderlinesFromHtml($html);
                    return $this->injectPrintStyle($html, $widthMm, $heightMm);
                }
            }
        }

        $this->info('[DOCX] Nenhum conversor externo encontrado. Aplicando parser nativo (Word HTML format).');
        $html = $this->convertDocxXmlFallback($docxPath);
        if ($html === '') {
            return '';
        }

        $html = $this->applyMasksWithClaude($html);
        $html = $this->stripUnderlinesFromHtml($html);

        return $this->injectPrintStyle($html, $widthMm, $heightMm);
    }

    private function wrapLibreOfficeHtmlInWordSection(string $html, float $widthMm, float $heightMm): string
    {
        if (! preg_match('/<meta[^>]*generator[^>]*LibreOffice/i', $html)) {
            return $html;
        }

        $widthPx  = (int) round($widthMm * 96 / 25.4);
        $heightPx = (int) round($heightMm * 96 / 25.4);
        $style    = "position:relative;width:{$widthPx}px;height:{$heightPx}px;overflow:hidden;box-sizing:border-box;margin:0 auto;";

        $divOpen  = '<div class="WordSection1" style="' . $style . '">';
        $divClose = '</div>';

        $html = (string) (preg_replace('/(<body[^>]*>)/i', '$1' . $divOpen, $html, 1) ?? $html);
        $html = (string) (preg_replace('/<\/body>/i', $divClose . '</body>', $html, 1) ?? $html);

        return $html;
    }

    private function extractDocxPageSize(string $docxPath): array
    {
        if (! class_exists(\ZipArchive::class)) {
            return ['width_mm' => 210.0, 'height_mm' => 297.0];
        }

        $zip = new \ZipArchive();
        if ($zip->open($docxPath) !== true) {
            return ['width_mm' => 210.0, 'height_mm' => 297.0];
        }

        $xml = $zip->getFromName('word/document.xml') ?: '';
        $zip->close();

        if ($xml === '') {
            return ['width_mm' => 210.0, 'height_mm' => 297.0];
        }

        if (! preg_match('/<w:pgSz[^>]*>/i', $xml, $tagMatch)) {
            return ['width_mm' => 210.0, 'height_mm' => 297.0];
        }

        $tag = $tagMatch[0];
        $wTwips = 11906.0; // A4 width in twips
        $hTwips = 16838.0; // A4 height in twips

        if (preg_match('/\bw:w="(\d+)"/i', $tag, $m)) {
            $wTwips = (float) $m[1];
        }
        if (preg_match('/\bw:h="(\d+)"/i', $tag, $m)) {
            $hTwips = (float) $m[1];
        }

        $orientation = '';
        if (preg_match('/\bw:orient="([^"]+)"/i', $tag, $m)) {
            $orientation = strtolower((string) $m[1]);
        }

        if ($orientation === 'landscape' && $hTwips > $wTwips) {
            [$wTwips, $hTwips] = [$hTwips, $wTwips];
        }

        return [
            'width_mm' => $this->twipToMm($wTwips),
            'height_mm' => $this->twipToMm($hTwips),
        ];
    }
private function injectPrintStyle(string $html, float $widthMm, float $heightMm): string
{
    $w = round(max(10.0, $widthMm), 2);
    $h = round(max(10.0, $heightMm), 2);

    $isPdfLikeLayout = (bool) preg_match('/<div[^>]*id="page\d+-div"/i', $html)
        || str_contains($html, 'class="cert"');

    $targetWpx = ($w * 96) / 25.4;
    $targetHpx = ($h * 96) / 25.4;
    $pageScaleRule = '';

    if ($isPdfLikeLayout && preg_match('/<div[^>]*id="page\d+-div"[^>]*style="[^"]*width:([\d.]+)px;\s*height:([\d.]+)px/i', $html, $m)) {
        $srcW = (float) $m[1];
        $srcH = (float) $m[2];

        if ($srcW > 0 && $srcH > 0) {
            $scale = min($targetWpx / $srcW, $targetHpx / $srcH);

            if ($scale > 0 && abs(1.0 - $scale) > 0.01) {
                $scaleStr = number_format($scale, 6, '.', '');
                $pageScaleRule = 'div[id^="page"][id$="-div"]{zoom:' . $scaleStr . '!important;}';
            }
        }
    }

    // =========================
    // PRINT RULES (ORIGINAL)
    // =========================
    $printRules = '@page{size:' . $w . 'mm ' . $h . 'mm;margin:0;}'
        . '@media print{'
        . 'body{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}'
        . 'img{max-width:none!important;}'
        . '}';

    if ($isPdfLikeLayout) {
        $printRules = '@page{size:' . $w . 'mm ' . $h . 'mm;margin:0;}'
            . '@media print{'
            . 'html,body{margin:0!important;padding:0!important;width:' . $w . 'mm!important;height:' . $h . 'mm!important;background:#fff!important;overflow:hidden!important;}'
            . 'body{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}'
            . 'a[name]{display:none!important;height:0!important;line-height:0!important;font-size:0!important;}'
            . '.stack{gap:0!important;}'
            . '.cert{margin:0!important;box-shadow:none!important;}'
            . '.cert:not(:last-child){break-after:page;page-break-after:always;}'
            . 'div[id$="-div"]{margin:0!important;page-break-inside:avoid;}'
            . 'div[id$="-div"]:not(:last-of-type){break-after:page;page-break-after:always;}'
            . 'div[id$="-div"] p{line-height:inherit;letter-spacing:normal;}'
            . $pageScaleRule
            . 'img{max-width:none!important;max-height:none!important;height:auto!important;image-rendering:auto!important;}'
            . '}';
    } else {
        $printRules = '@page{size:' . $w . 'mm ' . $h . 'mm;margin:0;}'
            . '@media print{'
            . 'html,body{margin:0!important;padding:0!important;background:#fff!important;}'
            . 'body{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}'
            . 'main,.main,.WordSection1,.Section1{margin:0!important;padding:0!important;max-width:none!important;width:100%!important;border:0!important;border-radius:0!important;box-shadow:none!important;}'
            . 'img{max-width:100%!important;height:auto!important;}'
            . '*{break-inside:auto;page-break-inside:auto;}'
            . '}';
    }

    $printStyle = '<style id="print-fill-style">' . $printRules . '</style>';

    if (str_contains($html, 'id="print-fill-style"')) {
        return $html;
    }

    if (preg_match('/<\/head>/i', $html)) {
        return (string) preg_replace('/<\/head>/i', $printStyle . '</head>', $html, 1);
    }

    return $printStyle . $html;
}
    private function normalizePdfLikeHtml(string $html, string $fallbackTitle): string
    {
        $title = trim($fallbackTitle) !== '' ? trim($fallbackTitle) : 'Documento';
        $titleEscaped = htmlspecialchars($title, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

        if (preg_match('/<title>.*?<\/title>/is', $html)) {
            $html = (string) preg_replace('/<title>.*?<\/title>/is', '<title>' . $titleEscaped . '</title>', $html, 1);
        }

        // Remove comentarios de pagina gerados pelo pdftohtml para reduzir ruido no HTML final.
        $html = (string) preg_replace('/<!--\s*Page\s+\d+\s*-->/i', '', $html);

        // Ajusta os trechos principais do certificado (nome do funcionario e curso),
        // removendo espacos NBSP excedentes gerados pelo pdftohtml.
        $html = $this->normalizeHeaderRuns($html);
        $html = $this->stripUnderlinesFromHtml($html);

        return $html;
    }

    private function stripUnderlinesFromHtml(string $html): string
    {
        // Remove semantic underline tags from converted text.
        $html = (string) preg_replace('/<\/?u\b[^>]*>/iu', '', $html);

        // Remove underline declarations both in inline style attributes and style blocks.
        $html = (string) preg_replace('/text-decoration\s*:\s*underline(?:\s+[^;]*)?\s*;?/iu', '', $html);
        $html = (string) preg_replace('/text-decoration-line\s*:\s*underline\s*;?/iu', '', $html);

        return $html;
    }

    private function normalizeHeaderRuns(string $html): string
    {
        return (string) preg_replace_callback(
            '/<p\b([^>]*)>(.*?)<\/p>/is',
            static function (array $m): string {
                $attrs = $m[1] ?? '';
                $content = $m[2] ?? '';

                if (! preg_match('/\btop\s*:\s*(\d+)px/i', $attrs, $topMatch)) {
                    return $m[0];
                }

                $top = (int) $topMatch[1];
                if ($top < 250 || $top > 320) {
                    return $m[0];
                }

                $content = (string) preg_replace('/^(?:\s|&#160;|&nbsp;)+/i', '', $content);
                $content = (string) preg_replace('/(?:\s|&#160;|&nbsp;)+$/i', '', $content);
                $content = (string) preg_replace('/(?:&#160;|&nbsp;){2,}/i', '&#160;', $content);
                $content = (string) preg_replace_callback(
                    '/<b>(.*?)<\/b>/is',
                    static function (array $boldMatch): string {
                        $bold = $boldMatch[1] ?? '';
                        $bold = (string) preg_replace('/^(?:\s|&#160;|&nbsp;)+/i', '', $bold);
                        $bold = (string) preg_replace('/(?:\s|&#160;|&nbsp;)+$/i', '', $bold);
                        $bold = (string) preg_replace('/(?:&#160;|&nbsp;){2,}/i', '&#160;', $bold);

                        return '<b>' . $bold . '</b>';
                    },
                    $content
                );

                if (preg_match('/^<b>\s*<\/b>$/i', trim($content))) {
                    return '';
                }

                if ($top === 267 && preg_match('/SILVA\s+DOS\s+SANTOS|G\s*S\s*COMERCIO/i', $content)) {
                    $attrs = (string) preg_replace('/\btop\s*:\s*267px/i', 'top:265px', $attrs, 1);
                }

                return '<p' . $attrs . '>' . $content . '</p>';
            },
            $html
        );
    }

    private function ptToMm(float $pt): float
    {
        return $pt * 25.4 / 72;
    }

    private function twipToMm(float $twip): float
    {
        return $twip * 25.4 / 1440;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Conversor nativo DOCX → HTML no formato Word (WordSection1 / Mso*)
    // Compatível com o formato do arquivo CERTIFICADO-1.html (Word 15 export).
    // ─────────────────────────────────────────────────────────────────────────
    private function convertDocxXmlFallback(string $docxPath): string
    {
        if (! class_exists(\ZipArchive::class)) {
            return '';
        }

        $zip = new \ZipArchive();
        if ($zip->open($docxPath) !== true) {
            return '';
        }

        $documentXml = $zip->getFromName('word/document.xml') ?: '';
        $relsXml     = $zip->getFromName('word/_rels/document.xml.rels') ?: '';

        if ($documentXml === '') {
            $zip->close();
            return '';
        }

        $rels     = $this->parseDocxRelationships($relsXml);
        $pageInfo = $this->extractDocxPageInfoFromXml($documentXml);

        libxml_use_internal_errors(true);
        $dom = new \DOMDocument();
        $dom->preserveWhiteSpace = true;
        if (! @$dom->loadXML($documentXml)) {
            $zip->close();
            return '';
        }
        libxml_clear_errors();

        $xpath = new \DOMXPath($dom);
        $xpath->registerNamespace('w',  'http://schemas.openxmlformats.org/wordprocessingml/2006/main');
        $xpath->registerNamespace('r',  'http://schemas.openxmlformats.org/officeDocument/2006/relationships');
        $xpath->registerNamespace('a',  'http://schemas.openxmlformats.org/drawingml/2006/main');
        $xpath->registerNamespace('v',  'urn:schemas-microsoft-com:vml');
        $xpath->registerNamespace('wp', 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing');

        $body = $xpath->query('/w:document/w:body')->item(0);
        if (! $body instanceof \DOMElement) {
            $zip->close();
            return '';
        }

        $widthPx  = $pageInfo['width_px'];
        $heightPx = $pageInfo['height_px'];

        $frameHtml   = '';
        $contentHtml = '';
        $frameFound  = false;

        foreach ($body->childNodes as $node) {
            if (! $node instanceof \DOMElement) {
                continue;
            }

            if ($node->localName === 'p') {
                $pHtml = $this->renderWordParagraph($node, $xpath, $rels, $zip, $widthPx, $heightPx, $frameFound);
                // Identifica o parágrafo da moldura (imagem com z-index extremamente negativo)
                if (! $frameFound && str_contains($pHtml, 'z-index:-1659913728')) {
                    $frameHtml  = $pHtml;
                    $frameFound = true;
                } else {
                    $contentHtml .= $pHtml;
                }
            } elseif ($node->localName === 'tbl') {
                $contentHtml .= $this->renderWordTable($node, $xpath, $rels, $zip, $widthPx, $heightPx, $frameFound);
            }
        }

        $zip->close();

        if ($contentHtml === '' && $frameHtml === '') {
            return '';
        }

        $widthPtStr  = number_format($pageInfo['width_pt'], 1, '.', '');
        $heightPtStr = number_format($pageInfo['height_pt'], 1, '.', '');
        $marginStr   = number_format($pageInfo['margin_top_pt'], 2, '.', '') . 'pt '
            . number_format($pageInfo['margin_right_pt'], 2, '.', '') . 'pt '
            . number_format($pageInfo['margin_bottom_pt'], 2, '.', '') . 'pt '
            . number_format($pageInfo['margin_left_pt'], 2, '.', '') . 'pt';

        return '<!DOCTYPE html>'
            . "\n<html>"
            . "\n<head>"
            . "\n<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">"
            . "\n<meta name=\"Generator\" content=\"Flash Certificados PHP Parser\">"
            . "\n<style>"
            . "\np.MsoNormal, li.MsoNormal, div.MsoNormal { margin:0; font-size:11.0pt; font-family:\"Calibri\",sans-serif; }"
            . "\np.MsoBodyText, li.MsoBodyText, div.MsoBodyText { margin:0; font-size:12.0pt; font-family:\"Calibri\",sans-serif; }"
            . "\nh1,h2,h3 { margin:0; font-family:\"Times New Roman\",serif; }"
            . "\nh1 { font-size:18.0pt; }"
            . "\n@page WordSection1 { size:{$widthPtStr}pt {$heightPtStr}pt; margin:{$marginStr}; }"
            . "\ndiv.WordSection1 { page:WordSection1; position:relative; }"
            . "\n.docx-table { border-collapse:collapse; width:100%; margin:6pt 0; }"
            . "\n.docx-table td,th { border:1px solid #999; padding:4pt 6pt; vertical-align:top; font-size:10.0pt; }"
            . "\n</style>"
            . "\n</head>"
            . "\n<body style=\"word-wrap:break-word\">"
            . "\n<div class=\"WordSection1\">"
            . "\n" . $frameHtml
            . $contentHtml
            . "\n</div>"
            . "\n</body>"
            . "\n</html>";
    }

    private function extractDocxPageInfoFromXml(string $documentXml): array
    {
        $wTwips = 12240.0;
        $hTwips = 15840.0;
        $marginTopTwips    = 1440.0;
        $marginRightTwips  = 1800.0;
        $marginBottomTwips = 1440.0;
        $marginLeftTwips   = 1800.0;

        if (preg_match('/<w:pgSz[^>]*>/i', $documentXml, $pgSzMatch) === 1) {
            $tag = $pgSzMatch[0];
            if (preg_match('/\bw:w="(\d+)"/i', $tag, $m)) {
                $wTwips = (float) $m[1];
            }
            if (preg_match('/\bw:h="(\d+)"/i', $tag, $m)) {
                $hTwips = (float) $m[1];
            }
            if (preg_match('/\bw:orient="landscape"/i', $tag) && $hTwips > $wTwips) {
                [$wTwips, $hTwips] = [$hTwips, $wTwips];
            }
        }

        if (preg_match('/<w:pgMar[^>]*>/i', $documentXml, $pgMarMatch) === 1) {
            $tag = $pgMarMatch[0];
            if (preg_match('/\bw:top="(\d+)"/i', $tag, $m))    $marginTopTwips    = (float) $m[1];
            if (preg_match('/\bw:right="(\d+)"/i', $tag, $m))  $marginRightTwips  = (float) $m[1];
            if (preg_match('/\bw:bottom="(\d+)"/i', $tag, $m)) $marginBottomTwips = (float) $m[1];
            if (preg_match('/\bw:left="(\d+)"/i', $tag, $m))   $marginLeftTwips   = (float) $m[1];
        }

        $widthPt  = $wTwips / 20;
        $heightPt = $hTwips / 20;

        return [
            'width_pt'        => $widthPt,
            'height_pt'       => $heightPt,
            'width_px'        => (int) round($widthPt * 96 / 72),
            'height_px'       => (int) round($heightPt * 96 / 72),
            'margin_top_pt'   => $marginTopTwips / 20,
            'margin_right_pt' => $marginRightTwips / 20,
            'margin_bottom_pt'=> $marginBottomTwips / 20,
            'margin_left_pt'  => $marginLeftTwips / 20,
        ];
    }

    private function renderWordParagraph(
        \DOMElement $paragraph,
        \DOMXPath   $xpath,
        array       $rels,
        \ZipArchive $zip,
        int         $pageWidthPx,
        int         $pageHeightPx,
        bool        &$frameFound
    ): string {
        $styleId      = strtolower((string) $xpath->evaluate('string(./w:pPr/w:pStyle/@w:val)', $paragraph));
        $jc           = strtolower((string) $xpath->evaluate('string(./w:pPr/w:jc/@w:val)', $paragraph));
        $spacingBefore = (string) $xpath->evaluate('string(./w:pPr/w:spacing/@w:before)', $paragraph);
        $outlineLvl   = (string) $xpath->evaluate('string(./w:pPr/w:outlineLvl/@w:val)', $paragraph);

        // Mapeia estilo do parágrafo para tag HTML e classe CSS
        $tag      = 'p';
        $cssClass = 'MsoNormal';
        $isBlock  = false;

        if ($outlineLvl !== '' && (int) $outlineLvl < 6) {
            $tag     = 'h' . ((int) $outlineLvl + 1);
            $isBlock = true;
        } elseif (preg_match('/heading(\d+)|t[íi]tulo(\d+)|^[123]$/i', $styleId, $hm) === 1) {
            $lvl     = (int) ($hm[1] ?? $hm[2] ?? (int) $styleId);
            $tag     = 'h' . max(1, min(6, $lvl ?: 1));
            $isBlock = true;
        } elseif (str_contains($styleId, 'body') || str_contains($styleId, 'corpo')) {
            $cssClass = 'MsoBodyText';
        }

        // Atributo de alinhamento no nível do bloco (estável na edição)
        $alignAttr    = '';
        $inlineStyles = [];

        if (in_array($jc, ['center', 'both'], true)) {
            $alignAttr      = ' align="center"';
            $inlineStyles[] = 'text-align:center';
        } elseif ($jc === 'right') {
            $alignAttr      = ' align="right"';
            $inlineStyles[] = 'text-align:right';
        }

        if (is_numeric($spacingBefore) && (float) $spacingBefore > 0) {
            $inlineStyles[] = 'margin-top:' . number_format((float) $spacingBefore / 20, 2, '.', '') . 'pt';
        }

        $styleHtml = $inlineStyles !== [] ? ' style="' . implode(';', $inlineStyles) . '"' : '';

        // Processa runs e hyperlinks
        $content = '';
        foreach ($paragraph->childNodes as $child) {
            if (! $child instanceof \DOMElement) {
                continue;
            }

            if ($child->localName === 'r') {
                $content .= $this->renderWordRun($child, $xpath, $rels, $zip, $pageWidthPx, $pageHeightPx, $frameFound);
            } elseif ($child->localName === 'hyperlink') {
                $rId  = $child->getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
                $href = isset($rels[$rId]) ? htmlspecialchars($rels[$rId], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') : '';
                $lk   = '';
                foreach ($xpath->query('./w:r', $child) as $run) {
                    if ($run instanceof \DOMElement) {
                        $lk .= $this->renderWordRun($run, $xpath, $rels, $zip, $pageWidthPx, $pageHeightPx, $frameFound);
                    }
                }
                $content .= $href ? '<a href="' . $href . '">' . $lk . '</a>' : $lk;
            }
        }

        // Parágrafo vazio vira &nbsp; para preservar espaçamento vertical
        $plain = strip_tags(html_entity_decode($content, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
        if (trim($plain) === '' && ! str_contains($content, 'z-index')) {
            $content = '<span>&nbsp;</span>';
        }

        if ($isBlock) {
            return '<' . $tag . $styleHtml . '>' . $content . '</' . $tag . '>' . "\n";
        }

        return '<p class="' . $cssClass . '"' . $alignAttr . $styleHtml . '>' . $content . '</p>' . "\n";
    }

    private function renderWordRun(
        \DOMElement $run,
        \DOMXPath   $xpath,
        array       $rels,
        \ZipArchive $zip,
        int         $pageWidthPx,
        int         $pageHeightPx,
        bool        &$frameFound
    ): string {
        $styles  = [];
        $isBold  = false;
        $isItal  = false;

        $sizeVal = (string) $xpath->evaluate('string(./w:rPr/w:sz/@w:val)', $run);
        if ($sizeVal !== '' && is_numeric($sizeVal)) {
            $styles[] = 'font-size:' . number_format((float) $sizeVal / 2, 1, '.', '') . 'pt';
        }

        $fontAscii = (string) $xpath->evaluate('string(./w:rPr/w:rFonts/@w:ascii)', $run);
        if ($fontAscii !== '') {
            $styles[] = 'font-family:"' . htmlspecialchars($fontAscii, ENT_QUOTES) . '",sans-serif';
        }

        $isBold = $xpath->query('./w:rPr/w:b', $run)->length > 0;
        $isItal = $xpath->query('./w:rPr/w:i', $run)->length > 0;

        $colorVal = strtoupper((string) $xpath->evaluate('string(./w:rPr/w:color/@w:val)', $run));
        if ($colorVal !== '' && $colorVal !== 'AUTO' && preg_match('/^[0-9A-F]{6}$/', $colorVal) === 1) {
            $styles[] = 'color:#' . $colorVal;
        }

        // Espaçamento de letras: valor em vinte avos de ponto (twips/20 = pt)
        $spacingVal = (string) $xpath->evaluate('string(./w:rPr/w:spacing/@w:val)', $run);
        if ($spacingVal !== '' && is_numeric($spacingVal) && (float) $spacingVal !== 0.0) {
            $styles[] = 'letter-spacing:' . number_format((float) $spacingVal / 20, 2, '.', '') . 'pt';
        }

        $styleAttr = $styles !== [] ? ' style="' . implode(';', $styles) . '"' : '';
        $content   = '';

        foreach ($run->childNodes as $child) {
            if (! $child instanceof \DOMElement) {
                continue;
            }

            if ($child->localName === 't') {
                $content .= htmlspecialchars($child->textContent, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
            } elseif ($child->localName === 'br') {
                $content .= '<br>';
            } elseif ($child->localName === 'tab') {
                $content .= '&emsp;';
            } elseif ($child->localName === 'drawing' || $child->localName === 'pict') {
                $content .= $this->renderWordImage($child, $xpath, $rels, $zip, $pageWidthPx, $pageHeightPx, $frameFound);
            }
        }

        if ($content === '') {
            return '';
        }

        $result = '<span' . $styleAttr . '>' . $content . '</span>';
        if ($isBold) {
            $result = '<b>' . $result . '</b>';
        }
        if ($isItal) {
            $result = '<i>' . $result . '</i>';
        }

        return $result;
    }

    private function renderWordImage(
        \DOMElement $node,
        \DOMXPath   $xpath,
        array       $rels,
        \ZipArchive $zip,
        int         $pageWidthPx,
        int         $pageHeightPx,
        bool        &$frameFound
    ): string {
        $relId = (string) $xpath->evaluate('string(.//a:blip/@r:embed)', $node);
        if ($relId === '') {
            $relId = (string) $xpath->evaluate('string(.//v:imagedata/@r:id)', $node);
        }
        if ($relId === '' || ! isset($rels[$relId])) {
            return '';
        }

        $zipPath = $this->normalizeDocxTargetPath('word/document.xml', $rels[$relId]);
        if ($zipPath === '') {
            return '';
        }

        $binary = $zip->getFromName($zipPath);
        if (! is_string($binary) || $binary === '') {
            return '';
        }

        $mime   = $this->guessMimeTypeFromExtension($zipPath);
        $base64 = base64_encode($binary);

        // Dimensões em EMU (English Metric Units): 914400 EMU = 1 polegada = 96px a 96dpi
        $cxEmu  = (float) ($xpath->evaluate('string(.//wp:extent/@cx)', $node) ?: '0');
        $cyEmu  = (float) ($xpath->evaluate('string(.//wp:extent/@cy)', $node) ?: '0');
        $imgW   = $cxEmu > 0 ? (int) round($cxEmu * 96 / 914400) : 0;
        $imgH   = $cyEmu > 0 ? (int) round($cyEmu * 96 / 914400) : 0;

        // Imagem de fundo (moldura): cobre ≥85% da página e ainda não foi encontrada
        $isBackground = ! $frameFound
            && $pageWidthPx > 0 && $pageHeightPx > 0
            && $imgW > 0 && $imgH > 0
            && ($imgW / $pageWidthPx) >= 0.85
            && ($imgH / $pageHeightPx) >= 0.85;

        if ($isBackground) {
            $frameFound = true;
            // z-index:-1659913728 é o padrão do Word para "atrás do texto" (INT32_MIN / 2)
            return '<span style="position:absolute;z-index:-1659913728;margin-left:1px;margin-top:1px;width:' . $imgW . 'px;height:' . $imgH . 'px">'
                . '<img width="' . $imgW . '" height="' . $imgH . '" src="data:' . $mime . ';base64,' . $base64 . '">'
                . '</span>';
        }

        $dimAttr = $imgW > 0 ? ' width="' . $imgW . '" height="' . $imgH . '"' : '';
        return '<img alt=""' . $dimAttr . ' src="data:' . $mime . ';base64,' . $base64 . '">';
    }

    private function renderWordTable(
        \DOMElement $table,
        \DOMXPath   $xpath,
        array       $rels,
        \ZipArchive $zip,
        int         $pageWidthPx,
        int         $pageHeightPx,
        bool        &$frameFound
    ): string {
        $rowsHtml = '';
        foreach ($xpath->query('./w:tr', $table) as $row) {
            if (! $row instanceof \DOMElement) {
                continue;
            }
            $cellsHtml = '';
            foreach ($xpath->query('./w:tc', $row) as $cell) {
                if (! $cell instanceof \DOMElement) {
                    continue;
                }
                $cellContent = '';
                foreach ($xpath->query('./w:p', $cell) as $p) {
                    if ($p instanceof \DOMElement) {
                        $cellContent .= $this->renderWordParagraph($p, $xpath, $rels, $zip, $pageWidthPx, $pageHeightPx, $frameFound);
                    }
                }
                $cellsHtml .= '<td>' . $cellContent . '</td>';
            }
            $rowsHtml .= '<tr>' . $cellsHtml . '</tr>';
        }
        return $rowsHtml !== '' ? '<table class="docx-table">' . $rowsHtml . '</table>' . "\n" : '';
    }

    private function parseDocxRelationships(string $relsXml): array
    {
        if ($relsXml === '') {
            return [];
        }

        $dom = new \DOMDocument();
        if (! @$dom->loadXML($relsXml)) {
            return [];
        }

        $rels = [];
        foreach ($dom->getElementsByTagName('Relationship') as $relNode) {
            $id = $relNode->getAttribute('Id');
            $target = $relNode->getAttribute('Target');
            if ($id !== '' && $target !== '') {
                $rels[$id] = $target;
            }
        }

        return $rels;
    }

    private function renderDocxParagraph(\DOMElement $paragraph, \DOMXPath $xpath, array $rels, \ZipArchive $zip): string
    {
        $align = strtolower((string) $xpath->evaluate('string(./w:pPr/w:jc/@w:val)', $paragraph));
        $alignCss = match ($align) {
            'center' => 'center',
            'right' => 'right',
            'both', 'distribute' => 'justify',
            default => 'left',
        };

        $content = '';
        $runNodes = $xpath->query('./w:r | ./w:hyperlink/w:r', $paragraph);
        foreach ($runNodes as $runNode) {
            if (! $runNode instanceof \DOMElement) {
                continue;
            }
            $content .= $this->renderDocxRun($runNode, $xpath, $rels, $zip);
        }

        if (trim(strip_tags(str_replace('&nbsp;', ' ', $content))) === '') {
            $content = '&nbsp;';
        }

        $html = '<p class="docx-p" style="text-align:' . $alignCss . ';">' . $content . '</p>';

        $hasPageBreak = $xpath->query('.//w:br[@w:type="page"] | .//w:lastRenderedPageBreak', $paragraph)->length > 0;
        if ($hasPageBreak) {
            $html .= '<div class="docx-page-break"></div>';
        }

        return $html;
    }

    private function renderDocxRun(\DOMElement $run, \DOMXPath $xpath, array $rels, \ZipArchive $zip): string
    {
        $styles = [];
        $sizeVal = (string) $xpath->evaluate('string(./w:rPr/w:sz/@w:val)', $run);
        if ($sizeVal !== '' && is_numeric($sizeVal)) {
            $styles[] = 'font-size:' . round(((float) $sizeVal) / 2, 2) . 'pt';
        }

        $fontVal = (string) $xpath->evaluate('string(./w:rPr/w:rFonts/@w:ascii)', $run);
        if ($fontVal !== '') {
            $styles[] = 'font-family:' . htmlspecialchars($fontVal, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        }

        if ($xpath->query('./w:rPr/w:b', $run)->length > 0) {
            $styles[] = 'font-weight:700';
        }
        if ($xpath->query('./w:rPr/w:i', $run)->length > 0) {
            $styles[] = 'font-style:italic';
        }
        if ($xpath->query('./w:rPr/w:strike', $run)->length > 0) {
            $styles[] = 'text-decoration:line-through';
        }

        $underline = strtolower((string) $xpath->evaluate('string(./w:rPr/w:u/@w:val)', $run));
        if ($underline !== '' && $underline !== 'none') {
            $styles[] = 'text-decoration:underline';
        }

        $colorVal = strtoupper((string) $xpath->evaluate('string(./w:rPr/w:color/@w:val)', $run));
        if ($colorVal !== '' && preg_match('/^[0-9A-F]{6}$/', $colorVal)) {
            $styles[] = 'color:#' . $colorVal;
        }

        $styleAttr = $styles === [] ? '' : ' style="' . implode(';', $styles) . '"';
        $chunks = [];

        foreach ($run->childNodes as $child) {
            if (! $child instanceof \DOMElement) {
                continue;
            }

            if ($child->localName === 't') {
                $chunks[] = htmlspecialchars($child->textContent, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
                continue;
            }

            if ($child->localName === 'tab') {
                $chunks[] = '&emsp;';
                continue;
            }

            if ($child->localName === 'br') {
                $breakType = strtolower($child->getAttributeNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'type'));
                if ($breakType !== 'page') {
                    $chunks[] = '<br>';
                }
                continue;
            }

            if ($child->localName === 'drawing' || $child->localName === 'pict') {
                $chunks[] = $this->renderDocxImageFromNode($child, $xpath, $rels, $zip);
            }
        }

        if ($chunks === []) {
            return '';
        }

        $joined = implode('', $chunks);
        return '<span' . $styleAttr . '>' . $joined . '</span>';
    }

    private function renderDocxImageFromNode(\DOMElement $node, \DOMXPath $xpath, array $rels, \ZipArchive $zip): string
    {
        $relId = (string) $xpath->evaluate('string(.//a:blip/@r:embed)', $node);
        if ($relId === '') {
            $relId = (string) $xpath->evaluate('string(.//v:imagedata/@r:id)', $node);
        }
        if ($relId === '') {
            return '';
        }

        $target = $rels[$relId] ?? '';
        if ($target === '') {
            return '';
        }

        $zipPath = $this->normalizeDocxTargetPath('word/document.xml', $target);
        if ($zipPath === '') {
            return '';
        }

        $binary = $zip->getFromName($zipPath);
        if (! is_string($binary) || $binary === '') {
            return '';
        }

        $mime = $this->guessMimeTypeFromExtension($zipPath);
        return '<img alt="Imagem" src="data:' . $mime . ';base64,' . base64_encode($binary) . '">';
    }

    private function normalizeDocxTargetPath(string $baseFile, string $target): string
    {
        if ($target === '' || str_starts_with($target, 'http://') || str_starts_with($target, 'https://')) {
            return '';
        }

        if (str_starts_with($target, '/')) {
            return ltrim($target, '/');
        }

        $combined = dirname($baseFile) . '/' . $target;
        $parts = explode('/', str_replace('\\', '/', $combined));
        $normalized = [];

        foreach ($parts as $part) {
            if ($part === '' || $part === '.') {
                continue;
            }
            if ($part === '..') {
                array_pop($normalized);
                continue;
            }
            $normalized[] = $part;
        }

        return implode('/', $normalized);
    }

    private function renderDocxTable(\DOMElement $table, \DOMXPath $xpath, array $rels, \ZipArchive $zip): string
    {
        $rowsHtml = '';
        $rows = $xpath->query('./w:tr', $table);

        foreach ($rows as $row) {
            if (! $row instanceof \DOMElement) {
                continue;
            }

            $cellsHtml = '';
            $cells = $xpath->query('./w:tc', $row);
            foreach ($cells as $cell) {
                if (! $cell instanceof \DOMElement) {
                    continue;
                }

                $cellContent = '';
                $cellParagraphs = $xpath->query('./w:p', $cell);
                foreach ($cellParagraphs as $p) {
                    if ($p instanceof \DOMElement) {
                        $cellContent .= $this->renderDocxParagraph($p, $xpath, $rels, $zip);
                    }
                }

                $cellsHtml .= '<td>' . $cellContent . '</td>';
            }

            $rowsHtml .= '<tr>' . $cellsHtml . '</tr>';
        }

        if ($rowsHtml === '') {
            return '';
        }

        return '<table class="docx-table">' . $rowsHtml . '</table>';
    }

    private function inlineLocalAssets(string $html, string $baseDir): string
    {
        $baseDirReal = realpath($baseDir) ?: $baseDir;

        return (string) preg_replace_callback(
            '/\\b(src|href)=["\']([^"\']+)["\']/i',
            function (array $matches) use ($baseDirReal) {
                $attr = $matches[1];
                $asset = $matches[2];

                if (
                    str_starts_with($asset, 'data:')
                    || str_starts_with($asset, 'http://')
                    || str_starts_with($asset, 'https://')
                    || str_starts_with($asset, '#')
                ) {
                    return $matches[0];
                }

                $pathPart = parse_url($asset, PHP_URL_PATH);
                if (! is_string($pathPart) || $pathPart === '') {
                    return $matches[0];
                }

                $localPath = realpath($baseDirReal . '/' . ltrim(urldecode($pathPart), '/'));
                if (! $localPath || ! is_file($localPath)) {
                    return $matches[0];
                }

                if (! str_starts_with($localPath, $baseDirReal)) {
                    return $matches[0];
                }

                $content = file_get_contents($localPath);
                if ($content === false) {
                    return $matches[0];
                }

                $mime = mime_content_type($localPath) ?: $this->guessMimeTypeFromExtension($localPath);
                $dataUri = 'data:' . $mime . ';base64,' . base64_encode($content);

                return $attr . '="' . $dataUri . '"';
            },
            $html
        ) ?? $html;
    }

    private function guessMimeTypeFromExtension(string $path): string
    {
        return match (strtolower(pathinfo($path, PATHINFO_EXTENSION))) {
            'png' => 'image/png',
            'jpg', 'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'svg' => 'image/svg+xml',
            'css' => 'text/css',
            default => 'application/octet-stream',
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PASSO 1 — Metadados do PDF
    // ─────────────────────────────────────────────────────────────────────────
    private function analyzePdf(string $pdfPath): array
    {
        $pages    = 1;
        $widthPt  = 595.0;
        $heightPt = 842.0;
        $output   = '';

        if ($this->hasCommand('pdfinfo')) {
            $output = shell_exec('pdfinfo ' . escapeshellarg($pdfPath) . ' 2>/dev/null') ?: '';
        }

        if ($output !== '') {
            if (preg_match('/Pages:\s+(\d+)/i', $output, $m)) {
                $pages = (int) $m[1];
            }
            if (preg_match('/Page size:\s+([\d.]+)\s+x\s+([\d.]+)/i', $output, $m)) {
                $widthPt  = (float) $m[1];
                $heightPt = (float) $m[2];
            }
        } elseif (class_exists(\Imagick::class)) {
            try {
                $probe = new \Imagick();
                $probe->setResolution(72, 72);
                $probe->pingImage($pdfPath);
                $pages = max($probe->getNumberImages(), 1);
                $probe->setIteratorIndex(0);
                $widthPt  = (float) $probe->getImageWidth();
                $heightPt = (float) $probe->getImageHeight();
                $probe->clear();
                $probe->destroy();
            } catch (\Throwable $e) {
                $this->warn('Falha ao ler metadados com Imagick: ' . $e->getMessage());
            }
        }

        $scale = 96 / 72; // pontos → pixels a 96dpi
        return [
            'pages'       => $pages,
            'width_pt'    => $widthPt,
            'height_pt'   => $heightPt,
            'width_px'    => (int) round($widthPt  * $scale),
            'height_px'   => (int) round($heightPt * $scale),
            'orientation' => $widthPt > $heightPt ? 'paisagem' : 'retrato',
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PASSO 2 — Rasteriza cada página em JPEG
    // ─────────────────────────────────────────────────────────────────────────
    private function rasterizePages(string $pdfPath): array
    {
        $prefix = $this->tmpDir . '/page';
        if ($this->hasCommand('pdftoppm')) {
            shell_exec('pdftoppm -jpeg -r 150 ' . escapeshellarg($pdfPath) . " {$prefix} 2>/dev/null");
        } elseif (class_exists(\Imagick::class)) {
            try {
                $imagick = new \Imagick();
                $imagick->setResolution(150, 150);
                $imagick->readImage($pdfPath);

                $index = 1;
                foreach ($imagick as $frame) {
                    $frame->setImageFormat('jpeg');
                    $frame->setImageCompressionQuality(92);
                    $outPath = sprintf('%s-%d.jpg', $prefix, $index++);
                    $frame->writeImage($outPath);
                }

                $imagick->clear();
                $imagick->destroy();
            } catch (\Throwable $e) {
                $this->warn('Falha ao rasterizar com Imagick: ' . $e->getMessage());
            }
        }

        $files  = glob($this->tmpDir . '/page-*.jpg') ?: [];
        sort($files);

        return array_map(fn($f) => [
            'path'   => $f,
            'base64' => base64_encode(file_get_contents($f)),
        ], $files);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PASSO 3 — Extrai imagens embutidas com pdfimages
    // ─────────────────────────────────────────────────────────────────────────
    private function extractImages(string $pdfPath): array
    {
        $prefix = $this->tmpDir . '/img';
        if ($this->hasCommand('pdfimages')) {
            shell_exec('pdfimages -png ' . escapeshellarg($pdfPath) . " {$prefix} 2>/dev/null");
        } else {
            $this->warn('pdfimages não encontrado no ambiente. Continuando sem extração de imagens embutidas.');
        }

        // Ignora imagens muito pequenas (máscaras/ruído) com menos de 500 bytes
        $files = array_filter(
            glob($this->tmpDir . '/img-*.png') ?: [],
            fn($f) => filesize($f) > 500
        );
        sort($files);

        return array_values(array_map(fn($f, $i) => [
            'index'    => $i,
            'path'     => $f,
            'filename' => basename($f),
            'size'     => filesize($f),
        ], $files, array_keys($files)));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PASSO 4 — Detecta fundo e processa cada imagem
    // ─────────────────────────────────────────────────────────────────────────
    private function processImages(array $images): array
    {
        $result = [];
        foreach ($images as $img) {
            $path      = $img['path'];
            $bgType    = $this->detectBackground($path);
            $finalPath = $path;
            $blend     = 'normal';

            if ($bgType === 'black') {
                $out = str_replace('.png', '_transparent.png', $path);
                $this->removeBlackBackground($path, $out);
                $finalPath = $out;
                $this->line("      img-{$img['index']}: fundo preto → transparência aplicada");
            } elseif ($bgType === 'white') {
                $blend = 'multiply';
                $this->line("      img-{$img['index']}: fundo branco → mix-blend-mode: multiply");
            } else {
                $this->line("      img-{$img['index']}: transparente/outro → uso direto");
            }

            $result[] = [
                'index'    => $img['index'],
                'filename' => $img['filename'],
                'path'     => $finalPath,
                'base64'   => base64_encode(file_get_contents($finalPath)),
                'bg_type'  => $bgType,
                'blend'    => $blend,
                'size_kb'  => round(filesize($finalPath) / 1024, 1),
            ];
        }
        return $result;
    }

    // Analisa pixels dos 4 cantos para identificar tipo de fundo
    private function detectBackground(string $path): string
    {
        $script = <<<'PY'
import sys
from PIL import Image
import numpy as np
img = Image.open(sys.argv[1]).convert('RGBA')
arr = np.array(img)
h, w = arr.shape[:2]
corners = np.vstack([
    arr[:5,  :5].reshape(-1,4),
    arr[:5, -5:].reshape(-1,4),
    arr[-5:, :5].reshape(-1,4),
    arr[-5:,-5:].reshape(-1,4),
])
if corners[:,3].mean() < 200:
    print('transparent')
elif corners[:,:3].mean() < 50:
    print('black')
elif corners[:,:3].mean() > 200:
    print('white')
else:
    print('other')
PY;
        $s = $this->tmpDir . '/detect_bg.py';
        file_put_contents($s, $script);
        $r = trim(shell_exec("python3 {$s} " . escapeshellarg($path) . ' 2>/dev/null'));
        return in_array($r, ['transparent', 'black', 'white', 'other']) ? $r : 'other';
    }

    // Remove pixels escuros (fundo preto de assinaturas)
    private function removeBlackBackground(string $input, string $output): void
    {
        $script = <<<'PY'
import sys
from PIL import Image
import numpy as np
img = Image.open(sys.argv[1]).convert('RGBA')
arr = np.array(img, dtype=np.float32)
is_bg = (arr[:,:,0] < 40) & (arr[:,:,1] < 40) & (arr[:,:,2] < 40)
arr[:,:,3] = np.where(is_bg, 0, arr[:,:,3])
Image.fromarray(arr.astype(np.uint8),'RGBA').save(sys.argv[2])
PY;
        $s = $this->tmpDir . '/remove_bg.py';
        file_put_contents($s, $script);
        shell_exec("python3 {$s} " . escapeshellarg($input) . ' ' . escapeshellarg($output) . ' 2>/dev/null');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Limpeza de arquivos temporários
    // ─────────────────────────────────────────────────────────────────────────
    private function cleanup(): void
    {
        if (! empty($this->tmpDir) && is_dir($this->tmpDir)) {
            foreach (glob($this->tmpDir . '/*') ?: [] as $f) {
                unlink($f);
            }
            rmdir($this->tmpDir);
        }
    }

    private function hasCommand(string $binary): bool
    {
        $result = trim((string) shell_exec('command -v ' . escapeshellarg($binary) . ' 2>/dev/null'));
        return $result !== '';
    }

    private function extractEditableText(string $pdfPath): array
    {
        if (! $this->hasCommand('pdftotext')) {
            $this->warn('pdftotext não encontrado. Gerando HTML somente com imagem de fundo.');
            return [];
        }

        $bboxPath = $this->tmpDir . '/text_bbox.html';
        shell_exec('pdftotext -bbox-layout -enc UTF-8 ' . escapeshellarg($pdfPath) . ' ' . escapeshellarg($bboxPath) . ' 2>/dev/null');

        if (! file_exists($bboxPath)) {
            $this->warn('Não foi possível extrair caixas de texto do PDF.');
            return [];
        }

        $raw = file_get_contents($bboxPath);
        if ($raw === false || $raw === '') {
            return [];
        }

        $pages = [];
        preg_match_all('/<page[^>]*width="([\d.]+)"[^>]*height="([\d.]+)"[^>]*>(.*?)<\/page>/si', $raw, $pageMatches, PREG_SET_ORDER);

        foreach ($pageMatches as $index => $pageMatch) {
            $pageNumber = $index + 1;
            $pageWidthPt = (float) $pageMatch[1];
            $pageHeightPt = (float) $pageMatch[2];
            $pageContent = $pageMatch[3];

            preg_match_all('/<word[^>]*xMin="([\d.]+)"[^>]*yMin="([\d.]+)"[^>]*xMax="([\d.]+)"[^>]*yMax="([\d.]+)"[^>]*>(.*?)<\/word>/si', $pageContent, $wordMatches, PREG_SET_ORDER);

            $words = [];
            foreach ($wordMatches as $word) {
                $text = trim(html_entity_decode(strip_tags($word[5]), ENT_QUOTES | ENT_HTML5, 'UTF-8'));
                if ($text === '') {
                    continue;
                }

                $words[] = [
                    'text' => $text,
                    'x_min' => (float) $word[1],
                    'y_min' => (float) $word[2],
                    'x_max' => (float) $word[3],
                    'y_max' => (float) $word[4],
                ];
            }

            $pages[$pageNumber] = [
                'width_pt' => $pageWidthPt,
                'height_pt' => $pageHeightPt,
                'words' => $words,
            ];
        }

        return $pages;
    }

    private function buildEditableHtml(array $pagesText): string
    {
        if ($this->pageImages === []) {
            return '';
        }

        $wPx = (int) ($this->meta['width_px'] ?? 1124);
        $hPx = (int) ($this->meta['height_px'] ?? 795);
        $wMm = round($this->ptToMm((float) ($this->meta['width_pt'] ?? 842.0)), 2);
        $hMm = round($this->ptToMm((float) ($this->meta['height_pt'] ?? 595.0)), 2);
        $pagesHtml = '';

        foreach ($this->pageImages as $idx => $page) {
            $pageNumber = $idx + 1;
            $pageMeta = $pagesText[$pageNumber] ?? null;
            $scaleX = 1.0;
            $scaleY = 1.0;

            if ($pageMeta && ($pageMeta['width_pt'] ?? 0) > 0 && ($pageMeta['height_pt'] ?? 0) > 0) {
                $scaleX = $wPx / $pageMeta['width_pt'];
                $scaleY = $hPx / $pageMeta['height_pt'];
            }

            $wordsHtml = '';
            foreach (($pageMeta['words'] ?? []) as $word) {
                $left = max(0, $word['x_min'] * $scaleX);
                $top = max(0, $word['y_min'] * $scaleY);
                $width = max(8, ($word['x_max'] - $word['x_min']) * $scaleX);
                $height = max(12, ($word['y_max'] - $word['y_min']) * $scaleY);

                $wordsHtml .= '<span class="txt" contenteditable="true" style="left:' . round($left, 2) . 'px;top:' . round($top, 2) . 'px;min-width:' . round($width, 2) . 'px;min-height:' . round($height, 2) . 'px;">'
                    . htmlspecialchars($word['text'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')
                    . '</span>';
            }

            $pagesHtml .= '<section class="cert">'
                . '<img class="bg" alt="Página ' . $pageNumber . '" src="data:image/jpeg;base64,' . $page['base64'] . '">'
                . '<div class="text-layer">' . $wordsHtml . '</div>'
                . '</section>';
        }

        return '<!DOCTYPE html>'
            . '<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Certificado Editável</title>'
            . '<style>'
                . '@page{size:' . $wMm . 'mm ' . $hMm . 'mm;margin:0;}'
            . ':root{--w:' . $wPx . 'px;--h:' . $hPx . 'px;}'
            . 'body{margin:0;padding:24px;background:#bbb;font-family:Arial,sans-serif;}'
            . '.stack{display:flex;flex-direction:column;gap:24px;align-items:center;}'
            . '.cert{position:relative;width:var(--w);height:var(--h);overflow:hidden;background:#fff;box-shadow:0 8px 24px rgba(0,0,0,.15);}'
            . '.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;}'
            . '.text-layer{position:absolute;inset:0;z-index:1;}'
            . '.txt{position:absolute;display:inline-block;color:#111;font-size:16px;line-height:1.15;padding:0 1px;border-radius:2px;background:rgba(255,255,255,.04);word-break:break-word;overflow-wrap:break-word;white-space:pre-wrap;max-width:90%;}'
            . '.txt:focus{outline:1px dashed #2b6cb0;background:rgba(255,255,255,.7);}'
                . '@media print{html,body{margin:0!important;padding:0!important;width:' . $wMm . 'mm;height:' . $hMm . 'mm;background:#fff!important;}body{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}.stack{gap:0!important;}.cert{box-shadow:none!important;margin:0!important;break-after:page;page-break-after:always;}.cert:last-child{break-after:auto;page-break-after:auto;}}'
            . '@media (max-width:' . $wPx . 'px){body{padding:8px;}.cert{width:100%;height:auto;aspect-ratio:' . $wPx . '/' . $hPx . ';}}'
            . '</style></head><body><main class="stack">' . $pagesHtml . '</main></body></html>';
    }

    private function buildRasterFallbackHtml(): string
    {
        if ($this->pageImages === []) {
            return '<!DOCTYPE html><html><body><p>Falha: nenhuma página rasterizada disponível.</p></body></html>';
        }

        $wPx = $this->meta['width_px'] ?? 1124;
        $hPx = $this->meta['height_px'] ?? 795;
        $wMm = round($this->ptToMm((float) ($this->meta['width_pt'] ?? 842.0)), 2);
        $hMm = round($this->ptToMm((float) ($this->meta['height_pt'] ?? 595.0)), 2);
        $blocks = '';

        foreach ($this->pageImages as $page) {
            $blocks .= '<div class="cert"><img alt="Página do certificado" src="data:image/jpeg;base64,' . $page['base64'] . '"></div>';
        }

        return '<!DOCTYPE html>'
            . '<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">'
            . '<title>Certificado</title><style>'
                . '@page{size:' . $wMm . 'mm ' . $hMm . 'mm;margin:0;}'
            . 'body{margin:0;padding:24px;background:#bbb;font-family:Arial,sans-serif;}'
            . '.stack{display:flex;flex-direction:column;gap:24px;align-items:center;}'
            . '.cert{width:' . $wPx . 'px;height:' . $hPx . 'px;background:#fff;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.15);}'
            . '.cert img{display:block;width:100%;height:100%;object-fit:cover;}'
                . '@media print{html,body{margin:0!important;padding:0!important;width:' . $wMm . 'mm;height:' . $hMm . 'mm;background:#fff!important;}body{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}.stack{gap:0!important;}.cert{box-shadow:none!important;margin:0!important;break-after:page;page-break-after:always;}.cert:last-child{break-after:auto;page-break-after:auto;}}'
            . '@media (max-width:' . $wPx . 'px){.cert{width:100%;height:auto;}.cert img{height:auto;}}'
            . '</style></head><body><div class="stack">' . $blocks . '</div></body></html>';
    }

    private function applyMasksWithClaude(string $html): string
    {
        $allowedMaskList = [
            '{{nome_aluno}}',
            '{{cpf_aluno}}',
            '{{funcao_aluno}}',
            '{{nome_curso}}',
            '{{carga_horaria}}',
            '{{periodo_curso}}',
            '{{data_de_emissao}}',
            '{{nome_empresa}}',
            '{{nome_instrutor}}',
            '{{formacao_instrutor}}',
            '{{crea_instrutor}}',
            '{{data_validade}}',
            '{{cidade_de_realizacao}}',
        ];

        try {
            // Gemini é desativado automaticamente em ambiente local (APP_ENV=local).
            // Em produção, o fluxo completo de aplicação de máscaras via IA é executado.
            if (env('APP_ENV') === 'local') {
                \Illuminate\Support\Facades\Log::info('[Gemini] Desativado em ambiente local. Usando fallback de padrões.');
                $fallbackHtml = $this->applyMasksByPatternFallback($html);
                return $this->removeLineBreaksFromMaskContainers(
                    $this->convertCenteredAbsoluteToFlexible($fallbackHtml)
                );
            }

            $gemini = new GeminiService();

            [$htmlForGemini, $imagePlaceholderMap] = $this->replaceImageSourcesWithPlaceholders($html);

            // Gemini NÃO retorna o HTML completo — apenas lista de substituições e metadados.
            // O PHP aplica as trocas no HTML original (evita JSON inválido por HTML grande).
            $systemPrompt = 'Você é um especialista em análise de certificados HTML de treinamentos. '
                . 'Receberá o HTML de um certificado e deve identificar os dados variáveis para substituição por máscaras. '
                . 'NÃO retorne o HTML — apenas as informações de substituição no formato JSON solicitado. '
                . 'Máscaras disponíveis: '
                . '  {{nome_aluno}}: nome da pessoa certificada (aluno/participante/funcionário). '
                . '  {{cpf_aluno}}: CPF do aluno (formato 000.000.000-00). '
                . '  {{funcao_aluno}}: cargo ou função do aluno (ex.: Eletricista, Operador). '
                . '  {{nome_curso}}: título do curso — SOMENTE em mask_values, NÃO em replacements. '
                . '  {{carga_horaria}}: carga horária (ex.: "20 horas", "40h"). '
                . '  {{periodo_curso}}: período/datas de realização (ex.: "20 e 21 de setembro de 2025"). '
                . '  {{data_de_emissao}}: data de emissão ou conclusão do certificado. '
                . '  {{data_validade}}: data de validade/vencimento, se existir. '
                . '  {{cidade_de_realizacao}}: cidade onde o curso ocorreu. '
                . '  {{nome_empresa}}: empresa empregadora do aluno (NUNCA a instituição emissora). '
                . '  {{nome_instrutor}}: nome do instrutor ou ministrante. '
                . '  {{formacao_instrutor}}: formação acadêmica do instrutor. '
                . '  {{crea_instrutor}}: número de registro CREA/CRM/CRO do instrutor. '
                . 'Regras: '
                . '1) Em "replacements", coloque o texto EXATAMENTE como aparece no HTML (com acentos, maiúsculas, entidades HTML como &#160;). '
                . '2) Nunca coloque {{nome_curso}} em replacements — apenas em mask_values. '
                . '3) Nunca substitua textos fixos do layout (ex.: "CERTIFICADO", "Certifica que", "participou do curso"). '
                . '4) Nunca use {{nome_empresa}} para a instituição emissora ou organizadora. '
                . '5) Se houver "cidade, data" juntos (ex.: "Curitiba, 10 de março de 2025"), crie duas entradas separadas em replacements. '
                . '6) Retorne EXCLUSIVAMENTE JSON válido sem markdown: '
                . '{"replacements":[{"original":"texto exato no HTML","mask":"{{mascara}}"}],'
                . '"mask_values":{"{{mascara}}":"valor original encontrado"},'
                . '"orientation":"landscape ou portrait",'
                . '"centered":[{"original":"texto exato no HTML","align":"center"}]}';

            \Illuminate\Support\Facades\Log::info('[Gemini] Enviando prompt para o modelo...');
            $geminiResponse = $gemini->interpret($systemPrompt, $htmlForGemini);
            \Illuminate\Support\Facades\Log::info('[Gemini] Resposta recebida: ' . $geminiResponse);

            $parsedResponse = $this->parseGeminiReplacementsResponse($geminiResponse, $allowedMaskList);

            $this->generationMeta['mask_values'] = $parsedResponse['mask_values'];
            $this->generationMeta['orientation']  = $parsedResponse['orientation'];

            // PHP aplica as substituições diretamente no HTML original
            $maskedHtml = $this->applyGeminiReplacements($htmlForGemini, $parsedResponse['replacements'], $parsedResponse['centered'] ?? []);
            $maskedHtml = $this->restoreImageSourcesFromPlaceholders($maskedHtml, $imagePlaceholderMap);
            $maskedHtml = $this->restoreOriginalImageSources($html, $maskedHtml);

            // {{nome_curso}} não deve aparecer como máscara no template final
            $courseNameOriginal = (string) ($parsedResponse['mask_values']['{{nome_curso}}'] ?? '');
            if ($courseNameOriginal !== '') {
                $maskedHtml = str_replace('{{nome_curso}}', htmlspecialchars($courseNameOriginal, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'), $maskedHtml);
            }

            $maskedHtml = $this->restoreCenteredTextAlignment($html, $maskedHtml);
            $maskedHtml = $this->ensureCenteredAlignmentForMaskedBlocks($html, $maskedHtml);
            $maskedHtml = $this->convertCenteredAbsoluteToFlexible($maskedHtml);
            $maskedHtml = $this->removeLineBreaksFromMaskContainers($maskedHtml);

            if (($this->generationMeta['orientation'] ?? null) === null) {
                $this->generationMeta['orientation'] = $this->detectOrientationFromHtml($maskedHtml);
            }

            foreach ($allowedMaskList as $mask) {
                if ($mask !== '{{nome_curso}}' && str_contains($maskedHtml, $mask)) {
                    return $maskedHtml;
                }
            }

            \Illuminate\Support\Facades\Log::warning('[Gemini] Nenhuma máscara aplicada com sucesso. Ativando fallback de padrões.');
            $fallbackHtml = $this->applyMasksByPatternFallback($html);
            return $this->removeLineBreaksFromMaskContainers(
                $this->convertCenteredAbsoluteToFlexible($fallbackHtml)
            );
        } catch (\Throwable $e) {
            $this->warn('Falha ao aplicar mascaras com Gemini: ' . $e->getMessage());
            \Illuminate\Support\Facades\Log::error('[Gemini] ' . $e->getMessage());
            $fallbackHtml = $this->applyMasksByPatternFallback($html);
            return $this->removeLineBreaksFromMaskContainers(
                $this->convertCenteredAbsoluteToFlexible($fallbackHtml)
            );
        }
    }

    private function parseGeminiReplacementsResponse(string $response, array $allowedMaskList): array
    {
        $empty = ['replacements' => [], 'mask_values' => [], 'orientation' => null, 'centered' => []];

        $jsonText = $this->extractJsonPayload($response);
        if ($jsonText === null) {
            \Illuminate\Support\Facades\Log::warning('[Gemini] Não foi possível extrair JSON da resposta.');
            return $empty;
        }

        $decoded = json_decode($jsonText, true);
        if (! is_array($decoded)) {
            \Illuminate\Support\Facades\Log::warning('[Gemini] JSON inválido na resposta.');
            return $empty;
        }

        // Valida replacements
        $replacements = [];
        foreach ((array) ($decoded['replacements'] ?? []) as $r) {
            $original = trim((string) ($r['original'] ?? ''));
            $mask     = trim((string) ($r['mask'] ?? ''));
            if ($original === '' || $mask === '') {
                continue;
            }
            if (preg_match('/\{\{[a-z_]+\}\}/i', $mask) !== 1) {
                continue;
            }
            // Não permite que nome_curso entre em replacements (regra do sistema)
            if ($mask === '{{nome_curso}}') {
                continue;
            }
            $replacements[] = ['original' => $original, 'mask' => $mask];
        }

        // Valida mask_values
        $maskValues = [];
        foreach ($allowedMaskList as $mask) {
            $value = ($decoded['mask_values'] ?? [])[$mask] ?? null;
            if (! is_scalar($value)) {
                continue;
            }
            $normalized = trim((string) $value);
            if ($normalized === '' || preg_match('/\{\{[a-z_]+\}\}/i', $normalized) === 1) {
                continue;
            }
            $maskValues[$mask] = $normalized;
        }

        // Valida centered
        $centered = [];
        foreach ((array) ($decoded['centered'] ?? []) as $c) {
            $original = trim((string) ($c['original'] ?? ''));
            $align    = trim((string) ($c['align'] ?? ''));
            if ($original !== '') {
                $centered[] = ['original' => $original, 'align' => $align];
            }
        }

        return [
            'replacements' => $replacements,
            'mask_values'  => $maskValues,
            'orientation'  => $this->normalizeOrientation((string) ($decoded['orientation'] ?? '')),
            'centered'     => $centered,
        ];
    }

    private function applyGeminiReplacements(string $html, array $replacements, array $centeredItems = []): string
    {
        // 1. Aplica substituições normais das máscaras
        foreach ($replacements as $replacement) {
            $original = (string) ($replacement['original'] ?? '');
            $mask     = (string) ($replacement['mask'] ?? '');

            if ($original === '' || $mask === '') {
                continue;
            }

            // Substituição direta
            if (str_contains($html, $original)) {
                $html = str_replace($original, $mask, $html);
                continue;
            }

            // Versão com HTML special chars encodados (ex.: & → &amp;)
            $htmlEncoded = htmlspecialchars($original, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
            if ($htmlEncoded !== $original && str_contains($html, $htmlEncoded)) {
                $html = str_replace($htmlEncoded, $mask, $html);
                continue;
            }

            // Espaços → &#160; (non-breaking space gerado por pdftohtml)
            $nbspVariant = str_replace(' ', '&#160;', $original);
            if ($nbspVariant !== $original && str_contains($html, $nbspVariant)) {
                $html = str_replace($nbspVariant, $mask, $html);
                continue;
            }

            // Espaços → &nbsp;
            $nbspVariant2 = str_replace(' ', '&nbsp;', $original);
            if ($nbspVariant2 !== $original && str_contains($html, $nbspVariant2)) {
                $html = str_replace($nbspVariant2, $mask, $html);
            }
        }

        // 2. Aplica a centralização dinâmica nos elementos informados pelo Gemini
        if ($centeredItems !== []) {
            $blockPattern = '/<(?P<tag>p|span|td|th|li|h[1-6])\b(?P<attrs>[^>]*)>(?P<content>.*?)<\/\k<tag>>/is';
            $html = preg_replace_callback(
                $blockPattern,
                function (array $m) use ($centeredItems): string {
                    $attrs = $m['attrs'] ?? '';
                    $content = $m['content'] ?? '';
                    $plainText = trim($this->htmlToPlainText($content));

                    if ($plainText === '') {
                        return $m[0];
                    }

                    $shouldCenter = false;
                    foreach ($centeredItems as $item) {
                        $origText = trim((string) ($item['original'] ?? ''));
                        $align = strtolower(trim((string) ($item['align'] ?? '')));

                        if ($origText === '') {
                            continue;
                        }

                        // Se o texto puro do bloco bater com o texto original do item do Gemini
                        // E o alinhamento for "center", nós centralizamos!
                        if ($align === 'center' && (
                            strcasecmp($plainText, $origText) === 0 ||
                            str_contains(strtolower($plainText), strtolower($origText)) ||
                            str_contains(strtolower($origText), strtolower($plainText))
                        )) {
                            $shouldCenter = true;
                            break;
                        }
                    }

                    if ($shouldCenter && preg_match('/\bstyle\s*=\s*(["\'])(.*?)\1/i', $attrs, $styleMatch) === 1) {
                        $style = $styleMatch[2];
                        $updatedStyle = $this->convertStyleToDynamicCenter($style);
                        $quote = $styleMatch[1];
                        $updatedAttrs = (string) preg_replace(
                            '/\bstyle\s*=\s*(["\'])(.*?)\1/i',
                            'style=' . $quote . $updatedStyle . $quote,
                            $attrs,
                            1
                        );
                        return '<' . $m['tag'] . $updatedAttrs . '>' . $content . '</' . $m['tag'] . '>';
                    }

                    return $m[0];
                },
                $html
            ) ?? $html;
        }

        return $html;
    }

    private function applyMasksByPatternFallback(string $html): string
    {
        $masked = $html;

        $masked = (string) preg_replace(
            '/(funcion[aá]rio(?:&#160;|&nbsp;|\s)*<b>)(.*?)(<\/b>)/iu',
            '$1{{nome_aluno}}$3',
            $masked
        );

        $masked = (string) preg_replace(
            '/((?:aluno|funcion[aá]rio)[\s\S]{0,180}?empresa(?:&#160;|&nbsp;|\s)*<b>)(.*?)(<\/b>)/iu',
            '$1{{nome_empresa}}$3',
            $masked
        );

        $masked = (string) preg_replace(
            '/(curso(?:&#160;|&nbsp;|\s)*<b>)(.*?)(<\/b>)/iu',
            '$1$2$3',
            $masked
        );

        $masked = (string) preg_replace(
            '/no\s*<br\/?>(.*?)\s+com\s+carga\s+hor[aá]ria/iu',
            'no<br/>{{periodo_curso}} com carga horária',
            $masked
        );

        $masked = (string) preg_replace(
            '/carga\s+hor[aá]ria\s+de\s*[^.<\n]+/iu',
            'carga horária de {{carga_horaria}}',
            $masked
        );

        $masked = (string) preg_replace(
            '/[A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ][A-Za-zÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇáàâãéèêíìîóòôõúùûç\s\-]+,\s*\d{1,2}\s+de\s+[A-Za-zÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇáàâãéèêíìîóòôõúùûç]+\s+de\s+\d{4}/u',
            '{{cidade_de_realizacao}}, {{data_de_emissao}}',
            $masked
        );

        $masked = (string) preg_replace(
            '/(CPF\s*:?\s*)(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11})/iu',
            '$1{{cpf_aluno}}',
            $masked
        );

        $masked = (string) preg_replace(
            '/(instrutor(?:a)?\s*:?\s*<b>)(.*?)(<\/b>)/iu',
            '$1{{nome_instrutor}}$3',
            $masked
        );

        $masked = (string) preg_replace(
            '/(forma[cç][aã]o\s*:?\s*<b>)(.*?)(<\/b>)/iu',
            '$1{{formacao_instrutor}}$3',
            $masked
        );

        $masked = (string) preg_replace(
            '/(crea\s*:?\s*<b>)(.*?)(<\/b>)/iu',
            '$1{{crea_instrutor}}$3',
            $masked
        );

        $masked = (string) preg_replace(
            '/(validade\s*:?\s*)(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|\d{1,2}\s+de\s+[A-Za-zÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇáàâãéèêíìîóòôõúùûç]+\s+de\s+\d{4})/iu',
            '$1{{data_validade}}',
            $masked
        );

        return $masked;
    }

    private function replaceImageSourcesWithPlaceholders(string $html): array
    {
        $index = 0;
        $map = [];

        $sanitizedHtml = preg_replace_callback(
            '/<img\b[^>]*\bsrc=("|\')(.*?)\1[^>]*>/i',
            function (array $match) use (&$index, &$map): string {
                $placeholder = '__CERT_IMG_' . $index . '__';
                $map[$placeholder] = $match[2];
                $index++;

                return (string) preg_replace('/\bsrc=("|\').*?\1/i', 'src="' . $placeholder . '"', $match[0], 1);
            },
            $html
        );

        if (! is_string($sanitizedHtml)) {
            return [$html, []];
        }

        return [$sanitizedHtml, $map];
    }

    private function restoreImageSourcesFromPlaceholders(string $html, array $map): string
    {
        if ($map === []) {
            return $html;
        }

        return strtr($html, $map);
    }

    private function restoreOriginalImageSources(string $originalHtml, string $maskedHtml): string
    {
        preg_match_all('/<img\b[^>]*\bsrc=(["\'])(.*?)\1[^>]*>/i', $originalHtml, $originalMatches);
        $originalSources = $originalMatches[2] ?? [];

        if ($originalSources === []) {
            return $maskedHtml;
        }

        $currentIndex = 0;
        $result = preg_replace_callback(
            '/<img\b[^>]*\bsrc=(["\'])(.*?)\1[^>]*>/i',
            function (array $match) use (&$currentIndex, $originalSources): string {
                if (! isset($originalSources[$currentIndex])) {
                    return $match[0];
                }

                $quote = $match[1];
                $source = $originalSources[$currentIndex];
                $currentIndex++;

                return (string) preg_replace('/\bsrc=(["\']).*?\1/i', 'src=' . $quote . $source . $quote, $match[0], 1);
            },
            $maskedHtml
        );

        if (! is_string($result)) {
            return $maskedHtml;
        }

        return $result;
    }

    private function restoreCenteredTextAlignment(string $originalHtml, string $maskedHtml): string
    {
        $centeredByTagAndIndex = [];
        $originalTagIndex = [];

        preg_match_all('/<([a-z0-9]+)\b([^>]*)>/i', $originalHtml, $originalTags, PREG_SET_ORDER);
        foreach ($originalTags as $tagMatch) {
            $tag = strtolower($tagMatch[1]);
            $attrs = $tagMatch[2] ?? '';
            $index = $originalTagIndex[$tag] ?? 0;
            $originalTagIndex[$tag] = $index + 1;

            if ($this->isTagCentered($attrs)) {
                $centeredByTagAndIndex[$tag][$index] = true;
            }
        }

        if ($centeredByTagAndIndex === []) {
            return $maskedHtml;
        }

        $maskedTagIndex = [];
        $result = preg_replace_callback(
            '/<([a-z0-9]+)\b([^>]*)>/i',
            function (array $tagMatch) use (&$maskedTagIndex, $centeredByTagAndIndex): string {
                $tag = strtolower($tagMatch[1]);
                $attrs = $tagMatch[2] ?? '';
                $index = $maskedTagIndex[$tag] ?? 0;
                $maskedTagIndex[$tag] = $index + 1;

                if (! isset($centeredByTagAndIndex[$tag][$index])) {
                    return $tagMatch[0];
                }

                $updatedAttrs = $this->ensureCenteredStyle($attrs);
                return '<' . $tagMatch[1] . $updatedAttrs . '>';
            },
            $maskedHtml
        );

        if (! is_string($result)) {
            return $maskedHtml;
        }

        return $result;
    }

    private function isTagCentered(string $attrs): bool
    {
        if (preg_match('/\balign\s*=\s*(["\'])?center\1?/i', $attrs) === 1) {
            return true;
        }

        if (preg_match('/\bclass\s*=\s*(["\']).*?\btext-center\b.*?\1/i', $attrs) === 1) {
            return true;
        }

        return preg_match('/text-align\s*:\s*center/i', $attrs) === 1;
    }

    private function ensureCenteredStyle(string $attrs): string
    {
        if (preg_match('/\bstyle\s*=\s*(["\'])(.*?)\1/i', $attrs, $styleMatch) === 1) {
            $style = $styleMatch[2];
            if (preg_match('/text-align\s*:/i', $style) === 1) {
                $style = (string) preg_replace('/text-align\s*:\s*[^;]+/i', 'text-align:center', $style);
            } else {
                $style = rtrim($style);
                if ($style !== '' && ! str_ends_with($style, ';')) {
                    $style .= ';';
                }
                $style .= 'text-align:center;';
            }

            $quote = $styleMatch[1];
            return (string) preg_replace(
                '/\bstyle\s*=\s*(["\'])(.*?)\1/i',
                'style=' . $quote . $style . $quote,
                $attrs,
                1
            );
        }

        return rtrim($attrs) . ' style="text-align:center;"';
    }

    private function ensureCenteredAlignmentForMaskedBlocks(string $originalHtml, string $maskedHtml): string
    {
        $pattern = '/<(?P<tag>p|div|td|th|li|h[1-6])\b(?P<attrs>[^>]*)>(?P<content>.*?)<\/\k<tag>>/is';
        $maskPattern = '/\{\{(?:nome_aluno|cpf_aluno|funcao_aluno|nome_curso|carga_horaria|periodo_curso|data_de_emissao|nome_empresa|nome_instrutor|formacao_instrutor|crea_instrutor|data_validade|cidade_de_realizacao)\}\}/';

        $centeredByTagAndIndex = [];
        $originalTagIndex = [];

        preg_match_all($pattern, $originalHtml, $originalBlocks, PREG_SET_ORDER);
        foreach ($originalBlocks as $blockMatch) {
            $tag = strtolower($blockMatch['tag']);
            $attrs = $blockMatch['attrs'] ?? '';
            $index = $originalTagIndex[$tag] ?? 0;
            $originalTagIndex[$tag] = $index + 1;

            if ($this->isTagCentered($attrs)) {
                $centeredByTagAndIndex[$tag][$index] = true;
            }
        }

        if ($centeredByTagAndIndex === []) {
            return $maskedHtml;
        }

        $maskedTagIndex = [];
        $result = preg_replace_callback(
            $pattern,
            function (array $blockMatch) use (&$maskedTagIndex, $centeredByTagAndIndex, $maskPattern): string {
                $tag = strtolower($blockMatch['tag']);
                $attrs = $blockMatch['attrs'] ?? '';
                $content = $blockMatch['content'] ?? '';
                $index = $maskedTagIndex[$tag] ?? 0;
                $maskedTagIndex[$tag] = $index + 1;

                if (! isset($centeredByTagAndIndex[$tag][$index])) {
                    return $blockMatch[0];
                }

                if (preg_match($maskPattern, $content) !== 1) {
                    return $blockMatch[0];
                }

                $updatedAttrs = $this->ensureCenteredStyle($attrs);
                return '<' . $blockMatch['tag'] . $updatedAttrs . '>' . $content . '</' . $blockMatch['tag'] . '>';
            },
            $maskedHtml
        );

        if (! is_string($result)) {
            return $maskedHtml;
        }

        return $result;
    }

    private function convertCenteredAbsoluteToFlexible(string $html): string
    {
        $pageWidth = $this->detectPageWidthFromHtml($html);
        if ($pageWidth <= 0) {
            return $html;
        }

        $fontSizes = $this->extractFontSizesFromCssClasses($html);
        $fontFamilies = $this->extractFontFamiliesFromCssClasses($html);
        $maskPattern = '/\{\{[a-z_]+\}\}/i';
        $blockPattern = '/<(?P<tag>p|span|td|th|li|h[1-6])\b(?P<attrs>[^>]*)>(?P<content>.*?)<\/\k<tag>>/is';
        $pageCenter = $pageWidth / 2;
        $threshold = max(35.0, $pageWidth * 0.08);

        // Count blocks per vertical alignment to identify multi-column/multi-block rows
        $topBlockCounts = [];
        preg_match_all($blockPattern, $html, $scanBlocks, PREG_SET_ORDER);
        foreach ($scanBlocks as $scanBlock) {
            $scanAttrs = $scanBlock['attrs'] ?? '';
            if (preg_match('/\bstyle\s*=\s*(["\'])(.*?)\1/i', $scanAttrs, $scanStyleMatch) !== 1) {
                continue;
            }
            $scanStyle = $scanStyleMatch[2] ?? '';
            if (preg_match('/position\s*:\s*absolute/i', $scanStyle) !== 1) {
                continue;
            }
            if (preg_match('/\btop\s*:\s*([-+]?[0-9]*\.?[0-9]+)px/i', $scanStyle, $scanTopMatch) === 1) {
                $t = (string) round((float) $scanTopMatch[1], 2);
                $topBlockCounts[$t] = ($topBlockCounts[$t] ?? 0) + 1;
            }
        }

        // Identify only true side-by-side plain labels (like "Ministrante:" next to name)
        $topHasPlainLabel = [];
        foreach ($scanBlocks as $scanBlock) {
            $scanAttrs = $scanBlock['attrs'] ?? '';
            if (preg_match('/\bstyle\s*=\s*(["\'])(.*?)\1/i', $scanAttrs, $scanStyleMatch) !== 1) {
                continue;
            }
            $scanStyle = $scanStyleMatch[2] ?? '';
            if (preg_match('/position\s*:\s*absolute/i', $scanStyle) !== 1) {
                continue;
            }
            if (preg_match('/\btop\s*:\s*([-+]?[0-9]*\.?[0-9]+)px/i', $scanStyle, $scanTopMatch) !== 1) {
                continue;
            }
            $t = (string) round((float) $scanTopMatch[1], 2);
            if (($topBlockCounts[$t] ?? 0) <= 1) {
                continue; // Standalone lines are always safe to center
            }

            $scanText = $this->htmlToPlainText($scanBlock['content'] ?? '');
            if ($scanText === '' || preg_match($maskPattern, $scanText) === 1) {
                continue;
            }

            $topHasPlainLabel[$t] = true;
        }

        // -------------------------------------------------------------
        // DYNAMIC VISUAL GROUP MERGER (for centered side-by-side lines)
        // -------------------------------------------------------------
        $blocksByTop = [];
        foreach ($scanBlocks as $scanBlock) {
            $scanAttrs = $scanBlock['attrs'] ?? '';
            if (preg_match('/\bstyle\s*=\s*(["\'])(.*?)\1/i', $scanAttrs, $scanStyleMatch) !== 1) {
                continue;
            }
            $scanStyle = $scanStyleMatch[2] ?? '';
            if (preg_match('/position\s*:\s*absolute/i', $scanStyle) !== 1) {
                continue;
            }
            if (preg_match('/\btop\s*:\s*([-+]?[0-9]*\.?[0-9]+)px/i', $scanStyle, $scanTopMatch) === 1 &&
                preg_match('/\bleft\s*:\s*([-+]?[0-9]*\.?[0-9]+)px/i', $scanStyle, $scanLeftMatch) === 1) {
                
                $topVal = round((float) $scanTopMatch[1], 2);
                $leftVal = (float) $scanLeftMatch[1];
                $topKey = (string) $topVal;
                
                $plainText = $this->htmlToPlainText($scanBlock['content'] ?? '');
                if ($plainText === '') {
                    continue;
                }

                // Skip signature-related text blocks from being grouped and merged
                if ($this->isSignatureRelatedText($plainText)) {
                    continue;
                }
                
                $fontSize = $this->detectFontSizeFromAttrs($scanAttrs, $scanStyle, $fontSizes);
                $isScriptFont = $this->detectIfScriptFont($scanAttrs, $scanStyle, $fontFamilies);
                $textWidth = $this->estimateTextWidthInPx($plainText, $fontSize, $isScriptFont);
                
                $blocksByTop[$topKey][] = [
                    'full' => $scanBlock[0],
                    'tag' => $scanBlock['tag'],
                    'attrs' => $scanAttrs,
                    'content' => $scanBlock['content'] ?? '',
                    'left' => $leftVal,
                    'width' => $textWidth,
                    'style' => $scanStyle,
                    'plain' => $plainText
                ];
            }
        }

        $htmlReplacements = [];
        foreach ($blocksByTop as $topKey => $lineBlocks) {
            if (count($lineBlocks) <= 1) {
                continue;
            }
            
            // Sort blocks from left to right
            usort($lineBlocks, function($a, $b) {
                return $a['left'] <=> $b['left'];
            });

            // Skip merging if any block on this line is signature-related
            $hasSignature = false;
            foreach ($lineBlocks as $b) {
                if ($this->isSignatureRelatedText($b['plain'])) {
                    $hasSignature = true;
                    break;
                }
            }
            if ($hasSignature) {
                continue;
            }
            
            $leftStart = $lineBlocks[0]['left'];
            $lastBlock = end($lineBlocks);
            $rightEnd = $lastBlock['left'] + $lastBlock['width'];
            $combinedWidth = $rightEnd - $leftStart;
            $combinedCenter = $leftStart + ($combinedWidth / 2);
            
            if (abs($combinedCenter - $pageCenter) <= $threshold) {
                $firstBlock = $lineBlocks[0];
                $mergedStyle = $this->convertStyleToDynamicCenter($firstBlock['style']);
                $quote = '"';
                if (preg_match('/\bstyle\s*=\s*(["\'])/i', $firstBlock['attrs'], $quoteMatch) === 1) {
                    $quote = $quoteMatch[1];
                }
                
                $updatedAttrs = (string) preg_replace(
                    '/\bstyle\s*=\s*(["\'])(.*?)\1/i',
                    'style=' . $quote . $mergedStyle . $quote,
                    $firstBlock['attrs'],
                    1
                );
                
                $mergedContent = '';
                foreach ($lineBlocks as $b) {
                    $mergedContent .= $b['content'] . ' ';
                }
                // Strip all trailing non-breaking spaces and whitespace
                $mergedContent = preg_replace('/(?:&\#160;|&nbsp;|\s)+$/iu', '', $mergedContent);
                
                $mergedBlock = '<' . $firstBlock['tag'] . $updatedAttrs . '>' . $mergedContent . '</' . $firstBlock['tag'] . '>';
                
                $htmlReplacements[] = [
                    'target' => $firstBlock['full'],
                    'replacement' => $mergedBlock
                ];
                
                for ($i = 1; $i < count($lineBlocks); $i++) {
                    $htmlReplacements[] = [
                        'target' => $lineBlocks[$i]['full'],
                        'replacement' => ''
                    ];
                }
            }
        }

        foreach ($htmlReplacements as $rep) {
            $html = str_replace($rep['target'], $rep['replacement'], $html);
        }

        $result = preg_replace_callback(
            $blockPattern,
            function (array $m) use ($fontSizes, $fontFamilies, $maskPattern, $pageCenter, $threshold, $topHasPlainLabel): string {
                $attrs = $m['attrs'] ?? '';
                $content = $m['content'] ?? '';

                if (preg_match('/\bstyle\s*=\s*(["\'])(.*?)\1/i', $attrs, $styleMatch) !== 1) {
                    return $m[0];
                }

                $style = $styleMatch[2] ?? '';
                if (preg_match('/position\s*:\s*absolute/i', $style) !== 1) {
                    return $m[0];
                }

                if (preg_match('/\bleft\s*:\s*([-+]?[0-9]*\.?[0-9]+)px/i', $style, $leftMatch) !== 1) {
                    return $m[0];
                }

                $left = (float) $leftMatch[1];
                $top = null;
                if (preg_match('/\btop\s*:\s*([-+]?[0-9]*\.?[0-9]+)px/i', $style, $topMatch) === 1) {
                    $top = round((float) $topMatch[1], 2);
                }

                $plainText = $this->htmlToPlainText($content);
                if ($plainText === '') {
                    return $m[0];
                }

                // If it is signature-related text, DO NOT center it dynamically! Keep its exact absolute position.
                if ($this->isSignatureRelatedText($plainText)) {
                    return $m[0];
                }

                // Avoid centering elements that are on a line with a side-by-side plain label (prevents overlaps)
                if ($top !== null && isset($topHasPlainLabel[(string) $top])) {
                    return $m[0];
                }

                $isStandaloneMaskLine = preg_match('/^["\'\s“”]*(?:Prof\.\s*)?\{\{[a-z_]+\}\}["\'\s“”]*$/iu', $plainText) === 1;

                // 1. Linhas que sao apenas a mascara (nome/categoria) devem ser centradas dinamicamente.
                if ($isStandaloneMaskLine) {
                    $updatedStyle = $this->convertStyleToDynamicCenter($style);
                    $quote = $styleMatch[1];
                    $updatedAttrs = (string) preg_replace(
                        '/\bstyle\s*=\s*(["\'])(.*?)\1/i',
                        'style=' . $quote . $updatedStyle . $quote,
                        $attrs,
                        1
                    );

                    $cleanedContent = preg_replace('/(?:&\#160;|&nbsp;|\s)+$/iu', '', $content);
                    return '<' . $m['tag'] . $updatedAttrs . '>' . $cleanedContent . '</' . $m['tag'] . '>';
                }

                // Heuristica: blocos em faixa central da pagina tendem a ser textos
                // visualmente centralizados no layout original.
                if ($left >= ($pageCenter - ($pageCenter * 0.30)) && $left <= ($pageCenter + ($pageCenter * 0.30))) {
                    $updatedStyle = $this->convertStyleToDynamicCenter($style);
                    $quote = $styleMatch[1];
                    $updatedAttrs = (string) preg_replace(
                        '/\bstyle\s*=\s*(["\'])(.*?)\1/i',
                        'style=' . $quote . $updatedStyle . $quote,
                        $attrs,
                        1
                    );

                    $cleanedContent = preg_replace('/(?:&\#160;|&nbsp;|\s)+$/iu', '', $content);
                    return '<' . $m['tag'] . $updatedAttrs . '>' . $cleanedContent . '</' . $m['tag'] . '>';
                }

                $fontSize = $this->detectFontSizeFromAttrs($attrs, $style, $fontSizes);
                $isScriptFont = $this->detectIfScriptFont($attrs, $style, $fontFamilies);
                $textWidth = $this->estimateTextWidthInPx($plainText, $fontSize, $isScriptFont);
                $textCenter = $left + ($textWidth / 2);

                if (abs($textCenter - $pageCenter) > $threshold) {
                    return $m[0];
                }

                $updatedStyle = $this->convertStyleToDynamicCenter($style);
                $quote = $styleMatch[1];
                $updatedAttrs = (string) preg_replace(
                    '/\bstyle\s*=\s*(["\'])(.*?)\1/i',
                    'style=' . $quote . $updatedStyle . $quote,
                    $attrs,
                    1
                );

                $cleanedContent = preg_replace('/(?:&\#160;|&nbsp;|\s)+$/iu', '', $content);
                return '<' . $m['tag'] . $updatedAttrs . '>' . $cleanedContent . '</' . $m['tag'] . '>';
            },
            $html
        );

        $updatedHtml = is_string($result) ? $result : $html;
        $updatedHtml = $this->normalizeMaskSpacing($updatedHtml);
        $updatedHtml = $this->normalizeMaskedAbsoluteContainers($updatedHtml, $pageWidth);

        return $this->convertSequentialCenteredAbsoluteToFlow($updatedHtml);
    }

    private function normalizeMaskSpacing(string $html): string
    {
        // Preserve readable spacing when a mask wrapped in <b> is followed by text.
        $html = (string) preg_replace('/(<\/b>)(?=[A-Za-zÀ-ÿ])/u', '$1&#160;', $html);

        return $html;
    }

    private function normalizeMaskedAbsoluteContainers(string $html, float $pageWidth): string
    {
        if ($pageWidth <= 0) {
            return $html;
        }

        $blockPattern = '/<(?P<tag>p|span)\b(?P<attrs>[^>]*)>(?P<content>.*?)<\/\k<tag>>/is';
        $maskPattern = '/\{\{[a-z_]+\}\}/i';
        $headerMaxWidth = (int) round($pageWidth * 0.82);
        // Keep the main body text close to the original printable line length.
        $bodyMaxWidth = (int) round($pageWidth * 0.92);

        $result = preg_replace_callback(
            $blockPattern,
            function (array $m) use ($maskPattern, $headerMaxWidth, $bodyMaxWidth): string {
                $attrs = $m['attrs'] ?? '';
                $content = $m['content'] ?? '';

                if (preg_match($maskPattern, $content) !== 1) {
                    return $m[0];
                }

                if (preg_match('/\bstyle\s*=\s*(["\'])(.*?)\1/i', $attrs, $styleMatch) !== 1) {
                    return $m[0];
                }

                $style = $styleMatch[2] ?? '';
                if (preg_match('/position\s*:\s*absolute/i', $style) !== 1) {
                    return $m[0];
                }

                $top = null;
                if (preg_match('/\btop\s*:\s*([-+]?[0-9]*\.?[0-9]+)px/i', $style, $topMatch) === 1) {
                    $top = (float) $topMatch[1];
                }

                $plainText = $this->htmlToPlainText($content);
                if ($plainText === '') {
                    return $m[0];
                }

                $updatedStyle = $style;

                // Keep long certificate body text inside its visual block in editors.
                if (preg_match('/\{\{nome_aluno\}\}/i', $content) === 1 && preg_match('/\{\{nome_curso\}\}/i', $content) === 1) {
                    // Avoid preserving converter hard-breaks that shrink the usable text area.
                    $content = (string) preg_replace('/no\s*<br\s*\/?>\s*(\{\{periodo_curso\}\})/iu', 'no&#160;$1', $content);
                    $content = (string) preg_replace('/<br\s*\/?>/iu', '', $content);
                    $content = (string) preg_replace('/<\/?u\b[^>]*>/iu', '', $content);
                    $content = (string) preg_replace('/text-decoration\s*:\s*underline\s*;?/iu', '', $content);
                    $content = (string) preg_replace('/_{3,}/u', '', $content);
                    // Remove trailing blank lines generated by pdftohtml in this paragraph.
                    $content = (string) preg_replace('/(?:<br\s*\/?>\s*(?:&#160;|&nbsp;|\s)*){1,3}\s*$/iu', '', $content);
                    // Avoid dangling non-breaking spaces that can become underlined in rich editors.
                    $content = (string) preg_replace('/(?:\s|&#160;|&nbsp;)+$/iu', '', $content);

                    if (! str_contains($content, 'mask-carga-horaria')) {
                        $content = (string) preg_replace(
                            '/carga(?:\s|&#160;|&nbsp;)+hor[aá]ria(?:\s|&#160;|&nbsp;)+de(?:\s|&#160;|&nbsp;)*(\{\{carga_horaria\}\}(?:(?:\s|&#160;|&nbsp;)*(?:Horas?)\.)?)/iu',
                            'carga horária de <span class="mask-carga-horaria" style="display:inline-block;background:#fff;text-decoration:none;border:0;padding:0 64px 0 4px;line-height:1.05;">$1</span>',
                            $content,
                            1
                        );
                    }

                    $updatedStyle = (string) preg_replace('/\bwhite-space\s*:\s*nowrap\s*;?/i', '', $updatedStyle);
                    $updatedStyle = (string) preg_replace('/\bwidth\s*:\s*[^;]+;?/i', '', $updatedStyle);
                    $updatedStyle = (string) preg_replace('/\bmax-width\s*:\s*[^;]+;?/i', '', $updatedStyle);
                    $updatedStyle = rtrim(trim($updatedStyle), ';') . ';';
                    $updatedStyle .= 'white-space:normal;max-width:' . $bodyMaxWidth . 'px;line-height:1.17;';
                }

                // Header lines with company/instructor data should stay centered in one container.
                $isCompanyInstructorLine = preg_match('/\{\{nome_empresa\}\}/i', $content) === 1
                    && preg_match('/\{\{nome_instrutor\}\}/i', $content) === 1;
                $isInstructorEducationLine = preg_match('/\{\{formacao_instrutor\}\}/i', $content) === 1;
                $isHeaderZone = $top !== null && $top >= 150.0 && $top <= 260.0;

                if (($isCompanyInstructorLine || $isInstructorEducationLine) && $isHeaderZone) {
                    $updatedStyle = (string) preg_replace('/\bleft\s*:\s*[^;]+;?/i', '', $updatedStyle);
                    $updatedStyle = (string) preg_replace('/\btransform\s*:\s*[^;]+\s*;?/i', '', $updatedStyle);
                    $updatedStyle = (string) preg_replace('/\bwhite-space\s*:\s*nowrap\s*;?/i', '', $updatedStyle);
                    $updatedStyle = (string) preg_replace('/\bwidth\s*:\s*[^;]+;?/i', '', $updatedStyle);
                    $updatedStyle = (string) preg_replace('/\bmax-width\s*:\s*[^;]+;?/i', '', $updatedStyle);
                    $updatedStyle = rtrim(trim($updatedStyle), ';') . ';';
                    $updatedStyle .= 'left:50%;transform:translateX(-50%);white-space:normal;text-align:center;max-width:' . $headerMaxWidth . 'px;line-height:1.2;';
                }

                if ($updatedStyle === $style) {
                    return $m[0];
                }

                $quote = $styleMatch[1];
                $updatedAttrs = (string) preg_replace(
                    '/\bstyle\s*=\s*(["\'])(.*?)\1/i',
                    'style=' . $quote . $updatedStyle . $quote,
                    $attrs,
                    1
                );

                return '<' . $m['tag'] . $updatedAttrs . '>' . $content . '</' . $m['tag'] . '>';
            },
            $html
        );

        return is_string($result) ? $result : $html;
    }


    private function detectPageWidthFromHtml(string $html): float
    {
        if (preg_match('/<div[^>]*id="page\d+-div"[^>]*style="[^"]*width\s*:\s*([0-9]+(?:\.[0-9]+)?)px/i', $html, $m) === 1) {
            return (float) $m[1];
        }

        if (preg_match('/\.cert\s*\{[^}]*width\s*:\s*([0-9]+(?:\.[0-9]+)?)px/i', $html, $m) === 1) {
            return (float) $m[1];
        }

        return 0.0;
    }

    private function extractFontSizesFromCssClasses(string $html): array
    {
        $fontSizes = [];
        preg_match_all('/\.([a-zA-Z0-9_-]+)\s*\{[^}]*font-size\s*:\s*([0-9]+(?:\.[0-9]+)?)px/i', $html, $matches, PREG_SET_ORDER);

        foreach ($matches as $match) {
            $fontSizes[$match[1]] = (float) $match[2];
        }

        return $fontSizes;
    }

    private function detectFontSizeFromAttrs(string $attrs, string $style, array $fontSizes): float
    {
        if (preg_match('/font-size\s*:\s*([0-9]+(?:\.[0-9]+)?)px/i', $style, $m) === 1) {
            return (float) $m[1];
        }

        if (preg_match('/\bclass\s*=\s*(["\'])(.*?)\1/i', $attrs, $classMatch) === 1) {
            $classes = preg_split('/\s+/', trim($classMatch[2] ?? '')) ?: [];
            foreach ($classes as $class) {
                if (isset($fontSizes[$class])) {
                    return (float) $fontSizes[$class];
                }
            }
        }

        return 20.0;
    }

    private function htmlToPlainText(string $content): string
    {
        $text = html_entity_decode(strip_tags($content), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/\s+/u', ' ', trim($text));

        return is_string($text) ? $text : '';
    }

    private function estimateTextWidthInPx(string $text, float $fontSize, bool $isScriptFont = false): float
    {
        $chars = preg_split('//u', $text, -1, PREG_SPLIT_NO_EMPTY) ?: [];
        $units = 0.0;

        foreach ($chars as $char) {
            if (preg_match('/\s/u', $char) === 1) {
                $units += 0.33;
            } elseif (preg_match('/[A-Z0-9\x{00C0}-\x{00DC}]/u', $char) === 1) {
                $units += $isScriptFont ? 0.38 : 0.62;
            } elseif (preg_match('/[.,;:\'"\x{60}\x{B4}]/u', $char) === 1) {
                $units += 0.28;
            } elseif (preg_match('/[{}]/u', $char) === 1) {
                $units += 0.40;
            } else {
                $units += $isScriptFont ? 0.30 : 0.56;
            }
        }

        return $units * $fontSize;
    }

    private function convertStyleToDynamicCenter(string $style): string
    {
        $style = (string) preg_replace('/\bleft\s*:\s*[-+]?[0-9]*\.?[0-9]+px\s*;?/i', '', $style);
        $style = (string) preg_replace('/\btransform\s*:\s*[^;]+\s*;?/i', '', $style);
        $style = (string) preg_replace('/\bwhite-space\s*:\s*nowrap\s*;?/i', '', $style);
        $style = (string) preg_replace('/\bwidth\s*:\s*[^;]+\s*;?/i', '', $style);
        $style = (string) preg_replace('/\btext-align\s*:\s*[^;]+\s*;?/i', '', $style);

        $style = trim($style);
        if ($style !== '' && !str_ends_with($style, ';')) {
            $style .= ';';
        }

        $style .= 'left:0px;width:100%;text-align:center;';

        return $style;
    }

    private function extractFontFamiliesFromCssClasses(string $html): array
    {
        $fontFamilies = [];
        preg_match_all('/\.([a-zA-Z0-9_-]+)\s*\{[^}]*font-family\s*:\s*([^;}]+)/i', $html, $matches, PREG_SET_ORDER);

        foreach ($matches as $match) {
            $fontFamilies[$match[1]] = trim($match[2]);
        }

        return $fontFamilies;
    }

    private function detectIfScriptFont(string $attrs, string $style, array $fontFamilies): bool
    {
        $family = '';
        if (preg_match('/font-family\s*:\s*([^;}]+)/i', $style, $m) === 1) {
            $family = $m[1];
        } elseif (preg_match('/\bclass\s*=\s*(["\'])(.*?)\1/i', $attrs, $classMatch) === 1) {
            $classes = preg_split('/\s+/', trim($classMatch[2] ?? '')) ?: [];
            foreach ($classes as $class) {
                if (isset($fontFamilies[$class])) {
                    $family = $fontFamilies[$class];
                    break;
                }
            }
        }

        if ($family !== '') {
            $familyLower = strtolower($family);
            $keywords = ['script', 'edwardian', 'cursive', 'handwriting', 'calligraphy', 'corsiva', 'brush', 'formal', 'chancery', 'vibes', 'alex', 'great'];
            foreach ($keywords as $keyword) {
                if (str_contains($familyLower, $keyword)) {
                    return true;
                }
            }
        }

        return false;
    }

    private function isSignatureRelatedText(string $text): bool
    {
        $textLower = mb_strtolower(trim($text), 'UTF-8');
        if ($textLower === '') {
            return false;
        }

        // Exact mask exceptions that should NOT be considered as signature titles/lines
        if (
            str_contains($textLower, '{{nome_aluno}}') ||
            str_contains($textLower, '{{cpf_aluno}}') ||
            str_contains($textLower, '{{funcao_aluno}}') ||
            str_contains($textLower, '{{nome_empresa}}') ||
            str_contains($textLower, '{{nome_curso}}') ||
            str_contains($textLower, '{{carga_horaria}}') ||
            str_contains($textLower, '{{periodo_curso}}') ||
            str_contains($textLower, '{{cidade_de_realizacao}}')
        ) {
            return false;
        }

        // Check for signature keywords
        $keywords = [
            'ass.',
            'assina',
            'instrutor',
            'instructor',
            'diret',
            'coord',
            'presid',
            'palestrante',
            'emitente',
            'responsavel',
            'responsável'
        ];

        foreach ($keywords as $kw) {
            if (str_contains($textLower, $kw)) {
                return true;
            }
        }

        // Check for "ass" as a standalone word (e.g., "ass: ", "ass do aluno")
        if (preg_match('/\bass\b/i', $textLower) === 1) {
            return true;
        }

        return false;
    }

    private function convertSequentialCenteredAbsoluteToFlow(string $html): string
    {
        $pageWidth = $this->detectPageWidthFromHtml($html);
        $fontSizes = $this->extractFontSizesFromCssClasses($html);

        $blockPattern = '/<(?P<tag>p|div|span)\b(?P<attrs>[^>]*)>(?P<content>.*?)<\/\k<tag>>/is';
        if (preg_match_all($blockPattern, $html, $matches, PREG_SET_ORDER | PREG_OFFSET_CAPTURE) === false) {
            return $html;
        }

        $groups = [];
        $currentGroup = [];
        $lastEndOffset = -1;

        foreach ($matches as $match) {
            $fullText = $match[0][0];
            $offset = $match[0][1];
            $tag = $match['tag'][0];
            $attrs = $match['attrs'][0];
            $content = $match['content'][0];

            $style = '';
            if (preg_match('/\bstyle\s*=\s*(["\'])(.*?)\1/i', $attrs, $styleMatch) === 1) {
                $style = str_replace(' ', '', $styleMatch[2]);
            }

            $isCenteredAbsolute = str_contains($style, 'position:absolute') &&
                str_contains($style, 'left:0px') &&
                str_contains($style, 'width:100%') &&
                str_contains($style, 'text-align:center');

            if ($isCenteredAbsolute) {
                $isConsecutive = false;
                if ($currentGroup !== []) {
                    $betweenText = substr($html, $lastEndOffset, $offset - $lastEndOffset);
                    $cleanBetween = trim(strip_tags(html_entity_decode($betweenText, ENT_QUOTES | ENT_HTML5, 'UTF-8')));
                    if ($cleanBetween === '') {
                        $isConsecutive = true;
                    }
                }

                $item = [
                    'full' => $fullText,
                    'tag' => $tag,
                    'attrs' => $attrs,
                    'content' => $content,
                    'style' => $styleMatch[2] ?? '',
                    'offset' => $offset,
                    'length' => strlen($fullText)
                ];

                if ($isConsecutive) {
                    $currentGroup[] = $item;
                } else {
                    if ($currentGroup !== []) {
                        $groups[] = $currentGroup;
                    }
                    $currentGroup = [$item];
                }
                $lastEndOffset = $offset + strlen($fullText);
            } else {
                if ($currentGroup !== []) {
                    $groups[] = $currentGroup;
                    $currentGroup = [];
                }
            }
        }

        if ($currentGroup !== []) {
            $groups[] = $currentGroup;
        }

        // Sort groups in reverse order of offset to make safe replacements in string
        usort($groups, function($a, $b) {
            return $b[0]['offset'] <=> $a[0]['offset'];
        });

        foreach ($groups as $group) {
            if (count($group) <= 1) {
                continue;
            }

            $elements = [];
            $minTop = 999999.0;
            foreach ($group as $item) {
                $top = null;
                if (preg_match('/\btop\s*:\s*([-+]?[0-9]*\.?[0-9]+)px/i', $item['style'], $topMatch) === 1) {
                    $top = (float) $topMatch[1];
                    if ($top < $minTop) {
                        $minTop = $top;
                    }
                }
                $fontSize = $this->detectFontSizeFromAttrs($item['attrs'], $item['style'], $fontSizes);
                $elements[] = [
                    'item' => $item,
                    'top' => $top,
                    'fontSize' => $fontSize
                ];
            }

            usort($elements, function($a, $b) {
                if ($a['top'] === null || $b['top'] === null) return 0;
                return $a['top'] <=> $b['top'];
            });

            $groupHtml = '<div class="cert-flow-container" style="position:absolute;top:' . $minTop . 'px;left:0px;width:100%;display:flex;flex-direction:column;align-items:center;">';
            foreach ($elements as $i => $el) {
                $childStyle = $el['item']['style'];
                $childStyle = (string) preg_replace('/\bposition\s*:\s*absolute\s*;?/i', '', $childStyle);
                $childStyle = (string) preg_replace('/\btop\s*:\s*([-+]?[0-9]*\.?[0-9]+)px\s*;?/i', '', $childStyle);
                $childStyle = (string) preg_replace('/\bleft\s*:\s*([-+]?[0-9]*\.?[0-9]+)px\s*;?/i', '', $childStyle);
                $childStyle = (string) preg_replace('/\bwidth\s*:\s*[^;]+;?/i', '', $childStyle);
                
                $childStyle = trim($childStyle);
                if ($childStyle !== '' && !str_ends_with($childStyle, ';')) {
                    $childStyle .= ';';
                }
                $childStyle .= 'position:relative;';
                
                if ($i > 0) {
                    $prev = $elements[$i - 1];
                    if ($el['top'] !== null && $prev['top'] !== null) {
                        $gap = max(0.0, $el['top'] - $prev['top'] - $prev['fontSize']);
                        $childStyle .= 'margin-top:' . round($gap, 2) . 'px;';
                    }
                }
                
                $quote = '"';
                if (preg_match('/\bstyle\s*=\s*(["\'])/i', $el['item']['attrs'], $quoteMatch) === 1) {
                    $quote = $quoteMatch[1];
                }
                
                $updatedAttrs = (string) preg_replace(
                    '/\bstyle\s*=\s*(["\'])(.*?)\1/i',
                    'style=' . $quote . $childStyle . $quote,
                    $el['item']['attrs'],
                    1
                );
                
                $groupHtml .= '<' . $el['item']['tag'] . $updatedAttrs . '>' . $el['item']['content'] . '</' . $el['item']['tag'] . '>';
            }
            $groupHtml .= '</div>';

            $firstElement = $group[0];
            $lastElement = end($group);
            $groupStartOffset = $firstElement['offset'];
            $groupEndOffset = $lastElement['offset'] + $lastElement['length'];
            $groupLength = $groupEndOffset - $groupStartOffset;
            
            $html = substr_replace($html, $groupHtml, $groupStartOffset, $groupLength);
        }

        return $html;
    }






















































































    
    private function removeLineBreaksFromMaskContainers(string $html): string
    {
        $maskPattern = '/\{\{[a-z_]+\}\}/i';
        $result = preg_replace_callback(
            '/<(?P<tag>p|span)\b(?P<attrs>[^>]*)>(?P<content>.*?)<\/\k<tag>>/is',
            function (array $m) use ($maskPattern): string {
                $content = $m['content'] ?? '';
                if (preg_match($maskPattern, $content) !== 1) {
                    return $m[0];
                }
                $cleaned = (string) preg_replace('/<br\s*\/?>\s*/iu', '', $content);
                if ($cleaned === $content) {
                    return $m[0];
                }
                return '<' . $m['tag'] . $m['attrs'] . '>' . $cleaned . '</' . $m['tag'] . '>';
            },
            $html
        );
        return is_string($result) ? $result : $html;
    }

    private function persistFrameImagesToS3AndLinkToCourse(string $html, int $courseId, int $entityId): void
    {
        try {
            // 1. Extrai as imagens de fundo do HTML (background do certificado)
            $extractedImages = $this->extractFrameImagesFromHtml($html);

            if (empty($extractedImages)) {
                $this->warn('Nenhuma imagem de fundo encontrada no HTML. Frame não salvo.');
                return;
            }

            $frontImage = $extractedImages[0];
            $backImage = $extractedImages[1] ?? null;

            // 2. Faz upload da imagem da FRENTE para o S3
            $s3PathFront = 'frames/' . Str::uuid() . '.' . $frontImage['ext'];
            Storage::disk('s3')->put($s3PathFront, $frontImage['data'], 'private');
            $s3UrlFront = Storage::disk('s3')->url($s3PathFront);
            $this->info("Imagem do frame (FRENTE) enviada ao S3: {$s3UrlFront}");

            // 3. Faz upload da imagem do VERSO para o S3 (se houver)
            $s3UrlBack = null;
            if ($backImage) {
                $s3PathBack = 'frames/' . Str::uuid() . '.' . $backImage['ext'];
                Storage::disk('s3')->put($s3PathBack, $backImage['data'], 'private');
                $s3UrlBack = Storage::disk('s3')->url($s3PathBack);
                $this->info("Imagem do frame (VERSO) enviada ao S3: {$s3UrlBack}");
            }

            // 4. Cria o DocumentTemplateFrame com as URLs das imagens
            $frame = DocumentTemplateFrame::create([
                'frame'       => $s3UrlFront,
                'back_frame'  => $s3UrlBack,
                'entity_id'   => $entityId,
                'is_top_only' => false,
            ]);
            $this->info("DocumentTemplateFrame criado: #{$frame->id}");

            // 5. Localiza o curso e seu template de certificado
            $course = Course::find($courseId);
            if (! $course) {
                $this->warn("Curso #{$courseId} não encontrado. Frame salvo mas não vinculado.");
                return;
            }

            if (! $course->certificate_id) {
                $this->warn("Curso #{$courseId} não possui template de certificado vinculado. Frame salvo mas não vinculado.");
                return;
            }

            $documentTemplate = DocumentTemplate::find($course->certificate_id);
            if (! $documentTemplate) {
                $this->warn("DocumentTemplate #{$course->certificate_id} não encontrado. Frame salvo mas não vinculado.");
                return;
            }

            // 6. Atualiza (ou cria) versão do template com o frame_id e o HTML mascarado
            $latestVersion = $documentTemplate->latestVersion;
            if ($latestVersion) {
                $latestVersion->update([
                    'frame_id' => $frame->id,
                    'template' => $html,
                ]);
            } else {
                $documentTemplate->versions()->create([
                    'document_template_id' => $documentTemplate->id,
                    'frame_id'             => $frame->id,
                    'template'             => $html,
                ]);
            }

            $this->info("Frame #{$frame->id} e template HTML vinculados ao curso #{$courseId} (DocumentTemplate #{$documentTemplate->id}).");
        } catch (\Throwable $e) {
            $this->error('Erro ao salvar frame no S3: ' . $e->getMessage());
        }
    }

    /**
     * Extrai as imagens de fundo (base64) do HTML gerado.
     * Retorna array de arrays [data, mime, ext].
     */
    private function extractFrameImagesFromHtml(string $html): array
    {
        $frames = [];

        // Prioridade 1: img com class "bg" (layout buildEditableHtml)
        // Pegamos todas as ocorrências na ordem em que aparecem (Página 1, Página 2, etc.)
        preg_match_all('/<img\b[^>]*\bclass=["\'][^"\']*\bbg\b[^"\']*["\'][^>]*\bsrc=["\'](?P<src>data:image\/[^"\']+)["\'][^>]*>/i', $html, $bgMatches, PREG_SET_ORDER);
        
        foreach ($bgMatches as $m) {
            $dataUri = $m['src'];
            if (preg_match('/^data:(?P<mime>image\/[\w+.-]+);base64,(?P<data>.+)$/is', $dataUri, $parts)) {
                $mime = strtolower($parts['mime']);
                $binary = base64_decode($parts['data'], true);
                if ($binary !== false && $binary !== '') {
                    $ext = match ($mime) {
                        'image/jpeg'    => 'jpg',
                        'image/png'     => 'png',
                        'image/gif'     => 'gif',
                        'image/webp'    => 'webp',
                        'image/svg+xml' => 'svg',
                        default         => 'bin',
                    };
                    $frames[] = [
                        'data' => $binary,
                        'mime' => $mime,
                        'ext'  => $ext
                    ];
                }
            }
        }

        // Fallback se não achou nenhuma com class "bg"
        if (empty($frames)) {
            preg_match_all('/\bsrc=["\'](?P<src>data:image\/[^"\']+)["\']/', $html, $allMatches, PREG_SET_ORDER);
            
            $candidates = [];
            foreach ($allMatches as $m) {
                $candidates[] = $m['src'];
            }

            if (!empty($candidates)) {
                // Ordena por tamanho da URI (maiores imagens primeiro)
                usort($candidates, fn($a, $b) => strlen($b) <=> strlen($a));
                
                // Pega a maior (provavelmente o fundo)
                $dataUri = $candidates[0];
                if (preg_match('/^data:(?P<mime>image\/[\w+.-]+);base64,(?P<data>.+)$/is', $dataUri, $parts)) {
                    $mime = strtolower($parts['mime']);
                    $binary = base64_decode($parts['data'], true);
                    if ($binary) {
                         $ext = match ($mime) {
                            'image/jpeg'    => 'jpg',
                            'image/png'     => 'png',
                            default         => 'bin',
                        };
                        $frames[] = ['data' => $binary, 'mime' => $mime, 'ext' => $ext];
                    }
                }
            }
        }

        return $frames;
    }

    private function writeGenerationMeta(string $metaOutputPath, string $html, string $extension): void
    {
        $orientation = $this->normalizeOrientation((string) ($this->generationMeta['orientation'] ?? ''))
            ?? $this->detectOrientationFromHtml($html)
            ?? $this->detectOrientationFromDimensions();

        $payload = [
            'orientation' => $orientation ?? 'portrait',
            'mask_values' => $this->generationMeta['mask_values'] ?? [],
            'input_extension' => $extension,
        ];

        if (($this->meta['width_pt'] ?? null) && ($this->meta['height_pt'] ?? null)) {
            $payload['source_page'] = [
                'width_pt' => (float) $this->meta['width_pt'],
                'height_pt' => (float) $this->meta['height_pt'],
            ];
        }

        $dir = dirname($metaOutputPath);
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        file_put_contents(
            $metaOutputPath,
            json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT)
        );
    }

    private function parseClaudeMaskingResponse(string $response, array $allowedMaskList): array
    {
        $jsonText = $this->extractJsonPayload($response);
        if ($jsonText === null) {
            return [
                'html' => $response,
                'mask_values' => [],
                'orientation' => null,
            ];
        }

        $decoded = json_decode($jsonText, true);
        if (! is_array($decoded)) {
            return [
                'html' => $response,
                'mask_values' => [],
                'orientation' => null,
            ];
        }

        $html = is_string($decoded['html'] ?? null) ? (string) $decoded['html'] : $response;
        $orientation = $this->normalizeOrientation((string) ($decoded['orientation'] ?? ''));

        $maskValues = [];
        $decodedMaskValues = $decoded['mask_values'] ?? [];
        if (is_array($decodedMaskValues)) {
            foreach ($allowedMaskList as $mask) {
                $value = $decodedMaskValues[$mask] ?? null;
                if (! is_scalar($value)) {
                    continue;
                }

                $normalizedValue = trim((string) $value);
                if ($normalizedValue === '') {
                    continue;
                }

                if (preg_match('/\{\{[a-z_]+\}\}/i', $normalizedValue) === 1) {
                    continue;
                }

                $maskValues[$mask] = $normalizedValue;
            }
        }

        return [
            'html' => $html,
            'mask_values' => $maskValues,
            'orientation' => $orientation,
        ];
    }

    private function extractJsonPayload(string $response): ?string
    {
        $trimmed = trim($response);
        if ($trimmed === '') {
            return null;
        }

        // Se contiver blocos de código markdown, tenta focar nele primeiro
        if (preg_match('/```(?:json)?\s*(.*?)\s*```/is', $trimmed, $m) === 1) {
            $candidate = trim((string) ($m[1] ?? ''));
            if ($candidate !== '' && str_starts_with($candidate, '{') && str_ends_with($candidate, '}')) {
                return $candidate;
            }
        }

        $firstBrace = strpos($trimmed, '{');
        $lastBrace = strrpos($trimmed, '}');

        if ($firstBrace !== false && $lastBrace !== false && $lastBrace > $firstBrace) {
            $json = substr($trimmed, $firstBrace, $lastBrace - $firstBrace + 1);
            if (json_decode($json) !== null) {
                return $json;
            }
        }

        return null;
    }

    private function detectOrientationFromDimensions(): ?string
    {
        $widthPt = (float) ($this->meta['width_pt'] ?? 0);
        $heightPt = (float) ($this->meta['height_pt'] ?? 0);
        if ($widthPt > 0 && $heightPt > 0) {
            return $widthPt > $heightPt ? 'landscape' : 'portrait';
        }

        return null;
    }

    private function detectOrientationFromHtml(string $html): ?string
    {
        if (preg_match('/width\s*:\s*([\d.]+)px;\s*height\s*:\s*([\d.]+)px/i', $html, $matches) === 1) {
            $width = (float) $matches[1];
            $height = (float) $matches[2];
            if ($width > 0 && $height > 0) {
                return $width > $height ? 'landscape' : 'portrait';
            }
        }

        if (preg_match('/@page\s*\{\s*size\s*:\s*([\d.]+)mm\s+([\d.]+)mm/i', $html, $matches) === 1) {
            $width = (float) $matches[1];
            $height = (float) $matches[2];
            if ($width > 0 && $height > 0) {
                return $width > $height ? 'landscape' : 'portrait';
            }
        }

        if (str_contains(strtolower($html), 'size: a4 landscape')) {
            return 'landscape';
        }

        return null;
    }

    private function normalizeOrientation(string $orientation): ?string
    {
        $orientation = strtolower(trim($orientation));

        return match ($orientation) {
            'landscape', 'paisagem', 'horizontal' => 'landscape',
            'portrait', 'retrato', 'vertical' => 'portrait',
            default => null,
        };
    }
}