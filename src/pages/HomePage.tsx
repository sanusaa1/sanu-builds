// src/pages/HomePage.tsx

import React, { useEffect, useMemo } from 'react';
import {
  ArrowRight,
  Sparkles,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { Product, Category } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { seedInitialStoreData } from '../data/seedData';

interface HomePageProps {
  products: Product[];
  categories: Category[];
  onSelectProduct: (slug: string) => void;
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

const SITE_URL = 'https://sanubuilds.com';
const SITE_NAME = 'Sanu Builds';
const DEFAULT_TITLE =
  'Sanu Builds | Premium Heavyweight T-Shirts & Oversized Tees';
const DEFAULT_DESCRIPTION =
  'Shop premium heavyweight T-shirts and oversized tees from Sanu Builds. Discover 240+ GSM heavyweight cotton, durable construction, premium fit, and modern streetwear styles.';
const DEFAULT_IMAGE =
  'https://ik.imagekit.io/4qm5muakl/Sanu%20Builds/9ea6d877-f53c-4cd6-94f9-c59a30566c9b.jpg';

export const HomePage: React.FC<HomePageProps> = ({
  products,
  categories,
  onSelectProduct,
  onNavigate,
}) => {
  /*
   * =========================================================
   * HOME PAGE SEO
   * =========================================================
   */

  useEffect(() => {
    document.title = DEFAULT_TITLE;

    const setMeta = (
      attribute: 'name' | 'property',
      key: string,
      content: string
    ) => {
      let element = document.head.querySelector<HTMLMetaElement>(
        `meta[${attribute}="${key}"]`
      );

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    };

    const setLink = (
      rel: string,
      href: string
    ) => {
      let element = document.head.querySelector<HTMLLinkElement>(
        `link[rel="${rel}"]`
      );

      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }

      element.setAttribute('href', href);
    };

    /*
     * Basic SEO
     */

    setMeta(
      'name',
      'description',
      DEFAULT_DESCRIPTION
    );

    setMeta(
      'name',
      'keywords',
      [
        'Sanu Builds',
        'Sanu Builds T-shirts',
        'premium T-shirts',
        'heavyweight T-shirts',
        '240 GSM T-shirts',
        'oversized T-shirts',
        'oversized tees',
        'streetwear India',
        'premium cotton T-shirts',
        'heavyweight cotton T-shirts',
        'men T-shirts India',
        'unisex T-shirts',
        '240 GSM heavyweight',
      ].join(', ')
    );

    setMeta(
      'name',
      'author',
      SITE_NAME
    );

    setMeta(
      'name',
      'robots',
      'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );

    setMeta(
      'name',
      'googlebot',
      'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );

    setMeta(
      'name',
      'bingbot',
      'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );

    setMeta(
      'name',
      'theme-color',
      '#ffffff'
    );

    /*
     * Canonical
     */

    setLink(
      'canonical',
      `${SITE_URL}/`
    );

    /*
     * Open Graph
     */

    setMeta(
      'property',
      'og:type',
      'website'
    );

    setMeta(
      'property',
      'og:title',
      DEFAULT_TITLE
    );

    setMeta(
      'property',
      'og:description',
      DEFAULT_DESCRIPTION
    );

    setMeta(
      'property',
      'og:url',
      `${SITE_URL}/`
    );

    setMeta(
      'property',
      'og:site_name',
      SITE_NAME
    );

    setMeta(
      'property',
      'og:image',
      DEFAULT_IMAGE
    );

    setMeta(
      'property',
      'og:image:alt',
      'Sanu Builds premium heavyweight T-shirts'
    );

    setMeta(
      'property',
      'og:locale',
      'en_IN'
    );

    /*
     * Twitter / X
     */

    setMeta(
      'name',
      'twitter:card',
      'summary_large_image'
    );

    setMeta(
      'name',
      'twitter:title',
      DEFAULT_TITLE
    );

    setMeta(
      'name',
      'twitter:description',
      DEFAULT_DESCRIPTION
    );

    setMeta(
      'name',
      'twitter:image',
      DEFAULT_IMAGE
    );

    setMeta(
      'name',
      'twitter:image:alt',
      'Sanu Builds premium heavyweight T-shirts'
    );

    /*
     * Mobile SEO
     */

    setMeta(
      'name',
      'format-detection',
      'telephone=no'
    );

    /*
     * =========================================================
     * ORGANIZATION + WEBSITE + STORE SCHEMA
     * =========================================================
     */

    const existingSchema = document.getElementById(
      'sanu-builds-home-schema'
    );

    if (existingSchema) {
      existingSchema.remove();
    }

    const schema = document.createElement('script');

    schema.id = 'sanu-builds-home-schema';
    schema.type = 'application/ld+json';

    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: DEFAULT_IMAGE,
      description:
        'Sanu Builds creates premium heavyweight T-shirts and modern streetwear designed for durability, comfort, and everyday style.',
    };

    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      description: DEFAULT_DESCRIPTION,
      publisher: {
        '@id': `${SITE_URL}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/shop?search={search_term_string}`,
        'query-input':
          'required name=search_term_string',
      },
    };

    const storeSchema = {
      '@context': 'https://schema.org',
      '@type': 'ClothingStore',
      '@id': `${SITE_URL}/#store`,
      name: SITE_NAME,
      url: SITE_URL,
      description: DEFAULT_DESCRIPTION,
      image: DEFAULT_IMAGE,
      brand: {
        '@type': 'Brand',
        name: SITE_NAME,
      },
      priceRange: '₹₹',
    };

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${SITE_URL}/`,
        },
      ],
    };

    const itemListSchemas = [
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Sanu Builds Featured Products',
        itemListElement: products
          .filter(
            (product) =>
              product.active !== false &&
              product.featured === true
          )
          .slice(0, 10)
          .map((product, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${SITE_URL}/product/${product.slug}`,
            name: product.name,
          })),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Sanu Builds Product Categories',
        itemListElement: categories
          .filter(
            (category) =>
              category.active !== false
          )
          .slice(0, 10)
          .map((category, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${SITE_URL}/category/${
              category.slug || category.id
            }`,
            name: category.name,
          })),
      },
    ];

    schema.textContent = JSON.stringify([
      organizationSchema,
      websiteSchema,
      storeSchema,
      breadcrumbSchema,
      ...itemListSchemas,
    ]);

    document.head.appendChild(schema);

    return () => {
      const currentSchema = document.getElementById(
        'sanu-builds-home-schema'
      );

      if (currentSchema) {
        currentSchema.remove();
      }
    };
  }, [products, categories]);

  /*
   * =========================================================
   * FIREBASE INITIAL STORE SYNC
   * =========================================================
   */

  useEffect(() => {
    let mounted = true;

    const syncInitialStore = async () => {
      if (!mounted) {
        return;
      }

      try {
        await seedInitialStoreData();

        console.log(
          'Sanu Builds: HomePage Firebase catalog sync checked.'
        );
      } catch (error) {
        console.warn(
          'Sanu Builds: HomePage Firebase catalog sync failed:',
          error
        );
      }
    };

    syncInitialStore();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * =========================================================
   * ACTIVE PRODUCTS
   * =========================================================
   */

  const activeProducts = products.filter(
    (product) => product.active !== false
  );

  /*
   * =========================================================
   * FEATURED PRODUCTS
   * =========================================================
   */

  const featuredProducts = activeProducts
    .filter(
      (product) =>
        product.featured === true
    )
    .slice(0, 4);

  /*
   * =========================================================
   * BEST SELLERS
   * =========================================================
   */

  const bestSellers = activeProducts
    .filter(
      (product) =>
        product.bestseller === true
    )
    .slice(0, 4);

  /*
   * =========================================================
   * NEW ARRIVALS
   * =========================================================
   */

  const newArrivals = [...activeProducts]
    .filter(
      (product) =>
        product.newArrival === true ||
        product.featured === true
    )
    .sort(
      (a, b) =>
        new Date(
          b.createdAt || 0
        ).getTime() -
        new Date(
          a.createdAt || 0
        ).getTime()
    )
    .slice(0, 4);

  /*
   * =========================================================
   * FALLBACK PRODUCTS
   * =========================================================
   */

  const fallbackProducts = [...activeProducts]
    .sort(
      (a, b) =>
        new Date(
          b.createdAt || 0
        ).getTime() -
        new Date(
          a.createdAt || 0
        ).getTime()
    )
    .slice(0, 4);

  const displayedFeaturedProducts =
    featuredProducts.length > 0
      ? featuredProducts
      : fallbackProducts;

  const displayedBestSellers =
    bestSellers.length > 0
      ? bestSellers
      : fallbackProducts;

  const displayedNewArrivals =
    newArrivals.length > 0
      ? newArrivals
      : fallbackProducts;

  /*
   * =========================================================
   * FIREBASE CATEGORIES
   * =========================================================
   */

  const displayedCategories = categories
    .filter(
      (category) =>
        category.active !== false
    )
    .slice(0, 4);

  /*
   * =========================================================
   * UI
   * =========================================================
   */

  return (
    <main
      className="space-y-16 sm:space-y-24 pb-16"
      itemScope
      itemType="https://schema.org/WebPage"
    >

      {/* =====================================================
          HERO
      ====================================================== */}

      <section
        className="relative bg-neutral-950 text-white overflow-hidden"
        aria-labelledby="home-hero-title"
      >
        <div
          className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:24px_24px] opacity-25"
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 flex flex-col items-center text-center">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-neutral-300 text-xs font-semibold uppercase tracking-widest mb-6 backdrop-blur-xs border border-white/15">
            <Sparkles
              className="w-3.5 h-3.5 text-neutral-200"
              aria-hidden="true"
            />

            <span>
              2026 Core Collection • 240+ GSM Heavyweight
            </span>
          </div>

          <h1
            id="home-hero-title"
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-white uppercase max-w-4xl leading-[1.05]"
            itemProp="headline"
          >
            BUILD YOUR STYLE.
          </h1>

          <p
            className="mt-6 text-sm sm:text-base text-neutral-400 max-w-xl font-normal leading-relaxed"
            itemProp="description"
          >
            Premium heavyweight T-shirts designed for people
            who build, create, code, and move forward. Zero
            compromise on fabric density, neck structure, or
            drape.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">

            <button
              id="hero-shop-cta-btn"
              type="button"
              aria-label="Shop Sanu Builds premium T-shirts"
              onClick={() =>
                onNavigate('/shop')
              }
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-neutral-950 hover:bg-neutral-200 text-xs font-black uppercase tracking-wider rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span>Shop T-Shirts</span>

              <ArrowRight
                className="w-4 h-4"
                aria-hidden="true"
              />
            </button>

            <button
              id="hero-oversized-cta-btn"
              type="button"
              aria-label="Explore Sanu Builds oversized T-shirts"
              onClick={() =>
                onNavigate(
                  '/category/oversized-tees'
                )
              }
              className="w-full sm:w-auto px-7 py-3.5 bg-neutral-900/80 hover:bg-neutral-800 text-white border border-neutral-700 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Oversized</span>
            </button>

          </div>
        </div>
      </section>

      {/* =====================================================
          CATEGORIES
      ====================================================== */}

      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        aria-labelledby="categories-heading"
      >

        <div className="flex items-center justify-between mb-8">

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Curated Silhouettes
            </span>

            <h2
              id="categories-heading"
              className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight"
            >
              Shop by Category
            </h2>
          </div>

          <button
            type="button"
            aria-label="View all Sanu Builds T-shirt categories"
            onClick={() =>
              onNavigate('/shop')
            }
            className="text-xs font-bold text-neutral-900 hover:text-neutral-600 flex items-center gap-1 uppercase tracking-wider"
          >
            <span>View All</span>

            <ChevronRight
              className="w-3.5 h-3.5"
              aria-hidden="true"
            />
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

          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
            role="list"
          >

            {displayedCategories.map(
              (cat) => (

                <article
                  key={cat.id}
                  role="listitem"
                  onClick={() =>
                    onNavigate(
                      `/category/${
                        cat.slug || cat.id
                      }`
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key ===
                        'Enter' ||
                      event.key === ' '
                    ) {
                      onNavigate(
                        `/category/${
                          cat.slug || cat.id
                        }`
                      );
                    }
                  }}
                  tabIndex={0}
                  aria-label={`Explore ${cat.name} T-shirts`}
                  className="group relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer bg-neutral-100 border border-neutral-200 shadow-xs"
                >

                  {cat.image ? (

                    <img
                      src={cat.image}
                      alt={`${cat.name} T-shirts by Sanu Builds`}
                      title={`${cat.name} T-shirts`}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      width="800"
                      height="1000"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                  ) : (

                    <div
                      className="w-full h-full bg-neutral-200 flex items-center justify-center"
                      aria-hidden="true"
                    >
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

                      <ArrowRight
                        className="w-3 h-3"
                        aria-hidden="true"
                      />
                    </span>

                  </div>

                </article>

              )
            )}

          </div>

        )}

      </section>

      {/* =====================================================
          FEATURED PRODUCTS
      ====================================================== */}

      {displayedFeaturedProducts.length > 0 && (
        <section
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          aria-labelledby="featured-products-heading"
        >

          <div className="flex items-center justify-between mb-8">

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Sanu Builds Collection
              </span>

              <h2
                id="featured-products-heading"
                className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight"
              >
                Featured T-Shirts
              </h2>
            </div>

            <button
              type="button"
              aria-label="View all featured Sanu Builds products"
              onClick={() =>
                onNavigate('/shop')
              }
              className="text-xs font-bold text-neutral-900 hover:text-neutral-600 flex items-center gap-1 uppercase tracking-wider"
            >
              <span>View All</span>

              <ChevronRight
                className="w-3.5 h-3.5"
                aria-hidden="true"
              />
            </button>

          </div>

          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
            role="list"
          >
            {displayedFeaturedProducts.map(
              (product) => (
                <div
                  key={product.id}
                  role="listitem"
                >
                  <ProductCard
                    product={product}
                    onSelect={
                      onSelectProduct
                    }
                  />
                </div>
              )
            )}
          </div>

        </section>
      )}

      {/* =====================================================
          NEW ARRIVALS
      ====================================================== */}

      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        aria-labelledby="new-arrivals-heading"
      >

        <div className="flex items-center justify-between mb-8">

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Fresh Off The Loom
            </span>

            <h2
              id="new-arrivals-heading"
              className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight"
            >
              New Arrivals
            </h2>
          </div>

          <button
            type="button"
            aria-label="See all new Sanu Builds T-shirts"
            onClick={() =>
              onNavigate('/shop')
            }
            className="text-xs font-bold text-neutral-900 hover:text-neutral-600 flex items-center gap-1 uppercase tracking-wider"
          >
            <span>See Everything</span>

            <ChevronRight
              className="w-3.5 h-3.5"
              aria-hidden="true"
            />
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

          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
            role="list"
          >

            {displayedNewArrivals.map(
              (product) => (

                <div
                  key={product.id}
                  role="listitem"
                >
                  <ProductCard
                    product={product}
                    onSelect={
                      onSelectProduct
                    }
                  />
                </div>

              )
            )}

          </div>

        )}

      </section>

      {/* =====================================================
          FABRIC / BRAND STORY
      ====================================================== */}

      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        aria-labelledby="sanu-standard-heading"
      >

        <div className="bg-neutral-900 text-white rounded-2xl overflow-hidden border border-neutral-800">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-8 sm:p-12 lg:p-16">

            <div className="space-y-6">

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800 text-neutral-300 text-xs font-semibold uppercase tracking-wider">

                <Shield
                  className="w-3.5 h-3.5 text-neutral-300"
                  aria-hidden="true"
                />

                <span>
                  The Sanu Standard
                </span>

              </div>

              <h2
                id="sanu-standard-heading"
                className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight"
              >
                Crafted for durability. Engineered to never bacon.
              </h2>

              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Most commercial T-shirts lose their
                collar shape after three washes. Sanu
                Builds tees use custom 1.25&quot; ribbing
                with internal Lycra memory cores,
                240–280 GSM ringspun combed cotton,
                and twin-needle arm hems.
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
                type="button"
                aria-label="Shop Sanu Builds premium heavyweight T-shirts"
                onClick={() =>
                  onNavigate('/shop')
                }
                className="px-6 py-3 bg-white text-neutral-950 hover:bg-neutral-200 text-xs font-black uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2"
              >
                <span>
                  Experience The Difference
                </span>

                <ArrowRight
                  className="w-4 h-4"
                  aria-hidden="true"
                />
              </button>

            </div>

            <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-neutral-700 shadow-2xl">

              <img
                src={DEFAULT_IMAGE}
                alt="Sanu Builds premium heavyweight cotton T-shirt fabric close-up"
                title="Sanu Builds heavyweight cotton fabric"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                width="1200"
                height="900"
                className="w-full h-full object-cover"
              />

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          BEST SELLERS
      ====================================================== */}

      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        aria-labelledby="best-sellers-heading"
      >

        <div className="flex items-center justify-between mb-8">

          <div>

            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Community Favorites
            </span>

            <h2
              id="best-sellers-heading"
              className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight"
            >
              Best Sellers
            </h2>

          </div>

          <button
            type="button"
            aria-label="Shop all Sanu Builds best selling T-shirts"
            onClick={() =>
              onNavigate('/shop')
            }
            className="text-xs font-bold text-neutral-900 hover:text-neutral-600 flex items-center gap-1 uppercase tracking-wider"
          >
            <span>
              Shop All Best Sellers
            </span>

            <ChevronRight
              className="w-3.5 h-3.5"
              aria-hidden="true"
            />
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

          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
            role="list"
          >

            {displayedBestSellers.map(
              (product) => (

                <div
                  key={product.id}
                  role="listitem"
                >
                  <ProductCard
                    product={product}
                    onSelect={
                      onSelectProduct
                    }
                  />
                </div>

              )
            )}

          </div>

        )}

      </section>

    </main>
  );
};

export default HomePage;
