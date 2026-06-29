<?php

namespace App\Actions;

use App\Models\User;
use App\Models\EmailTemplate;
use App\Mail\DynamicEmail;
use App\Notifications\AppNotification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class NotifyUser
{
    public static function send(string|User $recipient, string $title, string $message, string $type = 'info', ?string $link = null): void
    {
        $user = is_string($recipient) ? User::where('email', $recipient)->first() : $recipient;
        if (!$user) return;

        try {
            $user->notify(new AppNotification($title, $message, $type, $link));
        } catch (\Exception $e) {
            Log::error("Failed to notify user {$user->email}: " . $e->getMessage());
        }
    }

    public static function sendDynamicEmail(string $email, string $templateType, array $data): void
    {
        try {
            $template = EmailTemplate::where('type', $templateType)->where('is_active', true)->first();
            if ($template) {
                Mail::to($email)->send(new DynamicEmail($template, $data));
            }
        } catch (\Exception $e) {
            Log::error("Failed to send {$templateType} email to {$email}: " . $e->getMessage());
        }
    }

    public static function notifyAdmins(string $title, string $message, string $type = 'info', ?string $link = null): void
    {
        try {
            $admins = User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                $admin->notify(new AppNotification($title, $message, $type, $link));
            }
        } catch (\Exception $e) {
            Log::error("Failed to notify admins: " . $e->getMessage());
        }
    }

    public static function notifyAdminsAndUser(string|User $recipient, string $title, string $message, string $type = 'info', ?string $link = null, ?string $adminLink = null): void
    {
        self::send($recipient, $title, $message, $type, $link);
        self::notifyAdmins($title, $message, $type, $adminLink ?? $link);
    }
}
