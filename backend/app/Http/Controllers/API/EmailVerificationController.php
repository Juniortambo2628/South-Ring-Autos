<?php

namespace App\Http\Controllers\API;

use App\Actions\NotifyUser;
use App\Auth\AuthResponse;
use App\Auth\OneTimeCode;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EmailVerificationController extends Controller
{
    public function send(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($data)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid login details',
            ], 401);
        }

        $user = User::where('email', $data['email'])->firstOrFail();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'success' => false,
                'message' => 'This email is already verified.',
            ], 422);
        }

        $code = OneTimeCode::issue('email_verification', $user->email);
        $sent = NotifyUser::sendDynamicEmail($user->email, 'email_verification_code', [
            'name' => $user->name,
            'code' => $code,
        ]);

        if (!$sent) {
            return response()->json([
                'success' => false,
                'message' => 'The verification email could not be sent. Please try again later.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'A verification code has been sent to your email.',
        ]);
    }

    public function verify(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $user = User::where('email', $data['email'])->firstOrFail();

        if ($user->hasVerifiedEmail()) {
            return AuthResponse::make($user);
        }

        if (!OneTimeCode::verify('email_verification', $user->email, $data['code'])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired verification code.',
            ], 422);
        }

        $user->forceFill(['email_verified_at' => now()])->save();

        return AuthResponse::make($user);
    }
}
