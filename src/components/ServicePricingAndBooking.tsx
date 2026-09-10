import React, { useState } from 'react';
import { 
  Wrench, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Car, 
  User, 
  Lock, 
  Sparkles, 
  X, 
  AlertCircle,
  CreditCard,
  Check,
  Gauge,
  Disc,
  Droplets,
  Cog,
  Zap,
  Snowflake,
  Activity,
  Target,
  BatteryCharging,
  Fan,
  Fuel,
  Thermometer,
  Filter,
  RefreshCw,
  KeyRound,
  Truck,
  LifeBuoy,
  ClipboardCheck,
  Search,
  Rows
} from 'lucide-react';
import { Appointment, ServiceItem, Technician, CustomerRecord, PaymentGatewayParams } from '../types';
import { encryptSensitiveData } from '../utils/crypto';
import { useCurrency } from '../context/CurrencyContext';

interface ServicePricingAndBookingProps {
  services: ServiceItem[];
  technicians: Technician[];
  onAppointmentBooked: (appointment: Appointment, customer: CustomerRecord) => void;
  openPaymentGateway: (params: PaymentGatewayParams) => void;
  initialVehicleFitment?: { year: string; make: string; model: string } | null;
}

const SERVICE_ADDONS = [
  { id: 'addon-brake-fluid', name: 'Hydraulic Brake Fluid Moisture & Boil Test', price: 35.00 },
  { id: 'addon-cabin-hepa', name: 'Activated Carbon Cabin Air HEPA Filter', price: 42.00 },
  { id: 'addon-wiper-blades', name: 'Bosch ICON All-Weather Silicone Wiper Set', price: 49.00 },
  { id: 'addon-obd-report', name: 'Full Electronic OBD-II Live Diagnostic Health Report', price: 65.00 }
];

const TIME_SLOTS = [
  '08:30 AM', '09:30 AM', '10:30 AM', '11:30 AM', 
  '01:00 PM', '02:00 PM', '03:30 PM', '04:30 PM'
];

