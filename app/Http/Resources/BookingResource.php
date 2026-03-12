<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
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
            'client_id' => $this->client_id,
            'vehicle_id' => $this->vehicle_id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'registration' => $this->registration,
            'service' => $this->service,
            'date' => $this->date,
            'message' => $this->message,
            'status' => $this->status,
            'estimated_cost' => $this->estimated_cost,
            'actual_cost' => $this->actual_cost,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Loaded Relationships
            'client' => $this->whenLoaded('client'),
            'vehicle' => new VehicleResource($this->whenLoaded('vehicle')),
        ];
    }
}
