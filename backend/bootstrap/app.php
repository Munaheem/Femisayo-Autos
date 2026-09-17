<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
        ]);

        $middleware->redirectGuestsTo(function (Request $request) {
            if ($request->is('api/*')) {
                return null;
            }

            return '/login';
        });
    })
    ->withExceptions(function (Exceptions $exceptions) {

        /*
        |--------------------------------------------------------------------------
        | API JSON Detection
        |--------------------------------------------------------------------------
        */

        $exceptions->shouldRenderJsonWhen(function (
            Request $request,
            Throwable $e
        ) {
            return $request->is('api/*');
        });

        /*
        |--------------------------------------------------------------------------
        | Authentication
        |--------------------------------------------------------------------------
        */

        $exceptions->render(function (
            AuthenticationException $e,
            Request $request
        ) {
            if ($request->is('api/*')) {
                return response()->json([
                    'error' => 'Unauthenticated.',
                ], 401);
            }
        });

        /*
        |--------------------------------------------------------------------------
        | Validation
        |--------------------------------------------------------------------------
        */

        $exceptions->render(function (
            ValidationException $e,
            Request $request
        ) {
            if ($request->is('api/*')) {
                return response()->json([
                    'error' => $e->validator->errors()->first()
                        ?: 'Validation failed.',
                ], 422);
            }
        });

        /*
        |--------------------------------------------------------------------------
        | Not Found
        |--------------------------------------------------------------------------
        */

        $exceptions->render(function (
            NotFoundHttpException $e,
            Request $request
        ) {
            if ($request->is('api/*')) {
                return response()->json([
                    'error' => 'Resource not found.',
                ], 404);
            }
        });

        /*
        |--------------------------------------------------------------------------
        | Other HTTP Errors
        |--------------------------------------------------------------------------
        */

        $exceptions->render(function (
            HttpExceptionInterface $e,
            Request $request
        ) {
            if ($request->is('api/*')) {
                return response()->json([
                    'error' => $e->getMessage()
                        ?: 'Request failed.',
                ], $e->getStatusCode());
            }
        });
    })
    ->create();