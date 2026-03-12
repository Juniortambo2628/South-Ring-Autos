<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\BookingController;
use App\Http\Controllers\API\BlogController;
use App\Http\Controllers\API\ContactController;
use App\Http\Controllers\API\PaymentController;
use App\Http\Controllers\API\RepairProgressController;
use App\Http\Controllers\API\DeliveryController;
use App\Http\Controllers\API\AdminVehicleController;
use App\Http\Controllers\API\AdminClientController;
use App\Http\Controllers\API\JournalController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Bookings
Route::post('/bookings', [BookingController::class, 'store']);
Route::get('/bookings', [BookingController::class, 'index']);
Route::patch('/bookings/{id}/status', [BookingController::class, 'updateStatus']);

// Blog
Route::get('/blog', [BlogController::class, 'index']);
Route::post('/blog', [BlogController::class, 'store']);
Route::get('/blog/recent', [BlogController::class, 'latest']);
Route::get('/blog/{id}', [BlogController::class, 'show']);
Route::patch('/blog/{id}', [BlogController::class, 'update']);
Route::delete('/blog/{id}', [BlogController::class, 'destroy']);

// Contact
Route::post('/contact', [ContactController::class, 'store']);
Route::get('/contact', [ContactController::class, 'index']);
Route::patch('/contact/{id}/status', [ContactController::class, 'updateStatus']);
Route::delete('/contact/{id}', [ContactController::class, 'destroy']);

// Settings
Route::get('/settings', [\App\Http\Controllers\API\SettingController::class, 'index']);
Route::post('/settings', [\App\Http\Controllers\API\SettingController::class, 'update']);

// Services
Route::get('/services', [\App\Http\Controllers\API\ServiceController::class, 'index']);
Route::post('/services', [\App\Http\Controllers\API\ServiceController::class, 'store']);
Route::patch('/services/{id}', [\App\Http\Controllers\API\ServiceController::class, 'update']);
Route::delete('/services/{id}', [\App\Http\Controllers\API\ServiceController::class, 'destroy']);

// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::post('/user/complete-profile', [AuthController::class, 'completeProfile'])->middleware('auth:sanctum');

// Profile Update (used by /profile page)
Route::post('/user/update-profile', [\App\Http\Controllers\API\ClientDashboardController::class, 'updateProfile'])->middleware('auth:sanctum');

// Subscriptions
Route::post('/subscribe', [\App\Http\Controllers\API\SubscriberController::class, 'subscribe']);

// Client Dashboard Routes
Route::middleware('auth:sanctum')->prefix('client')->group(function () {
    Route::get('/stats', [\App\Http\Controllers\API\ClientDashboardController::class, 'stats']);
    Route::get('/bookings', [\App\Http\Controllers\API\ClientDashboardController::class, 'bookings']);
    Route::get('/vehicles', [\App\Http\Controllers\API\ClientDashboardController::class, 'vehicles']);
    Route::post('/vehicles', [\App\Http\Controllers\API\ClientDashboardController::class, 'storeVehicle']);
    Route::put('/profile', [\App\Http\Controllers\API\ClientDashboardController::class, 'updateProfile']);
});

