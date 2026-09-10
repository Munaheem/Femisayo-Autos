import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ShieldCheck, 
  ArrowRight, 
  Tag, 
  Check, 
  Truck, 
  Sparkles
} from 'lucide-react';
import { CartItem } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (partId: string, delta: number) => void;
  onRemoveItem: (partId: string) => void;
  onProceedToCheckout: (subtotal: number, discount: number, tax: number, total: number, couponCode?: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout
}) => {
  const { formatPrice } = useCurrency();
  const [couponCode, setCouponCode] = useState('DRIVE10');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const rawSubtotal = cartItems.reduce((sum, item) => sum + (item.part.price * item.quantity), 0);
  const VAT_RATE = 0.075; // Nigerian standard VAT (7.5%)
  const discountRate = couponApplied ? 0.10 : 0;
  const discountAmount = rawSubtotal * discountRate;
  const tax = (rawSubtotal - discountAmount) * VAT_RATE;
  const total = rawSubtotal - discountAmount + tax;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'DRIVE10') {
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code. Use DRIVE10 for 10% off.');
      setCouponApplied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full sm:w-screen max-w-full sm:max-w-md bg-zinc-950 border-l border-zinc-800 text-zinc-100 flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-black font-mono text-white">SHOPPING CART</h3>
              <span className="text-xs bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded-full font-bold">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)} items
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dispatch & Delivery Info */}
          <div className="bg-zinc-900/90 px-5 py-3 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-xs text-zinc-300 font-semibold">
              <Truck className="w-3.5 h-3.5 text-red-400" />
              <span>Free dispatch within Lekki · Outside Lekki, call <a href="tel:+2348023179860" className="text-red-400 hover:underline">+234 802 317 9860</a> for rates</span>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <ShoppingBag className="w-12 h-12 text-zinc-700 mx-auto" />
                <p className="text-sm text-zinc-400">Your cart is currently empty</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                >
                  Browse Auto Parts
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.part.id}
                  className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800/80 flex gap-3"
                >
                  <img
                    src={item.part.image}
                    alt={item.part.name}
                    className="w-20 h-20 object-cover rounded-lg bg-zinc-950 border border-zinc-800 shrink-0"
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                          {item.part.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.part.id)}
                          className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        {item.part.brand} • {item.part.partNumber}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800">
                        <button
                          onClick={() => onUpdateQuantity(item.part.id, -1)}
                          className="text-zinc-400 hover:text-white p-1 -ml-0.5"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono font-bold text-white w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.part.id, 1)}
                          className="text-zinc-400 hover:text-white p-1 -mr-0.5"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <span className="text-sm font-black font-mono text-white">
                        {formatPrice(item.part.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Order Summary */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-zinc-800 bg-zinc-900/60 space-y-4">
              
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-1">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Promo Code (DRIVE10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white uppercase font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200"
                  >
                    Apply
                  </button>
                </div>
                {couponApplied && (
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                    <Check className="w-3 h-3" /> 10% Discount Applied!
                  </p>
                )}
                {couponError && (
                  <p className="text-[11px] text-red-400">{couponError}</p>
                )}
              </form>

              {/* Price Calculation Breakdown */}
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-zinc-200">{formatPrice(rawSubtotal)}</span>
                </div>

                {couponApplied && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount (10% Off)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-zinc-400">
                  <span>Dispatch (Lekki)</span>
                  <span className="text-emerald-400">FREE</span>
                </div>

                <div className="flex justify-between text-zinc-400">
                  <span>VAT (7.5%)</span>
                  <span className="text-zinc-200">{formatPrice(tax)}</span>
                </div>

                <div className="flex justify-between text-white font-bold text-base border-t border-zinc-800 pt-2 font-sans">
                  <span>Order Total</span>
                  <span className="text-red-400 font-mono">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                id="cart-proceed-checkout-btn"
                onClick={() => {
                  onClose();
                  onProceedToCheckout(rawSubtotal, discountAmount, tax, total, couponApplied ? 'DRIVE10' : undefined);
                }}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-red-700/30 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Proceed to Payment • {formatPrice(total)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>All payments processed in Nigerian Naira (₦) via secure card payment</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
