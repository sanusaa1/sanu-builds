import React from 'react';
import {
  ArrowRight,
  Sparkles,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { Product, Category } from '../types';
import { ProductCard } from '../components/product/ProductCard';

interface HomePageProps {
  products: Product[];
  categories: Category[];
  onSelectProduct: (slug: string) => void;
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  categories,
  onSelectProduct,
  onNavigate,
}) => {
  /*
   * IMPORTANT:
   * Products and categories are received from the parent.
   * The parent should load them from Firestore using getProducts()
   * and getCategories().
   *
   * No product is created/hardcoded inside this page.
   */

  // Only active products should be displayed.
  const activeProducts = products.filter(
    (product) => product.active !== false
  );

  /*
   * Featured Products
   * Firestore field:
   * featured: true
   */
  const featuredProducts = activeProducts
    .filter((product) => product.featured === true)
    .slice(0, 4);

  /*
   * Best Sellers
   * Firestore field:
   * bestseller: true
   */
  const bestSellers = activeProducts
    .filter((product) => product.bestseller === true)
    .slice(0, 4);

  /*
   * New Arrivals
   * Firestore field:
   * newArrival: true
   *
   * createdAt is also used as a fallback so that
   * newly created Firestore products can still appear.
   */
  const newArrivals = [...activeProducts]
    .filter(
      (product) =>
        product.newArrival === true || product.featured === true
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 4);

  /*
   * If no product has bestseller/newArrival/featured flags,
   * we do NOT create dummy products.
   *
   * Instead we simply show the newest real Firestore products.
   */
  const fallbackProducts = [...activeProducts]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 4);

  const displayedBestSellers =
    bestSellers.length > 0 ? bestSellers : fallbackProducts;

  const displayedNewArrivals =
    newArrivals.length > 0 ? newArrivals : fallbackProducts;

  /*
   * Categories are also coming directly from Firestore.
   * No category is hardcoded here.
   */
  const displayedCategories = categories
    .filter((category) => category.active !== false)
    .slice(0, 4);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* =========================================================
          HERO
      ========================================================== */}
      <section className="relative bg-neutral-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-neutral-300 text-xs font-semibold uppercase tracking-widest mb-6 backdrop-blur-xs border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-neutral-200" />

            <span>
              2026 Core Collection • 240+ GSM Heavyweight
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-white uppercase max-w-4xl leading-[1.05]">
            BUILD YOUR STYLE.
          </h1>

          <p className="mt-6 text-sm sm:text-base text-neutral-400 max-w-xl font-normal leading-relaxed">
            Premium heavyweight T-shirts designed for people who build,
            create, code, and move forward. Zero compromise on fabric
            density, neck structure, or drape.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              id="hero-shop-cta-btn"
              onClick={() => onNavigate('/shop')}
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-neutral-950 hover:bg-neutral-200 text-xs font-black uppercase tracking-wider rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span>Shop T-Shirts</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-oversized-cta-btn"
              onClick={() =>
                onNavigate('/category/oversized-tees')
              }
              className="w-full sm:w-auto px-7 py-3.5 bg-neutral-900/80 hover:bg-neutral-800 text-white border border-neutral-700 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Oversized</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================
          CATEGORIES - FIRESTORE DYNAMIC
      ========================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Curated Silhouettes
            </span>

            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              Shop by Category
            </h2>
          </div>

          <button
            onClick={() => onNavigate('/shop')}
            className="text-xs font-bold text-neutral-900 hover:text-neutral-600 flex items-center gap-1 uppercase tracking-wider"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {displayedCategories.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 py-12 text-center">
            <p className="text-sm font-semibold text-neutral-700">
              No categories available.
            </p>

            <p className="text-xs text-neutral-500 mt-1">
              Categories added from the admin panel will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {displayedCategories.map((cat) => (
              <div
                key={cat.id}
                onClick={() =>
                  onNavigate(
                    `/category/${cat.slug || cat.id}`
                  )
                }
                className="group relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer bg-neutral-100 border border-neutral-200 shadow-xs"
              >
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      {cat.name}
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent flex flex-col justify-end p-4 text-white">
                  <h3 className="text-sm sm:text-base font-black tracking-tight">
                    {cat.name}
                  </h3>

                  {cat.description && (
                    <p className="text-[11px] text-neutral-300 line-clamp-2 mt-0.5">
                      {cat.description}
                    </p>
                  )}

                  <span className="text-[10px] font-bold uppercase tracking-wider text-white mt-2 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Explore
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =========================================================
          NEW ARRIVALS - FIRESTORE PRODUCTS
      ========================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Fresh Off The Loom
            </span>

            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              New Arrivals
            </h2>
          </div>

          <button
            onClick={() => onNavigate('/shop')}
            className="text-xs font-bold text-neutral-900 hover:text-neutral-600 flex items-center gap-1 uppercase tracking-wider"
          >
            <span>See Everything</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {displayedNewArrivals.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 py-12 text-center">
            <p className="text-sm font-semibold text-neutral-700">
              No products available.
            </p>

            <p className="text-xs text-neutral-500 mt-1">
              Products added from the admin panel will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayedNewArrivals.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}
      </section>

      {/* =========================================================
          FABRIC / BRAND STORY
          Static marketing content - NOT product data
      ========================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-900 text-white rounded-2xl overflow-hidden border border-neutral-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-8 sm:p-12 lg:p-16">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800 text-neutral-300 text-xs font-semibold uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-neutral-300" />

                <span>The Sanu Standard</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
                Crafted for durability. Engineered to never bacon.
              </h2>

              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Most commercial t-shirts lose their collar shape after
                three washes. Sanu Builds tees use custom 1.25" ribbing
                with internal Lycra memory cores, 240–280 GSM ringspun
                combed cotton, and twin-needle arm hems.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 bg-neutral-800/80 rounded-lg border border-neutral-700">
                  <span className="block text-xl font-black text-white">
                    240+ GSM
                  </span>

                  <span className="text-[11px] text-neutral-400">
                    Dense, zero see-through drape
                  </span>
                </div>

                <div className="p-3.5 bg-neutral-800/80 rounded-lg border border-neutral-700">
                  <span className="block text-xl font-black text-white">
                    Pre-Shrunk
                  </span>

                  <span className="text-[11px] text-neutral-400">
                    Bio-washed dimensional hold
                  </span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('/shop')}
                className="px-6 py-3 bg-white text-neutral-950 hover:bg-neutral-200 text-xs font-black uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2"
              >
                <span>Experience The Difference</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-neutral-700 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80"
                alt="Sanu Builds Fabric Close-up"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          BEST SELLERS - FIRESTORE PRODUCTS
      ========================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Community Favorites
            </span>

            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              Best Sellers
            </h2>
          </div>

          <button
            onClick={() => onNavigate('/shop')}
            className="text-xs font-bold text-neutral-900 hover:text-neutral-600 flex items-center gap-1 uppercase tracking-wider"
          >
            <span>Shop All Best Sellers</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {displayedBestSellers.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 py-12 text-center">
            <p className="text-sm font-semibold text-neutral-700">
              No products available.
            </p>

            <p className="text-xs text-neutral-500 mt-1">
              Products added from the admin panel will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayedBestSellers.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
