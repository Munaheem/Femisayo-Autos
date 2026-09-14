<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CustomerController;
use App\Http\Controllers\Api\V1\CustomerGarageController;
use App\Http\Controllers\Api\V1\ServiceController;
use App\Http\Controllers\Api\V1\TechnicianController;
use App\Http\Controllers\Api\V1\AppointmentController;
use App\Http\Controllers\Api\V1\PartController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\WishlistController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\VehicleController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    Route::prefix('auth')->group(function () {

        Route::post('/register', [
            AuthController::class,
            'register',
        ]);

        Route::post('/login', [
            AuthController::class,
            'login',
        ]);

        Route::middleware('auth:sanctum')->group(function () {

            Route::get('/me', [
                AuthController::class,
                'me',
            ]);

            Route::post('/logout', [
                AuthController::class,
                'logout',
            ]);
        });
    });


    /*
    |--------------------------------------------------------------------------
    | Public Catalog
    |--------------------------------------------------------------------------
    |
    | Customers can browse services and technicians without authentication.
    |
    */

    Route::get('/services', [
        ServiceController::class,
        'index',
    ]);

    Route::get('/services/{service}', [
        ServiceController::class,
        'show',
    ]);

    Route::get('/technicians', [
        TechnicianController::class,
        'index',
    ]);


    /*
    |--------------------------------------------------------------------------
    | Authenticated Customer / Management Routes
    |--------------------------------------------------------------------------
    */

    Route::middleware('auth:sanctum')->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Customers
        |--------------------------------------------------------------------------
        */

        Route::apiResource('customers', CustomerController::class)
            ->only([
                'index',
                'show',
                'update',
                'destroy',
            ]);


        /*
        |--------------------------------------------------------------------------
        | Customer Garage
        |--------------------------------------------------------------------------
        */

        Route::get(
            'customers/{customer}/garage',
            [CustomerGarageController::class, 'index']
        );

        Route::post(
            'customers/{customer}/garage',
            [CustomerGarageController::class, 'store']
        );

        Route::put(
            'customers/{customer}/garage/{vehicle}',
            [CustomerGarageController::class, 'update']
        );

        Route::delete(
            'customers/{customer}/garage/{vehicle}',
            [CustomerGarageController::class, 'destroy']
        );


        /*
        |--------------------------------------------------------------------------
        | Vehicles Showroom
        |--------------------------------------------------------------------------
        */

        Route::apiResource('vehicles', VehicleController::class)
            ->only([
                'index',
                'store',
                'show',
                'update',
                'destroy',
            ]);


        /*
        |--------------------------------------------------------------------------
        | Services Management
        |--------------------------------------------------------------------------
        */

        Route::post('/services', [
            ServiceController::class,
            'store',
        ]);

        Route::put('/services/{service}', [
            ServiceController::class,
            'update',
        ]);

        Route::delete('/services/{service}', [
            ServiceController::class,
            'destroy',
        ]);


        /*
        |--------------------------------------------------------------------------
        | Technician Management
        |--------------------------------------------------------------------------
        */

        Route::patch('/technicians/{technician}', [
            TechnicianController::class,
            'update',
        ]);


        /*
        |--------------------------------------------------------------------------
        | Appointments
        |--------------------------------------------------------------------------
        */

        Route::apiResource('appointments', AppointmentController::class)
            ->only([
                'index',
                'store',
                'show',
                'update',
                'destroy',
            ]);

        Route::patch(
            'appointments/{appointment}/status',
            [AppointmentController::class, 'updateStatus']
        );


        /*
        |--------------------------------------------------------------------------
        | Parts
        |--------------------------------------------------------------------------
        */

        Route::apiResource('parts', PartController::class)
            ->only([
                'index',
                'store',
                'update',
                'destroy',
            ]);


        /*
        |--------------------------------------------------------------------------
        | Orders
        |--------------------------------------------------------------------------
        */

        Route::apiResource('orders', OrderController::class)
            ->only([
                'index',
                'store',
                'show',
                'update',
                'destroy',
            ]);


        /*
        |--------------------------------------------------------------------------
        | Notifications
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/notifications',
            [NotificationController::class, 'index']
        );

        Route::post(
            '/notifications',
            [NotificationController::class, 'store']
        );

        Route::patch(
            '/notifications/read-all',
            [NotificationController::class, 'readAll']
        );

        Route::patch(
            '/notifications/{id}/read',
            [NotificationController::class, 'read']
        );


        /*
        |--------------------------------------------------------------------------
        | Wishlist
        |--------------------------------------------------------------------------
        */

        Route::get(
            'wishlist/{customerId}',
            [WishlistController::class, 'index']
        );

        Route::put(
            'wishlist/{customerId}',
            [WishlistController::class, 'update']
        );


        /*
        |--------------------------------------------------------------------------
        | Payments
        |--------------------------------------------------------------------------
        */

        Route::post(
            'payments/initialize',
            [PaymentController::class, 'initialize']
        );

        Route::get(
            'payments/verify/{reference}',
            [PaymentController::class, 'verify']
        );

    });

});