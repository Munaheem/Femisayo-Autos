/**
 * Backend API layer.
 *
 * The rest of the app talks ONLY to this module — never directly to
 * localStorage or hardcoded seeds. When a real backend is connected by
 * setting VITE_API_URL (see .env.example), each function makes an HTTP call.
 * Until then (VITE_API_URL empty) every function returns null, and the caller
 * falls back to its bundled demo implementation, so the site keeps working.
 *
 * TODO(backend): implement the endpoints below on the server:
 *   POST /api/v1/auth/login
 *   POST /api/v1/auth/register
 *   POST /api/v1/bookings
 *   POST /api/v1/payments/initialize   (Paystack init → authorization_url)
 *   GET  /api/v1/vehicles
 *   GET  /api/v1/parts
 *   GET  /api/v1/customers/:id/garage
 *   GET  /api/v1/customers/:id/notifications
 */

import type { Appointment, UserRole } from '../types';
import type { AuthUser } from '../utils/storage';

export const API_BASE = import.meta.env.VITE_API_URL || '';

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

/**
 * Shape sent by the registration form.
 * id and createdAt are generated server-side (or locally in the demo fallback).
 */
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

async function postJson<T>(path: string, body: unknown): Promise<T | null> {
  if (!API_BASE) return null;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Central API used across the app. All functions resolve to null until a real
 * backend is configured — callers fall back to demo data in that case.
 */
export const api = {
  auth: {
    login: (req: LoginRequest): Promise<LoginResponse | null> =>
      postJson<LoginResponse>('/api/v1/auth/login', req),

    register: (req: RegisterRequest): Promise<LoginResponse | null> =>
      postJson<LoginResponse>('/api/v1/auth/register', req)
  },

  bookings: {
    create: (appt: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment | null> =>
      postJson<Appointment>('/api/v1/bookings', appt)
  },

  payments: {
    // TODO(backend): point this at the Paystack init endpoint. Keep the local
    // simulated reference below so the demo flow works without a server.
    initialize: async (req: PaymentInitializeRequest): Promise<PaymentInitializeResponse> => {
      const viaBackend = await postJson<PaymentInitializeResponse>('/api/v1/payments/initialize', req);
      if (viaBackend) return viaBackend;
      return {
        reference: `txn_${Math.floor(100000000 + Math.random() * 900000000)}`,
        simulate: true
      };
    }
  }
};