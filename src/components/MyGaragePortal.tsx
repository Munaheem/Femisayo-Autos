import React, { useState } from 'react';
import { 
  Car, 
  Wrench, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Bell, 
  BellRing, 
  ShoppingBag, 
  FileText, 
  ShieldCheck, 
  ChevronRight, 
  Send, 
  Sparkles, 
  Award, 
  Lock, 
  Truck
} from 'lucide-react';
import { Appointment, CustomerRecord, Order, PushNotificationItem, VehicleItem, pushTargetLabel } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface MyGaragePortalProps {
  customer: CustomerRecord;
  appointments: Appointment[];
  orders: Order[];
  notifications: PushNotificationItem[];
  onBookServiceClick: () => void;
  onRequestPushPermission: () => void;
  hasPushPermission: boolean;
  onPayAppointmentBalance: (apt: Appointment) => void;
}

export const MyGaragePortal: React.FC<MyGaragePortalProps> = ({
  customer,
  appointments,
  orders,
  notifications,
  onBookServiceClick,
  onRequestPushPermission,
  hasPushPermission,
  onPayAppointmentBalance
}) => {
  const { formatPrice } = useCurrency();
  const [activeSubTab, setActiveSubTab] = useState<'vehicles' | 'appointments' | 'orders' | 'alerts'>('appointments');

  const customerAppointments = appointments.filter(a => 
    a.customerName.toLowerCase().includes(customer.name.toLowerCase()) || a.customerId === customer.id
  );

  const customerOrders = orders.filter(o => 
    o.customerEmail.toLowerCase() === customer.email.toLowerCase() || o.id.includes('ord')
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready_for_pickup':
        return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
      case 'in_repair':
      case 'in_inspection':
      case 'quality_check':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'completed':
        return 'text-zinc-400 bg-zinc-800 border-zinc-700';
      default:
        return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
    }
  };

  const getStepProgress = (status: string) => {
    switch (status) {
      case 'confirmed': return 25;
      case 'in_inspection': return 50;
      case 'in_repair': return 75;
      case 'quality_check': return 88;
      case 'ready_for_pickup': return 100;
      case 'completed': return 100;
      default: return 10;
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-zinc-100">
      
      {/* Customer Header & Loyalty Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-zinc-900 via-red-950/40 to-zinc-900 border border-zinc-800 p-5 sm:p-6 md:p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-500 flex items-center justify-center font-black text-xl sm:text-2xl font-mono shrink-0">
            {customer.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] sm:text-xs text-zinc-400 font-mono">CLIENT DASHBOARD</span>
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono">
                {customer.tier} Member
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white font-mono mt-0.5 truncate">
              Welcome back, {customer.name}
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 truncate">
              Registered vehicle: <strong className="text-zinc-200">{customer.vehicleInfo}</strong>
            </p>
          </div>
        </div>

        {/* Loyalty & Push Notification Action */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
          <div className="bg-zinc-950/80 border border-zinc-800 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-left">
            <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase font-mono block">Loyalty Balance</span>
            <span className="text-sm sm:text-base font-black text-amber-400 font-mono flex items-center gap-1">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> {customer.loyaltyPoints} Points
            </span>
          </div>

          <button
            onClick={onRequestPushPermission}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 ${
              hasPushPermission
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-700/30'
            }`}
          >
            {hasPushPermission ? (
              <>
                <BellRing className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                <span className="hidden sm:inline">Live Push Enabled</span>
                <span className="sm:hidden">Push On</span>
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="hidden sm:inline">Enable Real-Time Push</span>
                <span className="sm:hidden">Enable Push</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 mb-8 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('appointments')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'appointments'
              ? 'bg-red-600 text-white shadow-md shadow-red-700/30'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Active Service Orders ({customerAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('orders')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'orders'
              ? 'bg-red-600 text-white shadow-md shadow-red-700/30'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Parts Orders &amp; Tracking ({customerOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('alerts')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'alerts'
              ? 'bg-red-600 text-white shadow-md shadow-red-700/30'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Push Notification Log ({notifications.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. SERVICE APPOINTMENTS WITH LIVE BAY TELEMATICS */}
      {/* ========================================================================= */}
      {activeSubTab === 'appointments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-mono text-white uppercase tracking-wider">
              Real-Time Workshop Progress
            </h3>
            <button
              onClick={onBookServiceClick}
              className="text-xs text-red-400 hover:text-red-300 font-bold underline flex items-center gap-1"
            >
              + Schedule Another Service
            </button>
          </div>

          {customerAppointments.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/60 rounded-3xl border border-zinc-800 space-y-3">
              <Wrench className="w-10 h-10 text-zinc-600 mx-auto" />
              <p className="text-sm text-zinc-400">No appointments found for your vehicle.</p>
              <button
                onClick={onBookServiceClick}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                Schedule First Appointment
              </button>
            </div>
          ) : (
            customerAppointments.map((apt) => {
              const progress = getStepProgress(apt.status);

              return (
                <div
                  key={apt.id}
                  className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 space-y-6 shadow-xl relative overflow-hidden"
                >
                  {/* Top bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-red-400 uppercase">
                          Order #{apt.id.toUpperCase()}
                        </span>
                        <span className="text-xs text-zinc-500 font-mono">
                          • Booked on {apt.scheduledDate} at {apt.scheduledTime}
                        </span>
                      </div>
                      <h4 className="text-xl font-black text-white font-mono mt-0.5">
                        {apt.vehicleYear} {apt.vehicleMake} {apt.vehicleModel}
                      </h4>
                      <p className="text-xs text-zinc-400">
                        Assigned Master Mechanic: <strong className="text-white">{apt.assignedTechnician}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full uppercase border ${getStatusColor(apt.status)}`}>
                        {apt.status.replace('_', ' ')}
                      </span>

                      {apt.paymentStatus === 'deposit_paid' && (
                        <button
                          onClick={() => onPayAppointmentBalance(apt)}
                          className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                        >
                          Pay Remaining Balance ({formatPrice(apt.totalCost - apt.depositAmount)})
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar Workflow */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-zinc-400 font-mono">
                      <span>Service Bay Progress</span>
                      <span className="text-red-400 font-bold">{progress}% Completed</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                      <div
                        className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* Step milestones */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-center text-[10px] sm:text-[11px] font-mono pt-2 text-zinc-400">
                      <div className={progress >= 25 ? 'text-white font-bold' : ''}>1. Reserved</div>
                      <div className={progress >= 50 ? 'text-blue-400 font-bold' : ''}>2. Lift Inspection</div>
                      <div className={progress >= 75 ? 'text-amber-400 font-bold' : ''}>3. Active Repair</div>
                      <div className={progress >= 100 ? 'text-emerald-400 font-bold' : ''}>4. Ready for Pickup</div>
                    </div>
                  </div>

                  {/* Tech Notes from Lift */}
                  {apt.technicianNotes && (
                    <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs space-y-1">
                      <div className="flex items-center gap-2 text-amber-400 font-bold">
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Mechanic Bay Inspection Report</span>
                      </div>
                      <p className="text-zinc-300">{apt.technicianNotes}</p>
                    </div>
                  )}

                  {/* Service Cost Breakdown */}
                  <div className="flex items-center justify-between text-xs bg-zinc-950/60 p-3.5 rounded-xl font-mono text-zinc-400">
                    <div>
                      <span>Service: <strong className="text-zinc-200">{apt.serviceName}</strong></span>
                      {apt.additionalServices.length > 0 && (
                        <span className="block text-[11px] text-zinc-500">
                          Add-ons: {apt.additionalServices.join(', ')}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-zinc-400 block">Total Invoiced:</span>
                      <span className="text-base font-black text-white font-mono">{formatPrice(apt.totalCost)}</span>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ORDERS & DELIVERY TRACKING */}
      {/* ========================================================================= */}
      {activeSubTab === 'orders' && (
        <div className="space-y-6">
          <h3 className="text-base font-bold font-mono text-white uppercase tracking-wider">
            Parts Delivery &amp; Shipping Status
          </h3>

          {customerOrders.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/60 rounded-3xl border border-zinc-800 space-y-3">
              <ShoppingBag className="w-10 h-10 text-zinc-600 mx-auto" />
              <p className="text-sm text-zinc-400">No parts orders placed yet.</p>
            </div>
          ) : (
            customerOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-red-400 uppercase">
                      Order #{ord.id.toUpperCase()}
                    </span>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      Carrier: <strong className="text-white font-mono">{ord.carrier}</strong> • Tracking #{' '}
                      <span className="text-red-400 font-mono">{ord.trackingNumber}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full uppercase">
                      {ord.status}
                    </span>
                    <span className="text-sm font-black font-mono text-white">
                      {formatPrice(ord.total)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {ord.items.map((item) => {
                    const partId = 'part' in item ? item.part.id : item.partId;
                    const partName = 'part' in item ? item.part.name : item.partName;
                    const price = 'part' in item ? item.part.price : item.price;
                    return (
                      <div key={partId} className="flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-300">
                          {item.quantity}x {partName}
                        </span>
                        <span className="text-zinc-400">
                          {formatPrice(price * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-400 pt-2 border-t border-zinc-800">
                  <Truck className="w-4 h-4" />
                  <span>Estimated Delivery: {ord.estimatedDelivery}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PUSH NOTIFICATION AUDIT LOG */}
      {/* ========================================================================= */}
      {activeSubTab === 'alerts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-mono text-white uppercase tracking-wider">
              Real-Time Push Notification History
            </h3>
            <span className="text-xs text-zinc-500">
              Web Push API &amp; In-App Telematics Log
            </span>
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/60 rounded-3xl border border-zinc-800">
              <Bell className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
              <p className="text-xs text-zinc-400">No alerts logged in this session.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">{n.title}</h4>
                    <span className="text-[10px] text-zinc-500 font-mono">{n.timestamp}</span>
                  </div>
                  <p className="text-xs text-zinc-300 mt-1">{n.message}</p>
                  <span className="inline-block text-[9px] text-amber-400/70 border border-amber-500/20 bg-amber-500/5 px-1.5 py-0.5 rounded font-mono uppercase tracking-wide mt-1.5">
                    To: {pushTargetLabel(n.to)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};
