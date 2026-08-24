import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  writeBatch,
} from 'firebase/firestore';

import { db } from '../lib/firebase';
import { Product, Category, FilterState } from '../types';
import {
  SEED_PRODUCTS,
  SEED_CATEGORIES,
  SEED_COUPONS,
  SEED_REVIEWS,
} from '../data/seedData';

const PRODUCTS_COLLECTION = 'products';
const CATEGORIES_COLLECTION = 'categories';
const COUPONS_COLLECTION = 'coupons';
const REVIEWS_COLLECTION = 'reviews';

/* =========================================================
   HELPERS
========================================================= */

function normalizeProduct(data: any, id: string): Product {
  return {
    id,
    ...data,
    name: data?.name || '',
    description: data?.description || '',
    brand: data?.brand || '',
    sku: data?.sku || '',
    slug: data?.slug || id,
    categoryId: data?.categoryId || '',
    categoryName: data?.categoryName || '',
    tags: Array.isArray(data?.tags) ? data.tags : [],
    sizes: Array.isArray(data?.sizes) ? data.sizes : [],
    images: Array.isArray(data?.images) ? data.images : [],
    price: Number(data?.price || 0),
    stock: Number(data?.stock || 0),
    rating: Number(data?.rating || 0),
    reviewCount: Number(data?.reviewCount || 0),
    active: data?.active !== false,
    featured: data?.featured === true,
    bestseller: data?.bestseller === true,
    newArrival: data?.newArrival === true,
  } as Product;
}

function normalizeCategory(data: any, id: string): Category {
  return {
    id,
    ...data,
    name: data?.name || '',
    slug: data?.slug || id,
    description: data?.description || '',
    image: data?.image || '',
  } as Category;
}

/* =========================================================
   DATABASE INITIALIZATION
========================================================= */

/**
 * Optional development initializer.
 *
 * IMPORTANT:
 * This is NOT required for the storefront.
 * It only seeds Firestore when products collection is empty.
 *
 * If you want a completely Firebase-admin-managed catalog,
 * simply don't call this function.
 */
export async function ensureDatabaseInitialized(): Promise<void> {
  try {
    const productsSnap = await getDocs(
      query(collection(db, PRODUCTS_COLLECTION), limit(1))
    );

    if (!productsSnap.empty) {
      return;
    }

    console.log('Products collection is empty.');

    const batch = writeBatch(db);

    for (const cat of SEED_CATEGORIES) {
      const catRef = doc(db, CATEGORIES_COLLECTION, cat.id);
      batch.set(catRef, cat);
    }

    for (const product of SEED_PRODUCTS) {
      const productRef = doc(
        db,
        PRODUCTS_COLLECTION,
        product.id
      );

      batch.set(productRef, product);
    }

    for (const coupon of SEED_COUPONS) {
      const couponRef = doc(
        db,
        COUPONS_COLLECTION,
        coupon.id
      );

      batch.set(couponRef, coupon);
    }

    for (const review of SEED_REVIEWS) {
      const reviewRef = doc(
        db,
        REVIEWS_COLLECTION,
        review.id
      );

      batch.set(reviewRef, review);
    }

    await batch.commit();

    console.log('Initial Firestore seed completed.');
  } catch (error) {
    console.error(
      'Database initialization failed:',
      error
    );

    throw error;
  }
}

/* =========================================================
   FILTERS
========================================================= */

