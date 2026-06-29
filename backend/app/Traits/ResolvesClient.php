<?php

namespace App\Traits;

use App\Models\User;
use Illuminate\Support\Facades\DB;

trait ResolvesClient
{
    protected function resolveClientByEmail(string $email): ?object
    {
        return DB::table('clients')->where('email', $email)->first();
    }

    protected function resolveClientIdByEmail(string $email): ?int
    {
        $client = $this->resolveClientByEmail($email);
        return $client ? $client->id : null;
    }

    protected function resolveOrCreateClient(User $user): object
    {
        $client = $this->resolveClientByEmail($user->email);

        if (!$client) {
            $clientId = DB::table('clients')->insertGetId([
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return (object) [
                'id' => $clientId,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
            ];
        }

        return $client;
    }
}
