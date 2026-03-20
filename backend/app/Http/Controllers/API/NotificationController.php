<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $notifications = $user->notifications()->latest()->take(20)->get();
        // Laravel standard notifications store fields in a 'data' json column
        // We'll map them for easier frontend consumption
        $mapped = $notifications->map(function ($n) {
            return [
                'id' => $n->id,
                'title' => $n->data['title'] ?? 'Notification',
                'message' => $n->data['message'] ?? '',
                'type' => $n->data['type'] ?? 'info',
                'link' => $n->data['link'] ?? null,
                'read_at' => $n->read_at,
                'created_at' => $n->created_at,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'unread' => $mapped->whereNull('read_at')->values(),
                'all' => $mapped,
                'unread_count' => $user->unreadNotifications()->count()
            ]
        ]);
    }

    public function getUnreadCount(Request $request)
    {
        return response()->json([
            'success' => true,
            'count' => $request->user()->unreadNotifications()->count()
        ]);
    }

    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read'
        ]);
    }

    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read'
        ]);
    }

    public function destroyAll(Request $request)
    {
        $request->user()->notifications()->delete();

        return response()->json([
            'success' => true,
            'message' => 'All notifications deleted'
        ]);
    }
}
