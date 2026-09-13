// @ts-nocheck React type declarations are unavailable in the current project setup.
import React, { useState, useEffect } from 'react';
import ImageGalleryEditor from './ImageGalleryEditor';

// Keep this component type-checkable when React's type packages are not installed.
// React's runtime is JavaScript-only in this project, so suppress the
// augmentation diagnostic while providing the minimal JSX runtime surface.
// @ts-ignore
declare module 'react/jsx-runtime' {
  export const Fragment: any;
  export const jsx: (...args: any[]) => any;
  export const jsxs: (...args: any[]) => any;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elementName: string]: any;
    }
  }
}

import { 
  BarChart3, 
  Calendar, 
  Package, 
  Users, 
  Truck, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Send, 
  Bell, 
  Eye, 
  EyeOff, 
  DollarSign, 
  Wrench, 
  Car, 
  Key, 
  Activity,
  Check,
  X,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Receipt
} from 'lucide-react';
import { 
  Appointment, 
  AppointmentStatus, 
  CustomerRecord, 
  Order, 
  PartItem, 
  PushTarget, 
  Technician, 
  UserRole, 
  VehicleItem 
} from '../types';
import { decryptSensitiveData, encryptSensitiveData, SensitiveCustomerPayload } from '../utils/crypto';
import { useCurrency } from '../context/CurrencyContext';

const STAFF_TECH_BY_EMAIL: Record<string, string> = {
  'technician@femisayo.com': 'Femi Adeyemi'
};