export const ServicePricingAndBooking: React.FC<ServicePricingAndBookingProps> = ({
  services,
  technicians,
  onAppointmentBooked,
  openPaymentGateway,
  initialVehicleFitment
}) => {
  const { formatPrice, currency } = useCurrency();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  // Booking Wizard Multi-Step State
  const [step, setStep] = useState<number>(1);
  const [vehicleYear, setVehicleYear] = useState<number>(
    initialVehicleFitment?.year ? parseInt(initialVehicleFitment.year) : 2023
  );
  const [vehicleMake, setVehicleMake] = useState<string>(initialVehicleFitment?.make || 'Toyota');
  const [vehicleModel, setVehicleModel] = useState<string>(initialVehicleFitment?.model || 'Camry');
  const [vehiclePlate, setVehiclePlate] = useState<string>('EKY-920-LG');
  const [vehicleVin, setVehicleVin] = useState<string>('JTNBF4EK2P32048291');

  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [selectedTech, setSelectedTech] = useState<string>(technicians[0]?.name || 'Femi Adeyemi');
  const [bookingDate, setBookingDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [bookingTime, setBookingTime] = useState<string>('10:30 AM');

  // Customer Contact State
  const [custName, setCustName] = useState<string>('Babajide Adeleke');
  const [custPhone, setCustPhone] = useState<string>('+234 802 317 9860');
  const [custEmail, setCustEmail] = useState<string>('b.adeleke@gmail.com');
  const [custAddress, setCustAddress] = useState<string>('Ilasan New Road, behind Emardeb Filling Station, Eti-Osa, Lekki, Lagos');
  const [custDriverLicense, setCustDriverLicense] = useState<string>('DL-94829104');
  const [custTaxId, setCustTaxId] = useState<string>('123-45-6789');
  const [customerNotes, setCustomerNotes] = useState<string>('');

  const [paymentChoice, setPaymentChoice] = useState<'deposit' | 'full'>('deposit');
  const [isEncrypting, setIsEncrypting] = useState<boolean>(false);
  const [bookingCompleted, setBookingCompleted] = useState<Appointment | null>(null);

  // Scroll lock while the booking modal is open
  React.useEffect(() => {
    if (bookingModalOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [bookingModalOpen]);

  const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'srv-engine-diagnostics': Gauge,
  'srv-oil-change': Droplets,
  'srv-brakes': Disc,
  'srv-engine-repair': Cog,
  'srv-transmission': Cog,
  'srv-battery-electrical': BatteryCharging,
  'srv-ac-service': Snowflake,
  'srv-suspension-steering': Activity,
  'srv-alignment': Target,
  'srv-tires': LifeBuoy,
  'srv-cooling': Thermometer,
  'srv-fuel-system': Fuel,
  'srv-routine-maintenance': Wrench,
  'srv-full-inspection': ClipboardCheck,
  'srv-prepurchase': Search,
  'srv-scheduled-maintenance': RefreshCw,
  'srv-fluid-checks': Droplets,
  'srv-filter-replacement': Filter,
  'srv-safety-inspection': ShieldCheck,
  'srv-mobile-mechanic': Truck,
  'srv-roadside': LifeBuoy,
  'srv-pickup-delivery': Truck,
  'srv-fleet-maintenance': Rows
};

const categories = ['all', 'Engine', 'Maintenance', 'Brakes', 'Diagnostics', 'Drivetrain', 'Electrical', 'Climate', 'Suspension', 'Tires', 'Cooling', 'Fuel', 'Inspection', 'Mobile Service'];

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(s => s.category.toLowerCase() === selectedCategory.toLowerCase());

  const handleOpenBooking = (service: ServiceItem) => {
    setSelectedService(service);
    setStep(1);
    setBookingCompleted(null);
    setBookingModalOpen(true);
  };

  const calculateAddonsTotal = () => {
    return selectedAddons.reduce((sum, addonId) => {
      const addon = SERVICE_ADDONS.find(a => a.id === addonId);
      return sum + (addon ? addon.price : 0);
    }, 0);
  };

  const basePrice = selectedService ? selectedService.price : 0;
  const addonsTotal = calculateAddonsTotal();
  const subtotal = basePrice + addonsTotal;
  const tax = subtotal * 0.075; // Nigerian standard VAT (7.5%)
  const grandTotal = subtotal + tax;
  const depositAmount = 50.00;
  const amountToCharge = paymentChoice === 'deposit' ? depositAmount : grandTotal;

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    );
  };

  const handleFinalizeBooking = async () => {
    if (!selectedService) return;

    setIsEncrypting(true);
    try {
      // 1. Encrypt sensitive customer privacy fields (Driver License, Full VIN, Tax ID)
      const encryptedVault = await encryptSensitiveData({
        fullVin: vehicleVin,
        driverLicenseNumber: custDriverLicense,
        taxIdOrSSN: custTaxId,
        emergencyContact: custPhone
      });

      const customerRecord: CustomerRecord = {
        id: `cust-${Date.now().toString().slice(-4)}`,
        name: custName,
        email: custEmail,
        phone: custPhone,
        address: custAddress,
        vehicleInfo: `${vehicleYear} ${vehicleMake} ${vehicleModel} (${vehicleVin.slice(-6)})`,
        totalSpent: grandTotal,
        loyaltyPoints: Math.floor(grandTotal / 5),
        tier: grandTotal > 500 ? 'Platinum' : 'Gold',
        createdAt: new Date().toISOString().split('T')[0],
        encryptedVault
      };

      // 2. Open Secure Payment Gateway for Deposit or Full Service
      openPaymentGateway({
        amount: amountToCharge,
        title: `${selectedService.name} Booking`,
        description: `${paymentChoice === 'deposit' ? 'Reservation Deposit' : 'Full Payment'} for ${vehicleYear} ${vehicleMake} ${vehicleModel}`,
        customerName: custName,
        customerEmail: custEmail,
        items: [
          { name: `${selectedService.name} — ${vehicleYear} ${vehicleMake} ${vehicleModel}`, quantity: 1, price: amountToCharge }
        ],
        onSuccess: (txnId) => {
          const newAppointment: Appointment = {
            id: `apt-${Date.now().toString().slice(-4)}`,
            customerId: customerRecord.id,
            customerName: custName,
            customerPhone: custPhone,
            customerEmail: custEmail,
            vehicleYear,
            vehicleMake,
            vehicleModel,
            vehiclePlate,
            vin: vehicleVin,
            serviceId: selectedService.id,
            serviceName: selectedService.name,
            additionalServices: selectedAddons.map(id => SERVICE_ADDONS.find(a => a.id === id)?.name || id),
            assignedTechnician: selectedTech,
            scheduledDate: bookingDate,
            scheduledTime: bookingTime,
            status: 'confirmed',
            customerNotes,
            totalCost: grandTotal,
            depositAmount: paymentChoice === 'deposit' ? depositAmount : grandTotal,
            paymentStatus: paymentChoice === 'deposit' ? 'deposit_paid' : 'paid',
            paymentTransactionId: txnId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          onAppointmentBooked(newAppointment, customerRecord);
          setBookingCompleted(newAppointment);
        }
      });
    } catch (err) {
      console.error('Privacy encryption or booking error:', err);
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <section id="services-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-600/30 text-red-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Wrench className="w-3.5 h-3.5" />
          <span>Transparent Pricing &amp; Factory Master Technicians</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
          SERVICE PRICING &amp; ONLINE BOOKING
        </h2>
        <p className="mt-3 text-zinc-400 text-sm sm:text-base">
          All service packages include our comprehensive 25-point digital health inspection, OEM factory diagnostic scan, and encrypted warranty documentation.
        </p>
      </div>

      {/* Category Filter Pills and Currency Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
        <div className="flex items-center flex-wrap gap-2 justify-center sm:justify-start">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold capitalize transition-all ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 ring-1 ring-red-400'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0 bg-zinc-900/80 border border-zinc-800 p-1.5 rounded-xl">
          <span className="text-[11px] font-mono text-zinc-400 px-1 hidden md:inline">All prices in Naira (₦)</span>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className={`relative rounded-2xl bg-zinc-900/90 border flex flex-col justify-between overflow-hidden transition-all duration-200 hover:scale-[1.02] ${
              service.popular 
                ? 'border-red-600/60 shadow-xl shadow-red-900/20' 
                : 'border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {service.popular && (
              <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                Popular Choice
              </div>
            )}

            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-red-600/15 text-red-500 flex items-center justify-center shrink-0">
                  {(() => {
                    const Icon = SERVICE_ICONS[service.id] || Wrench;
                    return <Icon className="w-5 h-5" />;
                  })()}
                </div>
                <span className="flex items-center text-[11px] text-zinc-400 gap-1 font-mono">
                  <Clock className="w-3 h-3 text-zinc-500" />
                  ~{service.durationMinutes} min
                </span>
              </div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-950/40 px-2 py-0.5 rounded-md border border-red-900/40 mb-3">
                {service.category}
              </span>

              <h3 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
                {service.name}
              </h3>

              <p className="text-zinc-400 text-xs leading-relaxed mb-5 line-clamp-2">
                {service.description}
              </p>

              <div className="text-[11px] text-zinc-400 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80 mb-5 font-mono">
                <span className="text-zinc-500 block">Recommended:</span>
                <span className="text-zinc-300 font-semibold">{service.recommendedMileage}</span>
              </div>

              <div className="space-y-2 mb-6">
                <p className="text-xs font-semibold text-zinc-300">Package Includes:</p>
                {service.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-zinc-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-6 pt-0 border-t border-zinc-800/80 mt-auto bg-zinc-950/30">
              <div className="flex items-baseline justify-between pt-4 mb-4">
                <div>
                  <span className="text-[11px] text-zinc-400">Starting from</span>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">
                    {formatPrice(service.price)}
                  </div>
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 shrink-0" /> <span className="hidden sm:inline">ASE Certified</span><span className="sm:hidden">ASE</span>
                </div>
              </div>

              <button
                id={`book-service-${service.id}`}
                onClick={() => handleOpenBooking(service)}
                className="w-full py-2.5 sm:py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-wide transition-all shadow-md shadow-red-700/20 flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Book Service Now</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Multi-Step Online Booking Modal */}
      {bookingModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-4 sm:p-8 text-zinc-100 my-4 sm:my-8 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5 sm:mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
                    Step {step} of 4
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white font-mono">
                    {bookingCompleted ? 'Service Confirmed!' : 'Online Service Booking'}
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {selectedService.name} • {formatPrice(selectedService.price)}
                </p>
              </div>

              <button
                onClick={() => setBookingModalOpen(false)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If booking completed successfully */}
            {bookingCompleted ? (
              <div className="text-center py-6 space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>

                <div>
                  <h4 className="text-2xl font-black text-white font-mono">
                    APPOINTMENT SECURED
                  </h4>
                  <p className="text-sm text-zinc-400 mt-1">
                    Booking #{bookingCompleted.id.toUpperCase()} has been confirmed.
                  </p>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 text-left space-y-3 font-mono text-xs">
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-zinc-400">Vehicle:</span>
                    <span className="text-white font-bold">{bookingCompleted.vehicleYear} {bookingCompleted.vehicleMake} {bookingCompleted.vehicleModel}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-zinc-400">Scheduled Time:</span>
                    <span className="text-emerald-400 font-bold">{bookingCompleted.scheduledDate} at {bookingCompleted.scheduledTime}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-zinc-400">Assigned Master Tech:</span>
                    <span className="text-white font-bold">{bookingCompleted.assignedTechnician}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-zinc-400">Payment Status:</span>
                    <span className="text-emerald-400 font-bold">
                      {bookingCompleted.paymentStatus === 'deposit_paid' ? `Deposit Paid (${formatPrice(bookingCompleted.depositAmount)})` : `Fully Paid (${formatPrice(bookingCompleted.totalCost)})`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Privacy Encryption:</span>
                    <span className="text-cyan-400 font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> 256-Bit Encrypted
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setBookingModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                  >
                    Done &amp; View in Garage
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* STEP 1: Vehicle & Add-ons */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                        <Car className="w-4 h-4 text-red-500" />
                        Vehicle Identification
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Year</label>
                          <input
                            type="number"
                            value={vehicleYear}
                            onChange={(e) => setVehicleYear(parseInt(e.target.value) || 2024)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Make</label>
                          <input
                            type="text"
                            value={vehicleMake}
                            onChange={(e) => setVehicleMake(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Model</label>
                          <input
                            type="text"
                            value={vehicleModel}
                            onChange={(e) => setVehicleModel(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">License Plate</label>
                          <input
                            type="text"
                            value={vehiclePlate}
                            onChange={(e) => setVehiclePlate(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1 flex items-center justify-between">
                            <span>Vehicle VIN (17 digits)</span>
                            <span className="text-[10px] text-cyan-400 flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5" /> Encrypted
                            </span>
                          </label>
                          <input
                            type="text"
                            value={vehicleVin}
                            onChange={(e) => setVehicleVin(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Recommended Add-ons */}
                    <div className="border-t border-zinc-800 pt-5">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        Recommended Maintenance Add-Ons
                      </h4>

                      <div className="space-y-2">
                        {SERVICE_ADDONS.map((addon) => (
                          <label
                            key={addon.id}
                            onClick={() => toggleAddon(addon.id)}
                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                              selectedAddons.includes(addon.id)
                                ? 'bg-red-950/30 border-red-500 text-white'
                                : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedAddons.includes(addon.id)}
                                onChange={() => {}}
                                className="w-4 h-4 accent-red-600 rounded"
                              />
                              <span className="text-xs font-medium">{addon.name}</span>
                            </div>
                            <span className="text-xs font-mono font-bold text-red-400">
                              +{formatPrice(addon.price)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Technician & Date/Time */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mb-3 flex items-center gap-2">
                        <User className="w-4 h-4 text-red-500" />
                        Select Dedicated Master Technician
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {technicians.map((tech) => (
                          <div
                            key={tech.id}
                            onClick={() => setSelectedTech(tech.name)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                              selectedTech === tech.name
                                ? 'bg-red-950/40 border-red-500 ring-1 ring-red-500'
                                : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                            }`}
                          >
                            <img
                              src={tech.avatar}
                              alt={tech.name}
                              className="w-12 h-12 rounded-full object-cover border border-zinc-700"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">{tech.name}</span>
                                <span className="text-[10px] text-amber-400 font-mono">★ {tech.rating}</span>
                              </div>
                              <p className="text-[11px] text-zinc-400">{tech.specialty}</p>
                              <span className="text-[10px] text-emerald-400 font-semibold">
                                {tech.experienceYears} yrs experience
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Schedule Date and Slot */}
                    <div className="border-t border-zinc-800 pt-5">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-red-500" />
                        Choose Appointment Date &amp; Slot
                      </h4>

                      <div className="mb-4">
                        <label className="block text-xs text-zinc-400 mb-1">Service Date</label>
                        <input
                          type="date"
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-zinc-400 mb-2">Available Bay Time Slots</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {TIME_SLOTS.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setBookingTime(slot)}
                              className={`py-2 px-3 rounded-lg text-xs font-mono font-semibold transition-all ${
                                bookingTime === slot
                                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                                  : 'bg-zinc-950 text-zinc-300 border border-zinc-800 hover:border-zinc-700'
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Customer Details & Data Privacy Encryption */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-red-500" />
                          Customer Contact &amp; Privacy Vault
                        </h4>
                        <span className="text-[11px] text-cyan-400 flex items-center gap-1 font-mono">
                          <Lock className="w-3 h-3" /> AES-GCM 256 Encrypted
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Full Legal Name</label>
                          <input
                            type="text"
                            value={custName}
                            onChange={(e) => setCustName(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Phone Number (SMS Push)</label>
                          <input
                            type="text"
                            value={custPhone}
                            onChange={(e) => setCustPhone(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Email Address</label>
                          <input
                            type="email"
                            value={custEmail}
                            onChange={(e) => setCustEmail(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Service Address</label>
                          <input
                            type="text"
                            value={custAddress}
                            onChange={(e) => setCustAddress(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                          />
                        </div>
                      </div>

                      {/* Encrypted Privacy Protected Fields */}
                      <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
                        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
                          <Lock className="w-3.5 h-3.5" />
                          <span>NDPR-Compliant Privacy Encryption</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          Your Driver&apos;s License, Tax ID, and vehicle VIN are automatically encrypted client-side using 256-bit AES-GCM prior to storage.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-[11px] text-cyan-300 mb-1">Driver&apos;s License #</label>
                            <input
                              type="text"
                              value={custDriverLicense}
                              onChange={(e) => setCustDriverLicense(e.target.value)}
                              className="w-full bg-zinc-950 border border-cyan-500/40 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-cyan-300 mb-1">Tax ID / SSN Last 4</label>
                            <input
                              type="text"
                              value={custTaxId}
                              onChange={(e) => setCustTaxId(e.target.value)}
                              className="w-full bg-zinc-950 border border-cyan-500/40 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-xs text-zinc-400 mb-1">Customer Notes for Technician</label>
                        <textarea
                          rows={2}
                          value={customerNotes}
                          onChange={(e) => setCustomerNotes(e.target.value)}
                          placeholder="Describe any symptoms, squeaks, vibrations, or recent modifications..."
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Review & Payment Selection */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3 font-mono text-xs">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-sans border-b border-zinc-800 pb-2">
                        Booking Summary Breakdown
                      </h4>

                      <div className="flex justify-between">
                        <span className="text-zinc-400">{selectedService.name}</span>
                        <span className="text-white">{formatPrice(basePrice)}</span>
                      </div>

                      {selectedAddons.map(id => {
                        const addon = SERVICE_ADDONS.find(a => a.id === id);
                        return (
                          <div key={id} className="flex justify-between text-zinc-400">
                            <span>+ {addon?.name}</span>
                            <span>{formatPrice(addon?.price || 0)}</span>
                          </div>
                        );
                      })}

                      <div className="flex justify-between text-zinc-400 border-t border-zinc-800 pt-2">
                        <span>VAT (7.5%)</span>
                        <span>{formatPrice(tax)}</span>
                      </div>

                      <div className="flex justify-between text-white font-bold text-sm border-t border-zinc-800 pt-2">
                        <span>Total Service Estimate</span>
                        <span className="text-red-400 font-mono">{formatPrice(grandTotal)}</span>
                      </div>
                    </div>

                    {/* Payment Strategy Choice */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                        Payment Option
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div
                          onClick={() => setPaymentChoice('deposit')}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            paymentChoice === 'deposit'
                              ? 'bg-red-950/40 border-red-500 ring-1 ring-red-500'
                              : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">Hold with {formatPrice(50)} Deposit</span>
                            <span className="text-xs font-mono font-bold text-emerald-400">{formatPrice(50)}</span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-1">
                            Pay remaining {formatPrice(grandTotal - 50)} upon vehicle pickup.
                          </p>
                        </div>

                        <div
                          onClick={() => setPaymentChoice('full')}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            paymentChoice === 'full'
                              ? 'bg-red-950/40 border-red-500 ring-1 ring-red-500'
                              : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">Pre-Pay Full Service</span>
                            <span className="text-xs font-mono font-bold text-emerald-400">{formatPrice(grandTotal)}</span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-1">
                            Expedited express key drop-off &amp; contactless pickup.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Navigation Buttons */}
                <div className="flex items-center justify-between border-t border-zinc-800 pt-5 mt-6">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                  ) : <div />}

                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={() => setStep(step + 1)}
                      className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-700/30"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isEncrypting}
                      onClick={handleFinalizeBooking}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-700/30 disabled:opacity-50"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>{isEncrypting ? 'Encrypting Vault...' : `Proceed to Pay ${formatPrice(amountToCharge)}`}</span>
                    </button>
                  )}
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </section>
  );
};
