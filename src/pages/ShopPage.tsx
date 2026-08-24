import React, { useEffect, useMemo, useState } from 'react';
import {
  SlidersHorizontal,
  X,
  Search,
  Check,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { Product, Category, FilterState } from '../types';
import { ProductCard } from '../components/product/ProductCard';

interface ShopPageProps {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
  initialSearch?: string;
  onSelectProduct: (slug: string) => void;
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  categories,
  initialCategory = 'all',
  initialSearch = '',
  onSelectProduct,
}) => {
  const [selectedCategory, setSelectedCategory] =
    useState<string>(initialCategory);

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  /*
   * Firebase products ke actual prices se maximum price calculate hoga.
   *
   * Example:
   * ₹110
   * ₹180
   * ₹340
   * ₹1699
   *
   * To slider automatically ₹1699+ tak jayega.
   */
  const catalogMaxPrice = useMemo(() => {
    const prices = products
      .map((product) => Number(product.price) || 0)
      .filter((price) => price > 0);

    if (prices.length === 0) {
      return 1000;
    }

    const maxPrice = Math.max(...prices);

    // Slider ko thoda extra range dete hain.
    return Math.max(100, Math.ceil(maxPrice / 100) * 100);
  }, [products]);

  /*
   * null = no price filter applied.
   */
  const [priceMax, setPriceMax] = useState<number | null>(null);

  /*
   * Firebase se products load hone ke baad agar current price
   * selected maximum catalog se chhota hai to usko automatically
   * valid range me rakho.
   */
  useEffect(() => {
    setPriceMax((previous) => {
      if (previous === null) {
        return null;
      }

      return Math.min(previous, catalogMaxPrice);
    });
  }, [catalogMaxPrice]);

  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  const [sortBy, setSortBy] =
    useState<FilterState['sortBy']>('popular');

  const [searchQuery, setSearchQuery] =
    useState<string>(initialSearch);

  const [isMobileFilterOpen, setIsMobileFilterOpen] =
    useState<boolean>(false);

  /*
   * Firebase se aaye products ke actual colors.
   *
   * Ab hardcoded:
   * Onyx Black
   * Pure Chalk
   *
   * ki jagah Firebase me jo actual colors hain wahi show honge.
   */
  const availableColors = useMemo(() => {
    const colorMap = new Map<string, string>();

    products.forEach((product) => {
      product.colors?.forEach((color) => {
        const name = color?.name?.trim();

        if (!name) {
          return;
        }

        const key = name.toLowerCase();

        if (!colorMap.has(key)) {
          colorMap.set(key, name);
        }
      });
    });

    return Array.from(colorMap.values()).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [products]);

  /*
   * Firebase products ke actual sizes.
   */
  const availableSizes = useMemo(() => {
    const sizeSet = new Set<string>();

    products.forEach((product) => {
      product.sizes?.forEach((size) => {
        if (size?.trim()) {
          sizeSet.add(size.trim());
        }
      });
    });

    const preferredOrder = [
      'XS',
      'S',
      'M',
      'L',
      'XL',
      'XXL',
      'Free Size',
    ];

    return Array.from(sizeSet).sort((a, b) => {
      const aIndex = preferredOrder.indexOf(a);
      const bIndex = preferredOrder.indexOf(b);

      if (aIndex === -1 && bIndex === -1) {
        return a.localeCompare(b);
      }

      if (aIndex === -1) {
        return 1;
      }

      if (bIndex === -1) {
        return -1;
      }

      return aIndex - bIndex;
    });
  }, [products]);

  const toggleSize = (size: string) => {
    setSelectedSizes((previous) =>
      previous.includes(size)
        ? previous.filter((item) => item !== size)
        : [...previous, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((previous) =>
      previous.includes(color)
        ? previous.filter((item) => item !== color)
        : [...previous, color]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceMax(null);
    setInStockOnly(false);
    setSearchQuery('');
    setSortBy('popular');
  };

  /*
   * Main catalog filtering.
   *
   * IMPORTANT:
   * Firebase se aaye actual product price ko INR me use karta hai.
   * Pehle priceMax = 80 tha, jiski wajah se ₹110, ₹180,
   * ₹340 aur ₹1699 sab hide ho rahe the.
   */
  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      /*
       * ---------------------------------------------------------------
       * CATEGORY
       * ---------------------------------------------------------------
       */
      if (
        selectedCategory &&
        selectedCategory !== 'all'
      ) {
        const selected = selectedCategory
          .toLowerCase()
          .trim();

        const categoryId =
          product.categoryId?.toLowerCase().trim() || '';

        const categoryName =
          product.categoryName?.toLowerCase().trim() || '';

        const slug =
          product.slug?.toLowerCase().trim() || '';

        const normalizedCategoryName =
          categoryName.replace(/\s+/g, '-');

        const normalizedSelected =
          selected.replace(/\s+/g, '-');

        const categoryMatches =
          categoryId === selected ||
          categoryName === selected ||
          normalizedCategoryName === normalizedSelected ||
          slug.includes(selected);

        if (!categoryMatches) {
          return false;
        }
      }

      /*
       * ---------------------------------------------------------------
       * SEARCH
       * ---------------------------------------------------------------
       */
      if (searchQuery.trim()) {
        const query = searchQuery
          .toLowerCase()
          .trim();

        const searchableText = [
          product.name,
          product.description,
          product.sku,
          product.brand,
          product.categoryName,
          ...(product.tags || []),
          product.details?.fabric,
          product.details?.fit,
          product.details?.gsm
            ? `${product.details.gsm}gsm`
            : '',
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchableText.includes(query)) {
          return false;
        }
      }

      /*
       * ---------------------------------------------------------------
       * SIZE
       * ---------------------------------------------------------------
       */
      if (selectedSizes.length > 0) {
        const productSizes = product.sizes || [];

        const hasSize = productSizes.some((size) =>
          selectedSizes.includes(size)
        );

        if (!hasSize) {
          return false;
        }
      }

      /*
       * ---------------------------------------------------------------
       * COLOR
       * ---------------------------------------------------------------
       */
      if (selectedColors.length > 0) {
        const productColors =
          product.colors || [];

        const hasColor = productColors.some(
          (color) =>
            selectedColors.some(
              (selectedColor) =>
                selectedColor.toLowerCase() ===
                color.name?.toLowerCase()
            )
        );

        if (!hasColor) {
          return false;
        }
      }

      /*
       * ---------------------------------------------------------------
       * PRICE
       * ---------------------------------------------------------------
       *
       * priceMax === null means no price filter.
       */
      if (
        priceMax !== null &&
        Number(product.price) > priceMax
      ) {
        return false;
      }

      /*
       * ---------------------------------------------------------------
       * STOCK
       * ---------------------------------------------------------------
       */
      if (
        inStockOnly &&
        (Number(product.stock) || 0) <= 0
      ) {
        return false;
      }

      /*
       * Only active products.
       */
      if (product.active === false) {
        return false;
      }

      return true;
    });

    /*
     * ---------------------------------------------------------------
     * SORT
     * ---------------------------------------------------------------
     */
    return result.sort((a, b) => {
      if (sortBy === 'newest') {
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      }

      if (sortBy === 'price-low') {
        return (
          Number(a.price) -
          Number(b.price)
        );
      }

      if (sortBy === 'price-high') {
        return (
          Number(b.price) -
          Number(a.price)
        );
      }

      if (sortBy === 'best-rated') {
        return (
          Number(b.rating || 0) -
          Number(a.rating || 0)
        );
      }

      /*
       * Popular
       */
      return (
        Number(b.reviewCount || 0) -
        Number(a.reviewCount || 0)
      );
    });
  }, [
    products,
    selectedCategory,
    searchQuery,
    selectedSizes,
    selectedColors,
    priceMax,
    inStockOnly,
    sortBy,
  ]);

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    priceMax !== null ||
    inStockOnly ||
    searchQuery.trim() !== '';

  const selectedCategoryName =
    selectedCategory === 'all'
      ? 'All Products'
      : categories.find(
          (category) =>
            category.slug === selectedCategory ||
            category.id === selectedCategory
        )?.name || 'Collection';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ================================================================
          HEADER
      ================================================================ */}
      <div className="border-b border-neutral-200 pb-6 mb-8">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
          Sanu Builds Catalog
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight uppercase mt-1">
          {selectedCategoryName}
        </h1>

        <p className="text-xs text-neutral-500 mt-1">
          Showing {filteredProducts.length} of {products.length}{' '}
          products
        </p>
      </div>

      {/* ================================================================
          CATEGORY PILLS
      ================================================================ */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
            selectedCategory === 'all'
              ? 'bg-neutral-950 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          All Products
        </button>

        {categories.map((category) => {
          const categoryValue =
            category.slug || category.id;

          const isSelected =
            selectedCategory === categoryValue ||
            selectedCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() =>
                setSelectedCategory(categoryValue)
              }
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                isSelected
                  ? 'bg-neutral-950 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {category.name}
            </button>
          );
        })}
      </div>

      {/* ================================================================
          SEARCH / SORT
      ================================================================ */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />

          <input
            type="text"
            placeholder="Search products, GSM, brand, SKU..."
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
            className="w-full pl-9 pr-8 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors"
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() =>
              setIsMobileFilterOpen(true)
            }
            className="lg:hidden flex-1 sm:flex-none px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />

            <span>
              Filters {hasActiveFilters && '•'}
            </span>
          </button>

          <div className="relative flex-1 sm:flex-none">
            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target.value as FilterState['sortBy']
                )
              }
              className="w-full appearance-none pl-3 pr-8 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-bold text-neutral-900 focus:outline-none focus:border-neutral-900 cursor-pointer"
            >
              <option value="popular">
                Sort: Most Popular
              </option>

              <option value="newest">
                Sort: Newest Drops
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

              <option value="price-high">
                Price: High to Low
              </option>

              <option value="best-rated">
                Highest Rated
              </option>
            </select>

            <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ================================================================
          MAIN CONTENT
      ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* ============================================================
            DESKTOP FILTER SIDEBAR
        ============================================================ */}
        <div className="hidden lg:block space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Filters
            </span>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 underline"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Sizes */}
          {availableSizes.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2.5">
                Sizes
              </h4>

              <div className="grid grid-cols-3 gap-1.5">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() =>
                      toggleSize(size)
                    }
                    className={`py-1.5 text-xs font-bold rounded border transition-colors ${
                      selectedSizes.includes(size)
                        ? 'bg-neutral-950 text-white border-neutral-950'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-900'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {availableColors.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2.5">
                Colors
              </h4>

              <div className="space-y-1.5">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() =>
                      toggleColor(color)
                    }
                    className="w-full flex items-center justify-between py-1 px-1.5 rounded hover:bg-neutral-50 text-xs text-left"
                  >
                    <span className="text-neutral-700">
                      {color}
                    </span>

                    {selectedColors.includes(color) && (
                      <Check className="w-3.5 h-3.5 text-neutral-950" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Max Price
              </h4>

              <span className="text-xs font-bold text-neutral-950">
                ₹
                {priceMax === null
                  ? catalogMaxPrice
                  : priceMax}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max={catalogMaxPrice}
              step={catalogMaxPrice >= 1000 ? 10 : 1}
              value={
                priceMax === null
                  ? catalogMaxPrice
                  : Math.min(
                      priceMax,
                      catalogMaxPrice
                    )
              }
              onChange={(event) =>
                setPriceMax(
                  Number(event.target.value)
                )
              }
              className="w-full accent-neutral-950"
            />

            <div className="flex justify-between mt-1 text-[10px] text-neutral-400">
              <span>₹0</span>
              <span>₹{catalogMaxPrice}</span>
            </div>
          </div>

          {/* Stock */}
          <div className="pt-2 border-t border-neutral-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-800">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(event) =>
                  setInStockOnly(
                    event.target.checked
                  )
                }
                className="rounded text-neutral-950 focus:ring-neutral-950"
              />

              <span>In Stock Only</span>
            </label>
          </div>
        </div>

        {/* ============================================================
            PRODUCTS GRID
        ============================================================ */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
              <p className="text-base font-bold text-neutral-900">
                No products match your active filters.
              </p>

              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Try clearing the filters or selecting
                another category to see the full
                catalog.
              </p>

              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />

                <span>Reset Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={onSelectProduct}
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================================================================
          MOBILE FILTER DRAWER
      ================================================================ */}
      {isMobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-neutral-950/60 backdrop-blur-sm lg:hidden"
          onClick={() =>
            setIsMobileFilterOpen(false)
          }
        >
          <div
            className="w-full max-w-xs bg-white h-full p-6 space-y-6 overflow-y-auto"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="font-bold text-sm uppercase tracking-wider text-neutral-900">
                Filter Products
              </h3>

              <button
                onClick={() =>
                  setIsMobileFilterOpen(false)
                }
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            {/* Mobile Sizes */}
            {availableSizes.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                  Sizes
                </h4>

                <div className="grid grid-cols-3 gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() =>
                        toggleSize(size)
                      }
                      className={`py-2 text-xs font-bold rounded border ${
                        selectedSizes.includes(size)
                          ? 'bg-neutral-950 text-white border-neutral-950'
                          : 'bg-white text-neutral-700 border-neutral-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile Colors */}
            {availableColors.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                  Colors
                </h4>

                <div className="space-y-2">
                  {availableColors.map(
                    (color) => (
                      <button
                        key={color}
                        onClick={() =>
                          toggleColor(color)
                        }
                        className="w-full flex items-center justify-between py-1 text-xs"
                      >
                        <span>{color}</span>

                        {selectedColors.includes(
                          color
                        ) && (
                          <Check className="w-4 h-4 text-neutral-950" />
                        )}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Mobile Price */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span>Max Price</span>

                <span>
                  ₹
                  {priceMax === null
                    ? catalogMaxPrice
                    : priceMax}
                </span>
              </div>

              <input
                type="range"
                min="0"
                max={catalogMaxPrice}
                step={catalogMaxPrice >= 1000 ? 10 : 1}
                value={
                  priceMax === null
                    ? catalogMaxPrice
                    : Math.min(
                        priceMax,
                        catalogMaxPrice
                      )
                }
                onChange={(event) =>
                  setPriceMax(
                    Number(event.target.value)
                  )
                }
                className="w-full accent-neutral-950"
              />

              <div className="flex justify-between mt-1 text-[10px] text-neutral-400">
                <span>₹0</span>
                <span>₹{catalogMaxPrice}</span>
              </div>
            </div>

            {/* Mobile Stock */}
            <div className="pt-4 border-t border-neutral-200">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-800">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(event) =>
                    setInStockOnly(
                      event.target.checked
                    )
                  }
                  className="rounded text-neutral-950 focus:ring-neutral-950"
                />

                <span>In Stock Only</span>
              </label>
            </div>

            {/* Mobile Buttons */}
            <div className="pt-4 border-t border-neutral-200 flex gap-3">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-2.5 border border-neutral-300 text-xs font-bold uppercase rounded-lg"
              >
                Reset
              </button>

              <button
                onClick={() =>
                  setIsMobileFilterOpen(false)
                }
                className="flex-1 py-2.5 bg-neutral-950 text-white text-xs font-bold uppercase rounded-lg"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
