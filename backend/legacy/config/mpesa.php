<?php
/**
 * MPESA API Configuration
 * 
 * This file contains the configuration for Safaricom MPESA STK Push API
 * 
 * SETUP INSTRUCTIONS:
 * 1. Register at https://developer.safaricom.co.ke/
 * 2. Create an app and get Consumer Key and Consumer Secret
 * 3. Get your Business Short Code (PayBill Number)
 * 4. Generate Passkey from Safaricom Developer Portal
 * 5. Update the credentials below
 * 6. For testing, use Sandbox credentials from Safaricom Developer Portal
 */

// Helper function to get environment variables
if (!function_exists('env')) {
    function env($key, $default = null) {
        $value = getenv($key);
        if ($value === false) {
            return $default;
        }
        return $value;
    }
}

return [
    // Environment: 'sandbox' or 'production'
    'environment' => env('MPESA_ENV') ?: 'sandbox',
    
    // Consumer Key and Secret from Safaricom Developer Portal
    'consumer_key' => env('MPESA_CONSUMER_KEY') ?: 'YOUR_CONSUMER_KEY',
    'consumer_secret' => env('MPESA_CONSUMER_SECRET') ?: 'YOUR_CONSUMER_SECRET',
    
    // Business Short Code (PayBill Number)
    'business_short_code' => env('MPESA_BUSINESS_SHORT_CODE') ?: '4072183',
    
    // Passkey from Safaricom Developer Portal (generate in portal)
    'passkey' => env('MPESA_PASSKEY') ?: 'YOUR_PASSKEY',
    
    // API URLs
    'base_url' => [
        'sandbox' => 'https://sandbox.safaricom.co.ke',
        'production' => 'https://api.safaricom.co.ke'
    ],
    
    // STK Push Callback URL (publicly accessible)
    'callback_url' => env('MPESA_CALLBACK_URL') ?: 'https://yourdomain.com/api/mpesa/callback.php',
    
    // Transaction Type
    'transaction_type' => 'CustomerPayBillOnline',
    
    // Account Reference (vehicle registration will be used)
    'account_reference' => 'SOUTHRINGAUTOS',
    
    // Transaction Description
    'transaction_desc' => 'South Ring Autos Service Payment',
];

