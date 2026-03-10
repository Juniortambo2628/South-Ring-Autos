<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $fillable = [
        'client_id',
        'make',
        'model',
        'year',
        'registration',
        'color',
        'vin',
        'engine_size',
        'fuel_type',
        'mileage',
        'thumbnail',
        'notes',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function images()
    {
        return $this->hasMany(VehicleImage::class);
    }
}
