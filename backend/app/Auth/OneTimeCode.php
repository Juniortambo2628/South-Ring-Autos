<?php

namespace App\Auth;

use Illuminate\Support\Facades\Cache;

class OneTimeCode
{
    public const TTL_MINUTES = [
        'email_verification' => 15,
        'email_login' => 10,
    ];

    private const MAX_ATTEMPTS = 5;

    public static function issue(string $purpose, string $subject): string
    {
        $code = (string) random_int(100000, 999999);
        $ttl = self::TTL_MINUTES[$purpose] ?? 10;

        Cache::put(self::codeKey($purpose, $subject), hash('sha256', $code), now()->addMinutes($ttl));
        Cache::put(self::attemptsKey($purpose, $subject), 0, now()->addMinutes($ttl));

        return $code;
    }

    public static function verify(string $purpose, string $subject, string $code): bool
    {
        $stored = Cache::get(self::codeKey($purpose, $subject));
        $attempts = (int) Cache::get(self::attemptsKey($purpose, $subject), 0);

        if (!$stored || $attempts >= self::MAX_ATTEMPTS) {
            self::forget($purpose, $subject);

            return false;
        }

        if (!hash_equals($stored, hash('sha256', trim($code)))) {
            Cache::put(self::attemptsKey($purpose, $subject), $attempts + 1, now()->addMinutes(self::TTL_MINUTES[$purpose] ?? 10));

            return false;
        }

        self::forget($purpose, $subject);

        return true;
    }

    public static function forget(string $purpose, string $subject): void
    {
        Cache::forget(self::codeKey($purpose, $subject));
        Cache::forget(self::attemptsKey($purpose, $subject));
    }

    private static function codeKey(string $purpose, string $subject): string
    {
        return 'one_time_code:' . $purpose . ':' . $subject;
    }

    private static function attemptsKey(string $purpose, string $subject): string
    {
        return 'one_time_code_attempts:' . $purpose . ':' . $subject;
    }
}
