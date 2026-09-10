import React from 'react';
import { Heart, X, ShoppingCart, Trash2 } from 'lucide-react';
import { PartItem } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: PartItem[];
  onAddToCart: (part: PartItem) => void;
  onRemoveItem: (partId: string) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onAddToCart,
  onRemoveItem
}) => {
  const { formatPrice } = useCurrency();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full sm:w-screen max-w-full sm:max-w-md bg-zinc-950 border-l border-zinc-800 text-zinc-100 flex flex-col shadow-2xl">

          {/* Header */}
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              <h3 className="text-lg font-black font-mono text-white">MY WISHLIST</h3>
              {items.length > 0 && (
                <span className="text-xs bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded-full font-bold">
                  {items.length} saved
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Wishlist Items */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <Heart className="w-12 h-12 text-zinc-700 mx-auto" />
                <p className="text-sm text-zinc-400">Your wishlist is empty</p>
                <p className="text-xs text-zinc-500">
                  Tap the heart icon on any part to save it here. It stays saved after you log out.
                </p>
              </div>
            ) : (
              items.map((part) => (
                <div
                  key={part.id}
                  className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800/80 flex gap-3"
                >
                  <img
                    src={part.image}
                    alt={part.name}
                    className="w-20 h-20 object-cover rounded-lg bg-zinc-950 border border-zinc-800 shrink-0"
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                          {part.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(part.id)}
                          className="text-zinc-500 hover:text-red-400 p-1 transition-colors shrink-0"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        {part.brand} • {part.partNumber}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm font-black font-mono text-white">
                        {formatPrice(part.price)}
                      </span>
                      <button
                        onClick={() => onAddToCart(part)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};