<?php

namespace App\Auth;

use App\Models\User;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;

class LoginChallenge
{
    public const TTL_MINUTES = 5;

    public static function issue(User $user, string $purpose): string
    {
        return Crypt::encryptString(json_encode([
            'uid' => $user->id,
            'purpose' => $purpose,
            'exp' => now()->addMinutes(self::TTL_MINUTES)->getTimestamp(),
        ]));
    }

    public static function user(string $token, string $purpose): ?User
    {
        try {
            $payload = json_decode(Crypt::decryptString($token), true);
        } catch (DecryptException) {
            return null;
        }

        if (!is_array($payload) || ($payload['purpose'] ?? null) !== $purpose) {
            return null;
        }

        if ((int) ($payload['exp'] ?? 0) < now()->getTimestamp()) {
            return null;
        }

        return User::find($payload['uid'] ?? 0);
    }
}
