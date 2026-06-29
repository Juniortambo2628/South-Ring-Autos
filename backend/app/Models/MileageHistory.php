<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MileageHistory extends Model
{
    const UPDATED_AT = null;

    protected $table = 'mileage_history';

    protected $fillable = [
        'vehicle_id',
        'booking_id',
        'mileage',
        'recorded_date',
        'source',
        'notes',
    ];

    protected $casts = [
        'mileage' => 'integer',
        'recorded_date' => 'date',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
