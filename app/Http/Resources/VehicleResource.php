<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehicleResource extends JsonResource
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
            'make' => $this->make,
            'model' => $this->model,
            'year' => $this->year,
            'registration' => $this->registration,
            'color' => $this->color,
            'vin' => $this->vin,
            'engine_size' => $this->engine_size,
            'fuel_type' => $this->fuel_type,
            'mileage' => $this->mileage,
            'thumbnail' => $this->thumbnail,
            'notes' => $this->notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Relationships / Computed
            'owner' => $this->whenLoaded('user', function () {
                return $this->user->name;
            }),
            'owner_email' => $this->whenLoaded('user', function () {
                return $this->user->email;
            }),
        ];
    }
}
