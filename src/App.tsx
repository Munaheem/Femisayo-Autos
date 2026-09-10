import React, { useState, useEffect, useRef } from 'react';
import { 
  Appointment, 
  CartItem, 
  CustomerRecord, 
  Order, 
  PartItem, 
  PushNotificationItem, 
  PushTarget,
  ReceiptLineItem,
  Technician, 
  UserRole, 
  VehicleItem 
} from './types';
import { 
  INITIAL_SERVICES, 
  INITIAL_TECHNICIANS, 
  loadAppointments, 
  loadCustomers, 
  loadOrders, 
  loadParts, 
  loadVehicles, 
  saveAppointments, 
  saveCustomers, 
  saveOrders, 
  saveParts, 
  saveVehicles, 
  sendBrowserPushNotification,
  loadAuthUsers,
  saveAuthUsers,
  loadWishlist,
  saveWishlist,
  AuthUser 
} from './utils/storage';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { ServicePricingAndBooking } from './components/ServicePricingAndBooking';
import { CarShowroom } from './components/CarShowroom';
import { PartsStore } from './components/PartsStore';
import { CartDrawer } from './components/CartDrawer';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { PaymentGatewayModal } from './components/PaymentGatewayModal';
import { AdminPortal } from './components/AdminPortal';
import { MyGaragePortal } from './components/MyGaragePortal';
import { LoginPage } from './components/LoginPage';
import { api } from './services/api';
import { useCurrency } from './context/CurrencyContext';
import { 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Wrench, 
  Car, 
  ShoppingBag, 
  Award, 
  ArrowRight,
  Building2,
  FileText,
  Star,
  Gauge,
  Disc,
  Droplets,
  Snowflake,
  Cog,
  Zap,
  Activity,
  Target,
  Calendar
} from 'lucide-react';

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'srv-engine-diagnostics': Gauge,
  'srv-brakes': Disc,
  'srv-oil-change': Droplets,
  'srv-ac-service': Snowflake,
  'srv-transmission': Cog,
  'srv-battery-electrical': Zap,
  'srv-suspension-steering': Activity,
  'srv-tires': Target
};

// External links — official Femisayo Autos profiles.
const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/femisayo_autos/',
  facebook: 'https://www.facebook.com/AutomechanicandcardealerinLekki.Lagosisland/',
  whatsapp: 'https://wa.me/2348023179860',
  maps: 'https://www.google.com/maps/search/?api=1&query=CFMP%2B4C%20Lekki',
};

// Homepage featured order (6-8 main services customers bring vehicles in for)
const FEATURED_SERVICE_ORDER = [
  'srv-engine-diagnostics',
  'srv-brakes',
  'srv-oil-change',
  'srv-ac-service',
  'srv-transmission',
  'srv-battery-electrical',
  'srv-suspension-steering',
  'srv-tires'
];

// --- Hash-based routing (no external router needed) ---
// Each tab maps to a URL hash so the browser back/forward buttons and deep
// links work. The backend engineer can later swap this for real routes.
type AppTab = 'home' | 'services' | 'cars' | 'parts' | 'garage' | 'admin';

const TAB_TO_HASH: Record<AppTab, string> = {
  home: '#/',
  services: '#/services',
  cars: '#/cars',
  parts: '#/parts',
  garage: '#/garage',
  admin: '#/admin'
};

const parseHash = (): AppTab => {
  const raw = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  if (raw === 'services' || raw === 'cars' || raw === 'parts' || raw === 'garage' || raw === 'admin') {
    return raw;
  }
  return 'home';
};

