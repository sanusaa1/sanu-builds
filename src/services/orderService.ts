import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, OrderStatus, PaymentStatus } from '../types';
import { createUserNotification } from './userService';

const ORDERS_COLLECTION = 'orders';
const PRODUCTS_COLLECTION = 'products';

export async function createOrder(
  orderInput: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'statusHistory'>
): Promise<Order> {
  const newOrderRef = doc(collection(db, ORDERS_COLLECTION));
  const orderId = newOrderRef.id;
  const timestamp = new Date().toISOString();
  
  // Generate a premium Sanu Builds order reference e.g., SB-83921
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const orderNumber = `SB-${randomSuffix}`;

  const initialStatus = orderInput.orderStatus || 'confirmed';

  const newOrder: Order = {
    ...orderInput,
    id: orderId,
    orderNumber,
    orderStatus: initialStatus,
    paymentStatus: orderInput.paymentStatus || 'paid',
    createdAt: timestamp,
    updatedAt: timestamp,
    statusHistory: [
      {
        status: 'pending',
        timestamp: timestamp,
        note: 'Order placed by customer via Sanu Builds checkout.',
      },
      {
        status: initialStatus,
        timestamp: timestamp,
        note: `Payment received via ${orderInput.paymentMethod.toUpperCase()}. Order confirmed.`,
      },
    ],
  };

  // Save order to Firestore
  await setDoc(newOrderRef, newOrder);

  // Send user in-app notification
  if (newOrder.userId && newOrder.userId !== 'guest') {
    await createUserNotification(newOrder.userId, {
      title: 'Order Confirmed',
      message: `Your order #${orderNumber} for $${newOrder.total.toFixed(2)} has been placed successfully.`,
      type: 'order',
      orderId: newOrder.id,
    });
  }

  // Adjust stock in background / safely
  try {
    for (const item of newOrder.items) {
      const prodRef = doc(db, PRODUCTS_COLLECTION, item.productId);
      const prodSnap = await getDoc(prodRef);
      if (prodSnap.exists()) {
        const currentStock = prodSnap.data().stock || 0;
        const newStock = Math.max(0, currentStock - item.quantity);
        await updateDoc(prodRef, {
          stock: newStock,
          updatedAt: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.warn('Stock adjustment warning:', err);
  }

  return newOrder;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
  } catch (error) {
    console.error('Error fetching user orders with orderBy, attempting unsorted fallback:', error);
    try {
      const qFallback = query(collection(db, ORDERS_COLLECTION), where('userId', '==', userId));
      const snap = await getDocs(qFallback);
      const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
      return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e2) {
      console.error('Failed to get user orders:', e2);
      return [];
    }
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Order;
    }
    return null;
  } catch (error) {
    console.error('Error fetching order by id:', error);
    return null;
  }
}

export async function getAllOrders(): Promise<Order[]> {
  try {
    const snap = await getDocs(collection(db, ORDERS_COLLECTION));
    const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error fetching all orders:', error);
    return [];
  }
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  note?: string,
  trackingNumber?: string,
  carrierName?: string
): Promise<void> {
  const docRef = doc(db, ORDERS_COLLECTION, orderId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;

  const currentData = snap.data() as Order;
  const timestamp = new Date().toISOString();

  const updatedHistory = [
    ...(currentData.statusHistory || []),
    {
      status: newStatus,
      timestamp,
      note: note || `Status updated to ${newStatus.replace('_', ' ').toUpperCase()}`,
    },
  ];

  const updatePayload: Partial<Order> = {
    orderStatus: newStatus,
    statusHistory: updatedHistory,
    updatedAt: timestamp,
  };

  if (trackingNumber) updatePayload.trackingNumber = trackingNumber;
  if (carrierName) updatePayload.carrierName = carrierName;

  await updateDoc(docRef, updatePayload);

  // Notify customer
  if (currentData.userId && currentData.userId !== 'guest') {
    const readableStatus = newStatus.replace('_', ' ').toUpperCase();
    await createUserNotification(currentData.userId, {
      title: `Order Update: ${readableStatus}`,
      message: `Your order #${currentData.orderNumber} is now ${readableStatus}.${trackingNumber ? ` Tracking: ${trackingNumber}` : ''}`,
      type: 'order',
      orderId,
    });
  }
}

export async function updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<void> {
  const docRef = doc(db, ORDERS_COLLECTION, orderId);
  await updateDoc(docRef, {
    paymentStatus,
    updatedAt: new Date().toISOString(),
  });
}

export async function cancelOrder(orderId: string, reason: string): Promise<void> {
  await updateOrderStatus(orderId, 'cancelled', `Order cancelled by customer. Reason: ${reason}`);
}
