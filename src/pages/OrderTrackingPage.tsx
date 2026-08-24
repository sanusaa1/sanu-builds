import React, { useEffect, useState } from 'react';
import { Truck, ArrowLeft, Package, MapPin, Calendar, CheckCircle } from 'lucide-react';
import { Order } from '../types';
import { getOrderById } from '../services/orderService';
import { OrderTimeline } from '../components/order/OrderTimeline';

interface OrderTrackingPageProps {
  orderId: string;
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ orderId, onNavigate }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (orderId) {
      getOrderById(orderId).then((ord) => {
        setOrder(ord);
        setLoading(false);
      });
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-neutral-400 animate-pulse">
        Loading real-time tracking data...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-neutral-900">Order Not Found</h2>
        <p className="text-xs text-neutral-500">
          We could not locate shipment records for #{orderId}.
        </p>
        <button
          onClick={() => onNavigate('/orders')}
          className="px-5 py-2 bg-neutral-900 text-white rounded-lg text-xs font-bold"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top back button */}
      <button
        onClick={() => onNavigate('/orders')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 uppercase tracking-wider"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Orders</span>
      </button>

      {/* Hero tracking banner */}
      <div className="bg-neutral-950 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Real-Time Courier Tracking
          </span>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
            Order #{order.orderNumber}
          </h1>
          <p className="text-xs text-neutral-400">
            Carrier: <strong className="text-white">{order.carrierName || 'Express Freight'}</strong> • Tracking: <strong className="font-mono text-white">{order.trackingNumber || 'SANU-TRK-98214'}</strong>
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 text-left sm:text-right shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
            Estimated Delivery
          </span>
          <span className="text-sm font-black text-white block mt-0.5">
            {order.estimatedDelivery || 'In 3 Business Days'}
          </span>
        </div>
      </div>

      {/* Visual 7-step timeline */}
      <OrderTimeline order={order} />

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping address info */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
            <MapPin className="w-4 h-4 text-neutral-900" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Delivery Address
            </h3>
          </div>
          <p className="text-xs font-bold text-neutral-900">{order.shippingAddress.fullName}</p>
          <p className="text-xs text-neutral-600 leading-relaxed">
            {order.shippingAddress.addressLine1} {order.shippingAddress.addressLine2 || ''}
          </p>
          <p className="text-xs text-neutral-600">
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
          </p>
          <p className="text-xs text-neutral-500 font-mono">Recipient Phone: {order.shippingAddress.phone}</p>
        </div>

        {/* Package summary */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
            <Package className="w-4 h-4 text-neutral-900" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Package Contents ({order.items.length})
            </h3>
          </div>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs">
                <span className="text-neutral-900 font-medium truncate max-w-[200px]">
                  {item.name} ({item.size})
                </span>
                <span className="text-neutral-500">Qty: {item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
