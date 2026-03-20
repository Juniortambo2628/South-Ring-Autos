<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Journal extends Model
{
    protected $fillable = [
        'year',
        'title',
        'description',
        'price',
        'cover_image',
        'is_active',
        'offers',
    ];

    public function purchases()
    {
        return $this->hasMany(JournalPurchase::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function featuredBlogs()
    {
        return $this->belongsToMany(BlogPost::class, 'blog_post_journal');
    }
}
