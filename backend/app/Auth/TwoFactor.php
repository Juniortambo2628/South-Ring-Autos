<?php

namespace App\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;

class TwoFactor
{
    public static function generateSecret(): string
    {
        return (new Google2FA)->generateSecretKey();
    }

    public static function otpauthUrl(User $user, string $secret): string
    {
        $issuer = rawurlencode(config('app.name'));
        $label = rawurlencode(config('app.name') . ':' . $user->email);

        return "otpauth://totp/{$label}?secret={$secret}&issuer={$issuer}&algorithm=SHA1&digits=6&period=30";
    }

    public static function verifyTotp(string $secret, string $code): bool
    {
        return (new Google2FA)->verifyKey($secret, trim($code), 1);
    }

    public static function verify(User $user, string $code): bool
    {
        if ($user->hasTwoFactorSecret() && self::verifyTotp($user->two_factor_secret, $code)) {
            return true;
        }

        return self::consumeRecoveryCode($user, $code);
    }

    public static function consumeRecoveryCode(User $user, string $code): bool
    {
        $remaining = [];
        $consumed = false;

        foreach ($user->recoveryCodes() as $hash) {
            if (!$consumed && Hash::check(trim($code), $hash)) {
                $consumed = true;

                continue;
            }

            $remaining[] = $hash;
        }

        if ($consumed) {
            $user->setRecoveryCodes($remaining);
        }

        return $consumed;
    }

    public static function newRecoveryCodes(User $user): array
    {
        $plain = [];
        $hashed = [];

        for ($i = 0; $i < 10; $i++) {
            $code = Str::lower(Str::random(5)) . '-' . Str::lower(Str::random(5));
            $plain[] = $code;
            $hashed[] = Hash::make($code);
        }

        $user->setRecoveryCodes($hashed);

        return $plain;
    }
}
