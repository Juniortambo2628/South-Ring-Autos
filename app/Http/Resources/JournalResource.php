<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JournalResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $hasAccess = false;
        $user = $request->user('sanctum');

        if ($this->year == \Carbon\Carbon::now()->year) {
            $hasAccess = true;
        } elseif ($user) {
            if ($user->role === 'admin' || $user->email === 'admin@southringautos.com') {
                $hasAccess = true;
            } else {
                $hasAccess = \App\Models\JournalPurchase::where('user_id', $user->id)
                    ->where('journal_id', $this->id)
                    ->exists();
            }
        }

        return [
            'id' => $this->id,
            'year' => (int) $this->year,
            'title' => $this->title,
            'description' => $this->description,
            'price' => (float) $this->price,
            'cover_image' => $this->cover_image,
            'is_active' => (bool) $this->is_active,
            'offers' => $this->offers,
            'has_access' => $hasAccess,
            'purchases_count' => $this->whenCounted('purchases'),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}
