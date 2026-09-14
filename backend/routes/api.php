```php
<?php

use App\Http\Controllers\Api\V1\AppointmentController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CustomerController;
use App\Http\Controllers\Api\V1\CustomerGarageController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\PartController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\ServiceController;
use App\Http\Controllers\Api\V1\TechnicianController;
use App\Http\Controllers\Api\V1\VehicleController;
use App\Http\Controllers\Api\V1\WishlistController;
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

        // Staff can view the complete customer list.
        Route::middleware('role:admin,sales,technician')->group(function () {

            Route::get(
                'customers',
                [CustomerController::class, 'index']
            );
        });

        // Customers can view and update their own profile.
        // Controller enforces ownership.
        Route::get(
            'customers/{customer}',
            [CustomerController::class, 'show']
        );

        Route::put(
            'customers/{customer}',
            [CustomerController::class, 'update']
        );

        Route::patch(
            'customers/{customer}',
            [CustomerController::class, 'update']
        );

        // Only administrators can delete customer accounts.
        Route::middleware('role:admin')->group(function () {

            Route::delete(
                'customers/{customer}',
                [CustomerController::class, 'destroy']
            );
        });

        /*
        |--------------------------------------------------------------------------
        | Customer Garage
        |--------------------------------------------------------------------------
        */

        // Customers can access their own garage.
        // Staff can access customer garages for management.
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

        Route::patch(
            'customers/{customer}/garage/{vehicle}',
            [CustomerGarageController::class, 'update']
        );

        // Only staff can delete garage vehicles.
        Route::middleware('role:admin,sales,technician')->group(function () {

            Route::delete(
                'customers/{customer}/garage/{vehicle}',
                [CustomerGarageController::class, 'destroy']
            );
        });

        /*
        |--------------------------------------------------------------------------
        | Vehicles Showroom
        |--------------------------------------------------------------------------
        */

        Route::get(
            'vehicles',
            [VehicleController::class, 'index']
        );

        Route::get(
            'vehicles/{vehicle}',
            [VehicleController::class, 'show']
        );

        Route::middleware('role:admin,sales,technician')->group(function () {

            Route::post(
                'vehicles',
                [VehicleController::class, 'store']
            );

            Route::put(
                'vehicles/{vehicle}',
                [VehicleController::class, 'update']
            );

            Route::patch(
                'vehicles/{vehicle}',
                [VehicleController::class, 'update']
            );

            Route::delete(
                'vehicles/{vehicle}',
                [VehicleController::class, 'destroy']
            );
        });

        /*
        |--------------------------------------------------------------------------
        | Services Management
        |--------------------------------------------------------------------------
        */

        Route::middleware('role:admin,sales,technician')->group(function () {

            Route::post(
                '/services',
                [ServiceController::class, 'store']
            );

            Route::put(
                '/services/{service}',
                [ServiceController::class, 'update']
            );

            Route::patch(
                '/services/{service}',
                [ServiceController::class, 'update']
            );

            Route::delete(
                '/services/{service}',
                [ServiceController::class, 'destroy']
            );
        });

        /*
        |--------------------------------------------------------------------------
        | Technician Management
        |--------------------------------------------------------------------------
        */

        Route::middleware('role:admin,sales,technician')->group(function () {

            Route::patch(
                '/technicians/{technician}',
                [TechnicianController::class, 'update']
            );
        });

        /*
        |--------------------------------------------------------------------------
        | Appointments
        |--------------------------------------------------------------------------
        */

        // Customers and staff can view/create appointments.
        // The controller handles ownership and customer/staff-specific behavior.
        Route::apiResource(
            'appointments',
            AppointmentController::class
        )->only([
            'index',
            'store',
            'show',
        ]);

        // Customers can update/cancel their own appointments.
        // Staff can update/cancel appointments through controller authorization.
        Route::put(
            'appointments/{appointment}',
            [AppointmentController::class, 'update']
        );

        Route::patch(
            'appointments/{appointment}',
            [AppointmentController::class, 'update']
        );

        Route::delete(
            'appointments/{appointment}',
            [AppointmentController::class, 'destroy']
        );

        // Only staff roles can change appointment workflow status.
        Route::middleware('role:admin,sales,technician')->group(function () {

            Route::patch(
                'appointments/{appointment}/status',
                [AppointmentController::class, 'updateStatus']
            );
        });

        /*
        |--------------------------------------------------------------------------
        | Parts
        |--------------------------------------------------------------------------
        */

        Route::get(
            'parts',
            [PartController::class, 'index']
        );

        Route::middleware('role:admin,sales,technician')->group(function () {

            Route::post(
                'parts',
                [PartController::class, 'store']
            );

            Route::put(
                'parts/{part}',
                [PartController::class, 'update']
            );

            Route::patch(
                'parts/{part}',
                [PartController::class, 'update']
            );

            Route::delete(
                'parts/{part}',
                [PartController::class, 'destroy']
            );
        });

        /*
        |--------------------------------------------------------------------------
        | Orders
        |--------------------------------------------------------------------------
        */

        // Customers and staff can view orders.
        // Controller scopes customers to their own orders.
        Route::get(
            'orders',
            [OrderController::class, 'index']
        );

        Route::get(
            'orders/{order}',
            [OrderController::class, 'show']
        );

        // Customers, admin, sales and technicians can create orders.
        // Controller ensures customers can only create for themselves.
        Route::post(
            'orders',
            [OrderController::class, 'store']
        );

        // Only staff roles can update orders.
        Route::middleware('role:admin,sales,technician')->group(function () {

            Route::put(
                'orders/{order}',
                [OrderController::class, 'update']
            );

            Route::patch(
                'orders/{order}',
                [OrderController::class, 'update']
            );
        });

        // Only admin and sales can cancel orders.
        Route::middleware('role:admin,sales')->group(function () {

            Route::delete(
                'orders/{order}',
                [OrderController::class, 'destroy']
            );
        });

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
