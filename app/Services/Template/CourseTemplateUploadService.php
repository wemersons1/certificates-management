<?php

namespace App\Services\Template;

use App\Enums\DocumentTemplateTypeEnum;
use App\Models\Course;
use App\Models\DocumentTemplate;
use App\Models\DocumentTemplateFrame;
use App\Models\Instructor;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Symfony\Component\Console\Exception\InvalidOptionException;

class CourseTemplateUploadService
{
    public function handle(UploadedFile $uploadedFile, ?int $courseId = null): array
    {
        $tmpDir = storage_path('app/tmp/course-template-import/' . (string) Str::uuid());
        if (! is_dir($tmpDir)) {
            mkdir($tmpDir, 0755, true);
        }

        $extension = strtolower((string) $uploadedFile->getClientOriginalExtension());
        $inputPath = $tmpDir . '/source.' . $extension;
        $outputPath = $tmpDir . '/generated-template.html';
        $metaOutputPath = $tmpDir . '/generated-template.meta.json';

        try {
            $uploadedFile->move($tmpDir, basename($inputPath));
            $normalizedInputPath = $this->normalizeInputForCommand($inputPath, $extension, $tmpDir);

            // Call standard generation command (which does heavy conversion and triggers mocks in tests)
            $exitCode = $this->callGenerateCertificateHtml($normalizedInputPath, $outputPath, $metaOutputPath);

            if ($exitCode !== 0 || ! is_file($outputPath)) {
                throw new RuntimeException('Nao foi possivel gerar o HTML do certificado a partir do arquivo enviado.');
            }

            // Extract front and back page frames as a high-fidelity print, but filtering out all text elements
            $frontFrameSrc = null;
            $backFrameSrc = null;

            $pdfPath = null;
            if ($extension === 'pdf') {
                $pdfPath = $normalizedInputPath;
            } else {
                shell_exec('soffice --headless --convert-to pdf --outdir ' . escapeshellarg($tmpDir) . ' ' . escapeshellarg($normalizedInputPath) . ' 2>/dev/null');
                $pdfCandidates = glob($tmpDir . '/*.pdf') ?: [];
                if ($pdfCandidates !== []) {
                    $pdfPath = reset($pdfCandidates);
                }
            }

            if ($pdfPath && is_file($pdfPath)) {
                $noTextPdf = $tmpDir . '/no_text.pdf';
                
                // 1. Em ambiente local pula o Playwright (timeout de 15s) e vai direto ao Ghostscript.
                // Em produção tenta o Playwright primeiro para remoção de textos de alta qualidade.
                $success = false;
                if (!app()->environment('local')) {
                    try {
                        $originalHtml = is_file($outputPath) ? file_get_contents($outputPath) : null;
                        if ($originalHtml) {
                            // Determine if it is a multi-page document to prevent empty trailing pages in Playwright rendering
                            $isMultiPage = false;
                            preg_match_all('/<div[^>]*id="page\d+-div"/i', $originalHtml, $matchesDiv);
                            if (count($matchesDiv[0] ?? []) > 1) {
                                $isMultiPage = true;
                            }
                            preg_match_all('/class="[^"]*WordSection/i', $originalHtml, $matchesWs);
                            if (count($matchesWs[0] ?? []) > 1) {
                                $isMultiPage = true;
                            }
                            preg_match_all('/class="[^"]*cert[^"]*"/i', $originalHtml, $matchesCert);
                            if (count($matchesCert[0] ?? []) > 1) {
                                $isMultiPage = true;
                            }

                            $htmlBodyStyles = $isMultiPage 
                                ? "    height: auto !important;\n    min-height: 100% !important;\n    overflow: visible !important;\n"
                                : "    height: 100% !important;\n    max-height: 100% !important;\n    overflow: hidden !important;\n";

                            $style = "\n<style>\n" .
                                "html, body {\n" .
                                $htmlBodyStyles .
                                "}\n" .
                                "* {\n" .
                                "    color: transparent !important;\n" .
                                "    text-shadow: none !important;\n" .
                                "    -webkit-text-stroke: 0px !important;\n" .
                                "}\n" .
                                "svg text, svg tspan {\n" .
                                "    fill: transparent !important;\n" .
                                "    stroke: transparent !important;\n" .
                                "}\n" .
                                "input, textarea, select {\n" .
                                "    color: transparent !important;\n" .
                                "    border-color: transparent !important;\n" .
                                "    background-color: transparent !important;\n" .
                                "}\n" .
                                "/* Force page breaks in screen and print layouts */\n" .
                                "div[id$=\"-div\"] {\n" .
                                "    page-break-inside: avoid !important;\n" .
                                "    break-inside: avoid !important;\n" .
                                "}\n" .
                                "div[id$=\"-div\"]:not(:last-of-type) {\n" .
                                "    page-break-after: always !important;\n" .
                                "    break-after: page !important;\n" .
                                "}\n" .
                                "div[class^=\"WordSection\"] {\n" .
                                "    page-break-inside: avoid !important;\n" .
                                "    break-inside: avoid !important;\n" .
                                "}\n" .
                                "div[class^=\"WordSection\"]:not(:last-of-type) {\n" .
                                "    page-break-after: always !important;\n" .
                                "    break-after: page !important;\n" .
                                "}\n" .
                                ".cert {\n" .
                                "    page-break-inside: avoid !important;\n" .
                                "    break-inside: avoid !important;\n" .
                                "}\n" .
                                ".cert:not(:last-child) {\n" .
                                "    page-break-after: always !important;\n" .
                                "    break-after: page !important;\n" .
                                "}\n" .
                                "/* Force all images inside page containers to be 100% width and height */\n" .
                                "div[id$=\"-div\"] img, div[class^=\"WordSection\"] img, .cert img {\n" .
                                "    width: 100% !important;\n" .
                                "    height: 100% !important;\n" .
                                "    max-width: 100% !important;\n" .
                                "    max-height: 100% !important;\n" .
                                "    object-fit: fill !important;\n" .
                                "}\n" .
                                "</style>\n";

                            $cleanHtml = str_ireplace('</head>', $style . '</head>', $originalHtml);
                            if ($cleanHtml === $originalHtml) {
                                $cleanHtml .= $style;
                            }

                            $client = new \GuzzleHttp\Client();
                            $response = $client->post('http://renderer:3000/render-pdf', [
                                'json' => ['html' => $cleanHtml],
                                'timeout' => 15,
                            ]);

                            $responseData = json_decode($response->getBody()->getContents(), true);
                            if (isset($responseData['base64'])) {
                                $pdfData = base64_decode($responseData['base64']);
                                file_put_contents($noTextPdf, $pdfData);
                                $success = true;
                            }
                        }
                    } catch (\Throwable $e) {
                        \Illuminate\Support\Facades\Log::warning('[CourseTemplateUploadService] Erro ao remover textos via Playwright: ' . $e->getMessage());
                    }
                } else {
                    \Illuminate\Support\Facades\Log::info('[CourseTemplateUploadService] Ambiente local: pulando Playwright, usando Ghostscript diretamente.');
                }

                // 2. Fallback: Se o Playwright falhar/não estiver disponível ou for ambiente local, tenta o Ghostscript
                if (! $success) {
                    shell_exec('gs -o ' . escapeshellarg($noTextPdf) . ' -sDEVICE=pdfwrite -dFILTERTEXT ' . escapeshellarg($pdfPath) . ' 2>/dev/null');
                }
                
                $renderPdf = is_file($noTextPdf) ? $noTextPdf : $pdfPath;

                // Render page prints/rasterizations at 150 DPI
                shell_exec('pdftoppm -jpeg -r 150 ' . escapeshellarg($renderPdf) . ' ' . escapeshellarg($tmpDir . '/page') . ' 2>/dev/null');
                $pages = glob($tmpDir . '/page-*.jpg') ?: [];
                sort($pages);
                
                if ($pages !== []) {
                    $frontFrameSrc = 'data:image/jpeg;base64,' . base64_encode(file_get_contents($pages[0]));
                    if (count($pages) > 1) {
                        $backFrameSrc = 'data:image/jpeg;base64,' . base64_encode(file_get_contents($pages[1]));
                    }
                }
            }

            $generationMeta = $this->loadGenerationMeta($metaOutputPath);
            $maskValues = (array) data_get($generationMeta, 'mask_values', []);

            // 1. Instancia o GeminiService e faz a extração de metadados a partir do HTML original
            $extractedData = [];
            try {
                $originalHtml = is_file($outputPath) ? file_get_contents($outputPath) : null;
                if ($originalHtml && !app()->environment('local')) {
                    $geminiService = app(\App\Services\Gemini\GeminiService::class);
                    $prompt = "Você é um assistente especializado em extração de metadados de certificados de cursos.\n" .
                        "Analise o conteúdo HTML do certificado fornecido e extraia as seguintes informações de forma precisa.\n" .
                        "Retorne estritamente um objeto JSON com os seguintes campos (caso algum campo não seja encontrado ou não exista no texto, retorne o valor como null):\n" .
                        "- nome_curso: O nome do curso principal (ex: NOÇÕES BÁSICAS DE INCÊNDIO - NR-23).\n" .
                        "- carga_horaria: A carga horária total do curso como um número inteiro ou string numérica (ex: 4 ou '04').\n" .
                        "- nome_instrutor: O nome completo do instrutor que ministra ou assina o curso.\n" .
                        "- formacao_instrutor: A formação profissional do instrutor (ex: Engenheiro, Técnico de Segurança, etc.).\n" .
                        "- crea_instrutor: O número do registro do CREA ou outro conselho profissional do instrutor, se houver.\n\n" .
                        "ATENÇÃO: Retorne APENAS o objeto JSON válido, sem tags markdown, sem blocos ```json e sem explicações adicionais.";

                    $rawJson = $geminiService->interpret($prompt, $originalHtml);
                    $cleanJsonText = trim($rawJson);
                    if (preg_match('/^```json\s*(.*?)\s*```$/s', $cleanJsonText, $m)) {
                        $cleanJsonText = $m[1];
                    } elseif (preg_match('/^```\s*(.*?)\s*```$/s', $cleanJsonText, $m)) {
                        $cleanJsonText = $m[1];
                    }

                    $decoded = json_decode(trim($cleanJsonText), true);
                    if (is_array($decoded)) {
                        $extractedData = $decoded;
                    }
                } elseif ($originalHtml) {
                    \Illuminate\Support\Facades\Log::info('[Gemini Import Extraction] Ignorando extração de metadados via Gemini em ambiente local.');
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error('[Gemini Import Extraction] Falha ao extrair metadados via Gemini: ' . $e->getMessage());
            }

            // 2. Resolve e enriquece o nome do curso priorizando a extração do Gemini
            $extractedCourseName = trim((string) ($extractedData['nome_curso'] ?? ''));
            if ($extractedCourseName !== '' && strtolower($extractedCourseName) !== 'null') {
                $courseName = $extractedCourseName;
            } else {
                $courseName = $this->resolveCourseName($maskValues, $uploadedFile);
            }

            // 3. Resolve as horas do curso priorizando a extração do Gemini
            $extractedHours = trim((string) ($extractedData['carga_horaria'] ?? ''));
            if ($extractedHours !== '' && strtolower($extractedHours) !== 'null') {
                $hours = $this->extractHoursFromMaskValue($extractedHours);
            } else {
                $hours = $this->extractHoursFromMaskValue((string) ($maskValues['{{carga_horaria}}'] ?? '0'));
            }

            $orientation = $this->resolveOrientation($generationMeta, '');
            $modality = $this->extractModalityFromFilename($uploadedFile->getClientOriginalName());
            $courseCity = trim((string) ($maskValues['{{cidade_de_realizacao}}'] ?? ''));
            $courseName = $this->enrichCourseNameWithSignals($courseName, $modality, $courseCity);

            // 4. Popula maskValues com os dados do instrutor extraídos do Gemini para upsert
            $extractedInstrutor = trim((string) ($extractedData['nome_instrutor'] ?? ''));
            if ($extractedInstrutor !== '' && strtolower($extractedInstrutor) !== 'null') {
                $maskValues['{{nome_instrutor}}'] = $extractedInstrutor;
            }
            $extractedFormacao = trim((string) ($extractedData['formacao_instrutor'] ?? ''));
            if ($extractedFormacao !== '' && strtolower($extractedFormacao) !== 'null') {
                $maskValues['{{formacao_instrutor}}'] = $extractedFormacao;
            }
            $extractedCrea = trim((string) ($extractedData['crea_instrutor'] ?? ''));
            if ($extractedCrea !== '' && strtolower($extractedCrea) !== 'null') {
                $maskValues['{{crea_instrutor}}'] = $extractedCrea;
            }

            // Clean, visual editor compatible template base layout
            $frontTemplate = '<div class="cert-container" style="position: relative; width: 100%; height: 100%;"></div>';
            $backTemplate = $backFrameSrc ? '<div class="cert-container" style="position: relative; width: 100%; height: 100%;"></div>' : null;

            $usedMasks = $this->collectUsedMasks($frontTemplate . "\n" . ($backTemplate ?? ''));
            $entityId = $this->resolveEntityId();
            
            $frame = $this->resolveFrameForTemplates($frontFrameSrc, $backFrameSrc);
   
            $documentTemplate = null;
            $course = null;
            $existingCourse = null;
            if ($courseId) {
                $existingCourse = Course::query()->myScope()->where('entity_id', $entityId)->find($courseId);
            }
            if (! $existingCourse) {
                $existingCourse = $this->findExistingCourseByName($courseName, $entityId);
            }
            $wasUpdated = false;

            $versionPayload = [
                'template' => $frontTemplate,
                'back_document' => $backTemplate,
                'orientation' => $orientation,
                'frame_color' => $frame ? null : '#29638d',
                'type_id' => DocumentTemplateTypeEnum::CERTIFICATE->value,
                'frame_type' => $frame ? 'custom' : 'color',
                'frame_id' => $frame?->id,
            ];

            $targetVersion = null;
            try {
                DB::transaction(function () use (&$documentTemplate, &$course, &$wasUpdated, &$targetVersion, $existingCourse, $courseName, $orientation, $frontTemplate, $backTemplate, $hours, $frame, $entityId, $versionPayload): void {
           
                    if ($existingCourse) {
                        $course = $existingCourse->fresh(['certificateTemplate.latestVersion.type']);
                        $wasUpdated = true;

                        if (! $course) {
                            throw new RuntimeException('Nao foi possivel carregar o curso existente para atualizacao.');
                        }

                        $courseUpdates = [];
                        if ((string) ($course->number_of_hours_studied ?? '') !== (string) $hours) {
                            $courseUpdates['number_of_hours_studied'] = (string) $hours;
                        }
                        if ($course->name !== $courseName) {
                            $courseUpdates['name'] = $courseName;
                        }

                        if ($courseUpdates !== []) {
                            $course->update($courseUpdates);
                        }

                        $documentTemplate = $course->certificateTemplate;

                        if (! $documentTemplate) {
                            $documentTemplate = DocumentTemplate::where('name', $courseName)
                                ->where('entity_id', $entityId)
                                ->first();
                            if (! $documentTemplate) {
                                $documentTemplate = DocumentTemplate::create([
                                    'name' => $courseName,
                                    'entity_id' => $entityId,
                                ]);
                                $targetVersion = $documentTemplate->versions()->create($versionPayload);
                            } else {
                                $targetVersion = $documentTemplate->latestVersion;
                            }
                            $course->update(['certificate_id' => $documentTemplate->id]);
                        } else {
                            if ((string) ($documentTemplate->name ?? '') !== $courseName) {
                                $documentTemplate->update(['name' => $courseName]);
                            }

                            $latestVersion = $documentTemplate->latestVersion;

                            if (! $latestVersion) {
                                $targetVersion = $documentTemplate->versions()->create($versionPayload);
                            } else {
                                $versionUpdates = [];
                                foreach ($versionPayload as $field => $value) {
                                    $currentValue = $latestVersion->{$field} ?? null;
                                    if ((string) ($currentValue ?? '') !== (string) ($value ?? '')) {
                                        $versionUpdates[$field] = $value;
                                    }
                                }

                                if ($versionUpdates !== []) {
                                    $latestVersion->update($versionUpdates);
                                }
                                $targetVersion = $latestVersion;
                            }
                        }
                    } else {
                        $documentTemplate = DocumentTemplate::create([
                            'name' => $courseName,
                            'entity_id' => $entityId,
                        ]);

                        $targetVersion = $documentTemplate->versions()->create($versionPayload);

                        $course = Course::create([
                            'name' => $courseName,
                            'number_of_hours_studied' => (string) $hours,
                            'entity_id' => $entityId,
                            'certificate_id' => $documentTemplate->id,
                        ]);
                    }
                });
            } catch (\Illuminate\Database\UniqueConstraintViolationException $e) {
                $courseName = $courseName . ' 1.2';
                
                DB::transaction(function () use (&$documentTemplate, &$course, &$wasUpdated, &$targetVersion, $courseName, $orientation, $frontTemplate, $backTemplate, $hours, $frame, $entityId, $versionPayload): void {
                    $existingCourse = $this->findExistingCourseByName($courseName, $entityId);

                    if ($existingCourse) {
                        $course = $existingCourse->fresh(['certificateTemplate.latestVersion.type']);
                        $wasUpdated = true;
                        $documentTemplate = $course->certificateTemplate;
                        
                        if ($documentTemplate) {
                            $latestVersion = $documentTemplate->latestVersion;
                            if ($latestVersion) {
                                $latestVersion->update($versionPayload);
                                $targetVersion = $latestVersion;
                            } else {
                                $targetVersion = $documentTemplate->versions()->create($versionPayload);
                            }
                        }
                    } else {
                        $documentTemplate = DocumentTemplate::create([
                            'name' => $courseName,
                            'entity_id' => $entityId,
                        ]);

                        $course = Course::create([
                            'name' => $courseName,
                            'number_of_hours_studied' => (string) $hours,
                            'entity_id' => $entityId,
                            'certificate_id' => $documentTemplate->id,
                        ]);
                        $targetVersion = $documentTemplate->versions()->create($versionPayload);
                    }
                });
            }

            // Do not apply masks to HTML text on import, only extract data
            // if ($targetVersion) {
            //     \App\Jobs\ApplyInCourseMaskWithGeminiJob::dispatch($targetVersion->id);
            // }

            // Upload do arquivo original para S3 apenas em produção.
            // Em ambiente local esse passo é desnecessário e adiciona latência de rede.
            if ($course && !app()->environment('local')) {
                $originalName = $uploadedFile->getClientOriginalName();
                $extension = strtolower((string) $uploadedFile->getClientOriginalExtension());
                $s3Path = 'courses/attachments/' . (string) \Illuminate\Support\Str::uuid() . '.' . $extension;

                \Illuminate\Support\Facades\Storage::disk('s3')->put(
                    $s3Path,
                    file_get_contents($inputPath)
                );

                $fullUrl = \Illuminate\Support\Facades\Storage::disk('s3')->url($s3Path);

                $course->courseFiles()->create([
                    'name' => $originalName,
                    'path' => $fullUrl,
                ]);
            } elseif ($course && app()->environment('local')) {
                \Illuminate\Support\Facades\Log::info('[CourseTemplateUploadService] Ambiente local: upload S3 do arquivo original ignorado.');
            }

            $instructor = $this->upsertInstructorFromMaskValues($entityId, $maskValues);

            return [
                'message' => $wasUpdated
                    ? 'Template importado e curso existente atualizado com sucesso.'
                    : 'Template importado e curso cadastrado com sucesso.',
                'course' => $course?->fresh(['certificateTemplate.latestVersion.type']),
                'document_template' => $documentTemplate?->fresh(['latestVersion.type']),
                'frame_base64' => $frontFrameSrc ?? $frame?->frame_base64,
                'back_frame_base64' => $backFrameSrc ?? $frame?->back_frame_base64,
                'frame_url' => ($frame && !str_starts_with((string) ($frame->frame ?? ''), 'data:')) ? $frame->frame : null,
                'back_frame_url' => ($frame && !str_starts_with((string) ($frame->back_frame ?? ''), 'data:')) ? $frame->back_frame : null,
                'instructor' => $instructor,
                'used_masks' => $usedMasks,
                'extracted' => [
                    'course' => [
                        'name' => $courseName,
                        'number_of_hours_studied' => (string) $hours,
                        'orientation' => $orientation,
                        'modality' => $modality,
                        'city' => ($courseCity !== '' && preg_match('/\{\{[a-z_]+\}\}/i', $courseCity) !== 1) ? $courseCity : null,
                    ],
                    'instructor' => $instructor ? [
                        'name' => $instructor->name,
                        'formation' => $instructor->formation,
                        'crea' => $instructor->crea,
                    ] : null,
                    'mask_values' => $maskValues,
                ],
            ];
        } finally {
            $this->cleanupDirectory($tmpDir);
        }
    }

    private function normalizeInputForCommand(string $inputPath, string $extension, string $tmpDir): string
    {
        if (in_array($extension, ['pdf', 'docx'], true)) {
            return $inputPath;
        }

        if ($extension !== 'doc') {
            throw new RuntimeException('Formato nao suportado. Use .pdf, .docx ou .doc.');
        }

        if (! $this->hasCommand('soffice')) {
            throw new RuntimeException('Arquivo .doc requer LibreOffice (soffice) para conversao no servidor.');
        }

        shell_exec('soffice --headless --convert-to docx --outdir ' . escapeshellarg($tmpDir) . ' ' . escapeshellarg($inputPath) . ' 2>/dev/null');

        $generatedPath = $tmpDir . '/' . pathinfo($inputPath, PATHINFO_FILENAME) . '.docx';
        if (! is_file($generatedPath)) {
            $docxCandidates = glob($tmpDir . '/*.docx') ?: [];
            $generatedPath = $docxCandidates !== [] ? (string) reset($docxCandidates) : '';
        }

        if ($generatedPath === '' || ! is_file($generatedPath)) {
            throw new RuntimeException('Nao foi possivel converter o arquivo .doc para .docx automaticamente.');
        }

        return $generatedPath;
    }

    private function callGenerateCertificateHtml(string $inputPath, string $outputPath, string $metaOutputPath): int
    {
        $baseArgs = [
            'input' => $inputPath,
            '--output' => $outputPath,
        ];

        try {
            return Artisan::call('certificate:generate-html', [
                ...$baseArgs,
                '--meta-output' => $metaOutputPath,
            ]);
        } catch (InvalidOptionException) {
            // Compatibilidade com versões do comando que ainda não possuem --meta-output.
            return Artisan::call('certificate:generate-html', $baseArgs);
        }
    }

    private function findExistingCourseByName(string $courseName, int $entityId): ?Course
    {
        $normalized = mb_strtolower(trim($courseName));

        return Course::query()
            ->myScope()
            ->where('entity_id', $entityId)
            ->whereRaw('LOWER(TRIM(name)) = ?', [$normalized])
            ->first();
    }

    private function resolveEntityId(): int
    {
        $entityId = (int) (Auth::user()?->entity_id ?? 0);

        if ($entityId <= 0) {
            throw new RuntimeException('Usuario sem entidade vinculada para importar/editar curso.');
        }

        return $entityId;
    }

    private function upsertInstructorFromMaskValues(int $entityId, array $maskValues): ?Instructor
    {
        $name = trim((string) ($maskValues['{{nome_instrutor}}'] ?? ''));
        if ($name === '') {
            return null;
        }

        $formation = trim((string) ($maskValues['{{formacao_instrutor}}'] ?? ''));
        $crea = trim((string) ($maskValues['{{crea_instrutor}}'] ?? ''));
        $formationValue = $formation !== '' ? $formation : null;
        $creaValue = $crea !== '' ? $crea : null;

        $instructor = Instructor::withTrashed()
            ->where('entity_id', $entityId)
            ->whereRaw('LOWER(TRIM(name)) = ?', [mb_strtolower($name)])
            ->first();

        if (! $instructor) {
            return Instructor::create([
                'name' => $name,
                'formation' => $formationValue,
                'crea' => $creaValue,
                'entity_id' => $entityId,
            ]);
        }

        if (method_exists($instructor, 'trashed') && $instructor->trashed()) {
            $instructor->restore();
        }

        $updates = [];
        if (($instructor->formation ?? null) !== $formationValue) {
            $updates['formation'] = $formationValue;
        }

        if (($instructor->crea ?? null) !== $creaValue) {
            $updates['crea'] = $creaValue;
        }

        if ($updates !== []) {
            $instructor->update($updates);
        }

        return $instructor->fresh();
    }

    private function hasCommand(string $command): bool
    {
        $result = shell_exec('command -v ' . escapeshellarg($command) . ' 2>/dev/null');
        return is_string($result) && trim($result) !== '';
    }

    private function splitFrontAndBack(string $html): array
    {
        if (! class_exists(\DOMDocument::class)) {
            return [$html, null];
        }

        $dom = $this->parseHtmlUtf8($html);

        if (! $dom) {
            return [$html, null];
        }

        $xpath = new \DOMXPath($dom);

        // Para HTML pdftohtml: containers são div#page1-div, div#page2-div, etc.
        $nodes = $xpath->query('//div[starts-with(@id, "page") and substring(@id, string-length(@id) - 3) = "-div"]');

        if ($nodes instanceof \DOMNodeList && $nodes->length > 0) {
            $front = $this->saveHtmlUtf8($dom, $nodes->item(0));
            $back = $nodes->length > 1 ? ($this->saveHtmlUtf8($dom, $nodes->item(1)) ?: null) : null;
            return [trim($front) !== '' ? $front : $html, $back];
        }

        // Para HTML Word-like (LibreOffice/Word export): container é div.WordSection1, div.WordSection2, etc.
        $wordNodes = $xpath->query('//div[starts-with(@class, "WordSection") or @class="WordSection1"]');

        if ($wordNodes instanceof \DOMNodeList && $wordNodes->length > 0) {
            $front = $this->saveHtmlUtf8($dom, $wordNodes->item(0));
            $back = $wordNodes->length > 1 ? ($this->saveHtmlUtf8($dom, $wordNodes->item(1)) ?: null) : null;
            return [trim($front) !== '' ? $front : $html, $back];
        }

        return [$html, null];
    }

    private function isWordLikeHtml(string $html): bool
    {
        // Detecta HTML com estrutura de bloco semântica (Word, LibreOffice, ou nosso parser nativo).
        // Nesses HTMLs o text-align fica no elemento de bloco (p, h1) — estável durante edição.
        return str_contains($html, 'WordSection')
            || str_contains($html, 'MsoNormal')
            || str_contains($html, 'MsoBodyText')
            || (bool) preg_match('/<meta[^>]*Generator[^>]*Microsoft Word/i', $html)
            || (bool) preg_match('/<meta[^>]*Generator[^>]*LibreOffice/i', $html)
            || (bool) preg_match('/<meta[^>]*Generator[^>]*Flash Certificados/i', $html);
    }

    private function resolveFrameForTemplates(?string $frontFrameSrc, ?string $backFrameSrc): ?DocumentTemplateFrame
    {
        if (! $this->isBase64Image($frontFrameSrc) && ! $this->isBase64Image($backFrameSrc)) {
            return DocumentTemplateFrame::query()->myScope()->first();
        }

        
        try {
            // Passa o base64 diretamente para o model.
            // O observer (boot) de DocumentTemplateFrame chama RegisterFilesS3Service,
            // que extrai o binário, faz o upload para o S3 e substitui `frame` pela URL.
            $createdFrame = DocumentTemplateFrame::create([
                'frame'       => $frontFrameSrc,
                'back_frame'  => $backFrameSrc,
                'is_top_only' => false,
            ]);

            if ($createdFrame) {
                return $createdFrame;
            }
        } catch (\Throwable) {
            // Em caso de falha no cadastro da moldura detectada, usa fallback padrão.
        }
        
        return DocumentTemplateFrame::query()->myScope()->first();
    }

    private function uploadFrameToS3(?string $frameSrc): ?string
    {
        if (! $this->isBase64Image($frameSrc)) {
            return null;
        }

        if (! preg_match('/^data:image\/([a-zA-Z0-9.+\-]+);base64,(.+)$/s', (string) $frameSrc, $m)) {
            return null;
        }

        $subtype = strtolower((string) $m[1]);
        $binary  = base64_decode((string) $m[2], true);

        if ($binary === false || $binary === '') {
            return null;
        }

        $extension = match ($subtype) {
            'jpeg', 'jpg' => 'jpg',
            'png'         => 'png',
            'gif'         => 'gif',
            'webp'        => 'webp',
            'svg+xml', 'svg' => 'svg',
            default       => 'png',
        };

        $path = 'templates/frames/' . (string) Str::uuid() . '.' . $extension;

        try {
            Storage::disk('s3')->put($path, $binary, [
                'visibility'   => 'public',
                'ContentType'  => 'image/' . $subtype,
            ]);
        } catch (\Throwable) {
            return null;
        }

        $baseUrl = rtrim((string) config('filesystems.disks.s3.url', ''), '/');
        if ($baseUrl !== '') {
            return $baseUrl . '/' . $path;
        }

        $bucket = (string) config('filesystems.disks.s3.bucket', '');
        $region = (string) config('filesystems.disks.s3.region', 'us-east-1');

        return 'https://' . $bucket . '.s3.' . $region . '.amazonaws.com/' . $path;
    }

    private function injectBaseStyles(string $html, string $orientation): string
    {
        if ($this->isWordLikeHtml($html)) {
            // Para HTML Word-like: garante que o container de seção seja o bloco de referência
            // e que a imagem de moldura (z-index muito negativo) fique sempre atrás do texto.
            $targetW = $orientation === 'landscape' ? '1123px' : '794px';
            $targetH = $orientation === 'landscape' ? '794px' : '1123px';
            $css = "
<style>
    div[class^=\"WordSection\"] {
        position: relative !important;
        overflow: hidden !important;
        margin: 0 auto !important;
        padding: 0 !important;
        box-sizing: border-box !important;
        width: {$targetW} !important;
        height: {$targetH} !important;
    }
    div[class^=\"WordSection\"] span[style*=\"z-index:-\"] {
        pointer-events: none !important;
    }
</style>
";
            return $css . $html;
        }

        $css = "
<style>
    div[id^=\"page\"][id$=\"-div\"] {
        position: relative !important;
        overflow: hidden !important;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
    }

    div[id^=\"page\"][id$=\"-div\"] p {
        margin: 0 !important;
        padding: 0 !important;
    }
";

        // Só injeta o alinhamento de coluna se for o verso (contiver page2-div)
        // e se detectarmos elementos posicionados especificamente na coluna da esquerda (left entre 100px e 399px)
        // e parágrafos com width: 100% que causam colisão no meio da tela.
        if (str_contains($html, 'id="page2-div"') &&
            (str_contains($html, 'width: 100%') || str_contains($html, 'width:100%')) &&
            preg_match('/left:\s*[1-3]\d{2}px/i', $html)) {
            $css .= "
    div[id$=\"page2-div\"] p[style*=\"width: 100%\"],
    div[id$=\"page2-div\"] p[style*=\"width:100%\"] {
        left: 45% !important;
        width: 50% !important;
    }
";
        }

        $css .= "</style>\n";
        return $css . $html;
    }

    private function applyEditorScaleToFrontTemplate(string $frontTemplate, string $orientation): string
    {
        // Editor A4 pixel dimensions (matching the React constants in Course/index.tsx)
        $targetW = $orientation === 'landscape' ? 1123.0 : 794.0;
        $targetH = $orientation === 'landscape' ? 794.0 : 1123.0;

        // HTML Word-like: não tem div#pageN-div com px, usa @page CSS em pt.
        // 842pt × (96/72) ≈ 1123px — já está no tamanho certo. Não precisa de zoom.
        if ($this->isWordLikeHtml($frontTemplate)) {
            return $frontTemplate;
        }

        // Locate the first page div and read its intrinsic PDF dimensions
        if (preg_match('/<div[^>]*id="page\d+-div"[^>]*style="([^"]*)"[^>]*>/i', $frontTemplate, $styleMatch) !== 1) {
            return $frontTemplate;
        }

        $srcW = $this->extractPixelsFromStyle($styleMatch[1], 'width');
        $srcH = $this->extractPixelsFromStyle($styleMatch[1], 'height');

        if ($srcW <= 0.0 || $srcH <= 0.0) {
            return $frontTemplate;
        }

        $scale = min($targetW / $srcW, $targetH / $srcH);

        // Only apply zoom when it materially differs from 1:1
        if (abs(1.0 - $scale) <= 0.01) {
            return $frontTemplate;
        }

        $scaleStr = number_format($scale, 6, '.', '');
        $srcWStr = number_format($srcW, 1, '.', '');
        $srcHStr = number_format($srcH, 1, '.', '');

        // Inject zoom and keep original container dimensions in the page div's inline style
        // so that the zoomed system has the full coordinate system space and nothing gets clipped.
        return (string) preg_replace_callback(
            '/<div([^>]*id="page\d+-div"[^>]*)>/i',
            static function (array $m) use ($scaleStr, $srcWStr, $srcHStr): string {
                $attrs = $m[1];
                $extraStyles = "zoom:{$scaleStr};transform-origin:0 0 0;width:{$srcWStr}px;height:{$srcHStr}px;overflow:hidden;box-sizing:border-box;";
                
                if (preg_match('/\bstyle="([^"]*)"/i', $attrs)) {
                    $attrs = (string) preg_replace(
                        '/\bstyle="([^"]*)"/i',
                        'style="$1' . $extraStyles . '"',
                        $attrs,
                        1
                    );
                } else {
                    $attrs .= ' style="' . $extraStyles . '"';
                }
                return '<div' . $attrs . '>';
            },
            $frontTemplate,
            1
        ) ?? $frontTemplate;
    }

    private function isBase64Image(?string $value): bool
    {
        if (! is_string($value) || trim($value) === '') {
            return false;
        }

        return preg_match('/^data:image\/[a-zA-Z0-9.+-]+;base64,/i', $value) === 1;
    }

    private function resolveLocalImagePath(string $src, string $tmpDir): ?string
    {
        $src = trim($src);
        if ($src === '' || str_starts_with($src, 'http://') || str_starts_with($src, 'https://') || str_starts_with($src, 'data:')) {
            return null;
        }

        if (is_file($src)) {
            return $src;
        }

        $parsed = parse_url($src, PHP_URL_PATH);
        if (! $parsed) {
            return null;
        }

        $candidate = $tmpDir . '/' . ltrim($parsed, '/');
        if (is_file($candidate)) {
            return $candidate;
        }

        $filename = basename($parsed);
        $files = glob($tmpDir . '/**/' . $filename) ?: glob($tmpDir . '/' . $filename);
        if ($files !== [] && is_file((string) reset($files))) {
            return (string) reset($files);
        }

        return null;
    }

    private function extractFrameAndRemoveFromTemplate(string $html): array
    {
        if (! class_exists(\DOMDocument::class) || trim($html) === '') {
            return [$html, null];
        }

        $dom = $this->parseHtmlUtf8($html);

        if (! $dom) {
            return [$html, null];
        }

        $xpath = new \DOMXPath($dom);

        // Para HTML Word-like: a moldura está em <span style="position:absolute;z-index:-1659913728;...">
        // Esse é o padrão do Word/nosso parser nativo. Remove o span inteiro (não só a img).
        if ($this->isWordLikeHtml($html)) {
            // 1. Busca por z-index negativo específico ou genérico no span/div contendo img
            foreach ($xpath->query('//span|//div') as $containerNode) {
                if (! $containerNode instanceof \DOMElement) {
                    continue;
                }
                $style = (string) $containerNode->getAttribute('style');
                // Aceita o z-index específico ou qualquer z-index negativo
                if (str_contains($style, 'z-index:-1659913728') || preg_match('/z-index\s*:\s*-\d+/i', $style) === 1) {
                    $imgNode = $xpath->query('.//img', $containerNode)->item(0);
                    if ($imgNode instanceof \DOMElement) {
                        $frameSrc = trim((string) $imgNode->getAttribute('src'));
                        if ($frameSrc !== '') {
                            $containerNode->parentNode?->removeChild($containerNode);
                            $updatedHtml = $this->saveHtmlUtf8($dom);
                            if (trim($updatedHtml) !== '') {
                                return [$updatedHtml, $frameSrc];
                            }
                        }
                    }
                }
            }

            // 2. Fallback robusto: busca a maior imagem no HTML Word
            $candidateImg = null;
            $maxScore = 0.0;

            foreach ($xpath->query('//img') as $imgNode) {
                if (! $imgNode instanceof \DOMElement) {
                    continue;
                }

                $src = trim((string) $imgNode->getAttribute('src'));
                if ($src === '') {
                    continue;
                }

                // Calcula dimensões
                $style = (string) $imgNode->getAttribute('style');
                $width = $this->normalizePixels((string) $imgNode->getAttribute('width'));
                $height = $this->normalizePixels((string) $imgNode->getAttribute('height'));

                if ($width <= 0) {
                    $width = $this->extractPixelsFromStyle($style, 'width');
                }
                if ($height <= 0) {
                    $height = $this->extractPixelsFromStyle($style, 'height');
                }

                $area = $width * $height;
                $base64Len = str_starts_with($src, 'data:') ? strlen($src) : 0;

                // Score é primariamente a área se disponível, ou o comprimento do base64
                $score = $area > 0 ? $area : ($base64Len / 4);

                if ($score > $maxScore) {
                    $maxScore = $score;
                    $candidateImg = $imgNode;
                }
            }

            // Se o maior score indica uma imagem grande (ex: área > 150000px ou base64 > 50KB)
            if ($candidateImg && ($maxScore >= 150000 || (str_starts_with(trim($candidateImg->getAttribute('src')), 'data:') && strlen(trim($candidateImg->getAttribute('src'))) > 50000))) {
                $frameSrc = trim((string) $candidateImg->getAttribute('src'));
                
                // Se estiver dentro de um span/div com posicionamento absoluto, remove o container inteiro
                $parent = $candidateImg->parentNode;
                if ($parent instanceof \DOMElement && (in_array(strtolower($parent->tagName), ['span', 'div'], true))) {
                    $parentStyle = (string) $parent->getAttribute('style');
                    if (str_contains($parentStyle, 'position:absolute') || str_contains($parentStyle, 'position: absolute')) {
                        $parent->parentNode?->removeChild($parent);
                    } else {
                        $candidateImg->parentNode?->removeChild($candidateImg);
                    }
                } else {
                    $candidateImg->parentNode?->removeChild($candidateImg);
                }

                $updatedHtml = $this->saveHtmlUtf8($dom);
                if (trim($updatedHtml) !== '') {
                    return [$updatedHtml, $frameSrc];
                }
            }

            // Nenhuma moldura encontrada — retorna sem alterar
            return [$html, null];
        }

        // Para HTML pdftohtml: busca a maior img que cobre ≥85% da página
        $pageNode = $xpath->query('//div[starts-with(@id, "page") and substring(@id, string-length(@id) - 3) = "-div"]')->item(0);
        $pageWidth = 0.0;
        $pageHeight = 0.0;

        if ($pageNode instanceof \DOMElement) {
            $pageStyle = (string) $pageNode->getAttribute('style');
            $pageWidth = $this->extractPixelsFromStyle($pageStyle, 'width');
            $pageHeight = $this->extractPixelsFromStyle($pageStyle, 'height');
        }

        $candidate = null;
        $candidateArea = 0.0;

        foreach ($xpath->query('//img') as $imgNode) {
            if (! $imgNode instanceof \DOMElement) {
                continue;
            }

            $style = (string) $imgNode->getAttribute('style');
            $width = $this->normalizePixels((string) $imgNode->getAttribute('width'));
            $height = $this->normalizePixels((string) $imgNode->getAttribute('height'));

            if ($width <= 0) {
                $width = $this->extractPixelsFromStyle($style, 'width');
            }

            if ($height <= 0) {
                $height = $this->extractPixelsFromStyle($style, 'height');
            }

            if ($width <= 0 || $height <= 0) {
                continue;
            }

            $area = $width * $height;
            if ($area <= $candidateArea) {
                continue;
            }

            $src = trim((string) $imgNode->getAttribute('src'));
            if ($src === '') {
                continue;
            }

            $isNearPageSize = $pageWidth > 0
                && $pageHeight > 0
                && ($width / $pageWidth) >= 0.85
                && ($height / $pageHeight) >= 0.85;

            if (! $isNearPageSize) {
                continue;
            }

            $candidate = $imgNode;
            $candidateArea = $area;
        }

        if (! $candidate instanceof \DOMElement) {
            return [$html, null];
        }

        $frameSrc = trim((string) $candidate->getAttribute('src'));
        $candidate->parentNode?->removeChild($candidate);
        $updatedHtml = $this->saveHtmlUtf8($dom);

        if (trim($updatedHtml) === '') {
            return [$html, null];
        }

        return [$updatedHtml, $frameSrc !== '' ? $frameSrc : null];
    }

    private function parseHtmlUtf8(string $html): ?\DOMDocument
    {
        libxml_use_internal_errors(true);

        $dom = new \DOMDocument('1.0', 'UTF-8');
        // Impede reformatação: sem espaçamento automático nem quebras de linha entre elementos.
        $dom->preserveWhiteSpace = true;
        $dom->formatOutput = false;

        $loaded = $dom->loadHTML(
            '<?xml encoding="UTF-8">' . $html,
            LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD
        );

        libxml_clear_errors();

        if (! $loaded) {
            return null;
        }

        foreach ($dom->childNodes as $node) {
            if ($node->nodeType === XML_PI_NODE) {
                $dom->removeChild($node);
                break;
            }
        }

        return $dom;
    }

    /**
     * Serializa o DOM de volta para HTML preservando UTF-8 corretamente.
     *
     * O DOMDocument::saveHTML() converte caracteres não-ASCII para entidades numéricas
     * (ex.: ã→&#227;, é→&#233;, ç→&#231;). Esse método desfaz essa conversão,
     * restaurando os caracteres UTF-8 originais para que o HTML resultante seja legível
     * e renderizável sem perda visual.
     *
     * Entidades HTML com significado especial (&#38;=&, &#60;=<, &#62;=>) são preservadas.
     */
    private function saveHtmlUtf8(\DOMDocument $dom, ?\DOMNode $node = null): string
    {
        $output = $node !== null
            ? ($dom->saveHTML($node) ?: '')
            : ($dom->saveHTML() ?: '');

        if ($output === '') {
            return '';
        }

        // Converte entidades numéricas não-ASCII de volta para UTF-8.
        // Codepoints < 128 (ASCII) são preservados pois têm semântica HTML especial
        // (&amp;=&#38;, &lt;=&#60;, &gt;=&#62;, &quot;=&#34;, &apos;=&#39;).
        return (string) preg_replace_callback(
            '/&#(\d+);/',
            static function (array $m): string {
                $cp = (int) $m[1];
                if ($cp < 128) {
                    return $m[0];
                }
                $char = mb_chr($cp, 'UTF-8');
                return ($char !== false && $char !== '') ? $char : $m[0];
            },
            $output
        );
    }

    private function inlineConversionStyles(string $html): string
    {
        if (! class_exists(\DOMDocument::class) || trim($html) === '') {
            return $html;
        }

        $dom = $this->parseHtmlUtf8($html);
        if (! $dom) {
            return $html;
        }

        $xpath = new \DOMXPath($dom);
        $styleNodes = $xpath->query('//style');

        if (! $styleNodes instanceof \DOMNodeList || $styleNodes->length === 0) {
            return $html;
        }

        $classStyles = [];

        foreach ($styleNodes as $styleNode) {
            $css = trim((string) $styleNode->textContent);
            if ($css === '') {
                continue;
            }

            $matches = [];
            $count = preg_match_all('/\.([a-zA-Z0-9_-]+)\s*\{([^}]*)\}/', $css, $matches, PREG_SET_ORDER);
            if ($count === false || $count < 1) {
                continue;
            }

            foreach ($matches as $match) {
                $className = trim((string) ($match[1] ?? ''));
                $styleBody = trim((string) ($match[2] ?? ''));

                if ($className === '' || $styleBody === '') {
                    continue;
                }

                if (! isset($classStyles[$className])) {
                    $classStyles[$className] = '';
                }

                $classStyles[$className] .= rtrim($styleBody, ';') . ';';
            }
        }

        if ($classStyles === []) {
            return $html;
        }

        $elementsWithClass = $xpath->query('//*[@class]');
        if (! $elementsWithClass instanceof \DOMNodeList || $elementsWithClass->length === 0) {
            return $html;
        }

        foreach ($elementsWithClass as $element) {
            if (! $element instanceof \DOMElement) {
                continue;
            }

            $classes = preg_split('/\s+/', trim((string) $element->getAttribute('class'))) ?: [];
            $inlineFromClass = '';

            foreach ($classes as $className) {
                if ($className === '' || ! isset($classStyles[$className])) {
                    continue;
                }

                $inlineFromClass .= $classStyles[$className];
            }

            if ($inlineFromClass === '') {
                continue;
            }

            // Check if element is inside a cert-flow-container or is a cert-flow-container
            $isFlowChild = false;
            $parent = $element->parentNode;
            while ($parent instanceof \DOMElement) {
                $pClass = (string) $parent->getAttribute('class');
                $pStyle = (string) $parent->getAttribute('style');
                if (str_contains($pClass, 'cert-flow-container') || (str_contains($pStyle, 'display:flex') && str_contains($pStyle, 'flex-direction:column'))) {
                    $isFlowChild = true;
                    break;
                }
                $parent = $parent->parentNode;
            }

            if ($isFlowChild) {
                $inlineFromClass = (string) preg_replace('/\bposition\s*:\s*[^;]+;?/i', '', $inlineFromClass);
                $inlineFromClass = (string) preg_replace('/\btop\s*:\s*[^;]+;?/i', '', $inlineFromClass);
                $inlineFromClass = (string) preg_replace('/\bleft\s*:\s*[^;]+;?/i', '', $inlineFromClass);
                $inlineFromClass = (string) preg_replace('/\bwidth\s*:\s*[^;]+;?/i', '', $inlineFromClass);
                $inlineFromClass = (string) preg_replace('/\bheight\s*:\s*[^;]+;?/i', '', $inlineFromClass);
                $inlineFromClass = (string) preg_replace('/\btransform\s*:\s*[^;]+;?/i', '', $inlineFromClass);
                $inlineFromClass = (string) preg_replace('/\bwhite-space\s*:\s*[^;]+;?/i', '', $inlineFromClass);
            }

            $currentInline = trim((string) $element->getAttribute('style'));
            $mergedInline = $inlineFromClass;

            if ($currentInline !== '') {
                $mergedInline .= rtrim($currentInline, ';') . ';';
            }

            $element->setAttribute('style', $mergedInline);
        }

        $updatedHtml = $this->saveHtmlUtf8($dom);
        return trim($updatedHtml) !== '' ? $updatedHtml : $html;
    }

    private function extractPixelsFromStyle(string $style, string $property): float
    {
        if (preg_match('/(?:^|;)\s*' . preg_quote($property, '/') . '\s*:\s*([\d.]+)px/i', $style, $matches) !== 1) {
            return 0.0;
        }

        return $this->normalizePixels($matches[1]);
    }

    private function normalizePixels(string $value): float
    {
        if (preg_match('/[\d.]+/', $value, $matches) !== 1) {
            return 0.0;
        }

        $number = (float) $matches[0];
        return $number > 0 ? $number : 0.0;
    }

    private function detectOrientation(string $html): string
    {
        if (preg_match('/width\s*:\s*([\d.]+)px;\s*height\s*:\s*([\d.]+)px/i', $html, $matches) === 1) {
            $width = (float) $matches[1];
            $height = (float) $matches[2];
            return $width > $height ? 'landscape' : 'portrait';
        }

        return str_contains(strtolower($html), 'size: a4 landscape') ? 'landscape' : 'portrait';
    }

    private function resolveOrientation(array $generationMeta, string $html): string
    {
        $raw = strtolower(trim((string) data_get($generationMeta, 'orientation', '')));
        if (in_array($raw, ['landscape', 'portrait'], true)) {
            return $raw;
        }

        if (in_array($raw, ['paisagem', 'horizontal'], true)) {
            return 'landscape';
        }

        if (in_array($raw, ['retrato', 'vertical'], true)) {
            return 'portrait';
        }

        return $this->detectOrientation($html);
    }

    private function resolveCourseName(array $maskValues, UploadedFile $uploadedFile): string
    {
        $nameFromMask = trim((string) ($maskValues['{{nome_curso}}'] ?? ''));
        $nameFromMask = trim($nameFromMask, " \t\n\r\0\x0B\"'");
        if ($nameFromMask !== '' && preg_match('/\{\{[a-z_]+\}\}/i', $nameFromMask) !== 1) {
            return Str::limit($nameFromMask, 220, '');
        }

        // Fallback: derive name from filename, stripping raw modality tokens
        $filename = pathinfo($uploadedFile->getClientOriginalName(), PATHINFO_FILENAME);
        $filename = (string) preg_replace('/[\s_-]*(presencial|online|ead|hibrido|semipresencial)[\s_-]*/iu', ' ', $filename);
        $filename = (string) preg_replace('/\s{2,}/', ' ', trim($filename));

        return Str::limit(Str::title(str_replace(['-', '_'], ' ', $filename)), 220, '');
    }

    /**
     * Detecta modalidade do treinamento a partir do nome do arquivo.
     * Retorna string canônica maiúscula ou null se não identificada.
     */
    private function extractModalityFromFilename(string $filename): ?string
    {
        $base = pathinfo($filename, PATHINFO_FILENAME);

        $modalities = [
            'HÍBRIDO'      => '/\b(h[ií]brido|semipresencial)\b/iu',
            'PRESENCIAL'   => '/\b(presencial)\b/iu',
            'ONLINE'       => '/\b(online)\b/iu',
            'EAD'          => '/\b(ead)\b/iu',
        ];

        foreach ($modalities as $label => $pattern) {
            if (preg_match($pattern, $base) === 1) {
                return $label;
            }
        }

        return null;
    }

    /**
     * Enriquece o nome do curso com modalidade e cidade quando disponíveis.
     * Formato: "Nome do Curso - MODALIDADE - Cidade"
     */
    private function enrichCourseNameWithSignals(string $name, ?string $modality, string $city): string
    {
        $signals = [];

        if ($modality !== null && $modality !== '') {
            $signals[] = $modality;
        }

        // Inclui cidade apenas quando não é um placeholder de máscara
        if ($city !== '' && preg_match('/\{\{[a-z_]+\}\}/i', $city) !== 1) {
            $signals[] = $city;
        }

        if ($signals === []) {
            return $name;
        }

        $enriched = $name . ' - ' . implode(' - ', $signals);

        return Str::limit($enriched, 255, '');
    }

    private function collectUsedMasks(string $html): array
    {
        preg_match_all('/\{\{[a-z_\(\)]+\}\}/i', $html, $matches);
        $masks = array_values(array_unique($matches[0] ?? []));
        sort($masks);
        return $masks;
    }

    private function loadGenerationMeta(string $metaOutputPath): array
    {
        if (! is_file($metaOutputPath)) {
            return [];
        }

        $raw = file_get_contents($metaOutputPath);
        if (! is_string($raw) || trim($raw) === '') {
            return [];
        }

        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $decoded : [];
    }

    private function extractHoursFromMaskValue(string $value): int
    {
        if (preg_match('/\d{1,4}/', $value, $match) !== 1) {
            return 0;
        }

        $hours = (int) $match[0];
        return $hours > 0 ? $hours : 0;
    }

    private function cleanupDirectory(string $path): void
    {
        if (! is_dir($path)) {
            return;
        }

        $items = scandir($path);
        if (! is_array($items)) {
            return;
        }

        foreach ($items as $item) {
            if ($item === '.' || $item === '..') {
                continue;
            }

            $itemPath = $path . DIRECTORY_SEPARATOR . $item;
            if (is_dir($itemPath)) {
                $this->cleanupDirectory($itemPath);
            } else {
                @unlink($itemPath);
            }
        }

        @rmdir($path);
    }

    private function extractStyleBlocks(string $html): string
    {
        if (! class_exists(\DOMDocument::class) || trim($html) === '') {
            return '';
        }

        $dom = $this->parseHtmlUtf8($html);
        if (! $dom) {
            return '';
        }

        $xpath = new \DOMXPath($dom);
        $styleNodes = $xpath->query('//style');

        $styles = '';
        if ($styleNodes instanceof \DOMNodeList && $styleNodes->length > 0) {
            foreach ($styleNodes as $node) {
                $content = (string) $node->textContent;
                if (str_contains($content, '@font-face')) {
                    $styles .= '<style type="text/css">' . $content . '</style>' . "\n";
                }
            }
        }

        return $styles;
    }
}
