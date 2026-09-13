# Femisayo Autos — Backend API Contract & Database Design

This document is the **single source of truth** for the backend engineer who will
implement the Femisayo Autos server. The frontend is fully integration-ready:

- Every persistent read/write in the app already flows through
  `src/services/api.ts` — the frontend never talks to a database or
  `localStorage` directly (all `localStorage` access is isolated in
  `src/utils/storage.ts`).
- Point the frontend at your server: set `VITE_API_URL` (see `.env.example`).
  Once set, the app **hydrates all collections from the backend on load** and
  **mirrors every mutation to the backend**, falling back to bundled demo data
  only when the API is unreachable.

---

## 1. Quick start

```bash
# .env
VITE_API_URL="https://api.femisayo.example.com"
```

No code changes are required on the frontend. When `VITE_API_URL` is empty the
app runs 100% on demo/localStorage data (this is how it ships today).

---

## 2. Conventions

| Rule | Value |
|---|---|
| Base path | `/api/v1` (prefix everything below) |
| Wire format | `application/json`, **camelCase** field names (matches TS types verbatim) |
| Auth | `Authorization: Bearer <token>` when signed in |
| Success | `200` / `201` (created) / `204` (delete, no body) |
| Errors | `4xx`/`5xx` with a JSON body `{ "error": string }` — the frontend treats **any non-2xx as "fall back to demo"** |
| Idempotency | Preferred. The frontend mirrors optimistic local writes; PUT should be create-or-replace |
| CORS | Must allow the frontend origin (dev: `http://localhost:3000`), headers `Content-Type` + `Authorization`, methods `GET/POST/PUT/PATCH/DELETE`; answer `OPTIONS` pre-flight |

**Frontend write behavior:** mutations update React state + `localStorage`
first, then the matching API call is fired (optimistic). The server is the
authoritative store; on load the server data **replaces** the local data. Treat
the same write as possible to be replayed (idempotency + upsert semantics are
strongly recommended).

---

## 3. Auth & sessions

| Method | Path | Request | Response |
|---|---|---|---|
| POST | `/api/v1/auth/login` | `{ email, password, role? }` | `{ role, user?, token }` |
| POST | `/api/v1/auth/register` | `{ name, email, phone, address, vehicleInfo, password }` | `{ role: 'customer', user, token }` |

- `role` is one of `'customer' | 'technician' | 'sales' | 'admin'` (see §4).
- Return a JWT (or session token) inside `token`. The frontend stores it and
  attaches it to every later request.
- **Do not store plaintext passwords** — hash with bcrypt/argon2. The current
  frontend demo stores plaintext only for offline demos; the DB must not.
- Staff accounts are currently hardcoded in `src/components/LoginPage.tsx:24-28`
  (`admin@femisayo.com/admin123`, `technician@femisayo.com/tech123`,
  `sales@femisayo.com/sales123`). Seed these as staff accounts server-side with
  hashed passwords so staff login works through the API.
- Registration should also create/seed the customer's loyalty record (see
  `customers`).

### Enums (mirror `src/types.ts:1-29`)

- `UserRole`: `'customer' | 'technician' | 'sales' | 'admin'`
- `AppointmentStatus`: `'pending' | 'confirmed' | 'in_inspection' | 'in_repair' | 'quality_check' | 'ready_for_pickup' | 'completed' | 'cancelled'`
- `PaymentStatus`: `'pending' | 'deposit_paid' | 'paid' | 'refunded'`
- `FulfillmentStatus`: `'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'`

---

## 4. Endpoints

REST verbs: `GET` (list/read), `POST` (create), `PUT` (full replace / upsert),
`PATCH` (partial update), `DELETE` (remove). Where PUT is listed it is used for
**both** update and create-or-replace upsert.

### 4.1 Services

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/services` | Full catalog list |
| POST | `/api/v1/services` | Create (admin) |
| PUT | `/api/v1/services/:id` | Update / upsert |
| DELETE | `/api/v1/services/:id` | Remove |

Entity `ServiceItem` (`src/types.ts:31-42`): `id *`, `name`, `category`,
`price`, `durationMinutes`, `description`, `recommendedMileage`, `features:
string[]`, `popular?`, `featured?`. (`*` server-generated for POST.)

### 4.2 Technicians

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/technicians` | Roster with live `status` |
| PATCH | `/api/v1/technicians/:id` | Update status/details |

