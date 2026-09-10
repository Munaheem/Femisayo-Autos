export type UserRole = 'customer' | 'technician' | 'sales' | 'admin';

export type VehicleCategory = 'all' | 'suv' | 'sedan' | 'sports' | 'hatchback' | 'luxury';

export type PartCategory = 
  | 'all' 
  | 'engine' 
  | 'brakes' 
  | 'suspension' 
  | 'electrical' 
  | 'transmission' 
  | 'cooling' 
  | 'filters' 
  | 'wheels' 
  | 'accessories';

export type AppointmentStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'in_inspection' 
  | 'in_repair' 
  | 'quality_check' 
  | 'ready_for_pickup' 
  | 'completed' 
  | 'cancelled';

export type PaymentStatus = 'pending' | 'deposit_paid' | 'paid' | 'refunded';

export type FulfillmentStatus = 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  price: number;
  durationMinutes: number;
  description: string;
  recommendedMileage: string;
  features: string[];
  popular?: boolean;
  featured?: boolean;
}

export interface VehicleItem {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  transmission: 'Automatic' | 'Manual' | 'Dual-Clutch';
  fuel: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
  bodyType: VehicleCategory;
  horsepower: number;
  zeroToSixty: string;
  engine: string;
  vin: string;
  color: string;
  inStock: boolean;
  image: string;
  gallery?: string[];
  badges: string[];
  features: string[];
}

export interface PartItem {
  id: string;
  name: string;
  brand: string;
  partNumber: string;
  category: PartCategory;
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  inStock: number;
  fitmentMakes: string[];
  fitmentYears: string;
  image: string;
  gallery?: string[];
  description: string;
  isBestSeller?: boolean;
  badge?: string;
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  vehiclePlate: string;
  vin: string;
  serviceId: string;
  serviceName: string;
  additionalServices: string[];
  assignedTechnician: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  status: AppointmentStatus;
  customerNotes?: string;
  technicianNotes?: string;
  totalCost: number;
  depositAmount: number;
  paymentStatus: PaymentStatus;
  paymentTransactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  vehicleInfo: string;
  totalSpent: number;
  loyaltyPoints: number;
  tier: 'Silver' | 'Gold' | 'Platinum' | 'Femisayo VIP' | 'Apex VIP';
  createdAt: string;
  // Encrypted sensitive data payload for privacy compliance (GDPR/CCPA)
  encryptedVault: {
    iv: string; // Base64 Initialization Vector
    ciphertext: string; // Base64 Encrypted payload
    algorithm: string; // AES-GCM 256
    maskedPreview: {
      vinLast4: string;
      licenseMasked: string;
      taxIdMasked: string;
    };
  };
}

export interface CartItem {
  part: PartItem;
  quantity: number;
}

export interface OrderItem {
  partId: string;
  partName: string;
  brand: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  items: (OrderItem | CartItem)[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping?: number;
  total: number;
  couponApplied?: string;
  paymentMethod: 'Credit Card' | 'Apple Pay' | 'Google Pay' | 'PayPal';
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  status?: string;
  estimatedDelivery?: string;
  trackingNumber: string;
  carrier: string;
  createdAt: string;
}

// Recipient scoping for a push notification:
// - 'all'          → visible to everyone (customers + staff)
// - 'customers'    → visible to all customers
// - 'staff'        → visible to all staff (admin, sales, technician)
// - 'admin'        → admins only
// - 'sales'        → sales reps only
// - 'technician'   → technicians only
// - 'customer:<id>'→ a single customer (admin & sales also see it)
export type PushTarget =
  | 'all'
  | 'customers'
  | 'staff'
  | 'admin'
  | 'sales'
  | 'technician'
  | `customer:${string}`;

export function pushTargetLabel(to?: PushTarget): string {
  if (!to || to === 'all') return 'Everyone';
  if (to === 'customers') return 'All Customers';
  if (to === 'staff') return 'Staff';
  if (to === 'admin') return 'Admins';
  if (to === 'sales') return 'Sales Reps';
  if (to === 'technician') return 'Technicians';
  if (to.startsWith('customer:')) return `Customer #${to.slice('customer:'.length)}`;
  return 'Everyone';
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  type: 'appointment' | 'order' | 'inventory' | 'security';
  timestamp: string;
  read: boolean;
  appointmentId?: string;
  orderId?: string;
  to?: PushTarget;
}

export type PushNotificationItem = PushNotification;

export interface ReceiptLineItem {
  name: string;
  quantity: number;
  price: number;
}

export interface PaymentGatewayParams {
  amount: number;
  title: string;
  description: string;
  customerName?: string;
  customerEmail?: string;
  items?: ReceiptLineItem[];
  onSuccess: (txnId: string) => void;
}

export interface Technician {
  id: string;
  name: string;
  specialty: string;
  experienceYears: number;
  rating: number;
  avatar: string;
  status: 'available' | 'in_bay' | 'off_duty';
}
