import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Coupon } from '../types';
import { SEED_COUPONS } from '../data/seedData';

const COUPONS_COLLECTION = 'coupons';

export async function getAllCoupons(): Promise<Coupon[]> {
  try {
    const snap = await getDocs(collection(db, COUPONS_COLLECTION));
    if (snap.empty) {
      return SEED_COUPONS;
    }
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Coupon));
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return SEED_COUPONS;
  }
}

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<{ valid: boolean; discount: number; coupon?: Coupon; error?: string }> {
  const cleanCode = code.trim().toUpperCase();
  const all = await getAllCoupons();
  const coupon = all.find((c) => c.code.toUpperCase() === cleanCode);

  if (!coupon) {
    return { valid: false, discount: 0, error: 'Invalid coupon code. Try BUILD15, SANU10, or FREESHIP.' };
  }

  if (!coupon.active) {
    return { valid: false, discount: 0, error: 'This coupon code is no longer active.' };
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    return { valid: false, discount: 0, error: 'This coupon has expired.' };
  }

  if (coupon.minimumOrderValue && subtotal < coupon.minimumOrderValue) {
    return {
      valid: false,
      discount: 0,
      error: `Minimum order value of $${coupon.minimumOrderValue} required for this coupon (current subtotal: $${subtotal.toFixed(2)}).`,
    };
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
      discount = coupon.maximumDiscount;
    }
  } else {
    discount = Math.min(coupon.discountValue, subtotal);
  }

  return {
    valid: true,
    discount: Math.round(discount * 100) / 100,
    coupon,
  };
}

export async function createCoupon(coupon: Omit<Coupon, 'id'>): Promise<string> {
  const colRef = collection(db, COUPONS_COLLECTION);
  const newRef = doc(colRef);
  const newCoupon: Coupon = {
    ...coupon,
    id: newRef.id,
    code: coupon.code.toUpperCase(),
  };
  await setDoc(newRef, newCoupon);
  return newRef.id;
}

export async function updateCoupon(id: string, data: Partial<Coupon>): Promise<void> {
  const docRef = doc(db, COUPONS_COLLECTION, id);
  await updateDoc(docRef, data);
}

export async function toggleCouponActive(id: string, active: boolean): Promise<void> {
  const docRef = doc(db, COUPONS_COLLECTION, id);
  await updateDoc(docRef, { active });
}


export async function deleteCoupon(id: string): Promise<void> {
  const docRef = doc(db, COUPONS_COLLECTION, id);
  await deleteDoc(docRef);
}
