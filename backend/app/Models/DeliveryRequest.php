<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryRequest extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'booking_id',
        'client_id',
        'type',
        'address',
        'city',
        'postal_code',
        'preferred_date',
        'preferred_time',
        'contact_phone',
        'special_instructions',
        'status',
        'assigned_to',
        'scheduled_date',
        'completed_at',
        'created_at',
    ];

    protected $casts = [
        'preferred_date' => 'date',
        'scheduled_date' => 'datetime',
        'completed_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
