<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
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
        ];
    }

    public function journalPurchases()
    {
        return $this->hasMany(JournalPurchase::class);
    }
}
