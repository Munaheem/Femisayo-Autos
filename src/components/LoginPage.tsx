import React, { useState } from 'react';
import { Wrench, User, Lock, Mail, ShieldCheck, LogIn, KeyRound, UserCog, UserPlus, Phone, MapPin, Car, X } from 'lucide-react';
import { api } from '../services/api';
import { UserRole } from '../types';
import { AuthUser } from '../utils/storage';

interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  vehicleInfo: string;
  password: string;
}

interface LoginPageProps {
  customerAccounts: AuthUser[];
  onLogin: (role: UserRole, email?: string) => void;
  onRegister: (user: AuthUser) => void;
  /** When provided, the page is shown as an optional overlay (guest can close it). */
  onClose?: () => void;
}

const STAFF_USERS: Record<Exclude<UserRole, 'customer'>, { email: string; password: string }> = {
  technician: { email: 'technician@femisayo.com', password: 'tech123' },
  sales: { email: 'sales@femisayo.com', password: 'sales123' },
  admin: { email: 'admin@femisayo.com', password: 'admin123' }
};

const STAFF_ROLES: Exclude<UserRole, 'customer'>[] = ['admin', 'technician', 'sales'];

const ROLE_META: Record<UserRole, { label: string; desc: string; color: string }> = {
  customer: {
    label: 'Customer',
    desc: 'Book services, buy parts, track your garage',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  },
  technician: {
    label: 'Service Technician',
    desc: 'Bay inspection, repairs & live telematics',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  },
  sales: {
    label: 'Parts & Sales Rep',
    desc: 'Vehicle showroom & stock management',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  },
  admin: {
    label: 'Shop Administrator',
    desc: 'Full CRUD, encrypted vault & analytics',
    color: 'bg-red-500/10 text-red-400 border-red-500/30'
  }
};

