<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Vehicle;

class VehicleController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Fetch vehicles owned by this user via the clients table
        $client = DB::table('clients')->where('email', $user->email)->first();
        $vehicles = $client
            ? Vehicle::where('client_id', $client->id)->get()
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
            'registration' => 'required|string|unique:vehicles,registration',
            'color' => 'nullable|string',
            'mileage' => 'nullable|integer',
        ]);

        $user = $request->user();

        // Find or create the client record (vehicles FK references clients, not users)
        $client = DB::table('clients')->where('email', $user->email)->first();
        if (!$client) {
            $clientId = DB::table('clients')->insertGetId([
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            $clientId = $client->id;
        }

        $validated['client_id'] = $clientId;
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
        $vehicle = $request->user()->vehicles()->findOrFail($id);
        $vehicle->delete();

        return response()->json([
            'success' => true,
            'message' => 'Vehicle deleted successfully'
        ]);
    }
}
