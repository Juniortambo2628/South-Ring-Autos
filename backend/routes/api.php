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
use App\Http\Controllers\API\TestimonialController;
use App\Http\Controllers\API\MediaUploadController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// ─── Public Routes (Read-Only) ──────────────────────────────────────────────

// Blog (public read)
Route::get('/blog', [BlogController::class, 'index']);
Route::get('/blog/recent', [BlogController::class, 'latest']);
Route::get('/blog/{id}', [BlogController::class, 'show']);

// Contact (public submit only)
Route::post('/contact', [ContactController::class, 'store']);

// Settings (public read only)
Route::get('/settings', [\App\Http\Controllers\API\SettingController::class, 'index']);

// Services (public read only)
Route::get('/services', [\App\Http\Controllers\API\ServiceController::class, 'index']);

// Testimonials (public read only)
Route::get('/testimonials', [TestimonialController::class, 'index']);

// Journals (public read only)
Route::get('/journals', [JournalController::class, 'index']);
Route::get('/journals/{id}', [JournalController::class, 'show']);

// Subscriptions
Route::post('/subscribe', [\App\Http\Controllers\API\SubscriberController::class, 'subscribe']);

// Bookings (public create only)
Route::post('/bookings', [BookingController::class, 'store']);

// Paystack Webhook (no auth — verified via signature)
Route::post('/webhooks/paystack', [PaymentController::class, 'paystackWebhook']);

// ─── Auth Routes ────────────────────────────────────────────────────────────

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::post('/user/complete-profile', [AuthController::class, 'completeProfile'])->middleware('auth:sanctum');

// Profile Update (used by /profile page)
Route::post('/user/update-profile', [\App\Http\Controllers\API\ClientDashboardController::class, 'updateProfile'])->middleware('auth:sanctum');

// ─── Authenticated Client Routes ────────────────────────────────────────────

