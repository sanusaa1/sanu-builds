import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, Address, AppNotification } from '../types';

const USERS_COLLECTION = 'users';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function createUserProfile(profile: UserProfile): Promise<void> {
  try {
    const docRef = doc(db, USERS_COLLECTION, profile.uid);
    await setDoc(docRef, profile, { merge: true });
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
  }
}

export const updateUserProfileData = updateUserProfile;


export async function getUserAddresses(uid: string): Promise<Address[]> {
  try {
    const colRef = collection(db, USERS_COLLECTION, uid, 'addresses');
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Address));
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return [];
  }
}

export async function saveUserAddress(
  uid: string,
  address: Omit<Address, 'id'>,
  addressId?: string
): Promise<Address> {
  const colRef = collection(db, USERS_COLLECTION, uid, 'addresses');
  const targetId = addressId || doc(colRef).id;
  const targetDoc = doc(db, USERS_COLLECTION, uid, 'addresses', targetId);

  // If this address is set as default, unset previous defaults
  if (address.isDefault) {
    try {
      const existing = await getUserAddresses(uid);
      for (const addr of existing) {
        if (addr.id !== targetId && addr.isDefault) {
          await updateDoc(doc(db, USERS_COLLECTION, uid, 'addresses', addr.id), {
            isDefault: false,
          });
        }
      }
    } catch (e) {
      console.warn('Could not reset existing default addresses:', e);
    }
  }

  const savedAddress: Address = {
    ...address,
    id: targetId,
    createdAt: new Date().toISOString(),
  };

  await setDoc(targetDoc, savedAddress, { merge: true });
  return savedAddress;
}

export async function deleteUserAddress(uid: string, addressId: string): Promise<void> {
  const targetDoc = doc(db, USERS_COLLECTION, uid, 'addresses', addressId);
  await deleteDoc(targetDoc);
}

export async function getUserNotifications(uid: string): Promise<AppNotification[]> {
  try {
    const colRef = collection(db, USERS_COLLECTION, uid, 'notifications');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppNotification));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export async function createUserNotification(
  uid: string,
  notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>
): Promise<void> {
  try {
    const colRef = collection(db, USERS_COLLECTION, uid, 'notifications');
    const newRef = doc(colRef);
    await setDoc(newRef, {
      ...notif,
      id: newRef.id,
      read: false,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating user notification:', error);
  }
}
