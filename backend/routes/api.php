<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\ReportController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/refresh', [AuthController::class, 'refresh']);

// LINE Bot webhook
Route::post('/line/webhook', [ChatController::class, 'webhook']);

// Protected routes
Route::middleware(['auth:api'])->group(function () {
    // Authentication
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    
    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
    Route::get('/dashboard/recent-customers', [DashboardController::class, 'getRecentCustomers']);
    Route::get('/dashboard/monthly-summary', [DashboardController::class, 'getMonthlySummary']);
    
    // Customer Management
    Route::apiResource('customers', CustomerController::class);
    Route::post('/customers/{customer}/track', [CustomerController::class, 'setTrackDate']);
    Route::post('/customers/{customer}/status', [CustomerController::class, 'updateStatus']);
    Route::post('/customers/{customer}/assign', [CustomerController::class, 'assignToUser']);
    Route::get('/customers/{customer}/history', [CustomerController::class, 'getHistory']);
    
    // Chat Management
    Route::get('/chats', [ChatController::class, 'index']);
    Route::get('/chats/{user}', [ChatController::class, 'getConversation']);
    Route::post('/chats/{user}/reply', [ChatController::class, 'reply']);
    
    // User Management (Admin only)
    Route::middleware(['role:admin|manager'])->group(function () {
        Route::apiResource('users', UserController::class);
        Route::post('/users/{user}/roles', [UserController::class, 'assignRole']);
        Route::delete('/users/{user}/roles/{role}', [UserController::class, 'removeRole']);
    });
    
    // Reports (Manager and Admin only)
    Route::middleware(['role:admin|manager'])->group(function () {
        Route::get('/reports/daily', [ReportController::class, 'dailyReport']);
        Route::get('/reports/monthly', [ReportController::class, 'monthlyReport']);
        Route::get('/reports/by-website', [ReportController::class, 'websiteReport']);
        Route::get('/reports/by-region', [ReportController::class, 'regionReport']);
        Route::get('/reports/approval-rate', [ReportController::class, 'approvalRate']);
    });
});