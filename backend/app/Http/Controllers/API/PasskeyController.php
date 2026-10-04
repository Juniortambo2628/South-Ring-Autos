<?php

namespace App\Http\Controllers\API;

use App\Auth\AuthResponse;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\Request;
use Laragear\WebAuthn\Assertion\Validator\AssertionValidation;
use Laragear\WebAuthn\Assertion\Validator\AssertionValidator;
use Laragear\WebAuthn\Contracts\WebAuthnAuthenticatable;
use Laragear\WebAuthn\Http\Requests\AttestationRequest;
use Laragear\WebAuthn\Http\Requests\AttestedRequest;
use Laragear\WebAuthn\Http\Requests\AssertionRequest;
use Laragear\WebAuthn\JsonTransport;

class PasskeyController extends Controller
{
    public function registerOptions(AttestationRequest $request): Responsable
    {
        return $request->secureRegistration()->toCreate();
    }

    public function register(AttestedRequest $request)
    {
        $id = $request->save([
            'alias' => $request->input('alias') ?: 'Passkey ' . now()->format('M j, Y'),
        ]);

        return response()->json([
            'success' => true,
            'id' => $id,
            'message' => 'Passkey registered.',
        ]);
    }

    public function index(Request $request)
    {
        $passkeys = $request->user()
            ->webAuthnCredentials()
            ->orderByDesc('created_at')
            ->get(['id', 'alias', 'created_at', 'disabled_at']);

        return response()->json([
            'success' => true,
            'passkeys' => $passkeys,
        ]);
    }

    public function destroy(Request $request, string $id)
    {
        $credential = $request->user()->webAuthnCredentials()->whereKey($id)->first();

        if (!$credential) {
            return response()->json([
                'success' => false,
                'message' => 'Passkey not found.',
            ], 404);
        }

        $credential->delete();

        return response()->json([
            'success' => true,
            'message' => 'Passkey removed.',
        ]);
    }

    public function loginOptions(Request $request, AssertionRequest $assertion)
    {
        $data = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user instanceof WebAuthnAuthenticatable || !$user->webAuthnCredentials()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'No passkey found for this email.',
            ], 422);
        }

        return $assertion->toVerify($user);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'id' => 'required|string',
            'rawId' => 'required|string',
            'response' => 'required|array',
            'response.authenticatorData' => 'required|string',
            'response.clientDataJSON' => 'required|string',
            'response.signature' => 'required|string',
            'response.userHandle' => 'sometimes|nullable',
            'type' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Passkey sign-in failed.',
            ], 422);
        }

        $validation = new AssertionValidation(
            new JsonTransport($request->only(AssertionValidation::REQUEST_KEYS)),
            $user
        );

        $validated = app(AssertionValidator::class)
            ->send($validation)
            ->thenReturn();

        $authenticated = $validated->credential->authenticatable;

        if (!$authenticated instanceof User) {
            return response()->json([
                'success' => false,
                'message' => 'Passkey sign-in failed.',
            ], 422);
        }

        return AuthResponse::make($authenticated, twoFactorSatisfied: true);
    }
}
