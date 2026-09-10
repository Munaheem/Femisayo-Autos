import React from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { ArrowLeftRight } from 'lucide-react';

interface CurrencySwitcherProps {
  className?: string;
  variant?: 'pill' | 'compact' | 'badge';
  showRate?: boolean;
}

export const CurrencySwitcher: React.FC<CurrencySwitcherProps> = ({
  className = '',
  variant = 'pill',
  showRate = false
}) => {
  const { currency, setCurrency, exchangeRate } = useCurrency();

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center bg-zinc-950/90 border border-zinc-800 rounded-lg p-0.5 text-xs font-mono ${className}`}>
        <button
          type="button"
          onClick={() => setCurrency('NGN')}
          className={`px-2 py-1 rounded-md font-bold transition-all ${
            currency === 'NGN'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
          title="Nigerian Naira (₦)"
        >
          ₦ NGN
        </button>
        <button
          type="button"
          onClick={() => setCurrency('USD')}
          className={`px-2 py-1 rounded-md font-bold transition-all ${
            currency === 'USD'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
          title="US Dollar ($)"
        >
          $ USD
        </button>
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <button
        type="button"
        onClick={() => setCurrency(currency === 'NGN' ? 'USD' : 'NGN')}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
          currency === 'NGN'
            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-600/40 hover:bg-emerald-900/50'
            : 'bg-blue-950/40 text-blue-400 border-blue-600/40 hover:bg-blue-900/50'
        } ${className}`}
        title={`Click to switch to ${currency === 'NGN' ? 'USD ($)' : 'NGN (₦)'}`}
      >
        <ArrowLeftRight className="w-3 h-3 opacity-70" />
        <span>{currency === 'NGN' ? '₦ NGN (Naira)' : '$ USD (Dollar)'}</span>
      </button>
    );
  }

  // Default 'pill' variant
  return (
    <div className={`inline-flex flex-col ${className}`}>
      <div className="inline-flex items-center bg-zinc-900/95 border border-zinc-700/80 rounded-xl p-1 shadow-inner">
        <button
          type="button"
          onClick={() => setCurrency('NGN')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
            currency === 'NGN'
              ? 'bg-red-600 text-white shadow-md shadow-red-700/30'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
          title="Display all prices in Nigerian Naira (₦)"
        >
          <span className="text-sm font-black leading-none">₦</span>
          <span>NAIRA</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrency('USD')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
            currency === 'USD'
              ? 'bg-red-600 text-white shadow-md shadow-red-700/30'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
          title="Display all prices in US Dollars ($)"
        >
          <span className="text-sm font-black leading-none">$</span>
          <span>USD</span>
        </button>
      </div>

      {showRate && (
        <span className="text-[10px] text-zinc-500 font-mono mt-1 text-center">
          1 USD ≈ ₦{exchangeRate.toLocaleString()}
        </span>
      )}
    </div>
  );
};
