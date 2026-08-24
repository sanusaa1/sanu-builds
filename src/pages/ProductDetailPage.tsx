import React, { useEffect, useMemo, useState } from 'react';
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

type AccordionKey = 'specs' | 'wash' | 'shipping' | '';

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onSelectProduct,
  onNavigate,
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { success, error: toastError } = useToast();

  /*
   * ---------------------------------------------------------
   * SAFE PRODUCT DATA
   * ---------------------------------------------------------
   */

  const sizes = Array.isArray(product.sizes)
    ? product.sizes.filter(Boolean)
    : [];

  const colors = Array.isArray(product.colors)
    ? product.colors.filter((color) => color?.name)
    : [];

  const variants = Array.isArray(product.variants)
    ? product.variants
    : [];

  /*
   * ---------------------------------------------------------
   * LOCAL STATE
   * ---------------------------------------------------------
   */

  const [selectedSize, setSelectedSize] = useState<string>(
    sizes[0] || ''
  );

  const [selectedColor, setSelectedColor] = useState<string>(
    colors[0]?.name || ''
  );

  const [quantity, setQuantity] = useState<number>(1);

  const [isSizeGuideOpen, setIsSizeGuideOpen] =
    useState<boolean>(false);

  const [openAccordion, setOpenAccordion] =
    useState<AccordionKey>('specs');

  /*
   * ---------------------------------------------------------
   * PRODUCT CHANGE HANDLING
   * ---------------------------------------------------------
   *
   * If user moves from Product A to Product B without the
   * entire page being destroyed, selected size/color should
   * always become valid for Product B.
   */

  useEffect(() => {
    const firstSize = sizes[0] || '';

    const sizeStillValid =
      selectedSize && sizes.includes(selectedSize);

    if (!sizeStillValid) {
      setSelectedSize(firstSize);
    }

    const firstColor = colors[0]?.name || '';

    const colorStillValid =
      selectedColor &&
      colors.some((color) => color.name === selectedColor);

    if (!colorStillValid) {
      setSelectedColor(firstColor);
    }

    setQuantity(1);
  }, [product.id]);

  /*
   * ---------------------------------------------------------
   * WISHLIST
   * ---------------------------------------------------------
   */

  const isSaved = isInWishlist(product.id);

  /*
   * ---------------------------------------------------------
   * CURRENT VARIANT
   * ---------------------------------------------------------
   */

  const currentVariant = useMemo(() => {
    if (!selectedSize || !selectedColor) {
      return null;
    }

    return (
      variants.find(
        (variant) =>
          variant.size === selectedSize &&
          variant.color === selectedColor
      ) || null
    );
  }, [
    variants,
    selectedSize,
    selectedColor,
  ]);

  /*
   * ---------------------------------------------------------
   * STOCK LOGIC
   * ---------------------------------------------------------
   *
   * Priority:
   *
   * 1. Matching variant stock
   * 2. Product stock
   * 3. Zero
   *
   * We do NOT use arbitrary fake stock such as 15.
   */

  const maxStock = useMemo(() => {
    if (currentVariant) {
      return Math.max(0, Number(currentVariant.stock || 0));
    }

    return Math.max(0, Number(product.stock || 0));
  }, [currentVariant, product.stock]);

  const isOutOfStock = maxStock <= 0;

  /*
   * If selected quantity somehow becomes greater than
   * Firebase stock, automatically correct it.
   */

  useEffect(() => {
    setQuantity((currentQuantity) => {
      if (maxStock <= 0) {
        return 1;
      }

      return Math.min(
        Math.max(1, currentQuantity),
        maxStock
      );
    });
  }, [maxStock]);

  /*
   * ---------------------------------------------------------
   * PRICE / DISCOUNT
   * ---------------------------------------------------------
   */

  const price = Number(product.price || 0);

  const compareAtPrice = Number(
    product.compareAtPrice || 0
  );

  const calculatedDiscountPercentage =
    compareAtPrice > price && price > 0
      ? Math.round(
          ((compareAtPrice - price) / compareAtPrice) * 100
        )
      : 0;

  const discountPercentage =
    Number(product.discountPercentage || 0) ||
    calculatedDiscountPercentage;

  /*
   * ---------------------------------------------------------
   * RATING
   * ---------------------------------------------------------
   *
   * Don't use:
   *
   * product.rating || 4.9
   *
   * because a valid 0 rating would become 4.9.
   */

  const rating = Math.min(
    5,
    Math.max(0, Number(product.rating ?? 0))
  );

  const reviewCount = Math.max(
    0,
    Number(product.reviewCount ?? 0)
  );

  /*
   * ---------------------------------------------------------
   * PRODUCT DETAILS FROM FIREBASE
   * ---------------------------------------------------------
   */

  const details = product.details || {};

  const fabric =
    details.fabric || 'Fabric details not provided';

  const gsm =
    details.gsm !== undefined &&
    details.gsm !== null &&
    details.gsm !== ''
      ? details.gsm
      : null;

  const fit =
    details.fit || 'Fit details not provided';

  const collar =
    details.collar || 'Collar details not provided';

  const modelDetails =
    details.modelDetails || '';

  const washCare =
    details.washCare || 'Wash-care information not provided';

  /*
   * Optional dynamic product-level content.
   *
   * These fields can be added to your Product details in
   * Firestore without breaking old products.
   */

  const shippingText =
    details.shipping ||
    details.shippingInfo ||
    'Shipping information not provided';

  const returnText =
    details.returnPolicy ||
    details.returns ||
    'Return policy information not provided';

  const freeShippingText =
    details.freeShipping ||
    'Free shipping information not provided';

  const weightText =
    gsm !== null
      ? `${gsm} GSM Heavyweight`
      : 'Weight not specified';

  /*
   * ---------------------------------------------------------
   * RELATED PRODUCTS
   * ---------------------------------------------------------
   *
   * Priority:
   *
   * 1. Same category
   * 2. Same brand
   * 3. Same tags
   *
   * Current product excluded.
   */

  const relatedProducts = useMemo(() => {
    const currentTags = Array.isArray(product.tags)
      ? product.tags.map((tag) => tag.toLowerCase())
      : [];

    const candidates = allProducts
      .filter((item) => item.id !== product.id)
      .filter((item) => item.active !== false);

    const scored = candidates.map((item) => {
      let score = 0;

      if (
        product.categoryId &&
        item.categoryId === product.categoryId
      ) {
        score += 5;
      }

      if (
        product.brand &&
        item.brand &&
        item.brand.toLowerCase() ===
          product.brand.toLowerCase()
      ) {
        score += 3;
      }

      const itemTags = Array.isArray(item.tags)
        ? item.tags.map((tag) => tag.toLowerCase())
        : [];

      const matchingTags = itemTags.filter((tag) =>
        currentTags.includes(tag)
      ).length;

      score += matchingTags;

      if (item.featured) {
        score += 1;
      }

      if (item.bestseller) {
        score += 1;
      }

      return {
        item,
        score,
      };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(({ item }) => item);
  }, [
    allProducts,
    product.id,
    product.categoryId,
    product.brand,
    product.tags,
    product.featured,
    product.bestseller,
  ]);

  /*
   * ---------------------------------------------------------
   * HANDLERS
   * ---------------------------------------------------------
   */

  const handleColorChange = (color: string) => {
    setSelectedColor(color);

    /*
     * When changing color, check whether current size exists
     * for that color. If not, automatically choose the first
     * available size for that color.
     */

    const matchingSizes = sizes.filter((size) => {
      const variant = variants.find(
        (item) =>
          item.size === size &&
          item.color === color
      );

      return !variant || Number(variant.stock || 0) > 0;
    });

    if (
      selectedSize &&
      matchingSizes.includes(selectedSize)
    ) {
      return;
    }

    if (matchingSizes.length > 0) {
      setSelectedSize(matchingSizes[0]);
    } else if (sizes.length > 0) {
      setSelectedSize(sizes[0]);
    }
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
  };

  const handleQuantityDecrease = () => {
    setQuantity((currentQuantity) =>
      Math.max(1, currentQuantity - 1)
    );
  };

  const handleQuantityIncrease = () => {
    if (maxStock <= 0) {
      return;
    }

    setQuantity((currentQuantity) =>
      Math.min(maxStock, currentQuantity + 1)
    );
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toastError(
        `Selected ${selectedSize || 'size'} / ${
          selectedColor || 'color'
        } is currently out of stock.`
      );

      return;
    }

    if (quantity > maxStock) {
      toastError(
        `Only ${maxStock} item${
          maxStock === 1 ? '' : 's'
        } available.`
      );

      setQuantity(maxStock);
      return;
    }

    addToCart(
      product,
      selectedSize,
      selectedColor,
      quantity
    );

    success('Product added to your bag.');
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      toastError(
        `Selected ${selectedSize || 'size'} / ${
          selectedColor || 'color'
        } is currently out of stock.`
      );

      return;
    }

    if (quantity > maxStock) {
      toastError(
        `Only ${maxStock} item${
          maxStock === 1 ? '' : 's'
        } available.`
      );

      setQuantity(maxStock);
      return;
    }

    addToCart(
      product,
      selectedSize,
      selectedColor,
      quantity
    );

    onNavigate('/checkout');
  };

  const handleWishlist = () => {
    toggleWishlist(product);
  };

  /*
   * ---------------------------------------------------------
   * ACCORDION
   * ---------------------------------------------------------
   */

  const toggleAccordion = (key: AccordionKey) => {
    setOpenAccordion((current) =>
      current === key ? '' : key
    );
  };

  /*
   * ---------------------------------------------------------
   * SIZE AVAILABILITY
   * ---------------------------------------------------------
   */

  const getSizeVariant = (size: string) => {
    if (!selectedColor) {
      return null;
    }

    return (
      variants.find(
        (variant) =>
          variant.size === size &&
          variant.color === selectedColor
      ) || null
    );
  };

  const isSizeOutOfStock = (size: string) => {
    const variant = getSizeVariant(size);

    /*
     * If variants exist, matching variant controls stock.
     *
     * If no matching variant exists, fallback to product-level
     * stock so older products remain compatible.
     */

    if (variants.length > 0) {
      return !variant || Number(variant.stock || 0) <= 0;
    }

    return Number(product.stock || 0) <= 0;
  };

  /*
   * ---------------------------------------------------------
   * STAR RENDERING
   * ---------------------------------------------------------
   */

  const renderRatingStars = () => {
    return [1, 2, 3, 4, 5].map((starNumber) => {
      const filled = rating >= starNumber;

      const partiallyFilled =
        rating >= starNumber - 0.5 &&
        rating < starNumber;

      return (
        <Star
          key={starNumber}
          className={`w-4 h-4 ${
            filled || partiallyFilled
              ? 'fill-amber-400 text-amber-400'
              : 'text-neutral-300'
          }`}
        />
      );
    });
  };

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">

      {/* =====================================================
          BREADCRUMBS
      ====================================================== */}

      <nav
        aria-label="Breadcrumb"
        className="text-xs text-neutral-500 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="hover:text-neutral-900 transition-colors"
        >
          Home
        </button>

        <span>/</span>

        <button
          type="button"
          onClick={() => onNavigate('/shop')}
          className="hover:text-neutral-900 transition-colors"
        >
          {product.categoryName || 'Shop'}
        </button>

        <span>/</span>

        <span className="text-neutral-900 font-semibold truncate">
          {product.name}
        </span>
      </nav>

      {/* =====================================================
          PRODUCT SHOWCASE
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">

        {/* ===================================================
            PRODUCT GALLERY
        ==================================================== */}

        <div className="lg:col-span-7">
          <ProductGallery
            images={product.images || []}
            productName={product.name}
          />
        </div>

        {/* ===================================================
            PRODUCT INFORMATION
        ==================================================== */}

        <div className="lg:col-span-5 space-y-6">

          {/* BRAND + TITLE */}

          <div>
            <div className="flex items-center justify-between gap-4">

              <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
                {product.brand || 'Brand'}
                {' • '}
                {product.categoryName || 'Apparel'}
              </span>

              {product.sku && (
                <span className="text-[11px] font-mono font-medium text-neutral-400 shrink-0">
                  SKU: {product.sku}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-neutral-900 tracking-tight mt-1">
              {product.name}
            </h1>

            {/* RATING */}

            <div className="flex items-center gap-2 mt-2">

              <div
                className="flex items-center"
                aria-label={`${rating} out of 5 stars`}
              >
                {renderRatingStars()}
              </div>

              <span className="text-xs font-bold text-neutral-900">
                {rating > 0 ? rating.toFixed(1) : 'No rating'}
              </span>

              <span className="text-xs text-neutral-400">
                (
                {reviewCount}
                {' '}
                {reviewCount === 1 ? 'review' : 'reviews'}
                )
              </span>
            </div>
          </div>

          {/* =================================================
              PRICE
          ================================================== */}

          <div className="flex items-baseline gap-3 pb-4 border-b border-neutral-100">

            <span className="text-2xl sm:text-3xl font-black text-neutral-900">
              ${price.toFixed(2)}
            </span>

            {compareAtPrice > price && (
              <>
                <span className="text-base text-neutral-400 line-through">
                  ${compareAtPrice.toFixed(2)}
                </span>

                {discountPercentage > 0 && (
                  <span className="px-2 py-0.5 bg-neutral-100 text-neutral-900 border border-neutral-300 text-xs font-bold rounded">
                    Save {discountPercentage}%
                  </span>
                )}
              </>
            )}
          </div>

          {/* =================================================
              COLOR SELECTOR
          ================================================== */}

          {colors.length > 0 && (
            <div>

              <div className="flex items-center justify-between mb-2">

                <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                  Color:{' '}
                  <span className="text-neutral-900 font-black">
                    {selectedColor || 'Select color'}
                  </span>
                </span>

              </div>

              <div className="flex items-center gap-2.5 flex-wrap">

                {colors.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() =>
                      handleColorChange(color.name)
                    }
                    className={`relative p-1 rounded-full border transition-all ${
                      selectedColor === color.name
                        ? 'border-neutral-950 ring-2 ring-neutral-950'
                        : 'border-neutral-300 hover:border-neutral-700'
                    }`}
                    title={color.name}
                    aria-label={`Select ${color.name}`}
                    aria-pressed={
                      selectedColor === color.name
                    }
                  >
                    <span
                      className="block w-6 h-6 rounded-full border border-neutral-200"
                      style={{
                        backgroundColor:
                          color.hex || '#000000',
                      }}
                    />
                  </button>
                ))}

              </div>
            </div>
          )}

          {/* =================================================
              SIZE SELECTOR
          ================================================== */}

          {sizes.length > 0 && (
            <div>

              <div className="flex items-center justify-between mb-2">

                <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                  Size:{' '}
                  <span className="text-neutral-900 font-black">
                    {selectedSize || 'Select size'}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setIsSizeGuideOpen(true)
                  }
                  className="text-xs font-semibold text-neutral-600 hover:text-neutral-950 flex items-center gap-1 underline"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Guide</span>
                </button>

              </div>

              <div
                className={`grid gap-2 ${
                  sizes.length >= 5
                    ? 'grid-cols-5'
                    : `grid-cols-${Math.min(
                        sizes.length,
                        4
                      )}`
                }`}
              >
                {sizes.map((size) => {
                  const isOOS =
                    isSizeOutOfStock(size);

                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={isOOS}
                      onClick={() =>
                        handleSizeChange(size)
                      }
                      className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
                        selectedSize === size
                          ? 'bg-neutral-950 text-white border-neutral-950 shadow-xs'
                          : isOOS
                          ? 'bg-neutral-100 text-neutral-300 border-neutral-200 line-through cursor-not-allowed'
                          : 'bg-white text-neutral-800 border-neutral-300 hover:border-neutral-950'
                      }`}
                      aria-label={`Size ${size}`}
                      aria-pressed={
                        selectedSize === size
                      }
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              {/* INVENTORY STATUS */}

              <div className="mt-2 text-xs">

                {isOutOfStock ? (
                  <span className="text-rose-600 font-bold">
                    Out of stock in{' '}
                    {selectedSize || 'selected size'}
                    {' / '}
                    {selectedColor || 'selected color'}
                  </span>
                ) : maxStock < 10 ? (
                  <span className="text-amber-600 font-bold">
                    Only {maxStock} left in stock —
                    order soon
                  </span>
                ) : (
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    In stock and ready to dispatch
                  </span>
                )}

              </div>
            </div>
          )}

          {/* =================================================
              QUANTITY + ACTIONS
          ================================================== */}

          <div className="space-y-3 pt-2">

            <div className="flex items-center gap-3">

              {/* QUANTITY */}

              <div className="flex items-center border border-neutral-300 rounded-lg p-1 bg-neutral-50 shrink-0">

                <button
                  type="button"
                  disabled={
                    quantity <= 1 ||
                    isOutOfStock
                  }
                  onClick={
                    handleQuantityDecrease
                  }
                  className="p-1.5 text-neutral-600 hover:text-neutral-950 disabled:opacity-30"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <span className="w-8 text-center text-xs font-black text-neutral-900">
                  {quantity}
                </span>

                <button
                  type="button"
                  disabled={
                    quantity >= maxStock ||
                    isOutOfStock
                  }
                  onClick={
                    handleQuantityIncrease
                  }
                  className="p-1.5 text-neutral-600 hover:text-neutral-950 disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>

              </div>

              {/* ADD TO CART */}

              <button
                id="add-to-cart-btn"
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="flex-1 py-3.5 bg-neutral-950 hover:bg-neutral-800 disabled:bg-neutral-300 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />

                <span>
                  {isOutOfStock
                    ? 'Sold Out'
                    : 'Add To Bag'}
                </span>
              </button>

              {/* WISHLIST */}

              <button
                id="pdp-wishlist-btn"
                type="button"
                onClick={handleWishlist}
                className={`p-3.5 border rounded-lg transition-colors shrink-0 ${
                  isSaved
                    ? 'bg-neutral-950 text-white border-neutral-950'
                    : 'border-neutral-300 text-neutral-700 hover:border-neutral-950'
                }`}
                aria-label={
                  isSaved
                    ? 'Remove from wishlist'
                    : 'Add to wishlist'
                }
                aria-pressed={isSaved}
              >
                <Heart
                  className={`w-4 h-4 ${
                    isSaved ? 'fill-white' : ''
                  }`}
                />
              </button>

            </div>

            {/* BUY NOW */}

            <button
              id="buy-now-btn"
              type="button"
              disabled={isOutOfStock}
              onClick={handleBuyNow}
              className="w-full py-3 bg-white hover:bg-neutral-100 disabled:bg-neutral-100 disabled:text-neutral-400 text-neutral-950 border border-neutral-900 disabled:border-neutral-300 text-xs font-black uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />

              <span>
                {isOutOfStock
                  ? 'Sold Out'
                  : 'Instant Buy Now'}
              </span>
            </button>

          </div>

          {/* =================================================
              DYNAMIC VALUE PROPS
          ================================================== */}

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-neutral-100 text-center text-[11px] text-neutral-600">

            <div
              className="p-2 bg-neutral-50 rounded-lg"
              title={freeShippingText}
            >
              <Truck className="w-4 h-4 mx-auto mb-1 text-neutral-900" />

              <span className="block line-clamp-2">
                {freeShippingText}
              </span>
            </div>

            <div
              className="p-2 bg-neutral-50 rounded-lg"
              title={weightText}
            >
              <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-neutral-900" />

              <span className="block line-clamp-2">
                {weightText}
              </span>
            </div>

            <div
              className="p-2 bg-neutral-50 rounded-lg"
              title={returnText}
            >
              <RotateCcw className="w-4 h-4 mx-auto mb-1 text-neutral-900" />

              <span className="block line-clamp-2">
                {returnText}
              </span>
            </div>

          </div>

          {/* =================================================
              PRODUCT ACCORDIONS
          ================================================== */}

          <div className="border-t border-neutral-200 divide-y divide-neutral-200">

            {/* FABRIC */}

            <div>
              <button
                type="button"
                onClick={() =>
                  toggleAccordion('specs')
                }
                className="w-full py-3.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-900"
                aria-expanded={
                  openAccordion === 'specs'
                }
              >
                <span>
                  {details.specsTitle ||
                    'Fabric & Engineering Details'}
                </span>

                {openAccordion === 'specs' ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {openAccordion === 'specs' && (
                <div className="pb-4 text-xs text-neutral-600 space-y-2 leading-relaxed animate-in fade-in duration-150">

                  {product.description && (
                    <p>{product.description}</p>
                  )}

                  <ul className="list-disc pl-4 space-y-1 text-neutral-700">

                    <li>
                      Fabric:{' '}
                      {fabric}
                    </li>

                    {gsm !== null && (
                      <li>
                        Fabric Weight:{' '}
                        {gsm} GSM
                      </li>
                    )}

                    <li>
                      Fit:{' '}
                      {fit}
                    </li>

                    <li>
                      Collar:{' '}
                      {collar}
                    </li>

                    {modelDetails && (
                      <li>
                        {modelDetails}
                      </li>
                    )}

                  </ul>
                </div>
              )}
            </div>

            {/* WASH CARE */}

            <div>
              <button
                type="button"
                onClick={() =>
                  toggleAccordion('wash')
                }
                className="w-full py-3.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-900"
                aria-expanded={
                  openAccordion === 'wash'
                }
              >
                <span>
                  {details.washTitle ||
                    'Wash & Garment Care'}
                </span>

                {openAccordion === 'wash' ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {openAccordion === 'wash' && (
                <div className="pb-4 text-xs text-neutral-600 space-y-1.5 leading-relaxed animate-in fade-in duration-150">

                  {Array.isArray(washCare) ? (
                    washCare.map(
                      (
                        instruction: string,
                        index: number
                      ) => (
                        <p key={index}>
                          • {instruction}
                        </p>
                      )
                    )
                  ) : (
                    <p>
                      • {washCare}
                    </p>
                  )}

                </div>
              )}
            </div>

            {/* SHIPPING + RETURNS */}

            <div>
              <button
                type="button"
                onClick={() =>
                  toggleAccordion('shipping')
                }
                className="w-full py-3.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-900"
                aria-expanded={
                  openAccordion === 'shipping'
                }
              >
                <span>
                  {details.shippingTitle ||
                    'Shipping & Returns'}
                </span>

                {openAccordion === 'shipping' ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {openAccordion === 'shipping' && (
                <div className="pb-4 text-xs text-neutral-600 space-y-2 leading-relaxed animate-in fade-in duration-150">

                  <p>
                    • {shippingText}
                  </p>

                  <p>
                    • {returnText}
                  </p>

                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* =====================================================
          REVIEWS
      ====================================================== */}

      <section className="pt-8 border-t border-neutral-200">
        <ProductReviews product={product} />
      </section>

      {/* =====================================================
          RELATED PRODUCTS
      ====================================================== */}

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

            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                product={relatedProduct}
                onSelect={onSelectProduct}
              />
            ))}

          </div>
        </section>
      )}

      {/* =====================================================
          SIZE GUIDE
      ====================================================== */}

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() =>
          setIsSizeGuideOpen(false)
        }
      />

    </div>
  );
};
