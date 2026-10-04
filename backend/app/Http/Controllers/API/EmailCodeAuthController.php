<?php

namespace App\Http\Controllers\API;

use App\Actions\NotifyUser;
use App\Auth\AuthResponse;
use App\Auth\OneTimeCode;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class EmailCodeAuthController extends Controller
{
    public function send(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $data['email'])->first();

        if ($user && $user->hasVerifiedEmail()) {
            $code = OneTimeCode::issue('email_login', $user->email);
            NotifyUser::sendDynamicEmail($user->email, 'email_login_code', [
                'name' => $user->name,
                'code' => $code,
            ]);
        }

        // Same response whether or not the account exists, to prevent email enumeration.
        return response()->json([
            'success' => true,
            'message' => 'If an account exists for this email, a sign-in code has been sent.',
        ]);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !OneTimeCode::verify('email_login', $user->email, $data['code'])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired sign-in code.',
            ], 422);
        }

        return AuthResponse::make($user);
    }
}
