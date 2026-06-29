<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\VehicleImage;
use App\Http\Resources\VehicleResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminVehicleController extends Controller
{
    public function index()
    {
        $vehicles = Vehicle::with('client')->latest()->get();

        return response()->json([
            'success' => true, 
            'data' => VehicleResource::collection($vehicles)
        ]);
    }

    public function destroy($id)
    {
        $vehicle = Vehicle::with('images')->findOrFail($id);

        foreach ($vehicle->images as $image) {
            $path = str_replace('storage/', '', $image->image_path);
            Storage::disk('public')->delete($path);
        }

        $vehicle->delete();

        return response()->json([
            'success' => true,
            'message' => 'Vehicle deleted successfully',
        ]);
    }
}
