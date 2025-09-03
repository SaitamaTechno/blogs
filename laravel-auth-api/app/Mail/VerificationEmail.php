<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerificationEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    public function build()
    {
        return $this->subject('Verify Your Email Address')
                    ->markdown('emails.verify-email')
                    ->with([
                        'verificationUrl' => url("/api/email/verify/{$this->user->email_verification_token}"),
                    ]);
    }
}