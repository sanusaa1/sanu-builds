import React, { useState } from 'react';
import {
  Trash2,
  Heart,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Tag,
  Check,
  X,
  Truck,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface CartPageProps {
  onNavigate: (route: string) => void;
  onSelectProduct: (slug: string) => void;
}

const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const CartPage: React.FC<CartPageProps> = ({
  onNavigate,
  onSelectProduct,
}) => {
  const {
    cart,
    cartCount,
    subtotal,
    discount,
    shippingFee,
    tax,
    total,
    freeShippingThreshold,
    freeShippingRemaining,
    appliedCoupon,
    couponError,
    removeFromCart,
    updateQuantity,
    applyCouponCode,
    removeCoupon,
  } = useCart();

  const { toggleWishlist } = useWishlist();

  const [couponInput, setCouponInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!couponInput.trim()) return;

    setApplyingCoupon(true);

    await applyCouponCode(couponInput.trim());

    setApplyingCoupon(false);
    setCouponInput('');
  };

  const freeShippingProgress =
    freeShippingThreshold > 0
      ? Math.min(
          100,
          Math.round((subtotal / freeShippingThreshold) * 100)
        )
      : 100;

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
          <ShoppingBag className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">
          Your Shopping Bag Is Empty
        </h2>

        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          Explore our collection of 240+ GSM heavyweight t-shirts
          engineered for modern builders.
        </p>

        <button
          id="empty-cart-shop-btn"
          onClick={() => onNavigate('/shop')}
          className="px-6 py-3 bg-neutral-950 text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors inline-flex items-center gap-2"
        >
          <span>Shop T-Shirts</span>
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
          Sanu Builds Checkout Bag
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight uppercase mt-0.5">
          Shopping Bag ({cartCount}{' '}
          {cartCount === 1 ? 'item' : 'items'})
        </h1>
      </div>

      {/* Free Shipping Progress */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2 text-neutral-900">
            <Truck className="w-4 h-4 text-neutral-700" />

            {freeShippingRemaining > 0 ? (
              <span>
                Add{' '}
                <strong className="text-neutral-950">
                  {formatINR(freeShippingRemaining)}
                </strong>{' '}
                more to unlock{' '}
                <strong>Free Shipping</strong>
              </span>
            ) : (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" />
                You've qualified for Free Shipping!
              </span>
            )}
          </div>

          <span className="text-neutral-500 font-mono text-[11px]">
            {freeShippingProgress}%
          </span>
        </div>

        <div className="h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              freeShippingProgress >= 100
                ? 'bg-emerald-600'
                : 'bg-neutral-900'
            }`}
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Cart Items */}
        <div className="lg:col-span-8 space-y-4">
          <div className="divide-y divide-neutral-200 border-t border-b border-neutral-200">

            {cart.map((item) => (
              <div
                key={item.id}
                className="py-5 flex gap-4 sm:gap-6 items-center"
              >

                {/* Product Image */}
                <button
                  onClick={() => onSelectProduct(item.slug)}
                  className="w-20 sm:w-24 aspect-3/4 bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200 shrink-0"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>

                {/* Product Details */}
                <div className="flex-1 min-w-0 space-y-1">

                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => onSelectProduct(item.slug)}
                      className="text-left text-sm font-bold text-neutral-900 hover:text-neutral-600 transition-colors line-clamp-1"
                    >
                      {item.name}
                    </button>

                    <span className="text-sm font-black text-neutral-900 shrink-0">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-neutral-500">
                    <span>
                      Size:{' '}
                      <strong className="text-neutral-900">
                        {item.size}
                      </strong>
                    </span>

                    <span>•</span>

                    <span>
                      Color:{' '}
                      <strong className="text-neutral-900">
                        {item.color}
                      </strong>
                    </span>
                  </div>

                  <div className="text-[11px] text-neutral-400">
                    {formatINR(item.price)} each
                  </div>

                  {/* Quantity + Actions */}
                  <div className="flex items-center justify-between pt-2">

                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-neutral-300 rounded-lg p-0.5 bg-neutral-50">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-1 text-neutral-600 hover:text-neutral-900"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <span className="w-7 text-center text-xs font-bold text-neutral-900">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-1 text-neutral-600 hover:text-neutral-900"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Wishlist + Remove */}
                    <div className="flex items-center gap-3">

                      <button
                        onClick={() =>
                          toggleWishlist({
                            id: item.productId,
                            name: item.name,
                            slug: item.slug,
                            images: [item.image],
                            price: item.price,
                            compareAtPrice: item.originalPrice,
                            categoryId: 'all',
                            brand: 'Sanu Builds',
                            description: '',
                            sizes: [item.size],
                            colors: [
                              {
                                name: item.color,
                                hex: '#111',
                              },
                            ],
                            variants: [],
                            stock: item.stockLimit,
                            sku: item.sku,
                            rating: 5,
                            reviewCount: 1,
                            tags: [],
                            featured: false,
                            bestseller: false,
                            newArrival: false,
                            active: true,
                            createdAt: item.addedAt,
                            updatedAt: item.addedAt,
                          })
                        }
                        className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1 transition-colors"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">
                          Save
                        </span>
                      </button>

                      <button
                        id={`remove-cart-item-${item.id}`}
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-neutral-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />

                        <span className="hidden sm:inline">
                          Remove
                        </span>
                      </button>

                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Continue Shopping */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => onNavigate('/shop')}
              className="text-xs font-bold text-neutral-900 hover:underline uppercase tracking-wider"
            >
              ← Continue Shopping
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-4 space-y-4">

          {/* Coupon */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-3 shadow-xs">

            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>Promo Code</span>
            </h3>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 bg-neutral-900 text-white rounded-lg text-xs">

                <div>
                  <span className="font-mono font-bold tracking-wider">
                    {appliedCoupon.code}
                  </span>

                  <span className="block text-[11px] text-neutral-300">
                    {appliedCoupon.description}
                  </span>
                </div>

                <button
                  onClick={removeCoupon}
                  className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white"
                  title="Remove coupon"
                >
                  <X className="w-4 h-4" />
                </button>

              </div>
            ) : (
              <form
                onSubmit={handleApplyCoupon}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder="e.g. BUILD15, SANU10"
                  value={couponInput}
                  onChange={(e) =>
                    setCouponInput(e.target.value.toUpperCase())
                  }
                  className="flex-1 px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 font-mono uppercase"
                />

                <button
                  type="submit"
                  disabled={applyingCoupon}
                  className="px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50"
                >
                  {applyingCoupon ? '...' : 'Apply'}
                </button>
              </form>
            )}

            {couponError && (
              <p className="text-[11px] text-rose-600">
                {couponError}
              </p>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4 shadow-xs">

            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-3">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs text-neutral-600">

              {/* Subtotal */}
              <div className="flex justify-between">
                <span>Subtotal</span>

                <span className="font-semibold text-neutral-900">
                  {formatINR(subtotal)}
                </span>
              </div>

              {/* Discount */}
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>
                    Discount ({appliedCoupon?.code})
                  </span>

                  <span>
                    -{formatINR(discount)}
                  </span>
                </div>
              )}

              {/* Shipping */}
              <div className="flex justify-between">
                <span>Estimated Shipping</span>

                <span className="font-semibold text-neutral-900">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-bold uppercase">
                      Free
                    </span>
                  ) : (
                    formatINR(shippingFee)
                  )}
                </span>
              </div>

              {/* GST */}
              <div className="flex justify-between">
                <span>Estimated GST</span>

                <span className="font-semibold text-neutral-900">
                  {formatINR(tax)}
                </span>
              </div>

              {/* Total */}
              <div className="border-t border-neutral-200 pt-3 flex justify-between items-baseline">

                <span className="text-sm font-bold text-neutral-900">
                  Estimated Total
                </span>

                <span className="text-xl font-black text-neutral-950">
                  {formatINR(total)}
                </span>

              </div>
            </div>

            {/* Checkout */}
            <button
              id="proceed-checkout-btn"
              onClick={() => onNavigate('/checkout')}
              className="w-full py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};
