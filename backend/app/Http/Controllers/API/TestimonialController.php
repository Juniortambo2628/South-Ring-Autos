<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use Illuminate\Http\Request;

class TestimonialController extends Controller
{
    // Public: List active testimonials for landing page
    public function index()
    {
        $testimonials = Testimonial::where('is_active', true)->latest()->get();
        return response()->json(['success' => true, 'data' => $testimonials]);
    }

    // Admin: List all testimonials
    public function adminIndex()
    {
        $testimonials = Testimonial::latest()->get();
        return response()->json(['success' => true, 'data' => $testimonials]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'content' => 'required|string',
            'image_url' => 'nullable|string',
            'rating' => 'required|integer|min:1|max:5',
            'is_active' => 'boolean',
        ]);

        $testimonial = Testimonial::create($validated);

        return response()->json(['success' => true, 'message' => 'Testimonial created', 'data' => $testimonial], 201);
    }

    public function update(Request $request, $id)
    {
        $testimonial = Testimonial::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'role' => 'string|max:255',
            'content' => 'string',
            'image_url' => 'nullable|string',
            'rating' => 'integer|min:1|max:5',
            'is_active' => 'boolean',
        ]);

        $testimonial->update($validated);

        return response()->json(['success' => true, 'message' => 'Testimonial updated', 'data' => $testimonial]);
    }

    public function destroy($id)
    {
        $testimonial = Testimonial::findOrFail($id);
        $testimonial->delete();

        return response()->json(['success' => true, 'message' => 'Testimonial deleted']);
    }

    public function toggleStatus($id)
    {
        $testimonial = Testimonial::findOrFail($id);
        $testimonial->update(['is_active' => !$testimonial->is_active]);

        return response()->json(['success' => true, 'message' => 'Testimonial status updated', 'data' => $testimonial]);
    }
}
