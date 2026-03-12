<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;

// Auth Routes for Socialite
Route::get('/auth/google', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

// No catch-all route needed - backend is API-only on cPanel
// Frontend is served by Vercel (Next.js)
