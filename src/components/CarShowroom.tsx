import React, { useState } from 'react';
import { 
  Car, 
  Fuel, 
  Gauge, 
  Zap, 
  ShieldCheck, 
  Bookmark, 
  Search, 
  Check, 
  SlidersHorizontal, 
  Calendar, 
  Calculator, 
  DollarSign, 
  X,
  CreditCard,
  ChevronRight
} from 'lucide-react';
import { VehicleCategory, VehicleItem, PaymentGatewayParams } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { vehicleImages } from '../utils/images';
import ImageGalleryViewer from './ImageGalleryViewer';

interface CarShowroomProps {
  vehicles: VehicleItem[];
  openPaymentGateway: (params: PaymentGatewayParams) => void;
  onBookTestDrive: (vehicle: VehicleItem, date: string, name: string, phone: string) => void;
}

export const CarShowroom: React.FC<CarShowroomProps> = ({
  vehicles,
  openPaymentGateway,
  onBookTestDrive
}) => {
  const { formatPrice, currency } = useCurrency();
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory>('all');
  const [selectedMake, setSelectedMake] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(150000);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookmarkedVehicles, setBookmarkedVehicles] = useState<string[]>([]);
  const [activeVehicleModal, setActiveVehicleModal] = useState<VehicleItem | null>(null);

  // Test drive / reservation sub-modal state
  const [testDriveModalOpen, setTestDriveModalOpen] = useState(false);
  const [testDriveDate, setTestDriveDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [testDriveName, setTestDriveName] = useState('Babajide Adeleke');
  const [testDrivePhone, setTestDrivePhone] = useState('+234 802 317 9860');
  const [testDriveConfirmed, setTestDriveConfirmed] = useState(false);

  // Scroll lock while a vehicle detail modal is open
  React.useEffect(() => {
    if (activeVehicleModal || testDriveModalOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [activeVehicleModal, testDriveModalOpen]);

  // Financing Calculator state
  const [downPayment, setDownPayment] = useState<number>(15000);
  const [loanTermMonths, setLoanTermMonths] = useState<number>(60);
  const [interestRate, setInterestRate] = useState<number>(5.9);

  const categories: { id: VehicleCategory; label: string }[] = [
    { id: 'all', label: 'All Vehicles' },
    { id: 'sports', label: 'Sports Cars' },
    { id: 'sedan', label: 'Sedans' },
    { id: 'suv', label: 'SUVs & AWD' },
    { id: 'luxury', label: 'Luxury & EV' },
    { id: 'hatchback', label: 'Hatchbacks' }
  ];

  const makes = ['all', 'BMW', 'Mercedes-Benz', 'Audi', 'Porsche', 'Land Rover', 'Tesla', 'Toyota', 'Lexus', 'Honda'];

  const toggleBookmark = (id: string) => {
    setBookmarkedVehicles(prev => 
      prev.includes(id) ? prev.filter(vId => vId !== id) : [...prev, id]
    );
  };

  const filteredVehicles = vehicles.filter(v => {
    const matchesCategory = selectedCategory === 'all' || v.bodyType === selectedCategory;
    const matchesMake = selectedMake === 'all' || v.make.toLowerCase() === selectedMake.toLowerCase();
    const matchesPrice = v.price <= maxPrice;
    const matchesSearch = 
      v.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.year.toString().includes(searchQuery);
    return matchesCategory && matchesMake && matchesPrice && matchesSearch;
  });

  // Calculate monthly payment formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1]
  const calculateMonthlyPayment = (vehiclePrice: number) => {
    const principal = Math.max(0, vehiclePrice - downPayment);
    if (principal <= 0) return 0;
    const monthlyRate = (interestRate / 100) / 12;
    const payment = (principal * (monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths))) / (Math.pow(1 + monthlyRate, loanTermMonths) - 1);
    return isNaN(payment) ? 0 : Math.round(payment);
  };

  const handleReserveVehicle = (vehicle: VehicleItem) => {
    openPaymentGateway({
      amount: 500.00,
      title: `Vehicle Reservation Deposit: ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      description: `48-hour exclusive purchase hold & priority test drive delivery for VIN ${vehicle.vin}`,
      items: [
        { name: `${vehicle.year} ${vehicle.make} ${vehicle.model} — Refundable Reservation Deposit`, quantity: 1, price: 500.00 }
      ],
      onSuccess: (txnId) => {
        alert(`Reservation Confirmed! ${formatPrice(500)} deposit placed under transaction #${txnId}. Our sales concierge will contact you within 15 minutes.`);
        setActiveVehicleModal(null);
      }
    });
  };

  const handleConfirmTestDrive = (vehicle: VehicleItem) => {
    onBookTestDrive(vehicle, testDriveDate, testDriveName, testDrivePhone);
    setTestDriveConfirmed(true);
    setTimeout(() => {
      setTestDriveConfirmed(false);
      setTestDriveModalOpen(false);
    }, 2200);
  };

  return (
    <section id="car-showroom-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header Banner (Matching Reference Image 2) */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-600/30 text-red-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Car className="w-3.5 h-3.5" />
          <span>Femisayo Autos Certified Pre-Owned &amp; Verified Vehicle Sales • Lekki, Lagos</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-mono">
          FIND THE PERFECT CAR FOR YOU
        </h2>
        <p className="mt-3 text-zinc-400 text-sm sm:text-base">
          Explore our hand-curated collection of verified performance, luxury, and everyday track machines with complete mechanical inspection logs.
        </p>
      </div>

      {/* Filter Bar (Matching Reference Images 2 & 3) */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-6 mb-8 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          
          {/* Keyword Search */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Search Vehicles</label>
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search M4, Carrera, AMG..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Make Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Manufacturer Brand</label>
            <select
              value={selectedMake}
              onChange={(e) => setSelectedMake(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
            >
              {makes.map(m => (
                <option key={m} value={m}>
                  {m === 'all' ? 'All Brands' : m}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 mb-1.5">
              <span>Max Budget</span>
              <span className="text-white font-mono font-bold">{formatPrice(maxPrice)}</span>
            </div>
            <input
              type="range"
              min={30000}
              max={150000}
              step={5000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full accent-red-600 bg-zinc-950 cursor-pointer"
            />
          </div>

          {/* Reset Filters & Currency */}
          <div className="flex items-end justify-between sm:justify-end gap-2 pt-1">
            <span className="text-xs text-zinc-400 font-mono">
              <strong className="text-white">{filteredVehicles.length}</strong> available
            </span>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedMake('all');
                setMaxPrice(150000);
                setSearchQuery('');
              }}
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 transition-colors"
            >
              Reset Filters
            </button>
          </div>

        </div>

        {/* Category Tabs & Currency Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-5 mt-4 border-t border-zinc-800/80">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-red-600 text-white shadow-md shadow-red-700/30'
                    : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            <span className="text-[11px] font-mono text-zinc-400 hidden lg:inline">All prices in Naira (₦)</span>
          </div>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => {
          const isBookmarked = bookmarkedVehicles.includes(vehicle.id);
          const estMonthly = calculateMonthlyPayment(vehicle.price);

          return (
            <div
              key={vehicle.id}
              onClick={() => setActiveVehicleModal(vehicle)}
              className="group rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden flex flex-col justify-between hover:border-zinc-700 transition-all duration-200 hover:shadow-2xl hover:shadow-red-950/20 cursor-pointer"
            >
              <div>
                {/* Vehicle Image Container */}
                <div className="relative h-56 w-full overflow-hidden bg-zinc-950">
                  <img
                    src={vehicle.image}
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {vehicle.badges.slice(0, 2).map((badge, i) => (
                      <span
                        key={i}
                        className="bg-black/80 backdrop-blur-md text-red-400 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border border-red-500/30 tracking-wider"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>

                  {/* Bookmark Heart Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleBookmark(vehicle.id); }}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border transition-colors ${
                      isBookmarked
                        ? 'bg-red-600 text-white border-red-500'
                        : 'bg-black/60 text-zinc-300 border-white/10 hover:text-white'
                    }`}
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />

                  {/* Price Tag in Image */}
                  <div className="absolute bottom-3 left-3 font-mono">
                    <span className="text-2xl font-black text-white">
                      {formatPrice(vehicle.price)}
                    </span>
                    <span className="text-[11px] text-zinc-400 block">
                      est. {formatPrice(estMonthly)}/mo with {formatPrice(downPayment, { compact: true })} down
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-red-400 transition-colors">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>

                  <p className="text-xs text-zinc-400 mb-4 line-clamp-1">
                    {vehicle.engine}
                  </p>

                  {/* Spec Chips */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-xl bg-zinc-950 border border-zinc-800/80 mb-4 text-center font-mono text-xs">
                    <div>
                      <span className="text-zinc-500 text-[10px] block uppercase">Power</span>
                      <span className="text-white font-bold">{vehicle.horsepower} HP</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[10px] block uppercase">0-60 MPH</span>
                      <span className="text-red-400 font-bold">{vehicle.zeroToSixty}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[10px] block uppercase">Mileage</span>
                      <span className="text-zinc-300 font-bold">{Math.round(vehicle.mileage * 1.609)} km</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                    <span className="flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-zinc-500" />
                      {vehicle.transmission}
                    </span>
                    <span className="flex items-center gap-1">
                      <Fuel className="w-3.5 h-3.5 text-zinc-500" />
                      {vehicle.fuel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 sm:p-5 pt-0 border-t border-zinc-800/60 grid grid-cols-2 gap-2 mt-auto">
                <button
                  id={`view-details-${vehicle.id}`}
                  onClick={() => setActiveVehicleModal(vehicle)}
                  className="py-2.5 sm:py-3 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1"
                >
                  <span>Specs &amp; Details</span>
                </button>

                <button
                  id={`test-drive-${vehicle.id}`}
                  onClick={() => {
                    setActiveVehicleModal(vehicle);
                    setTestDriveModalOpen(true);
                  }}
                  className="py-2.5 sm:py-3 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all shadow-md shadow-red-700/20 flex items-center justify-center gap-1"
                >
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>Book Test Drive</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vehicle Full Details & Finance Modal */}
      {activeVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-4 sm:p-8 text-zinc-100 my-4 sm:my-8 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Close */}
            <button
              onClick={() => {
                setActiveVehicleModal(null);
                setTestDriveModalOpen(false);
              }}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* If test drive submodal is active */}
            {testDriveModalOpen ? (
              <div className="space-y-6">
                <div className="border-b border-zinc-800 pb-4">
                  <h3 className="text-xl font-black text-white font-mono">
                    VIP Test Drive Booking
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    {activeVehicleModal.year} {activeVehicleModal.make} {activeVehicleModal.model}
                  </p>
                </div>

                {testDriveConfirmed ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
                      <Check className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-black text-white font-mono">TEST DRIVE SCHEDULED!</h4>
                    <p className="text-xs text-zinc-400">
                      We have reserved your test drive for {testDriveDate}. Our client advisor will have the vehicle detailed and ready at the Apex showroom.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">Full Legal Name</label>
                        <input
                          type="text"
                          value={testDriveName}
                          onChange={(e) => setTestDriveName(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">Mobile Phone for SMS Confirmation</label>
                        <input
                          type="text"
                          value={testDrivePhone}
                          onChange={(e) => setTestDrivePhone(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Preferred Date</label>
                      <input
                        type="date"
                        value={testDriveDate}
                        onChange={(e) => setTestDriveDate(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-400 space-y-1">
                      <p className="font-semibold text-zinc-200">Requirements for Test Drive:</p>
                      <p>• Valid Driver&apos;s License (must be 21+ for M / RS / AMG / Porsche models)</p>
                      <p>• Proof of active auto insurance policy</p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <button
                        onClick={() => setTestDriveModalOpen(false)}
                        className="px-4 py-2 rounded-xl bg-zinc-800 text-xs text-zinc-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleConfirmTestDrive(activeVehicleModal)}
                        className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-md shadow-red-700/30"
                      >
                        Confirm VIP Test Drive
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Vehicle Technical Inspection & Finance Breakdown */
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
                      VIN: {activeVehicleModal.vin}
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> 150-Point Inspection Passed
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white font-mono">
                    {activeVehicleModal.year} {activeVehicleModal.make} {activeVehicleModal.model}
                  </h3>
                  <p className="text-2xl font-black text-red-500 font-mono mt-1">
                    {formatPrice(activeVehicleModal.price)}
                  </p>
                </div>

                {/* Gallery: Hero Modal Image + clickable thumbnails */}
                <ImageGalleryViewer
                  images={vehicleImages(activeVehicleModal)}
                  alt={activeVehicleModal.model}
                  containerClassName="h-64 sm:h-80 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950"
                />

                {/* Specs Table */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                    Factory Technical Specifications
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
                    <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px]">Horsepower</span>
                      <span className="text-white font-bold">{activeVehicleModal.horsepower} HP</span>
                    </div>
                    <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px]">0-60 Time</span>
                      <span className="text-red-400 font-bold">{activeVehicleModal.zeroToSixty}</span>
                    </div>
                    <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px]">Transmission</span>
                      <span className="text-white font-bold">{activeVehicleModal.transmission}</span>
                    </div>
                    <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px]">Odometer</span>
                      <span className="text-white font-bold">{Math.round(activeVehicleModal.mileage * 1.609)} km</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Finance Payment Calculator */}
                <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-red-500" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                        Estimated Auto Loan Payment
                      </h4>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-xl font-black text-emerald-400">
                        {formatPrice(calculateMonthlyPayment(activeVehicleModal.price))}
                      </span>
                      <span className="text-[11px] text-zinc-500"> / month</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-zinc-400 text-[11px] mb-1">
                        Down Payment: {formatPrice(downPayment)}
                      </label>
                      <input
                        type="range"
                        min={5000}
                        max={activeVehicleModal.price * 0.7}
                        step={1000}
                        value={downPayment}
                        onChange={(e) => setDownPayment(parseInt(e.target.value))}
                        className="w-full accent-red-600 bg-zinc-900"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 text-[11px] mb-1">
                        Term: {loanTermMonths} Months
                      </label>
                      <select
                        value={loanTermMonths}
                        onChange={(e) => setLoanTermMonths(parseInt(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white"
                      >
                        <option value={36}>36 Months (3 Years)</option>
                        <option value={48}>48 Months (4 Years)</option>
                        <option value={60}>60 Months (5 Years)</option>
                        <option value={72}>72 Months (6 Years)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-400 text-[11px] mb-1">
                        APR Interest: {interestRate}%
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={interestRate}
                        onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 border-t border-zinc-800">
                  <button
                    onClick={() => setTestDriveModalOpen(true)}
                    className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>Schedule Free Test Drive</span>
                  </button>

                  <button
                    id="reserve-car-deposit-btn"
                    onClick={() => handleReserveVehicle(activeVehicleModal)}
                    className="w-full sm:w-auto px-5 sm:px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-lg shadow-red-700/30 transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4 shrink-0" />
                    <span>Reserve with {formatPrice(500)} Deposit</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </section>
  );
};
