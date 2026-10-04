<?php

namespace App\Auth;

use App\Models\User;
use Illuminate\Http\JsonResponse;

class AuthResponse
{
    public static function make(User $user, bool $twoFactorSatisfied = false): JsonResponse
    {
        if (!$user->hasVerifiedEmail()) {
            return response()->json([
                'success' => false,
                'status' => 'verification_required',
                'email' => $user->email,
                'message' => 'Please verify your email address to continue.',
            ], 202);
        }

        if (!$twoFactorSatisfied && $user->twoFactorEnabled()) {
            return response()->json([
                'success' => false,
                'status' => 'two_factor_required',
                'challenge_token' => LoginChallenge::issue($user, 'two_factor'),
                'message' => 'Two-factor authentication is required.',
            ], 202);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }
}
