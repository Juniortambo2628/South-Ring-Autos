<x-mail::message>
# Password Reset Request

Hello,

You are receiving this email because we received a password reset request for your South Ring Autos account.

<x-mail::button :url="config('app.url') . '/reset-password?token=' . $token . '&email=' . urlencode($email)">
Reset Password
</x-mail::button>

This password reset link will expire in 60 minutes.

If you did not request a password reset, no further action is required.

Regards,<br>
{{ config('app.name') }}
</x-mail::message>
