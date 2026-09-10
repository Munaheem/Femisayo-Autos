import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Check, 
  AlertCircle, 
  Plus, 
  CheckCircle2, 
  Eye, 
  Disc, 
  Zap, 
  Layers, 
  Flame, 
  CircleDot,
  Heart,
  Activity,
  Cog,
  Thermometer,
  Tag
} from 'lucide-react';
import { PartCategory, PartItem } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { partImages } from '../utils/images';
import ImageGalleryViewer from './ImageGalleryViewer';

interface PartsStoreProps {
  parts: PartItem[];
  onAddToCart: (part: PartItem) => void;
  selectedVehicleFitment: { year: string; make: string; model: string } | null;
  onOpenCart: () => void;
  wishlistedIds: string[];
  onToggleWishlist: (part: PartItem) => void;
}

export const PartsStore: React.FC<PartsStoreProps> = ({
  parts,
  onAddToCart,
  selectedVehicleFitment,
  onOpenCart,
  wishlistedIds,
  onToggleWishlist
}) => {
  const { formatPrice } = useCurrency();
  const [selectedCategory, setSelectedCategory] = useState<PartCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [quickViewPart, setQuickViewPart] = useState<PartItem | null>(null);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  // Scroll lock while the quick-view modal is open
  React.useEffect(() => {
    if (quickViewPart) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [quickViewPart]);

  const categoryCards = [
    { id: 'engine' as PartCategory, label: 'Engine Parts', icon: Flame, count: '320+ items' },
    { id: 'brakes' as PartCategory, label: 'Brakes', icon: Disc, count: '180+ items' },
    { id: 'suspension' as PartCategory, label: 'Suspension', icon: Activity, count: '140+ items' },
    { id: 'electrical' as PartCategory, label: 'Electrical', icon: Zap, count: '110+ items' },
    { id: 'transmission' as PartCategory, label: 'Transmission', icon: Cog, count: '60+ items' },
    { id: 'cooling' as PartCategory, label: 'Cooling System', icon: Thermometer, count: '75+ items' },
    { id: 'filters' as PartCategory, label: 'Filters', icon: Layers, count: '120+ items' },
    { id: 'wheels' as PartCategory, label: 'Wheels & Tyres', icon: CircleDot, count: '95+ items' },
    { id: 'accessories' as PartCategory, label: 'Accessories', icon: ShoppingBag, count: '300+ items' }
  ];

  const handleAddToCartWithToast = (part: PartItem) => {
    onAddToCart(part);
    setAddedToast(`Added ${part.name} to cart!`);
    setTimeout(() => setAddedToast(null), 2500);
  };

  const filteredParts = parts.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.partNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const checkFitment = (part: PartItem) => {
    if (!selectedVehicleFitment) return null;
    const makeMatches = part.fitmentMakes.some(m => 
      m === 'All Makes' || m === 'Universal Fit' || m.toLowerCase() === selectedVehicleFitment.make.toLowerCase()
    );
    return makeMatches;
  };

  return (
    <section id="parts-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Toast Feedback */}
      {addedToast && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-auto z-50 bg-red-600 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="truncate">{addedToast}</span>
          <button 
            onClick={onOpenCart} 
            className="ml-1 sm:ml-2 underline text-white hover:text-zinc-200 shrink-0"
          >
            View Cart
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-600/30 text-red-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Genuine Spare Parts &amp; Premium Car Accessories</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-mono">
          SHOP BY CATEGORY
        </h2>
        <p className="mt-3 text-zinc-400 text-sm sm:text-base">
          Full-service automotive parts store — OEM engine, brakes, suspension, electrical, transmission &amp; cooling parts, plus tyres, wheels and accessories. Guaranteed fitment with factory warranty.
        </p>
      </div>

      {/* Shop By Category Circular Icons (Directly from Reference Image 1) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3 sm:gap-4 mb-10">
        {categoryCards.map((c) => {
          const IconComponent = c.icon;
          const isSelected = selectedCategory === c.id;

          return (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`p-3 sm:p-4 rounded-2xl border flex flex-col items-center justify-center text-center transition-all duration-200 group ${
                isSelected
                  ? 'bg-red-600 border-red-500 text-white shadow-xl shadow-red-900/30 ring-2 ring-red-400'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white hover:border-zinc-700'
              }`}
            >
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110 ${
                isSelected ? 'bg-white/20 text-white' : 'bg-zinc-800 text-red-400'
              }`}>
                <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold font-mono tracking-tight uppercase">
                {c.label}
              </span>
              <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-red-100' : 'text-zinc-400'}`}>
                {c.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Vehicle Fitment Alert Banner */}
      {selectedVehicleFitment ? (
        <div className="bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-900 border border-red-500/30 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Filtering catalog for selected vehicle:</p>
              <h4 className="text-sm font-bold text-white">
                {selectedVehicleFitment.year} {selectedVehicleFitment.make} {selectedVehicleFitment.model}
              </h4>
            </div>
          </div>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-mono">
            Guaranteed Fitment Active
          </span>
        </div>
      ) : (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-3.5 sm:p-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-zinc-400">
          <span>Select your vehicle make and model above to enable guaranteed fitment verification.</span>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-red-400 hover:text-red-300 font-semibold whitespace-nowrap"
          >
            Select Vehicle ↑
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg font-black text-white font-mono uppercase">
            {selectedCategory === 'all'
              ? 'Best Sellers & Full Catalog'
              : selectedCategory === 'accessories'
                ? 'Car Accessories'
                : `${selectedCategory} Parts`}
          </span>
          <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-mono">
            {filteredParts.length}
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by part name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
          </div>

          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 whitespace-nowrap"
            >
              Show All
            </button>
          )}
        </div>
      </div>

      {/* Parts Grid (Car card style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredParts.map((part) => {
          const fits = checkFitment(part);

          return (
            <div
              key={part.id}
              onClick={() => setQuickViewPart(part)}
              className="group rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden flex flex-col justify-between hover:border-zinc-700 transition-all duration-200 hover:shadow-2xl hover:shadow-red-950/20 cursor-pointer"
            >
              <div>
                {/* Part Image Container */}
                <div className="relative h-56 w-full bg-zinc-950 overflow-hidden">
                  <img
                    src={part.image}
                    alt={part.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Badge */}
                  {part.badge && (
                    <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-red-400 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border border-red-500/30 tracking-wider">
                      {part.badge}
                    </span>
                  )}

                  {/* Wishlist heart button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleWishlist(part); }}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border transition-colors ${
                      wishlistedIds.includes(part.id)
                        ? 'bg-red-600 text-white border-red-500'
                        : 'bg-black/60 text-zinc-300 border-white/10 hover:text-white'
                    }`}
                    title={wishlistedIds.includes(part.id) ? 'Remove from wishlist' : 'Save to wishlist'}
                  >
                    <Heart className={`w-4 h-4 ${wishlistedIds.includes(part.id) ? 'fill-current' : ''}`} />
                  </button>

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />

                  {/* Price tag in image */}
                  <div className="absolute bottom-3 left-3 font-mono">
                    <span className="text-2xl font-black text-white">
                      {formatPrice(part.price)}
                    </span>
                    {part.originalPrice > part.price && (
                      <span className="text-[11px] text-zinc-400 line-through block">
                        {formatPrice(part.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Part Details */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-red-400 transition-colors line-clamp-1">
                    {part.name}
                  </h3>

                  <p className="text-xs text-zinc-400 mb-4 line-clamp-1">
                    {part.brand} • Part #{part.partNumber}
                  </p>

                  {/* Spec Chips */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-xl bg-zinc-950 border border-zinc-800/80 mb-4 text-center font-mono text-xs">
                    <div>
                      <span className="text-zinc-500 text-[10px] block uppercase">Rating</span>
                      <span className="text-white font-bold">★ {part.rating.toFixed(1)}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[10px] block uppercase">Reviews</span>
                      <span className="text-red-400 font-bold">{part.reviewsCount}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[10px] block uppercase">Stock</span>
                      <span className="text-emerald-400 font-bold">{part.inStock} pcs</span>
                    </div>
                  </div>

                  {/* Fitment / category meta row */}
                  <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                    {fits !== null ? (
                      fits ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          Fits your vehicle
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-zinc-500" />
                          Check fitment
                        </span>
                      )
                    ) : (
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-zinc-500" />
                        {part.brand}
                      </span>
                    )}
                    <span className="flex items-center gap-1 uppercase tracking-wider">
                      <Cog className="w-3.5 h-3.5 text-zinc-500" />
                      {part.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 sm:p-5 pt-0 border-t border-zinc-800/60 grid grid-cols-2 gap-2 mt-auto">
                <button
                  onClick={() => setQuickViewPart(part)}
                  className="py-2.5 sm:py-3 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Specs</span>
                </button>

                <button
                  id={`add-to-cart-${part.id}`}
                  onClick={(e) => { e.stopPropagation(); handleAddToCartWithToast(part); }}
                  className="py-2.5 sm:py-3 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all shadow-md shadow-red-700/20 flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Promotional Split Banner (Directly from Reference Image 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-10 sm:mt-14">
        
        {/* Deal 1: 15% Off */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-red-950 via-zinc-900 to-black p-6 sm:p-8 border border-red-600/30 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-black uppercase text-red-400 tracking-widest">
              LIMITED TIME OFFER
            </span>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-mono mt-1">
              UP TO 15% OFF
            </h3>
            <p className="text-xs text-zinc-300 mt-2 max-w-sm">
              Use promo coupon <strong className="text-red-400 font-mono">DRIVE10</strong> during checkout on all drilled rotors, cold air intakes, and ceramic kits.
            </p>
          </div>
          <div className="mt-4 sm:mt-6">
            <button
              onClick={() => setSelectedCategory('brakes')}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-wider shadow-lg shadow-red-700/40"
            >
              SHOP BRAKE DEALS
            </button>
          </div>
        </div>

        {/* Deal 2: Top Brands Trusted Quality */}
        <div className="relative rounded-3xl overflow-hidden bg-zinc-900/90 p-6 sm:p-8 border border-zinc-800 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-black uppercase text-zinc-400 tracking-widest">
              TOP BRANDS. TRUSTED QUALITY.
            </span>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-mono mt-1">
              PARTS THAT <span className="text-red-500">PERFORM</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-2 max-w-sm">
              Direct factory distributor partnerships with certified lifetime guarantees.
            </p>
          </div>

          <div className="mt-4 sm:mt-6 flex items-center flex-wrap gap-2 sm:gap-4 font-black font-mono text-xs sm:text-sm text-zinc-400 tracking-wider">
            <span className="text-white">BOSCH</span>
            <span className="text-zinc-600">•</span>
            <span className="text-white">BREMBO</span>
            <span className="text-zinc-600">•</span>
            <span className="text-white">BILSTEIN</span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span className="text-white hidden sm:inline">FLOWMASTER</span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span className="text-white hidden sm:inline">NGK</span>
          </div>
        </div>

      </div>

      {/* Quick View Spec Modal */}
      {quickViewPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-4 sm:p-6 text-zinc-100 my-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setQuickViewPart(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
            >
              ✕
            </button>

            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
                    Part #{quickViewPart.partNumber}
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {quickViewPart.inStock} units in stock
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white font-mono">
                  {quickViewPart.name}
                </h3>
                <span className="text-xs font-bold text-red-500 uppercase tracking-wider">
                  {quickViewPart.brand}
                </span>
                <p className="text-2xl font-black text-red-500 font-mono mt-1">
                  {formatPrice(quickViewPart.price)}
                  {quickViewPart.originalPrice > quickViewPart.price && (
                    <span className="text-sm text-zinc-500 line-through ml-2 font-mono">
                      {formatPrice(quickViewPart.originalPrice)}
                    </span>
                  )}
                </p>
              </div>

              {/* Big Gallery Image */}
              <ImageGalleryViewer
                images={partImages(quickViewPart)}
                alt={quickViewPart.name}
                containerClassName="h-64 sm:h-80 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950"
              />

              <p className="text-xs text-zinc-300 leading-relaxed">
                {quickViewPart.description}
              </p>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs text-zinc-400 space-y-1">
                <div className="flex justify-between">
                  <span>Fitment Makes:</span>
                  <span className="text-white font-bold">{quickViewPart.fitmentMakes.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Model Years:</span>
                  <span className="text-white font-bold">{quickViewPart.fitmentYears}</span>
                </div>
                <div className="flex justify-between">
                  <span>Inventory Available:</span>
                  <span className="text-emerald-400 font-bold">{quickViewPart.inStock} units</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer Rating:</span>
                  <span className="text-white font-bold">★ {quickViewPart.rating.toFixed(1)} ({quickViewPart.reviewsCount} reviews)</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <button
                  onClick={() => setQuickViewPart(null)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-zinc-800 text-xs font-semibold text-center"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleAddToCartWithToast(quickViewPart);
                    setQuickViewPart(null);
                  }}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs text-center"
                >
                  Add to Cart • {formatPrice(quickViewPart.price)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
