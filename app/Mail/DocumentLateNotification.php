<?php

namespace App\Mail;

use App\Constants\Queues;
use App\Models\NotificationTemplateConfig;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DocumentLateNotification extends Mailable
{
    use Queueable, SerializesModels;
    public NotificationTemplateConfig $config;
    public string $content;
    /**
     * Create a new message instance.
     */
    public function __construct($config, $content)
    {
        $this->config = $config;
        $this->content = $content;
        $this->onQueue(Queues::EMAIL_DOCUMENT_EXPIRY);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            from: new \Illuminate\Mail\Mailables\Address($this->config?->default_sender, $this->config?->entity_config_email?->name), // Usando as propriedades
            subject: $this->config?->title
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
             view: 'emails.document-expiry',
             with: [
                'content' => $this->content,
                'company_name' => env('APP_NAME'),
                'logo' => $this->config?->logo
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
        return [];
    }
}