Route::middleware('auth:sanctum')->group(function () {

    // Client Dashboard
    Route::get('/dashboard/stats', [\App\Http\Controllers\API\DashboardController::class, 'stats']);
    Route::get('/user/bookings', [BookingController::class, 'userBookings']);
    Route::get('/user/payments', [PaymentController::class, 'userPayments']);

    // Vehicles (Client)
    Route::get('/vehicles', [\App\Http\Controllers\API\VehicleController::class, 'index']);
    Route::post('/vehicles', [\App\Http\Controllers\API\VehicleController::class, 'store']);
    Route::get('/vehicles/{id}', [\App\Http\Controllers\API\VehicleController::class, 'show']);
    Route::patch('/vehicles/{id}', [\App\Http\Controllers\API\VehicleController::class, 'update']);
    Route::delete('/vehicles/{id}', [\App\Http\Controllers\API\VehicleController::class, 'destroy']);

    // Vehicle Gallery
    Route::get('/vehicles/{vehicleId}/images', [\App\Http\Controllers\API\VehicleImageController::class, 'index']);
    Route::post('/vehicles/{vehicleId}/images', [\App\Http\Controllers\API\VehicleImageController::class, 'store']);
    Route::delete('/vehicles/{vehicleId}/images/{imageId}', [\App\Http\Controllers\API\VehicleImageController::class, 'destroy']);

    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\API\NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [\App\Http\Controllers\API\NotificationController::class, 'getUnreadCount']);
    Route::patch('/notifications/{id}/read', [\App\Http\Controllers\API\NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [\App\Http\Controllers\API\NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/all', [\App\Http\Controllers\API\NotificationController::class, 'destroyAll']);

    // Payments — Paystack
    Route::post('/payments/paystack/initialize', [PaymentController::class, 'initializePaystack']);
    Route::get('/payments/paystack/verify', [PaymentController::class, 'verifyPaystack']);
    Route::get('/payments/paystack/public-key', [PaymentController::class, 'getPublicKey']);
    Route::get('/payments/{id}/receipt', [PaymentController::class, 'receipt']);

    // Repair Progress (Client View)
    Route::get('/bookings/{id}/progress', [RepairProgressController::class, 'show']);

    // Delivery Requests (Client)
    Route::post('/user/deliveries', [DeliveryController::class, 'store']);

    // Journal Protected Routes
    Route::get('/journals/check/{year}', [JournalController::class, 'checkAccess']);
    Route::post('/journals/purchase', [JournalController::class, 'purchase']);

    // Media Upload
    Route::post('/media/upload', [MediaUploadController::class, 'upload']);
});

// ─── Admin-Only Routes ──────────────────────────────────────────────────────

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {

    // Dashboard
    Route::get('/stats', [\App\Http\Controllers\API\AdminDashboardController::class, 'stats']);

    // Bookings
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::patch('/bookings/{id}/status', [BookingController::class, 'updateStatus']);
    Route::delete('/bookings/{id}', [BookingController::class, 'destroy']);
    Route::post('/bookings/{id}/progress', [RepairProgressController::class, 'store']);

    // Payments
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::patch('/payments/{id}/status', [PaymentController::class, 'updateStatus']);
    Route::post('/payments/create-invoice', [PaymentController::class, 'createInvoice']);

    // Email Templates
    Route::get('/email-templates', [\App\Http\Controllers\API\EmailTemplateController::class, 'index']);
    Route::get('/email-templates/{id}', [\App\Http\Controllers\API\EmailTemplateController::class, 'show']);
    Route::patch('/email-templates/{id}', [\App\Http\Controllers\API\EmailTemplateController::class, 'update']);

    // Vehicles
    Route::get('/vehicles', [AdminVehicleController::class, 'index']);
    Route::delete('/vehicles/{id}', [AdminVehicleController::class, 'destroy']);

    // Clients
    Route::get('/clients', [AdminClientController::class, 'index']);
    Route::get('/clients/{id}/history', [AdminClientController::class, 'history']);
    Route::delete('/clients/{id}', [AdminClientController::class, 'destroy']);

    // Deliveries
    Route::get('/deliveries', [DeliveryController::class, 'index']);
    Route::patch('/deliveries/{id}', [DeliveryController::class, 'update']);

    // Journals
    Route::get('/journals', [\App\Http\Controllers\API\Admin\JournalManagementController::class, 'index']);
    Route::post('/journals', [\App\Http\Controllers\API\Admin\JournalManagementController::class, 'store']);
    Route::patch('/journals/{id}', [\App\Http\Controllers\API\Admin\JournalManagementController::class, 'update']);
    Route::patch('/journals/{id}/status', [\App\Http\Controllers\API\Admin\JournalManagementController::class, 'updateStatus']);
    Route::delete('/journals/{id}', [\App\Http\Controllers\API\Admin\JournalManagementController::class, 'destroy']);
    Route::get('/journals/{id}/blogs', [\App\Http\Controllers\API\Admin\JournalManagementController::class, 'getBlogs']);
    Route::post('/journals/{id}/blogs', [\App\Http\Controllers\API\Admin\JournalManagementController::class, 'attachBlog']);
    Route::delete('/journals/{id}/blogs/{blogId}', [\App\Http\Controllers\API\Admin\JournalManagementController::class, 'detachBlog']);

    // Testimonials
    Route::get('/testimonials', [TestimonialController::class, 'adminIndex']);
    Route::post('/testimonials', [TestimonialController::class, 'store']);
    Route::patch('/testimonials/{id}', [TestimonialController::class, 'update']);
    Route::delete('/testimonials/{id}', [TestimonialController::class, 'destroy']);
    Route::patch('/testimonials/{id}/toggle', [TestimonialController::class, 'toggleStatus']);

    // Blog (admin CRUD)
    Route::post('/blog', [BlogController::class, 'store']);
    Route::patch('/blog/{id}', [BlogController::class, 'update']);
    Route::delete('/blog/{id}', [BlogController::class, 'destroy']);

    // Services (admin CRUD)
    Route::post('/services', [\App\Http\Controllers\API\ServiceController::class, 'store']);
    Route::patch('/services/{id}', [\App\Http\Controllers\API\ServiceController::class, 'update']);
    Route::delete('/services/{id}', [\App\Http\Controllers\API\ServiceController::class, 'destroy']);

    // Contact Messages (admin management)
    Route::get('/contact', [ContactController::class, 'index']);
    Route::patch('/contact/{id}/status', [ContactController::class, 'updateStatus']);
    Route::delete('/contact/{id}', [ContactController::class, 'destroy']);

    // Settings (admin update)
    Route::post('/settings', [\App\Http\Controllers\API\SettingController::class, 'update']);

    // Subscribers (admin management)
    Route::get('/subscribers', [\App\Http\Controllers\API\SubscriberController::class, 'adminIndex']);
    Route::patch('/subscribers/{id}/toggle', [\App\Http\Controllers\API\SubscriberController::class, 'toggleStatus']);
    Route::delete('/subscribers/{id}', [\App\Http\Controllers\API\SubscriberController::class, 'destroy']);
});
