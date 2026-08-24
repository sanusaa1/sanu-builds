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

  const catalogMaxPrice = useMemo(() => {
    const prices = products
      .map((product) => Number(product.price) || 0)
      .filter((price) => price > 0);

    if (prices.length === 0) {
      return 1000;
    }

    const maxPrice = Math.max(...prices);

    return Math.max(
      100,
      Math.ceil(maxPrice / 100) * 100
    );
  }, [products]);

  const [priceMax, setPriceMax] =
    useState<number | null>(null);

  useEffect(() => {
    setPriceMax((previous) => {
      if (previous === null) {
        return null;
      }

      return Math.min(previous, catalogMaxPrice);
    });
  }, [catalogMaxPrice]);

  const [inStockOnly, setInStockOnly] =
    useState<boolean>(false);

  const [sortBy, setSortBy] =
    useState<FilterState['sortBy']>('popular');

  const [searchQuery, setSearchQuery] =
    useState<string>(initialSearch);

  const [isMobileFilterOpen, setIsMobileFilterOpen] =
    useState<boolean>(false);

  /*
   * ============================================================
   * SEO HELPERS
   * ============================================================
   */

  const getSiteUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin.replace(/\/$/, '');
    }

    return 'https://sanubuilds.com';
  };

  const siteUrl = getSiteUrl();

  /*
   * Shop page should have one stable canonical URL.
   *
   * Filters/search/sorting are UI states and should not create
   * separate indexable URLs.
   */
  const canonicalUrl = `${siteUrl}/shop`;

  /*
   * ============================================================
   * FIREBASE PRODUCT DATA
   * ============================================================
   */

  const activeProducts = useMemo(() => {
    return products.filter(
      (product) => product.active !== false
    );
  }, [products]);

  const selectedCategoryName = useMemo(() => {
    if (
      !selectedCategory ||
      selectedCategory === 'all'
    ) {
      return 'All Products';
    }

    return (
      categories.find(
        (category) =>
          category.slug === selectedCategory ||
          category.id === selectedCategory
      )?.name || 'Collection'
    );
  }, [
    categories,
    selectedCategory,
  ]);

  /*
   * ============================================================
   * SEO TITLE
   * ============================================================
   */

  const seoTitle =
    selectedCategoryName === 'All Products'
      ? 'Shop Premium T-Shirts & Apparel | Sanu Builds'
      : `${selectedCategoryName} | Shop Sanu Builds`;

  /*
   * ============================================================
   * SEO DESCRIPTION
   * ============================================================
   */

  const seoDescription =
    selectedCategoryName === 'All Products'
      ? 'Shop premium T-shirts and apparel from Sanu Builds. Discover quality fabrics, modern fits, multiple sizes and colors, and products available for online shopping.'
      : `Shop ${selectedCategoryName} from Sanu Builds. Explore premium apparel with quality fabrics, modern fits, multiple sizes, colors and online ordering.`;

  /*
   * ============================================================
   * SEO IMAGE
   * ============================================================
   */

  const seoImage =
    activeProducts[0]?.images?.[0] ||
    `${siteUrl}/og-image.jpg`;

  /*
   * ============================================================
   * SEO META + STRUCTURED DATA
   * ============================================================
   */

  useEffect(() => {
    if (
      typeof document === 'undefined'
    ) {
      return;
    }

    document.title = seoTitle;

    const ensureMeta = (
      selector: string,
      attributes: Record<string, string>,
      content: string
    ) => {
      let element =
        document.head.querySelector(
          selector
        ) as HTMLMetaElement | null;

      if (!element) {
        element =
          document.createElement('meta');

        Object.entries(attributes).forEach(
          ([key, value]) => {
            element!.setAttribute(
              key,
              value
            );
          }
        );

        document.head.appendChild(
          element
        );
      }

      element.setAttribute(
        'content',
        content
      );

      return element;
    };

    const ensureLink = (
      rel: string,
      href: string
    ) => {
      let element =
        document.head.querySelector(
          `link[rel="${rel}"]`
        ) as HTMLLinkElement | null;

      if (!element) {
        element =
          document.createElement('link');

        element.setAttribute(
          'rel',
          rel
        );

        document.head.appendChild(
          element
        );
      }

      element.setAttribute(
        'href',
        href
      );

      return element;
    };

    const ensureJsonLd = (
      id: string,
      data: Record<string, unknown>
    ) => {
      let script =
        document.head.querySelector(
          `script[data-seo="${id}"]`
        ) as HTMLScriptElement | null;

      if (!script) {
        script =
          document.createElement(
            'script'
          );

        script.type =
          'application/ld+json';

        script.setAttribute(
          'data-seo',
          id
        );

        document.head.appendChild(
          script
        );
      }

      script.textContent =
        JSON.stringify(data);

      return script;
    };

    /*
     * ------------------------------------------------------------
     * BASIC SEO
     * ------------------------------------------------------------
     */

    ensureMeta(
      'meta[name="description"]',
      {
        name: 'description',
      },
      seoDescription
    );

    /*
     * Search pages and filtered client-side states should not
     * generate separate search-engine pages.
     *
     * The clean /shop page remains indexable.
     */
    const hasSearch =
      searchQuery.trim().length > 0;

    const hasFilters =
      selectedCategory !== 'all' ||
      selectedSizes.length > 0 ||
      selectedColors.length > 0 ||
      priceMax !== null ||
      inStockOnly;

    const robotsContent =
      hasSearch || hasFilters
        ? 'noindex, follow, max-image-preview:large'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

    ensureMeta(
      'meta[name="robots"]',
      {
        name: 'robots',
      },
      robotsContent
    );

    ensureMeta(
      'meta[name="googlebot"]',
      {
        name: 'googlebot',
      },
      robotsContent
    );

    ensureMeta(
      'meta[name="theme-color"]',
      {
        name: 'theme-color',
      },
      '#ffffff'
    );

    ensureMeta(
      'meta[name="author"]',
      {
        name: 'author',
      },
      'Sanu Builds'
    );

    /*
     * ------------------------------------------------------------
     * CANONICAL
     * ------------------------------------------------------------
     */

    ensureLink(
      'canonical',
      canonicalUrl
    );

    /*
     * ------------------------------------------------------------
     * OPEN GRAPH
     * ------------------------------------------------------------
     */

    ensureMeta(
      'meta[property="og:type"]',
      {
        property: 'og:type',
      },
      'website'
    );

    ensureMeta(
      'meta[property="og:title"]',
      {
        property: 'og:title',
      },
      seoTitle
    );

    ensureMeta(
      'meta[property="og:description"]',
      {
        property: 'og:description',
      },
      seoDescription
    );

    ensureMeta(
      'meta[property="og:url"]',
      {
        property: 'og:url',
      },
      canonicalUrl
    );

    ensureMeta(
      'meta[property="og:image"]',
      {
        property: 'og:image',
      },
      seoImage
    );

    ensureMeta(
      'meta[property="og:image:alt"]',
      {
        property: 'og:image:alt',
      },
      `${selectedCategoryName} - Sanu Builds`
    );

    ensureMeta(
      'meta[property="og:site_name"]',
      {
        property: 'og:site_name',
      },
      'Sanu Builds'
    );

    ensureMeta(
      'meta[property="og:locale"]',
      {
        property: 'og:locale',
      },
      'en_IN'
    );

    /*
     * ------------------------------------------------------------
     * TWITTER CARD
     * ------------------------------------------------------------
     */

    ensureMeta(
      'meta[name="twitter:card"]',
      {
        name: 'twitter:card',
      },
      'summary_large_image'
    );

    ensureMeta(
      'meta[name="twitter:title"]',
      {
        name: 'twitter:title',
      },
      seoTitle
    );

    ensureMeta(
      'meta[name="twitter:description"]',
      {
        name: 'twitter:description',
      },
      seoDescription
    );

    ensureMeta(
      'meta[name="twitter:image"]',
      {
        name: 'twitter:image',
      },
      seoImage
    );

    /*
     * ------------------------------------------------------------
     * COLLECTION PAGE JSON-LD
     * ------------------------------------------------------------
     */

    const collectionSchema: Record<
      string,
      unknown
    > = {
      '@context':
        'https://schema.org',

      '@type':
        'CollectionPage',

      '@id':
        `${canonicalUrl}#collection`,

      name:
        seoTitle,

      url:
        canonicalUrl,

      description:
        seoDescription,

      inLanguage:
        'en-IN',

      isPartOf: {
        '@type':
          'WebSite',

        '@id':
          `${siteUrl}#website`,

        name:
          'Sanu Builds',

        url:
          siteUrl,
      },

      about: {
        '@type':
          'Thing',

        name:
          selectedCategoryName,
      },

      publisher: {
        '@type':
          'Organization',

        name:
          'Sanu Builds',

        url:
          siteUrl,

        logo: {
          '@type':
            'ImageObject',

          url:
            `${siteUrl}/logo.png`,
        },
      },
    };

    ensureJsonLd(
      'shop-collection-jsonld',
      collectionSchema
    );

    /*
     * ------------------------------------------------------------
     * ITEM LIST JSON-LD
     * ------------------------------------------------------------
     *
     * Firebase products are converted into Schema.org
     * ListItem/Product entries.
     */

    const itemListElements =
      activeProducts
        .slice(0, 100)
        .map(
          (
            product,
            index
          ) => {
            const slug =
              product.slug ||
              product.id ||
              product.name
                ?.toLowerCase()
                .trim()
                .replace(
                  /[^a-z0-9]+/g,
                  '-'
                )
                .replace(
                  /^-+|-+$/g,
                  ''
                );

            const productUrl =
              `${siteUrl}/product/${slug}`;

            const productImage =
              product.images?.[0];

            const productPrice =
              Number(
                product.price || 0
              );

            const productStock =
              Number(
                product.stock || 0
              );

            const productItem: Record<
              string,
              unknown
            > = {
              '@type':
                'Product',

              name:
                product.name,

              url:
                productUrl,

              description:
                (
                  product.description ||
                  `Buy ${product.name} online from Sanu Builds.`
                )
                  .replace(
                    /\s+/g,
                    ' '
                  )
                  .trim()
                  .slice(
                    0,
                    160
                  ),

              sku:
                product.sku ||
                product.id,

              brand: {
                '@type':
                  'Brand',

                name:
                  product.brand ||
                  'Sanu Builds',
              },

              offers: {
                '@type':
                  'Offer',

                url:
                  productUrl,

                priceCurrency:
                  'INR',

                price:
                  productPrice.toFixed(
                    2
                  ),

                availability:
                  productStock > 0
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock',

                itemCondition:
                  'https://schema.org/NewCondition',

                seller: {
                  '@type':
                    'Organization',

                  name:
                    'Sanu Builds',

                  url:
                    siteUrl,
                },
              },
            };

            if (
              productImage
            ) {
              productItem.image =
                productImage;
            }

            const productRating =
              Number(
                product.rating || 0
              );

            const productReviewCount =
              Number(
                product.reviewCount ||
                  0
              );

            if (
              productRating > 0 &&
              productReviewCount > 0
            ) {
              productItem.aggregateRating =
                {
                  '@type':
                    'AggregateRating',

                  ratingValue:
                    Math.min(
                      5,
                      Math.max(
                        0,
                        productRating
                      )
                    ).toFixed(
                      1
                    ),

                  bestRating:
                    '5',

                  worstRating:
                    '1',

                  reviewCount:
                    productReviewCount,
                };
            }

            return {
              '@type':
                'ListItem',

              position:
                index + 1,

              url:
                productUrl,

              item:
                productItem,
            };
          }
        );

    const itemListSchema: Record<
      string,
      unknown
    > = {
      '@context':
        'https://schema.org',

      '@type':
        'ItemList',

      '@id':
        `${canonicalUrl}#itemlist`,

      name:
        `${selectedCategoryName} Products`,

      url:
        canonicalUrl,

      numberOfItems:
        itemListElements.length,

      itemListElement:
        itemListElements,
    };

    ensureJsonLd(
      'shop-itemlist-jsonld',
      itemListSchema
    );

    /*
     * ------------------------------------------------------------
     * BREADCRUMB JSON-LD
     * ------------------------------------------------------------
     */

    const breadcrumbSchema = {
      '@context':
        'https://schema.org',

      '@type':
        'BreadcrumbList',

      itemListElement: [
        {
          '@type':
            'ListItem',

          position:
            1,

          name:
            'Home',

          item:
            siteUrl,
        },

        {
          '@type':
            'ListItem',

          position:
            2,

          name:
            'Shop',

          item:
            canonicalUrl,
        },
      ],
    };

    ensureJsonLd(
      'shop-breadcrumb-jsonld',
      breadcrumbSchema
    );

    /*
     * ------------------------------------------------------------
     * WEBSITE JSON-LD
     * ------------------------------------------------------------
     */

    const websiteSchema = {
      '@context':
        'https://schema.org',

      '@type':
        'WebSite',

      '@id':
        `${siteUrl}#website`,

      name:
        'Sanu Builds',

      url:
        siteUrl,

      description:
        'Sanu Builds online store for premium T-shirts and apparel.',

      inLanguage:
        'en-IN',

      publisher: {
        '@type':
          'Organization',

        name:
          'Sanu Builds',

        url:
          siteUrl,

        logo: {
          '@type':
            'ImageObject',

          url:
            `${siteUrl}/logo.png`,
        },
      },
    };

    ensureJsonLd(
      'shop-website-jsonld',
      websiteSchema
    );

    /*
     * ------------------------------------------------------------
     * ORGANIZATION JSON-LD
     * ------------------------------------------------------------
     */

    const organizationSchema = {
      '@context':
        'https://schema.org',

      '@type':
        'Organization',

      '@id':
        `${siteUrl}#organization`,

      name:
        'Sanu Builds',

      url:
        siteUrl,

      logo:
        `${siteUrl}/logo.png`,
    };

    ensureJsonLd(
      'shop-organization-jsonld',
      organizationSchema
    );

    /*
     * ------------------------------------------------------------
     * CLEANUP
     * ------------------------------------------------------------
     */

    return () => {
      document.head
        .querySelector(
          'script[data-seo="shop-collection-jsonld"]'
        )
        ?.remove();

      document.head
        .querySelector(
          'script[data-seo="shop-itemlist-jsonld"]'
        )
        ?.remove();

      document.head
        .querySelector(
          'script[data-seo="shop-breadcrumb-jsonld"]'
        )
        ?.remove();

      document.head
        .querySelector(
          'script[data-seo="shop-website-jsonld"]'
        )
        ?.remove();

      document.head
        .querySelector(
          'script[data-seo="shop-organization-jsonld"]'
        )
        ?.remove();
    };
  }, [
    seoTitle,
    seoDescription,
    seoImage,
    canonicalUrl,
    siteUrl,
    activeProducts,
    selectedCategoryName,
    searchQuery,
    selectedCategory,
    selectedSizes,
    selectedColors,
    priceMax,
    inStockOnly,
  ]);

  /*
   * ============================================================
   * FIREBASE PRODUCT COLORS
   * ============================================================
   */

  const availableColors = useMemo(() => {
    const colorMap =
      new Map<string, string>();

    products.forEach(
      (product) => {
        product.colors?.forEach(
          (color) => {
            const name =
              color?.name?.trim();

            if (!name) {
              return;
            }

            const key =
              name.toLowerCase();

            if (
              !colorMap.has(key)
            ) {
              colorMap.set(
                key,
                name
              );
            }
          }
        );
      }
    );

    return Array.from(
      colorMap.values()
    ).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [products]);

  /*
   * ============================================================
   * FIREBASE PRODUCT SIZES
   * ============================================================
   */

  const availableSizes = useMemo(() => {
    const sizeSet =
      new Set<string>();

    products.forEach(
      (product) => {
        product.sizes?.forEach(
          (size) => {
            if (
              size?.trim()
            ) {
              sizeSet.add(
                size.trim()
              );
            }
          }
        );
      }
    );

    const preferredOrder = [
      'XS',
      'S',
      'M',
      'L',
      'XL',
      'XXL',
      'Free Size',
    ];

    return Array.from(
      sizeSet
    ).sort((a, b) => {
      const aIndex =
        preferredOrder.indexOf(
          a
        );

      const bIndex =
        preferredOrder.indexOf(
          b
        );

      if (
        aIndex === -1 &&
        bIndex === -1
      ) {
        return a.localeCompare(
          b
        );
      }

      if (
        aIndex === -1
      ) {
        return 1;
      }

      if (
        bIndex === -1
      ) {
        return -1;
      }

      return (
        aIndex - bIndex
      );
    });
  }, [products]);

  /*
   * ============================================================
   * FILTER HANDLERS
   * ============================================================
   */

  const toggleSize = (
    size: string
  ) => {
    setSelectedSizes(
      (previous) =>
        previous.includes(size)
          ? previous.filter(
              (item) =>
                item !== size
            )
          : [
              ...previous,
              size,
            ]
    );
  };

  const toggleColor = (
    color: string
  ) => {
    setSelectedColors(
      (previous) =>
        previous.includes(color)
          ? previous.filter(
              (item) =>
                item !== color
            )
          : [
              ...previous,
              color,
            ]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategory(
      'all'
    );

    setSelectedSizes([]);

    setSelectedColors([]);

    setPriceMax(null);

    setInStockOnly(false);

    setSearchQuery('');

    setSortBy('popular');
  };

  /*
   * ============================================================
   * PRODUCT FILTERING
   * ============================================================
   */

  const filteredProducts =
    useMemo(() => {
      const result =
        products.filter(
          (product) => {
            /*
             * CATEGORY
             */

            if (
              selectedCategory &&
              selectedCategory !==
                'all'
            ) {
              const selected =
                selectedCategory
                  .toLowerCase()
                  .trim();

              const categoryId =
                product.categoryId
                  ?.toLowerCase()
                  .trim() || '';

              const categoryName =
                product.categoryName
                  ?.toLowerCase()
                  .trim() || '';

              const slug =
                product.slug
                  ?.toLowerCase()
                  .trim() || '';

              const normalizedCategoryName =
                categoryName.replace(
                  /\s+/g,
                  '-'
                );

              const normalizedSelected =
                selected.replace(
                  /\s+/g,
                  '-'
                );

              const categoryMatches =
                categoryId ===
                  selected ||
                categoryName ===
                  selected ||
                normalizedCategoryName ===
                  normalizedSelected ||
                slug.includes(
                  selected
                );

              if (
                !categoryMatches
              ) {
                return false;
              }
            }

            /*
             * SEARCH
             */

            if (
              searchQuery.trim()
            ) {
              const query =
                searchQuery
                  .toLowerCase()
                  .trim();

              const searchableText =
                [
                  product.name,
                  product.description,
                  product.sku,
                  product.brand,
                  product.categoryName,
                  ...(product.tags ||
                    []),
                  product.details
                    ?.fabric,
                  product.details
                    ?.fit,
                  product.details
                    ?.gsm
                    ? `${product.details.gsm}gsm`
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')
                  .toLowerCase();

              if (
                !searchableText.includes(
                  query
                )
              ) {
                return false;
              }
            }

            /*
             * SIZE
             */

            if (
              selectedSizes.length >
              0
            ) {
              const productSizes =
                product.sizes ||
                [];

              const hasSize =
                productSizes.some(
                  (size) =>
                    selectedSizes.includes(
                      size
                    )
                );

              if (!hasSize) {
                return false;
              }
            }

            /*
             * COLOR
             */

            if (
              selectedColors.length >
              0
            ) {
              const productColors =
                product.colors ||
                [];

              const hasColor =
                productColors.some(
                  (color) =>
                    selectedColors.some(
                      (
                        selectedColor
                      ) =>
                        selectedColor
                          .toLowerCase() ===
                        color.name?.toLowerCase()
                    )
                );

              if (!hasColor) {
                return false;
              }
            }

            /*
             * PRICE
             */

            if (
              priceMax !==
                null &&
              Number(
                product.price
              ) >
                priceMax
            ) {
              return false;
            }

            /*
             * STOCK
             */

            if (
              inStockOnly &&
              (Number(
                product.stock
              ) || 0) <= 0
            ) {
              return false;
            }

            /*
             * ACTIVE PRODUCTS
             */

            if (
              product.active ===
              false
            ) {
              return false;
            }

            return true;
          }
        );

      /*
       * SORT
       */

      return result.sort(
        (a, b) => {
          if (
            sortBy ===
            'newest'
          ) {
            return (
              new Date(
                b.createdAt ||
                  0
              ).getTime() -
              new Date(
                a.createdAt ||
                  0
              ).getTime()
            );
          }

          if (
            sortBy ===
            'price-low'
          ) {
            return (
              Number(
                a.price
              ) -
              Number(
                b.price
              )
            );
          }

          if (
            sortBy ===
            'price-high'
          ) {
            return (
              Number(
                b.price
              ) -
              Number(
                a.price
              )
            );
          }

          if (
            sortBy ===
            'best-rated'
          ) {
            return (
              Number(
                b.rating || 0
              ) -
              Number(
                a.rating || 0
              )
            );
          }

          return (
            Number(
              b.reviewCount ||
                0
            ) -
            Number(
              a.reviewCount ||
                0
            )
          );
        }
      );
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
    selectedCategory !==
      'all' ||
    selectedSizes.length >
      0 ||
    selectedColors.length >
      0 ||
    priceMax !== null ||
    inStockOnly ||
    searchQuery.trim() !== '';

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <main
      itemScope
      itemType="https://schema.org/CollectionPage"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <meta
        itemProp="name"
        content={seoTitle}
      />

      <meta
        itemProp="description"
        content={seoDescription}
      />

      <meta
        itemProp="url"
        content={canonicalUrl}
      />

      {seoImage && (
        <meta
          itemProp="image"
          content={seoImage}
        />
      )}

      <meta
        itemProp="inLanguage"
        content="en-IN"
      />

      {/* ============================================================
          HEADER
      ============================================================ */}

      <header className="border-b border-neutral-200 pb-6 mb-8">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
          Sanu Builds Catalog
        </span>

        <h1
          itemProp="name"
          className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight uppercase mt-1"
        >
          {selectedCategoryName}
        </h1>

        <p
          itemProp="description"
          className="text-xs text-neutral-500 mt-2 max-w-2xl leading-relaxed"
        >
          {seoDescription}
        </p>

        <p className="text-xs text-neutral-500 mt-2">
          Showing{' '}
          <strong className="text-neutral-900">
            {
              filteredProducts.length
            }
          </strong>{' '}
          of{' '}
          <strong className="text-neutral-900">
            {products.length}
          </strong>{' '}
          products
        </p>
      </header>

      {/* ============================================================
          CATEGORY PILLS
      ============================================================ */}

      <nav
        aria-label="Product categories"
        className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-6"
      >
        <button
          type="button"
          onClick={() =>
            setSelectedCategory(
              'all'
            )
          }
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
            selectedCategory ===
            'all'
              ? 'bg-neutral-950 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
          aria-current={
            selectedCategory ===
            'all'
              ? 'page'
              : undefined
          }
        >
          All Products
        </button>

        {categories.map(
          (category) => {
            const categoryValue =
              category.slug ||
              category.id;

            const isSelected =
              selectedCategory ===
                categoryValue ||
              selectedCategory ===
                category.id;

            return (
              <button
                key={
                  category.id
                }
                type="button"
                onClick={() =>
                  setSelectedCategory(
                    categoryValue
                  )
                }
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-neutral-950 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
                aria-current={
                  isSelected
                    ? 'page'
                    : undefined
                }
              >
                {category.name}
              </button>
            );
          }
        )}
      </nav>

      {/* ============================================================
          SEARCH / SORT
      ============================================================ */}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search
            className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />

          <label
            htmlFor="shop-product-search"
            className="sr-only"
          >
            Search products
          </label>

          <input
            id="shop-product-search"
            type="search"
            placeholder="Search products, GSM, brand, SKU..."
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(
                event.target.value
              )
            }
            className="w-full pl-9 pr-8 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors"
            autoComplete="off"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() =>
                setSearchQuery('')
              }
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
              aria-label="Clear product search"
            >
              <X
                className="w-3.5 h-3.5"
                aria-hidden="true"
              />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              setIsMobileFilterOpen(
                true
              )
            }
            className="lg:hidden flex-1 sm:flex-none px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            aria-label="Open product filters"
          >
            <SlidersHorizontal
              className="w-3.5 h-3.5"
              aria-hidden="true"
            />

            <span>
              Filters{' '}
              {hasActiveFilters &&
                '•'}
            </span>
          </button>

          <div className="relative flex-1 sm:flex-none">
            <label
              htmlFor="shop-sort"
              className="sr-only"
            >
              Sort products
            </label>

            <select
              id="shop-sort"
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target
                    .value as FilterState['sortBy']
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

            <ChevronDown
              className="w-3.5 h-3.5 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* ============================================================
          MAIN CONTENT
      ============================================================ */}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* ========================================================
            DESKTOP FILTER SIDEBAR
        ======================================================== */}

        <aside
          className="hidden lg:block space-y-6"
          aria-label="Product filters"
        >
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Filters
            </span>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={
                  clearAllFilters
                }
                className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 underline"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Sizes */}

          {availableSizes.length >
            0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2.5">
                Sizes
              </h2>

              <div className="grid grid-cols-3 gap-1.5">
                {availableSizes.map(
                  (size) => (
                    <button
                      key={
                        size
                      }
                      type="button"
                      onClick={() =>
                        toggleSize(
                          size
                        )
                      }
                      className={`py-1.5 text-xs font-bold rounded border transition-colors ${
                        selectedSizes.includes(
                          size
                        )
                          ? 'bg-neutral-950 text-white border-neutral-950'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-900'
                      }`}
                      aria-pressed={selectedSizes.includes(
                        size
                      )}
                    >
                      {size}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Colors */}

          {availableColors.length >
            0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2.5">
                Colors
              </h2>

              <div className="space-y-1.5">
                {availableColors.map(
                  (color) => (
                    <button
                      key={
                        color
                      }
                      type="button"
                      onClick={() =>
                        toggleColor(
                          color
                        )
                      }
                      className="w-full flex items-center justify-between py-1 px-1.5 rounded hover:bg-neutral-50 text-xs text-left"
                      aria-pressed={selectedColors.includes(
                        color
                      )}
                    >
                      <span className="text-neutral-700">
                        {color}
                      </span>

                      {selectedColors.includes(
                        color
                      ) && (
                        <Check
                          className="w-3.5 h-3.5 text-neutral-950"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Price */}

          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Max Price
              </h2>

              <span className="text-xs font-bold text-neutral-950">
                ₹
                {priceMax ===
                null
                  ? catalogMaxPrice
                  : priceMax}
              </span>
            </div>

            <label
              htmlFor="desktop-price-range"
              className="sr-only"
            >
              Maximum product price
            </label>

            <input
              id="desktop-price-range"
              type="range"
              min="0"
              max={catalogMaxPrice}
              step={
                catalogMaxPrice >=
                1000
                  ? 10
                  : 1
              }
              value={
                priceMax ===
                null
                  ? catalogMaxPrice
                  : Math.min(
                      priceMax,
                      catalogMaxPrice
                    )
              }
              onChange={(
                event
              ) =>
                setPriceMax(
                  Number(
                    event.target
                      .value
                  )
                )
              }
              className="w-full accent-neutral-950"
            />

            <div className="flex justify-between mt-1 text-[10px] text-neutral-400">
              <span>
                ₹0
              </span>

              <span>
                ₹
                {
                  catalogMaxPrice
                }
              </span>
            </div>
          </div>

          {/* Stock */}

          <div className="pt-2 border-t border-neutral-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-800">
              <input
                type="checkbox"
                checked={
                  inStockOnly
                }
                onChange={(
                  event
                ) =>
                  setInStockOnly(
                    event.target
                      .checked
                  )
                }
                className="rounded text-neutral-950 focus:ring-neutral-950"
              />

              <span>
                In Stock Only
              </span>
            </label>
          </div>
        </aside>

        {/* ========================================================
            PRODUCTS GRID
        ======================================================== */}

        <section
          className="lg:col-span-3"
          aria-label={`${selectedCategoryName} products`}
        >
          {filteredProducts.length ===
          0 ? (
            <div className="py-16 text-center bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
              <h2 className="text-base font-bold text-neutral-900">
                No products match your active filters.
              </h2>

              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Try clearing the filters or selecting
                another category to see the full catalog.
              </p>

              <button
                type="button"
                onClick={
                  clearAllFilters
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
              >
                <RefreshCw
                  className="w-3.5 h-3.5"
                  aria-hidden="true"
                />

                <span>
                  Reset Filters
                </span>
              </button>
            </div>
          ) : (
            <div
              className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6"
              itemScope
              itemType="https://schema.org/ItemList"
            >
              {filteredProducts.map(
                (
                  product,
                  index
                ) => (
                  <article
                    key={
                      product.id
                    }
                    itemProp="itemListElement"
                    itemScope
                    itemType="https://schema.org/ListItem"
                  >
                    <meta
                      itemProp="position"
                      content={String(
                        index + 1
                      )}
                    />

                    <div itemProp="item">
                      <ProductCard
                        product={
                          product
                        }
                        onSelect={
                          onSelectProduct
                        }
                      />
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>
      </div>

      {/* ============================================================
          SEO CONTENT
      ============================================================ */}

      <section
        aria-labelledby="shop-seo-content"
        className="mt-16 pt-8 border-t border-neutral-200"
      >
        <h2
          id="shop-seo-content"
          className="text-xl font-black text-neutral-900 tracking-tight"
        >
          Shop Premium Apparel
        </h2>

        <div className="mt-3 max-w-4xl text-sm text-neutral-600 leading-7 space-y-3">
          <p>
            Explore the latest collection from
            <strong className="text-neutral-900">
              {' '}
              Sanu Builds
            </strong>
            . Browse premium T-shirts and apparel
            available in different sizes, colors and
            styles.
          </p>

          <p>
            Our product catalog is updated with product
            information including pricing, availability,
            fabric details, fit, GSM, colors and sizes.
            Choose your favorite product and continue
            shopping online.
          </p>
        </div>
      </section>

      {/* ============================================================
          MOBILE FILTER DRAWER
      ============================================================ */}

      {isMobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-neutral-950/60 backdrop-blur-sm lg:hidden"
          onClick={() =>
            setIsMobileFilterOpen(
              false
            )
          }
          role="presentation"
        >
          <div
            className="w-full max-w-xs bg-white h-full p-6 space-y-6 overflow-y-auto"
            onClick={(event) =>
              event.stopPropagation()
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filter-title"
          >
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h2
                id="mobile-filter-title"
                className="font-bold text-sm uppercase tracking-wider text-neutral-900"
              >
                Filter Products
              </h2>

              <button
                type="button"
                onClick={() =>
                  setIsMobileFilterOpen(
                    false
                  )
                }
                aria-label="Close filters"
              >
                <X
                  className="w-5 h-5 text-neutral-500"
                  aria-hidden="true"
                />
              </button>
            </div>

            {/* Mobile Sizes */}

            {availableSizes.length >
              0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                  Sizes
                </h3>

                <div className="grid grid-cols-3 gap-2">
                  {availableSizes.map(
                    (size) => (
                      <button
                        key={
                          size
                        }
                        type="button"
                        onClick={() =>
                          toggleSize(
                            size
                          )
                        }
                        className={`py-2 text-xs font-bold rounded border ${
                          selectedSizes.includes(
                            size
                          )
                            ? 'bg-neutral-950 text-white border-neutral-950'
                            : 'bg-white text-neutral-700 border-neutral-200'
                        }`}
                        aria-pressed={selectedSizes.includes(
                          size
                        )}
                      >
                        {size}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Mobile Colors */}

            {availableColors.length >
              0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                  Colors
                </h3>

                <div className="space-y-2">
                  {availableColors.map(
                    (
                      color
                    ) => (
                      <button
                        key={
                          color
                        }
                        type="button"
                        onClick={() =>
                          toggleColor(
                            color
                          )
                        }
                        className="w-full flex items-center justify-between py-1 text-xs"
                        aria-pressed={selectedColors.includes(
                          color
                        )}
                      >
                        <span>
                          {
                            color
                          }
                        </span>

                        {selectedColors.includes(
                          color
                        ) && (
                          <Check
                            className="w-4 h-4 text-neutral-950"
                            aria-hidden="true"
                          />
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
                <span>
                  Max Price
                </span>

                <span>
                  ₹
                  {priceMax ===
                  null
                    ? catalogMaxPrice
                    : priceMax}
                </span>
              </div>

              <label
                htmlFor="mobile-price-range"
                className="sr-only"
              >
                Maximum product price
              </label>

              <input
                id="mobile-price-range"
                type="range"
                min="0"
                max={
                  catalogMaxPrice
                }
                step={
                  catalogMaxPrice >=
                  1000
                    ? 10
                    : 1
                }
                value={
                  priceMax ===
                  null
                    ? catalogMaxPrice
                    : Math.min(
                        priceMax,
                        catalogMaxPrice
                      )
                }
                onChange={(
                  event
                ) =>
                  setPriceMax(
                    Number(
                      event.target
                        .value
                    )
                  )
                }
                className="w-full accent-neutral-950"
              />

              <div className="flex justify-between mt-1 text-[10px] text-neutral-400">
                <span>
                  ₹0
                </span>

                <span>
                  ₹
                  {
                    catalogMaxPrice
                  }
                </span>
              </div>
            </div>

            {/* Mobile Stock */}

            <div className="pt-4 border-t border-neutral-200">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-800">
                <input
                  type="checkbox"
                  checked={
                    inStockOnly
                  }
                  onChange={(
                    event
                  ) =>
                    setInStockOnly(
                      event.target
                        .checked
                    )
                  }
                  className="rounded text-neutral-950 focus:ring-neutral-950"
                />

                <span>
                  In Stock Only
                </span>
              </label>
            </div>

            {/* Mobile Buttons */}

            <div className="pt-4 border-t border-neutral-200 flex gap-3">
              <button
                type="button"
                onClick={
                  clearAllFilters
                }
                className="flex-1 py-2.5 border border-neutral-300 text-xs font-bold uppercase rounded-lg"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={() =>
                  setIsMobileFilterOpen(
                    false
                  )
                }
                className="flex-1 py-2.5 bg-neutral-950 text-white text-xs font-bold uppercase rounded-lg"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
