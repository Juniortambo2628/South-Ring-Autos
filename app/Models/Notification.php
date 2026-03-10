<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'booking_id',
        'type',
        'title',
        'message',
        'read_status',
        'sent_email',
    ];

    protected $casts = [
        'read_status' => 'boolean',
        'sent_email' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
