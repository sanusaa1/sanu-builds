import React, { useState, useEffect } from 'react';
import {
  Heart,
  Star,
  Ruler,
  Truck,
  ShieldCheck,
  RotateCcw,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Product } from '../types';
import { ProductGallery } from '../components/product/ProductGallery';
import { ProductReviews } from '../components/product/ProductReviews';
import { SizeGuideModal } from '../components/common/SizeGuideModal';
import { ProductCard } from '../components/product/ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  onSelectProduct: (slug: string) => void;
  onNavigate: (route: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onSelectProduct,
  onNavigate,
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { success, error: toastError } = useToast();

  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]?.name || 'Onyx Black');
  const [quantity, setQuantity] = useState<number>(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false);
  const [openAccordion, setOpenAccordion] = useState<string>('specs');

  // Reset quantity when size/color changes
  useEffect(() => {
    setQuantity(1);
  }, [selectedSize, selectedColor, product.id]);

  const isSaved = isInWishlist(product.id);

  // Find variant stock
  const currentVariant = product.variants?.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );
  const maxStock = currentVariant ? currentVariant.stock : (product.stock || 15);
  const isOutOfStock = maxStock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toastError('Selected size and color is currently out of stock.');
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      toastError('Selected size and color is currently out of stock.');
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
    onNavigate('/checkout');
  };

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && (p.categoryId === product.categoryId || p.brand === product.brand))
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Breadcrumbs */}
      <nav className="text-xs text-neutral-500 flex items-center gap-2">
        <button onClick={() => onNavigate('/')} className="hover:text-neutral-900">
          Home
        </button>
        <span>/</span>
        <button onClick={() => onNavigate('/shop')} className="hover:text-neutral-900">
          T-Shirts
        </button>
        <span>/</span>
        <span className="text-neutral-900 font-semibold truncate">{product.name}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left Gallery (7 Cols) */}
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* Right Info & Actions (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Brand & Title */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
                {product.brand} • {product.categoryName || 'Apparel'}
              </span>
              <span className="text-[11px] font-mono font-medium text-neutral-400">
                SKU: {product.sku}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-neutral-900 tracking-tight mt-1">
              {product.name}
            </h1>

            {/* Ratings summary */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-neutral-900">{product.rating || 4.9}</span>
              <span className="text-xs text-neutral-400">({product.reviewCount || 38} reviews)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 pb-4 border-b border-neutral-100">
            <span className="text-2xl sm:text-3xl font-black text-neutral-900">
              ${product.price}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <>
                <span className="text-base text-neutral-400 line-through">
                  ${product.compareAtPrice}
                </span>
                <span className="px-2 py-0.5 bg-neutral-100 text-neutral-900 border border-neutral-300 text-xs font-bold rounded">
                  Save {product.discountPercentage}%
                </span>
              </>
            )}
          </div>

          {/* Color Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                Color: <span className="text-neutral-900 font-black">{selectedColor}</span>
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              {product.colors.map((col) => (
                <button
                  key={col.name}
                  onClick={() => setSelectedColor(col.name)}
                  className={`relative p-1 rounded-full border transition-all ${
                    selectedColor === col.name
                      ? 'border-neutral-950 ring-2 ring-neutral-950'
                      : 'border-neutral-300 hover:border-neutral-700'
                  }`}
                  title={col.name}
                >
                  <span
                    className="block w-6 h-6 rounded-full border border-neutral-200"
                    style={{ backgroundColor: col.hex }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                Size: <span className="text-neutral-900 font-black">{selectedSize}</span>
              </span>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(true)}
                className="text-xs font-semibold text-neutral-600 hover:text-neutral-950 flex items-center gap-1 underline"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Size Guide</span>
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {product.sizes.map((sz) => {
                const variantForSize = product.variants?.find(
                  (v) => v.size === sz && v.color === selectedColor
                );
                const isSzOOS = variantForSize ? variantForSize.stock <= 0 : false;

                return (
                  <button
                    key={sz}
                    disabled={isSzOOS}
                    onClick={() => setSelectedSize(sz)}
                    className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
                      selectedSize === sz
                        ? 'bg-neutral-950 text-white border-neutral-950 shadow-xs'
                        : isSzOOS
                        ? 'bg-neutral-100 text-neutral-300 border-neutral-200 line-through cursor-not-allowed'
                        : 'bg-white text-neutral-800 border-neutral-300 hover:border-neutral-950'
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>

            {/* Inventory notification */}
            <div className="mt-2 text-xs">
              {isOutOfStock ? (
                <span className="text-rose-600 font-bold">Out of stock in {selectedSize} / {selectedColor}</span>
              ) : maxStock < 10 ? (
                <span className="text-amber-600 font-bold">Only {maxStock} left in stock — order soon</span>
              ) : (
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> In stock ready to dispatch
                </span>
              )}
            </div>
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Quantity stepper */}
              <div className="flex items-center border border-neutral-300 rounded-lg p-1 bg-neutral-50 shrink-0">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-1.5 text-neutral-600 hover:text-neutral-950 disabled:opacity-30"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-xs font-black text-neutral-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= maxStock}
                  onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                  className="p-1.5 text-neutral-600 hover:text-neutral-950 disabled:opacity-30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                id="add-to-cart-btn"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="flex-1 py-3.5 bg-neutral-950 hover:bg-neutral-800 disabled:bg-neutral-300 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Sold Out' : 'Add To Bag'}</span>
              </button>

              {/* Wishlist Button */}
              <button
                id="pdp-wishlist-btn"
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 border rounded-lg transition-colors shrink-0 ${
                  isSaved
                    ? 'bg-neutral-950 text-white border-neutral-950'
                    : 'border-neutral-300 text-neutral-700 hover:border-neutral-950'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
              </button>
            </div>

            {/* Instant Buy Now */}
            <button
              id="buy-now-btn"
              disabled={isOutOfStock}
              onClick={handleBuyNow}
              className="w-full py-3 bg-white hover:bg-neutral-100 text-neutral-950 border border-neutral-900 text-xs font-black uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-neutral-950" />
              <span>Instant Buy Now</span>
            </button>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-neutral-100 text-center text-[11px] text-neutral-600">
            <div className="p-2 bg-neutral-50 rounded-lg">
              <Truck className="w-4 h-4 mx-auto mb-1 text-neutral-900" />
              <span>Free Ship $50+</span>
            </div>
            <div className="p-2 bg-neutral-50 rounded-lg">
              <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-neutral-900" />
              <span>240 GSM Heavy</span>
            </div>
            <div className="p-2 bg-neutral-50 rounded-lg">
              <RotateCcw className="w-4 h-4 mx-auto mb-1 text-neutral-900" />
              <span>30-Day Return</span>
            </div>
          </div>

          {/* Technical Specs Accordion */}
          <div className="border-t border-neutral-200 divide-y divide-neutral-200">
            {/* Description & Fit */}
            <div>
              <button
                onClick={() => setOpenAccordion(openAccordion === 'specs' ? '' : 'specs')}
                className="w-full py-3.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-900"
              >
                <span>Fabric & Engineering Details</span>
                {openAccordion === 'specs' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordion === 'specs' && (
                <div className="pb-4 text-xs text-neutral-600 space-y-2 leading-relaxed animate-in fade-in duration-150">
                  <p>{product.description}</p>
                  <ul className="list-disc pl-4 space-y-1 text-neutral-700">
                    <li>Fabric: {product.details?.fabric || '100% Ringspun Combed Cotton'}</li>
                    <li>Fabric Weight: {product.details?.gsm || 240} GSM Heavyweight</li>
                    <li>Fit: {product.details?.fit || 'Relaxed Drop-Shoulder Boxy Silhouette'}</li>
                    <li>Collar: 1.25" Reinforced anti-roll ribbed crew neck</li>
                    <li>{product.details?.modelDetails}</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Wash Care */}
            <div>
              <button
                onClick={() => setOpenAccordion(openAccordion === 'wash' ? '' : 'wash')}
                className="w-full py-3.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-900"
              >
                <span>Wash & Garment Care</span>
                {openAccordion === 'wash' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordion === 'wash' && (
                <div className="pb-4 text-xs text-neutral-600 space-y-1.5 leading-relaxed animate-in fade-in duration-150">
                  <p>• {product.details?.washCare || 'Machine wash cold inside out with similar dark tones.'}</p>
                  <p>• Do not tumble dry. Hang dry in shade to preserve organic cotton fibers.</p>
                  <p>• Iron on reverse side on low-to-medium heat.</p>
                </div>
              )}
            </div>

            {/* Delivery & Returns */}
            <div>
              <button
                onClick={() => setOpenAccordion(openAccordion === 'shipping' ? '' : 'shipping')}
                className="w-full py-3.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-900"
              >
                <span>Shipping & 30-Day Returns</span>
                {openAccordion === 'shipping' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordion === 'shipping' && (
                <div className="pb-4 text-xs text-neutral-600 space-y-1.5 leading-relaxed animate-in fade-in duration-150">
                  <p>• Fast dispatch within 24 hours of order placement.</p>
                  <p>• Free standard delivery on all domestic orders over $50.</p>
                  <p>• Hassle-free 30-day exchange and return policy on unworn garments with original tags.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Verified Reviews Section */}
      <section className="pt-8 border-t border-neutral-200">
        <ProductReviews product={product} />
      </section>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="pt-8 border-t border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                You May Also Like
              </span>
              <h3 className="text-xl font-black text-neutral-900 tracking-tight">
                Pair With These Silhouettes
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} onSelect={onSelectProduct} />
            ))}
          </div>
        </section>
      )}

      {/* Size Guide Modal */}
      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </div>
  );
};