export const LoginPage: React.FC<LoginPageProps> = ({ customerAccounts, onLogin, onRegister, onClose }) => {
  const [portal, setPortal] = useState<'customer' | 'staff'>('customer');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [staffRole, setStaffRole] = useState<Exclude<UserRole, 'customer'>>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showCreds, setShowCreds] = useState(false);

  const activeRole: UserRole = portal === 'customer' ? 'customer' : staffRole;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    // Try the backend first (no-op while VITE_API_URL is empty).
    const backendUser = await api.auth.login({ email, password, role: portal === 'customer' ? 'customer' : staffRole });
    if (backendUser) {
      setError('');
      if (backendUser.token) api.authToken.set(backendUser.token);
      if (backendUser.role === 'customer') {
        onLogin('customer', backendUser.user?.email || email);
      } else {
        onLogin(backendUser.role, backendUser.user?.email || email);
      }
      return;
    }

    // --- DEMO FALLBACK (kept until the backend in src/services/api.ts is live) ---
    if (portal === 'customer') {
      const account = customerAccounts.find(
        (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase() && u.password === password
      );
      if (account) {
        setError('');
        onLogin('customer', account.email);
      } else {
        setError('Invalid customer email or password. If you are new, create an account below.');
      }
    } else {
      const expected = STAFF_USERS[staffRole];
      if (email.trim().toLowerCase() === expected.email && password === expected.password) {
        setError('');
        onLogin(staffRole, STAFF_USERS[staffRole].email);
      } else {
        setError(`Invalid credentials for ${ROLE_META[staffRole].label}. Use the demo credentials below.`);
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: RegisterInput = {
      name: String(formData.get('name') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim().toLowerCase(),
      phone: String(formData.get('phone') ?? '').trim(),
      address: String(formData.get('address') ?? '').trim(),
      vehicleInfo: String(formData.get('vehicleInfo') ?? '').trim(),
      password: String(formData.get('password') ?? '')
    };

    if (!data.name || !data.email || !data.phone || !data.address || !data.vehicleInfo || !data.password) {
      setError('Please fill in all fields.');
      return;
    }

    // Try the backend first (no-op while VITE_API_URL is empty).
    const alreadyExistsCheck = customerAccounts.some((u) => u.email.toLowerCase() === data.email);
    const backendUser = !alreadyExistsCheck ? await api.auth.register(data) : null;
    if (backendUser?.user) {
      setError('');
      if (backendUser.token) api.authToken.set(backendUser.token);
      onRegister(backendUser.user);
      return;
    }

    // --- DEMO FALLBACK (kept until the backend in src/services/api.ts is live) ---
    if (alreadyExistsCheck) {
      setError('An account with this email already exists. Please sign in instead.');
      return;
    }

    const user: AuthUser = {
      id: `cust-${Date.now().toString().slice(-6)}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      vehicleInfo: data.vehicleInfo,
      password: data.password,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onRegister(user);
  };

  const fillDemo = (user: AuthUser) => {
    setEmail(user.email);
    setPassword(user.password);
    setError('');
  };

  const inputClass = (icon: boolean) =>
    icon
      ? 'flex items-center gap-2 bg-zinc-950 border border-zinc-700/80 rounded-xl px-3 py-2.5 focus-within:border-red-500/60 transition-colors'
      : 'w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500/60 transition-colors';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-red-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-red-800/10 blur-3xl" />
      </div>

      <div className="relative flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
            {onClose && (
              <div className="flex justify-end mb-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700/60 text-xs text-zinc-300 hover:text-white hover:border-red-500/40 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Continue browsing as guest
                </button>
              </div>
            )}

            {/* Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 shadow-xl shadow-red-900/40 ring-1 ring-red-500/50 mb-4">
              <Wrench className="w-8 h-8 text-white transform -rotate-12" />
            </div>
            <h1 className="text-2xl font-black tracking-tight font-mono">
              FEMISAYO <span className="text-red-500">AUTOS</span>
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              Auto Repair Shop • Lekki, Lagos • CAC BN-2641123
            </p>
          </div>

          {/* Portal Tabs */}
          <div className="grid grid-cols-2 gap-1.5 bg-zinc-900 border border-zinc-800 p-1.5 rounded-xl mb-6">
            <button
              onClick={() => { setPortal('customer'); setIsRegisterMode(false); setError(''); }}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                portal === 'customer'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <User className="w-4 h-4" />
              Customer Login
            </button>
            <button
              onClick={() => { setPortal('staff'); setIsRegisterMode(false); setError(''); }}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                portal === 'staff'
                  ? 'bg-red-600 text-white shadow-md shadow-red-900/40'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Staff Login
            </button>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            {portal === 'customer' && isRegisterMode ? (
              /* ------- CUSTOMER REGISTRATION ------- */
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="text-center">
                  <h3 className="text-sm font-black uppercase tracking-wider font-mono text-white flex items-center justify-center gap-2">
                    <UserPlus className="w-4 h-4 text-emerald-400" />
                    Create Customer Account
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Your wishlist and orders will be tied to this account.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input type="text" name="name" placeholder="e.g. Chinwe Eze" className={inputClass(false)} required />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input type="email" name="email" placeholder="you@example.com" className={inputClass(false)} required />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input type="tel" name="phone" placeholder="+234 800 000 0000" className={inputClass(false)} required />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Delivery Address</label>
                  <input type="text" name="address" placeholder="Street, area, city" className={inputClass(false)} required />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Vehicle (Year Make Model)</label>
                  <input type="text" name="vehicleInfo" placeholder="e.g. 2023 Toyota Camry" className={inputClass(false)} required />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Password</label>
                  <input type="password" name="password" placeholder="Create a password" className={inputClass(false)} required />
                </div>

                {error && (
                  <p className="text-xs text-red-400 font-semibold bg-red-950/40 border border-red-500/30 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Create Account &amp; Sign In
                </button>

                <button
                  type="button"
                  onClick={() => { setIsRegisterMode(false); setError(''); }}
                  className="w-full text-[11px] text-zinc-500 hover:text-zinc-300 font-semibold"
                >
                  Already have an account? Sign in
                </button>
              </form>
            ) : (
              /* ------- SIGN IN ------- */
              <form onSubmit={handleSignIn} className="space-y-5">
                {/* Role indicator / staff role picker */}
                {portal === 'customer' ? (
                  <div className={`flex items-center gap-3 p-3 rounded-xl border ${ROLE_META.customer.color}`}>
                    <User className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider">Customer Portal</p>
                      <p className="text-[11px] opacity-80">{ROLE_META.customer.desc}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <UserCog className="w-4 h-4 text-red-400" />
                      Staff Role
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {STAFF_ROLES.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => { setStaffRole(r); setError(''); }}
                          className={`px-2 py-2.5 rounded-xl text-xs font-bold capitalize border transition-all ${
                            staffRole === r
                              ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-900/40'
                              : 'text-zinc-400 hover:text-white border-zinc-700 hover:bg-zinc-800'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className={inputClass(true)}>
                    <Mail className="w-4 h-4 text-zinc-500 shrink-0" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@femisayo.com"
                      className="w-full bg-transparent text-sm text-white placeholder-zinc-600 outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className={inputClass(true)}>
                    <Lock className="w-4 h-4 text-zinc-500 shrink-0" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent text-sm text-white placeholder-zinc-600 outline-none"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-400 font-semibold bg-red-950/40 border border-red-500/30 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-900/40 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In as {ROLE_META[activeRole].label}
                </button>

                {portal === 'customer' && (
                  <button
                    type="button"
                    onClick={() => { setIsRegisterMode(true); setError(''); }}
                    className="w-full text-[11px] text-zinc-500 hover:text-zinc-300 font-semibold flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    New customer? Create an account
                  </button>
                )}

                {/* Demo credentials helper */}
                <div className="border-t border-zinc-800 pt-4 space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowCreds(!showCreds)}
                    className="w-full text-[11px] text-zinc-500 hover:text-zinc-300 font-semibold flex items-center justify-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    {showCreds ? 'Hide' : 'Show'} Demo Credentials
                  </button>

                  {showCreds && (
                    <div className="space-y-1.5">
                      {portal === 'customer' ? (
                        customerAccounts.map((account) => (
                          <button
                            key={account.email}
                            type="button"
                            onClick={() => fillDemo(account)}
                            className="w-full flex items-center justify-between gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-left hover:border-red-500/40 transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-zinc-200 truncate">{account.name}</p>
                              <p className="text-[10px] font-mono text-zinc-500 truncate">
                                {account.email} / {account.password}
                              </p>
                            </div>
                            <span className="text-[10px] text-red-400 font-semibold shrink-0">Auto-fill</span>
                          </button>
                        ))
                      ) : (
                        STAFF_ROLES.map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => { setStaffRole(role); setEmail(STAFF_USERS[role].email); setPassword(STAFF_USERS[role].password); setError(''); }}
                            className="w-full flex items-center justify-between gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-left hover:border-red-500/40 transition-colors"
                          >
                            <div>
                              <p className="text-[11px] font-bold text-zinc-200 capitalize">{role}</p>
                              <p className="text-[10px] font-mono text-zinc-500">
                                {STAFF_USERS[role].email} / {STAFF_USERS[role].password}
                              </p>
                            </div>
                            <span className="text-[10px] text-red-400 font-semibold shrink-0">Auto-fill</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </form>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px] text-zinc-500 mt-6 font-mono">
            <span className="flex items-center gap-1"><Phone className="w-3 h-3 shrink-0" /> +234 802 317 9860</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 shrink-0" /> Lekki, Lagos</span>
            <span className="flex items-center gap-1"><Car className="w-3 h-3 shrink-0" /> Est. 2018</span>
          </div>
          <p className="text-center text-[11px] text-zinc-500 mt-2 font-mono">
            © {new Date().getFullYear()} Femisayo Autos. Role-Based Access Control.
          </p>
        </div>
      </div>
    </div>
  );
};