Entity `Technician` (`src/types.ts:233-241`): `id *`, `name`, `specialty`,
`experienceYears`, `rating`, `avatar`, `status:
'available'|'in_bay'|'off_duty'`.

### 4.3 Vehicles (showroom)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/vehicles` | Showroom inventory |
| POST | `/api/v1/vehicles` | Create (admin) |
| PUT | `/api/v1/vehicles/:id` | Update / upsert |
| DELETE | `/api/v1/vehicles/:id` | Remove |

Entity `VehicleItem` (`src/types.ts:44-64`): `id *`, `make`, `model`, `year`,
`price`, `mileage`, `transmission`, `fuel`, `bodyType`, `horsepower`,
`zeroToSixty`, `engine`, `vin`, `color`, `inStock`, `image`, `gallery?: string[]`,
`badges: string[]`, `features: string[]`.

### 4.4 Parts (inventory & store)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/parts` | Parts catalog with stock levels |
| POST | `/api/v1/parts` | Create (admin) |
| PUT | `/api/v1/parts/:id` | Update / upsert (incl. stock adjustments) |
| DELETE | `/api/v1/parts/:id` | Remove |

Entity `PartItem` (`src/types.ts:66-84`): `id *`, `name`, `brand`, `partNumber`,
`category`, `price`, `originalPrice`, `rating`, `reviewsCount`, `inStock`,
`fitmentMakes: string[]`, `fitmentYears`, `image`, `gallery?: string[]`,
`description`, `isBestSeller?`, `badge?`.

### 4.5 Appointments (service bookings / work orders)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/appointments` | All work orders (staff) or caller scoped |
| POST | `/api/v1/appointments` | Book a service |
| PUT | `/api/v1/appointments/:id` | Status / notes / payment updates |
| DELETE | `/api/v1/appointments/:id` | Cancel / remove |

Entity `Appointment` (`src/types.ts:86-112`): server-owned `id`, `createdAt`,
`updatedAt`. Everything else is client-supplied: `customerId`, `customerName`,
`customerPhone`, `customerEmail`, `vehicleYear`, `vehicleMake`, `vehicleModel`,
`vehiclePlate`, `vin`, `serviceId`, `serviceName`, `additionalServices:
string[]`, `assignedTechnician`, `scheduledDate` (`YYYY-MM-DD`),
`scheduledTime` (`HH:mm`), `status`, `customerNotes?`, `technicianNotes?`,
`totalCost`, `depositAmount`, `paymentStatus`, `paymentTransactionId?`.

> **Design note:** `assignedTechnician` stores a technician **name** today for
> demo simplicity. For new records prefer storing `technicianId` and resolve
> the name server-side (keep writing the name field so old data still renders).

### 4.6 Customers (loyalty records + encrypted vault)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/customers` | All customers (staff) |
| POST | `/api/v1/customers` | Create customer record |
| PUT | `/api/v1/customers/:id` | Update **or** upsert (used by login/registration sync) |
| DELETE | `/api/v1/customers/:id` | Remove |
| GET | `/api/v1/customers/:id/garage` | Customer's portal payload: `{ customer, appointments?, orders? }` |

Entity `CustomerRecord` (`src/types.ts:114-136`): `id *`, `name`, `email`,
`phone`, `address`, `vehicleInfo`, `totalSpent`, `loyaltyPoints`, `tier`
(`'Silver' | 'Gold' | 'Platinum' | 'Femisayo VIP' | 'Apex VIP'`), `createdAt *`,
`encryptedVault { iv, ciphertext, algorithm: 'AES-GCM-256', maskedPreview { vinLast4, licenseMasked, taxIdMasked } }`.

- `totalSpent` / `loyaltyPoints` / `tier` should be **computed or updated
  server-side** on payments, not trusted from the client.
