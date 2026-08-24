export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  landmark?: string;
  isDefault: boolean;
  createdAt?: string;
}

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
  price?: number;
}

export interface ProductDetails {
  fabric: string;
  fit: string;
  gsm: number;
  washCare: string;
  modelDetails?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  brand: string;
  price: number;
  compareAtPrice?: number;
  discountPercentage?: number;
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  variants: ProductVariant[];
  stock: number;
  sku: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  active: boolean;
  details?: ProductDetails;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  featured: boolean;
  productCount?: number;
}

export interface CartItem {
  id: string; // unique key e.g. productId_size_color
  productId: string;
  name: string;
  slug: string;
  image: string;
  size: string;
  color: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  stockLimit: number;
  sku: string;
  addedAt: string;
}

export interface WishlistItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  categoryId: string;
  categoryName?: string;
  rating?: number;
  addedAt: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export type PaymentMethod = 'razorpay' | 'card' | 'upi' | 'cod';
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: CartItem[];
  shippingAddress: Address;
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  statusHistory: OrderStatusHistoryItem[];
  trackingNumber?: string;
  carrierName?: string;
  estimatedDelivery?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderValue: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  expiresAt: string;
  active: boolean;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  productId: string;
  orderId?: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'promo' | 'system';
  orderId?: string;
  read: boolean;
  createdAt: string;
}

export interface FilterState {
  category: string;
  sizes: string[];
  colors: string[];
  minPrice: number;
  maxPrice: number;
  sortBy: 'popular' | 'newest' | 'price-low' | 'price-high' | 'best-rated';
  inStockOnly: boolean;
  searchQuery: string;
}
