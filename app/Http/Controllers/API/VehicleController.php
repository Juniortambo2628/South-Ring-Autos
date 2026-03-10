<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Vehicle;

class VehicleController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user()->vehicles
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

        $vehicle = $request->user()->vehicles()->create($validated);

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
