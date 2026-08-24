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
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Category, FilterState } from '../types';
import { SEED_PRODUCTS, SEED_CATEGORIES, SEED_COUPONS, SEED_REVIEWS } from '../data/seedData';

const PRODUCTS_COLLECTION = 'products';
const CATEGORIES_COLLECTION = 'categories';
const COUPONS_COLLECTION = 'coupons';
const REVIEWS_COLLECTION = 'reviews';

// Ensure the database is initialized with Sanu Builds catalog
export async function ensureDatabaseInitialized(): Promise<void> {
  try {
    const productsSnap = await getDocs(query(collection(db, PRODUCTS_COLLECTION), limit(1)));
    if (productsSnap.empty) {
      console.log('Database empty. Seeding initial Sanu Builds catalog...');
      const batch = writeBatch(db);

      // Seed categories
      for (const cat of SEED_CATEGORIES) {
        const catRef = doc(db, CATEGORIES_COLLECTION, cat.id);
        batch.set(catRef, cat);
      }

      // Seed products
      for (const prod of SEED_PRODUCTS) {
        const prodRef = doc(db, PRODUCTS_COLLECTION, prod.id);
        batch.set(prodRef, prod);
      }

      // Seed coupons
      for (const coupon of SEED_COUPONS) {
        const couponRef = doc(db, COUPONS_COLLECTION, coupon.id);
        batch.set(couponRef, coupon);
      }

      // Seed reviews
      for (const review of SEED_REVIEWS) {
        const reviewRef = doc(db, REVIEWS_COLLECTION, review.id);
        batch.set(reviewRef, review);
      }

      await batch.commit();
      console.log('Seeding completed successfully.');
    }
  } catch (error) {
    console.warn('Initial seeding check failed (will use fallback mock if offline):', error);
  }
}

export async function getProducts(filters?: Partial<FilterState>): Promise<Product[]> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const snap = await getDocs(productsRef);
    
    if (snap.empty) {
      // Return seed data if database is still empty or initializing
      return applyFilters(SEED_PRODUCTS, filters);
    }

    const products: Product[] = snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    } as Product));

    return applyFilters(products, filters);
  } catch (error) {
    console.error('Error fetching products from Firestore, using seed data fallback:', error);
    return applyFilters(SEED_PRODUCTS, filters);
  }
}

function applyFilters(products: Product[], filters?: Partial<FilterState>): Product[] {
  let result = [...products];

  if (!filters) return result;

  // Active only
  result = result.filter((p) => p.active !== false);

  // Category
  if (filters.category && filters.category !== 'all') {
    result = result.filter(
      (p) =>
        p.categoryId === filters.category ||
        p.categoryName?.toLowerCase() === filters.category?.toLowerCase() ||
        p.slug.includes(filters.category)
    );
  }

  // Search Query
  if (filters.searchQuery && filters.searchQuery.trim() !== '') {
    const q = filters.searchQuery.toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }

  // Size Filter
  if (filters.sizes && filters.sizes.length > 0) {
    result = result.filter((p) => p.sizes.some((s) => filters.sizes!.includes(s)));
  }

  // Price Range
  if (filters.minPrice !== undefined) {
    result = result.filter((p) => p.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
    result = result.filter((p) => p.price <= filters.maxPrice!);
  }

  // In stock only
  if (filters.inStockOnly) {
    result = result.filter((p) => (p.stock || 0) > 0);
  }

  // Sorting
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'best-rated':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popular':
      default:
        result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
    }
  }

  return result;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const q = query(collection(db, PRODUCTS_COLLECTION), where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    // Fallback to seed data lookup
    const found = SEED_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
    return found || null;
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    const found = SEED_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
    return found || null;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Product;
    }
    const found = SEED_PRODUCTS.find((p) => p.id === id);
    return found || null;
  } catch (error) {
    console.error('Error fetching product by id:', error);
    const found = SEED_PRODUCTS.find((p) => p.id === id);
    return found || null;
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const snap = await getDocs(collection(db, CATEGORIES_COLLECTION));
    if (snap.empty) {
      return SEED_CATEGORIES;
    }
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return SEED_CATEGORIES;
  }
}

export async function createProduct(productData: Omit<Product, 'id'>): Promise<string> {
  const newRef = doc(collection(db, PRODUCTS_COLLECTION));
  const timestamp = new Date().toISOString();
  const newProduct: Product = {
    ...productData,
    id: newRef.id,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await setDoc(newRef, newProduct);
  return newRef.id;
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<void> {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await updateDoc(docRef, {
    ...productData,
    updatedAt: new Date().toISOString(),
  });
}

export const getAllProducts = getProducts;

export async function saveProduct(
  productData: Omit<Product, 'id'>,
  existingId?: string
): Promise<Product> {
  const timestamp = new Date().toISOString();
  if (existingId) {
    const docRef = doc(db, PRODUCTS_COLLECTION, existingId);
    const updated: Product = {
      ...productData,
      id: existingId,
      updatedAt: timestamp,
      createdAt: productData.createdAt || timestamp,
    };
    await setDoc(docRef, updated, { merge: true });
    return updated;
  } else {
    const newRef = doc(collection(db, PRODUCTS_COLLECTION));
    const created: Product = {
      ...productData,
      id: newRef.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await setDoc(newRef, created);
    return created;
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await deleteDoc(docRef);
}