// Client Portal Features
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard/stats', [\App\Http\Controllers\API\DashboardController::class, 'stats']);
    
    Route::get('/user/bookings', [BookingController::class, 'userBookings']);
    
    Route::get('/vehicles', [\App\Http\Controllers\API\VehicleController::class, 'index']);
    Route::post('/vehicles', [\App\Http\Controllers\API\VehicleController::class, 'store']);
    Route::get('/vehicles/{id}', [\App\Http\Controllers\API\VehicleController::class, 'show']);
    Route::patch('/vehicles/{id}', [\App\Http\Controllers\API\VehicleController::class, 'update']);
    Route::delete('/vehicles/{id}', [\App\Http\Controllers\API\VehicleController::class, 'destroy']);
    
    // Vehicle Gallery
    Route::get('/vehicles/{vehicleId}/images', [\App\Http\Controllers\API\VehicleImageController::class, 'index']);
    Route::post('/vehicles/{vehicleId}/images', [\App\Http\Controllers\API\VehicleImageController::class, 'store']);
    Route::delete('/vehicles/{vehicleId}/images/{imageId}', [\App\Http\Controllers\API\VehicleImageController::class, 'destroy']);
    
    Route::get('/notifications', [\App\Http\Controllers\API\NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [\App\Http\Controllers\API\NotificationController::class, 'markAsRead']);

    // Payments — Paystack
    Route::post('/payments/paystack/initialize', [PaymentController::class, 'initializePaystack']);
    Route::get('/payments/paystack/verify', [PaymentController::class, 'verifyPaystack']);
    Route::get('/payments/paystack/public-key', [PaymentController::class, 'getPublicKey']);
    Route::get('/payments/{id}/receipt', [PaymentController::class, 'receipt']);
    Route::get('/user/payments', [PaymentController::class, 'userPayments']);

    // Repair Progress (Client View)
    Route::get('/bookings/{id}/progress', [RepairProgressController::class, 'show']);

    // Delivery Requests (Client)
    Route::post('/user/deliveries', [DeliveryController::class, 'store']);

    // Admin Specific
    Route::get('/admin/stats', [\App\Http\Controllers\API\AdminDashboardController::class, 'stats']);
    Route::get('/admin/payments', [PaymentController::class, 'index']);
    Route::patch('/admin/payments/{id}/status', [PaymentController::class, 'updateStatus']);
    Route::post('/admin/payments/create-invoice', [PaymentController::class, 'createInvoice']);
    
    // Admin: Repair Progress
    Route::post('/admin/bookings/{id}/progress', [RepairProgressController::class, 'store']);
    
    // Admin: Vehicles & Clients
    Route::get('/admin/vehicles', [AdminVehicleController::class, 'index']);
    Route::get('/admin/clients', [AdminClientController::class, 'index']);
    Route::get('/admin/clients/{id}/history', [AdminClientController::class, 'history']);
    
    // Admin: Deliveries
    Route::get('/admin/deliveries', [DeliveryController::class, 'index']);
    Route::patch('/admin/deliveries/{id}', [DeliveryController::class, 'update']);

    // Admin: Journals
    Route::get('/admin/journals', [\App\Http\Controllers\API\Admin\JournalManagementController::class, 'index']);
    Route::post('/admin/journals', [\App\Http\Controllers\API\Admin\JournalManagementController::class, 'store']);
    Route::post('/admin/journals/{id}', [\App\Http\Controllers\API\Admin\JournalManagementController::class, 'update']); // Use POST for multipart/form-data update
    Route::patch('/admin/journals/{id}/status', [\App\Http\Controllers\API\Admin\JournalManagementController::class, 'updateStatus']);
    Route::delete('/admin/journals/{id}', [\App\Http\Controllers\API\Admin\JournalManagementController::class, 'destroy']);
    Route::get('/admin/journals/{id}/blogs', [\App\Http\Controllers\API\Admin\JournalManagementController::class, 'getBlogs']);
    Route::post('/admin/journals/{id}/blogs', [\App\Http\Controllers\API\Admin\JournalManagementController::class, 'attachBlog']);
    Route::delete('/admin/journals/{id}/blogs/{blogId}', [\App\Http\Controllers\API\Admin\JournalManagementController::class, 'detachBlog']);

    // Journal Protected Routes
    Route::get('/journals/check/{year}', [JournalController::class, 'checkAccess']);
    Route::post('/journals/purchase', [JournalController::class, 'purchase']);
});

// Journal Public Routes
Route::get('/journals', [JournalController::class, 'index']);
Route::get('/journals/{id}', [JournalController::class, 'show']);

// Paystack Webhook (no auth — verified via signature)
Route::post('/webhooks/paystack', [PaymentController::class, 'paystackWebhook']);
