import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, X, Search, Check, ChevronDown, RefreshCw } from 'lucide-react';
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
const COLORS = ['Onyx Black', 'Pure Chalk', 'Raw Slate', 'Charcoal Wash', 'Vintage Sand', 'Forest Moss'];

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  categories,
  initialCategory = 'all',
  initialSearch = '',
  onSelectProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceMax, setPriceMax] = useState<number>(80);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<FilterState['sortBy']>('popular');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceMax(80);
    setInStockOnly(false);
    setSearchQuery('');
    setSortBy('popular');
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category
      if (selectedCategory && selectedCategory !== 'all') {
        const catMatch =
          p.categoryId === selectedCategory ||
          p.categoryName?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          p.slug.includes(selectedCategory);
        if (!catMatch) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Sizes
      if (selectedSizes.length > 0) {
        const hasSize = p.sizes.some((s) => selectedSizes.includes(s));
        if (!hasSize) return false;
      }

      // Colors
      if (selectedColors.length > 0) {
        const hasColor = p.colors.some((c) => selectedColors.includes(c.name));
        if (!hasColor) return false;
      }

      // Price
      if (p.price > priceMax) return false;

      // In stock
      if (inStockOnly && (p.stock || 0) <= 0) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === 'price-low') {
        return a.price - b.price;
      }
      if (sortBy === 'price-high') {
        return b.price - a.price;
      }
      if (sortBy === 'best-rated') {
        return (b.rating || 0) - (a.rating || 0);
      }
      // Popular default
      return (b.reviewCount || 0) - (a.reviewCount || 0);
    });
  }, [products, selectedCategory, searchQuery, selectedSizes, selectedColors, priceMax, inStockOnly, sortBy]);

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    priceMax < 80 ||
    inStockOnly ||
    searchQuery.trim() !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Breadcrumb */}
      <div className="border-b border-neutral-200 pb-6 mb-8">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
          Sanu Builds Catalog
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight uppercase mt-1">
          {selectedCategory === 'all' ? 'All T-Shirts' : categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory)?.name || 'Collection'}
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Showing {filteredProducts.length} premium heavyweight styles
        </p>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
            selectedCategory === 'all'
              ? 'bg-neutral-950 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          All Silhouettes
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.slug || cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
              selectedCategory === cat.slug || selectedCategory === cat.id
                ? 'bg-neutral-950 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Control bar: Search, Filter toggle, Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        {/* Search inside shop */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by name, GSM, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

        {/* Sort & Mobile Filter Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex-1 sm:flex-none px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters {hasActiveFilters && '•'}</span>
          </button>

          <div className="relative flex-1 sm:flex-none">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as FilterState['sortBy'])}
              className="w-full appearance-none pl-3 pr-8 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-bold text-neutral-900 focus:outline-none focus:border-neutral-900 cursor-pointer"
            >
              <option value="popular">Sort: Most Popular</option>
              <option value="newest">Sort: Newest Drops</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="best-rated">Highest Rated</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Content Layout (Sidebar + Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
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
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2.5">
              Sizes
            </h4>
            <div className="grid grid-cols-3 gap-1.5">
              {SIZES.map((sz) => (
                <button
                  key={sz}
                  onClick={() => toggleSize(sz)}
                  className={`py-1.5 text-xs font-bold rounded border transition-colors ${
                    selectedSizes.includes(sz)
                      ? 'bg-neutral-950 text-white border-neutral-950'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-900'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2.5">
              Colors
            </h4>
            <div className="space-y-1.5">
              {COLORS.map((col) => (
                <button
                  key={col}
                  onClick={() => toggleColor(col)}
                  className="w-full flex items-center justify-between py-1 px-1.5 rounded hover:bg-neutral-50 text-xs text-left"
                >
                  <span className="text-neutral-700">{col}</span>
                  {selectedColors.includes(col) && <Check className="w-3.5 h-3.5 text-neutral-950" />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Max Price
              </h4>
              <span className="text-xs font-bold text-neutral-950">${priceMax}</span>
            </div>
            <input
              type="range"
              min="20"
              max="80"
              step="2"
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full accent-neutral-950"
            />
          </div>

          {/* In Stock Toggle */}
          <div className="pt-2 border-t border-neutral-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-800">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-neutral-950 focus:ring-neutral-950"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
              <p className="text-base font-bold text-neutral-900">No t-shirts match your active filters.</p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Try widening your price range or clearing size filters to see our full catalog.
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
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-neutral-950/60 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileFilterOpen(false)}
        >
          <div
            className="w-full max-w-xs bg-white h-full p-6 space-y-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="font-bold text-sm uppercase tracking-wider text-neutral-900">
                Filter T-Shirts
              </h3>
              <button onClick={() => setIsMobileFilterOpen(false)}>
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            {/* Sizes */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">Sizes</h4>
              <div className="grid grid-cols-3 gap-2">
                {SIZES.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => toggleSize(sz)}
                    className={`py-2 text-xs font-bold rounded border ${
                      selectedSizes.includes(sz)
                        ? 'bg-neutral-950 text-white border-neutral-950'
                        : 'bg-white text-neutral-700 border-neutral-200'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">Colors</h4>
              <div className="space-y-2">
                {COLORS.map((col) => (
                  <button
                    key={col}
                    onClick={() => toggleColor(col)}
                    className="w-full flex items-center justify-between py-1 text-xs"
                  >
                    <span>{col}</span>
                    {selectedColors.includes(col) && <Check className="w-4 h-4 text-neutral-950" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span>Max Price</span>
                <span>${priceMax}</span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-neutral-950"
              />
            </div>

            <div className="pt-4 border-t border-neutral-200 flex gap-3">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-2.5 border border-neutral-300 text-xs font-bold uppercase rounded-lg"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
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
