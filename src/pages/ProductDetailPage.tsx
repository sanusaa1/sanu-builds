// ProductDetailPage.tsx

import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

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

type AccordionKey =
  | 'specs'
  | 'wash'
  | 'shipping'
  | '';

export const ProductDetailPage: React.FC<
  ProductDetailPageProps
> = ({
  product,
  allProducts,
  onSelectProduct,
  onNavigate,
}) => {
  const { addToCart } = useCart();
  const {
    isInWishlist,
    toggleWishlist,
  } = useWishlist();

  const {
    success,
    error: toastError,
  } = useToast();

  /*
   * =========================================================
   * ADVANCED SEO HELPERS
   * =========================================================
   */

  const getSiteUrl = () => {
    if (
      typeof window !== 'undefined' &&
      window.location.origin
    ) {
      return window.location.origin.replace(
        /\/$/,
        ''
      );
    }

    return 'https://sanubuilds.com';
  };

  const siteUrl = getSiteUrl();

  const slugify = (
    value: string
  ) => {
    return value
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9]+/g,
        '-'
      )
      .replace(
        /^-+|-+$/g,
        '');
  };

  const productSlug =
    product.slug ||
    product.id ||
    slugify(
      product.name ||
        'product'
    );

  const productUrl =
    `${siteUrl}/product/${productSlug}`;

  const seoTitle =
    `${product.name} | ${
      product.brand ||
      'Sanu Builds'
    }`;

  const seoDescription = (
    product.description ||
    `Buy ${product.name} online from ${
      product.brand ||
      'Sanu Builds'
    }. Shop premium quality apparel with secure checkout, fast delivery and easy returns.`
  )
    .replace(
      /\s+/g,
      ' '
    )
    .trim()
    .slice(
      0,
      160
    );

  const seoImage =
    product.images?.[0] ||
    `${siteUrl}/og-image.jpg`;

  const seoImages =
    Array.isArray(
      product.images
    ) &&
    product.images.length >
      0
      ? product.images
      : [seoImage];

  const seoPrice =
    Number(
      product.price || 0
    );

  const seoCompareAtPrice =
    Number(
      product.compareAtPrice ||
        0
    );

  const seoStock =
    Number(
      product.stock || 0
    );

  const seoAvailability =
    seoStock > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock';

  const seoCategory =
    product.categoryName ||
    'Apparel';

  const seoBrand =
    product.brand ||
    'Sanu Builds';

  const seoSku =
    product.sku ||
    product.id ||
    productSlug;

  const seoKeywords = useMemo(() => {
    const values = [
      product.name,
      seoBrand,
      seoCategory,
      ...(Array.isArray(
        product.tags
      )
        ? product.tags
        : []),
      'Sanu Builds',
      'premium clothing',
      'premium apparel',
      'online clothing India',
      'buy clothes online India',
    ];

    return Array.from(
      new Set(
        values
          .filter(Boolean)
          .map(
            (value) =>
              String(value)
                .trim()
                .toLowerCase()
          )
          .filter(Boolean)
      )
    ).join(', ');
  }, [
    product.name,
    product.tags,
    seoBrand,
    seoCategory,
  ]);

  /*
   * =========================================================
   * SEO META + STRUCTURED DATA
   * =========================================================
   */

  useEffect(() => {
    if (
      typeof document ===
      'undefined'
    ) {
      return;
    }

    document.title =
      seoTitle;

    /*
     * -------------------------------------------------------
     * META HELPERS
     * -------------------------------------------------------
     */

    const ensureMeta = (
      selector: string,
      attributes: Record<
        string,
        string
      >,
      content: string
    ) => {
      let element =
        document.head.querySelector(
          selector
        ) as HTMLMetaElement | null;

      if (!element) {
        element =
          document.createElement(
            'meta'
          );

        Object.entries(
          attributes
        ).forEach(
          ([
            key,
            value,
          ]) => {
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
      href: string,
      attributes: Record<
        string,
        string
      > = {}
    ) => {
      let element =
        document.head.querySelector(
          `link[rel="${rel}"]`
        ) as HTMLLinkElement | null;

      if (!element) {
        element =
          document.createElement(
            'link'
          );

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

      Object.entries(
        attributes
      ).forEach(
        ([
          key,
          value,
        ]) => {
          element!.setAttribute(
            key,
            value
          );
        }
      );

      return element;
    };

    const ensureJsonLd = (
      id: string,
      data: unknown
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
        JSON.stringify(
          data
        );

      return script;
    };

    /*
     * -------------------------------------------------------
     * BASIC SEO
     * -------------------------------------------------------
     */

    ensureMeta(
      'meta[name="description"]',
      {
        name: 'description',
      },
      seoDescription
    );

    ensureMeta(
      'meta[name="keywords"]',
      {
        name: 'keywords',
      },
      seoKeywords
    );

    ensureMeta(
      'meta[name="robots"]',
      {
        name: 'robots',
      },
      'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );

    ensureMeta(
      'meta[name="googlebot"]',
      {
        name: 'googlebot',
      },
      'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );

    ensureMeta(
      'meta[name="bingbot"]',
      {
        name: 'bingbot',
      },
      'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
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

    ensureMeta(
      'meta[name="publisher"]',
      {
        name: 'publisher',
      },
      'Sanu Builds'
    );

    ensureMeta(
      'meta[name="rating"]',
      {
        name: 'rating',
      },
      'general'
    );

    ensureMeta(
      'meta[name="referrer"]',
      {
        name: 'referrer',
      },
      'strict-origin-when-cross-origin'
    );

    /*
     * -------------------------------------------------------
     * CANONICAL
     * -------------------------------------------------------
     */

    ensureLink(
      'canonical',
      productUrl
    );

    /*
     * -------------------------------------------------------
     * HREFLANG
     * -------------------------------------------------------
     */

    ensureLink(
      'alternate',
      productUrl,
      {
        hreflang: 'en-IN',
      }
    );

    ensureLink(
      'alternate',
      productUrl,
      {
        hreflang: 'x-default',
      }
    );

    /*
     * -------------------------------------------------------
     * OPEN GRAPH
     * -------------------------------------------------------
     */

    ensureMeta(
      'meta[property="og:type"]',
      {
        property:
          'og:type',
      },
      'product'
    );

    ensureMeta(
      'meta[property="og:title"]',
      {
        property:
          'og:title',
      },
      seoTitle
    );

    ensureMeta(
      'meta[property="og:description"]',
      {
        property:
          'og:description',
      },
      seoDescription
    );

    ensureMeta(
      'meta[property="og:url"]',
      {
        property:
          'og:url',
      },
      productUrl
    );

    ensureMeta(
      'meta[property="og:image"]',
      {
        property:
          'og:image',
      },
      seoImage
    );

    ensureMeta(
      'meta[property="og:image:alt"]',
      {
        property:
          'og:image:alt',
      },
      `${product.name} - Sanu Builds`
    );

    ensureMeta(
      'meta[property="og:site_name"]',
      {
        property:
          'og:site_name',
      },
      'Sanu Builds'
    );

    ensureMeta(
      'meta[property="og:locale"]',
      {
        property:
          'og:locale',
      },
      'en_IN'
    );

    ensureMeta(
      'meta[property="og:updated_time"]',
      {
        property:
          'og:updated_time',
      },
      new Date().toISOString()
    );

    /*
     * -------------------------------------------------------
     * MULTIPLE OG IMAGES
     * -------------------------------------------------------
     */

    seoImages
      .slice(0, 4)
      .forEach(
        (
          image,
          index
        ) => {
          ensureMeta(
            `meta[property="og:image"][data-seo-index="${index}"]`,
            {
              property:
                'og:image',
              'data-seo-index':
                String(
                  index
                ),
            },
            image
          );
        }
      );

    /*
     * -------------------------------------------------------
     * PRODUCT OG META
     * -------------------------------------------------------
     */

    ensureMeta(
      'meta[property="product:price:amount"]',
      {
        property:
          'product:price:amount',
      },
      seoPrice.toFixed(2)
    );

    ensureMeta(
      'meta[property="product:price:currency"]',
      {
        property:
          'product:price:currency',
      },
      'INR'
    );

    ensureMeta(
      'meta[property="product:availability"]',
      {
        property:
          'product:availability',
      },
      seoStock > 0
        ? 'in stock'
        : 'out of stock'
    );

    ensureMeta(
      'meta[property="product:condition"]',
      {
        property:
          'product:condition',
      },
      'new'
    );

    ensureMeta(
      'meta[property="product:category"]',
      {
        property:
          'product:category',
      },
      seoCategory
    );

    ensureMeta(
      'meta[property="product:brand"]',
      {
        property:
          'product:brand',
      },
      seoBrand
    );

    ensureMeta(
      'meta[property="product:retailer_item_id"]',
      {
        property:
          'product:retailer_item_id',
      },
      seoSku
    );

    /*
     * -------------------------------------------------------
     * TWITTER / X
     * -------------------------------------------------------
     */

    ensureMeta(
      'meta[name="twitter:card"]',
      {
        name:
          'twitter:card',
      },
      'summary_large_image'
    );

    ensureMeta(
      'meta[name="twitter:title"]',
      {
        name:
          'twitter:title',
      },
      seoTitle
    );

    ensureMeta(
      'meta[name="twitter:description"]',
      {
        name:
          'twitter:description',
      },
      seoDescription
    );

    ensureMeta(
      'meta[name="twitter:image"]',
      {
        name:
          'twitter:image',
      },
      seoImage
    );

    ensureMeta(
      'meta[name="twitter:image:alt"]',
      {
        name:
          'twitter:image:alt',
      },
      `${product.name} - Sanu Builds`
    );

    ensureMeta(
      'meta[name="twitter:label1"]',
      {
        name:
          'twitter:label1',
      },
      'Price'
    );

    ensureMeta(
      'meta[name="twitter:data1"]',
      {
        name:
          'twitter:data1',
      },
      `₹${seoPrice.toLocaleString(
        'en-IN'
      )}`
    );

    ensureMeta(
      'meta[name="twitter:label2"]',
      {
        name:
          'twitter:label2',
      },
      'Availability'
    );

    ensureMeta(
      'meta[name="twitter:data2"]',
      {
        name:
          'twitter:data2',
      },
      seoStock > 0
        ? 'In Stock'
        : 'Out of Stock'
    );

    /*
     * -------------------------------------------------------
     * RATING DATA
     * -------------------------------------------------------
     */

    const schemaRating =
      Math.min(
        5,
        Math.max(
          0,
          Number(
            product.rating ??
              0
          )
        )
      );

    const schemaReviewCount =
      Math.max(
        0,
        Number(
          product.reviewCount ??
            0
        )
      );

    /*
     * -------------------------------------------------------
     * PRODUCT DETAILS
     * -------------------------------------------------------
     */

    const details =
      product.details ||
      {};

    const productColor =
      details.color ||
      (Array.isArray(
        product.colors
      ) &&
      product.colors.length >
        0
        ? product.colors
            .map(
              (color) =>
                color.name
            )
            .filter(Boolean)
            .join(', ')
        : undefined);

    const productMaterial =
      details.material ||
      details.fabric;

    /*
     * -------------------------------------------------------
     * PRODUCT SCHEMA
     * -------------------------------------------------------
     */

    const offerSchema: Record<
      string,
      unknown
    > = {
      '@type': 'Offer',
      '@id': `${productUrl}#offer`,
      url: productUrl,
      priceCurrency: 'INR',
      price:
        seoPrice.toFixed(2),
      availability:
        seoAvailability,
      itemCondition:
        'https://schema.org/NewCondition',
      seller: {
        '@type':
          'Organization',
        '@id': `${siteUrl}#organization`,
        name: 'Sanu Builds',
        url: siteUrl,
      },
    };

    /*
     * Sale price validity
     */

    if (
      seoCompareAtPrice >
        seoPrice &&
      seoCompareAtPrice > 0
    ) {
      offerSchema.priceValidUntil =
        new Date(
          Date.now() +
            1000 *
              60 *
              60 *
              24 *
              30
        )
          .toISOString()
          .split('T')[0];
    }

    /*
     * Shipping details
     *
     * Uses the available product shipping
     * text without inventing a shipping price.
     */

    if (
      details.shipping ||
      details.shippingInfo
    ) {
      offerSchema.shippingDetails =
        {
          '@type':
            'OfferShippingDetails',
          description:
            details.shipping ||
            details.shippingInfo,
        };
    }

    /*
     * Product return information
     */

    if (
      details.returnPolicy ||
      details.returns
    ) {
      offerSchema.hasMerchantReturnPolicy =
        {
          '@type':
            'MerchantReturnPolicy',
          description:
            details.returnPolicy ||
            details.returns,
        };
    }

    const productSchema: Record<
      string,
      unknown
    > = {
      '@context':
        'https://schema.org',
      '@type': 'Product',
      '@id': `${productUrl}#product`,
      name: product.name,
      url: productUrl,
      description:
        seoDescription,
      image: seoImages,
      sku: seoSku,
      mpn:
        product.sku ||
        undefined,
      category:
        seoCategory,
      brand: {
        '@type':
          'Brand',
        name: seoBrand,
      },
      offers:
        offerSchema,
    };

    if (productColor) {
      productSchema.color =
        productColor;
    }

    if (productMaterial) {
      productSchema.material =
        productMaterial;
    }

    if (
      Array.isArray(
        product.sizes
      ) &&
      product.sizes.length >
        0
    ) {
      productSchema.size =
        product.sizes.join(
          ', '
        );
    }

    if (
      product.description
    ) {
      productSchema.disambiguatingDescription =
        product.description;
    }

    if (
      schemaRating > 0 &&
      schemaReviewCount > 0
    ) {
      productSchema.aggregateRating =
        {
          '@type':
            'AggregateRating',
          ratingValue:
            schemaRating.toFixed(
              1
            ),
          bestRating:
            '5',
          worstRating:
            '1',
          reviewCount:
            schemaReviewCount,
        };
    }

    /*
     * -------------------------------------------------------
     * BREADCRUMB SCHEMA
     * -------------------------------------------------------
     */

    const breadcrumbSchema =
      {
        '@context':
          'https://schema.org',
        '@type':
          'BreadcrumbList',
        '@id': `${productUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type':
              'ListItem',
            position: 1,
            name: 'Home',
            item: siteUrl,
          },
          {
            '@type':
              'ListItem',
            position: 2,
            name:
              seoCategory,
            item: `${siteUrl}/shop`,
          },
          {
            '@type':
              'ListItem',
            position: 3,
            name:
              product.name,
            item: productUrl,
          },
        ],
      };

    /*
     * -------------------------------------------------------
     * ORGANIZATION SCHEMA
     * -------------------------------------------------------
     */

    const organizationSchema =
      {
        '@context':
          'https://schema.org',
        '@type':
          'Organization',
        '@id': `${siteUrl}#organization`,
        name: 'Sanu Builds',
        url: siteUrl,
        logo: {
          '@type':
            'ImageObject',
          url: `${siteUrl}/logo.png`,
        },
      };

    /*
     * -------------------------------------------------------
     * WEBSITE SCHEMA
     * -------------------------------------------------------
     */

    const websiteSchema =
      {
        '@context':
          'https://schema.org',
        '@type':
          'WebSite',
        '@id': `${siteUrl}#website`,
        url: siteUrl,
        name: 'Sanu Builds',
        publisher: {
          '@id': `${siteUrl}#organization`,
        },
        inLanguage:
          'en-IN',
      };

    /*
     * -------------------------------------------------------
     * WEBPAGE SCHEMA
     * -------------------------------------------------------
     */

    const webpageSchema =
      {
        '@context':
          'https://schema.org',
        '@type':
          'WebPage',
        '@id': `${productUrl}#webpage`,
        url: productUrl,
        name: seoTitle,
        description:
          seoDescription,
        isPartOf: {
          '@id': `${siteUrl}#website`,
        },
        about: {
          '@id': `${productUrl}#product`,
        },
        primaryImageOfPage: {
          '@type':
            'ImageObject',
          url: seoImage,
        },
        breadcrumb: {
          '@id': `${productUrl}#breadcrumb`,
        },
        inLanguage:
          'en-IN',
      };

    /*
     * -------------------------------------------------------
     * JSON-LD INSERTION
     * -------------------------------------------------------
     */

    ensureJsonLd(
      'product-jsonld',
      productSchema
    );

    ensureJsonLd(
      'breadcrumb-jsonld',
      breadcrumbSchema
    );

    ensureJsonLd(
      'organization-jsonld',
      organizationSchema
    );

    ensureJsonLd(
      'website-jsonld',
      websiteSchema
    );

    ensureJsonLd(
      'webpage-jsonld',
      webpageSchema
    );

    /*
     * -------------------------------------------------------
     * CLEANUP
     * -------------------------------------------------------
     */

    return () => {
      [
        'product-jsonld',
        'breadcrumb-jsonld',
        'organization-jsonld',
        'website-jsonld',
        'webpage-jsonld',
      ].forEach(
        (seoId) => {
          document.head
            .querySelector(
              `script[data-seo="${seoId}"]`
            )
            ?.remove();
        }
      );
    };
  }, [
    product,
    productUrl,
    seoTitle,
    seoDescription,
    seoImage,
    seoImages,
    seoPrice,
    seoCompareAtPrice,
    seoAvailability,
    seoKeywords,
    seoBrand,
    seoCategory,
    seoSku,
    seoStock,
    siteUrl,
  ]);

  /*
   * =========================================================
   * INDIAN CURRENCY FORMAT
   * =========================================================
   */

  const formatPrice = (
    value: number
  ) => {
    return new Intl.NumberFormat(
      'en-IN',
      {
        style:
          'currency',
        currency:
          'INR',
        minimumFractionDigits:
          2,
        maximumFractionDigits:
          2,
      }
    ).format(value);
  };

  /*
   * =========================================================
   * SAFE PRODUCT DATA
   * =========================================================
   */

  const sizes =
    Array.isArray(
      product.sizes
    )
      ? product.sizes.filter(
          Boolean
        )
      : [];

  const colors =
    Array.isArray(
      product.colors
    )
      ? product.colors.filter(
          (color) =>
            color?.name
        )
      : [];

  const variants =
    Array.isArray(
      product.variants
    )
      ? product.variants
      : [];

  /*
   * =========================================================
   * LOCAL STATE
   * =========================================================
   */

  const [
    selectedSize,
    setSelectedSize,
  ] =
    useState<string>(
      sizes[0] || ''
    );

  const [
    selectedColor,
    setSelectedColor,
  ] =
    useState<string>(
      colors[0]?.name ||
        ''
    );

  const [
    quantity,
    setQuantity,
  ] =
    useState<number>(1);

  const [
    isSizeGuideOpen,
    setIsSizeGuideOpen,
  ] =
    useState<boolean>(
      false
    );

  const [
    openAccordion,
    setOpenAccordion,
  ] =
    useState<AccordionKey>(
      'specs'
    );

  /*
   * =========================================================
   * PRODUCT CHANGE HANDLING
   * =========================================================
   */

  useEffect(() => {
    const firstSize =
      sizes[0] || '';

    const sizeStillValid =
      selectedSize &&
      sizes.includes(
        selectedSize
      );

    if (
      !sizeStillValid
    ) {
      setSelectedSize(
        firstSize
      );
    }

    const firstColor =
      colors[0]?.name ||
      '';

    const colorStillValid =
      selectedColor &&
      colors.some(
        (color) =>
          color.name ===
          selectedColor
      );

    if (
      !colorStillValid
    ) {
      setSelectedColor(
        firstColor
      );
    }

    setQuantity(1);
  }, [product.id]);

  /*
   * =========================================================
   * WISHLIST
   * =========================================================
   */

  const isSaved =
    isInWishlist(
      product.id
    );

  /*
   * =========================================================
   * CURRENT VARIANT
   * =========================================================
   */

  const currentVariant =
    useMemo(() => {
      if (
        !selectedSize ||
        !selectedColor
      ) {
        return null;
      }

      return (
        variants.find(
          (variant) =>
            variant.size ===
              selectedSize &&
            variant.color ===
              selectedColor
        ) || null
      );
    }, [
      variants,
      selectedSize,
      selectedColor,
    ]);

  /*
   * =========================================================
   * STOCK LOGIC
   * =========================================================
   */

  const maxStock =
    useMemo(() => {
      if (
        currentVariant
      ) {
        return Math.max(
          0,
          Number(
            currentVariant.stock ||
              0
          )
        );
      }

      return Math.max(
        0,
        Number(
          product.stock ||
            0
        )
      );
    }, [
      currentVariant,
      product.stock,
    ]);

  const isOutOfStock =
    maxStock <= 0;

  useEffect(() => {
    setQuantity(
      (
        currentQuantity
      ) => {
        if (
          maxStock <= 0
        ) {
          return 1;
        }

        return Math.min(
          Math.max(
            1,
            currentQuantity
          ),
          maxStock
        );
      }
    );
  }, [maxStock]);

  /*
   * =========================================================
   * PRICE / DISCOUNT
   * =========================================================
   */

  const price =
    Number(
      product.price || 0
    );

  const compareAtPrice =
    Number(
      product.compareAtPrice ||
        0
    );

  const calculatedDiscountPercentage =
    compareAtPrice >
      price &&
    price > 0
      ? Math.round(
          ((compareAtPrice -
            price) /
            compareAtPrice) *
            100
        )
      : 0;

  const discountPercentage =
    Number(
      product.discountPercentage ||
        0
    ) ||
    calculatedDiscountPercentage;

  /*
   * =========================================================
   * RATING
   * =========================================================
   */

  const rating =
    Math.min(
      5,
      Math.max(
        0,
        Number(
          product.rating ??
            0
        )
      )
    );

  const reviewCount =
    Math.max(
      0,
      Number(
        product.reviewCount ??
          0
      )
    );

  /*
   * =========================================================
   * PRODUCT DETAILS
   * =========================================================
   */

  const details =
    product.details ||
    {};

  const fabric =
    details.fabric ||
    'Fabric details not provided';

  const gsm =
    details.gsm !==
      undefined &&
    details.gsm !== null &&
    details.gsm !== ''
      ? details.gsm
      : null;

  const fit =
    details.fit ||
    'Fit details not provided';

  const collar =
    details.collar ||
    'Collar details not provided';

  const modelDetails =
    details.modelDetails ||
    '';

  const washCare =
    details.washCare ||
    'Wash-care information not provided';

  /*
   * =========================================================
   * SHIPPING / RETURNS
   * =========================================================
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
   * =========================================================
   * RELATED PRODUCTS
   * =========================================================
   */

  const relatedProducts =
    useMemo(() => {
      const currentTags =
        Array.isArray(
          product.tags
        )
          ? product.tags.map(
              (tag) =>
                tag.toLowerCase()
            )
          : [];

      const candidates =
        allProducts
          .filter(
            (item) =>
              item.id !==
              product.id
          )
          .filter(
            (item) =>
              item.active !==
              false
          );

      const scored =
        candidates.map(
          (item) => {
            let score = 0;

            if (
              product.categoryId &&
              item.categoryId ===
                product.categoryId
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

            const itemTags =
              Array.isArray(
                item.tags
              )
                ? item.tags.map(
                    (tag) =>
                      tag.toLowerCase()
                  )
                : [];

            const matchingTags =
              itemTags.filter(
                (tag) =>
                  currentTags.includes(
                    tag
                  )
              ).length;

            score +=
              matchingTags;

            if (
              item.featured
            ) {
              score += 1;
            }

            if (
              item.bestseller
            ) {
              score += 1;
            }

            return {
              item,
              score,
            };
          }
        );

      return scored
        .sort(
          (a, b) =>
            b.score -
            a.score
        )
        .slice(
          0,
          4
        )
        .map(
          ({
            item,
          }) => item
        );
    }, [
      allProducts,
      product.id,
      product.categoryId,
      product.brand,
      product.tags,
    ]);

  /*
   * =========================================================
   * HANDLERS
   * =========================================================
   */

  const handleColorChange =
    (
      color: string
    ) => {
      setSelectedColor(
        color
      );

      const matchingSizes =
        sizes.filter(
          (size) => {
            const variant =
              variants.find(
                (item) =>
                  item.size ===
                    size &&
                  item.color ===
                    color
              );

            return (
              !variant ||
              Number(
                variant.stock ||
                  0
              ) > 0
            );
          }
        );

      if (
        selectedSize &&
        matchingSizes.includes(
          selectedSize
        )
      ) {
        return;
      }

      if (
        matchingSizes.length >
        0
      ) {
        setSelectedSize(
          matchingSizes[0]
        );
      } else if (
        sizes.length > 0
      ) {
        setSelectedSize(
          sizes[0]
        );
      }
    };

  const handleSizeChange =
    (
      size: string
    ) => {
      setSelectedSize(
        size
      );
    };

  const handleQuantityDecrease =
    () => {
      setQuantity(
        (
          currentQuantity
        ) =>
          Math.max(
            1,
            currentQuantity -
              1
          )
      );
    };

  const handleQuantityIncrease =
    () => {
      if (
        maxStock <= 0
      ) {
        return;
      }

      setQuantity(
        (
          currentQuantity
        ) =>
          Math.min(
            maxStock,
            currentQuantity +
              1
          )
      );
    };

  const handleAddToCart =
    () => {
      if (
        isOutOfStock
      ) {
        toastError(
          `Selected ${
            selectedSize ||
            'size'
          } / ${
            selectedColor ||
            'color'
          } is currently out of stock.`
        );

        return;
      }

      if (
        quantity >
        maxStock
      ) {
        toastError(
          `Only ${maxStock} item${
            maxStock === 1
              ? ''
              : 's'
          } available.`
        );

        setQuantity(
          maxStock
        );

        return;
      }

      addToCart(
        product,
        selectedSize,
        selectedColor,
        quantity
      );

      success(
        'Product added to your bag.'
      );
    };

  const handleBuyNow =
    () => {
      if (
        isOutOfStock
      ) {
        toastError(
          `Selected ${
            selectedSize ||
            'size'
          } / ${
            selectedColor ||
            'color'
          } is currently out of stock.`
        );

        return;
      }

      if (
        quantity >
        maxStock
      ) {
        toastError(
          `Only ${maxStock} item${
            maxStock === 1
              ? ''
              : 's'
          } available.`
        );

        setQuantity(
          maxStock
        );

        return;
      }

      addToCart(
        product,
        selectedSize,
        selectedColor,
        quantity
      );

      onNavigate(
        '/checkout'
      );
    };

  const handleWishlist =
    () => {
      toggleWishlist(
        product
      );
    };

  /*
   * =========================================================
   * ACCORDION
   * =========================================================
   */

  const toggleAccordion =
    (
      key: AccordionKey
    ) => {
      setOpenAccordion(
        (current) =>
          current === key
            ? ''
            : key
      );
    };

  /*
   * =========================================================
   * SIZE AVAILABILITY
   * =========================================================
   */

  const getSizeVariant =
    (
      size: string
    ) => {
      if (
        !selectedColor
      ) {
        return null;
      }

      return (
        variants.find(
          (variant) =>
            variant.size ===
              size &&
            variant.color ===
              selectedColor
        ) || null
      );
    };

  const isSizeOutOfStock =
    (
      size: string
    ) => {
      const variant =
        getSizeVariant(
          size
        );

      if (
        variants.length >
        0
      ) {
        return (
          !variant ||
          Number(
            variant.stock ||
              0
          ) <= 0
        );
      }

      return (
        Number(
          product.stock || 0
        ) <= 0
      );
    };

  /*
   * =========================================================
   * STAR RENDERING
   * =========================================================
   */

  const renderRatingStars =
    () => {
      return [
        1,
        2,
        3,
        4,
        5,
      ].map(
        (
          starNumber
        ) => {
          const filled =
            rating >=
            starNumber;

          const partiallyFilled =
            rating >=
              starNumber -
                0.5 &&
            rating <
              starNumber;

          return (
            <Star
              key={
                starNumber
              }
              className={`w-4 h-4 ${
                filled ||
                partiallyFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-neutral-300'
              }`}
            />
          );
        }
      );
    };

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <main
      itemScope
      itemType="https://schema.org/Product"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16"
    >
      {/* =====================================================
          MICRODATA SEO
      ====================================================== */}

      <meta
        itemProp="name"
        content={
          product.name
        }
      />

      <meta
        itemProp="description"
        content={
          seoDescription
        }
      />

      <meta
        itemProp="url"
        content={
          productUrl
        }
      />

      <meta
        itemProp="category"
        content={
          seoCategory
        }
      />

      <meta
        itemProp="brand"
        content={
          seoBrand
        }
      />

      <meta
        itemProp="sku"
        content={
          seoSku
        }
      />

      {seoImage && (
        <meta
          itemProp="image"
          content={
            seoImage
          }
        />
      )}

      {/* =====================================================
          BREADCRUMBS
      ====================================================== */}

      <nav
        aria-label="Breadcrumb"
        className="text-xs text-neutral-500 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() =>
            onNavigate('/')
          }
          className="hover:text-neutral-900 transition-colors"
        >
          Home
        </button>

        <span>/</span>

        <button
          type="button"
          onClick={() =>
            onNavigate(
              '/shop'
            )
          }
          className="hover:text-neutral-900 transition-colors"
        >
          {product.categoryName ||
            'Shop'}
        </button>

        <span>/</span>

        <span
          className="text-neutral-900 font-semibold truncate"
          aria-current="page"
        >
          {product.name}
        </span>
      </nav>

      {/* =====================================================
          PRODUCT SHOWCASE
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        <div className="lg:col-span-7">
          <ProductGallery
            images={
              product.images ||
              []
            }
            productName={
              product.name
            }
          />
        </div>

        <div className="lg:col-span-5 space-y-6">
          {/* BRAND + TITLE */}

          <div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
                {product.brand ||
                  'Brand'}
                {' • '}
                {product.categoryName ||
                  'Apparel'}
              </span>

              {product.sku && (
                <span className="text-[11px] font-mono font-medium text-neutral-400 shrink-0">
                  SKU:{' '}
                  {product.sku}
                </span>
              )}
            </div>

            <h1
              itemProp="name"
              className="text-xl sm:text-2xl lg:text-3xl font-black text-neutral-900 tracking-tight mt-1"
            >
              {product.name}
            </h1>

            {/* RATING */}

            <div
              className="flex items-center gap-2 mt-2"
              itemProp={
                reviewCount > 0
                  ? 'aggregateRating'
                  : undefined
              }
              itemScope={
                reviewCount > 0
              }
              itemType={
                reviewCount > 0
                  ? 'https://schema.org/AggregateRating'
                  : undefined
              }
            >
              {reviewCount >
                0 && (
                <>
                  <meta
                    itemProp="ratingValue"
                    content={rating.toFixed(
                      1
                    )}
                  />

                  <meta
                    itemProp="bestRating"
                    content="5"
                  />

                  <meta
                    itemProp="worstRating"
                    content="1"
                  />

                  <meta
                    itemProp="reviewCount"
                    content={String(
                      reviewCount
                    )}
                  />
                </>
              )}

              <div
                className="flex items-center"
                aria-label={`${rating} out of 5 stars`}
              >
                {renderRatingStars()}
              </div>

              <span className="text-xs font-bold text-neutral-900">
                {rating > 0
                  ? rating.toFixed(
                      1
                    )
                  : 'No rating'}
              </span>

              <span className="text-xs text-neutral-400">
                (
                {
                  reviewCount
                }{' '}
                {reviewCount ===
                1
                  ? 'review'
                  : 'reviews'}
                )
              </span>
            </div>
          </div>

          {/* PRICE / OFFER */}

          <div
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
            className="flex items-baseline gap-3 pb-4 border-b border-neutral-100"
          >
            <meta
              itemProp="priceCurrency"
              content="INR"
            />

            <meta
              itemProp="availability"
              content={
                seoAvailability
              }
            />

            <meta
              itemProp="itemCondition"
              content="https://schema.org/NewCondition"
            />

            <meta
              itemProp="url"
              content={
                productUrl
              }
            />

            <meta
              itemProp="seller"
              content="Sanu Builds"
            />

            <span
              itemProp="price"
              content={price.toFixed(
                2
              )}
              className="text-2xl sm:text-3xl font-black text-neutral-900"
            >
              {formatPrice(
                price
              )}
            </span>

            {compareAtPrice >
              price && (
              <>
                <span className="text-base text-neutral-400 line-through">
                  {formatPrice(
                    compareAtPrice
                  )}
                </span>

                {discountPercentage >
                  0 && (
                  <span className="px-2 py-0.5 bg-neutral-100 text-neutral-900 border border-neutral-300 text-xs font-bold rounded">
                    Save{' '}
                    {
                      discountPercentage
                    }
                    %
                  </span>
                )}
              </>
            )}
          </div>

          {/* COLOR SELECTOR */}

          {colors.length >
            0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                  Color:{' '}
                  <span className="text-neutral-900 font-black">
                    {selectedColor ||
                      'Select color'}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {colors.map(
                  (
                    color
                  ) => (
                    <button
                      key={
                        color.name
                      }
                      type="button"
                      onClick={() =>
                        handleColorChange(
                          color.name
                        )
                      }
                      className={`relative p-1 rounded-full border transition-all ${
                        selectedColor ===
                        color.name
                          ? 'border-neutral-950 ring-2 ring-neutral-950'
                          : 'border-neutral-300 hover:border-neutral-700'
                      }`}
                      title={
                        color.name
                      }
                      aria-label={`Select ${color.name}`}
                      aria-pressed={
                        selectedColor ===
                        color.name
                      }
                    >
                      <span
                        className="block w-6 h-6 rounded-full border border-neutral-200"
                        style={{
                          backgroundColor:
                            color.hex ||
                            '#000000',
                        }}
                      />
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* SIZE SELECTOR */}

          {sizes.length >
            0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                  Size:{' '}
                  <span className="text-neutral-900 font-black">
                    {selectedSize ||
                      'Select size'}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setIsSizeGuideOpen(
                      true
                    )
                  }
                  className="text-xs font-semibold text-neutral-600 hover:text-neutral-950 flex items-center gap-1 underline"
                >
                  <Ruler className="w-3.5 h-3.5" />

                  <span>
                    Size Guide
                  </span>
                </button>
              </div>

              <div
                className={`grid gap-2 ${
                  sizes.length >=
                  5
                    ? 'grid-cols-5'
                    : sizes.length ===
                      4
                    ? 'grid-cols-4'
                    : sizes.length ===
                      3
                    ? 'grid-cols-3'
                    : sizes.length ===
                      2
                    ? 'grid-cols-2'
                    : 'grid-cols-1'
                }`}
              >
                {sizes.map(
                  (
                    size
                  ) => {
                    const isOOS =
                      isSizeOutOfStock(
                        size
                      );

                    return (
                      <button
                        key={
                          size
                        }
                        type="button"
                        disabled={
                          isOOS
                        }
                        onClick={() =>
                          handleSizeChange(
                            size
                          )
                        }
                        className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
                          selectedSize ===
                          size
                            ? 'bg-neutral-950 text-white border-neutral-950 shadow-xs'
                            : isOOS
                            ? 'bg-neutral-100 text-neutral-300 border-neutral-200 line-through cursor-not-allowed'
                            : 'bg-white text-neutral-800 border-neutral-300 hover:border-neutral-950'
                        }`}
                        aria-label={`Size ${size}`}
                        aria-pressed={
                          selectedSize ===
                          size
                        }
                      >
                        {size}
                      </button>
                    );
                  }
                )}
              </div>

              <div className="mt-2 text-xs">
                {isOutOfStock ? (
                  <span className="text-rose-600 font-bold">
                    Out of stock
                    in{' '}
                    {selectedSize ||
                      'selected size'}
                    {' / '}
                    {selectedColor ||
                      'selected color'}
                  </span>
                ) : maxStock <
                  10 ? (
                  <span className="text-amber-600 font-bold">
                    Only{' '}
                    {
                      maxStock
                    }{' '}
                    left in
                    stock —
                    order
                    soon
                  </span>
                ) : (
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    In stock
                    and ready
                    to
                    dispatch
                  </span>
                )}
              </div>
            </div>
          )}

          {/* QUANTITY + ACTIONS */}

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-neutral-300 rounded-lg p-1 bg-neutral-50 shrink-0">
                <button
                  type="button"
                  disabled={
                    quantity <=
                      1 ||
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
                  {
                    quantity
                  }
                </span>

                <button
                  type="button"
                  disabled={
                    quantity >=
                      maxStock ||
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

              <button
                id="add-to-cart-btn"
                type="button"
                disabled={
                  isOutOfStock
                }
                onClick={
                  handleAddToCart
                }
                className="flex-1 py-3.5 bg-neutral-950 hover:bg-neutral-800 disabled:bg-neutral-300 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />

                <span>
                  {isOutOfStock
                    ? 'Sold Out'
                    : 'Add To Bag'}
                </span>
              </button>

              <button
                id="pdp-wishlist-btn"
                type="button"
                onClick={
                  handleWishlist
                }
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
                aria-pressed={
                  isSaved
                }
              >
                <Heart
                  className={`w-4 h-4 ${
                    isSaved
                      ? 'fill-white'
                      : ''
                  }`}
                />
              </button>
            </div>

            {/* BUY NOW */}

            <button
              id="buy-now-btn"
              type="button"
              disabled={
                isOutOfStock
              }
              onClick={
                handleBuyNow
              }
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

          {/* VALUE PROPS */}

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-neutral-100 text-center text-[11px] text-neutral-600">
            <div
              className="p-2 bg-neutral-50 rounded-lg"
              title={
                freeShippingText
              }
            >
              <Truck className="w-4 h-4 mx-auto mb-1 text-neutral-900" />

              <span className="block line-clamp-2">
                {
                  freeShippingText
                }
              </span>
            </div>

            <div
              className="p-2 bg-neutral-50 rounded-lg"
              title={
                weightText
              }
            >
              <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-neutral-900" />

              <span className="block line-clamp-2">
                {
                  weightText
                }
              </span>
            </div>

            <div
              className="p-2 bg-neutral-50 rounded-lg"
              title={
                returnText
              }
            >
              <RotateCcw className="w-4 h-4 mx-auto mb-1 text-neutral-900" />

              <span className="block line-clamp-2">
                {
                  returnText
                }
              </span>
            </div>
          </div>

          {/* PRODUCT ACCORDIONS */}

          <div className="border-t border-neutral-200 divide-y divide-neutral-200">
            {/* FABRIC */}

            <div>
              <button
                type="button"
                onClick={() =>
                  toggleAccordion(
                    'specs'
                  )
                }
                className="w-full py-3.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-900"
                aria-expanded={
                  openAccordion ===
                  'specs'
                }
              >
                <span>
                  {details.specsTitle ||
                    'Fabric & Engineering Details'}
                </span>

                {openAccordion ===
                'specs' ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {openAccordion ===
                'specs' && (
                <div className="pb-4 text-xs text-neutral-600 space-y-2 leading-relaxed animate-in fade-in duration-150">
                  {product.description && (
                    <p itemProp="description">
                      {
                        product.description
                      }
                    </p>
                  )}

                  <ul className="list-disc pl-4 space-y-1 text-neutral-700">
                    <li>
                      Fabric:{' '}
                      {
                        fabric
                      }
                    </li>

                    {gsm !==
                      null && (
                      <li>
                        Fabric
                        Weight:{' '}
                        {gsm}{' '}
                        GSM
                      </li>
                    )}

                    <li>
                      Fit:{' '}
                      {fit}
                    </li>

                    <li>
                      Collar:{' '}
                      {
                        collar
                      }
                    </li>

                    {modelDetails && (
                      <li>
                        {
                          modelDetails
                        }
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
                  toggleAccordion(
                    'wash'
                  )
                }
                className="w-full py-3.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-900"
                aria-expanded={
                  openAccordion ===
                  'wash'
                }
              >
                <span>
                  {details.washTitle ||
                    'Wash & Garment Care'}
                </span>

                {openAccordion ===
                'wash' ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {openAccordion ===
                'wash' && (
                <div className="pb-4 text-xs text-neutral-600 space-y-1.5 leading-relaxed animate-in fade-in duration-150">
                  {Array.isArray(
                    washCare
                  ) ? (
                    washCare.map(
                      (
                        instruction: string,
                        index: number
                      ) => (
                        <p
                          key={
                            index
                          }
                        >
                          •{' '}
                          {
                            instruction
                          }
                        </p>
                      )
                    )
                  ) : (
                    <p>
                      •{' '}
                      {
                        washCare
                      }
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
                  toggleAccordion(
                    'shipping'
                  )
                }
                className="w-full py-3.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-900"
                aria-expanded={
                  openAccordion ===
                  'shipping'
                }
              >
                <span>
                  {details.shippingTitle ||
                    'Shipping & Returns'}
                </span>

                {openAccordion ===
                'shipping' ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {openAccordion ===
                'shipping' && (
                <div className="pb-4 text-xs text-neutral-600 space-y-2 leading-relaxed animate-in fade-in duration-150">
                  <p>
                    •{' '}
                    {
                      shippingText
                    }
                  </p>

                  <p>
                    •{' '}
                    {
                      returnText
                    }
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

      <section
        aria-label="Product reviews"
        className="pt-8 border-t border-neutral-200"
      >
        <ProductReviews
          product={
            product
          }
        />
      </section>

      {/* =====================================================
          RELATED PRODUCTS
      ====================================================== */}

      {relatedProducts.length >
        0 && (
        <section
          aria-labelledby="related-products-title"
          className="pt-8 border-t border-neutral-200"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                You May Also
                Like
              </span>

              <h2
                id="related-products-title"
                className="text-xl font-black text-neutral-900 tracking-tight"
              >
                Pair With
                These
                Silhouettes
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map(
              (
                relatedProduct
              ) => (
                <ProductCard
                  key={
                    relatedProduct.id
                  }
                  product={
                    relatedProduct
                  }
                  onSelect={
                    onSelectProduct
                  }
                />
              )
            )}
          </div>
        </section>
      )}

      {/* =====================================================
          SIZE GUIDE
      ====================================================== */}

      <SizeGuideModal
        isOpen={
          isSizeGuideOpen
        }
        onClose={() =>
          setIsSizeGuideOpen(
            false
          )
        }
      />
    </main>
  );
};
