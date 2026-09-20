<?php

namespace App\Helpers;

use App\Enums\DocumentTemplateTypeEnum;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class ApplyMaskDocument {
    public static function apply($document, $template, $type = 'back'): string
    {
        if (empty($template->template)) {
            return '';
        }

        $templateDocument = $template->template;

        if ($type === 'back') {
            $templateDocument = $template->back_document;
        }

        $isImportedCourse = false;
        if (!empty($templateDocument) && (str_contains($templateDocument, 'page1-div') || str_contains($templateDocument, 'WordSection'))) {
            $isImportedCourse = true;
        }

        $studentName = HelperString::initialLettersUppercase(optional($document->employee)->name ?? '');
        if ($isImportedCourse && mb_strlen($studentName, 'UTF-8') > 30) {
            $studentName = HelperString::abbreviateName($studentName, 30);
        }
        
        $replacements = [
            '{{nome_aluno}}' => $studentName,
            '{nome_aluno}' => $studentName,
            '{{cpf_aluno}}' => HelperString::formatCpf(optional($document->employee)->cpf),
            '{cpf_aluno}' => HelperString::formatCpf(optional($document->employee)->cpf),
            '{{rg_aluno}}' => HelperString::formatRg(optional($document->employee)->rg),
            '{rg_aluno}' => HelperString::formatRg(optional($document->employee)->rg),
            '{{funcao_aluno}}' => optional($document->employee)->position ?? '',
            '{funcao_aluno}' => optional($document->employee)->position ?? '',
            '{{nome_empresa}}' => $document->company_name ?? '',
            '{nome_empresa}' => $document->company_name ?? '',
            '{{responsavel_empresarial}}' => $document->company_representative ?? '',
            '{responsavel_empresarial}' => $document->company_representative ?? '',
            '{{nome_curso}}' => optional($document->course)->name,
            '{nome_curso}' => optional($document->course)->name,
            '{{carga_horaria}}' => $document->number_of_hours_studied ? "{$document->number_of_hours_studied} horas" : '',
            '{carga_horaria}' => $document->number_of_hours_studied ? "{$document->number_of_hours_studied} horas" : '',
            '{{periodo_curso}}' => DateHelper::getCoursePeriod(json_decode(optional($document->presence_list)->course_period ?? '')),
            '{periodo_curso}' => DateHelper::getCoursePeriod(json_decode(optional($document->presence_list)->course_period ?? '')),
            '{{profissao}}' => optional($document->employee)->position,
            '{profissao}' => optional($document->employee)->position,
            '{{lista_de_alunos}}' => self::getEmployeesList(optional($document->presence_list)->documents),
            '{lista_de_alunos}' => self::getEmployeesList(optional($document->presence_list)->documents),
            '{{cidade_de_realizacao}}' => $document->city_name ?? '',
            '{cidade_de_realizacao}' => $document->city_name ?? '',
            '{{data_de_emissao}}' => DateHelper::getDateTheTextInFull($document->issue_date),
            '{data_de_emissao}' => DateHelper::getDateTheTextInFull($document->issue_date),
            '{{assinatura(s)_instrutores}}' => self::getSignatureList($document, $template),
            '{assinatura(s)_instrutores}' => self::getSignatureList($document, $template),
            '{{nome_instrutor}}' => self::getInstructorName($document?->presence_list?->instructors),
            '{nome_instrutor}' => self::getInstructorName($document?->presence_list?->instructors),
            '{{formacao_instrutor}}' => self::getInstructorFormation($document?->presence_list?->instructors),
            '{formacao_instrutor}' => self::getInstructorFormation($document?->presence_list?->instructors),
            '{{crea_instrutor}}' => self::getInstructorCrea($document?->presence_list?->instructors),
            '{crea_instrutor}' => self::getInstructorCrea($document?->presence_list?->instructors),
            '{{data_validade}}' => DateHelper::getDateTheTextInFull($document->date_end_validate),
            '{data_validade}' => DateHelper::getDateTheTextInFull($document->date_end_validate),
            '{{nome_do_instrutor}}' => self::getInstructorName($document?->presence_list?->instructors),
            '{nome_do_instrutor}' => self::getInstructorName($document?->presence_list?->instructors)
        ];

        $templateWithReplacements = self::replaceMasksPreservingAbsoluteCenter($templateDocument, $replacements);

        $qrCodeHtml = self::getQrcode($document->uuid);
        if (optional($document->course)->new_version) {
            $lastClosingDivPos = strrpos($templateWithReplacements, '</div>');
            if ($lastClosingDivPos !== false) {
                $templateWithReplacements = substr_replace($templateWithReplacements, $qrCodeHtml, $lastClosingDivPos, 0);
            } else {
                $templateWithReplacements .= $qrCodeHtml;
            }
            return $templateWithReplacements;
        }

        return $templateWithReplacements . $qrCodeHtml;
    }

    protected static function parseTopLevelBlocks(string $html): array
    {
        $tagPattern = '/<(?P<close>\/)?(?P<tag>p|div|span|td|th|li|h[1-6])\b(?P<attrs>[^>]*)>/is';
        if (preg_match_all($tagPattern, $html, $matches, PREG_OFFSET_CAPTURE) === false || empty($matches[0])) {
            return [];
        }

        $blocks = [];
        $stack = [];
        $count = count($matches[0]);

        for ($i = 0; $i < $count; $i++) {
            $isClose = ($matches['close'][$i][0] !== '');
            $tag = strtolower($matches['tag'][$i][0]);
            $attrs = $matches['attrs'][$i][0];
            $offset = $matches[0][$i][1];
            $length = strlen($matches[0][$i][0]);

            if (!$isClose) {
                // Opening tag
                $stack[] = [
                    'tag' => $tag,
                    'attrs' => $attrs,
                    'start_offset' => $offset,
                    'start_length' => $length,
                    'stack_depth' => count($stack),
                ];
            } else {
                // Closing tag
                if (empty($stack)) {
                    continue;
                }

                $matchIdx = -1;
                for ($j = count($stack) - 1; $j >= 0; $j--) {
                    if ($stack[$j]['tag'] === $tag) {
                        $matchIdx = $j;
                        break;
                    }
                }

                if ($matchIdx !== -1) {
                    $op = $stack[$matchIdx];
                    if ($op['stack_depth'] === 0) {
                        $fullEnd = $offset + $length;
                        $full = substr($html, $op['start_offset'], $fullEnd - $op['start_offset']);
                        $contentStart = $op['start_offset'] + $op['start_length'];
                        $content = substr($html, $contentStart, $offset - $contentStart);

                        $blocks[] = [
                            'tag' => $op['tag'],
                            'attrs' => $op['attrs'],
                            'content' => $content,
                            'full' => $full,
                            'start' => $op['start_offset'],
                            'end' => $fullEnd,
                        ];
                    }
                    array_splice($stack, $matchIdx);
                }
            }
        }

        return $blocks;
    }

    protected static function replaceMasksPreservingAbsoluteCenter(string $templateDocument, array $replacements): string
    {
        $replacementValues = array_map(static fn($value): string => (string) ($value ?? ''), $replacements);
        $replaced = str_replace(array_keys($replacements), $replacementValues, $templateDocument);

        $originalBlocks = self::parseTopLevelBlocks($templateDocument);
        $maskPattern = '/\{{1,2}[a-z_]+\}{1,2}/i';
        $fontSizes = self::extractCssClassFontSizes($templateDocument);
        $pageWidth = self::extractPrimaryPageWidth($templateDocument);

        $originalByTagAndIndex = [];
        $originalTagIndex = [];

        foreach ($originalBlocks as $block) {
            $tag = $block['tag'];
            $index = $originalTagIndex[$tag] ?? 0;
            $originalTagIndex[$tag] = $index + 1;

            $content = $block['content'];
            if (preg_match($maskPattern, $content) !== 1) {
                continue;
            }

            $meta = self::extractAbsolutePositionMeta($block['attrs'], $content, $fontSizes);
            if ($meta === null) {
                continue;
            }

            $originalByTagAndIndex[$tag][$index] = $meta;
        }

        if ($originalByTagAndIndex === []) {
            return $replaced;
        }

        $replacedBlocks = self::parseTopLevelBlocks($replaced);
        if (count($replacedBlocks) !== count($originalBlocks)) {
            return $replaced;
        }

        $result = '';
        $lastOffset = 0;
        $replacedTagIndex = [];

        foreach ($replacedBlocks as $i => $blockMatch) {
            $originalBlock = $originalBlocks[$i];
            
            $result .= substr($replaced, $lastOffset, $blockMatch['start'] - $lastOffset);
            $lastOffset = $blockMatch['end'];

            $tag = $blockMatch['tag'];
            $attrs = $blockMatch['attrs'];
            $content = $blockMatch['content'];

            $index = $replacedTagIndex[$tag] ?? 0;
            $replacedTagIndex[$tag] = $index + 1;

            if (!isset($originalByTagAndIndex[$tag][$index])) {
                $result .= $blockMatch['full'];
                continue;
            }

            $originalMeta = $originalByTagAndIndex[$tag][$index];
            $replacedMeta = self::extractAbsolutePositionMeta($attrs, $content, $fontSizes);
            if ($replacedMeta === null) {
                $result .= $blockMatch['full'];
                continue;
            }

            // If the block is visually centered on the page, make child centering explicit
            // and keep parent easier to edit (no left fine tuning).
            if (self::isVisuallyCentered($originalMeta, $pageWidth)) {
                $updatedAttrs = self::normalizeParentForChildCentering($attrs);
                $wrappedContent = self::wrapChildCentered($content, $attrs);
                $result .= '<' . $originalBlock['tag'] . $updatedAttrs . '>' . $wrappedContent . '</' . $originalBlock['tag'] . '>';
                continue;
            }

            $delta = ($originalMeta['width'] - $replacedMeta['width']) / 2;
            if (abs($delta) < 4) {
                $result .= $blockMatch['full'];
                continue;
            }

            $newLeft = $replacedMeta['left'] + $delta;
            $updatedAttrs = self::replaceLeftInStyle($attrs, $newLeft);

            $result .= '<' . $originalBlock['tag'] . $updatedAttrs . '>' . $content . '</' . $originalBlock['tag'] . '>';
        }

        $result .= substr($replaced, $lastOffset);

        return $result;
    }

    protected static function extractCssClassFontSizes(string $html): array
    {
        $fontSizes = [];
        preg_match_all('/\.([a-zA-Z0-9_-]+)\s*\{[^}]*font-size\s*:\s*([0-9]+(?:\.[0-9]+)?)px/i', $html, $matches, PREG_SET_ORDER);

        foreach ($matches as $match) {
            $fontSizes[$match[1]] = (float) $match[2];
        }

        return $fontSizes;
    }

    protected static function extractPrimaryPageWidth(string $html): float
    {
        if (preg_match('/<div[^>]*id="page\d+-div"[^>]*style="[^"]*width\s*:\s*([0-9]+(?:\.[0-9]+)?)px/i', $html, $match) === 1) {
            return (float) $match[1];
        }

        return 1200.0;
    }

    protected static function extractAbsolutePositionMeta(string $attrs, string $content, array $fontSizes): ?array
    {
        if (preg_match('/\bstyle\s*=\s*(["\'])(.*?)\1/i', $attrs, $styleMatch) !== 1) {
            return null;
        }

        $style = $styleMatch[2] ?? '';
        if (preg_match('/position\s*:\s*absolute/i', $style) !== 1) {
            return null;
        }

        if (preg_match('/\bleft\s*:\s*([-+]?[0-9]*\.?[0-9]+)px/i', $style, $leftMatch) !== 1) {
            return null;
        }

        $fontSize = 20.0;
        if (preg_match('/font-size\s*:\s*([0-9]+(?:\.[0-9]+)?)px/i', $style, $fontMatch) === 1) {
            $fontSize = (float) $fontMatch[1];
        } elseif (preg_match('/\bclass\s*=\s*(["\'])(.*?)\1/i', $attrs, $classMatch) === 1) {
            $classes = preg_split('/\s+/', trim($classMatch[2] ?? '')) ?: [];
            foreach ($classes as $class) {
                if (isset($fontSizes[$class])) {
                    $fontSize = (float) $fontSizes[$class];
                    break;
                }
            }
        }

        $text = html_entity_decode(strip_tags($content), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/\s+/u', ' ', trim($text));
        if (!is_string($text) || $text === '') {
            return null;
        }

        return [
            'left' => (float) $leftMatch[1],
            'width' => self::estimateTextWidthPx($text, $fontSize),
        ];
    }

    protected static function estimateTextWidthPx(string $text, float $fontSize): float
    {
        $chars = preg_split('//u', $text, -1, PREG_SPLIT_NO_EMPTY) ?: [];
        $units = 0.0;

        foreach ($chars as $char) {
            if (preg_match('/\s/u', $char) === 1) {
                $units += 0.33;
                continue;
            }

            if (preg_match('/[A-Z0-9ÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ]/u', $char) === 1) {
                $units += 0.62;
                continue;
            }

            if (preg_match('/[.,;:\'\"`´]/u', $char) === 1) {
                $units += 0.28;
                continue;
            }

            if (preg_match('/[{}]/u', $char) === 1) {
                $units += 0.40;
                continue;
            }

            $units += 0.56;
        }

        return $units * $fontSize;
    }

    protected static function replaceLeftInStyle(string $attrs, float $left): string
    {
        if (preg_match('/\bstyle\s*=\s*(["\'])(.*?)\1/i', $attrs, $styleMatch) !== 1) {
            return $attrs;
        }

        $quote = $styleMatch[1];
        $style = $styleMatch[2] ?? '';
        $leftValue = rtrim(rtrim(number_format($left, 2, '.', ''), '0'), '.');
        if ($leftValue === '') {
            $leftValue = '0';
        }

        if (preg_match('/\bleft\s*:\s*[-+]?[0-9]*\.?[0-9]+px/i', $style) === 1) {
            $style = (string) preg_replace('/\bleft\s*:\s*[-+]?[0-9]*\.?[0-9]+px/i', 'left:' . $leftValue . 'px', $style, 1);
        } else {
            $style = rtrim($style);
            if ($style !== '' && !str_ends_with($style, ';')) {
                $style .= ';';
            }
            $style .= 'left:' . $leftValue . 'px;';
        }

        return (string) preg_replace('/\bstyle\s*=\s*(["\'])(.*?)\1/i', 'style=' . $quote . $style . $quote, $attrs, 1);
    }

    protected static function isVisuallyCentered(array $meta, float $pageWidth): bool
    {
        if ($pageWidth <= 0) {
            return false;
        }

        $elementCenter = $meta['left'] + ($meta['width'] / 2);
        $pageCenter = $pageWidth / 2;
        $threshold = $pageWidth * 0.08; // 8% tolerance

        return abs($elementCenter - $pageCenter) <= $threshold;
    }

    protected static function normalizeParentForChildCentering(string $attrs): string
    {
        if (preg_match('/\bstyle\s*=\s*(["\'])(.*?)\1/i', $attrs, $styleMatch) !== 1) {
            return rtrim($attrs) . ' style="position:absolute;left:0;width:100%;text-align:center;"';
        }

        $quote = $styleMatch[1];
        $style = $styleMatch[2] ?? '';

        // Remove parent tweaks that make editing harder.
        $style = (string) preg_replace('/\bleft\s*:\s*[-+]?[0-9]*\.?[0-9]+px\s*;?/i', '', $style);
        $style = (string) preg_replace('/\bwidth\s*:\s*[-+]?[0-9]*\.?[0-9]+%\s*;?/i', '', $style);
        $style = (string) preg_replace('/\btext-align\s*:\s*[^;]+\s*;?/i', '', $style);
        $style = (string) preg_replace('/\bwhite-space\s*:\s*nowrap\s*;?/i', '', $style);

        $style = trim($style);
        if ($style !== '' && !str_ends_with($style, ';')) {
            $style .= ';';
        }
        $style .= 'left:0;width:100%;text-align:center;';

        return (string) preg_replace('/\bstyle\s*=\s*(["\'])(.*?)\1/i', 'style=' . $quote . $style . $quote, $attrs, 1);
    }

    protected static function wrapChildCentered(string $content, string $parentAttrs = ''): string
    {
        if (preg_match('/<span\b[^>]*data-center-child="1"/i', $content) === 1) {
            return $content;
        }

        $extraStyles = '';
        if ($parentAttrs !== '' && preg_match('/\bstyle\s*=\s*(["\'])(.*?)\1/i', $parentAttrs, $styleMatch) === 1) {
            $parentStyle = $styleMatch[2] ?? '';
            $properties = ['font-weight', 'font-family', 'font-size', 'color', 'font-style', 'text-decoration', 'line-height'];
            foreach ($properties as $prop) {
                if (preg_match('/\b' . $prop . '\s*:\s*([^;]+)/i', $parentStyle, $propMatch) === 1) {
                    $val = trim($propMatch[1]);
                    $extraStyles .= $prop . ':' . $val . ';';
                }
            }
        }

        return '<span data-center-child="1" style="display:inline-block;text-align:center;' . $extraStyles . '">' . $content . '</span>';
    }

    public static function getEmployeesList($documents): string
    {
        if (empty($documents)) {
            return '';
        }

        $employeeList = "<ol>";
        foreach ($documents as $document) {
            $employeeList .= "<li>" . optional(optional($document)->employee)->name . "</li>";
        }
        return $employeeList . "</ol>";
    }

    public static function getSignatureList($document, $template)
    {   
        $signatures = [];

        if ($document->have_employee_signature && (int) $template->type_id === DocumentTemplateTypeEnum::CERTIFICATE->value) {
            $signatures[] = [
                'signature' => null,
                'stamp' => null,
                'name' => null
            ];
        }
        
        $instructors = optional(optional($document)->presence_list)->instructors ?? [];
        foreach ($instructors as $instructor) {
            $instructor->setAppends(['signature_base64', 'stamp_base64']);

            $signatures[] = [
                'signature' => $instructor->signature_base64 ?? $instructor->signature,
                'stamp' => $instructor->stamp_base64 ?? $instructor->stamp,
                'name' => $instructor->name
            ];
        }   

        return view('document-template.signatures', [
            'signatures' => $signatures
        ])->render();
    }

    private static function getCityAndState($presenceList): string
    {
        $city = optional(optional($presenceList)->city)->nome;
        $state = optional(optional(optional($presenceList)->city)->state)->nome;

        if (!$city && !$state) {
            return '';
        }

        return "{$city} - {$state}";
    }

    public static function getQrcode($uuid)
    {
        $appUrl = env('APP_URL') . "/document-validate/";
        $qrCode = QrCode::format('png')->size(100)->generate($appUrl . $uuid);
        $base64Image = 'data:image/png;base64,' . base64_encode($qrCode);

        return '
        <div style="
            position: absolute;
            bottom: 30px;
            left: 30px;
            width: 65px;
            height: 65px;
            z-index: 10;
            padding: 5px;
            background: white;
        ">
            <img src="' . $base64Image . '" alt="QR Code" style="width: 100%; height: auto;" />
        </div>';
    }

    public static function getContentCourse($contentCourse, $orientation)
    {
        $heightPx = $orientation === 'portrait' ? 350 : 270;
        $containerWidthPx = $orientation === 'portrait' ? 550 : 520;

        // Valores pré-calculados
        $lineHeights = [14 => 18.2, 12 => 15.6, 10 => 13, 9 => 11.7];
        $columnWidths = [
            1 => $containerWidthPx,
            2 => ($containerWidthPx - 30) / 2,
            3 => ($containerWidthPx - 60) / 3,
            4 => ($containerWidthPx - 90) / 4,
        ];
        $fontSizes = [1 => 14, 2 => 12, 3 => 10, 4 => 9];

        // Função rápida para estimar linhas
        $estimateLines = static function($text, $columnWidth, $fontSize) {
            $charsPerLine = (int)($columnWidth / ($fontSize * 0.6));
            $cleanText = strip_tags($text);
            $textLength = strlen($cleanText);
            $estimatedLines = (int)ceil($textLength / max($charsPerLine, 1));
            $lineBreaks = preg_match_all('/<br\s*\/?>|<\/p>|<\/li>|<\/ul>/i', $text);
            return $estimatedLines + $lineBreaks;
        };

        // Pega apenas os <li> internos
        preg_match_all('/<li>(.*?)<\/li>/is', $contentCourse, $listItems);
        $listItemsText = $listItems[1];
        // Remove todos os <li>...</li> do conteúdo (de uma vez)
        $contentWithoutLists = preg_replace('/<li>.*?<\/li>/is', '', $contentCourse);

        // Busca a melhor configuração de coluna/fonte
        foreach ([4, 3, 2, 1] as $col) {
            $columnWidth = $columnWidths[$col];
            $fontSize = $fontSizes[$col];
            $lineHeightPx = $lineHeights[$fontSize];
            $maxLines = $col * floor($heightPx / $lineHeightPx);

            // Estima linhas para todos os <li> e o resto do conteúdo
            $totalLines = 0;
            if (!empty($listItemsText)) {
                foreach ($listItemsText as $item) {
                    $totalLines += $estimateLines($item, $columnWidth, $fontSize);
                }
            }
            if (trim($contentWithoutLists) !== '') {
                $totalLines += $estimateLines($contentWithoutLists, $columnWidth, $fontSize);
            }

            if ($totalLines > $maxLines) {
                // Se exceder, passa para o próximo (mais colunas, menor fonte)
                continue;
            } else {
                // Achou a configuração ideal
                $columnCount = $col;
                break;
            }
        }
        // Se não achou nenhuma que caiba, usa a máxima (4 colunas)
        if (!isset($columnCount)) {
            $columnCount = 4;
            $fontSize = 9;
        } else {
            $fontSize = $fontSizes[$columnCount];
        }

        $content = '
            <div style="
                position: relative;
                height: ' . $heightPx . 'px;
                width: 100%;
                column-count: ' . $columnCount . ';
                column-gap: 30px;
                font-size: ' . $fontSize . 'px;
                line-height: 1.3;
                overflow: hidden;
                text-align: justify;
                " data-mask-key="conteudo_programatico" contenteditable="false">
                ' . $contentCourse . '
            </div>';
       
        return $content ;
    }

    protected static function extractListItems(string $content): array
    {
        preg_match_all('/<li>(.*?)<\/li>/is', $content, $matches);
        return $matches[1] ?? [];
    }

    protected static function removeListItems(string $content, array $listItems): string
    {
        return str_replace($listItems, '', $content);
    }

    protected static function estimateLines(string $text, int $columnWidth, int $fontSize): int
    {
        $charsPerLine = floor($columnWidth / ($fontSize * 0.6));
        $cleanText = strip_tags($text);
        $textLength = strlen($cleanText);
        $estimatedLinesFromText = ceil($textLength / $charsPerLine);
        $lineBreaks = preg_match_all('/<br\s*\/?>|<\/p>|<\/li>|<\/ul>/i', $text);
        return $estimatedLinesFromText + $lineBreaks;
    }

    protected static function determineLayout(string $contentCourse, array $layouts, array $listItemsText, string $contentWithoutLists, int $heightPx): array
    {
        $bestLayout = $layouts[0]; // Padrão para 1 coluna

        // Itera sobre as configurações de layout do mais "denso" (4 colunas) para o mais "espaçado" (1 coluna).
        foreach (array_reverse($layouts) as $layout) {
            $totalLines = 0;
            
            foreach ($listItemsText as $item) {
                $totalLines += self::estimateLines($item, $layout['width'], $layout['font']);
            }
            $totalLines += self::estimateLines($contentWithoutLists, $layout['width'], $layout['font']);

            $maxLines = $layout['cols'] * floor($heightPx / $layout['lineHeight']);

            // Se o conteúdo couber no layout atual, ele é o melhor possível para o espaço.
            if ($totalLines <= $maxLines) {
                $bestLayout = $layout;
                // Encontrou o melhor layout que cabe, pode parar.
                break;
            }
        }
        
        return $bestLayout;
    }

    protected static function getInstructorName($instructors)
    {
        if (!$instructors || !count($instructors)) {
            return '';
        }

        if (count($instructors) == 1) {
            return $instructors[0]->name;
        }

        $instructorsName = '';
        $totalInstructors = count($instructors);

        foreach ($instructors as $key => $instructor) {
            if (($key + 1) === $totalInstructors) {
                $instructorsName = "$instructorsName e {$instructor->name}";
            } else {
                $instructorsName = "$instructorsName, {$instructor->name}";
            }
        }
        return $instructorsName;
    }

    protected static function getInstructorFormation($instructors): string
    {
        if (!$instructors || !count($instructors)) {
            return '';
        }

        if (count($instructors) === 1) {
            return $instructors[0]->formation ?? '';
        }

        return collect($instructors)
            ->pluck('formation')
            ->filter()
            ->unique()
            ->values()
            ->join(', ');
    }

    protected static function getInstructorCrea($instructors): string
    {
        if (!$instructors || !count($instructors)) {
            return '';
        }

        if (count($instructors) === 1) {
            return $instructors[0]->crea ?? '';
        }

        return collect($instructors)
            ->pluck('crea')
            ->filter()
            ->unique()
            ->values()
            ->join(', ');
    }
}