function applyFilters(
  products: Product[],
  filters?: Partial<FilterState>
): Product[] {
  let result = [...products];

  /*
   * Storefront should only show active products.
   */
  result = result.filter(
    (product) => product.active !== false
  );

  if (!filters) {
    return result;
  }

  /* -------------------------------------------------------
     CATEGORY
  ------------------------------------------------------- */

  if (
    filters.category &&
    filters.category !== 'all'
  ) {
    const category = filters.category
      .toLowerCase()
      .trim();

    result = result.filter((product) => {
      const categoryId =
        product.categoryId?.toLowerCase() || '';

      const categoryName =
        product.categoryName?.toLowerCase() || '';

      const slug =
        product.slug?.toLowerCase() || '';

      return (
        categoryId === category ||
        categoryName === category ||
        slug.includes(category)
      );
    });
  }

  /* -------------------------------------------------------
     SEARCH
  ------------------------------------------------------- */

  if (
    filters.searchQuery &&
    filters.searchQuery.trim() !== ''
  ) {
    const search = filters.searchQuery
      .toLowerCase()
      .trim();

    result = result.filter((product) => {
      const name =
        product.name?.toLowerCase() || '';

      const description =
        product.description?.toLowerCase() || '';

      const brand =
        product.brand?.toLowerCase() || '';

      const sku =
        product.sku?.toLowerCase() || '';

      const tags = Array.isArray(product.tags)
        ? product.tags
        : [];

      return (
        name.includes(search) ||
        description.includes(search) ||
        brand.includes(search) ||
        sku.includes(search) ||
        tags.some((tag) =>
          String(tag)
            .toLowerCase()
            .includes(search)
        )
      );
    });
  }

  /* -------------------------------------------------------
     SIZE
  ------------------------------------------------------- */

  if (
    filters.sizes &&
    filters.sizes.length > 0
  ) {
    result = result.filter((product) => {
      const sizes = Array.isArray(product.sizes)
        ? product.sizes
        : [];

      return sizes.some((size) =>
        filters.sizes!.includes(size)
      );
    });
  }

  /* -------------------------------------------------------
     PRICE
  ------------------------------------------------------- */

  if (
    filters.minPrice !== undefined &&
    filters.minPrice !== null
  ) {
    result = result.filter(
      (product) =>
        Number(product.price || 0) >=
        Number(filters.minPrice)
    );
  }

  if (
    filters.maxPrice !== undefined &&
    filters.maxPrice !== null &&
    Number(filters.maxPrice) > 0
  ) {
    result = result.filter(
      (product) =>
        Number(product.price || 0) <=
        Number(filters.maxPrice)
    );
  }

  /* -------------------------------------------------------
     STOCK
  ------------------------------------------------------- */

  if (filters.inStockOnly) {
    result = result.filter(
      (product) =>
        Number(product.stock || 0) > 0
    );
  }

  /* -------------------------------------------------------
     SORT
  ------------------------------------------------------- */

  switch (filters.sortBy) {
    case 'newest':
      result.sort(
        (a, b) =>
          new Date(
            b.createdAt || 0
          ).getTime() -
          new Date(
            a.createdAt || 0
          ).getTime()
      );
      break;

    case 'price-low':
      result.sort(
        (a, b) =>
          Number(a.price || 0) -
          Number(b.price || 0)
      );
      break;

    case 'price-high':
      result.sort(
        (a, b) =>
          Number(b.price || 0) -
          Number(a.price || 0)
      );
      break;

    case 'best-rated':
      result.sort(
        (a, b) =>
          Number(b.rating || 0) -
          Number(a.rating || 0)
      );
      break;

    case 'popular':
      result.sort(
        (a, b) =>
          Number(b.reviewCount || 0) -
          Number(a.reviewCount || 0)
      );
      break;

    default:
      break;
  }

  return result;
}

/* =========================================================
   GET ALL PRODUCTS
========================================================= */

export async function getProducts(
  filters?: Partial<FilterState>
): Promise<Product[]> {
  try {
    const productsRef = collection(
      db,
      PRODUCTS_COLLECTION
    );

    const snapshot = await getDocs(productsRef);

    const products = snapshot.docs.map((docSnap) =>
      normalizeProduct(
        docSnap.data(),
        docSnap.id
      )
    );

    return applyFilters(products, filters);
  } catch (error) {
    console.error(
      'Error fetching products from Firebase:',
      error
    );

    /*
     * IMPORTANT:
     * No seed fallback here.
     *
     * If Firebase fails, storefront gets an empty
     * product list instead of fake/dummy products.
     */
    return [];
  }
}

/* =========================================================
   GET PRODUCT BY SLUG
========================================================= */

export async function getProductBySlug(
  slug: string
): Promise<Product | null> {
  try {
    const cleanSlug = slug.trim();

    const productsRef = collection(
      db,
      PRODUCTS_COLLECTION
    );

    const productQuery = query(
      productsRef,
      where('slug', '==', cleanSlug),
      limit(1)
    );

    const snapshot = await getDocs(
      productQuery
    );

    if (snapshot.empty) {
      return null;
    }

    const productDoc = snapshot.docs[0];

    return normalizeProduct(
      productDoc.data(),
      productDoc.id
    );
  } catch (error) {
    console.error(
      'Error fetching product by slug:',
      error
    );

    return null;
  }
}

