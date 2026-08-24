import React, { useState } from 'react';
import { Heart, Trash2, ShoppingBag, ArrowRight, Star } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

interface WishlistPageProps {
  allProducts: Product[];
  onNavigate: (route: string) => void;
  onSelectProduct: (slug: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  allProducts,
  onNavigate,
  onSelectProduct,
}) => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  const handleMoveToBag = (productId: string) => {
    const fullProduct = allProducts.find((p) => p.id === productId);
    if (!fullProduct) return;

    const size = selectedSizes[productId] || fullProduct.sizes[0] || 'M';
    const color = fullProduct.colors[0]?.name || 'Onyx Black';

    addToCart(fullProduct, size, color, 1);
    removeFromWishlist(productId);
  };

  if (wishlist.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">
          No Saved Products Yet
        </h2>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          Save your favorite Sanu Builds garments to your wishlist for later or size comparison.
        </p>
        <button
          onClick={() => onNavigate('/shop')}
          className="px-6 py-3 bg-neutral-950 text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors inline-flex items-center gap-2"
        >
          <span>Explore Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="border-b border-neutral-200 pb-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
          Personal Wardrobe
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight uppercase mt-0.5">
          Wishlist ({wishlist.length})
        </h1>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {wishlist.map((item) => {
          const fullProduct = allProducts.find((p) => p.id === item.productId);
          const availableSizes = fullProduct?.sizes || ['S', 'M', 'L', 'XL'];
          const currentChosenSize = selectedSizes[item.productId] || availableSizes[0];

          return (
            <div
              key={item.productId}
              className="bg-white rounded-xl border border-neutral-200 overflow-hidden flex flex-col group"
            >
              {/* Thumbnail */}
              <div
                onClick={() => onSelectProduct(item.slug)}
                className="relative aspect-3/4 bg-neutral-100 cursor-pointer overflow-hidden"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWishlist(item.productId);
                  }}
                  className="absolute top-2.5 right-2.5 p-2 bg-white/90 rounded-full text-neutral-700 hover:text-rose-600 transition-colors shadow-xs"
                  aria-label="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Details */}
              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3
                    onClick={() => onSelectProduct(item.slug)}
                    className="text-xs font-bold text-neutral-900 hover:text-neutral-600 cursor-pointer line-clamp-1"
                  >
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-black text-neutral-950">${item.price}</span>
                    {item.compareAtPrice && (
                      <span className="text-[11px] text-neutral-400 line-through">
                        ${item.compareAtPrice}
                      </span>
                    )}
                  </div>
                </div>

                {/* Size select & Move to bag */}
                <div className="space-y-2 pt-1 border-t border-neutral-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase">Size:</span>
                    <select
                      value={currentChosenSize}
                      onChange={(e) =>
                        setSelectedSizes((prev) => ({
                          ...prev,
                          [item.productId]: e.target.value,
                        }))
                      }
                      className="flex-1 py-1 px-2 text-xs border border-neutral-200 rounded font-semibold bg-neutral-50"
                    >
                      {availableSizes.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => handleMoveToBag(item.productId)}
                    className="w-full py-2 bg-neutral-900 hover:bg-black text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>Move to Bag</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
