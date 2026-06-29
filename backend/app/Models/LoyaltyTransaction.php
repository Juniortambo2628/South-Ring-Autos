<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoyaltyTransaction extends Model
{
    const UPDATED_AT = null;

    protected $table = 'loyalty_transactions';

    protected $fillable = [
        'client_id',
        'booking_id',
        'points_change',
        'transaction_type',
        'description',
        'created_by',
    ];

    protected $casts = [
        'points_change' => 'integer',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