/* =========================================================
   GET PRODUCT BY ID
========================================================= */

export async function getProductById(
  id: string
): Promise<Product | null> {
  try {
    const productRef = doc(
      db,
      PRODUCTS_COLLECTION,
      id
    );

    const snapshot = await getDoc(productRef);

    if (!snapshot.exists()) {
      return null;
    }

    return normalizeProduct(
      snapshot.data(),
      snapshot.id
    );
  } catch (error) {
    console.error(
      'Error fetching product by ID:',
      error
    );

    return null;
  }
}

/* =========================================================
   GET CATEGORIES
========================================================= */

export async function getCategories(): Promise<Category[]> {
  try {
    const categoriesRef = collection(
      db,
      CATEGORIES_COLLECTION
    );

    const snapshot = await getDocs(
      categoriesRef
    );

    return snapshot.docs.map((docSnap) =>
      normalizeCategory(
        docSnap.data(),
        docSnap.id
      )
    );
  } catch (error) {
    console.error(
      'Error fetching categories from Firebase:',
      error
    );

    return [];
  }
}

/* =========================================================
   CREATE PRODUCT
========================================================= */

export async function createProduct(
  productData: Omit<Product, 'id'>
): Promise<string> {
  try {
    const productRef = doc(
      collection(db, PRODUCTS_COLLECTION)
    );

    const timestamp =
      new Date().toISOString();

    const product: Product = {
      ...productData,
      id: productRef.id,
      createdAt:
        productData.createdAt ||
        timestamp,
      updatedAt: timestamp,
    };

    await setDoc(
      productRef,
      product
    );

    return productRef.id;
  } catch (error) {
    console.error(
      'Error creating product:',
      error
    );

    throw error;
  }
}

/* =========================================================
   UPDATE PRODUCT
========================================================= */

export async function updateProduct(
  id: string,
  productData: Partial<Product>
): Promise<void> {
  try {
    const productRef = doc(
      db,
      PRODUCTS_COLLECTION,
      id
    );

    await updateDoc(
      productRef,
      {
        ...productData,
        updatedAt:
          new Date().toISOString(),
      }
    );
  } catch (error) {
    console.error(
      'Error updating product:',
      error
    );

    throw error;
  }
}

/* =========================================================
   SAVE PRODUCT
========================================================= */

export async function saveProduct(
  productData: Omit<Product, 'id'>,
  existingId?: string
): Promise<Product> {
  try {
    const timestamp =
      new Date().toISOString();

    /* -------------------------------------------------------
       UPDATE EXISTING
    ------------------------------------------------------- */

    if (existingId) {
      const productRef = doc(
        db,
        PRODUCTS_COLLECTION,
        existingId
      );

      const updatedProduct: Product = {
        ...productData,
        id: existingId,
        createdAt:
          productData.createdAt ||
          timestamp,
        updatedAt: timestamp,
      };

      await setDoc(
        productRef,
        updatedProduct,
        { merge: true }
      );

      return updatedProduct;
    }

    /* -------------------------------------------------------
       CREATE NEW
    ------------------------------------------------------- */

    const productRef = doc(
      collection(db, PRODUCTS_COLLECTION)
    );

    const newProduct: Product = {
      ...productData,
      id: productRef.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await setDoc(
      productRef,
      newProduct
    );

    return newProduct;
  } catch (error) {
    console.error(
      'Error saving product:',
      error
    );

    throw error;
  }
}

/* =========================================================
   DELETE PRODUCT
========================================================= */

export async function deleteProduct(
  id: string
): Promise<void> {
  try {
    const productRef = doc(
      db,
      PRODUCTS_COLLECTION,
      id
    );

    await deleteDoc(productRef);
  } catch (error) {
    console.error(
      'Error deleting product:',
      error
    );

    throw error;
  }
}

/* =========================================================
   ALIAS
========================================================= */

export const getAllProducts = getProducts;
