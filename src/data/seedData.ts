import { Category, Coupon, Product, Review } from '../types';

const IMAGE_BASE = 'https://placehold.co/800x1000/png';

export const SEED_CATEGORIES: Category[] = [
  {
    id: 'tshirts',
    name: 'T-Shirts',
    slug: 'tshirts',
    description:
      'Everyday Sanu Builds T-shirts with clean fits and comfortable fabrics.',
    image: `${IMAGE_BASE}?text=Sanu+Builds+T-Shirts`,
    featured: true,
    productCount: 2,
  },
  {
    id: 'polo-tshirts',
    name: 'Polo T-Shirts',
    slug: 'polo-tshirts',
    description:
      'Premium solid polo T-shirts for a clean and classic look.',
    image: `${IMAGE_BASE}?text=Sanu+Builds+Polo`,
    featured: true,
    productCount: 1,
  },
  {
    id: 'car-accessories',
    name: 'Car Accessories',
    slug: 'car-accessories',
    description:
      'Useful automotive accessories and products.',
    image: `${IMAGE_BASE}?text=Car+Accessories`,
    featured: true,
    productCount: 1,
  },
  {
    id: 'cables',
    name: 'Cables',
    slug: 'cables',
    description:
      'Reliable charging and data cables for everyday devices.',
    image: `${IMAGE_BASE}?text=USB+Cables`,
    featured: true,
    productCount: 1,
  },
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'sb-blk-polo-004',
    name: "Sanu Builds Men's Premium Black Solid Cotton Blend Polo T-Shirt",
    slug: 'sanu-builds-mens-premium-black-solid-cotton-blend-polo-tshirt',
    description:
      "Sanu Builds Men's Premium Black Solid Cotton Blend Polo T-Shirt. A clean and comfortable 160 GSM black polo T-shirt designed for everyday casual and smart-casual wear.",
    categoryId: 'polo-tshirts',
    categoryName: 'Polo T-Shirts',
    brand: 'Sanu Builds',
    price: 340,
    compareAtPrice: 340,
    discountPercentage: 0,

    images: [
      'https://ik.imagekit.io/4qm5muakl/Sanu%20Builds/7d042764-0cce-4484-99f8-cb7f0386cf73.jpg',
      'https://ik.imagekit.io/4qm5muakl/Sanu%20Builds/f3d9e258-9941-4749-8844-a0142830c74f.jpg',
      'https://ik.imagekit.io/4qm5muakl/Sanu%20Builds/2881efb5-c6c2-4625-9d82-a376b0c95b8b.jpg',
      'https://ik.imagekit.io/4qm5muakl/Sanu%20Builds/6346b4da-750a-471a-83d5-7ea9eb40e642.jpg',
    ],

    sizes: ['S', 'M', 'L'],

    colors: [
      {
        name: 'Black',
        hex: '#111111',
      },
    ],

    variants: [
      {
        id: 'sb-blk-polo-004-s',
        size: 'S',
        color: 'Black',
        stock: 10,
        sku: 'SB-BLK-POLO-004S',
        price: 340,
      },
      {
        id: 'sb-blk-polo-004-m',
        size: 'M',
        color: 'Black',
        stock: 10,
        sku: 'SB-BLK-POLO-004M',
        price: 340,
      },
      {
        id: 'sb-blk-polo-004-l',
        size: 'L',
        color: 'Black',
        stock: 10,
        sku: 'SB-BLK-POLO-004L',
        price: 340,
      },
    ],

    stock: 30,
    sku: 'SB-BLK-POLO-004',
    rating: 0,
    reviewCount: 0,

    tags: [
      'polo',
      'black polo',
      'cotton blend',
      'mens polo',
      '160gsm',
      'sanu builds',
    ],

    featured: true,
    bestseller: false,
    newArrival: true,
    active: true,

    details: {
      fabric: 'Cotton Blend',
      fit: 'Regular Fit',
      gsm: 160,
      washCare:
        'Machine wash cold with similar colors, do not bleach',
      modelDetails:
        'Model information will be updated when available',
    },

    createdAt: '2026-08-24T10:00:00.000Z',
    updatedAt: '2026-08-24T10:00:00.000Z',
  },

  {
    id: 'sb-rn-wht-001',
    name: "Men's White Round Neck T-Shirt",
    slug: 'mens-white-round-neck-tshirt',
    description:
      "Classic men's white round neck T-shirt from Sanu Builds. A simple everyday T-shirt designed for casual wear and easy styling.",
    categoryId: 'tshirts',
    categoryName: 'T-Shirts',
    brand: 'Sanu Builds',
    price: 180,
    compareAtPrice: 180,
    discountPercentage: 0,

    images: [
      `${IMAGE_BASE}?text=White+Round+Neck+T-Shirt`,
      `${IMAGE_BASE}?text=White+T-Shirt+Front`,
      `${IMAGE_BASE}?text=White+T-Shirt+Back`,
    ],

    sizes: ['M', 'L', 'XL'],

    colors: [
      {
        name: 'White',
        hex: '#FFFFFF',
      },
    ],

    variants: [
      {
        id: 'sb-rn-wht-001-m',
        size: 'M',
        color: 'White',
        stock: 10,
        sku: 'WT-WHT-130-RN-M',
        price: 180,
      },
      {
        id: 'sb-rn-wht-001-l',
        size: 'L',
        color: 'White',
        stock: 10,
        sku: 'WT-WHT-130-RN-L',
        price: 180,
      },
      {
        id: 'sb-rn-wht-001-xl',
        size: 'XL',
        color: 'White',
        stock: 10,
        sku: 'WT-WHT-130-RN-XL',
        price: 180,
      },
    ],

    stock: 30,
    sku: 'WT-WHT-130-RN',
    rating: 0,
    reviewCount: 0,

    tags: [
      'white t-shirt',
      'round neck',
      'mens t-shirt',
      'basic t-shirt',
      'sanu builds',
    ],

    featured: true,
    bestseller: false,
    newArrival: true,
    active: true,

    createdAt: '2026-08-24T10:10:00.000Z',
    updatedAt: '2026-08-24T10:10:00.000Z',
  },

  {
    id: 'anr-horn-001',
    name: 'ANRITVOX Horn 12V Dual Tone Set 2 PCS',
    slug: 'anritvox-horn-12v-dual-tone-set-2-pcs',
    description:
      'ANRITVOX 12V dual tone horn set containing 2 pieces. Suitable for compatible 12V vehicles.',
    categoryId: 'car-accessories',
    categoryName: 'Car Accessories',
    brand: 'ANRITVOX',
    price: 1699,
    compareAtPrice: 1699,
    discountPercentage: 0,

    images: [
      `${IMAGE_BASE}?text=ANRITVOX+12V+Horn`,
      `${IMAGE_BASE}?text=Dual+Tone+Horn`,
    ],

    sizes: ['Free Size'],

    colors: [
      {
        name: 'Black',
        hex: '#111111',
      },
    ],

    variants: [
      {
        id: 'anr-horn-001-free',
        size: 'Free Size',
        color: 'Black',
        stock: 0,
        sku: 'ANR-HORN-001',
        price: 1699,
      },
    ],

    stock: 0,
    sku: 'ANR-HORN-001',
    rating: 0,
    reviewCount: 0,

    tags: [
      'car horn',
      '12v horn',
      'dual tone',
      'anritvox',
      'car accessory',
    ],

    featured: false,
    bestseller: false,
    newArrival: true,
    active: true,

    createdAt: '2026-08-24T10:20:00.000Z',
    updatedAt: '2026-08-24T10:20:00.000Z',
  },

  {
    id: 'sb-usbc-2m-001',
    name: '2M USB A to USB C Data Charging Cable',
    slug: '2m-usb-a-to-usb-c-data-charging-cable',
    description:
      '2 meter USB A to USB C data and charging cable designed for convenient everyday charging and data transfer.',
    categoryId: 'cables',
    categoryName: 'Cables',
    brand: 'Sanu Builds',
    price: 110,
    compareAtPrice: 110,
    discountPercentage: 0,

    images: [
      `${IMAGE_BASE}?text=USB+A+to+USB+C+Cable`,
      `${IMAGE_BASE}?text=2M+USB+C+Cable`,
    ],

    sizes: ['Free Size'],

    colors: [
      {
        name: 'White',
        hex: '#FFFFFF',
      },
    ],

    variants: [
      {
        id: 'sb-usbc-2m-001-free',
        size: 'Free Size',
        color: 'White',
        stock: 100,
        sku: 'SB-USBC-2M-001',
        price: 110,
      },
    ],

    stock: 100,
    sku: 'SB-USBC-2M-001',
    rating: 0,
    reviewCount: 0,

    tags: [
      'usb cable',
      'usb c cable',
      'charging cable',
      'data cable',
      '2m cable',
    ],

    featured: false,
    bestseller: false,
    newArrival: true,
    active: true,

    createdAt: '2026-08-24T10:30:00.000Z',
    updatedAt: '2026-08-24T10:30:00.000Z',
  },
];