interface AdminPortalProps {
  currentRole: UserRole;
  authRole: UserRole;
  setRole: (role: UserRole) => void;
  /** Staff identity used to scope workspaces (e.g. which technician a technician login maps to). */
  staffEmail?: string | null;
  appointments: Appointment[];
  onUpdateAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
  onCreateAppointment: (appointment: Appointment) => void;
  vehicles: VehicleItem[];
  onUpdateVehicle: (vehicle: VehicleItem) => void;
  onDeleteVehicle: (id: string) => void;
  onCreateVehicle: (vehicle: VehicleItem) => void;
  parts: PartItem[];
  onUpdatePart: (part: PartItem) => void;
  onDeletePart: (id: string) => void;
  onCreatePart: (part: PartItem) => void;
  customers: CustomerRecord[];
  onUpdateCustomer: (customer: CustomerRecord) => void;
  onDeleteCustomer: (id: string) => void;
  onCreateCustomer: (customer: CustomerRecord) => void;
  orders: Order[];
  onUpdateOrder: (order: Order) => void;
  technicians: Technician[];
  onSendPushNotification: (title: string, message: string, type: 'appointment' | 'order' | 'inventory' | 'security', to?: PushTarget) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentRole,
  authRole,
  setRole,
  staffEmail,
  appointments,
  onUpdateAppointment,
  onDeleteAppointment,
  onCreateAppointment,
  vehicles,
  onUpdateVehicle,
  onDeleteVehicle,
  onCreateVehicle,
  parts,
  onUpdatePart,
  onDeletePart,
  onCreatePart,
  customers,
  onUpdateCustomer,
  onDeleteCustomer,
  onCreateCustomer,
  orders,
  onUpdateOrder,
  technicians,
  onSendPushNotification
}: AdminPortalProps) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'appointments' | 'inventory' | 'customers' | 'tracking'>('analytics');
  const [inventorySubTab, setInventorySubTab] = useState<'parts' | 'vehicles'>('parts');

  // Search & Filter state
  const [appointmentSearch, setAppointmentSearch] = useState('');
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState<string>('all');
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [newAppointmentModal, setNewAppointmentModal] = useState(false);

  // Inventory modal states
  const [editingPart, setEditingPart] = useState<PartItem | null>(null);
  const [newPartModal, setNewPartModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleItem | null>(null);
  const [newVehicleModal, setNewVehicleModal] = useState(false);

  // Uploaded image gallery (base64 crops) for inventory items
  const [partGallery, setPartGallery] = useState<string[]>([]);
  const [vehGallery, setVehGallery] = useState<string[]>([]);

  // Customer Vault & Decryption state
  const [customerSearch, setCustomerSearch] = useState('');
  const [expandedCustomers, setExpandedCustomers] = useState<string[]>([]);
  const [decryptedVaults, setDecryptedVaults] = useState<Record<string, SensitiveCustomerPayload>>({});
  const [decryptingCustomerId, setDecryptingCustomerId] = useState<string | null>(null);
  const [vaultPassphrase, setVaultPassphrase] = useState('');
  const [vaultError, setVaultError] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<CustomerRecord | null>(null);
  const [newCustomerModal, setNewCustomerModal] = useState(false);

  // Notification feedback
  const [notifSentBanner, setNotifSentBanner] = useState<string | null>(null);

  // Targeted push composer state
  const [pushComposerOpen, setPushComposerOpen] = useState(false);
  const [pushTitle, setPushTitle] = useState('Apex Workshop Alert');
  const [pushMessage, setPushMessage] = useState('Your vehicle multi-point health check report has been generated. Ready for review.');
  const [pushType, setPushType] = useState<'appointment' | 'order' | 'inventory' | 'security'>('appointment');
  const [pushTarget, setPushTarget] = useState<PushTarget>('all');
  const [pushCustomerId, setPushCustomerId] = useState('');

  // Technician workspace scoping
  const isTechnicianView = currentRole === 'technician';
  const isSalesView = currentRole === 'sales';
  const [selectedTechName, setSelectedTechName] = useState<string>(technicians[0]?.name || 'Femi Adeyemi');

  // Lock a logged-in technician to their own job board (admins can still browse every tech)
  useEffect(() => {
    if (authRole === 'technician' && staffEmail) {
      const name = STAFF_TECH_BY_EMAIL[staffEmail];
      if (name && selectedTechName !== name) setSelectedTechName(name);
    }
  }, [authRole, staffEmail, selectedTechName]);

  // Keep sales on tabs available to their workspace (analytics & customers are admin-only)
  useEffect(() => {
    if (isSalesView && !['appointments', 'inventory', 'tracking'].includes(activeTab)) {
      setActiveTab('inventory');
    }
  }, [isSalesView, activeTab]);

  const { formatPrice, exchangeRate } = useCurrency();

  // Financial KPI calculations
  const totalServiceRevenue = appointments.reduce((sum, a) => sum + (a.paymentStatus !== 'pending' ? a.totalCost : 0), 0);
  const totalPartsRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 0);
  const totalGrossRevenue = totalServiceRevenue + totalPartsRevenue + 122900; // includes booked car sales
  const activeRepairOrders = appointments.filter(a => ['in_inspection', 'in_repair', 'quality_check'].includes(a.status)).length;
  const completedServices = appointments.filter(a => a.status === 'completed' || a.status === 'ready_for_pickup').length;
  const lowStockParts = parts.filter(p => p.inStock < 15);

  const handleTriggerPush = (title: string, message: string, type: 'appointment' | 'order' | 'inventory' | 'security', to: PushTarget = 'all') => {
    onSendPushNotification(title, message, type, to);
    setNotifSentBanner(`Push dispatched: "${title}"`);
    setTimeout(() => setNotifSentBanner(null), 3000);
  };

  // Resolve a customer email to its recipient target.
  const targetForCustomerEmail = (email: string): PushTarget => {
    const found = customers.find(c => c.email.toLowerCase() === (email || '').toLowerCase());
    return found ? `customer:${found.id}` : 'all';
  };

  const handleSendComposedPush = () => {
    if (!pushTitle.trim() || !pushMessage.trim()) return;
    const recipient: PushTarget =
      pushTarget === 'customer' && pushCustomerId
        ? `customer:${pushCustomerId}`
        : pushTarget;
    handleTriggerPush(pushTitle.trim(), pushMessage.trim(), pushType, recipient);
  };

  const handleAdvanceAppointmentStatus = (apt: Appointment, nextStatus: AppointmentStatus) => {
    const updated: Appointment = {
      ...apt,
      status: nextStatus,
      updatedAt: new Date().toISOString()
    };
    onUpdateAppointment(updated);

    // Auto-dispatch real-time Push Notification to the user!
    const statusTitles: Record<AppointmentStatus, string> = {
      pending: 'Appointment Received',
      confirmed: 'Service Confirmed & Bay Reserved',
      in_inspection: 'Vehicle On Lift - Inspection Underway',
      in_repair: 'Mechanic Work In Progress',
      quality_check: 'Quality & Road Test in Progress',
      ready_for_pickup: 'Vehicle Ready For Pickup!',
      completed: 'Service Order Finalized & Completed',
      cancelled: 'Service Cancelled'
    };

    handleTriggerPush(
      statusTitles[nextStatus] || 'Service Status Update',
      `Update for ${apt.vehicleYear} ${apt.vehicleMake} ${apt.vehicleModel}: ${statusTitles[nextStatus]} by Tech ${apt.assignedTechnician}.`,
      'appointment',
      targetForCustomerEmail(apt.customerEmail)
    );
  };

  const handleDecryptCustomer = async (cust: CustomerRecord) => {
    setDecryptingCustomerId(cust.id);
    setVaultError('');
    try {
      const decrypted = await decryptSensitiveData(
        cust.encryptedVault, 
        vaultPassphrase || undefined
      );
      setDecryptedVaults((prev: Record<string, SensitiveCustomerPayload>) => ({ ...prev, [cust.id]: decrypted }));
      setDecryptingCustomerId(null);
      handleTriggerPush(
        'Security Audit: Customer Vault Decrypted',
        `Authorized staff member unlocked privacy vault for customer #${cust.id} (${cust.name}).`,
        'security',
        'admin'
      );
    } catch (e: any) {
      setVaultError(e.message || 'Decryption failed.');
    }
  };

  const handleLockCustomer = (id: string) => {
    setDecryptedVaults((prev: Record<string, SensitiveCustomerPayload>) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-zinc-100">
      
      {/* Toast Banner for Dispatched Notifications */}
      {notifSentBanner && (
        <div className="fixed top-20 right-6 z-50 bg-amber-600 text-black px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-4">
          <Send className="w-4 h-4 text-black" />
          <span>{notifSentBanner}</span>
        </div>
      )}

      {/* Admin Portal Header & RBAC Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded tracking-wider">
              Staff Portal
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              Active Role: <strong className="text-white uppercase">{currentRole}</strong>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
            WORKSHOP OPERATIONS &amp; CRUD MANAGEMENT
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time appointment scheduling, inventory lifecycle, privacy-compliant encrypted customer records, and live bay telematics.
          </p>
        </div>

        {/* Staff Role Switcher Toolbar — only the admin identity can switch; technicians & sales are locked */}
        {authRole === 'admin' ? (
          <div className="flex flex-wrap items-center gap-1.5 bg-zinc-900 border border-zinc-800 p-1.5 rounded-xl w-full sm:w-auto">
            <span className="text-[11px] text-zinc-400 font-semibold px-1 sm:px-2">Role:</span>
            {(['technician', 'sales', 'admin'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all text-center ${
                  currentRole === r
                    ? 'bg-red-600 text-white shadow-md shadow-red-700/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5 bg-zinc-900 border border-zinc-800 p-1.5 rounded-xl w-full sm:w-auto">
            <span className="text-[11px] text-zinc-400 font-semibold px-1 sm:px-2">Role:</span>
            <span className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all text-center ${
              currentRole === 'technician'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-700/30'
                : 'bg-amber-600 text-white shadow-md shadow-amber-700/30'
            }`}>
              {currentRole}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1 px-1">
              <Lock className="w-3 h-3" /> locked
            </span>
          </div>
        )}
      </div>

      {/* Technician sees only their assigned, in-progress and finished jobs */}
      {currentRole === 'technician' && (
        <div className="bg-blue-950/40 border border-blue-500/40 rounded-2xl p-3.5 sm:p-4 mb-6 flex items-center gap-3">
          <Wrench className="w-5 h-5 text-blue-400 shrink-0" />
          <div className="text-xs text-zinc-300">
            <span className="font-bold text-blue-300">Technician Workspace:</span> you only see jobs assigned to you — scheduled, jobs you are attending to, and finished work.
          </div>
        </div>
      )}

      {/* Sales workspace banner */}
      {currentRole === 'sales' && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-3.5 sm:p-4 mb-6 flex items-center gap-3">
          <Car className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-xs text-zinc-300">
            <span className="font-bold text-amber-300">Sales &amp; Showroom Workspace:</span> manage showroom inventory
            (add, edit, stock levels), and coordinate parts delivery and service handovers. Financial KPIs, the
            customer privacy vault and record deletion are restricted to the administrator.
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TECHNICIAN WORKSPACE — ONLY ASSIGNED / IN-PROGRESS / FINISHED JOBS */}
      {/* ========================================================================= */}
      {isTechnicianView && (
        <div className="space-y-6">
          {/* Tech selector — admins can browse every tech; logged-in technicians are scoped to their own jobs */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-zinc-400 font-semibold">Viewing jobs for:</span>
            {authRole === 'admin' ? (
              technicians.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTechName(t.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedTechName === t.name
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {t.name} ({t.specialty})
                </button>
              ))
            ) : (
              <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                {selectedTechName}
              </span>
            )}
          </div>

          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-x-auto shadow-xl">
            <table className="w-full min-w-[1150px] text-left text-xs text-zinc-300 whitespace-nowrap crud-table">
              <thead className="bg-zinc-950 text-zinc-400 uppercase font-mono text-[10px] border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3.5">ID / Date</th>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Vehicle</th>
                  <th className="px-4 py-3.5">Service Package</th>
                  <th className="px-4 py-3.5">Stage</th>
                  <th className="px-4 py-3.5">Notes</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {appointments
                  .filter(a => a.assignedTechnician === selectedTechName)
                  .map((apt) => {
                    const inProgress = ['in_inspection', 'in_repair', 'quality_check'].includes(apt.status);
                    const finished = apt.status === 'completed' || apt.status === 'ready_for_pickup';
                    const assigned = apt.status === 'confirmed';
                    if (!assigned && !inProgress && !finished) return null;

                    const stageLabel = assigned
                      ? 'Assigned — Awaiting Start'
                      : inProgress
                        ? apt.status.replace('_', ' ').toUpperCase()
                        : apt.status === 'ready_for_pickup'
                          ? 'READY FOR PICKUP'
                          : 'COMPLETED';

                    const stageColor = assigned
                      ? 'bg-zinc-800 text-zinc-300'
                      : inProgress
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : apt.status === 'ready_for_pickup'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';

                    return (
                      <tr key={apt.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="px-4 py-3 font-mono">
                          <span className="text-white font-bold">{apt.id.toUpperCase()}</span>
                          <div className="text-[11px] text-zinc-500">{apt.scheduledDate} {apt.scheduledTime}</div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-semibold text-white">{apt.customerName}</div>
                          <div className="text-[11px] text-zinc-400">{apt.customerPhone}</div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-semibold text-zinc-200">
                            {apt.vehicleYear} {apt.vehicleMake} {apt.vehicleModel}
                          </div>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {apt.vehiclePlate}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-medium text-white line-clamp-1">{apt.serviceName}</div>
                        </td>

                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${stageColor}`}>
                            {stageLabel}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-zinc-400">
                          {apt.technicianNotes || '—'}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {apt.status === 'confirmed' && (
                              <button
                                onClick={() => handleAdvanceAppointmentStatus(apt, 'in_inspection')}
                                className="p-1.5 rounded bg-blue-950 text-blue-400 border border-blue-800 hover:bg-blue-900 flex items-center gap-1 text-[10px] font-bold"
                                title="Start Inspection"
                              >
                                <Wrench className="w-3.5 h-3.5" /> Start
                              </button>
                            )}
                            {apt.status === 'in_inspection' && (
                              <button
                                onClick={() => handleAdvanceAppointmentStatus(apt, 'in_repair')}
                                className="p-1.5 rounded bg-blue-950 text-blue-400 border border-blue-800 hover:bg-blue-900 flex items-center gap-1 text-[10px] font-bold"
                                title="Begin Repair"
                              >
                                <Wrench className="w-3.5 h-3.5" /> Repair
                              </button>
                            )}
                            {apt.status === 'in_repair' && (
                              <button
                                onClick={() => handleAdvanceAppointmentStatus(apt, 'quality_check')}
                                className="p-1.5 rounded bg-amber-950 text-amber-400 border border-amber-800 hover:bg-amber-900 flex items-center gap-1 text-[10px] font-bold"
                                title="Quality Check"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> QC
                              </button>
                            )}
                            {apt.status === 'quality_check' && (
                              <button
                                onClick={() => handleAdvanceAppointmentStatus(apt, 'ready_for_pickup')}
                                className="p-1.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900 flex items-center gap-1 text-[10px] font-bold"
                                title="Ready for Pickup"
                              >
                                <Send className="w-3.5 h-3.5" /> Ready
                              </button>
                            )}
                            {apt.status === 'ready_for_pickup' && (
                              <button
                                onClick={() => handleAdvanceAppointmentStatus(apt, 'completed')}
                                className="p-1.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 flex items-center gap-1 text-[10px] font-bold"
                                title="Close & Complete Job"
                              >
                                <Check className="w-3.5 h-3.5" /> Close
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
</table>
          </div>

          </div>
      )}
      {/* Navigation Tabs (hidden for technician workspace; sales get inventory/orders/appointments only) */}
      {!isTechnicianView && (
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-zinc-800/80 no-scrollbar">
        {!isSalesView && (
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-red-600 text-white shadow-md shadow-red-700/30'
              : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics &amp; KPIs</span>
        </button>
        )}

        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'appointments'
              ? 'bg-red-600 text-white shadow-md shadow-red-700/30'
              : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{isSalesView ? `Service Appointments (${appointments.length})` : `Appointments CRUD (${appointments.length})`}</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'bg-red-600 text-white shadow-md shadow-red-700/30'
              : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Inventory CRUD ({parts.length + vehicles.length})</span>
        </button>

        {!isSalesView && (
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'customers'
              ? 'bg-red-600 text-white shadow-md shadow-red-700/30'
              : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Customer Records &amp; Privacy Vault</span>
          <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.2 rounded">
            AES-256
          </span>
        </button>
        )}

        <button
          onClick={() => setActiveTab('tracking')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'tracking'
              ? 'bg-red-600 text-white shadow-md shadow-red-700/30'
              : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Live Bays &amp; Delivery Tracking</span>
        </button>
      </div>
      )}

      {/* ========================================================================= */}
      {/* 1. ANALYTICS & DASHBOARD KPI TAB */}
      {/* ========================================================================= */}
      {!isTechnicianView && !isSalesView && activeTab === 'analytics' && (
        <div className="space-y-8">
          
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                <span>Total Shop Gross Volume</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                {formatPrice(totalGrossRevenue, { compact: true })}
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                +18.4% vs last month
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                <span>Active Service Bay Orders</span>
                <Wrench className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                {activeRepairOrders} Vehicles
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">
                Across 4 certified technician bays
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                <span>Completed Repair Jobs</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                {completedServices} Jobs
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">
                99.2% on-time completion rate
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                <span>Parts &amp; Accessories Stock</span>
                <Package className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                {parts.reduce((acc, p) => acc + p.inStock, 0)} Units
              </div>
              <div className="text-[11px] text-amber-400 font-semibold mt-1">
                {lowStockParts.length} items flagged low stock
              </div>
            </div>
          </div>

          {/* Bay Status Real-time Matrix & Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Bay Workload Status */}
            <div className="lg:col-span-2 rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-red-500" />
                  Live Workshop Bay Status Matrix
                </h3>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono">
                  All Systems Online
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {technicians.map((tech, idx) => {
                  const assignedJob = appointments.find(a => a.assignedTechnician === tech.name && ['in_inspection', 'in_repair', 'quality_check'].includes(a.status));

                  return (
                    <div
                      key={tech.id}
                      className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold font-mono text-red-400 uppercase">
                          Bay #{idx + 1}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          assignedJob 
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {assignedJob ? 'Active Service' : 'Ready / Clean'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={tech.avatar}
                          alt={tech.name}
                          className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                        />
                        <div>
                          <div className="text-xs font-bold text-white">{tech.name}</div>
                          <p className="text-[11px] text-zinc-400">{tech.specialty}</p>
                        </div>
                      </div>

                      <div className="text-[11px] bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 text-zinc-300 font-mono">
                        {assignedJob ? (
                          <>
                            <span className="text-zinc-500 block text-[10px]">Current Vehicle:</span>
                            <strong className="text-white">{assignedJob.vehicleYear} {assignedJob.vehicleMake} {assignedJob.vehicleModel}</strong>
                            <span className="text-red-400 block text-[10px] mt-0.5">Status: {assignedJob.status.replace('_', ' ').toUpperCase()}</span>
                          </>
                        ) : (
                          <span className="text-zinc-500">No active job currently staged. Next booking starts 02:00 PM.</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Service Category Revenue Split */}
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200 mb-1 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-red-500" />
                  Service Volume Breakdown
                </h3>
                <p className="text-xs text-zinc-400">Monthly job distribution by specialty</p>

                <div className="space-y-3 mt-6">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">Brake Systems &amp; Ceramic Rotors</span>
                      <span className="font-mono text-white">38%</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
                      <div className="h-full bg-red-600 rounded-full w-[38%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">Synthetic Fluid &amp; Filter Service</span>
                      <span className="font-mono text-white">27%</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full w-[27%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">OBD2 &amp; Electrical CAN Diagnostics</span>
                      <span className="font-mono text-white">18%</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full w-[18%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">Dyno Tuning &amp; Suspension Overhaul</span>
                      <span className="font-mono text-white">17%</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[17%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Targeted Push Composer Widget */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 mt-6">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-red-400" />
                    Send Targeted Push Message
                  </span>
                  {pushComposerOpen && (
                    <button
                      onClick={() => setPushComposerOpen(false)}
                      className="text-[10px] text-zinc-500 hover:text-zinc-300 font-semibold uppercase tracking-wide"
                    >
                      Close
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 mb-2">
                  Choose the recipient — a specific customer, all customers, or the staff.
                </p>

                {!pushComposerOpen ? (
                  <button
                    onClick={() => setPushComposerOpen(true)}
                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    <span>Compose &amp; Send Notification</span>
                  </button>
                ) : (
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[10px] font-mono text-zinc-500 block mb-1 uppercase tracking-wider">
                        Title
                      </label>
                      <input
                        type="text"
                        value={pushTitle}
                        onChange={(e) => setPushTitle(e.target.value)}
                        placeholder="Notification title"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-zinc-500 block mb-1 uppercase tracking-wider">
                        Message
                      </label>
                      <textarea
                        value={pushMessage}
                        onChange={(e) => setPushMessage(e.target.value)}
                        placeholder="Notification message"
                        rows={2}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-mono text-zinc-500 block mb-1 uppercase tracking-wider">
                          Category
                        </label>
                        <select
                          value={pushType}
                          onChange={(e) => setPushType(e.target.value as typeof pushType)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                        >
                          <option value="appointment">Appointment</option>
                          <option value="order">Order</option>
                          <option value="inventory">Inventory</option>
                          <option value="security">Security</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-zinc-500 block mb-1 uppercase tracking-wider">
                          Recipient
                        </label>
                        <select
                          value={pushTarget}
                          onChange={(e) => setPushTarget(e.target.value as PushTarget)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                        >
                          <option value="all">Everyone (General)</option>
                          <option value="customers">All Customers</option>
                          <option value="staff">All Staff</option>
                          <option value="admin">Admins Only</option>
                          <option value="sales">Sales Reps Only</option>
                          <option value="technician">Technicians Only</option>
                          <option value="customer">Specific Customer…</option>
                        </select>
                      </div>
                    </div>

                    {pushTarget === 'customer' && (
                      <div>
                        <label className="text-[10px] font-mono text-zinc-500 block mb-1 uppercase tracking-wider">
                          Select Customer
                        </label>
                        <select
                          value={pushCustomerId}
                          onChange={(e) => setPushCustomerId(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                        >
                          <option value="">Choose a customer…</option>
                          {customers.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.email})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <button
                      onClick={handleSendComposedPush}
                      disabled={!pushTitle.trim() || !pushMessage.trim() || (pushTarget === 'customer' && !pushCustomerId)}
                      className="w-full py-2 bg-red-600 hover:bg-red-500 disabled:bg-zinc-700 disabled:text-zinc-400 text-xs font-bold text-white rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Notification</span>
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. APPOINTMENTS CRUD TAB */}
      {/* ========================================================================= */}
      {!isTechnicianView && activeTab === 'appointments' && (
        <div className="space-y-6">
          
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer, vehicle, VIN..."
                  value={appointmentSearch}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAppointmentSearch(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <select
                value={appointmentStatusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAppointmentStatusFilter(e.target.value)}
                className="w-full sm:w-auto bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_inspection">In Inspection</option>
                <option value="in_repair">In Repair</option>
                <option value="quality_check">Quality Check</option>
                <option value="ready_for_pickup">Ready for Pickup</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {!isSalesView && (
            <button
              onClick={() => setNewAppointmentModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-700/30 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Create Work Order</span>
            </button>
            )}
          </div>

          {/* Appointments Table */}
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-x-auto shadow-xl">
            <table className="w-full min-w-[1300px] text-left text-xs text-zinc-300 whitespace-nowrap crud-table">
              <thead className="bg-zinc-950 text-zinc-400 uppercase font-mono text-[10px] border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3.5">ID / Date</th>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Vehicle</th>
                  <th className="px-4 py-3.5">Service Package</th>
                  <th className="px-4 py-3.5">Tech Assigned</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Total</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {appointments
                  .filter(a => {
                    const matchesSearch = 
                      a.customerName.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
                      a.vehicleMake.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
                      a.vehicleModel.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
                      a.id.toLowerCase().includes(appointmentSearch.toLowerCase());
                    const matchesStatus = appointmentStatusFilter === 'all' || a.status === appointmentStatusFilter;
                    return matchesSearch && matchesStatus;
                  })
                  .map((apt) => (
                    <tr key={apt.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-4 py-3 font-mono">
                        <span className="text-white font-bold">{apt.id.toUpperCase()}</span>
                        <div className="text-[11px] text-zinc-500">{apt.scheduledDate} {apt.scheduledTime}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{apt.customerName}</div>
                        <div className="text-[11px] text-zinc-400">{apt.customerPhone}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-zinc-200">
                          {apt.vehicleYear} {apt.vehicleMake} {apt.vehicleModel}
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          VIN: {apt.vin ? `••••${apt.vin.slice(-4)}` : 'N/A'} • {apt.vehiclePlate}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-white line-clamp-1">{apt.serviceName}</div>
                        {apt.additionalServices.length > 0 && (
                          <span className="text-[10px] text-red-400">
                            +{apt.additionalServices.length} add-ons
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 font-medium text-zinc-300">
                        {apt.assignedTechnician}
                      </td>

                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          apt.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          apt.status === 'ready_for_pickup' ? 'bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse' :
                          apt.status === 'in_repair' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          apt.status === 'in_inspection' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          apt.status === 'cancelled' ? 'bg-zinc-800 text-zinc-500' :
                          'bg-zinc-800 text-zinc-300'
                        }`}>
                          {apt.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-mono font-bold text-white">
                        {formatPrice(apt.totalCost)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {isSalesView ? (
                          <span className="text-[10px] text-zinc-600 font-mono uppercase">Read-only</span>
                        ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick advance status button */}
                          {apt.status === 'confirmed' && (
                            <button
                              onClick={() => handleAdvanceAppointmentStatus(apt, 'in_inspection')}
                              className="p-1 rounded bg-blue-950 text-blue-400 border border-blue-800 hover:bg-blue-900"
                              title="Start Inspection"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {apt.status === 'in_inspection' && (
                            <button
                              onClick={() => handleAdvanceAppointmentStatus(apt, 'in_repair')}
                              className="p-1 rounded bg-blue-950 text-blue-400 border border-blue-800 hover:bg-blue-900"
                              title="Begin Repair"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {apt.status === 'in_repair' && (
                            <button
                              onClick={() => handleAdvanceAppointmentStatus(apt, 'quality_check')}
                              className="p-1 rounded bg-amber-950 text-amber-400 border border-amber-800 hover:bg-amber-900"
                              title="Quality Check"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {apt.status === 'quality_check' && (
                            <button
                              onClick={() => handleAdvanceAppointmentStatus(apt, 'ready_for_pickup')}
                              className="p-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900"
                              title="Ready for Pickup (Notify Customer)"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Edit / Delete */}
                          <button
                            onClick={() => setEditingAppointment(apt)}
                            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDeleteAppointment(apt.id)}
                            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-zinc-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. INVENTORY CRUD TAB (PARTS & VEHICLES) */}
      {/* ========================================================================= */}
      {!isTechnicianView && activeTab === 'inventory' && (
        <div className="space-y-6">
          
          {/* Subtabs: Parts vs Vehicles */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setInventorySubTab('parts')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                  inventorySubTab === 'parts'
                    ? 'bg-red-600 text-white'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                Parts &amp; Accessories ({parts.length})
              </button>

              <button
                onClick={() => setInventorySubTab('vehicles')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                  inventorySubTab === 'vehicles'
                    ? 'bg-red-600 text-white'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                Cars for Sale ({vehicles.length})
              </button>
            </div>

            {inventorySubTab === 'parts' ? (
              <button
                onClick={() => { setNewPartModal(true); setPartGallery([]); }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Part</span>
              </button>
            ) : (
              <button
                onClick={() => { setNewVehicleModal(true); setVehGallery([]); }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vehicle to Showroom</span>
              </button>
            )}
          </div>

          {/* Parts Subtab CRUD Table */}
          {inventorySubTab === 'parts' && (
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-x-auto shadow-xl">
              <table className="w-full min-w-[950px] text-left text-xs text-zinc-300 whitespace-nowrap crud-table">
                <thead className="bg-zinc-950 text-zinc-400 uppercase font-mono text-[10px] border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3.5">Part Details</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">SKU / Number</th>
                    <th className="px-4 py-3.5">Price</th>
                    <th className="px-4 py-3.5">Stock Level</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-sans">
                  {parts.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-lg bg-zinc-950 border border-zinc-800"
                        />
                        <div>
                          <div className="font-bold text-white">{p.name}</div>
                          <span className="text-[11px] text-red-400 uppercase font-semibold">{p.brand}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 uppercase font-mono text-zinc-400">
                        {p.category}
                      </td>

                      <td className="px-4 py-3 font-mono text-zinc-300">
                        {p.partNumber}
                      </td>

                      <td className="px-4 py-3 font-mono font-bold text-white">
                        {formatPrice(p.price)}
                      </td>

                      <td className="px-4 py-3">
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          p.inStock < 10 
                            ? 'bg-red-950 text-red-400 border border-red-800' 
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}>
                          {p.inStock} units {p.inStock < 10 && '⚠️ Low'}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => { setEditingPart(p); setPartGallery(p.gallery ? p.gallery.slice() : []); }}
                            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {!isSalesView && (
                            <button
                              onClick={() => onDeletePart(p.id)}
                              className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-red-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Vehicles Subtab CRUD Table */}
          {inventorySubTab === 'vehicles' && (
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-x-auto shadow-xl">
              <table className="w-full min-w-[1100px] text-left text-xs text-zinc-300 whitespace-nowrap crud-table">
                <thead className="bg-zinc-950 text-zinc-400 uppercase font-mono text-[10px] border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3.5">Vehicle</th>
                    <th className="px-4 py-3.5">VIN</th>
                    <th className="px-4 py-3.5">Specs</th>
                    <th className="px-4 py-3.5">Mileage</th>
                    <th className="px-4 py-3.5">Price</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-sans">
                  {vehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <img
                          src={v.image}
                          alt={v.model}
                          className="w-12 h-9 object-cover rounded-lg bg-zinc-950 border border-zinc-800"
                        />
                        <div>
                          <div className="font-bold text-white">{v.year} {v.make} {v.model}</div>
                          <span className="text-[11px] text-zinc-400">{v.color} • {v.bodyType}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono text-zinc-400 text-[11px]">
                        {v.vin}
                      </td>

                      <td className="px-4 py-3 font-mono text-zinc-300">
                        {v.horsepower} HP • {v.zeroToSixty} • {v.transmission}
                      </td>

                      <td className="px-4 py-3 font-mono text-zinc-300">
                        {Math.round(v.mileage * 1.609)} km
                      </td>

                      <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                        {formatPrice(v.price)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => { setEditingVehicle(v); setVehGallery(v.gallery ? v.gallery.slice() : []); }}
                            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {!isSalesView && (
                          <button
                            onClick={() => onDeleteVehicle(v.id)}
                            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CUSTOMER RECORDS & DATA PRIVACY COMPLIANCE VAULT CRUD */}
      {/* ========================================================================= */}
      {!isTechnicianView && !isSalesView && activeTab === 'customers' && (
        <div className="space-y-6">
          
          {/* Privacy Security Notice */}
          <div className="bg-cyan-950/30 border border-cyan-500/40 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Encrypted Customer Vault (NDPR-Compliant)</span>
              </div>
              <p className="text-xs text-zinc-300 mt-1 max-w-2xl">
                All high-sensitivity customer identifiers (Driver License, Full VIN, Tax ID/SSN) are stored in client-side AES-GCM 256-bit encrypted payloads. Masked by default; authorized staff can unlock with administrative verification.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <input
                type="password"
                placeholder="Staff Vault Passphrase..."
                value={vaultPassphrase}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVaultPassphrase(e.target.value)}
                className="w-full sm:w-auto bg-zinc-950 border border-cyan-600/40 rounded-lg px-3 py-1.5 text-xs text-white"
              />
              <button
                onClick={() => setNewCustomerModal(true)}
                className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Customer</span>
              </button>
            </div>
          </div>

          {vaultError && (
            <div className="p-3 bg-red-950/40 border border-red-500 text-red-400 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{vaultError}</span>
            </div>
          )}

          {/* Customer Records Directory */}
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-x-auto shadow-xl">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 text-zinc-400 uppercase font-mono text-[10px] border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3.5">Customer Name &amp; Contact</th>
                  <th className="px-4 py-3.5">Vehicle Information</th>
                  <th className="px-4 py-3.5">Encrypted Sensitive Vault (AES-GCM)</th>
                  <th className="px-4 py-3.5">Loyalty Tier</th>
                  <th className="px-4 py-3.5">Total Spent</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {customers.map((cust) => {
                  const isDecrypted = Boolean(decryptedVaults[cust.id]);
                  const decryptedPayload = decryptedVaults[cust.id];
                  const custOrders = orders.filter(o => o.customerEmail?.toLowerCase() === cust.email.toLowerCase());
                  const custAppointments = appointments.filter(a => a.customerEmail?.toLowerCase() === cust.email.toLowerCase() || a.customerName?.toLowerCase() === cust.name.toLowerCase());

                  return (
                    <React.Fragment key={cust.id}>
                    <tr className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-red-600/15 text-red-400 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                            {cust.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white leading-tight">{cust.name}</div>
                            <div className="text-[11px] text-zinc-400 mt-1">{cust.email}</div>
                            <div className="text-[11px] text-zinc-500 font-mono mt-0.5">{cust.phone}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 min-w-52 align-top">
                        <div className="flex items-start gap-2">
                          <Car className="w-3.5 h-3.5 text-zinc-500 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <div className="font-semibold text-zinc-200">{cust.vehicleInfo}</div>
                            <div className="text-[11px] text-zinc-500 leading-relaxed mt-1">{cust.address}</div>
                          </div>
                        </div>
                      </td>

                      {/* Encrypted vs Decrypted Vault Column */}
                      <td className="px-4 py-3 align-top">
                        <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl font-mono text-[11px] space-y-1.5 min-w-52">
                          {isDecrypted && decryptedPayload ? (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1 text-[10px] text-cyan-400 font-bold tracking-wide">
                                  <Unlock className="w-3 h-3" /> UNLOCKED
                                </span>
                                <button
                                  onClick={() => handleLockCustomer(cust.id)}
                                  className="text-[10px] text-zinc-400 hover:text-white underline"
                                >
                                  Lock
                                </button>
                              </div>
                              <div><span className="text-zinc-600">VIN</span> <span className="text-white">{decryptedPayload.fullVin}</span></div>
                              <div><span className="text-zinc-600">LIC</span> <span className="text-white">{decryptedPayload.driverLicenseNumber}</span></div>
                              <div><span className="text-zinc-600">TAX</span> <span className="text-white">{decryptedPayload.taxIdOrSSN}</span></div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1 text-[10px] text-cyan-400 font-bold tracking-wide">
                                  <Lock className="w-3 h-3" /> ENCRYPTED AES-GCM
                                </span>
                                <button
                                  onClick={() => handleDecryptCustomer(cust)}
                                  className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold underline"
                                >
                                  Decrypt
                                </button>
                              </div>
                              <div><span className="text-zinc-600">VIN</span> <span className="text-zinc-400">{cust.encryptedVault.maskedPreview.vinLast4}</span></div>
                              <div><span className="text-zinc-600">LIC</span> <span className="text-zinc-400">{cust.encryptedVault.maskedPreview.licenseMasked}</span></div>
                              <div><span className="text-zinc-600">TAX</span> <span className="text-zinc-400">{cust.encryptedVault.maskedPreview.taxIdMasked}</span></div>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col items-start gap-1.5">
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded font-mono whitespace-nowrap">
                            {cust.tier}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">{cust.loyaltyPoints} pts</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <div className="font-mono font-bold text-white whitespace-nowrap">{formatPrice(cust.totalSpent)}</div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Total Spent</div>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setExpandedCustomers(prev => prev.includes(cust.id) ? prev.filter(id => id !== cust.id) : [...prev, cust.id]);
                            }}
                            className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                            title={expandedCustomers.includes(cust.id) ? 'Hide purchases & appointments' : 'View purchases & appointments'}
                          >
                            {expandedCustomers.includes(cust.id)
                              ? <ChevronUp className="w-3.5 h-3.5" />
                              : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => setEditingCustomer(cust)}
                            className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                            title="Edit customer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteCustomer(cust.id)}
                            className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-red-950 transition-colors"
                            title="Delete customer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedCustomers.includes(cust.id) && (
                      <tr className="bg-zinc-950/60">
                      <td colSpan={6} className="px-6 py-5 border-t border-zinc-800/60 align-top">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                            <Users className="w-4 h-4 text-red-400" />
                            <span>{cust.name}</span>
                            <span className="text-[10px] font-mono font-normal text-zinc-500 px-2 py-0.5 bg-zinc-950 border border-zinc-800 rounded">
                              #{cust.id.toUpperCase()}
                            </span>
                          </div>
                          <button
                            onClick={() => setExpandedCustomers(prev => prev.filter(id => id !== cust.id))}
                            className="text-[10px] text-zinc-500 hover:text-white font-semibold uppercase tracking-wide flex items-center gap-1"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                            Collapse
                          </button>
                        </div>
                        <div className="min-w-[680px]">
                          <div className="grid grid-cols-1 gap-6">
                            {/* Purchases (Orders) */}
                            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
                              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider mb-4 pb-3 border-b border-zinc-800/70">
                                <Receipt className="w-4 h-4 text-amber-400" />
                                Purchases ({orders.filter(o => o.customerEmail?.toLowerCase() === cust.email.toLowerCase()).length})
                              </div>
                              <div className="space-y-3">
                                {orders.filter(o => o.customerEmail?.toLowerCase() === cust.email.toLowerCase()).length === 0 && (
                                  <p className="text-[11px] text-zinc-500">No purchases yet.</p>
                                )}
                                {orders
                                  .filter(o => o.customerEmail?.toLowerCase() === cust.email.toLowerCase())
                                  .map(o => (
                                    <div key={o.id} className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-[11px] space-y-1.5">
                                      <div className="flex justify-between">
                                        <span className="font-mono font-bold text-white">#{o.id.toUpperCase()}</span>
                                        <span className="font-bold text-emerald-400">{formatPrice(o.total)}</span>
                                      </div>
                                      <div className="text-zinc-400">
                                        {o.items.map((it: any) => {
                                          const n = it && typeof it === 'object' && 'name' in (it as any) ? (it as any).name : (it as any).partName;
                                          const q = it && typeof it === 'object' && 'quantity' in (it as any) ? (it as any).quantity : 1;
                                          return `${n || 'Item'} ×${q}`;
                                        }).join(', ')}
                                      </div>
                                      <div className="flex justify-between text-[10px] text-zinc-500">
                                        <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                                        <span className="uppercase text-cyan-400">{o.paymentStatus} • {o.fulfillmentStatus}</span>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>

                            {/* Appointments */}
                            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
                              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider mb-4 pb-3 border-b border-zinc-800/70">
                                <Calendar className="w-4 h-4 text-blue-400" />
                                Appointments ({appointments.filter(a => a.customerEmail?.toLowerCase() === cust.email.toLowerCase() || a.customerName?.toLowerCase() === cust.name.toLowerCase()).length})
                              </div>
                              <div className="space-y-3">
                                {appointments.filter(a => a.customerEmail?.toLowerCase() === cust.email.toLowerCase() || a.customerName?.toLowerCase() === cust.name.toLowerCase()).length === 0 && (
                                  <p className="text-[11px] text-zinc-500">No appointments yet.</p>
                                )}
                                {appointments
                                  .filter(a => a.customerEmail?.toLowerCase() === cust.email.toLowerCase() || a.customerName?.toLowerCase() === cust.name.toLowerCase())
                                  .map(a => (
                                    <div key={a.id} className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-[11px] space-y-1.5">
                                      <div className="flex justify-between">
                                        <span className="font-mono font-bold text-white">#{a.id.toUpperCase()}</span>
                                        <span className="font-bold text-zinc-300">{formatPrice(a.totalCost)}</span>
                                      </div>
                                      <div className="text-zinc-400">{a.serviceName} — {a.vehicleYear} {a.vehicleMake} {a.vehicleModel}</div>
                                      <div className="flex justify-between text-[10px] text-zinc-500">
                                        <span>{a.scheduledDate} at {a.scheduledTime}</span>
                                        <span className={`uppercase font-bold ${
                                          a.status === 'completed' ? 'text-emerald-400' :
                                          a.status === 'cancelled' ? 'text-zinc-600' :
                                          'text-blue-400'
                                        }`}>{a.status.replace('_', ' ')}</span>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      </tr>
                    )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. LIVE BAYS & DELIVERY TRACKING */}
      {/* ========================================================================= */}
      {!isTechnicianView && activeTab === 'tracking' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white font-mono">
                REAL-TIME VEHICLE SERVICE WORKFLOW
              </h3>
              <p className="text-xs text-zinc-400">
                Advances work orders through workshop lifecycle and triggers automated push alerts to clients.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Step 1: Confirmed / Scheduled */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between">
              <div className="border-b border-zinc-800 pb-3 mb-3 flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-zinc-300 uppercase">1. Scheduled</span>
                <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded font-mono text-zinc-400">
                  {appointments.filter(a => a.status === 'confirmed').length}
                </span>
              </div>
              <div className="space-y-3 flex-1">
                {appointments.filter(a => a.status === 'confirmed').map(apt => (
                  <div key={apt.id} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                    <div className="text-xs font-bold text-white">{apt.vehicleYear} {apt.vehicleMake} {apt.vehicleModel}</div>
                    <div className="text-[11px] text-zinc-400">{apt.customerName} • {apt.serviceName}</div>
                    <button
                      onClick={() => handleAdvanceAppointmentStatus(apt, 'in_inspection')}
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Move to Inspection Lift</span>
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: In Inspection */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between">
              <div className="border-b border-zinc-800 pb-3 mb-3 flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-blue-400 uppercase">2. On Lift / Inspecting</span>
                <span className="text-xs bg-blue-950 border border-blue-800 text-blue-400 px-2 py-0.5 rounded font-mono">
                  {appointments.filter(a => a.status === 'in_inspection').length}
                </span>
              </div>
              <div className="space-y-3 flex-1">
                {appointments.filter(a => a.status === 'in_inspection').map(apt => (
                  <div key={apt.id} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                    <div className="text-xs font-bold text-white">{apt.vehicleYear} {apt.vehicleMake} {apt.vehicleModel}</div>
                    <div className="text-[11px] text-zinc-400">Tech: {apt.assignedTechnician}</div>
                    <button
                      onClick={() => handleAdvanceAppointmentStatus(apt, 'in_repair')}
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Begin Repair Work</span>
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: In Repair / Testing */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between">
              <div className="border-b border-zinc-800 pb-3 mb-3 flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-amber-400 uppercase">3. In Repair / Dyno</span>
                <span className="text-xs bg-amber-950 border border-amber-800 text-amber-400 px-2 py-0.5 rounded font-mono">
                  {appointments.filter(a => a.status === 'in_repair' || a.status === 'quality_check').length}
                </span>
              </div>
              <div className="space-y-3 flex-1">
                {appointments.filter(a => a.status === 'in_repair' || a.status === 'quality_check').map(apt => (
                  <div key={apt.id} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                    <div className="text-xs font-bold text-white">{apt.vehicleYear} {apt.vehicleMake} {apt.vehicleModel}</div>
                    <div className="text-[11px] text-zinc-400">{apt.technicianNotes || 'Parts installed and torqued.'}</div>
                    <button
                      onClick={() => handleAdvanceAppointmentStatus(apt, 'ready_for_pickup')}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Ready for Pickup &amp; Push</span>
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 4: Ready For Pickup */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between">
              <div className="border-b border-zinc-800 pb-3 mb-3 flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-emerald-400 uppercase">4. Ready For Pickup</span>
                <span className="text-xs bg-emerald-950 border border-emerald-800 text-emerald-400 px-2 py-0.5 rounded font-mono">
                  {appointments.filter(a => a.status === 'ready_for_pickup').length}
                </span>
              </div>
              <div className="space-y-3 flex-1">
                {appointments.filter(a => a.status === 'ready_for_pickup').map(apt => (
                  <div key={apt.id} className="p-3 bg-zinc-950 border border-emerald-500/40 rounded-xl space-y-2">
                    <div className="text-xs font-bold text-white">{apt.vehicleYear} {apt.vehicleMake} {apt.vehicleModel}</div>
                    <div className="text-[11px] text-emerald-400 font-semibold">Ready in Apex Bay #1</div>
                    <button
                      onClick={() => handleAdvanceAppointmentStatus(apt, 'completed')}
                      className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-[11px] rounded-lg transition-colors"
                    >
                      Hand Keys &amp; Close Order
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT / CREATE APPOINTMENT MODAL */}
      {/* ========================================================================= */}
      {(editingAppointment || newAppointmentModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-4 sm:p-6 text-zinc-100 my-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-white font-mono mb-4">
              {editingAppointment ? `Edit Work Order ${editingAppointment.id}` : 'Create New Work Order'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Customer Name</label>
                <input
                  type="text"
                  defaultValue={editingAppointment?.customerName || ''}
                  id="modal-cust-name"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">Vehicle Make/Model</label>
                  <input
                    type="text"
                    defaultValue={editingAppointment ? `${editingAppointment.vehicleMake} ${editingAppointment.vehicleModel}` : 'BMW M4'}
                    id="modal-vehicle"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Assigned Tech</label>
                  <select
                    defaultValue={editingAppointment?.assignedTechnician || 'Femi Adeyemi'}
                    id="modal-tech"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                  >
                    {technicians.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">Status</label>
                  <select
                    defaultValue={editingAppointment?.status || 'confirmed'}
                    id="modal-status"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_inspection">In Inspection</option>
                    <option value="in_repair">In Repair</option>
                    <option value="quality_check">Quality Check</option>
                    <option value="ready_for_pickup">Ready for Pickup</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Total Cost (₦)</label>
                  <input
                    type="number"
                    defaultValue={Math.round((editingAppointment?.totalCost || 150) * exchangeRate)}
                    id="modal-cost"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Technician Inspection &amp; Bay Notes</label>
                <textarea
                  rows={2}
                  defaultValue={editingAppointment?.technicianNotes || ''}
                  id="modal-notes"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-zinc-800">
              <button
                onClick={() => {
                  setEditingAppointment(null);
                  setNewAppointmentModal(false);
                }}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const name = (document.getElementById('modal-cust-name') as HTMLInputElement).value;
                  const vehicleStr = (document.getElementById('modal-vehicle') as HTMLInputElement).value;
                  const tech = (document.getElementById('modal-tech') as HTMLSelectElement).value;
                  const status = (document.getElementById('modal-status') as HTMLSelectElement).value as AppointmentStatus;
                  const costNaira = parseFloat((document.getElementById('modal-cost') as HTMLInputElement).value) || 0;
                  const cost = costNaira > 0 ? costNaira / exchangeRate : 150;
                  const notes = (document.getElementById('modal-notes') as HTMLTextAreaElement).value;

                  if (editingAppointment) {
                    onUpdateAppointment({
                      ...editingAppointment,
                      customerName: name,
                      assignedTechnician: tech,
                      status,
                      totalCost: cost,
                      technicianNotes: notes,
                      updatedAt: new Date().toISOString()
                    });
                  } else {
                    const newApt: Appointment = {
                      id: `apt-${Date.now().toString().slice(-4)}`,
                      customerId: 'cust-new',
                      customerName: name || 'Walk-in Client',
                      customerPhone: '+1 (555) 000-0000',
                      customerEmail: 'client@apex.com',
                      vehicleYear: 2023,
                      vehicleMake: vehicleStr.split(' ')[0] || 'Vehicle',
                      vehicleModel: vehicleStr.split(' ').slice(1).join(' ') || 'Standard',
                      vehiclePlate: 'APX-NEW',
                      vin: 'WBS33AY08PFP00000',
                      serviceId: 'srv-oil-change',
                      serviceName: 'Workshop Service Order',
                      additionalServices: [],
                      assignedTechnician: tech,
                      scheduledDate: new Date().toISOString().split('T')[0],
                      scheduledTime: '11:00 AM',
                      status,
                      technicianNotes: notes,
                      totalCost: cost,
                      depositAmount: 50,
                      paymentStatus: 'paid',
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    };
                    onCreateAppointment(newApt);
                  }
                  setEditingAppointment(null);
                  setNewAppointmentModal(false);
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl"
              >
                Save Work Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT / CREATE AUTO PART MODAL */}
      {/* ========================================================================= */}
      {(editingPart || newPartModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-4 sm:p-6 text-zinc-100 my-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-white font-mono mb-4">
              {editingPart ? 'Edit Auto Part' : 'Add New Inventory Part'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Part Name</label>
                <input
                  type="text"
                  defaultValue={editingPart?.name || ''}
                  id="part-modal-name"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">Brand</label>
                  <input
                    type="text"
                    defaultValue={editingPart?.brand || 'Brembo'}
                    id="part-modal-brand"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">SKU / Number</label>
                  <input
                    type="text"
                    defaultValue={editingPart?.partNumber || 'APX-PART-01'}
                    id="part-modal-sku"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">Price (₦)</label>
                  <input
                    type="number"
                    step="0.01"
                    defaultValue={Math.round((editingPart?.price || 99.99) * exchangeRate)}
                    id="part-modal-price"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">In Stock Quantity</label>
                  <input
                    type="number"
                    defaultValue={editingPart?.inStock || 25}
                    id="part-modal-stock"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Part Pictures (up to 15)</label>
                <ImageGalleryEditor
                  images={partGallery}
                  aspect={4 / 3}
                  targetWidth={640}
                  onChange={setPartGallery}
                  hint="Front, side, rear, interior, engine bay, packaging…"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-zinc-800">
              <button
                onClick={() => {
                  setEditingPart(null);
                  setNewPartModal(false);
                  setPartGallery([]);
                }}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const name = (document.getElementById('part-modal-name') as HTMLInputElement).value;
                  const brand = (document.getElementById('part-modal-brand') as HTMLInputElement).value;
                  const sku = (document.getElementById('part-modal-sku') as HTMLInputElement).value;
                  const priceNaira = parseFloat((document.getElementById('part-modal-price') as HTMLInputElement).value) || 0;
                  const price = priceNaira > 0 ? priceNaira / exchangeRate : 99.99;
                  const stock = parseInt((document.getElementById('part-modal-stock') as HTMLInputElement).value) || 20;
                  const galleryPart = partGallery.length > 0 ? partGallery : (editingPart && editingPart.gallery ? editingPart.gallery.slice() : []);
                  const img = galleryPart[0] || (editingPart ? editingPart.image : '/images/2024 Honda Civic Type R FL5.jpg');

                  if (editingPart) {
                    onUpdatePart({
                      ...editingPart,
                      name,
                      brand,
                      partNumber: sku,
                      price,
                      inStock: stock,
                      image: img,
                      gallery: galleryPart.length ? galleryPart : undefined
                    });
                  } else {
                    const newP: PartItem = {
                      id: `part-${Date.now().toString().slice(-4)}`,
                      name: name || 'High Performance Auto Part',
                      brand: brand || 'Apex Racing',
                      partNumber: sku || 'APX-SKU',
                      category: 'brakes',
                      price,
                      originalPrice: price * 1.2,
                      rating: 4.9,
                      reviewsCount: 14,
                      inStock: stock,
                      fitmentMakes: ['All Makes'],
                      fitmentYears: '2018-2025',
                      image: img,
                      gallery: galleryPart.length ? galleryPart : undefined,
                      description: 'Precision engineered aftermarket component with lifetime warranty.'
                    };
                    onCreatePart(newP);
                  }
                  setEditingPart(null);
                  setNewPartModal(false);
                  setPartGallery([]);
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl"
              >
                Save Part
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT / CREATE VEHICLE MODAL */}
      {/* ========================================================================= */}
      {(editingVehicle || newVehicleModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-4 sm:p-6 text-zinc-100 my-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-white font-mono mb-4">
              {editingVehicle ? 'Edit Showroom Vehicle' : 'Add Vehicle to Showroom'}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">Year</label>
                  <input
                    type="number"
                    defaultValue={editingVehicle?.year || 2024}
                    id="veh-modal-year"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Make</label>
                  <input
                    type="text"
                    defaultValue={editingVehicle?.make || 'BMW'}
                    id="veh-modal-make"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Model</label>
                  <input
                    type="text"
                    defaultValue={editingVehicle?.model || 'M4 Competition'}
                    id="veh-modal-model"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">Price (₦)</label>
                  <input
                    type="number"
                    defaultValue={Math.round((editingVehicle?.price || 85000) * exchangeRate)}
                    id="veh-modal-price"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Mileage</label>
                  <input
                    type="number"
                    defaultValue={editingVehicle?.mileage || 5000}
                    id="veh-modal-mileage"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">VIN Number</label>
                <input
                  type="text"
                  defaultValue={editingVehicle?.vin || 'WBS33AY08PFP48291'}
                  id="veh-modal-vin"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Vehicle Pictures (up to 15)</label>
                <ImageGalleryEditor
                  images={vehGallery}
                  aspect={16 / 10}
                  targetWidth={1200}
                  onChange={setVehGallery}
                  hint="Front view, side views, rear, interior, boot…"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-zinc-800">
              <button
                onClick={() => {
                  setEditingVehicle(null);
                  setNewVehicleModal(false);
                  setVehGallery([]);
                }}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const yr = parseInt((document.getElementById('veh-modal-year') as HTMLInputElement).value) || 2024;
                  const make = (document.getElementById('veh-modal-make') as HTMLInputElement).value;
                  const model = (document.getElementById('veh-modal-model') as HTMLInputElement).value;
                  const vehPriceNaira = parseFloat((document.getElementById('veh-modal-price') as HTMLInputElement).value) || 0;
                  const price = vehPriceNaira > 0 ? vehPriceNaira / exchangeRate : 75000;
                  const mileage = parseInt((document.getElementById('veh-modal-mileage') as HTMLInputElement).value) || 8000;
                  const vin = (document.getElementById('veh-modal-vin') as HTMLInputElement).value;
                  const galleryVeh = vehGallery.length > 0 ? vehGallery : (editingVehicle && editingVehicle.gallery ? editingVehicle.gallery.slice() : []);
                  const img = galleryVeh[0] || (editingVehicle ? editingVehicle.image : '/images/BMW m4 competition.jpg');

                  if (editingVehicle) {
                    onUpdateVehicle({
                      ...editingVehicle,
                      year: yr,
                      make,
                      model,
                      price,
                      mileage,
                      vin,
                      image: img,
                      gallery: galleryVeh.length ? galleryVeh : undefined
                    });
                  } else {
                    const newV: VehicleItem = {
                      id: `veh-${Date.now().toString().slice(-4)}`,
                      make,
                      model,
                      year: yr,
                      price,
                      mileage,
                      transmission: 'Automatic',
                      fuel: 'Petrol',
                      bodyType: 'sports',
                      horsepower: 450,
                      zeroToSixty: '3.6s',
                      engine: 'Twin-Turbocharged Performance V6/I6',
                      vin,
                      color: 'Gloss Black',
                      inStock: true,
                      image: img,
                      gallery: galleryVeh.length ? galleryVeh : undefined,
                      badges: ['Apex Inspected', 'Clean Title'],
                      features: ['Navigation', 'Sport Exhaust', 'Surround Sound']
                    };
                    onCreateVehicle(newV);
                  }
                  setEditingVehicle(null);
                  setNewVehicleModal(false);
                  setVehGallery([]);
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl"
              >
                Save Vehicle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* NEW CUSTOMER MODAL WITH AUTO-ENCRYPTION */}
      {/* ========================================================================= */}
      {newCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-4 sm:p-6 text-zinc-100 my-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-white font-mono mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>Register Customer &amp; Initialize Encrypted Vault</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  id="new-cust-name"
                  placeholder="e.g. Christian Horner"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">Email</label>
                  <input
                    type="email"
                    id="new-cust-email"
                    placeholder="client@domain.com"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Phone (SMS Alert)</label>
                  <input
                    type="text"
                    id="new-cust-phone"
                    placeholder="+1 (555) 999-8888"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Vehicle Description</label>
                <input
                  type="text"
                  id="new-cust-veh"
                  placeholder="2024 Porsche 911 GT3 RS"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              {/* Sensitive Encrypted Fields */}
              <div className="p-3 bg-cyan-950/20 border border-cyan-500/30 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-cyan-400 block">
                  Encrypted Sensitive Vault Fields (AES-GCM-256)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-zinc-400">Driver License #</label>
                    <input
                      type="text"
                      id="new-cust-dl"
                      placeholder="DL-84920194"
                      className="w-full bg-zinc-950 border border-cyan-500/40 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400">Tax ID / SSN</label>
                    <input
                      type="text"
                      id="new-cust-ssn"
                      placeholder="999-00-1234"
                      className="w-full bg-zinc-950 border border-cyan-500/40 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400">Vehicle Full VIN (17 chars)</label>
                  <input
                    type="text"
                    id="new-cust-vin"
                    placeholder="WP0AB2A98NS240918"
                    className="w-full bg-zinc-950 border border-cyan-500/40 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-zinc-800">
              <button
                onClick={() => setNewCustomerModal(false)}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const name = (document.getElementById('new-cust-name') as HTMLInputElement).value;
                  const email = (document.getElementById('new-cust-email') as HTMLInputElement).value;
                  const phone = (document.getElementById('new-cust-phone') as HTMLInputElement).value;
                  const veh = (document.getElementById('new-cust-veh') as HTMLInputElement).value;
                  const dl = (document.getElementById('new-cust-dl') as HTMLInputElement).value || 'DL-99482910';
                  const ssn = (document.getElementById('new-cust-ssn') as HTMLInputElement).value || '123-45-6789';
                  const vin = (document.getElementById('new-cust-vin') as HTMLInputElement).value || 'WBS33AY08PFP00000';

                  const vault = await encryptSensitiveData({
                    fullVin: vin,
                    driverLicenseNumber: dl,
                    taxIdOrSSN: ssn,
                    emergencyContact: phone
                  });

                  const newCust: CustomerRecord = {
                    id: `cust-${Date.now().toString().slice(-4)}`,
                    name: name || 'New Client',
                    email: email || 'client@domain.com',
                    phone: phone || '+1 (555) 000-0000',
                    address: 'Seattle, WA',
                    vehicleInfo: veh || '2024 Vehicle',
                    totalSpent: 0,
                    loyaltyPoints: 0,
                    tier: 'Silver',
                    createdAt: new Date().toISOString().split('T')[0],
                    encryptedVault: vault
                  };

                  onCreateCustomer(newCust);
                  setNewCustomerModal(false);
                }}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl"
              >
                Encrypt &amp; Save Customer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
