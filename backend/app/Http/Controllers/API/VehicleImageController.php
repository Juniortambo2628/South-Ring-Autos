<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\VehicleImage;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VehicleImageController extends Controller
{
    public function index($vehicleId)
    {
        $vehicle = Vehicle::findOrFail($vehicleId);
        
        $clientId = auth()->user()->client?->id;
        if ($vehicle->client_id !== $clientId) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $vehicle->images()->orderBy('created_at', 'desc')->get()
        ]);
    }

    public function store(Request $request, $vehicleId)
    {
        $request->validate([
            'image' => 'required|image|max:10240',
        ]);

        $vehicle = Vehicle::findOrFail($vehicleId);

        $clientId = auth()->user()->client?->id;
        if ($vehicle->client_id !== $clientId) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        $imagePath = $request->file('image')->store('vehicles/gallery', 'public');
        
        $isPrimary = $vehicle->images()->count() === 0;

        $vehicleImage = $vehicle->images()->create([
            'image_path' => 'storage/' . $imagePath,
            'is_primary' => $isPrimary
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Image uploaded successfully',
            'data' => $vehicleImage
        ], 201);
    }

    public function destroy($vehicleId, $imageId)
    {
        $vehicle = Vehicle::findOrFail($vehicleId);
        
        $clientId = auth()->user()->client?->id;
        if ($vehicle->client_id !== $clientId) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        $image = VehicleImage::where('vehicle_id', $vehicleId)->findOrFail($imageId);

        $path = str_replace('storage/', '', $image->image_path);
        Storage::disk('public')->delete($path);

        $image->delete();

        return response()->json([
            'success' => true,
            'message' => 'Image deleted successfully'
        ]);
    }
}
