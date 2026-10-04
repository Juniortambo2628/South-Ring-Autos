<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'avatar',
        'phone',
        'address',
        'role',
        'profile_completed',
        'loyalty_points',
        'membership_tier',
    ];

    public function client()
    {
        return $this->hasOne(Client::class, 'email', 'email');
    }

    public function vehicles()
    {
        return $this->hasManyThrough(
            Vehicle::class,
            Client::class,
            'email', // Foreign key on clients table
            'client_id', // Foreign key on vehicles table
            'email', // Local key on users table
            'id' // Local key on clients table
        );
    }

    public function bookings()
    {
        return $this->hasManyThrough(
            Booking::class,
            Client::class,
            'email', // Foreign key on clients table
            'client_id', // Foreign key on bookings table
            'email', // Local key on users table
            'id' // Local key on clients table
        );
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'profile_completed' => 'boolean',
            'two_factor_secret' => 'encrypted',
            'two_factor_recovery_codes' => 'encrypted',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function hasTwoFactorSecret(): bool
    {
        return filled($this->two_factor_secret);
    }

    public function twoFactorEnabled(): bool
    {
        return $this->hasTwoFactorSecret() && filled($this->two_factor_confirmed_at);
    }

    protected function getTwoFactorEnabledAttribute(): bool
    {
        return $this->twoFactorEnabled();
    }

    public function recoveryCodes(): array
    {
        return $this->two_factor_recovery_codes ? (json_decode($this->two_factor_recovery_codes, true) ?: []) : [];
    }

    public function setRecoveryCodes(array $codes): void
    {
        $this->forceFill(['two_factor_recovery_codes' => json_encode(array_values($codes))])->save();
    }

    public function journalPurchases()
    {
        return $this->hasMany(JournalPurchase::class);
    }
}
