<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\Customer;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    /**
     * Display notifications for the authenticated user.
     *
     * Each user only sees notifications that were actually
     * assigned to their user account.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $notifications = Notification::query()
            ->whereHas('users', function ($query) use ($user) {
                $query->where('users.id', $user->id);
            })
            ->with([
                'users' => function ($query) use ($user) {
                    $query->where('users.id', $user->id);
                },
            ])
            ->latest()
            ->get();

        return NotificationResource::collection($notifications);
    }

    /**
     * Create and distribute a notification.
     *
     * Supported targets:
     *
     * all
     * customers
     * staff
     * admin
     * sales
     * technician
     * customer:{id}
     */
    public function store(Request $request)
    {
        $user = $request->user();

        /*
         * Only staff can create notifications.
         */
        if (! in_array(
            $user->role,
            ['admin', 'sales', 'technician'],
            true
        )) {
            return response()->json([
                'error' => 'You are not authorized to create notifications.',
            ], 403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],

            'message' => ['required', 'string'],

            'type' => [
                'required',
                'in:appointment,order,inventory,security',
            ],

            'to' => [
                'nullable',
                'string',
                'max:100',
            ],

            'appointmentId' => [
                'nullable',
                'string',
                'exists:appointments,id',
            ],

            'orderId' => [
                'nullable',
                'string',
                'exists:orders,id',
            ],
        ]);

        $target = $validated['to'] ?? 'all';

        /*
         * Validate the target before creating anything.
         */
        $allowedTargets = [
            'all',
            'customers',
            'staff',
            'admin',
            'sales',
            'technician',
        ];

        $isCustomerTarget = str_starts_with(
            $target,
            'customer:'
        );

        if (
            ! in_array($target, $allowedTargets, true)
            && ! $isCustomerTarget
        ) {
            return response()->json([
                'error' => 'Invalid notification target.',
            ], 422);
        }

        /*
         * customer:{id} must reference an existing customer.
         */
        $targetUserIds = [];

        if ($isCustomerTarget) {

            $customerId = substr(
                $target,
                strlen('customer:')
            );

            if (! ctype_digit($customerId)) {
                return response()->json([
                    'error' => 'Invalid customer notification target.',
                ], 422);
            }

            $customer = Customer::find((int) $customerId);

            if (! $customer) {
                return response()->json([
                    'error' => 'Customer not found.',
                ], 404);
            }

            $customerUser = User::find($customer->user_id);

            if (! $customerUser) {
                return response()->json([
                    'error' => 'Customer user account not found.',
                ], 404);
            }

            $targetUserIds[] = $customerUser->id;
        } else {

            /*
             * Resolve role-based notification targets.
             */
            $userQuery = User::query();

            match ($target) {

                'all' => null,

                'customers' =>
                    $userQuery->where('role', 'customer'),

                'staff' =>
                    $userQuery->whereIn(
                        'role',
                        ['admin', 'sales', 'technician']
                    ),

                'admin' =>
                    $userQuery->where('role', 'admin'),

                'sales' =>
                    $userQuery->where('role', 'sales'),

                'technician' =>
                    $userQuery->where('role', 'technician'),

                default => null,
            };

            $targetUserIds = $userQuery
                ->pluck('id')
                ->all();
        }

        /*
         * Do not create notifications that have nobody
         * to receive them.
         */
        if (empty($targetUserIds)) {
            return response()->json([
                'error' => 'No users match the notification target.',
            ], 422);
        }

        $notification = DB::transaction(function () use (
            $validated,
            $target,
            $targetUserIds
        ) {

            $notification = Notification::create([
                'title' => $validated['title'],
                'message' => $validated['message'],
                'type' => $validated['type'],

                'target' => $target,

                'appointment_id' =>
                    $validated['appointmentId'] ?? null,

                'order_id' =>
                    $validated['orderId'] ?? null,
            ]);

            /*
             * Give every recipient their own read state.
             */
            $pivotData = [];

            foreach ($targetUserIds as $userId) {
                $pivotData[$userId] = [
                    'is_read' => false,
                    'read_at' => null,
                ];
            }

            $notification->users()->attach($pivotData);

            return $notification;
        });

        /*
         * Load only the authenticated user's pivot record.
         * This keeps the response focused and makes isRead
         * resolve correctly.
         */
        $notification->load([
            'users' => function ($query) use ($user) {
                $query->where('users.id', $user->id);
            },
        ]);

        return (new NotificationResource($notification))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Mark all notifications for the authenticated user as read.
     */
    public function readAll(Request $request)
    {
        $user = $request->user();

        DB::table('notification_user')
            ->where('user_id', $user->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
                'updated_at' => now(),
            ]);

        return response()->json([
            'message' => 'All notifications marked as read.',
        ]);
    }

    /**
     * Mark one notification as read for the authenticated user.
     */
    public function read(Request $request, string $id)
    {
        $user = $request->user();

        $notification = Notification::find($id);

        if (! $notification) {
            return response()->json([
                'error' => 'Notification not found.',
            ], 404);
        }

        $recipient = DB::table('notification_user')
            ->where('notification_id', $notification->id)
            ->where('user_id', $user->id)
            ->first();

        if (! $recipient) {
            return response()->json([
                'error' => 'You are not a recipient of this notification.',
            ], 403);
        }

        DB::table('notification_user')
            ->where('notification_id', $notification->id)
            ->where('user_id', $user->id)
            ->update([
                'is_read' => true,
                'read_at' => now(),
                'updated_at' => now(),
            ]);

        $notification->load([
            'users' => function ($query) use ($user) {
                $query->where('users.id', $user->id);
            },
        ]);

        return new NotificationResource($notification);
    }
}