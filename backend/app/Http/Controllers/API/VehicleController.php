<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Vehicle;
use App\Traits\ResolvesClient;

class VehicleController extends Controller
{
    use ResolvesClient;

    public function index(Request $request)
    {
        $user = $request->user();
        $clientId = $this->resolveClientIdByEmail($user->email);

        $vehicles = $clientId
            ? Vehicle::where('client_id', $clientId)->get()
            : collect([]);

        return response()->json([
            'success' => true,
            'data' => $vehicles
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'make' => 'required|string',
            'model' => 'required|string',
            'year' => 'nullable|integer',
            'registration' => 'required|string',
            'color' => 'nullable|string',
            'fuel_type' => 'nullable|string',
            'mileage' => 'nullable|integer',
        ]);

        $user = $request->user();
        $client = $this->resolveOrCreateClient($user);

        $existing = Vehicle::where('client_id', $client->id)
            ->where('registration', $validated['registration'])->exists();
        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'A vehicle with this registration is already registered to your account.',
            ], 422);
        }

        $validated['client_id'] = $client->id;
        $vehicle = Vehicle::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Vehicle registered successfully',
            'data' => $vehicle
        ]);
    }

    public function show($id, Request $request)
    {
        $vehicle = $request->user()->vehicles()->findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => $vehicle
        ]);
    }

    public function update(Request $request, $id)
    {
        $vehicle = $request->user()->vehicles()->findOrFail($id);

        $validated = $request->validate([
            'make' => 'nullable|string',
            'model' => 'nullable|string',
            'year' => 'nullable|integer',
            'registration' => 'nullable|string|unique:vehicles,registration,' . $id,
            'color' => 'nullable|string',
            'mileage' => 'nullable|integer',
            'vin' => 'nullable|string',
            'engine_size' => 'nullable|string',
            'fuel_type' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $vehicle->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Vehicle updated successfully',
            'data' => $vehicle
        ]);
    }

    public function destroy($id, Request $request)
    {
        $vehicle = $request->user()->vehicles()->with('images')->findOrFail($id);

        // Clean up vehicle images from storage
        foreach ($vehicle->images as $image) {
            $path = str_replace('storage/', '', $image->image_path);
            Storage::disk('public')->delete($path);
        }

        // Clean up vehicle thumbnail from storage
        if ($vehicle->thumbnail) {
            $thumbPath = str_replace('storage/', '', $vehicle->thumbnail);
            Storage::disk('public')->delete($thumbPath);
        }

        $vehicle->delete();

        return response()->json([
            'success' => true,
            'message' => 'Vehicle deleted successfully'
        ]);
    }
}
