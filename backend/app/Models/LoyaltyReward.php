<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoyaltyReward extends Model
{
    protected $fillable = [
        'name',
        'description',
        'points_required',
        'reward_type',
        'reward_value',
        'max_redemptions_per_client',
        'is_active',
        'valid_from',
        'valid_until',
    ];

    protected $casts = [
        'points_required' => 'integer',
        'reward_value' => 'decimal:2',
        'max_redemptions_per_client' => 'integer',
        'is_active' => 'boolean',
        'valid_from' => 'date',
        'valid_until' => 'date',
    ];
}