export const SEED_COUPONS: Coupon[] = [];

export const SEED_REVIEWS: Review[] = [];

export const INITIAL_PRODUCTS = SEED_PRODUCTS;
export const INITIAL_CATEGORIES = SEED_CATEGORIES;
export const INITIAL_COUPONS = SEED_COUPONS;
export const INITIAL_REVIEWS = SEED_REVIEWS;

export async function seedInitialStoreData(): Promise<void> {
  try {
    const {
      doc,
      writeBatch,
    } = await import('firebase/firestore');

    const { db } = await import('../lib/firebase');

    const batch = writeBatch(db);

    /*
     * Remove old sample products created by the previous
     * Sanu Builds demo catalog.
     */
    const oldSampleProductIds = [
      'sb-001',
      'sb-002',
      'sb-003',
      'sb-004',
      'sb-005',
      'sb-006',
    ];

    for (const productId of oldSampleProductIds) {
      batch.delete(doc(db, 'products', productId));
    }

    /*
     * Remove old sample categories.
     */
    const oldCategoryIds = [
      'oversized',
      'minimal',
      'graphic',
      'heavyweight',
      'regular',
    ];

    for (const categoryId of oldCategoryIds) {
      batch.delete(doc(db, 'categories', categoryId));
    }

    /*
     * Remove old demo coupons.
     */
    const oldCouponIds = [
      'c-build15',
      'c-sanu10',
      'c-freeship',
    ];

    for (const couponId of oldCouponIds) {
      batch.delete(doc(db, 'coupons', couponId));
    }

    /*
     * Remove old demo reviews.
     */
    const oldReviewIds = [
      'rev-01',
      'rev-02',
      'rev-03',
    ];

    for (const reviewId of oldReviewIds) {
      batch.delete(doc(db, 'reviews', reviewId));
    }

    /*
     * Add current categories.
     */
    for (const category of SEED_CATEGORIES) {
      batch.set(
        doc(db, 'categories', category.id),
        category
      );
    }

    /*
     * Add current products.
     */
    for (const product of SEED_PRODUCTS) {
      batch.set(
        doc(db, 'products', product.id),
        product
      );
    }

    /*
     * Add current coupons.
     */
    for (const coupon of SEED_COUPONS) {
      batch.set(
        doc(db, 'coupons', coupon.id),
        coupon
      );
    }

    /*
     * Add current reviews.
     */
    for (const review of SEED_REVIEWS) {
      batch.set(
        doc(db, 'reviews', review.id),
        review
      );
    }

    await batch.commit();

    console.log(
      'Sanu Builds real product catalog seeded successfully.'
    );
  } catch (err) {
    console.warn(
      'Could not complete Sanu Builds catalog seed:',
      err
    );
  }
}
