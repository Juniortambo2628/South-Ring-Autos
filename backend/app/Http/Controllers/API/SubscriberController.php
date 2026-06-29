<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Subscriber;
use Illuminate\Http\Request;

class SubscriberController extends Controller
{
    public function subscribe(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:subscribers,email'
        ]);

        Subscriber::create([
            'email' => $request->email,
            'is_active' => true
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Successfully subscribed to the newsletter!'
        ]);
    }

    public function adminIndex()
    {
        $subscribers = Subscriber::latest()->get();
        $activeCount = Subscriber::where('is_active', true)->count();

        return response()->json([
            'success' => true,
            'data' => $subscribers,
            'stats' => [
                'total' => $subscribers->count(),
                'active' => $activeCount,
                'inactive' => $subscribers->count() - $activeCount,
            ],
        ]);
    }

    public function toggleStatus($id)
    {
        $subscriber = Subscriber::findOrFail($id);
        $subscriber->update(['is_active' => !$subscriber->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'Subscriber status updated',
            'data' => $subscriber,
        ]);
    }

    public function destroy($id)
    {
        $subscriber = Subscriber::findOrFail($id);
        $subscriber->delete();

        return response()->json([
            'success' => true,
            'message' => 'Subscriber deleted',
        ]);
    }
}