- The vault fields are the client-side privacy wrapper used for GDPR/CCPA/NDPR.
  Keep the attribute (store opaque) — but see §7 security note: it must not be
  the *only* protection.

### 4.7 Orders (parts purchases)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/orders` | Order list (staff; customer = scoped) |
| POST | `/api/v1/orders` | Create order from checkout |
| PUT | `/api/v1/orders/:id` | Fulfillment / payment status transitions |

Entity `Order` (`src/types.ts:152-173`): server-owned `id`, `createdAt`.
Client supplies: `customerId`, `customerName`, `customerEmail`,
`shippingAddress`, `items[]`, `subtotal`, `discount`, `tax`, `shipping?`,
`total`, `couponApplied?`, `paymentMethod`, `paymentStatus`,
`fulfillmentStatus`, `status?`, `estimatedDelivery?`, `trackingNumber`,
`carrier`.

- Legacy items snapshot shape (`OrderItem`): `{ partId, partName, brand, price,
  quantity, image }`. Some old records use `{ part: PartItem, quantity }`
  (`CartItem`). **Normalize to a line-items table**; the newest writes always
  use the `OrderItem` shape.
- **Stock:** creating an order must atomically **decrement** the purchased
  parts' `inStock` (the frontend also fires per-part stock updates).

### 4.8 Notifications

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/notifications` | Inbox scoped to caller role/recipient |
| POST | `/api/v1/notifications` | Create + dispatch a push notification |
| PATCH | `/api/v1/notifications/read-all` | Mark all read |
| PATCH | `/api/v1/notifications/:id/read` | Mark one read |

Input `NotificationInput`: `{ title, message, type:
'appointment'|'order'|'inventory'|'security', to?, appointmentId?, orderId? }`.
Entity `PushNotification` (`src/types.ts:203-215`): adds server-owned `id`,
`timestamp`, `read`. The `to` field is a **recipient target** (`src/types.ts:183-201`):

- `'all' | 'customers' | 'staff' | 'admin' | 'sales' | 'technician' | 'customer:<id>'`

The server should dispatch by target and store a **per-user read flag**. Today
the frontend filters client-side by the viewer's role (`App.tsx:344-356`);
running filter server-side is preferred.

### 4.9 Wishlist (per customer)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/wishlist/:customerId` | Returns `PartItem[]` (full objects) |
| PUT | `/api/v1/wishlist/:customerId` | Body `{ items: PartItem[] }` — replace whole list |

Stored as full part snapshots today (`apex_wishlist_<email>`). Prefer a
`wishlist_items(customer_id, part_id)` join table server-side.

### 4.10 Payments (Paystack)

| Method | Path | Request | Response |
|---|---|---|---|
| POST | `/api/v1/payments/initialize` | `{ amount, email, title, description? }` | `{ reference, authorizationUrl?, accessCode? }` |

- `amount` is sent in **USD** (front-end seed prices). Convert to **Kobo**
  (`amount * 1500 * 100`, or use the live `VITE_NGN_PER_USD` rate) before
  calling Paystack.
- Return Paystack's `reference` + `authorization_url` so the frontend can
  redirect.
- The frontend falls back to a simulated `txn_<digits>` reference when the call
  is unavailable; a verification/confirm endpoint is welcome for production.

---

## 5. Suggested database schema

Logical schema (normalize as your stack dictates — SQL/Prisma/Drizzle/Supabase
all work). Column names keep the TS field names (camelCase).

