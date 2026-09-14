<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Part;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /**
     * Display orders.
     *
     * Customers only see their own orders.
     * Staff/admin can see all orders.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Order::with('items')
            ->latest();

        if ($user->role === 'customer') {
            $customer = Customer::where('user_id', $user->id)->first();

            if (! $customer) {
                return response()->json([
                    'error' => 'Customer profile not found.',
                ], 404);
            }

            $query->where('customer_id', $customer->id);
        }

        $orders = $query->get();

        return OrderResource::collection($orders);
    }

    /**
     * Create a new order.
     *
     * Inventory deduction and order creation happen
     * inside one database transaction.
     *
     * IMPORTANT:
     * Part prices, subtotal and total are calculated
     * server-side from the current database prices.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'customerId' => ['required', 'integer', 'exists:customers,id'],
            'customerName' => ['required', 'string', 'max:255'],
            'customerEmail' => ['required', 'email', 'max:255'],
            'shippingAddress' => ['required', 'string'],

            'items' => ['required', 'array', 'min:1'],
            'items.*.partId' => ['required', 'string'],
            'items.*.partName' => ['required', 'string', 'max:255'],
            'items.*.brand' => ['required', 'string', 'max:255'],
            'items.*.price' => ['required', 'numeric', 'min:0'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.image' => ['nullable', 'string', 'max:2048'],

            /*
             * These are retained for frontend contract compatibility.
             *
             * subtotal and total are NOT trusted.
             * They are calculated from the real part prices below.
             */
            'subtotal' => ['required', 'numeric', 'min:0'],
            'discount' => ['required', 'numeric', 'min:0'],
            'tax' => ['required', 'numeric', 'min:0'],
            'shipping' => ['nullable', 'numeric', 'min:0'],
            'total' => ['required', 'numeric', 'min:0'],

            'couponApplied' => ['nullable', 'string', 'max:255'],

            'paymentMethod' => ['required', 'string', 'max:100'],

            'paymentStatus' => [
                'nullable',
                'in:pending,deposit_paid,paid,refunded',
            ],

            'fulfillmentStatus' => [
                'nullable',
                'in:processing,confirmed,shipped,delivered,cancelled',
            ],

            'status' => ['nullable', 'string', 'max:100'],

            'estimatedDelivery' => ['nullable', 'string', 'max:255'],
            'trackingNumber' => ['nullable', 'string', 'max:255'],
            'carrier' => ['nullable', 'string', 'max:255'],
        ]);

        /*
         * Customers may only create orders for themselves.
         */
        if ($user->role === 'customer') {
            $customer = Customer::where('user_id', $user->id)->first();

            if (! $customer) {
                return response()->json([
                    'error' => 'Customer profile not found.',
                ], 404);
            }

            if ((int) $validated['customerId'] !== (int) $customer->id) {
                return response()->json([
                    'error' => 'You can only create orders for your own customer account.',
                ], 403);
            }
        }

        /*
         * Only authorized roles may create orders.
         */
        if (! in_array(
            $user->role,
            ['customer', 'admin', 'sales', 'technician'],
            true
        )) {
            return response()->json([
                'error' => 'You are not authorized to create orders.',
            ], 403);
        }

        $order = DB::transaction(function () use ($validated) {

            $subtotal = 0;

            $resolvedItems = [];

            /*
             * Resolve every part from the database.
             *
             * lockForUpdate() prevents two simultaneous orders
             * from purchasing the same inventory at the same time.
             */
            foreach ($validated['items'] as $item) {

                $part = Part::where('id', $item['partId'])
                    ->lockForUpdate()
                    ->first();

                if (! $part) {
                    abort(422, 'Part not found: ' . $item['partId']);
                }

                if ($part->in_stock < $item['quantity']) {
                    abort(
                        422,
                        "Insufficient stock for {$part->name}. Available: {$part->in_stock}."
                    );
                }

                /*
                 * IMPORTANT:
                 * Never trust the price sent by the frontend.
                 *
                 * The database price is authoritative.
                 */
                $lineTotal = (float) $part->price * $item['quantity'];

                $subtotal += $lineTotal;

                $resolvedItems[] = [
                    'part' => $part,
                    'quantity' => $item['quantity'],
                ];
            }

            /*
             * These values can later be replaced by a proper
             * coupon/tax/shipping pricing service.
             */
            $discount = (float) ($validated['discount'] ?? 0);
            $tax = (float) ($validated['tax'] ?? 0);
            $shipping = (float) ($validated['shipping'] ?? 0);

            /*
             * A discount cannot exceed the order subtotal.
             */
            if ($discount > $subtotal) {
                abort(
                    422,
                    'Discount cannot exceed the order subtotal.'
                );
            }

            /*
             * Calculate the final total on the server.
             */
            $total = round(
                $subtotal - $discount + $tax + $shipping,
                2
            );

            $order = Order::create([
                'id' => 'ord-' . Str::lower(Str::random(12)),

                'customer_id' => $validated['customerId'],
                'customer_name' => $validated['customerName'],
                'customer_email' => $validated['customerEmail'],

                'shipping_address' => $validated['shippingAddress'],

                /*
                 * SERVER-CALCULATED VALUES.
                 */
                'subtotal' => round($subtotal, 2),
                'discount' => round($discount, 2),
                'tax' => round($tax, 2),
                'shipping' => round($shipping, 2),
                'total' => $total,

                'coupon_applied' =>
                    $validated['couponApplied'] ?? null,

                'payment_method' =>
                    $validated['paymentMethod'],

                'payment_status' =>
                    $validated['paymentStatus'] ?? 'pending',

                'fulfillment_status' =>
                    $validated['fulfillmentStatus'] ?? 'processing',

                'status' =>
                    $validated['status'] ?? null,

                'estimated_delivery' =>
                    $validated['estimatedDelivery'] ?? null,

                'tracking_number' =>
                    $validated['trackingNumber'] ?? null,

                'carrier' =>
                    $validated['carrier'] ?? null,
            ]);

            /*
             * Create order snapshots and deduct inventory.
             */
            foreach ($resolvedItems as $resolvedItem) {

                $part = $resolvedItem['part'];
                $quantity = $resolvedItem['quantity'];

                $order->items()->create([
                    'part_id' => $part->id,
                    'part_name' => $part->name,
                    'brand' => $part->brand,

                    /*
                     * Save the database price at the time
                     * the order was created.
                     */
                    'price' => $part->price,

                    'quantity' => $quantity,
                    'image' => $part->image,
                ]);

                /*
                 * Atomically deduct inventory.
                 */
                $part->decrement('in_stock', $quantity);
            }

            return $order;
        });

        $order->load('items');

        return (new OrderResource($order))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display a single order.
     */
    public function show(Request $request, string $id)
    {
        $order = Order::with('items')->find($id);

        if (! $order) {
            return response()->json([
                'error' => 'Order not found.',
            ], 404);
        }

        $this->authorizeOrder($request, $order);

        return new OrderResource($order);
    }

    /**
     * Update an order.
     *
     * PUT follows the frontend contract's full-replace/upsert behavior.
     */
    public function update(Request $request, string $id)
    {
        $user = $request->user();

        if (! in_array($user->role, ['admin', 'sales', 'technician'], true)) {
            return response()->json([
                'error' => 'You are not authorized to update orders.',
            ], 403);
        }

        $validated = $request->validate([
            'customerId' => ['sometimes', 'integer', 'exists:customers,id'],
            'customerName' => ['sometimes', 'string', 'max:255'],
            'customerEmail' => ['sometimes', 'email', 'max:255'],
            'shippingAddress' => ['sometimes', 'string'],

            'items' => ['sometimes', 'array', 'min:1'],
            'items.*.partId' => ['required_with:items', 'string'],
            'items.*.partName' => ['required_with:items', 'string', 'max:255'],
            'items.*.brand' => ['required_with:items', 'string', 'max:255'],
            'items.*.price' => ['required_with:items', 'numeric', 'min:0'],
            'items.*.quantity' => ['required_with:items', 'integer', 'min:1'],
            'items.*.image' => ['nullable', 'string', 'max:2048'],

            'subtotal' => ['sometimes', 'numeric', 'min:0'],
            'discount' => ['sometimes', 'numeric', 'min:0'],
            'tax' => ['sometimes', 'numeric', 'min:0'],
            'shipping' => ['sometimes', 'numeric', 'min:0'],
            'total' => ['sometimes', 'numeric', 'min:0'],

            'couponApplied' => ['nullable', 'string', 'max:255'],

            'paymentMethod' => ['sometimes', 'string', 'max:100'],

            'paymentStatus' => [
                'sometimes',
                'in:pending,deposit_paid,paid,refunded',
            ],

            'fulfillmentStatus' => [
                'sometimes',
                'in:processing,confirmed,shipped,delivered,cancelled',
            ],

            'status' => ['nullable', 'string', 'max:100'],

            'estimatedDelivery' => ['nullable', 'string', 'max:255'],
            'trackingNumber' => ['nullable', 'string', 'max:255'],
            'carrier' => ['nullable', 'string', 'max:255'],
        ]);

        $order = DB::transaction(function () use ($id, $validated) {

            $order = Order::with('items')
                ->lockForUpdate()
                ->find($id);

            if (! $order) {

                /*
                 * PUT supports create-or-replace semantics.
                 *
                 * If the order does not exist, create it using
                 * the supplied data.
                 */
                if (! isset($validated['customerId'], $validated['items'])) {
                    abort(
                        422,
                        'customerId and items are required when creating an order.'
                    );
                }

                return $this->createOrderInsideTransaction($validated);
            }

            /*
             * If items are supplied during an update, restore the
             * existing inventory first, then reserve the new items.
             */
            if (array_key_exists('items', $validated)) {

                foreach ($order->items as $oldItem) {

                    Part::where('id', $oldItem->part_id)
                        ->lockForUpdate()
                        ->increment('in_stock', $oldItem->quantity);
                }

                $order->items()->delete();

                $newSubtotal = 0;

                foreach ($validated['items'] as $item) {

                    $part = Part::where('id', $item['partId'])
                        ->lockForUpdate()
                        ->first();

                    if (! $part) {
                        abort(
                            422,
                            'Part not found: ' . $item['partId']
                        );
                    }

                    if ($part->in_stock < $item['quantity']) {
                        abort(
                            422,
                            "Insufficient stock for {$part->name}. Available: {$part->in_stock}."
                        );
                    }

                    /*
                     * Calculate subtotal using the real database price.
                     */
                    $newSubtotal +=
                        (float) $part->price * $item['quantity'];

                    $order->items()->create([
                        'part_id' => $part->id,
                        'part_name' => $part->name,
                        'brand' => $part->brand,
                        'price' => $part->price,
                        'quantity' => $item['quantity'],
                        'image' => $part->image,
                    ]);

                    $part->decrement(
                        'in_stock',
                        $item['quantity']
                    );
                }

                /*
                 * Recalculate financial values whenever items change.
                 */
                $discount = array_key_exists('discount', $validated)
                    ? (float) $validated['discount']
                    : (float) $order->discount;

                $tax = array_key_exists('tax', $validated)
                    ? (float) $validated['tax']
                    : (float) $order->tax;

                $shipping = array_key_exists('shipping', $validated)
                    ? (float) $validated['shipping']
                    : (float) $order->shipping;

                if ($discount > $newSubtotal) {
                    abort(
                        422,
                        'Discount cannot exceed the order subtotal.'
                    );
                }

                $newTotal = round(
                    $newSubtotal - $discount + $tax + $shipping,
                    2
                );

                $order->update([
                    'subtotal' => round($newSubtotal, 2),
                    'discount' => round($discount, 2),
                    'tax' => round($tax, 2),
                    'shipping' => round($shipping, 2),
                    'total' => $newTotal,
                ]);
            }

            /*
             * Map frontend camelCase fields to database snake_case.
             */
            $orderData = collect($validated)
                ->except([
                    'items',
                    'subtotal',
                    'discount',
                    'tax',
                    'shipping',
                    'total',
                ])
                ->mapWithKeys(function ($value, $key) {

                    $map = [
                        'customerId' => 'customer_id',
                        'customerName' => 'customer_name',
                        'customerEmail' => 'customer_email',
                        'shippingAddress' => 'shipping_address',
                        'couponApplied' => 'coupon_applied',
                        'paymentMethod' => 'payment_method',
                        'paymentStatus' => 'payment_status',
                        'fulfillmentStatus' => 'fulfillment_status',
                        'estimatedDelivery' => 'estimated_delivery',
                        'trackingNumber' => 'tracking_number',
                        'carrier' => 'carrier',
                    ];

                    return [
                        $map[$key] ?? $key => $value,
                    ];
                })
                ->all();

            /*
             * If items were not supplied, allow normal financial
             * field updates for staff/admin.
             *
             * If items WERE supplied, subtotal/total were already
             * calculated server-side above.
             */
            if (! array_key_exists('items', $validated)) {

                $financialData = [];

                if (array_key_exists('discount', $validated)) {
                    $financialData['discount'] =
                        (float) $validated['discount'];
                }

                if (array_key_exists('tax', $validated)) {
                    $financialData['tax'] =
                        (float) $validated['tax'];
                }

                if (array_key_exists('shipping', $validated)) {
                    $financialData['shipping'] =
                        (float) $validated['shipping'];
                }

                /*
                 * Subtotal remains server-owned.
                 */
                $subtotal = (float) $order->subtotal;

                $discount = array_key_exists('discount', $validated)
                    ? (float) $validated['discount']
                    : (float) $order->discount;

                $tax = array_key_exists('tax', $validated)
                    ? (float) $validated['tax']
                    : (float) $order->tax;

                $shipping = array_key_exists('shipping', $validated)
                    ? (float) $validated['shipping']
                    : (float) $order->shipping;

                if ($discount > $subtotal) {
                    abort(
                        422,
                        'Discount cannot exceed the order subtotal.'
                    );
                }

                $financialData['total'] = round(
                    $subtotal - $discount + $tax + $shipping,
                    2
                );

                $orderData = array_merge(
                    $orderData,
                    $financialData
                );
            }

            $order->update($orderData);

            return $order;
        });

        $order->load('items');

        return new OrderResource($order);
    }

    /**
     * Cancel an order.
     */
    public function destroy(Request $request, string $id)
    {
        $user = $request->user();

        if (! in_array($user->role, ['admin', 'sales'], true)) {
            return response()->json([
                'error' => 'You are not authorized to cancel orders.',
            ], 403);
        }

        $order = Order::with('items')->find($id);

        if (! $order) {
            return response()->json([
                'error' => 'Order not found.',
            ], 404);
        }

        DB::transaction(function () use ($order) {

            /*
             * Only restore inventory if the order was not already
             * cancelled.
             */
            if ($order->fulfillment_status !== 'cancelled') {

                foreach ($order->items as $item) {

                    Part::where('id', $item->part_id)
                        ->lockForUpdate()
                        ->increment(
                            'in_stock',
                            $item->quantity
                        );
                }
            }

            $order->update([
                'fulfillment_status' => 'cancelled',
                'status' => 'cancelled',
            ]);
        });

        return response()->noContent();
    }

    /**
     * Authorize access to an order.
     */
    private function authorizeOrder(
        Request $request,
        Order $order
    ): void {
        $user = $request->user();

        if ($user->role !== 'customer') {
            return;
        }

        $customer = Customer::where(
            'user_id',
            $user->id
        )->first();

        if (
            ! $customer ||
            (int) $order->customer_id !== (int) $customer->id
        ) {
            abort(
                403,
                'You are not authorized to access this order.'
            );
        }
    }

    /**
     * Create an order inside an existing transaction.
     *
     * This is used by PUT upsert behavior.
     *
     * Prices and totals are calculated server-side.
     */
    private function createOrderInsideTransaction(
        array $validated
    ): Order {

        $subtotal = 0;

        $resolvedItems = [];

        foreach ($validated['items'] as $item) {

            $part = Part::where('id', $item['partId'])
                ->lockForUpdate()
                ->first();

            if (! $part) {
                abort(
                    422,
                    'Part not found: ' . $item['partId']
                );
            }

            if ($part->in_stock < $item['quantity']) {
                abort(
                    422,
                    "Insufficient stock for {$part->name}. Available: {$part->in_stock}."
                );
            }

            $subtotal +=
                (float) $part->price * $item['quantity'];

            $resolvedItems[] = [
                'part' => $part,
                'quantity' => $item['quantity'],
            ];
        }

        $discount = (float) ($validated['discount'] ?? 0);
        $tax = (float) ($validated['tax'] ?? 0);
        $shipping = (float) ($validated['shipping'] ?? 0);

        if ($discount > $subtotal) {
            abort(
                422,
                'Discount cannot exceed the order subtotal.'
            );
        }

        $total = round(
            $subtotal - $discount + $tax + $shipping,
            2
        );

        $order = Order::create([
            'id' => 'ord-' . Str::lower(Str::random(12)),

            'customer_id' => $validated['customerId'],

            'customer_name' =>
                $validated['customerName'] ?? '',

            'customer_email' =>
                $validated['customerEmail'] ?? '',

            'shipping_address' =>
                $validated['shippingAddress'] ?? '',

            /*
             * SERVER-CALCULATED FINANCIAL VALUES.
             */
            'subtotal' => round($subtotal, 2),
            'discount' => round($discount, 2),
            'tax' => round($tax, 2),
            'shipping' => round($shipping, 2),
            'total' => $total,

            'coupon_applied' =>
                $validated['couponApplied'] ?? null,

            'payment_method' =>
                $validated['paymentMethod'] ?? 'unknown',

            'payment_status' =>
                $validated['paymentStatus'] ?? 'pending',

            'fulfillment_status' =>
                $validated['fulfillmentStatus'] ?? 'processing',

            'status' =>
                $validated['status'] ?? null,

            'estimated_delivery' =>
                $validated['estimatedDelivery'] ?? null,

            'tracking_number' =>
                $validated['trackingNumber'] ?? null,

            'carrier' =>
                $validated['carrier'] ?? null,
        ]);

        foreach ($resolvedItems as $resolvedItem) {

            $part = $resolvedItem['part'];
            $quantity = $resolvedItem['quantity'];

            $order->items()->create([
                'part_id' => $part->id,
                'part_name' => $part->name,
                'brand' => $part->brand,
                'price' => $part->price,
                'quantity' => $quantity,
                'image' => $part->image,
            ]);

            $part->decrement(
                'in_stock',
                $quantity
            );
        }

        return $order;
    }
}