<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Mail\AccountWelcomeMail;
use App\Mail\CustomResetPasswordMail;
use App\Models\LoyaltyPoint;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
            
            $user = User::where('google_id', $googleUser->id)
                        ->orWhere('email', $googleUser->email)
                        ->first();

            if ($user) {
                // Update google_id if it's missing (user matched by email)
                if (!$user->google_id) {
                    $user->update(['google_id' => $googleUser->id]);
                }
            } else {
                // Create a new user
                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'google_id' => $googleUser->id,
                    'avatar' => $googleUser->avatar,
                    'password' => Hash::make(Str::random(24)),
                    'role' => 'client',
                    'profile_completed' => false,
                ]);
            }

            // Provide starting loyalty points if enabled
            $welcomePoints = Setting::where('key', 'welcome_loyalty_points')->value('value') ?? 0;
            if ($welcomePoints > 0) {
                LoyaltyPoint::create([
                    'user_id' => $user->id,
                    'points' => $welcomePoints,
                    'transaction_type' => 'earned',
                    'description' => 'Welcome bonus for creating an account',
                ]);
            }

            try {
                Mail::to($user->email)->send(new AccountWelcomeMail($user));
            } catch (\Exception $e) {
                Log::error("Failed to send welcome email to {$user->email}: " . $e->getMessage());
            }

            Auth::login($user);
            $token = $user->createToken('auth_token')->plainTextToken;

            // Redirect to a frontend route with the token
            // In a real app, you might use a cookie or a secure redirect with query params
            // For this project, we'll redirect to a client-side route that handles the token
            return redirect('/auth/callback?token=' . $token . '&user=' . urlencode(json_encode($user)));

        } catch (\Exception $e) {
            return redirect('/login?error=social_auth_failed');
        }
    }
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'client',
            'profile_completed' => false,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    public function login(Request $request)
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid login details'
            ], 401);
        }

        $user = User::where('email', $request['email'])->firstOrFail();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    public function completeProfile(Request $request)
    {
        $request->validate([
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
        ]);

        $user = $request->user();
        $user->update([
            'phone' => $request->phone,
            'address' => $request->address,
            'profile_completed' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profile completed successfully',
            'user' => $user
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        
        $user = User::where('email', $request->email)->first();
        
        if (!$user) {
            // We return generic success to avoid email enumeration
            return response()->json(['message' => 'If your email is registered, you will receive a password reset link.']);
        }

        $token = Str::random(60);
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            ['token' => Hash::make($token), 'created_at' => now()]
        );

        try {
            Mail::to($request->email)->send(new CustomResetPasswordMail($token, $request->email));
            return response()->json(['message' => 'If your email is registered, you will receive a password reset link.']);
        } catch (\Exception $e) {
            Log::error("Failed to send password reset to {$request->email}: " . $e->getMessage());
            return response()->json(['message' => 'Failed to send password reset email. Please try again later.'], 500);
        }
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')->where('email', $request->email)->first();
        
        if (!$record || !Hash::check($request->token, $record->token)) {
            return response()->json(['message' => 'Invalid or expired reset token.'], 400);
        }

        if (\Carbon\Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['message' => 'Reset token has expired.'], 400);
        }

        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Password reset successful.']);
    }
}
