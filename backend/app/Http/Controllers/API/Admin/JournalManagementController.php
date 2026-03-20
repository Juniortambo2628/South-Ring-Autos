<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Journal;
use App\Models\Payment;
use App\Http\Resources\JournalResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class JournalManagementController extends Controller
{
    public function index()
    {
        $journals = Journal::withCount('purchases')->orderBy('year', 'desc')->get();
        $totalRevenue = Payment::where('payment_type', 'journal')->where('status', 'completed')->sum('amount');
        
        return JournalResource::collection($journals)->additional([
            'success' => true,
            'stats' => [
                'total_revenue' => $totalRevenue,
                'total_sales' => $journals->sum('purchases_count')
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'year' => 'required|integer|unique:journals,year',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = $request->except(['cover_image']);
        
        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')->store('journals/covers', 'public');
            $data['cover_image'] = Storage::url($path);
        }

        $journal = Journal::create($data);

        return (new JournalResource($journal))->additional([
            'success' => true,
            'message' => 'Journal created successfully'
        ]);
    }

    public function update(Request $request, $id)
    {
        $journal = Journal::findOrFail($id);
        
        $request->validate([
            'year' => 'required|integer|unique:journals,year,'.$id,
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'is_active' => 'boolean',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = $request->except(['cover_image']);
        
        if ($request->hasFile('cover_image')) {
            // Delete old image if exists
            if ($journal->cover_image) {
                $oldPath = str_replace('/storage/', '', $journal->cover_image);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('cover_image')->store('journals/covers', 'public');
            $data['cover_image'] = Storage::url($path);
        }

        $journal->update($data);

        return (new JournalResource($journal))->additional([
            'success' => true,
            'message' => 'Journal updated successfully'
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $journal = Journal::findOrFail($id);
        
        $request->validate([
            'is_active' => 'required|boolean',
        ]);

        $journal->update([
            'is_active' => $request->is_active
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status updated successfully'
        ]);
    }

    public function destroy($id)
    {
        $journal = Journal::findOrFail($id);
        
        // Check if it has purchases
        if ($journal->purchases()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete journal with active purchases. Deactivate it instead.'
            ], 400);
        }

        if ($journal->cover_image) {
            $oldPath = str_replace('/storage/', '', $journal->cover_image);
            Storage::disk('public')->delete($oldPath);
        }

        $journal->delete();

        return response()->json([
            'success' => true,
            'message' => 'Journal deleted successfully'
        ]);
    }

    public function getBlogs($id)
    {
        $journal = Journal::findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $journal->featuredBlogs()->get()
        ]);
    }

    public function attachBlog(Request $request, $id)
    {
        $request->validate([
            'blog_id' => 'required|exists:blog_posts,id'
        ]);

        $journal = Journal::findOrFail($id);
        
        // Sync without detaching adds the link without removing existing ones
        $journal->featuredBlogs()->syncWithoutDetaching([$request->blog_id]);

        return response()->json([
            'success' => true,
            'message' => 'Blog attached to journal successfully',
            'data' => $journal->featuredBlogs()->get()
        ]);
    }

    public function detachBlog($id, $blogId)
    {
        $journal = Journal::findOrFail($id);
        $journal->featuredBlogs()->detach($blogId);

        return response()->json([
            'success' => true,
            'message' => 'Blog removed from journal successfully',
            'data' => $journal->featuredBlogs()->get()
        ]);
    }
}
