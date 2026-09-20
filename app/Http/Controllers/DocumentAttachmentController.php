<?php

namespace App\Http\Controllers;

use App\Models\DocumentAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class DocumentAttachmentController extends Controller
{
    /**
     * Download de um anexo específico
     */
    public function download($id)
    {
        try {
            // Localiza o anexo
            $attachment = DocumentAttachment::findOrFail($id);
            
            // Verifica se o arquivo existe no storage
            if (!Storage::disk('s3')->exists($attachment->file_path)) {
                return response()->json(['message' => 'Arquivo não encontrado no storage'], 404);
            }
            
            // Método 1: Para arquivos menores
            if ($attachment->file_size < 10 * 1024 * 1024) { // Se for menor que 10MB
                $fileContents = Storage::disk('s3')->get($attachment->file_path);
                
                return response($fileContents)
                    ->header('Content-Type', $attachment->mime_type)
                    ->header('Content-Disposition', 'attachment; filename="' . $attachment->file_name . '"')
                    ->header('Content-Length', $attachment->file_size)
                    ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
                    ->header('Pragma', 'no-cache')
                    ->header('Expires', '0');
            } 
            // Método 2: Para arquivos maiores ou se método 1 falhar
            else {
                // Gera uma URL temporária de download direto do S3
                $tempUrl = Storage::disk('s3')->temporaryUrl(
                    $attachment->file_path,
                    now()->addMinutes(5), // válido por 5 minutos
                    [
                        'ResponseContentType' => $attachment->mime_type,
                        'ResponseContentDisposition' => 'attachment; filename="' . $attachment->file_name . '"',
                    ]
                );
                
                // Redirecionamos para a URL temporária
                return response()->json(['download_url' => $tempUrl]);
            }
        } catch (\Exception $e) {
            Log::error('Erro ao baixar arquivo: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Erro ao baixar arquivo: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Gera uma URL assinada temporária para compartilhamento
     */
    public function generateShareUrl(Request $request, $id)
    {
        // Validar entrada
        $validated = $request->validate([
            'expiration_minutes' => 'required|integer|min:1|max:10080', // Máximo de 7 dias (10080 minutos)
        ]);
        
        // Localiza o anexo
        $attachment = DocumentAttachment::findOrFail($id);
        
        // Verifica se o arquivo existe no storage
        if (!Storage::disk('s3')->exists($attachment->file_path)) {
            return response()->json(['message' => 'Arquivo não encontrado no storage'], 404);
        }
        
        try {
            // Calcula a expiração com base nos minutos fornecidos
            $expirationTime = now()->addMinutes($validated['expiration_minutes']);
            
            // Gera uma URL temporária assinada
            $url = Storage::disk('s3')->temporaryUrl(
                $attachment->file_path,
                $expirationTime,
                [
                    'ResponseContentType' => $attachment->mime_type,
                    'ResponseContentDisposition' => 'attachment; filename="' . $attachment->file_name . '"',
                ]
            );
            
            return response()->json([
                'url' => $url,
                'expires_at' => $expirationTime->toDateTimeString(),
                'file_name' => $attachment->file_name
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao gerar URL de compartilhamento: ' . $e->getMessage());
            return response()->json(['message' => 'Erro ao gerar URL de compartilhamento: ' . $e->getMessage()], 500);
        }
    }
} 