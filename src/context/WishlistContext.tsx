import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { Product, WishlistItem } from '../types';

interface WishlistContextType {
  wishlist: WishlistItem[];
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'sanubuilds_wishlist';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { success, info } = useToast();
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync with Firestore when logged in
  useEffect(() => {
    if (!currentUser) return;

    const fetchWishlist = async () => {
      try {
        const colRef = collection(db, 'users', currentUser.uid, 'wishlist');
        const snap = await getDocs(colRef);
        if (!snap.empty) {
          const remoteItems = snap.docs.map((d) => d.data() as WishlistItem);
          setWishlist(remoteItems);
        }
      } catch (err) {
        console.warn('Failed to load firestore wishlist:', err);
      }
    };

    fetchWishlist();
  }, [currentUser]);

  // Persist locally
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to write wishlist to localStorage:', e);
    }
  }, [wishlist]);

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.productId === productId);
  };

  const toggleWishlist = (product: Product) => {
    const exists = isInWishlist(product.id);

    if (exists) {
      removeFromWishlist(product.id);
    } else {
      const newItem: WishlistItem = {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images[0] || '',
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        categoryId: product.categoryId,
        categoryName: product.categoryName,
        rating: product.rating,
        addedAt: new Date().toISOString(),
      };

      setWishlist((prev) => [...prev, newItem]);
      success(`Saved "${product.name}" to your wishlist.`);

      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid, 'wishlist', product.id);
        setDoc(docRef, newItem, { merge: true }).catch(console.warn);
      }
    }
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((i) => i.productId !== productId));
    info('Removed item from wishlist.');

    if (currentUser) {
      const docRef = doc(db, 'users', currentUser.uid, 'wishlist', productId);
      deleteDoc(docRef).catch(console.warn);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