```
users            (auth: id, name, email UNIQUE, phone, address, vehicleInfo,
                   passwordHash, role, createdAt)          -- one row per login
customers        (id, userId FK?, name, email, phone, address, vehicleInfo,
                   totalSpent, loyaltyPoints, tier, createdAt,
                   encryptedVault JSON)                     -- loyalty record
services         (id, name, category, price, durationMinutes, description,
                   recommendedMileage, features JSON[], popular bool,
                   featured bool)
technicians      (id, name, specialty, experienceYears, rating, avatar,
                   status)
vehicles         (id, make, model, year, price, mileage, transmission, fuel,
                   bodyType, horsepower, zeroToSixty, engine, vin UNIQUE,
                   color, inStock bool, image, gallery JSON[], badges JSON[],
                   features JSON[])
parts            (id, name, brand, partNumber, category, price, originalPrice,
                   rating, reviewsCount, inStock int, fitmentMakes JSON[],
                   fitmentYears, image, gallery JSON[], description,
                   isBestSeller bool, badge)
appointments     (id, customerId FK, customer* (denormalized name/phone/email),
                   vehicleYear/Make/Model/Plate/VIN, serviceId FK, serviceName,
                   additionalServices JSON[], technicianId FK, assignedTechnician
                   (legacy display name), scheduledDate, scheduledTime, status,
                   customerNotes, technicianNotes, totalCost, depositAmount,
                   paymentStatus, paymentTransactionId, createdAt, updatedAt)
orders           (id, customerId FK, shippingAddress, subtotal, discount, tax,
                   shipping, total, couponApplied, paymentMethod, paymentStatus,
                   fulfillmentStatus, estimatedDelivery, trackingNumber,
                   carrier, createdAt)
order_items      (orderId FK, partId FK, partName, brand, price, quantity,
                   image)                                    -- normalized line items
notifications    (id, title, message, type, to, appointmentId?, orderId?,
                   createdAt)
notification_reads (notificationId FK, userId FK, read bool)
wishlist_items   (customerId FK, partId FK, addedAt)
payments         (id, reference UNIQUE, customerId, amountUsd, amountKobo,
                   status, provider 'PAYSTACK', createdAt)   -- optional ledger
```

**Seed data:** the frontend ships canonical seeds in
`src/utils/storage.ts` (`INITIAL_SERVICES`, `INITIAL_VEHICLES`,
`INITIAL_PARTS`, `INITIAL_TECHNICIANS`, `INITIAL_APPOINTMENTS`,
`INITIAL_CUSTOMERS`, `INITIAL_ORDERS`, plus a seed customer
`b.adeleke@gmail.com` / `customer123`). Use these as your initial seed script
so the API returns the same catalogs the app is designed around.

---

## 6. Frontend integration checklist (what's already wired)

- [x] `src/services/api.ts` — complete typed client for every collection
- [x] Hydration: on load, `Promise.all` of list endpoints replaces local state
- [x] Auth: login/register → token stored + attached as `Bearer`
- [x] Books + customer upsert on booking
- [x] Order create + per-part stock sync on checkout
- [x] Appointment status/payment transitions
- [x] Admin CRUD for vehicles, parts, appointments, customers, orders
- [x] Notification send + mark-all-read
- [x] Wishlist get/replace per customer
- [x] Payment initialize → Paystack (simulated fallback)

---

## 7. Security notes (do not skip)

1. **Hashes, not plaintext.** Hash all passwords server-side (bcrypt/argon2).
2. **The client vault is not real protection alone.** `crypto.ts` derives its
   AES key from constants shipped in the browser bundle, so it protects
   "at rest / demo" only. In production, encrypt sensitive customer data
   **server-side with per-user keys** and rely on TLS in transit.
3. Rate-limit auth + payment endpoints; validate/limit request payloads.
4. Enforce RBAC: only `admin`/`sales`/`technician` may mutate catalog & work
   orders; customers may only read/write their own records, wishlist, and
   notifications.
5. Never send the full VIN / license / tax-ID over insecure channels; reuse the
   existing `maskedPreview` pattern for any list/table UI.
6. CORS: allow only the known frontend origin(s).

---

## 8. Known wrinkles to handle in the API

- `Order.items` legacy union shape (`OrderItem | CartItem`) — normalize.
- `assignedTechnician` is a display name; add `technicianId` for new records.
- `scheduledTime` is sometimes `"10:30"`, sometimes `"10:30 AM"` — standardize
  server-side to `HH:mm` (24h).
- Wishlist was keyed by email locally; the API keys by `customerId`.
- Notifications currently have no durable persistence client-side — the DB
  table (with per-user read flags) IS the source of truth once live.