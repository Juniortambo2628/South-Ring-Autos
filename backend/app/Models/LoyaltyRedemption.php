<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoyaltyRedemption extends Model
{
    protected $fillable = [
        'client_id',
        'reward_id',
        'booking_id',
        'points_spent',
        'discount_applied',
        'status',
        'redeemed_at',
        'applied_at',
        'cancelled_at',
    ];

    protected $casts = [
        'points_spent' => 'integer',
        'discount_applied' => 'decimal:2',
        'redeemed_at' => 'datetime',
        'applied_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function reward()
    {
        return $this->belongsTo(LoyaltyReward::class, 'reward_id');
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
