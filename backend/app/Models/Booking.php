<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    const UPDATED_AT = null;
    
    protected $fillable = [
        'client_id',
        'user_id',
        'vehicle_id',
        'name',
        'phone',
        'email',
        'registration',
        'vehicle_make',
        'vehicle_model',
        'vehicle_year',
        'service',
        'date',
        'preferred_time',
        'message',
        'status',
        'estimated_cost',
        'actual_cost',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
