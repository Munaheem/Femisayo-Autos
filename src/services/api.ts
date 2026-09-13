/**
 * Backend API layer — the single gateway the whole app uses for persistent data.
 *
 * Contract
 * --------
 * - The rest of the app talks ONLY to this module — never directly to
 *   localStorage (see src/utils/storage.ts) or hardcoded seeds.
 * - Set VITE_API_URL (see .env.example) to point at a real backend. Until then
 *   (VITE_API_URL empty, the demo mode) every read returns null and every write
 *   is a no-op, so callers fall back to the bundled demo / localStorage
 *   implementation and the site keeps working fully.
 * - Endpoint shapes are the single source of truth for the backend engineer.
 *   See BACKEND_API_CONTRACT.md at the repository root for the full spec,
 *   payload schemas and suggested database design.
 *
 * Auth
 * ----
 * - POST /api/v1/auth/login|register return { role, user?, token }.
 * - When a token is returned it is stored (apex_auth_token) and attached to
 *   every subsequent request as `Authorization: Bearer <token>`.
 */

import type {
  Appointment,
  CustomerRecord,
  Order,
  PartItem,
  PushNotification,
  PushTarget,
  ServiceItem,
  Technician,
  UserRole,
  VehicleItem
} from '../types';
import type { AuthUser } from '../utils/storage';
import { loadAuthToken, saveAuthToken } from '../utils/storage';

export const API_BASE = import.meta.env.VITE_API_URL || '';

/** True when the app is pointed at a real backend. */
export const API_CONFIGURED = Boolean(API_BASE);

// Runtime bearer token (session). Persisted to localStorage so it survives refresh.
let AUTH_TOKEN: string | null = loadAuthToken();

export function setAuthToken(token: string | null): void {
  AUTH_TOKEN = token;
  saveAuthToken(token);
}

export function getAuthToken(): string | null {
  return AUTH_TOKEN;
}

// ---------------------------------------------------------------------------
// Core request helpers. Every helper resolves to null when the backend is not
// configured, or on any transport/5xx/4xx failure — callers treat null as
// "fall back to the demo/local implementation".
// ---------------------------------------------------------------------------

async function request<T>(method: string, path: string, body?: unknown): Promise<T | null> {
  if (!API_BASE) return null;
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (AUTH_TOKEN) headers.Authorization = `Bearer ${AUTH_TOKEN}`;
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    if (!res.ok) return null;
    if (res.status === 204) return null;
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`API ${method} ${path} failed:`, err);
    return null;
  }
}

const get = <T>(p: string) => request<T>('GET', p);
const post = <T>(p: string, b?: unknown) => request<T>('POST', p, b);
const put = <T>(p: string, b?: unknown) => request<T>('PUT', p, b);
const patch = <T>(p: string, b?: unknown) => request<T>('PATCH', p, b);
const del = <T>(p: string) => request<T>('DELETE', p);

// ---------------------------------------------------------------------------
// Request payload types. All camelCase — the backend engineer should keep this
// casing so the DTOs map 1:1 onto the TS interfaces in src/types.ts.
// `id`/`createdAt`/`updatedAt` are server-owned (generated server-side).
// ---------------------------------------------------------------------------

