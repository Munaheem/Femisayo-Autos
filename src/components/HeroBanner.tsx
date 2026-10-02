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
    <div className="hero-banner relative w-full bg-zinc-950 overflow-hidden border-b border-zinc-800">
      
      {/* Background Hero Video with Radial Gradient Vignette */}
      <div className="absolute inset-0 z-0">
        <video
          src="/videos/VID_20260913_182007_234.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover object-center opacity-80 filter contrast-125 saturate-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0c10] via-[#0a0c10]/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-transparent to-[#0a0c10]/50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-12 lg:pt-20 lg:pb-24">
        <div className="grid grid-cols-1 gap-8 lg:gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="space-y-6">
          {/* Removed Hero Title and Description */}

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] uppercase font-mono">
                Expert Auto Repair &amp; <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-500 to-sky-400">
                  Mechanical Services.
                </span>
              </h1>
              <p className="text-white/80 text-sm sm:text-base lg:text-lg max-w-xl font-normal leading-relaxed pt-2">
                Located on Ilasan New Road (behind Emardeb Filling Station) and FemisayoAutos Annex in Ilasan, Lekki. Full automotive diagnostics, mechanical overhauls, car showroom, and genuine parts.
              </p>
              
              {/* Quick Info Bar */}
              {/* Removed the quick info bar to streamline the hero section and focus on primary actions*/}
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

        </div>

        {/* Value Proposition Trust Badges Bar */}
        {/* Removed the trust badges bar to streamline the hero section and focus on primary actions */}

      </div>
     
  );
};
