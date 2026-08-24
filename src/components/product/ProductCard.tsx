// ProductCard.tsx

import React, { useState } from 'react';
import { Heart, Star, Plus } from 'lucide-react';
import { Product } from '../../types';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
  onSelect: (slug: string) => void;
}

const formatINR = (value: number | string | undefined | null): string => {
  const amount = Number(value) || 0;

  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount);
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
}) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [isHovered, setIsHovered] = useState(false);
  const [quickSizeOpen, setQuickSizeOpen] = useState(false);
  const [addedTemp, setAddedTemp] = useState(false);

  const isSaved = isInWishlist(product.id);

  const primaryImage =
    product.images?.[0] ||
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';

  const secondaryImage =
    product.images?.[1] || primaryImage;

  const price = Number(product.price) || 0;
  const compareAtPrice = Number(product.compareAtPrice) || 0;

  const handleQuickAdd = (
    e: React.MouseEvent,
    size: string
  ) => {
    e.stopPropagation();

    const defaultColor =
      product.colors?.[0]?.name || 'Onyx Black';

    addToCart(
      product,
      size,
      defaultColor,
      1
    );

    setAddedTemp(true);

    setTimeout(() => {
      setAddedTemp(false);
      setQuickSizeOpen(false);
    }, 1200);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative bg-white flex flex-col cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setQuickSizeOpen(false);
      }}
      onClick={() => onSelect(product.slug)}
    >
      {/* Product Image */}
      <div className="relative w-full aspect-[3/4] bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200">
        <img
          src={
            isHovered && secondaryImage
              ? secondaryImage
              : primaryImage
          }
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.bestseller && (
            <span className="px-2 py-0.5 bg-neutral-950 text-white text-[10px] font-bold uppercase tracking-wider rounded">
              Bestseller
            </span>
          )}

          {product.newArrival && (
            <span className="px-2 py-0.5 bg-white text-neutral-950 border border-neutral-200 text-[10px] font-bold uppercase tracking-wider rounded shadow-sm">
              New Arrival
            </span>
          )}

          {product.discountPercentage &&
          product.discountPercentage > 0 ? (
            <span className="px-2 py-0.5 bg-neutral-100 text-neutral-900 border border-neutral-300 text-[10px] font-bold uppercase tracking-wider rounded">
              Save {product.discountPercentage}%
            </span>
          ) : null}
        </div>

        {/* Wishlist */}
        <button
          id={`wishlist-toggle-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full transition-all z-10 ${
            isSaved
              ? 'bg-neutral-950 text-white shadow-md'
              : 'bg-white/80 backdrop-blur-sm text-neutral-700 hover:bg-white hover:text-neutral-950 shadow-sm'
          }`}
          aria-label="Wishlist"
        >
          <Heart
            className={`w-4 h-4 ${
              isSaved ? 'fill-white' : ''
            }`}
          />
        </button>

        {/* Quick Add */}
        {quickSizeOpen ? (
          <div
            className="absolute inset-x-0 bottom-0 p-3 bg-white/95 backdrop-blur-md border-t border-neutral-200 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[11px] font-bold text-neutral-900 mb-2 uppercase tracking-wider">
              {addedTemp
                ? 'Added to Bag!'
                : 'Select Size:'}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {(product.sizes || []).map((size) => (
                <button
                  key={size}
                  onClick={(e) =>
                    handleQuickAdd(e, size)
                  }
                  className="px-2.5 py-1 text-xs font-bold border border-neutral-300 hover:border-neutral-950 hover:bg-neutral-950 hover:text-white rounded transition-colors"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button
            id={`quick-add-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              setQuickSizeOpen(true);
            }}
            className="hidden group-hover:flex absolute inset-x-3 bottom-3 py-2 bg-neutral-950/90 hover:bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider rounded-lg items-center justify-center gap-1.5 transition-all shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Quick Add</span>
          </button>
        )}
      </div>

      {/* Product Information */}
      <div className="pt-3 pb-1 flex flex-col gap-1">
        {/* Colors + Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {(product.colors || [])
              .slice(0, 3)
              .map((color) => (
                <span
                  key={color.name}
                  title={color.name}
                  className="w-2.5 h-2.5 rounded-full border border-neutral-300 shadow-sm"
                  style={{
                    backgroundColor:
                      color.hex || '#000000',
                  }}
                />
              ))}

            {(product.colors || []).length > 3 && (
              <span className="text-[10px] text-neutral-400 font-medium">
                +{product.colors.length - 3}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 text-xs text-neutral-600">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />

            <span className="font-bold text-neutral-900">
              {product.rating || 4.9}
            </span>

            <span className="text-neutral-400 text-[11px]">
              ({product.reviewCount || 12})
            </span>
          </div>
        </div>

        {/* Product Name */}
        <h3 className="text-sm font-semibold text-neutral-900 group-hover:text-neutral-600 transition-colors line-clamp-1">
          {product.name}
        </h3>

        {/* INR Price + GSM */}
        <div className="flex items-baseline justify-between mt-0.5">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-black text-neutral-950">
              ₹{formatINR(price)}
            </span>

            {compareAtPrice > price && (
              <span className="text-xs text-neutral-400 line-through">
                ₹{formatINR(compareAtPrice)}
              </span>
            )}
          </div>

          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
            {product.details?.gsm || 240} GSM
          </span>
        </div>
      </div>
    </div>
  );
};
