import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Review } from '../types';
import { SEED_REVIEWS } from '../data/seedData';
import { getUserOrders } from './orderService';

const REVIEWS_COLLECTION = 'reviews';
const PRODUCTS_COLLECTION = 'products';

export async function getProductReviews(productId: string): Promise<Review[]> {
  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('productId', '==', productId)
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      return SEED_REVIEWS.filter((r) => r.productId === productId);
    }
    const reviews = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
    return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return SEED_REVIEWS.filter((r) => r.productId === productId);
  }
}

export async function addReview(
  reviewData: Omit<Review, 'id' | 'createdAt'>
): Promise<Review> {
  const newRef = doc(collection(db, REVIEWS_COLLECTION));
  const newReview: Review = {
    ...reviewData,
    id: newRef.id,
    createdAt: new Date().toISOString(),
  };

  await setDoc(newRef, newReview);

  // Recalculate and update product rating
  try {
    const allReviews = await getProductReviews(reviewData.productId);
    const updatedReviews = [newReview, ...allReviews.filter((r) => r.id !== newRef.id)];
    const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Math.round((totalRating / updatedReviews.length) * 10) / 10;

    const prodRef = doc(db, PRODUCTS_COLLECTION, reviewData.productId);
    await updateDoc(prodRef, {
      rating: avgRating,
      reviewCount: updatedReviews.length,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Could not update product rating aggregates:', err);
  }

  return newReview;
}

export async function hasUserPurchasedProduct(userId: string, productId: string): Promise<boolean> {
  if (!userId || userId === 'guest') return false;
  try {
    const orders = await getUserOrders(userId);
    return orders.some(
      (order) =>
        order.orderStatus !== 'cancelled' &&
        order.items.some((item) => item.productId === productId)
    );
  } catch (error) {
    console.error('Error verifying purchase status:', error);
    return true; // Graceful fallback
  }
}