export default function App() {
  const { formatPrice } = useCurrency();
  // Navigation & Role State
  const [activeTab, setActiveTab] = useState<AppTab>(() => parseHash());
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');
  const [authRole, setAuthRole] = useState<UserRole>('customer');
  const [staffEmail, setStaffEmail] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Optional login overlay — site content is always public; login is only needed
  // for My Garage (customer) and the Admin portal (staff).
  const [loginPortal, setLoginPortal] = useState<'customer' | 'staff' | null>(null);

  // Latest auth state for the auth guard in the hash-change listener.
  const isStaffRole = currentRole === 'admin' || currentRole === 'technician' || currentRole === 'sales';
  const authGuardRef = useRef({ isAuthenticated, isStaff: isStaffRole });
  authGuardRef.current = { isAuthenticated, isStaff: isStaffRole };

  // Single navigation entry point: updates BOTH the tab state and the URL hash,
  // so in-app navigation is always reflected in (and respond to) the URL.
  const navigateTo = (tab: AppTab) => {
    if (tab === activeTab) return;
    if (window.location.hash !== TAB_TO_HASH[tab]) {
      window.location.hash = TAB_TO_HASH[tab];
    }
    setActiveTab(tab);
  };

  // Keep the tab in sync when the hash changes (back/forward buttons + deep links).
  // Auth-sensitive tabs (garage, admin) fall back to home for guests.
  useEffect(() => {
    const applyGuard = () => {
      const target = parseHash();
      const { isAuthenticated, isStaff } = authGuardRef.current;
      if ((target === 'admin' && !isStaff) || (target === 'garage' && !isAuthenticated)) {
        if (window.location.hash !== TAB_TO_HASH.home) {
          history.replaceState(null, '', TAB_TO_HASH.home);
        }
        setActiveTab('home');
        return;
      }
      setActiveTab(target);
    };

    applyGuard();
    window.addEventListener('hashchange', applyGuard);
    return () => window.removeEventListener('hashchange', applyGuard);
  }, []);

  // Persistence Domain States
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [parts, setParts] = useState<PartItem[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const technicians: Technician[] = INITIAL_TECHNICIANS;

  // Selected vehicle fitment (Year, Make, Model)
  const [selectedVehicleFitment, setSelectedVehicleFitment] = useState<{
    year: string;
    make: string;
    model: string;
  } | null>(null);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Wishlist (parts saved per customer account, persisted to localStorage)
  const [wishlist, setWishlist] = useState<PartItem[]>([]);

  // Customer auth accounts (login + registration)
  const [authUsers, setAuthUsers] = useState<AuthUser[]>(() => {
    const existing = loadAuthUsers();
    if (existing.length > 0) return existing;
    const seed: AuthUser = {
      id: 'cust-101',
      name: 'Babajide Adeleke',
      email: 'b.adeleke@gmail.com',
      phone: '+234 802 317 9860',
      address: 'Ilasan New Road, behind Emardeb Filling Station, Eti-Osa, Lekki, Lagos',
      vehicleInfo: '2023 Toyota Camry',
      password: 'customer123',
      createdAt: '2025-01-15'
    };
    saveAuthUsers([seed]);
    return [seed];
  });

  // Payment Modal State
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    amount: number;
    title: string;
    description: string;
    customerName?: string;
    customerEmail?: string;
    items?: ReceiptLineItem[];
    onComplete?: (txnId: string) => void;
  }>({
    isOpen: false,
    amount: 0,
    title: '',
    description: ''
  });

  // Push Notifications State
  const [notifications, setNotifications] = useState<PushNotificationItem[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [hasPushPermission, setHasPushPermission] = useState(false);

  // Active Customer profile for "My Garage" view
  const [activeCustomer, setActiveCustomer] = useState<CustomerRecord>(() => ({
    id: 'cust-1',
    name: 'Babajide Adeleke',
    email: 'b.adeleke@gmail.com',
    phone: '+234 802 317 9860',
    address: 'Ilasan New Road, behind Emardeb Filling Station, Eti-Osa, Lekki, Lagos',
    vehicleInfo: '2023 Toyota Camry',
    totalSpent: 4250.00,
    loyaltyPoints: 850,
    tier: 'Femisayo VIP',
    createdAt: '2025-01-15',
    encryptedVault: {
      iv: '',
      ciphertext: '',
      algorithm: 'AES-GCM-256',
      maskedPreview: {
        vinLast4: '••••8291',
        licenseMasked: '••••9482',
        taxIdMasked: '••••4892'
      }
    }
  }));

  // Initial Data Load
  useEffect(() => {
    const loadedApts = loadAppointments();
    const loadedVehicles = loadVehicles();
    const loadedParts = loadParts();
    const loadedCusts = loadCustomers();
    const loadedOrders = loadOrders();

    setAppointments(loadedApts);
    setVehicles(loadedVehicles);
    setParts(loadedParts);
    setCustomers(loadedCusts);
    setOrders(loadedOrders);

    setActiveCustomer(prev => loadedCusts.find(c => c.email === prev.email) || prev);

    // Initial default notifications
    setNotifications([
      {
        id: 'notif-1',
        title: 'Welcome to Femisayo Autos (Lekki, Lagos)',
        message: 'Book mechanical services, explore our car showroom, or shop for parts.',
        type: 'appointment',
        timestamp: 'Just now',
        read: false,
        to: 'all'
      },
      {
        id: 'notif-2',
        title: 'Workshop Hours',
        message: 'We are open Mon - Sat, 7:00 AM - 7:30 PM. Sunday closed.',
        type: 'appointment',
        timestamp: '1 hour ago',
        read: false,
        to: 'all'
      }
    ]);
    setUnreadNotificationCount(2);

    // Check browser notification permission
    if ('Notification' in window && Notification.permission === 'granted') {
      setHasPushPermission(true);
    }
  }, []);

  // Sync to LocalStorage
  const updateAppointments = (newApts: Appointment[]) => {
    setAppointments(newApts);
    saveAppointments(newApts);
  };

  const updateVehicles = (newVehicles: VehicleItem[]) => {
    setVehicles(newVehicles);
    saveVehicles(newVehicles);
  };

  const updateParts = (newParts: PartItem[]) => {
    setParts(newParts);
    saveParts(newParts);
  };

  const updateCustomers = (newCusts: CustomerRecord[]) => {
    setCustomers(newCusts);
    saveCustomers(newCusts);
  };

  const updateOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    saveOrders(newOrders);
  };

  // Resolve a customer email to a scoped recipient target (falls back to broadcast).
  const customerTarget = (email: string): PushTarget => {
    const found = customers.find(c => c.email.toLowerCase() === (email || '').toLowerCase());
    return found ? `customer:${found.id}` : 'all';
  };

  // Show a notification only to the user it belongs to:
  // - Admin & Sales see everything (they manage all clients).
  // - Technicians see general + staff/technician-targeted updates.
  // - Customers see general broadcasts, "all customers" pushes, and their own.
  const visibleNotifications = notifications.filter(n => {
    const to = n.to ?? 'all';
    if (to === 'all') return true;
    if (isStaffRole) {
      if (currentRole === 'admin' || currentRole === 'sales') return true;
      return to === 'staff' || to === 'technician';
    }
    if (to === 'customers') return true;
    if (to.startsWith('customer:')) {
      return activeCustomer.id === to.slice('customer:'.length);
    }
    return false;
  });

  // Push Notification Dispatcher
  const handleTriggerPushNotification = (
    title: string, 
    message: string, 
    type: 'appointment' | 'order' | 'inventory' | 'security' = 'appointment',
    to: PushTarget = 'all'
  ) => {
    // 1. Fire Web Push Notification API
    sendBrowserPushNotification(title, message);

    // 2. Append to local list
    const newNotif: PushNotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      to
    };

    setNotifications((prev: PushNotificationItem[]) => [newNotif, ...prev]);
    setUnreadNotificationCount((prev: number) => prev + 1);
  };

  // Simulated confirmation emails — surfaced as client notifications + logs
  const handleSendClientEmail = (to: string, subject: string, body: string) => {
    handleTriggerPushNotification(
      `📧 Email Sent to ${to}`,
      `"${subject}" — ${body}`,
      'order',
      customerTarget(to)
    );
  };

  // Notify Admin & Sales staff immediately after a payment
  const handleNotifyStaffOfPayment = (detail: string) => {
    handleTriggerPushNotification(
      '🔔 Staff Alert: Payment Received',
      `Admin & Sales have been notified — ${detail}`,
      'order',
      'staff'
    );
  };

  const handleRequestPushPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setHasPushPermission(true);
        handleTriggerPushNotification(
          'Push Notifications Activated',
          'You will now receive real-time workshop telematics and parts delivery status alerts.',
          'security'
        );
      }
    }
  };

  const buildCustomerRecord = (user: AuthUser): CustomerRecord => {
    const existing = customers.find(c => c.email.toLowerCase() === user.email.toLowerCase());
    if (existing) return existing;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      vehicleInfo: user.vehicleInfo,
      totalSpent: 0,
      loyaltyPoints: 0,
      tier: 'Gold',
      createdAt: user.createdAt,
      encryptedVault: {
        iv: '',
        ciphertext: '',
        algorithm: 'AES-GCM-256',
        maskedPreview: {
          vinLast4: '••••••••',
          licenseMasked: '••••••••',
          taxIdMasked: '•••-••-••••'
        }
      }
    };
  };

  const handleLogin = (role: UserRole, email?: string) => {
    if (role === 'customer' && email) {
      const account = authUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (account) {
        setActiveCustomer(buildCustomerRecord(account));
        setWishlist(loadWishlist(account.email));
      }
    } else if (role !== 'customer') {
      setWishlist([]);
      setStaffEmail(email || null);
    }
    setCurrentRole(role);
    setAuthRole(role);
    setIsAuthenticated(true);
    setLoginPortal(null);
    navigateTo(role === 'customer' ? activeTab : 'admin');
  };

  const handleOpenLogin = (portal: 'customer' | 'staff') => {
    if (!isAuthenticated) {
      setLoginPortal(portal);
    } else if (portal === 'staff') {
      navigateTo('admin');
    }
  };

  const handleRegister = (user: AuthUser) => {
    const newCustomers = [buildCustomerRecord(user), ...customers];
    updateCustomers(newCustomers);
    const newUsers = [...authUsers, user];
    setAuthUsers(newUsers);
    saveAuthUsers(newUsers);
    setActiveCustomer(buildCustomerRecord(user));
    setWishlist(loadWishlist(user.email));
    setCurrentRole('customer');
    setAuthRole('customer');
    setIsAuthenticated(true);
    setLoginPortal(null);
    navigateTo('garage');
    handleTriggerPushNotification(
      'Account Created',
      `Welcome to Femisayo Autos, ${user.name}! Your account has been created and your garage is ready.`,
      'security',
      `customer:${user.id}`
    );
  };

  const handleLogout = () => {
    if (currentRole === 'customer') {
      saveWishlist(activeCustomer.email, wishlist);
    }
    setIsAuthenticated(false);
    setCurrentRole('customer');
    setAuthRole('customer');
    setStaffEmail(null);
    setSelectedVehicleFitment(null);
    setCart([]);
    setWishlist([]);
    setIsCartOpen(false);
    setIsNotificationsOpen(false);
    setIsWishlistOpen(false);
    navigateTo('home');
  };

  // Persist wishlist for the signed-in customer account on every change
  useEffect(() => {
    if (isAuthenticated && currentRole === 'customer') {
      saveWishlist(activeCustomer.email, wishlist);
    }
  }, [wishlist, isAuthenticated, currentRole, activeCustomer.email]);

  const handleToggleWishlist = (part: PartItem) => {
    setWishlist(prev => {
      const exists = prev.some(p => p.id === part.id);
      return exists ? prev.filter(p => p.id !== part.id) : [...prev, part];
    });
  };

  const handleWishlistToCart = (part: PartItem) => {
    handleAddToCart(part);
    setWishlist(prev => prev.filter(p => p.id !== part.id));
  };

  // Lock body scroll while any overlay is open
  useEffect(() => {
    const isOverlayOpen = isCartOpen || isNotificationsOpen || isWishlistOpen || paymentModal.isOpen;
    document.body.style.overflow = isOverlayOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen, isNotificationsOpen, isWishlistOpen, paymentModal.isOpen]);

  // Cart Operations
  const handleAddToCart = (part: PartItem) => {
    setCart(prev => {
      const existing = prev.find(item => item.part.id === part.id);
      if (existing) {
        return prev.map(item =>
          item.part.id === part.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { part, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (partId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.part.id === partId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (partId: string) => {
    setCart(prev => prev.filter(item => item.part.id !== partId));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadNotificationCount(0);
  };

  // Start Checkout from Cart
  const handleProceedToCartCheckout = (
    subtotal: number, 
    discount: number, 
    tax: number, 
    total: number,
    couponCode?: string
  ) => {
    setPaymentModal({
      isOpen: true,
      amount: total,
      title: 'Auto Parts & Accessories Order',
      description: `Purchase of ${cart.reduce((acc, i) => acc + i.quantity, 0)} items${couponCode ? ` (Coupon ${couponCode} applied)` : ''}`,
      customerName: activeCustomer.name,
      customerEmail: activeCustomer.email,
      items: cart.map(i => ({ name: i.part.name, quantity: i.quantity, price: i.part.price })),
      onComplete: (txnId) => {
        // Create new Order
        const newOrder: Order = {
          id: `ord-${Date.now().toString().slice(-4)}`,
          customerId: activeCustomer.id,
          customerName: activeCustomer.name,
          customerEmail: activeCustomer.email,
          shippingAddress: activeCustomer.address,
          items: cart.map(i => ({
            partId: i.part.id,
            partName: i.part.name,
            brand: i.part.brand,
            price: i.part.price,
            quantity: i.quantity,
            image: i.part.image
          })),
          subtotal,
          discount,
          tax,
          shipping: 0, // Free local dispatch within Lekki
          total,
          paymentMethod: 'Credit Card',
          status: 'processing',
          paymentStatus: 'paid',
          fulfillmentStatus: 'processing',
          trackingNumber: `FA${Date.now().toString().slice(-10)}`,
          carrier: 'Local Dispatch (Lekki)',
          estimatedDelivery: '1-2 Business Days',
          createdAt: new Date().toISOString()
        };

        updateOrders([newOrder, ...orders]);
        setCart([]);

        // Deduct inventory quantities
        const updatedParts = parts.map(p => {
          const itemInCart = cart.find(c => c.part.id === p.id);
          if (itemInCart) {
            return { ...p, inStock: Math.max(0, p.inStock - itemInCart.quantity) };
          }
          return p;
        });
        updateParts(updatedParts);

        // Notify client
        handleTriggerPushNotification(
          'Order Confirmed & Processing',
          `Your parts order #${newOrder.id.toUpperCase()} has been settled. Dispatch tracking number generated.`,
          'order',
          `customer:${activeCustomer.id}`
        );

        // Admin & Sales notified immediately + confirmation email to customer
        handleNotifyStaffOfPayment(
          `New payment received from ${activeCustomer.name} (${activeCustomer.email}) for order #${newOrder.id.toUpperCase()}. Ref: ${txnId}.`
        );
        handleSendClientEmail(
          activeCustomer.email,
          'Payment Received — Your Order Is Confirmed',
          `Hi ${activeCustomer.name}, we confirm receipt of your payment (Ref ${txnId}) for order #${newOrder.id.toUpperCase()}. Fulfilment has begun.`
        );
      }
    });
  };

  // Booking Service Flow with Deposit/Payment
  const handleBookingSubmitted = (apt: Appointment) => {
    // Open payment gateway for the $50 service bay reservation deposit
    setPaymentModal({
      isOpen: true,
      amount: apt.depositAmount,
      title: `Bay Reservation Deposit: ${apt.serviceName}`,
      description: `Vehicle: ${apt.vehicleYear} ${apt.vehicleMake} ${apt.vehicleModel} on ${apt.scheduledDate} at ${apt.scheduledTime}`,
      customerName: apt.customerName,
      customerEmail: apt.customerEmail,
      items: [
        { name: `Service Booking Deposit: ${apt.serviceName}`, quantity: 1, price: apt.depositAmount }
      ],
      onComplete: async (txnId) => {
        const confirmedApt: Appointment = {
          ...apt,
          status: 'confirmed',
          paymentStatus: 'deposit_paid',
          updatedAt: new Date().toISOString()
        };

        // Fire-and-forget: let the backend persist the booking once connected.
        // TODO(backend): api.bookings.create should persist & return the server-assigned ID.
        void api.bookings.create(confirmedApt);

        updateAppointments([confirmedApt, ...appointments]);

        handleTriggerPushNotification(
          'Service Appointment Confirmed!',
          `Bay reserved for ${apt.vehicleYear} ${apt.vehicleMake} ${apt.vehicleModel} on ${apt.scheduledDate}. Master Tech ${apt.assignedTechnician} assigned.`,
          'appointment',
          customerTarget(apt.customerEmail)
        );

        // Admin & Sales notified immediately + confirmation email to customer
        handleNotifyStaffOfPayment(
          `Deposit payment received from ${apt.customerName} for appointment ${apt.id.toUpperCase()} (${apt.serviceName}). Ref: ${txnId}.`
        );
        handleSendClientEmail(
          apt.customerEmail,
          'Service Payment Received — Booking Confirmed',
          `Hi ${apt.customerName}, we confirm receipt of your deposit (Ref ${txnId}). Your ${apt.serviceName} appointment is confirmed.`
        );

        // Switch user to their Garage tab so they immediately see live progress
        navigateTo('garage');
      }
    });
  };

  // Car Purchase / Reservation
  const handleCarPurchaseDeposit = (vehicle: VehicleItem) => {
    setPaymentModal({
      isOpen: true,
      amount: 500,
      title: `Refundable Reservation Deposit: ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      description: `Locks vehicle inventory for 72 hours for VIP inspection & financing clearance. VIN: ${vehicle.vin}`,
      customerName: activeCustomer.name,
      customerEmail: activeCustomer.email,
      items: [
        { name: `${vehicle.year} ${vehicle.make} ${vehicle.model} — Refundable Reservation Deposit`, quantity: 1, price: 500 }
      ],
      onComplete: (txnId) => {
        handleTriggerPushNotification(
          'Showroom Vehicle Hold Reserved',
          `${formatPrice(500)} deposit verified for ${vehicle.year} ${vehicle.make} ${vehicle.model}. Sales rep will contact you for delivery.`,
          'order',
          `customer:${activeCustomer.id}`
        );
        handleNotifyStaffOfPayment(
          `Vehicle reservation payment received from ${activeCustomer.name} for ${vehicle.year} ${vehicle.make} ${vehicle.model}. Ref: ${txnId}.`
        );
        handleSendClientEmail(
          activeCustomer.email,
          'Vehicle Reservation Confirmed & Payment Received',
          `Hi ${activeCustomer.name}, thank you for your reservation deposit on the ${vehicle.year} ${vehicle.make} ${vehicle.model} (Ref ${txnId}). Our sales team will contact you shortly.`
        );
        navigateTo('garage');
      }
    });
  };

  // Pay remaining service balance
  const handlePayRemainingServiceBalance = (apt: Appointment) => {
    const balance = apt.totalCost - apt.depositAmount;
    setPaymentModal({
      isOpen: true,
      amount: balance,
      title: `Final Service Balance: ${apt.serviceName}`,
      description: `Vehicle: ${apt.vehicleYear} ${apt.vehicleMake} ${apt.vehicleModel}`,
      customerName: apt.customerName,
      customerEmail: apt.customerEmail,
      items: [
        { name: `Final Service Balance: ${apt.serviceName}`, quantity: 1, price: balance }
      ],
      onComplete: (txnId) => {
        const updated = appointments.map(a => 
          a.id === apt.id ? { ...a, paymentStatus: 'paid' as const } : a
        );
        updateAppointments(updated);
        handleTriggerPushNotification(
          'Service Balance Cleared',
          `Full payment for order #${apt.id.toUpperCase()} received. Ready for pickup!`,
          'appointment',
          customerTarget(apt.customerEmail)
        );
        handleNotifyStaffOfPayment(
          `Final service balance payment received from ${apt.customerName} for ${apt.serviceName} (${apt.vehicleYear} ${apt.vehicleMake} ${apt.vehicleModel}). Ref: ${txnId}.`
        );
        handleSendClientEmail(
          apt.customerEmail,
          'Final Payment Received — Service Complete',
          `Hi ${apt.customerName}, thank you for settling the balance (Ref ${txnId}). Your vehicle is ready for pickup!`
        );
      }
    });
  };

  // Site is fully public. Login is only an optional overlay for My Garage / Admin.
  if (loginPortal) {
    return (
      <LoginPage
        customerAccounts={authUsers}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onClose={() => setLoginPortal(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      
      {/* 1. Global Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={navigateTo}
        currentRole={currentRole}
        isAuthenticated={isAuthenticated}
        onOpenLogin={handleOpenLogin}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        openCart={() => setIsCartOpen(true)}
        notifications={visibleNotifications}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        wishlistCount={wishlist.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        selectedVehicleFitment={selectedVehicleFitment}
        onClearFitment={() => setSelectedVehicleFitment(null)}
        onLogout={handleLogout}
      />

      {/* 2. Main Page Views based on Active Tab */}
      <main className="flex-1">
        {/* HOME TAB: Full Experience */}
        {activeTab === 'home' && (
          <div className="space-y-12">
            {/* Hero Banner with Fitment Selector */}
            <HeroBanner
              onSelectFitment={(fitment) => {
                setSelectedVehicleFitment(fitment);
                navigateTo('parts');
              }}
              onBookServiceClick={() => navigateTo('services')}
              onExploreCarsClick={() => navigateTo('cars')}
              onExplorePartsClick={() => navigateTo('parts')}
            />

            {/* Featured Services Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div>
              <span className="text-red-500 font-bold text-xs uppercase tracking-wider font-mono">
                Bring Your Vehicle In For Service
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-4xl font-black text-white font-mono mt-1">
                AUTO REPAIR &amp; MAINTENANCE SERVICES
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-2xl">
                From engine diagnostics and brake repair to A/C service and transmissions — every job is handled by ASE-certified master technicians.
              </p>
            </div>
            <button
              onClick={() => navigateTo('services')}
              className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1.5 underline shrink-0"
            >
              <span>View All {INITIAL_SERVICES.length} Service Packages &amp; Pricing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Service Cards Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_SERVICE_ORDER.map((id) => {
              const service = INITIAL_SERVICES.find((s) => s.id === id);
              if (!service) return null;
              const Icon = SERVICE_ICONS[id] || Wrench;
              return (
                <div
                  key={service.id}
                  className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col justify-between hover:border-red-500/40 transition-all group"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-500 flex items-center justify-center mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">{service.category}</span>
                    <h3 className="text-lg font-bold text-white mt-1 leading-snug">{service.name}</h3>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed line-clamp-3">{service.description}</p>
                    <div className="mt-4 text-xl font-black font-mono text-white">
                      from {formatPrice(service.price)}
                    </div>
                  </div>
                  <button
                    onClick={() => navigateTo('services')}
                    className="mt-6 w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors shadow-lg shadow-red-700/20 flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Book a Service
                  </button>
                </div>
              );
            })}
          </div>
        </section>

            {/* Featured Cars Preview */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div>
                  <span className="text-red-500 font-bold text-xs uppercase tracking-wider font-mono">
                    Certified Performance Showroom
                  </span>
                  <h2 className="text-xl sm:text-2xl lg:text-4xl font-black text-white font-mono mt-1">
                    CARS AVAILABLE FOR IMMEDIATE SALE
                  </h2>
                </div>
                <button
                  onClick={() => navigateTo('cars')}
                  className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1.5 underline shrink-0"
                >
                  <span>View All {vehicles.length} Showroom Vehicles</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {vehicles.slice(0, 3).map(veh => (
                  <div key={veh.id} className="rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden group">
                    <div className="relative h-52 bg-zinc-950 overflow-hidden">
                      <img
                        src={veh.image}
                        alt={veh.model}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
                        {veh.badges[0]}
                      </span>
                      <span className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-emerald-400 font-mono font-bold text-xs px-2.5 py-1 rounded border border-emerald-500/30">
                        {formatPrice(veh.price)}
                      </span>
                    </div>
                    <div className="p-5">
                      <h4 className="text-base font-bold text-white">
                        {veh.year} {veh.make} {veh.model}
                      </h4>
                      <div className="text-xs font-mono text-zinc-400 mt-1">
                        {veh.horsepower} HP • {veh.zeroToSixty} • {Math.round(veh.mileage * 1.609)} km
                      </div>
                      <button
                        onClick={() => navigateTo('cars')}
                        className="mt-4 w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 rounded-xl transition-colors"
                      >
                        View Vehicle Details &amp; Financing
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Official Business Profile & Registry Verification Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-black border border-zinc-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                {/* Background decorative watermark */}
                <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 rounded-full bg-red-600/5 blur-3xl pointer-events-none" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-zinc-800">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-600/40 text-red-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified Nigerian Business Entity</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                      FEMISAYO AUTOS • LEKKI, LAGOS
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
                      Automobile Repairs &amp; Mechanical Services Workshop. Fully certified and registered with the Corporate Affairs Commission (CAC).
                    </p>
                  </div>

                  {/* Google Rating Badge */}
                  <div className="flex items-center gap-4 bg-zinc-950/90 border border-zinc-800 p-4 rounded-2xl shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
                      <Star className="w-6 h-6 fill-yellow-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-white font-mono">4.4</span>
                        <div className="flex text-yellow-400 text-xs">★★★★☆</div>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-medium">8 Verified Google Reviews</p>
                      <span className="text-[10px] text-emerald-400 font-mono font-semibold">Category: Auto repair shop</span>
                    </div>
                  </div>
                </div>

                {/* Grid of Key Business Data & Addresses */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                  
                  {/* Card 1: Official CAC Business Registration */}
                  <div className="bg-zinc-950/70 border border-zinc-800/90 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider font-mono">
                      <FileText className="w-4 h-4 text-red-500" />
                      <span>CAC Registration Record</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between border-b border-zinc-800/80 pb-1.5">
                        <span className="text-zinc-500">Business Name:</span>
                        <span className="text-zinc-200 font-bold font-mono">FEMISAYO AUTOS</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-800/80 pb-1.5">
                        <span className="text-zinc-500">Registration No:</span>
                        <span className="text-emerald-400 font-bold font-mono">BN-2641123</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-800/80 pb-1.5">
                        <span className="text-zinc-500">Registration Date:</span>
                        <span className="text-zinc-200 font-medium">15 August 2018</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-800/80 pb-1.5">
                        <span className="text-zinc-500">Entity Structure:</span>
                        <span className="text-zinc-300">Sole Proprietor</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Primary Activity:</span>
                        <span className="text-red-400 font-medium">Automobile repairs &amp; mechanical</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Workshop Locations & Annex */}
                  <div className="bg-zinc-950/70 border border-zinc-800/90 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider font-mono">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span>Workshop Locations</span>
                    </div>
                    <div className="space-y-2.5 text-xs">
                      <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/60">
                        <div className="text-[10px] font-bold text-red-400 uppercase">Primary Workshop</div>
                        <p className="text-zinc-200 mt-0.5 leading-snug">
                          Ilasan New Road, behind Emardeb Filling Station, Eti-Osa, Lekki, Lagos.
                        </p>
                      </div>
                      <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/60">
                        <div className="text-[10px] font-bold text-zinc-400 uppercase">Secondary Annex</div>
                        <p className="text-zinc-200 mt-0.5 leading-snug">
                          FemisayoAutos Annex in Ilasan, Lekki.
                        </p>
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        <strong className="text-zinc-300">Registry Office:</strong> 1 Samuel Adedoyin Street, opposite Zion Court, Lekki, Elegushi, Lagos State.
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Working Hours & Hotline */}
                  <div className="bg-zinc-950/70 border border-zinc-800/90 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider font-mono">
                        <Clock className="w-4 h-4 text-red-500" />
                        <span>Working Hours &amp; Contact</span>
                      </div>
                      <div className="mt-3 space-y-2 text-xs">
                        <div className="flex justify-between border-b border-zinc-800/80 pb-1.5">
                          <span className="text-zinc-500">Monday – Saturday:</span>
                          <span className="text-white font-mono font-bold">7:00 AM – 7:30 PM</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-800/80 pb-1.5">
                          <span className="text-zinc-500">Sunday:</span>
                          <span className="text-zinc-400">Closed (On-Call Recovery)</span>
                        </div>
                        <div className="flex justify-between pb-1">
                          <span className="text-zinc-500">Hotline:</span>
                          <a href="tel:+2348023179860" className="text-emerald-400 font-mono font-bold hover:underline">
                            +234 802 317 9860
                          </a>
                        </div>
                      </div>
                    </div>

                    <a
                      href="tel:+2348023179860"
                      className="mt-3 w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-700/30 transition-all text-center"
                    >
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Call / WhatsApp: +234 802 317 9860</span>
                    </a>
                  </div>

                </div>
              </div>
            </section>

            {/* Featured Parts Banner */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
              <PartsStore
                parts={parts.slice(0, 4)}
                onAddToCart={handleAddToCart}
                selectedVehicleFitment={selectedVehicleFitment}
                onOpenCart={() => setIsCartOpen(true)}
                wishlistedIds={wishlist.map(p => p.id)}
                onToggleWishlist={handleToggleWishlist}
              />
            </section>
          </div>
        )}

        {/* SERVICES & BOOKING TAB */}
        {activeTab === 'services' && (
          <ServicePricingAndBooking
            services={INITIAL_SERVICES}
            technicians={technicians}
            onAppointmentBooked={(apt, customer) => {
              updateCustomers([customer, ...customers]);
              updateAppointments([apt, ...appointments]);
              handleTriggerPushNotification(
                'Service Appointment Booked',
                `${apt.serviceName} for ${apt.vehicleYear} ${apt.vehicleMake} ${apt.vehicleModel} on ${apt.scheduledDate} at ${apt.scheduledTime}.`,
                'appointment',
                customerTarget(apt.customerEmail)
              );
              navigateTo('garage');
            }}
            openPaymentGateway={(params) => {
              const { amount, title, description, customerName, customerEmail, items, onSuccess } = params;
              setPaymentModal({ isOpen: true, amount, title, description, customerName, customerEmail, items, onComplete: onSuccess });
            }}
            initialVehicleFitment={selectedVehicleFitment}
          />
        )}

        {/* CAR SHOWROOM TAB */}
        {activeTab === 'cars' && (
          <CarShowroom
            vehicles={vehicles}
            openPaymentGateway={(params) => {
              const { amount, title, description, customerName, customerEmail, items, onSuccess } = params;
              setPaymentModal({ isOpen: true, amount, title, description, customerName: customerName || activeCustomer.name, customerEmail: customerEmail || activeCustomer.email, items, onComplete: onSuccess });
            }}
            onBookTestDrive={(veh, date, name, phone) => {
              handleTriggerPushNotification(
                'Test Drive Confirmed',
                `VIP test drive confirmed for ${veh.year} ${veh.make} ${veh.model} on ${date} at ${name} (${phone}).`,
                'appointment',
                `customer:${activeCustomer.id}`
              );
              navigateTo('garage');
            }}
          />
        )}

        {/* AUTO PARTS STORE TAB */}
        {activeTab === 'parts' && (
          <PartsStore
            parts={parts}
            onAddToCart={handleAddToCart}
            selectedVehicleFitment={selectedVehicleFitment}
            onOpenCart={() => setIsCartOpen(true)}
            wishlistedIds={wishlist.map(p => p.id)}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {/* MY GARAGE / CLIENT PORTAL TAB */}
        {activeTab === 'garage' && (
          <MyGaragePortal
            customer={activeCustomer}
            appointments={appointments}
            orders={orders}
            notifications={visibleNotifications}
            onBookServiceClick={() => navigateTo('services')}
            onRequestPushPermission={handleRequestPushPermission}
            hasPushPermission={hasPushPermission}
            onPayAppointmentBalance={handlePayRemainingServiceBalance}
          />
        )}

        {/* STAFF & ADMIN PORTAL WITH CRUD, ANALYTICS, RBAC & CRYPTO VAULT */}
        {activeTab === 'admin' && (
          <AdminPortal
            currentRole={currentRole}
            authRole={authRole}
            setRole={setCurrentRole}
            staffEmail={staffEmail}
            appointments={appointments}
            onUpdateAppointment={(updated) => {
              const prev = appointments.find(a => a.id === updated.id);
              const newApts = appointments.map(a => a.id === updated.id ? updated : a);
              updateAppointments(newApts);
              // Automated email updates along the service lifecycle
              if (prev && prev.status !== updated.status) {
                if (['in_repair', 'quality_check'].includes(updated.status)) {
                  handleSendClientEmail(
                    updated.customerEmail,
                    'Your Service Is Being Attended To',
                    `Hi ${updated.customerName}, great news — Master Tech ${updated.assignedTechnician} is now working on your ${updated.vehicleYear} ${updated.vehicleMake} ${updated.vehicleModel}.`
                  );
                }
                if (updated.status === 'ready_for_pickup') {
                  handleSendClientEmail(
                    updated.customerEmail,
                    'Your Vehicle Is Ready For Pickup',
                    `Hi ${updated.customerName}, your ${updated.vehicleYear} ${updated.vehicleMake} ${updated.vehicleModel} is ready for pickup at Femisayo Autos.`
                  );
                }
                if (updated.status === 'completed') {
                  handleSendClientEmail(
                    updated.customerEmail,
                    'Thank You — We Appreciate You',
                    `Hi ${updated.customerName}, thank you for trusting Femisayo Autos with your ${updated.vehicleYear} ${updated.vehicleMake} ${updated.vehicleModel}. We truly appreciate your business!`
                  );
                }
              }
            }}
            onDeleteAppointment={(id) => {
              const newApts = appointments.filter(a => a.id !== id);
              updateAppointments(newApts);
            }}
            onCreateAppointment={(newApt) => {
              updateAppointments([newApt, ...appointments]);
            }}
            vehicles={vehicles}
            onUpdateVehicle={(updated) => {
              const newVehs = vehicles.map(v => v.id === updated.id ? updated : v);
              updateVehicles(newVehs);
            }}
            onDeleteVehicle={(id) => {
              const newVehs = vehicles.filter(v => v.id !== id);
              updateVehicles(newVehs);
            }}
            onCreateVehicle={(newVeh) => {
              updateVehicles([newVeh, ...vehicles]);
            }}
            parts={parts}
            onUpdatePart={(updated) => {
              const newParts = parts.map(p => p.id === updated.id ? updated : p);
              updateParts(newParts);
            }}
            onDeletePart={(id) => {
              const newParts = parts.filter(p => p.id !== id);
              updateParts(newParts);
            }}
            onCreatePart={(newPart) => {
              updateParts([newPart, ...parts]);
            }}
            customers={customers}
            onUpdateCustomer={(updated) => {
              const newCusts = customers.map(c => c.id === updated.id ? updated : c);
              updateCustomers(newCusts);
            }}
            onDeleteCustomer={(id) => {
              const newCusts = customers.filter(c => c.id !== id);
              updateCustomers(newCusts);
            }}
            onCreateCustomer={(newCust) => {
              updateCustomers([newCust, ...customers]);
            }}
            orders={orders}
            onUpdateOrder={(updated) => {
              const newOrds = orders.map(o => o.id === updated.id ? updated : o);
              updateOrders(newOrds);
            }}
            technicians={technicians}
            onSendPushNotification={handleTriggerPushNotification}
          />
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={handleProceedToCartCheckout}
      />

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={visibleNotifications}
        onMarkAllRead={markAllNotificationsRead}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        items={wishlist}
        onAddToCart={handleWishlistToCart}
        onRemoveItem={(partId) => setWishlist(prev => prev.filter(p => p.id !== partId))}
      />

      {/* Unified Secure Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal(prev => ({ ...prev, isOpen: false }))}
        amount={paymentModal.amount}
        title={paymentModal.title}
        description={paymentModal.description}
        customerName={paymentModal.customerName || activeCustomer.name}
        customerEmail={paymentModal.customerEmail || activeCustomer.email}
        items={paymentModal.items}
        onSuccess={(txnId) => {
          if (paymentModal.onComplete) {
            paymentModal.onComplete(txnId);
          }
        }}
      />

      {/* 3. Global Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-800/80 pt-10 sm:pt-12 lg:pt-16 pb-8 sm:pb-12 mt-12 sm:mt-16 lg:mt-20 text-zinc-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            
            {/* Column 1: Brand & Credentials */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-black text-white font-mono text-base shadow-md shadow-red-700/50">
                  F
                </div>
                <span className="font-mono text-base font-black tracking-wider text-white">
                  FEMISAYO <span className="text-red-600">AUTOS</span>
                </span>
              </div>
              <p className="text-zinc-400 leading-relaxed text-xs">
                Auto repair shop providing comprehensive automobile repairs, mechanical diagnostics, vehicle sales, and genuine auto accessories across Lekki and Lagos.
              </p>
              <div className="space-y-1.5 text-[11px] font-mono">
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>CAC Registered: BN-2641123 (Est. 2018)</span>
                </div>
                <div className="flex items-center gap-2 text-yellow-400">
                  <Star className="w-4 h-4 fill-yellow-400" />
                  <span>4.4/5 Google Rating (8 Reviews)</span>
                </div>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono mb-4">
                Shop Departments
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <button onClick={() => navigateTo('services')} className="hover:text-red-400 transition-colors">
                    Online Service Bay Booking
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('cars')} className="hover:text-red-400 transition-colors">
                    Certified Car Showroom Sales
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('parts')} className="hover:text-red-400 transition-colors">
                    OEM &amp; Performance Parts
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      if (isAuthenticated) {
                        navigateTo('garage');
                      } else {
                        handleOpenLogin('customer');
                      }
                    }}
                    className="hover:text-red-400 transition-colors"
                  >
                    Client Garage &amp; Live Telematics
                  </button>
                </li>
                {currentRole !== 'customer' && (
                <li>
                  <button onClick={() => navigateTo('admin')} className="hover:text-red-400 transition-colors font-bold text-zinc-300">
                    Staff Operations Dashboard (RBAC)
                  </button>
                </li>
                )}
              </ul>
            </div>

            {/* Column 3: Hours & Bay Operations */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono mb-4">
                Workshop Locations &amp; Hours
              </h4>
              <div className="space-y-2.5 text-zinc-300">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="text-white">Main Workshop:</strong> Ilasan New Road, behind Emardeb Filling Station, Eti-Osa, Lekki, Lagos.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="text-white">Workshop Annex:</strong> FemisayoAutos Annex, Ilasan, Lekki.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="text-white">Hours:</strong> Mon–Sat: 7:00 AM – 7:30 PM<br />
                    Sunday: Closed (On-Call Recovery)
                  </div>
                </div>
              </div>
            </div>

            {/* Column 4: Contact Hotline */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono mb-4">
                Contact &amp; Support
              </h4>
              <div className="space-y-3">
                <a
                  href="tel:+2348023179860"
                  className="flex items-center gap-2 text-zinc-300 hover:text-red-400 transition-colors"
                >
                  <Phone className="w-4 h-4 text-red-500" />
                  <span className="font-mono font-bold">+234 802 317 9860</span>
                </a>
                <a
                  href={SOCIAL_LINKS.maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-zinc-300 hover:text-red-400 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>Ilasan New Road, Lekki, Lagos, Nigeria</span>
                </a>
                <div className="pt-2">
                  <p className="text-[11px] text-zinc-500 mb-2">Follow us on social media</p>
                  <div className="flex gap-2">
                    <a
                      href={SOCIAL_LINKS.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:border-red-500/40 transition-all text-[10px] font-bold"
                    >
                      Instagram
                    </a>
                    <a
                      href={SOCIAL_LINKS.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:border-red-500/40 transition-all text-[10px] font-bold"
                    >
                      Facebook
                    </a>
                    <a
                      href={SOCIAL_LINKS.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:border-green-500/40 transition-all text-[10px] font-bold"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-zinc-800/80 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-zinc-600 text-[11px] font-mono text-center sm:text-left">
              &copy; {new Date().getFullYear()} FEMISAYO AUTOS. All rights reserved. CAC Reg: BN-2641123
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-zinc-600 text-[11px]">
              <span className="hover:text-zinc-400 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-zinc-400 cursor-pointer transition-colors">Terms of Service</span>
              {!isAuthenticated && (
                <button
                  onClick={() => handleOpenLogin('staff')}
                  className="hover:text-zinc-400 cursor-pointer transition-colors"
                >
                  Staff Login
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}