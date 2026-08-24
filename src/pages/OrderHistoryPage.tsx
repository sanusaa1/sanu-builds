// OrderHistoryPage.tsx

import React, { useEffect, useState } from 'react';
import {
  Package,
  Truck,
  ShoppingBag,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  IndianRupee,
} from 'lucide-react';

import { Order } from '../types';
import { getUserOrders } from '../services/orderService';
import { useAuth } from '../context/AuthContext';

interface OrderHistoryPageProps {
  onNavigate: (
    route: string,
    params?: Record<string, string>
  ) => void;
}

const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
};

const formatDate = (date: string | Date): string => {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return 'Date unavailable';
  }

  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getStatusInfo = (status: Order['orderStatus']) => {
  switch (status) {
    case 'delivered':
      return {
        label: 'Delivered',
        icon: CheckCircle2,
        className:
          'bg-emerald-50 text-emerald-700 border-emerald-200',
      };

    case 'shipped':
      return {
        label: 'Shipped',
        icon: Truck,
        className:
          'bg-blue-50 text-blue-700 border-blue-200',
      };

    case 'out_for_delivery':
      return {
        label: 'Out for Delivery',
        icon: Truck,
        className:
          'bg-indigo-50 text-indigo-700 border-indigo-200',
      };

    case 'cancelled':
      return {
        label: 'Cancelled',
        icon: XCircle,
        className:
          'bg-rose-50 text-rose-700 border-rose-200',
      };

    case 'confirmed':
      return {
        label: 'Confirmed',
        icon: CheckCircle2,
        className:
          'bg-emerald-50 text-emerald-700 border-emerald-200',
      };

    case 'processing':
      return {
        label: 'Processing',
        icon: Clock,
        className:
          'bg-amber-50 text-amber-700 border-amber-200',
      };

    default:
      return {
        label: 'Processing',
        icon: AlertCircle,
        className:
          'bg-neutral-100 text-neutral-700 border-neutral-200',
      };
  }
};

export const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({
  onNavigate,
}) => {
  const { currentUser } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      if (!currentUser) {
        if (mounted) {
          setOrders([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError('');

      try {
        const result = await getUserOrders(currentUser.uid);

        if (!mounted) {
          return;
        }

        setOrders(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error(
          'Error loading Indian customer orders:',
          err
        );

        if (!mounted) {
          return;
        }

        setOrders([]);
        setError(
          'Unable to load your orders right now. Please try again.'
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      mounted = false;
    };
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-5">
        <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 flex items-center justify-center">
          <Package className="w-8 h-8 text-neutral-400" />
        </div>

        <div>
          <h2 className="text-xl font-black text-neutral-900">
            Sign In to View Your Orders
          </h2>

          <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
            Sign in to track your Sanu Builds orders, view
            invoices and manage your deliveries across India.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('/login')}
          className="px-6 py-3 bg-neutral-950 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
        >
          Sign In
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-4 animate-pulse">
          <div className="h-7 w-56 bg-neutral-200 rounded" />
          <div className="h-4 w-40 bg-neutral-100 rounded" />

          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-36 bg-neutral-100 border border-neutral-200 rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* HEADER */}
      <div className="border-b border-neutral-200 pb-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
          Sanu Builds • My Account
        </span>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mt-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight uppercase">
              My Orders
            </h1>

            <p className="text-xs text-neutral-500 mt-1">
              View and track all your Sanu Builds orders.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 bg-neutral-50 border border-neutral-200 px-3 py-2 rounded-lg">
            <Package className="w-4 h-4" />
            {orders.length}{' '}
            {orders.length === 1 ? 'Order' : 'Orders'}
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />

          <div>
            <p className="text-xs font-bold text-rose-800">
              Something went wrong
            </p>

            <p className="text-xs text-rose-600 mt-1">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* EMPTY */}
      {orders.length === 0 ? (
        <div className="py-16 px-6 text-center bg-neutral-50 rounded-xl border border-neutral-200 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-white border border-neutral-200 flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-neutral-400" />
          </div>

          <div>
            <h3 className="text-base font-black text-neutral-900 uppercase">
              No Orders Yet
            </h3>

            <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-2 leading-relaxed">
              Your Sanu Builds purchases will appear here after
              you place your first order.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/shop')}
            className="px-6 py-3 bg-neutral-950 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
          >
            Start Shopping
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = getStatusInfo(order.orderStatus);
            const StatusIcon = status.icon;

            const totalItems = order.items.reduce(
              (sum, item) =>
                sum + (Number(item.quantity) || 0),
              0
            );

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs hover:border-neutral-400 transition-colors"
              >
                {/* ORDER HEADER */}
                <div className="p-4 sm:p-5 bg-neutral-50 border-b border-neutral-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                          Order Placed
                        </span>

                        <span className="text-xs font-bold text-neutral-900">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                          Order Total
                        </span>

                        <span className="text-xs font-black text-neutral-900 inline-flex items-center">
                          <IndianRupee className="w-3 h-3" />
                          {formatINR(order.total)
                            .replace('₹', '')
                            .trim()}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                          Order Number
                        </span>

                        <span className="text-xs font-mono font-bold text-neutral-900">
                          {order.orderNumber}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                          Items
                        </span>

                        <span className="text-xs font-bold text-neutral-900">
                          {totalItems}{' '}
                          {totalItems === 1
                            ? 'Item'
                            : 'Items'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1.5 border text-[10px] font-bold uppercase rounded-full flex items-center gap-1.5 ${status.className}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          onNavigate(
                            `/track/${order.id}`
                          )
                        }
                        className="px-3 py-2 bg-neutral-950 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        Track
                      </button>
                    </div>
                  </div>
                </div>

                {/* ITEMS */}
                <div className="p-4 sm:p-5 divide-y divide-neutral-100">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="py-3 first:pt-0 last:pb-0 flex items-center gap-3 sm:gap-4"
                    >
                      <img
                        src={item.image || ''}
                        alt={item.name || 'Product'}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover border border-neutral-200 bg-neutral-100 shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                          {item.name}
                        </p>

                        <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1 text-[11px] text-neutral-500">
                          <span>
                            Size:{' '}
                            <strong className="text-neutral-800">
                              {item.size || 'Standard'}
                            </strong>
                          </span>

                          <span>•</span>

                          <span>
                            Color:{' '}
                            <strong className="text-neutral-800">
                              {item.color || 'Default'}
                            </strong>
                          </span>

                          <span>•</span>

                          <span>
                            Qty:{' '}
                            <strong className="text-neutral-800">
                              {Number(item.quantity) || 1}
                            </strong>
                          </span>
                        </div>
                      </div>

                      <span className="text-xs sm:text-sm font-black text-neutral-950 shrink-0">
                        {formatINR(
                          (Number(item.price) || 0) *
                            (Number(item.quantity) || 1)
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                {/* ORDER FOOTER */}
                <div className="px-4 sm:px-5 py-3 bg-neutral-50 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                    <MapPin className="w-3.5 h-3.5" />

                    <span>
                      Delivery available across India
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onNavigate(
                        `/track/${order.id}`
                      )
                    }
                    className="text-[11px] font-bold uppercase tracking-wider text-neutral-900 hover:underline inline-flex items-center gap-1"
                  >
                    View Order Tracking
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
