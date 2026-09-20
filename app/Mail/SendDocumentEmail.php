<?php

namespace App\Mail;

use App\Constants\Queues;
use App\Models\Document;
use App\Models\EntityConfig;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;
use GuzzleHttp\Client; // Importação do cliente Guzzle
use Illuminate\Support\Facades\Log;

class SendDocumentEmail extends Mailable
{
    use Queueable, SerializesModels;
    public Document $document;
    public array $data;
    public EntityConfig $config; 

    /**
     * Create a new message instance.
     */
    public function __construct(Document $document, array $data, $queue = Queues::EMAIL_SEPARATE_DOCUMENT)
    {
        $this->document = $document;
        $this->data = $data;
        $this->config = $document->entity->config;
        $this->onQueue($queue);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->data['subject_email'],
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.email-separate-document',
            with: [
                'employee' => $this->document->employee,
                'logo' => $this->config?->logo,
                'company_name' => env('APP_NAME'),
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        $client = new Client();
        $rendererUrl = 'http://renderer:3000/render-pdf'; // URL do novo microserviço
        $documentsToSend = [];

        $documentTemplateMounted = $this->document->certificate_template_mounted;

        if (
            $this->isBatchEmail() || 
            (isset($this->data['send_certificate']) && 
            $this->data['send_certificate'] && 
            $documentTemplateMounted && 
            strlen($documentTemplateMounted))
            ) {
                $requestBody = [
                    'json' => [
                        'html' => $documentTemplateMounted
                    ]
                ];

                $response = $client->post($rendererUrl, $requestBody);
                
                $responseData = json_decode($response->getBody()->getContents(), true);

                 if (isset($responseData['base64'])) {
                    $pdfData = base64_decode($responseData['base64']);

                    $documentsToSend[] = Attachment::fromData(fn () => $pdfData, 'CERTIFICADO.pdf')
                            ->withMime('application/pdf');
                }
        }

        if (
            (
                $this->isBatchEmail() && 
                $this->document->authorization_template_mounted &&
                strlen($this->document->authorization_template_mounted)
                ) || 
            (isset($this->data['send_authorization']) && 
            $this->data['send_authorization'] && 
            $this->document->authorization_template_mounted && 
            strlen($this->document->authorization_template_mounted))
            ) {
                 $requestBody = [
                    'json' => [
                        'html' => $this->document->authorization_template_mounted
                    ]
                ];

                // Faz a requisição POST para a API do renderer
                $response = $client->post($rendererUrl, $requestBody);
                
                $responseData = json_decode($response->getBody()->getContents(), true);

                 if (isset($responseData['base64'])) {
                    $pdfData = base64_decode($responseData['base64']);

                    $documentsToSend[] = Attachment::fromData(fn () => $pdfData, 'AUTORIZACAO.pdf')
                            ->withMime('application/pdf');
                }
        }

        //  if (
        //     $this->isBatchEmail() || 
        //     (isset($this->data['send_presence_list']) && 
        //     $this->data['send_presence_list'] && 
        //     $this->document->presence_list_template_mounted && 
        //     strlen($this->document->presence_list_template_mounted))
        //     ) {
        //          $requestBody = [
        //             'json' => [
        //                 'html' => $this->document->presence_list_template_mounted
        //             ]
        //         ];

        //         // Faz a requisição POST para a API do renderer
        //         $response = $client->post($rendererUrl, $requestBody);
                
        //         $responseData = json_decode($response->getBody()->getContents(), true);

        //          if (isset($responseData['base64'])) {
        //             $pdfData = base64_decode($responseData['base64']);

        //             $documentsToSend[] = Attachment::fromData(fn () => $pdfData, 'LISTA_DE_PRESENCA.pdf')
        //                     ->withMime('application/pdf');
        //         }
        // }

        if (!count($documentsToSend)) {
            Log::error('Erro ao gerar o PDF para o documento: ' . $this->document->id);
        }
    
        return $documentsToSend;
    }

    private function isBatchEmail(): bool
    {
        return $this->queue === Queues::EMAIL_BATCH_DOCUMENT;
    }
}