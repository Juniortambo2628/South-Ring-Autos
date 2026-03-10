<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Http\Resources\ContactMessageResource;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function index()
    {
        $messages = ContactMessage::latest()->get();
        return response()->json(['success' => true, 'data' => ContactMessageResource::collection($messages)]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:100',
            'phone' => 'nullable|string|max:20',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $message = ContactMessage::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Your message has been sent successfully.',
            'data' => $message
        ], 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:unread,read,archived',
        ]);

        $message = ContactMessage::findOrFail($id);
        $message->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Message status updated successfully',
            'data' => $message
        ]);
    }

    public function destroy($id)
    {
        $message = ContactMessage::findOrFail($id);
        $message->delete();

        return response()->json([
            'success' => true,
            'message' => 'Message deleted successfully'
        ]);
    }
}
