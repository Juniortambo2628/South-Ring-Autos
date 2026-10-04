<?php

namespace App\Providers;

use App\Auth\CacheChallengeRepository;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Laragear\WebAuthn\Contracts\WebAuthnChallengeRepository;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Stateless ceremonies: challenges live in the cache, keyed by their own
        // random bytes, instead of the package's session-backed repository.
        $this->app->bind(WebAuthnChallengeRepository::class, CacheChallengeRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);
    }
}
