<?php

return [

    /*
     |--------------------------------------------------------------------------
     | Cross-Origin Resource Sharing (CORS) Configuration
     |--------------------------------------------------------------------------
     */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'images/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        env('FRONTEND_URL', 'http://localhost:3000'),
        'https://southringautos.com',
        'https://www.southringautos.com',
        'https://api.southringautos.com',
        'https://southringautos.com/api',
        'https://www.southringautos.com/api',
    ],

    'allowed_origins_patterns' => [
        '/^https:\/\/(www\.)?southringautos\.com$/',
        '/^https:\/\/.*\.southringautos\.com$/',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
