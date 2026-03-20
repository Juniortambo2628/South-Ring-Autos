<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

use App\Models\EmailTemplate;

class DynamicEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $template;
    public $variables;
    public $parsedBody;

    /**
     * Create a new message instance.
     */
    public function __construct(EmailTemplate $template, array $variables = [])
    {
        $this->template = $template;
        $this->variables = $variables;

        $body = $template->body;
        foreach ($variables as $key => $value) {
            $body = str_replace('[' . $key . ']', $value, $body);
        }
        $this->parsedBody = $body;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->template->subject;
        foreach ($this->variables as $key => $value) {
            $subject = str_replace('[' . $key . ']', $value, $subject);
        }

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.dynamic',
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
