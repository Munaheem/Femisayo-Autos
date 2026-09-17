<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Authentication Rate Limiter
        |--------------------------------------------------------------------------
        |
        | Protect login and registration from repeated automated attempts.
        |
        */

        RateLimiter::for('auth', function ($request) {
            return Limit::perMinute(10)
                ->by(
                    $request->ip()
                    . '|'
                    . strtolower(
                        (string) $request->input('email')
                    )
                );
        });

        /*
        |--------------------------------------------------------------------------
        | Payment Rate Limiter
        |--------------------------------------------------------------------------
        |
        | Payment initialization and verification are sensitive operations.
        |
        */

        RateLimiter::for('payments', function ($request) {
            return Limit::perMinute(10)
                ->by(
                    $request->user()?->id
                    ?? $request->ip()
                );
        });

        /*
        |--------------------------------------------------------------------------
        | General API Rate Limiter
        |--------------------------------------------------------------------------
        */

        RateLimiter::for('api', function ($request) {
            return Limit::perMinute(120)
                ->by(
                    $request->user()?->id
                    ?? $request->ip()
                );
        });
    }
}