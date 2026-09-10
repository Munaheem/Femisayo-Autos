import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'NGN' | 'USD';

// Front-end seed prices are stored in USD and converted to Naira at this rate.
// Override at build/runtime with the VITE_NGN_PER_USD env var (see .env.example).
// TODO(backend): once the API serves real Naira prices, use those directly.
export const DEFAULT_USD_TO_NGN_RATE =
  Number(import.meta.env?.VITE_NGN_PER_USD) || 1500; // Realistic Nigerian market exchange rate

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  toggleCurrency: () => void;
  exchangeRate: number;
  formatPrice: (amountInUSD: number, options?: { showDecimals?: boolean; compact?: boolean }) => string;
  convertPrice: (amountInUSD: number) => number;
  currencySymbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Prices are locked to Naira (₦) as required — no USD toggle.
  const [currency, setCurrencyState] = useState<Currency>('NGN');

  const exchangeRate = DEFAULT_USD_TO_NGN_RATE;

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
  };

  const toggleCurrency = () => {
    setCurrency(currency === 'NGN' ? 'USD' : 'NGN');
  };

  const convertPrice = (amountInUSD: number): number => {
    if (currency === 'NGN') {
      return Math.round(amountInUSD * exchangeRate);
    }
    return amountInUSD;
  };

  const formatPrice = (
    amountInUSD: number, 
    options?: { showDecimals?: boolean; compact?: boolean }
  ): string => {
    if (isNaN(amountInUSD)) return currency === 'NGN' ? '₦0' : '$0.00';

    if (currency === 'NGN') {
      const ngnAmount = Math.round(amountInUSD * exchangeRate);

      if (options?.compact) {
        if (ngnAmount >= 1_000_000_000) {
          return `₦${(ngnAmount / 1_000_000_000).toFixed(1)}B`;
        }
        if (ngnAmount >= 1_000_000) {
          return `₦${(ngnAmount / 1_000_000).toFixed(1)}M`;
        }
        if (ngnAmount >= 100_000) {
          return `₦${(ngnAmount / 1_000).toFixed(0)}k`;
        }
      }

      return `₦${ngnAmount.toLocaleString('en-NG')}`;
    } else {
      // USD
      if (options?.compact) {
        if (amountInUSD >= 1_000_000) {
          return `$${(amountInUSD / 1_000_000).toFixed(1)}M`;
        }
        if (amountInUSD >= 100_000) {
          return `$${(amountInUSD / 1_000).toFixed(0)}k`;
        }
      }

      // If whole thousand or large integer, format without cents unless specified
      const isInteger = Number.isInteger(amountInUSD);
      const shouldShowDecimals = options?.showDecimals ?? !isInteger;

      return `$${amountInUSD.toLocaleString('en-US', {
        minimumFractionDigits: shouldShowDecimals ? 2 : 0,
        maximumFractionDigits: shouldShowDecimals ? 2 : 0
      })}`;
    }
  };

  const currencySymbol = currency === 'NGN' ? '₦' : '$';

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        toggleCurrency,
        exchangeRate,
        formatPrice,
        convertPrice,
        currencySymbol
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
