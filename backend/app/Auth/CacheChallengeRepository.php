<?php

namespace App\Auth;

use Illuminate\Support\Facades\Cache;
use Laragear\WebAuthn\Assertion\Creator\AssertionCreation;
use Laragear\WebAuthn\Assertion\Validator\AssertionValidation;
use Laragear\WebAuthn\Attestation\Creator\AttestationCreation;
use Laragear\WebAuthn\Attestation\Validator\AttestationValidation;
use Laragear\WebAuthn\Challenge\Challenge;
use Laragear\WebAuthn\Contracts\WebAuthnChallengeRepository;

class CacheChallengeRepository implements WebAuthnChallengeRepository
{
    public function store(AttestationCreation|AssertionCreation $ceremony, Challenge $challenge): void
    {
        Cache::put(
            $this->key($challenge->data->getBinaryString()),
            $challenge->toArray(),
            $challenge->timeout + 30
        );
    }

    public function pull(AttestationValidation|AssertionValidation $ceremony): ?Challenge
    {
        $clientData = $ceremony->clientDataJson;

        if (!$clientData) {
            return null;
        }

        $stored = Cache::pull($this->key($clientData->challenge->getBinaryString()));

        if (!is_array($stored)) {
            return null;
        }

        $challenge = Challenge::fromArray($stored);

        return $challenge->isValid() ? $challenge : null;
    }

    private function key(string $bytes): string
    {
        return 'webauthn:challenge:' . hash('sha256', $bytes);
    }
}
