import React, { useState } from 'react';
import { 
  Shield, 
  Truck, 
  Lock, 
  RotateCcw, 
  Headphones, 
  Search, 
  ChevronRight, 
  Check, 
  Wrench, 
  Car, 
  Sparkles,
  Award
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

interface HeroBannerProps {
  onSelectFitment: (fitment: { year: string; make: string; model: string }) => void;
  onBookServiceClick: () => void;
  onExploreCarsClick: () => void;
  onExplorePartsClick: () => void;
}

const YEARS = ['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017'];
const MAKES = ['Toyota', 'Honda', 'Hyundai', 'Kia', 'Nissan', 'Mercedes-Benz', 'Lexus', 'Ford', 'Mitsubishi'];

const MODELS_BY_MAKE: Record<string, string[]> = {
  'Toyota': ['Camry', 'Corolla', 'Hilux', 'RAV4', 'Prado', 'Highlander', 'Land Cruiser'],
  'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'Odyssey'],
  'Hyundai': ['Tucson', 'Sonata', 'Santa Fe', 'Elantra', 'Creta'],
  'Kia': ['Sportage', 'Sorento', 'Sedona', 'Rio', 'K5'],
  'Nissan': ['Sunny', 'Murano', 'Pathfinder', 'Qashqai', 'X-Trail'],
  'Mercedes-Benz': ['C300', 'E260', 'GLE 350', 'GLC 300', 'C200'],
  'Lexus': ['ES 350', 'RX 350', 'GX 460', 'UX 200', 'LX 570'],
  'Ford': ['Ranger', 'Explorer', 'Escape', 'Territory', 'Everest'],
  'Mitsubishi': ['L200', 'Pajero Sport', 'Montero', 'Outlander', 'Lancer']
};

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onSelectFitment,
  onBookServiceClick,
  onExploreCarsClick,
  onExplorePartsClick
}) => {
  const { formatPrice } = useCurrency();
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedMake, setSelectedMake] = useState('Toyota');
  const [selectedModel, setSelectedModel] = useState('Camry');
  const [fitmentApplied, setFitmentApplied] = useState(false);

  const availableModels = MODELS_BY_MAKE[selectedMake] || ['All Models'];

  const handleMakeChange = (make: string) => {
    setSelectedMake(make);
    const models = MODELS_BY_MAKE[make] || [];
    setSelectedModel(models[0] || '');
    setFitmentApplied(false);
  };

  const handleApplyFitment = (destination: 'parts' | 'services') => {
    onSelectFitment({
      year: selectedYear,
      make: selectedMake,
      model: selectedModel
    });
    setFitmentApplied(true);
    if (destination === 'parts') {
      onExplorePartsClick();
    } else {
      onBookServiceClick();
    }
  };

  return (
    <div className="relative w-full bg-[#0a0c10] overflow-hidden border-b border-zinc-800">
      
      {/* Background Hero Image with Radial Gradient Vignette */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/BMW m4 competition.jpg" 
          alt="Performance Vehicle Workshop" 
          className="w-full h-full object-cover object-center opacity-25 filter contrast-125 saturate-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0c10] via-[#0a0c10]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-transparent to-[#0a0c10]/80" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-12 lg:pt-20 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/60 border border-red-600/40 text-red-400 text-xs font-semibold tracking-wider uppercase">
              <Award className="w-3.5 h-3.5" />
              <span>Femisayo Autos • CAC Reg: BN-2641123 • Eti-Osa, Lekki, Lagos</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] uppercase font-mono">
                Expert Auto Repair &amp; <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-red-600">
                  Mechanical Services.
                </span>
              </h1>
              <p className="text-zinc-300 text-sm sm:text-base lg:text-lg max-w-xl font-normal leading-relaxed pt-2">
                Located on Ilasan New Road (behind Emardeb Filling Station) and FemisayoAutos Annex in Ilasan, Lekki. Full automotive diagnostics, mechanical overhauls, car showroom, and genuine parts.
              </p>
              
              {/* Quick Info Bar */}
              <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-zinc-300">
                <span className="bg-zinc-900 border border-zinc-700/80 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-yellow-300 font-semibold text-[11px] sm:text-xs">
                  <span>★ 4.4/5 Rating</span>
                  <span className="text-zinc-400 font-normal hidden sm:inline">(8 Google Reviews)</span>
                </span>
                <span className="bg-zinc-900 border border-zinc-700/80 px-2.5 py-1.5 rounded-lg text-emerald-400 font-semibold text-[11px] sm:text-xs hidden sm:inline">
                  Mon–Sat: 7:00 AM – 7:30 PM
                </span>
                <a 
                  href="tel:+2348023179860" 
                  className="bg-red-600/20 border border-red-500/40 px-2.5 py-1.5 rounded-lg text-red-300 hover:text-white font-mono font-bold text-[11px] sm:text-xs"
                >
                  📞 +234 802 317 9860
                </a>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                id="hero-book-service-btn"
                onClick={onBookServiceClick}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-red-700/40 transition-all flex items-center justify-center gap-2 transform active:scale-95"
              >
                <Wrench className="w-4 h-4" />
                <span>Book Mechanical Service</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>

              <button
                id="hero-view-cars-btn"
                onClick={onExploreCarsClick}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-100 font-bold text-sm tracking-wide border border-zinc-700/80 transition-all flex items-center justify-center gap-2 hover:border-zinc-500"
              >
                <Car className="w-4 h-4 text-red-400" />
                <span>Explore Cars For Sale</span>
              </button>
            </div>

              {/* Fitment Selector Box (Matching Reference Image 1) */}
            <div className="mt-6 sm:mt-8 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-red-500" />
                  Find Parts &amp; Services Guaranteed To Fit Your Vehicle
                </span>
                {fitmentApplied && (
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Filter Active
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Year */}
                <div>
                  <label className="block text-[11px] text-zinc-400 font-medium mb-1">Select Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => { setSelectedYear(e.target.value); setFitmentApplied(false); }}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
                  >
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                {/* Make */}
                <div>
                  <label className="block text-[11px] text-zinc-400 font-medium mb-1">Select Make</label>
                  <select
                    value={selectedMake}
                    onChange={(e) => handleMakeChange(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
                  >
                    {MAKES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                {/* Model */}
                <div>
                  <label className="block text-[11px] text-zinc-400 font-medium mb-1">Select Model</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => { setSelectedModel(e.target.value); setFitmentApplied(false); }}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
                  >
                    {availableModels.map(mod => <option key={mod} value={mod}>{mod}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 mt-4 pt-3 border-t border-zinc-800/80">
                <button
                  onClick={() => handleApplyFitment('services')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors text-center"
                >
                  Book Service For This Vehicle
                </button>
                <button
                  onClick={() => handleApplyFitment('parts')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition-all shadow-md shadow-red-700/30 flex items-center justify-center gap-1.5 text-center"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Find Exact Fit Parts</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Showcase Card with Featured Vehicle & Best Selling Component */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-zinc-700/80 bg-gradient-to-b from-zinc-800/80 via-zinc-900 to-zinc-950 p-1 shadow-2xl">
              
              {/* Image Preview Container */}
              <div className="relative h-56 sm:h-72 w-full rounded-2xl overflow-hidden group">
                <img 
                  src="/images/2023 Toyota Land Cruiser Prado.jpg" 
                  alt="Featured Toyota Land Cruiser Prado" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider">
                  Featured Vehicle
                </div>
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-zinc-200 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-white/10">
                  {formatPrice(74900)}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                
                <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-4 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-white font-bold text-base sm:text-lg font-mono truncate">2023 Toyota Land Cruiser Prado</h3>
                    <p className="text-zinc-400 text-[11px] sm:text-xs truncate">2.8L Turbo-Diesel • 4x4 • 7-Seater</p>
                  </div>
                  <button
                    onClick={onExploreCarsClick}
                    className="bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0"
                  >
                    View Car
                  </button>
                </div>
              </div>

              {/* Quick Spec Highlights Bar */}
              <div className="p-3 sm:p-4 grid grid-cols-3 gap-2 text-center">
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-2 sm:p-2.5">
                  <div className="text-yellow-400 font-mono font-bold text-base sm:text-lg">4.4★</div>
                  <div className="text-[10px] sm:text-[11px] text-zinc-400">8 Reviews</div>
                </div>
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-2 sm:p-2.5">
                  <div className="text-red-400 font-mono font-bold text-xs sm:text-sm leading-5 sm:leading-6 truncate">BN-2641123</div>
                  <div className="text-[10px] sm:text-[11px] text-zinc-400">CAC Registered</div>
                </div>
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-2 sm:p-2.5">
                  <div className="text-emerald-400 font-mono font-bold text-base sm:text-lg">2 Bays</div>
                  <div className="text-[10px] sm:text-[11px] text-zinc-400">Lekki &amp; Annex</div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Value Proposition Trust Badges Bar */}
        <div className="mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-400 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">CAC Registered</h4>
              <p className="text-[11px] text-zinc-400">BN-2641123 • Est. 2018</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">2 Lekki Locations</h4>
              <p className="text-[11px] text-zinc-400">Behind Emardeb &amp; Annex</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-400 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Extended Hours</h4>
              <p className="text-[11px] text-zinc-400">7:00 AM – 7:30 PM (Mon–Sat)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-yellow-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">4.4★ Rating</h4>
              <p className="text-[11px] text-zinc-400">8 Verified Google Reviews</p>
            </div>
          </div>

          <div className="flex items-center gap-3 col-span-2 md:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Direct Hotline</h4>
              <p className="text-[11px] text-zinc-400">+234 802 317 9860</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