export interface LoginRequest {
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginResponse {
  role: UserRole;
  user?: AuthUser;
  token?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  vehicleInfo: string;
  password: string;
}

export interface PaymentInitializeRequest {
  amount: number; // in USD (front-end seed prices) — convert to Kobo on the server
  email: string;
  title: string;
  description?: string;
}

export interface PaymentInitializeResponse {
  reference: string;
  authorizationUrl?: string; // Paystack redirect URL
  accessCode?: string;
  simulate: boolean; // true while no real backend is connected
}

export type AppointmentInput = Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>;
export type AppointmentPatch = Partial<Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>>;

export type VehicleInput = Omit<VehicleItem, 'id'>;
export type VehiclePatch = Partial<Omit<VehicleItem, 'id'>>;

export type PartInput = Omit<PartItem, 'id'>;
export type PartPatch = Partial<Omit<PartItem, 'id'>>;

export type CustomerInput = Omit<CustomerRecord, 'id' | 'createdAt'>;
export type CustomerPatch = Partial<Omit<CustomerRecord, 'id' | 'createdAt'>>;

export type OrderInput = Omit<Order, 'id' | 'createdAt'>;
export type OrderPatch = Partial<Omit<Order, 'id' | 'createdAt'>>;

export interface NotificationInput {
  title: string;
  message: string;
  type: 'appointment' | 'order' | 'inventory' | 'security';
  to?: PushTarget;
  appointmentId?: string;
  orderId?: string;
}

/** User's saved parts wishlist: an array of full part objects (mirrors localStorage shape). */
export type WishlistPayload = PartItem[];

// ---------------------------------------------------------------------------
// The API surface. Every domain collection in src/App.tsx maps to one group.
// ---------------------------------------------------------------------------

export const api = {
  /** True when VITE_API_URL is set and a real backend should be used. */
  isConfigured: API_CONFIGURED,

  authToken: {
    get: getAuthToken,
    set: setAuthToken,
    clear: () => setAuthToken(null)
  },

  auth: {
    login: (req: LoginRequest): Promise<LoginResponse | null> =>
      post<LoginResponse>('/api/v1/auth/login', req),

    register: (req: RegisterRequest): Promise<LoginResponse | null> =>
      post<LoginResponse>('/api/v1/auth/register', req)
  },

  services: {
    /** GET /api/v1/services */
    list: (): Promise<ServiceItem[] | null> => get<ServiceItem[]>('/api/v1/services'),
    /** POST /api/v1/services */
    create: (input: Omit<ServiceItem, 'id'>): Promise<ServiceItem | null> =>
      post<ServiceItem>('/api/v1/services', input),
    /** PUT /api/v1/services/:id */
    update: (s: ServiceItem): Promise<ServiceItem | null> =>
      put<ServiceItem>(`/api/v1/services/${s.id}`, s),
    /** DELETE /api/v1/services/:id */
    remove: (id: string): Promise<null> => del<null>(`/api/v1/services/${id}`)
  },

  technicians: {
    /** GET /api/v1/technicians */
    list: (): Promise<Technician[] | null> => get<Technician[]>('/api/v1/technicians'),
    /** PATCH /api/v1/technicians/:id */
    update: (t: Technician): Promise<Technician | null> =>
      patch<Technician>(`/api/v1/technicians/${t.id}`, t)
  },

  vehicles: {
    /** GET /api/v1/vehicles */
    list: (): Promise<VehicleItem[] | null> => get<VehicleItem[]>('/api/v1/vehicles'),
    /** POST /api/v1/vehicles */
    create: (input: VehicleInput): Promise<VehicleItem | null> =>
      post<VehicleItem>('/api/v1/vehicles', input),
    /** PUT /api/v1/vehicles/:id */
    update: (v: VehicleItem): Promise<VehicleItem | null> =>
      put<VehicleItem>(`/api/v1/vehicles/${v.id}`, v),
    /** DELETE /api/v1/vehicles/:id */
    remove: (id: string): Promise<null> => del<null>(`/api/v1/vehicles/${id}`)
  },

  parts: {
    /** GET /api/v1/parts */
    list: (): Promise<PartItem[] | null> => get<PartItem[]>('/api/v1/parts'),
    /** POST /api/v1/parts */
    create: (input: PartInput): Promise<PartItem | null> =>
      post<PartItem>('/api/v1/parts', input),
    /** PUT /api/v1/parts/:id */
    update: (p: PartItem): Promise<PartItem | null> =>
      put<PartItem>(`/api/v1/parts/${p.id}`, p),
    /** DELETE /api/v1/parts/:id */
    remove: (id: string): Promise<null> => del<null>(`/api/v1/parts/${id}`)
  },

  appointments: {
    /** GET /api/v1/appointments */
    list: (): Promise<Appointment[] | null> => get<Appointment[]>('/api/v1/appointments'),
    /** POST /api/v1/appointments */
    create: (input: AppointmentInput): Promise<Appointment | null> =>
      post<Appointment>('/api/v1/appointments', input),
    /** PUT /api/v1/appointments/:id */
    update: (a: Appointment): Promise<Appointment | null> =>
      put<Appointment>(`/api/v1/appointments/${a.id}`, a),
    /** DELETE /api/v1/appointments/:id */
    remove: (id: string): Promise<null> => del<null>(`/api/v1/appointments/${id}`)
  },

  /** Backwards-compatible alias used by the booking flow. */
  bookings: {
    create: (input: AppointmentInput): Promise<Appointment | null> =>
      post<Appointment>('/api/v1/appointments', input)
  },

  customers: {
    /** GET /api/v1/customers */
    list: (): Promise<CustomerRecord[] | null> => get<CustomerRecord[]>('/api/v1/customers'),
    /** GET /api/v1/customers/:id/garage — customer, appointments + orders for one customer */
    garage: (id: string): Promise<{ customer: CustomerRecord | null; appointments?: Appointment[]; orders?: Order[] } | null> =>
      get<{ customer: CustomerRecord | null; appointments?: Appointment[]; orders?: Order[] }>(`/api/v1/customers/${id}/garage`),
    /** POST /api/v1/customers */
    create: (input: CustomerInput): Promise<CustomerRecord | null> =>
      post<CustomerRecord>('/api/v1/customers', input),
    /** PUT /api/v1/customers/:id — upsert (create-or-replace keyed by email/id) */
    upsert: (c: CustomerRecord): Promise<CustomerRecord | null> =>
      put<CustomerRecord>(`/api/v1/customers/${c.id}`, c),
    /** PUT /api/v1/customers/:id */
    update: (c: CustomerRecord): Promise<CustomerRecord | null> =>
      put<CustomerRecord>(`/api/v1/customers/${c.id}`, c),
    /** DELETE /api/v1/customers/:id */
    remove: (id: string): Promise<null> => del<null>(`/api/v1/customers/${id}`)
  },

  orders: {
    /** GET /api/v1/orders */
    list: (): Promise<Order[] | null> => get<Order[]>('/api/v1/orders'),
    /** POST /api/v1/orders */
    create: (input: OrderInput): Promise<Order | null> =>
      post<Order>('/api/v1/orders', input),
    /** PUT /api/v1/orders/:id — covers fulfillment/status transitions */
    update: (o: Order): Promise<Order | null> =>
      put<Order>(`/api/v1/orders/${o.id}`, o)
  },

  notifications: {
    /** GET /api/v1/notifications — scoped to the caller's role/recipient */
    list: (): Promise<PushNotification[] | null> =>
      get<PushNotification[]>('/api/v1/notifications'),
    /** POST /api/v1/notifications — create + dispatch a push notification */
    send: (input: NotificationInput): Promise<PushNotification | null> =>
      post<PushNotification>('/api/v1/notifications', input),
    /** PATCH /api/v1/notifications/read-all */
    markAllRead: (): Promise<PushNotification[] | null> =>
      patch<PushNotification[]>('/api/v1/notifications/read-all'),
    /** PATCH /api/v1/notifications/:id/read */
    markRead: (id: string): Promise<PushNotification | null> =>
      patch<PushNotification>(`/api/v1/notifications/${id}/read`)
  },

  wishlist: {
    /** GET /api/v1/wishlist/:customerId */
    get: (customerId: string): Promise<WishlistPayload | null> =>
      get<WishlistPayload>(`/api/v1/wishlist/${customerId}`),
    /** PUT /api/v1/wishlist/:customerId — replace the whole wishlist */
    update: (customerId: string, items: WishlistPayload): Promise<WishlistPayload | null> =>
      put<WishlistPayload>(`/api/v1/wishlist/${customerId}`, { items })
  },

  payments: {
    // TODO(backend): point this at the Paystack init endpoint. Keep the local
    // simulated reference below so the demo flow works without a server.
    initialize: async (req: PaymentInitializeRequest): Promise<PaymentInitializeResponse> => {
      const viaBackend = await post<PaymentInitializeResponse>('/api/v1/payments/initialize', req);
      if (viaBackend) return viaBackend;
      return {
        reference: `txn_${Math.floor(100000000 + Math.random() * 900000000)}`,
        simulate: true
      };
    }
  }
};