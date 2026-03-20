<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Models\Subscriber;
use App\Mail\NewsletterBlogPostMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class BlogController extends Controller
{
    public function index(Request $request)
    {
        $query = BlogPost::query();
        $currentYear = now()->year;
        
        if ($request->has('year')) {
            $query->whereYear('created_at', $request->year);
        }

        if (!$request->has('admin')) {
            $query->where('status', 'published');
        }

        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->has('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->where(function($q) use ($searchTerm) {
                $q->where('title', 'like', $searchTerm)
                  ->orWhere('content', 'like', $searchTerm);
            });
        }

        $posts = $query->latest()->paginate(10);

        return response()->json([
            'success' => true,
            'posts' => $posts->items(),
            'pagination' => [
                'current_page' => $posts->currentPage(),
                'total_pages' => $posts->lastPage(),
                'total_posts' => $posts->total(),
            ]
        ]);
    }

    public function show(Request $request, $id) // Accept Request to manually authenticate
    {
        // Manually authenticate if token is present
        if ($request->bearerToken()) {
            \auth('sanctum')->authenticate();
        }

        $post = BlogPost::find($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Post not found'
            ], 404);
        }

        // Access Control
        $postYear = $post->created_at->year;
        $currentYear = now()->year;
        
        $hasAccess = true; // Assume true initially
        $journalId = null;

        // Determine if we should gate this post based on access_tier or year fallback
        $shouldGate = false;
        if ($post->access_tier === 'premium') {
            $shouldGate = true;
        } elseif ($post->access_tier === 'auto' && $postYear < $currentYear) {
            $shouldGate = true;
        } // 'free' means $shouldGate remains false

        if ($shouldGate) {
            // Find the journal for this post's year (even if it's current year premium, it goes to that year's journal)
            $journal = \App\Models\Journal::where('year', $postYear)->first();
            if ($journal) {
                $journalId = $journal->id;
            }

            $user = auth('sanctum')->user();
            
            if (!$user) {
                $hasAccess = false;
            } else {
                // Admins have bypass
                if ($user->role === 'admin' || $user->email === 'admin@southringautos.com') {
                    $hasAccess = true;
                } else {
                    $hasAccess = \App\Models\JournalPurchase::where('user_id', $user->id)
                        ->whereHas('journal', function($q) use ($postYear) {
                            $q->where('year', $postYear);
                        })->exists();
                }
            }

            if (!$hasAccess) {
                // Strip the exact content so they only see the excerpt/metadata
                $post->content = null; 
            }
        } 

        // Append these dynamic attributes to the response model temporarily
        $post->setAttribute('has_access', $hasAccess);
        $post->setAttribute('journal_id', $journalId);

        return response()->json([
            'success' => true,
            'post' => $post
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string',
            'category' => 'required|string',
            'image' => 'nullable|image|max:5120',
            'status' => 'required|string|in:draft,published',
            'access_tier' => 'nullable|string|in:auto,free,premium',
        ]);

        if (!isset($validated['access_tier'])) {
            $validated['access_tier'] = 'auto';
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('blog', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $post = BlogPost::create($validated);

        // Notify subscribers if published immediately
        if ($post->status === 'published') {
            $subscribers = Subscriber::where('is_active', true)->get();
            foreach ($subscribers as $subscriber) {
                try {
                    Mail::to($subscriber->email)->send(new NewsletterBlogPostMail($post));
                } catch (\Exception $e) {
                    Log::error("Failed to send newsletter to {$subscriber->email}: " . $e->getMessage());
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Blog post created successfully',
            'post' => $post
        ]);
    }

    public function update(Request $request, $id)
    {
        $post = BlogPost::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string',
            'category' => 'required|string',
            'image' => 'nullable|image|max:5120',
            'status' => 'required|string|in:draft,published',
            'access_tier' => 'nullable|string|in:auto,free,premium',
        ]);

        if (!isset($validated['access_tier'])) {
            $validated['access_tier'] = 'auto';
        }

        if ($request->hasFile('image')) {
            // Optionally delete old image here if desired
            $path = $request->file('image')->store('blog', 'public');
            $validated['image'] = '/storage/' . $path;
        } else {
             // If no new image was uploaded, remove 'image' from $validated so it doesn't overwrite the existing one with null.
             // If they explicitly wanted to remove the image, they would send a specific field, but our UI doesn't allow removing it entirely once uploaded yet without sending a new one, or we can handle a `remove_image` flag.
             if (!array_key_exists('image', $validated) || is_null($validated['image'])) {
                  unset($validated['image']); 
             }
        }

        $oldStatus = $post->status;
        $post->update($validated);

        // Notify subscribers if transitioning from draft to published
        if ($oldStatus === 'draft' && $post->status === 'published') {
            $subscribers = Subscriber::where('is_active', true)->get();
            foreach ($subscribers as $subscriber) {
                try {
                    Mail::to($subscriber->email)->send(new NewsletterBlogPostMail($post));
                } catch (\Exception $e) {
                    Log::error("Failed to send newsletter to {$subscriber->email}: " . $e->getMessage());
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Blog post updated successfully',
            'post' => $post
        ]);
    }

    public function destroy($id)
    {
        $post = BlogPost::findOrFail($id);
        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'Blog post deleted successfully'
        ]);
    }

    public function latest()
    {
        $posts = BlogPost::where('status', 'published')->latest()->limit(5)->get();
        return response()->json(['success' => true, 'posts' => $posts]);
    }
}
