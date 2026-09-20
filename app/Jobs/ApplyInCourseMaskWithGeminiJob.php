<?php

namespace App\Jobs;

use App\Services\Gemini\GeminiService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use App\Constants\Queues;
use App\Models\DocumentTemplateVersion;
use Illuminate\Support\Facades\Log;

class ApplyInCourseMaskWithGeminiJob implements ShouldQueue
{
    use Queueable;

    private $documentTemplate;

    /**
     * Create a new job instance.
     */
    public function __construct($documentTemplateId)
    {
        $this->onQueue(Queues::UPDATE_COURSE);
        $this->documentTemplate = DocumentTemplateVersion::find($documentTemplateId);
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        if (!$this->documentTemplate) {
            Log::warning('[ApplyInCourseMaskWithGeminiJob] Versão do template de documento não encontrada.');
            return;
        }

        if (app()->environment('local')) {
            Log::info('[ApplyInCourseMaskWithGeminiJob] Ambiente local detectado. Ignorando aplicação de máscaras Gemini.');
            return;
        }

        Log::info('[ApplyInCourseMaskWithGeminiJob] Iniciando aplicação de máscaras com Gemini para a versão de template ID: ' . $this->documentTemplate->id);

        try {
            $data = [];
            $geminiService = new GeminiService();
            $mascarasDisponiveis = "{{nome_aluno}},{{cpf_aluno}},{{carga_horaria}},{{periodo_curso}},{{data_de_emissao}},{{nome_empresa}},{{data_validade}},{{cidade_de_realizacao}}";

            $prompt = "Não invente máscaras.Aja como editor especializado em certificados. Receberá um texto e deve aplicar máscaras em locais apropriados, mantendo estrutura e marcação HTML exatamente como está quando houver. " .
                    "Substitua dados variáveis por máscaras sem inventar novas máscaras. " .
                    "Use {{nome_empresa}} somente quando a referência for da empresa do aluno/funcionário. " .
                "Se for empresa promotora/organizadora/emitente do curso, mantenha o texto original sem máscara {{nome_empresa}}. " .
                    "Máscaras permitidas: {$mascarasDisponiveis}. " .
                    "Não altere de forma alguma os marcadores como ___IMG_PLACEHOLDER_X___. " .
                    "Retorne somente o texto final, sem explicações.";

            if ($this->documentTemplate->template) {
                $placeholders = [];
                $cleanTemplate = $this->stripAndPlaceholder($this->documentTemplate->template, $placeholders);
                
                Log::info('[ApplyInCourseMaskWithGeminiJob] Template principal: extraídos ' . count($placeholders) . ' placeholders.');
                
                $interpreted = $geminiService->interpret($prompt, $cleanTemplate);
                $data['template'] = $this->restorePlaceholders($interpreted, $placeholders);
            }
       
            if ($this->documentTemplate->back_document) {
                $promptBack = "Aja como editor especializado em certificados. Receberá um texto e deve aplicar máscaras em locais apropriados, mantendo estrutura e marcação HTML exatamente como está quando houver. " .
                    "Substitua dados variáveis por máscaras sem inventar novas máscaras. " .
                    "Use {{nome_empresa}} somente quando a referência for da empresa do aluno/funcionário. " .
                    "Se for empresa promotora/organizadora/emitente do curso, mantenha o texto original sem máscara {{nome_empresa}}. " .
                    "Máscaras permitidas: {$mascarasDisponiveis}. " .
                    "Não altere de forma alguma os marcadores como ___IMG_PLACEHOLDER_X___. " .
                    "Retorne somente o texto final, sem explicações.";

                $placeholdersBack = [];
                $cleanBack = $this->stripAndPlaceholder($this->documentTemplate->back_document, $placeholdersBack);

                Log::info('[ApplyInCourseMaskWithGeminiJob] Verso do template: extraídos ' . count($placeholdersBack) . ' placeholders.');

                $interpretedBack = $geminiService->interpret($promptBack, $cleanBack);
                $data['back_document'] = $this->restorePlaceholders($interpretedBack, $placeholdersBack);
            }

            if (!empty($data)) {
                $this->documentTemplate->update($data);
                Log::info('[ApplyInCourseMaskWithGeminiJob] Máscaras aplicadas com sucesso pelo Gemini para a versão de template ID: ' . $this->documentTemplate->id);
            } else {
                Log::warning('[ApplyInCourseMaskWithGeminiJob] Nenhum template (frente ou verso) disponível para aplicar máscaras.');
            }
        } catch (\Throwable $e) {
            Log::error('[ApplyInCourseMaskWithGeminiJob] Erro ao aplicar máscaras com Gemini: ' . $e->getMessage(), [
                'exception' => $e
            ]);
            throw $e;
        }
    }

    private function stripAndPlaceholder(string $html, array &$placeholders): string
    {
        // 1. Replace src="data:..."
        $html = preg_replace_callback('/(src\s*=\s*["\'])(data:[^"\']+)(["\'])/i', function($matches) use (&$placeholders) {
            $placeholder = '___IMG_PLACEHOLDER_' . count($placeholders) . '___';
            $placeholders[$placeholder] = $matches[2];
            return $matches[1] . $placeholder . $matches[3];
        }, $html);

        // 2. Replace src="http..."
        $html = preg_replace_callback('/(src\s*=\s*["\'])(https?:\/\/[^"\']+)(["\'])/i', function($matches) use (&$placeholders) {
            $placeholder = '___IMG_PLACEHOLDER_' . count($placeholders) . '___';
            $placeholders[$placeholder] = $matches[2];
            return $matches[1] . $placeholder . $matches[3];
        }, $html);

        // 3. Replace url('data:...')
        $html = preg_replace_callback('/(url\s*\(\s*["\']?)(data:[^"\'\)]+)(["\']?\s*\))/i', function($matches) use (&$placeholders) {
            $placeholder = '___IMG_PLACEHOLDER_' . count($placeholders) . '___';
            $placeholders[$placeholder] = $matches[2];
            return $matches[1] . $placeholder . $matches[3];
        }, $html);

        // 4. Replace url('http...')
        $html = preg_replace_callback('/(url\s*\(\s*["\']?)(https?:\/\/[^"\'\)]+)(["\']?\s*\))/i', function($matches) use (&$placeholders) {
            $placeholder = '___IMG_PLACEHOLDER_' . count($placeholders) . '___';
            $placeholders[$placeholder] = $matches[2];
            return $matches[1] . $placeholder . $matches[3];
        }, $html);

        return $html;
    }

    private function restorePlaceholders(string $html, array $placeholders): string
    {
        foreach ($placeholders as $placeholder => $original) {
            $html = str_replace($placeholder, $original, $html);
        }
        return $html;
    }
}
