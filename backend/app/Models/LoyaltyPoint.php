<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoyaltyPoint extends Model
{
    protected $table = 'loyalty_points';

    protected $fillable = [
        'client_id',
        'points_earned',
        'points_redeemed',
        'lifetime_points',
        'tier',
    ];

    protected $casts = [
        'points_earned' => 'integer',
        'points_redeemed' => 'integer',
        'lifetime_points' => 'integer',
    ];
}
