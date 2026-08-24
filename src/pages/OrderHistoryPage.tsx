import React, { useState, useEffect } from 'react';
import { Package, ArrowRight, Truck, Clock, ShieldCheck, AlertCircle, ShoppingBag } from 'lucide-react';
import { Order } from '../types';
import { getUserOrders } from '../services/orderService';
import { useAuth } from '../context/AuthContext';

interface OrderHistoryPageProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

export const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (currentUser) {
      getUserOrders(currentUser.uid).then((res) => {
        setOrders(res);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const getStatusBadge = (status: Order['orderStatus']) => {
    switch (status) {
      case 'delivered':
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase rounded-full">Delivered</span>;
      case 'shipped':
      case 'out_for_delivery':
        return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase rounded-full">In Transit</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold uppercase rounded-full">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 bg-neutral-100 text-neutral-800 border border-neutral-200 text-[10px] font-bold uppercase rounded-full">Processing</span>;
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <Package className="w-12 h-12 text-neutral-400 mx-auto" />
        <h2 className="text-xl font-bold text-neutral-900">Sign In to View Your Orders</h2>
        <p className="text-xs text-neutral-500">
          Track packages, check past invoices, and manage returns by signing into your Sanu Builds account.
        </p>
        <button
          onClick={() => onNavigate('/login')}
          className="px-6 py-2.5 bg-neutral-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-neutral-400 animate-pulse">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-neutral-200 pb-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
          Account Overview
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight uppercase mt-0.5">
          Order History ({orders.length})
        </h1>
      </div>

      {orders.length === 0 ? (
        <div className="py-16 text-center bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
          <ShoppingBag className="w-10 h-10 text-neutral-400 mx-auto" />
          <h3 className="text-base font-bold text-neutral-900">No orders placed yet</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            When you purchase Sanu Builds heavyweight t-shirts, your receipts and tracking history will appear here.
          </p>
          <button
            onClick={() => onNavigate('/shop')}
            className="px-5 py-2.5 bg-neutral-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs hover:border-neutral-400 transition-colors"
            >
              {/* Order Header */}
              <div className="p-4 sm:p-5 bg-neutral-50 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">Order Placed</span>
                    <span className="font-bold text-neutral-900">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">Order Total</span>
                    <span className="font-black text-neutral-900">${order.total.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">Order Number</span>
                    <span className="font-mono font-bold text-neutral-900">{order.orderNumber}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(order.orderStatus)}
                  <button
                    onClick={() => onNavigate(`/track/${order.id}`)}
                    className="px-3 py-1.5 bg-neutral-950 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center gap-1"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Track</span>
                  </button>
                </div>
              </div>

              {/* Items in order */}
              <div className="p-4 sm:p-5 divide-y divide-neutral-100">
                {order.items.map((item) => (
                  <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover border border-neutral-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-neutral-900 truncate">{item.name}</p>
                      <p className="text-neutral-500">
                        Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-neutral-950">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
