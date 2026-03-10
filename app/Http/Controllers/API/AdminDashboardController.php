<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\User;
use App\Models\BlogPost;
use App\Models\ContactMessage;

class AdminDashboardController extends Controller
{
    public function stats(Request $request)
    {
        // Check if user is admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $stats = [
            'total_bookings' => Booking::count(),
            'pending_bookings' => Booking::where('status', 'pending')->count(),
            'total_users' => User::where('role', 'client')->count(),
            'total_posts' => BlogPost::count(),
            'new_messages' => ContactMessage::where('status', 'unread')->count(),
            'recent_bookings' => Booking::with(['user', 'vehicle'])
                ->latest()
                ->take(5)
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
