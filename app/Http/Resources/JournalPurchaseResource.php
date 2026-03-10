<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JournalPurchaseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'journal_id' => $this->journal_id,
            'payment_id' => $this->payment_id,
            'purchased_at' => $this->purchased_at,
            'journal' => new JournalResource($this->whenLoaded('journal')),
            'user' => $this->whenLoaded('user'), // Assuming simple user object is fine
            'payment' => $this->whenLoaded('payment'),
        ];
    }
}
