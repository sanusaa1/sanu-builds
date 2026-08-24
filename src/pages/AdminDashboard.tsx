import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Tag,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Truck,
  Filter,
  DollarSign,
  Users,
} from 'lucide-react';
import { Product, Order, Coupon, OrderStatus, Category } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getAllProducts,
  saveProduct,
  deleteProduct,
} from '../services/productService';
import { getAllOrders, updateOrderStatus } from '../services/orderService';
import {
  getAllCoupons,
  createCoupon,
  toggleCouponActive,
  deleteCoupon,
} from '../services/couponService';
import { seedInitialStoreData } from '../data/seedData';

interface AdminDashboardProps {
  categories: Category[];
  onNavigate: (route: string, params?: Record<string, string>) => void;
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  categories,
  onNavigate,
  onRefreshData,
}) => {
  const { currentUser, isAdmin } = useAuth();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'coupons'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Product modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    brand: 'Sanu Builds',
    price: 38,
    compareAtPrice: 48,
    categoryId: 'heavyweight-tees',
    sku: 'SB-TEE-240',
    stock: 25,
    description: '',
    fabric: '100% Combed Ringspun Cotton',
    gsm: 240,
    fit: 'Relaxed Drop Shoulder Boxy Fit',
    images: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
    featured: true,
    bestseller: false,
    newArrival: true,
  });

  // Coupon modal
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 15,
    minOrderAmount: 0,
    maxUses: 100,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [carrierInput, setCarrierInput] = useState('FedEx Priority Air');

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [prods, ords, coups] = await Promise.all([
        getAllProducts(),
        getAllOrders(),
        getAllCoupons(),
      ]);
      setProducts(prods);
      setOrders(ords);
      setCoupons(coups);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-neutral-400 mx-auto" />
        <h2 className="text-xl font-bold text-neutral-900">Administrator Access Required</h2>
        <p className="text-xs text-neutral-500">
          This control panel is restricted to verified store managers (e.g. <code>admin@sanubuilds.com</code>).
        </p>
        <button
          onClick={() => onNavigate('/login')}
          className="px-5 py-2.5 bg-neutral-900 text-white rounded-lg text-xs font-bold"
        >
          Sign In as Admin
        </button>
      </div>
    );
  }

  // Analytics Metrics
  const totalRevenue = orders
    .filter((o) => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrdersCount = orders.length;
  const averageOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
  const lowStockCount = products.filter((p) => (p.stock || 0) < 10).length;

  // Product Actions
  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      slug: '',
      brand: 'Sanu Builds',
      price: 38,
      compareAtPrice: 48,
      categoryId: categories[0]?.id || 'heavyweight-tees',
      sku: `SB-TEE-${Math.floor(100 + Math.random() * 900)}`,
      stock: 30,
      description: 'Engineered with 240 GSM organic combed ringspun cotton with reinforced double-needle hems.',
      fabric: '100% Ringspun Combed Cotton',
      gsm: 240,
      fit: 'Relaxed Drop Shoulder Boxy Silhouette',
      images: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
      sizes: ['S', 'M', 'L', 'XL'],
      featured: true,
      bestseller: false,
      newArrival: true,
    });
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      price: p.price,
      compareAtPrice: p.compareAtPrice || 0,
      categoryId: p.categoryId,
      sku: p.sku,
      stock: p.stock,
      description: p.description,
      fabric: p.details?.fabric || '100% Combed Cotton',
      gsm: p.details?.gsm || 240,
      fit: p.details?.fit || 'Relaxed Boxy Fit',
      images: p.images.join('\n'),
      sizes: p.sizes,
      featured: p.featured,
      bestseller: p.bestseller,
      newArrival: p.newArrival,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const imageList = productForm.images
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const generatedSlug =
        productForm.slug ||
        productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const now = new Date().toISOString();
      const productPayload: Omit<Product, 'id'> = {
        name: productForm.name,
        slug: generatedSlug,
        brand: productForm.brand,
        price: Number(productForm.price),
        compareAtPrice: productForm.compareAtPrice ? Number(productForm.compareAtPrice) : undefined,
        discountPercentage: productForm.compareAtPrice
          ? Math.round(((productForm.compareAtPrice - productForm.price) / productForm.compareAtPrice) * 100)
          : 0,
        categoryId: productForm.categoryId,
        categoryName: categories.find((c) => c.id === productForm.categoryId)?.name || 'Heavyweight Tees',
        sku: productForm.sku,
        stock: Number(productForm.stock),
        description: productForm.description,
        sizes: productForm.sizes,
        colors: [
          { name: 'Onyx Black', hex: '#111111' },
          { name: 'Pure Chalk', hex: '#FFFFFF' },
          { name: 'Raw Slate', hex: '#4A5568' },
        ],
        variants: productForm.sizes.map((s) => ({
          id: `var_${s}`,
          size: s,
          color: 'Onyx Black',
          stock: Math.floor(Number(productForm.stock) / productForm.sizes.length) || 5,
        })),
        images: imageList.length > 0 ? imageList : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80'],
        featured: productForm.featured,
        bestseller: productForm.bestseller,
        newArrival: productForm.newArrival,
        active: true,
        rating: 5.0,
        reviewCount: 12,
        tags: ['heavyweight', 't-shirt', 'sanu builds', 'cotton'],
        createdAt: editingProduct?.createdAt || now,
        updatedAt: now,
        details: {
          fabric: productForm.fabric,
          gsm: Number(productForm.gsm),
          fit: productForm.fit,
          modelDetails: 'Model is 6\'1" (185cm) wearing Size Large for a relaxed drape.',
          washCare: 'Cold machine wash inside out. Hang dry in shade.',
        },
      };

      const saved = await saveProduct(productPayload, editingProduct?.id);
      if (editingProduct) {
        setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
        success('Product updated.');
      } else {
        setProducts((prev) => [saved, ...prev]);
        success('New product created.');
      }
      setIsProductModalOpen(false);
      onRefreshData();
    } catch (err) {
      console.error(err);
      toastError('Failed to save product.');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this product?')) return;
    try {
      await deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      success('Product removed.');
      onRefreshData();
    } catch (err) {
      console.error(err);
      toastError('Could not delete product.');
    }
  };

  // Order Actions
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(
        orderId,
        newStatus,
        `Order marked as ${newStatus} by admin`,
        trackingNumberInput || undefined,
        carrierInput || undefined
      );

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, orderStatus: newStatus } : null));
      }
      success(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      toastError('Failed to update status.');
    }
  };

  // Coupon Actions
  const handleCreateCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const createdId = await createCoupon({
        code: couponForm.code.toUpperCase().trim(),
        description: couponForm.description,
        discountType: couponForm.discountType,
        discountValue: Number(couponForm.discountValue),
        minimumOrderValue: Number(couponForm.minOrderAmount),
        usageLimit: Number(couponForm.maxUses),
        usedCount: 0,
        active: true,
        expiresAt: new Date(couponForm.expiresAt).toISOString(),
      });
      const created: Coupon = {
        id: createdId,
        code: couponForm.code.toUpperCase().trim(),
        description: couponForm.description,
        discountType: couponForm.discountType,
        discountValue: Number(couponForm.discountValue),
        minimumOrderValue: Number(couponForm.minOrderAmount),
        usageLimit: Number(couponForm.maxUses),
        usedCount: 0,
        active: true,
        expiresAt: new Date(couponForm.expiresAt).toISOString(),
      };
      setCoupons((prev) => [created, ...prev]);
      setIsCouponModalOpen(false);
      success('Coupon generated.');
    } catch (err) {
      console.error(err);
      toastError('Failed to create coupon.');
    }
  };


  const handleToggleCoupon = async (c: Coupon) => {
    try {
      await toggleCouponActive(c.id, !c.active);
      setCoupons((prev) =>
        prev.map((item) => (item.id === c.id ? { ...item, active: !item.active } : item))
      );
      success(`Coupon ${!c.active ? 'activated' : 'deactivated'}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReSeed = async () => {
    if (!window.confirm('Re-seed sample catalog products and demo coupons?')) return;
    setLoading(true);
    await seedInitialStoreData();
    await loadAllAdminData();
    onRefreshData();
    success('Catalog seeded successfully!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="border-b border-neutral-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest bg-neutral-900 text-white px-2 py-0.5 rounded">
              ADMIN CONTROL PANEL
            </span>
            <span className="text-xs text-neutral-400 font-mono">Sanu Builds Commerce Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight uppercase mt-1">
            Store Command Center
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReSeed}
            className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
          <button
            onClick={() => onNavigate('/shop')}
            className="px-4 py-2 bg-neutral-950 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Live Store</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
            Gross Revenue
          </span>
          <span className="text-2xl font-black text-neutral-950 block mt-1">
            ${totalRevenue.toFixed(2)}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            ↑ Verified settled funds
          </span>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
            Total Orders
          </span>
          <span className="text-2xl font-black text-neutral-950 block mt-1">
            {totalOrdersCount}
          </span>
          <span className="text-[11px] text-neutral-500 font-medium mt-1 block">
            AOV: ${averageOrderValue.toFixed(2)}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
            Catalog Styles
          </span>
          <span className="text-2xl font-black text-neutral-950 block mt-1">
            {products.length}
          </span>
          <span className="text-[11px] text-neutral-500 font-medium mt-1 block">
            Active Heavyweight SKUs
          </span>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
            Inventory Health
          </span>
          <span className="text-2xl font-black text-neutral-950 block mt-1">
            {lowStockCount > 0 ? `${lowStockCount} Low` : 'Optimal'}
          </span>
          <span className="text-[11px] text-neutral-500 font-medium mt-1 block">
            {lowStockCount > 0 ? 'Restock recommended' : 'Zero stockouts'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview & Orders' },
          { id: 'products', label: `Products (${products.length})` },
          { id: 'orders', label: `Fulfillment (${orders.length})` },
          { id: 'coupons', label: `Promotions (${coupons.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
              activeTab === t.id
                ? 'border-neutral-950 text-neutral-950'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Recent Customer Orders
            </h3>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-xs font-bold text-neutral-900 hover:underline"
            >
              View Full Dispatch Queue →
            </button>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3.5">Order Number</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Items</th>
                  <th className="p-3.5">Total</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.slice(0, 5).map((ord) => (
                  <tr key={ord.id} className="hover:bg-neutral-50/60">
                    <td className="p-3.5 font-mono font-bold text-neutral-900">{ord.orderNumber}</td>
                    <td className="p-3.5">
                      <span className="font-semibold text-neutral-900 block">{ord.customerName}</span>
                      <span className="text-neutral-400 text-[11px]">{ord.customerEmail}</span>
                    </td>
                    <td className="p-3.5 text-neutral-600">{ord.items.length} units</td>
                    <td className="p-3.5 font-black text-neutral-950">${ord.total.toFixed(2)}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-neutral-100 text-neutral-800 rounded font-semibold capitalize text-[11px]">
                        {ord.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(ord);
                          setTrackingNumberInput(ord.trackingNumber || '');
                        }}
                        className="px-2.5 py-1 bg-neutral-950 text-white rounded text-[11px] font-bold hover:bg-neutral-800"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Products Catalog */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Product Inventory & Catalog ({products.length})
            </h3>
            <button
              onClick={handleOpenNewProduct}
              className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New T-Shirt</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3.5">Product</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Price</th>
                    <th className="p-3.5">Stock</th>
                    <th className="p-3.5">GSM</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50/60">
                      <td className="p-3.5 flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-10 h-10 rounded-md object-cover border border-neutral-200 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-neutral-900 block truncate max-w-[200px]">
                            {p.name}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400">SKU: {p.sku}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-neutral-600">{p.categoryName || 'Heavyweight'}</td>
                      <td className="p-3.5 font-bold text-neutral-950">${p.price}</td>
                      <td className="p-3.5">
                        <span
                          className={`font-semibold ${
                            p.stock < 10 ? 'text-amber-600 font-bold' : 'text-neutral-700'
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-neutral-600">{p.details?.gsm || 240} GSM</td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleEditProduct(p)}
                          className="p-1.5 hover:bg-neutral-100 rounded text-neutral-700 hover:text-neutral-900"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 hover:bg-rose-50 rounded text-neutral-400 hover:text-rose-600"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Orders Fulfillment */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
            Order Fulfillment & Shipping Queue ({orders.length})
          </h3>

          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3.5">Order / Date</th>
                    <th className="p-3.5">Customer / Contact</th>
                    <th className="p-3.5">Destination</th>
                    <th className="p-3.5">Payment</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-neutral-50/60">
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-neutral-900 block">{ord.orderNumber}</span>
                        <span className="text-[10px] text-neutral-400">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-neutral-900 block">{ord.customerName}</span>
                        <span className="text-neutral-400 text-[11px]">{ord.customerPhone}</span>
                      </td>
                      <td className="p-3.5 text-neutral-600">
                        {ord.shippingAddress.city}, {ord.shippingAddress.state}
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-neutral-950 block">${ord.total.toFixed(2)}</span>
                        <span className="text-[10px] text-neutral-400 uppercase font-mono">{ord.paymentMethod}</span>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                          className="py-1 px-2 text-xs border border-neutral-300 rounded font-semibold bg-neutral-50"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="packed">Packed</option>
                          <option value="shipped">Shipped</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedOrder(ord);
                            setTrackingNumberInput(ord.trackingNumber || '');
                          }}
                          className="px-3 py-1 bg-neutral-950 text-white rounded text-xs font-bold uppercase tracking-wider"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Coupons & Promotions */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Promotional Discount Codes ({coupons.length})
            </h3>
            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Coupon</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coupons.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-xl border border-neutral-200 p-5 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sm text-neutral-950 bg-neutral-100 px-2.5 py-1 rounded border border-neutral-300">
                    {c.code}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      c.active ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-400'
                    }`}
                  >
                    {c.active ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <p className="text-xs text-neutral-600">{c.description}</p>

                <div className="text-xs font-bold text-neutral-900">
                  Discount: {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `$${c.discountValue} OFF`}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
                  <button
                    onClick={() => handleToggleCoupon(c)}
                    className="font-semibold text-neutral-600 hover:text-neutral-900 underline"
                  >
                    {c.active ? 'Deactivate' : 'Enable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Create/Edit Modal */}
      {isProductModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs overflow-y-auto"
          onClick={() => setIsProductModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-2xl my-8 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-neutral-200">
              <h3 className="font-bold text-base text-neutral-900">
                {editingProduct ? `Edit ${editingProduct.name}` : 'Add New Heavyweight T-Shirt'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)}>
                <X className="w-5 h-5 text-neutral-400 hover:text-neutral-900" />
              </button>
            </div>

            <form onSubmit={handleSaveProductSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Price ($) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Original Price ($)</label>
                  <input
                    type="number"
                    value={productForm.compareAtPrice}
                    onChange={(e) => setProductForm({ ...productForm, compareAtPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Inventory Stock *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Category</label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Fabric Weight (GSM)</label>
                  <input
                    type="number"
                    value={productForm.gsm}
                    onChange={(e) => setProductForm({ ...productForm, gsm: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Image URLs (One per line)</label>
                <textarea
                  rows={3}
                  value={productForm.images}
                  onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={productForm.featured}
                    onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                  />
                  <span>Featured</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={productForm.bestseller}
                    onChange={(e) => setProductForm({ ...productForm, bestseller: e.target.checked })}
                  />
                  <span>Best Seller</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={productForm.newArrival}
                    onChange={(e) => setProductForm({ ...productForm, newArrival: e.target.checked })}
                  />
                  <span>New Arrival</span>
                </label>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-950 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-black"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {isCouponModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs"
          onClick={() => setIsCouponModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-neutral-200">
              <h3 className="font-bold text-base text-neutral-900">Create Promo Code</h3>
              <button onClick={() => setIsCouponModalOpen(false)}>
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleCreateCouponSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER20"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 20% discount on entire summer collection"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Value</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-950 text-white rounded-lg text-xs font-bold uppercase tracking-wider"
                >
                  Create Promo Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-neutral-200">
              <div>
                <h3 className="font-bold text-base text-neutral-900">
                  Order #{selectedOrder.orderNumber}
                </h3>
                <span className="text-[11px] text-neutral-400">
                  Placed {new Date(selectedOrder.createdAt).toLocaleString()}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)}>
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="space-y-1 text-xs">
                <p className="font-bold text-neutral-900">{selectedOrder.customerName}</p>
                <p className="text-neutral-600">{selectedOrder.customerEmail} • {selectedOrder.customerPhone}</p>
                <p className="text-neutral-600">
                  {selectedOrder.shippingAddress.addressLine1}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                </p>
              </div>

              {/* Status Update Control */}
              <div className="bg-neutral-50 p-3.5 rounded-lg border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-800 uppercase">Update Status</span>
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value as OrderStatus)}
                    className="py-1 px-2.5 text-xs border border-neutral-300 rounded font-semibold bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="packed">Packed</option>
                    <option value="shipped">Shipped</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                    Tracking Number
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. FDX-8891238"
                      value={trackingNumberInput}
                      onChange={(e) => setTrackingNumberInput(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-neutral-300 rounded"
                    />
                    <button
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, selectedOrder.orderStatus)}
                      className="px-3 py-1.5 bg-neutral-950 text-white rounded text-xs font-bold"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>

              {/* Ordered Items */}
              <div className="space-y-2 border-t border-neutral-100 pt-3">
                <h4 className="text-xs font-bold uppercase text-neutral-900">Garment Items</h4>
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-semibold text-neutral-900">{item.name}</p>
                      <p className="text-neutral-400 text-[11px]">{item.size} • {item.color} • Qty {item.quantity}</p>
                    </div>
                    <span className="font-bold text-neutral-950">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
