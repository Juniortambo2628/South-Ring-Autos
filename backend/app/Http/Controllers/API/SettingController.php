<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * Keys that are safe to expose on the unauthenticated endpoint.
     * Anything else (payment credentials, SMTP passwords, API keys, …)
     * is only readable through GET /api/admin/settings.
     */
    private const PUBLIC_KEYS = [
        'company_name',
        'company_email',
        'company_phone',
        'company_address',
        'primary_color',
        'accent_color',
        'nav_links',
        'landing_page_sections',
        'landing_content',
    ];

    // Public read: whitelisted keys only.
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key');

        return response()->json([
            'success' => true,
            'settings' => $settings->only(self::PUBLIC_KEYS)
        ]);
    }

    // Admin read: every stored key (auth:sanctum + admin middleware).
    public function adminIndex()
    {
        return response()->json([
            'success' => true,
            'settings' => Setting::all()->pluck('value', 'key')
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
        ]);

        foreach ($validated['settings'] as $key => $value) {
            if (is_array($value)) {
                $value = json_encode($value);
            }
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Settings updated successfully'
        ]);
    }
}
