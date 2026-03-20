<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlogPost extends Model
{
    protected $fillable = [
        'title',
        'content',
        'excerpt',
        'category',
        'image',
        'status',
        'access_tier',
    ];

    public function featuredInJournals()
    {
        return $this->belongsToMany(Journal::class, 'blog_post_journal');
    }
}
