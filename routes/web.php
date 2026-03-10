<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;

// Auth Routes for Socialite
Route::get('/auth/google', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

// All other routes point to the React App
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
