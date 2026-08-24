import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { CartItem, Coupon, Product } from '../types';
import { validateCoupon } from '../services/couponService';

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
  appliedCoupon: Coupon | null;
  couponError: string | null;
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQty: number) => void;
  clearCart: () => Promise<void>;
  applyCouponCode: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'sanubuilds_cart';
const FREE_SHIPPING_MIN = 50;
const STANDARD_SHIPPING_FEE = 5;
const TAX_RATE = 0.05; // 5%

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { success, error: toastError, info } = useToast();
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Sync with Firestore when user logs in
  useEffect(() => {
    if (!currentUser) {
      // Keep local cart
      return;
    }

    const fetchFirestoreCart = async () => {
      setLoading(true);
      try {
        const colRef = collection(db, 'users', currentUser.uid, 'cart');
        const snap = await getDocs(colRef);
        if (!snap.empty) {
          const remoteItems = snap.docs.map((d) => d.data() as CartItem);
          setCart(remoteItems);
        } else if (cart.length > 0) {
          // Push local items to firestore
          const batch = writeBatch(db);
          cart.forEach((item) => {
            const itemRef = doc(db, 'users', currentUser.uid, 'cart', item.id);
            batch.set(itemRef, item);
          });
          await batch.commit();
        }
      } catch (err) {
        console.warn('Could not sync cart to Firestore, continuing with local:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFirestoreCart();
  }, [currentUser]);

  // Persist to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to write cart to localStorage:', e);
    }
  }, [cart]);

  // Cart financial calculations
  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'percentage') {
      const disc = (subtotal * appliedCoupon.discountValue) / 100;
      return appliedCoupon.maximumDiscount ? Math.min(disc, appliedCoupon.maximumDiscount) : disc;
    }
    return Math.min(appliedCoupon.discountValue, subtotal);
  }, [appliedCoupon, subtotal]);

  const shippingFee = useMemo(() => {
    if (subtotal === 0) return 0;
    if (appliedCoupon?.code === 'FREESHIP') return 0;
    return subtotal >= FREE_SHIPPING_MIN ? 0 : STANDARD_SHIPPING_FEE;
  }, [subtotal, appliedCoupon]);

  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_MIN - subtotal);

  const tax = useMemo(() => {
    const taxableAmount = Math.max(0, subtotal - discount);
    return Math.round(taxableAmount * TAX_RATE * 100) / 100;
  }, [subtotal, discount]);

  const total = useMemo(() => {
    return Math.max(0, Math.round((subtotal - discount + shippingFee + tax) * 100) / 100);
  }, [subtotal, discount, shippingFee, tax]);

  const addToCart = (product: Product, size: string, color: string, quantity = 1) => {
    const variantKey = `${product.id}_${size}_${color.replace(/\s+/g, '')}`;
    const matchedVariant = product.variants?.find((v) => v.size === size && v.color === color);
    const stockLimit = matchedVariant ? matchedVariant.stock : (product.stock || 20);

    const existingIndex = cart.findIndex((item) => item.id === variantKey);

    if (existingIndex > -1) {
      const existing = cart[existingIndex];
      const newQty = Math.min(existing.quantity + quantity, stockLimit);
      if (newQty === existing.quantity && existing.quantity >= stockLimit) {
        toastError(`Maximum available stock (${stockLimit}) already in cart.`);
        return;
      }
      const updatedItem: CartItem = {
        ...existing,
        quantity: newQty,
      };
      const updatedCart = [...cart];
      updatedCart[existingIndex] = updatedItem;
      setCart(updatedCart);
      success(`Updated ${product.name} quantity to ${newQty}.`);

      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid, 'cart', variantKey);
        setDoc(docRef, updatedItem, { merge: true }).catch(console.warn);
      }
    } else {
      const newItem: CartItem = {
        id: variantKey,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images[0] || '',
        size,
        color,
        price: product.price,
        originalPrice: product.compareAtPrice,
        quantity: Math.min(quantity, stockLimit),
        stockLimit,
        sku: matchedVariant?.sku || product.sku,
        addedAt: new Date().toISOString(),
      };
      const updatedCart = [...cart, newItem];
      setCart(updatedCart);
      success(`Added "${product.name}" (${size}/${color}) to bag.`);

      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid, 'cart', variantKey);
        setDoc(docRef, newItem, { merge: true }).catch(console.warn);
      }
    }
  };

  const removeFromCart = (cartItemId: string) => {
    const updatedCart = cart.filter((i) => i.id !== cartItemId);
    setCart(updatedCart);
    info('Item removed from cart.');

    if (currentUser) {
      const docRef = doc(db, 'users', currentUser.uid, 'cart', cartItemId);
      deleteDoc(docRef).catch(console.warn);
    }
  };

  const updateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    const item = cart.find((i) => i.id === cartItemId);
    if (!item) return;

    const clamped = Math.min(newQty, item.stockLimit);
    if (newQty > item.stockLimit) {
      toastError(`Only ${item.stockLimit} items available in stock.`);
    }

    const updatedItem = { ...item, quantity: clamped };
    const updatedCart = cart.map((i) => (i.id === cartItemId ? updatedItem : i));
    setCart(updatedCart);

    if (currentUser) {
      const docRef = doc(db, 'users', currentUser.uid, 'cart', cartItemId);
      setDoc(docRef, updatedItem, { merge: true }).catch(console.warn);
    }
  };

  const clearCart = async () => {
    setCart([]);
    setAppliedCoupon(null);
    setCouponError(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    if (currentUser) {
      try {
        const colRef = collection(db, 'users', currentUser.uid, 'cart');
        const snap = await getDocs(colRef);
        const batch = writeBatch(db);
        snap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      } catch (err) {
        console.warn('Could not clear Firestore cart:', err);
      }
    }
  };

  const applyCouponCode = async (code: string): Promise<boolean> => {
    setCouponError(null);
    if (!code || !code.trim()) {
      setCouponError('Please enter a coupon code.');
      return false;
    }

    const validation = await validateCoupon(code, subtotal);
    if (!validation.valid || !validation.coupon) {
      setCouponError(validation.error || 'Invalid coupon.');
      toastError(validation.error || 'Invalid coupon code.');
      return false;
    }

    setAppliedCoupon(validation.coupon);
    success(`Promo code "${validation.coupon.code}" applied! You saved $${validation.discount.toFixed(2)}.`);
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    info('Coupon code removed.');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        subtotal,
        discount,
        shippingFee,
        tax,
        total,
        freeShippingThreshold: FREE_SHIPPING_MIN,
        freeShippingRemaining,
        appliedCoupon,
        couponError,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCouponCode,
        removeCoupon,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
