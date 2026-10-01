<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\CarBrand;
use Illuminate\Http\Request;

class CarBrandController extends Controller
{
    // Public: active brands for the landing page carousel
    public function index()
    {
        $brands = CarBrand::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json(['success' => true, 'data' => $brands]);
    }

    // Admin: every brand, ordered
    public function adminIndex()
    {
        $brands = CarBrand::orderBy('sort_order')->orderBy('name')->get();

        return response()->json(['success' => true, 'data' => $brands]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'logo' => 'required|string|max:500',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $brand = CarBrand::create($validated);

        return response()->json(['success' => true, 'message' => 'Brand created', 'data' => $brand], 201);
    }

    public function update(Request $request, $id)
    {
        $brand = CarBrand::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'logo' => 'sometimes|required|string|max:500',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $brand->update($validated);

        return response()->json(['success' => true, 'message' => 'Brand updated', 'data' => $brand]);
    }

    public function destroy($id)
    {
        $brand = CarBrand::findOrFail($id);
        $brand->delete();

        return response()->json(['success' => true, 'message' => 'Brand deleted']);
    }

    public function toggleStatus($id)
    {
        $brand = CarBrand::findOrFail($id);
        $brand->update(['is_active' => !$brand->is_active]);

        return response()->json(['success' => true, 'message' => 'Brand updated', 'data' => $brand]);
    }
}
