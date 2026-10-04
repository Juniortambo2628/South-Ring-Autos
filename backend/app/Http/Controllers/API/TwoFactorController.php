<?php

namespace App\Http\Controllers\API;

use App\Actions\NotifyUser;
use App\Auth\AuthResponse;
use App\Auth\LoginChallenge;
use App\Auth\TwoFactor;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class TwoFactorController extends Controller
{
    public function enable(Request $request)
    {
        $user = $request->user();

        if ($user->twoFactorEnabled()) {
            return response()->json([
                'success' => false,
                'message' => 'Two-factor authentication is already enabled.',
            ], 422);
        }

        $secret = TwoFactor::generateSecret();
        $user->forceFill(['two_factor_secret' => $secret, 'two_factor_confirmed_at' => null])->save();

        return response()->json([
            'success' => true,
            'secret' => $secret,
            'otpauth_url' => TwoFactor::otpauthUrl($user, $secret),
            'message' => 'Scan the QR code with your authenticator app, then confirm with a code.',
        ]);
    }

    public function confirm(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();

        if (!$user->hasTwoFactorSecret()) {
            return response()->json([
                'success' => false,
                'message' => 'Two-factor authentication has not been started.',
            ], 422);
        }

        if ($user->twoFactorEnabled()) {
            return response()->json([
                'success' => false,
                'message' => 'Two-factor authentication is already enabled.',
            ], 422);
        }

        if (!TwoFactor::verifyTotp($user->two_factor_secret, $data['code'])) {
            return response()->json([
                'success' => false,
                'message' => 'The code is invalid. Try again.',
            ], 422);
        }

        $user->forceFill(['two_factor_confirmed_at' => now()])->save();
        $recoveryCodes = TwoFactor::newRecoveryCodes($user);

        NotifyUser::sendDynamicEmail($user->email, 'two_factor_changed', [
            'name' => $user->name,
            'action' => 'two-factor authentication was enabled on your account',
        ]);

        return response()->json([
            'success' => true,
            'recovery_codes' => $recoveryCodes,
            'message' => 'Two-factor authentication is on. Store these recovery codes somewhere safe.',
        ]);
    }

    public function challenge(Request $request)
    {
        $data = $request->validate([
            'challenge_token' => 'required|string',
            'code' => 'required|string',
        ]);

        $user = LoginChallenge::user($data['challenge_token'], 'two_factor');

        if (!$user || !$user->twoFactorEnabled()) {
            return response()->json([
                'success' => false,
                'message' => 'The sign-in challenge is invalid or has expired.',
            ], 422);
        }

        if (!TwoFactor::verify($user, $data['code'])) {
            return response()->json([
                'success' => false,
                'message' => 'The code is invalid.',
            ], 422);
        }

        return AuthResponse::make($user, twoFactorSatisfied: true);
    }

    public function regenerateRecoveryCodes(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();

        if (!$user->twoFactorEnabled()) {
            return response()->json([
                'success' => false,
                'message' => 'Two-factor authentication is not enabled.',
            ], 422);
        }

        if (!TwoFactor::verifyTotp($user->two_factor_secret, $data['code'])) {
            return response()->json([
                'success' => false,
                'message' => 'The code is invalid.',
            ], 422);
        }

        $recoveryCodes = TwoFactor::newRecoveryCodes($user);

        return response()->json([
            'success' => true,
            'recovery_codes' => $recoveryCodes,
            'message' => 'New recovery codes generated. Previous codes no longer work.',
        ]);
    }

    public function disable(Request $request)
    {
        $data = $request->validate([
            'password' => 'required|string',
        ]);

        $user = $request->user();

        if (!Hash::check($data['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'The password is incorrect.',
            ], 422);
        }

        $user->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();

        NotifyUser::sendDynamicEmail($user->email, 'two_factor_changed', [
            'name' => $user->name,
            'action' => 'two-factor authentication was disabled on your account',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Two-factor authentication disabled.',
        ]);
    }
}
