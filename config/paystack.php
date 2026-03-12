<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Paystack Configuration
    |--------------------------------------------------------------------------
    |
    | Keys can be set via .env or managed through the admin settings UI.
    | Admin-configured keys (stored in the settings table) take priority.
    |
    */
    'secret_key' => env('PAYSTACK_SECRET_KEY', ''),
    'public_key' => env('PAYSTACK_PUBLIC_KEY', ''),
    'base_url' => 'https://api.paystack.co',
    'callback_url' => env('PAYSTACK_CALLBACK_URL', ''),
];
