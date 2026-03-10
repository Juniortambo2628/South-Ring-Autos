<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RepairProgress extends Model
{
    public $timestamps = false;
    
    protected $table = 'repair_progress';

    protected $fillable = [
        'booking_id',
        'stage',
        'description',
        'progress_percentage',
        'updated_by',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
