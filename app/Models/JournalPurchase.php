<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JournalPurchase extends Model
{
    protected $fillable = [
        'user_id',
        'journal_id',
        'payment_id',
        'purchased_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function journal()
    {
        return $this->belongsTo(Journal::class);
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }
}
