<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\User;
use App\Http\Resources\VehicleResource;
use Illuminate\Http\Request;

class AdminVehicleController extends Controller
{
    public function index()
    {
        $vehicles = Vehicle::with('user')->latest()->get();

        return response()->json([
            'success' => true, 
            'data' => VehicleResource::collection($vehicles)
        ]);
    }
}
