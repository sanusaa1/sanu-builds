import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, Package, Truck, Download, Share2 } from 'lucide-react';
import { Order } from '../types';
import { getOrderById } from '../services/orderService';
import { OrderTimeline } from '../components/order/OrderTimeline';

interface OrderSuccessPageProps {
  orderId: string;
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ orderId, onNavigate }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

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
        Fetching order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <h2 className="text-xl font-black text-neutral-900">Order Confirmed</h2>
        <p className="text-xs text-neutral-500">
          Your order has been recorded. Reference ID: {orderId}
        </p>
        <button
          onClick={() => onNavigate('/orders')}
          className="px-5 py-2.5 bg-neutral-900 text-white rounded-lg text-xs font-bold"
        >
          View All Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Confirmation Banner */}
      <div className="text-center space-y-3 bg-neutral-50 rounded-2xl p-8 border border-neutral-200">
        <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle className="w-8 h-8" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
          Thank you for choosing Sanu Builds
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 uppercase tracking-tight">
          Order #{order.orderNumber} Confirmed
        </h1>
        <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
          We've received your order and our workshop is preparing your heavyweight tees for dispatch. A confirmation has been sent to <strong>{order.customerEmail}</strong>.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onNavigate(`/track/${order.id}`)}
            className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Truck className="w-4 h-4" />
            <span>Live Order Tracking</span>
          </button>
          <button
            onClick={() => onNavigate('/shop')}
            className="px-5 py-2.5 bg-white border border-neutral-300 hover:border-neutral-900 text-neutral-900 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>

      {/* Live Timeline Tracker */}
      <OrderTimeline order={order} />

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping details */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-2">
            Delivery Destination
          </h3>
          <p className="text-xs font-bold text-neutral-900">{order.shippingAddress.fullName}</p>
          <p className="text-xs text-neutral-600 leading-relaxed">
            {order.shippingAddress.addressLine1} {order.shippingAddress.addressLine2 || ''}
          </p>
          <p className="text-xs text-neutral-600">
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
          </p>
          <p className="text-xs text-neutral-500 font-mono">Contact: {order.shippingAddress.phone}</p>
          <p className="text-[11px] text-neutral-400">Carrier: {order.carrierName || 'Standard Ground'}</p>
        </div>

        {/* Financial breakdown */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-2">
            Payment Breakdown
          </h3>
          <div className="space-y-1.5 text-xs text-neutral-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-neutral-900">${order.subtotal.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount ({order.couponCode || 'Promo'})</span>
                <span>-${order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-semibold text-neutral-900">
                {order.shippingFee === 0 ? 'FREE' : `$${order.shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax</span>
              <span className="font-semibold text-neutral-900">${order.tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-neutral-200 pt-2 flex justify-between font-bold text-neutral-950 text-sm">
              <span>Total Paid</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items list */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-2">
          Ordered Garments ({order.items.length})
        </h3>
        <div className="divide-y divide-neutral-100">
          {order.items.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
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
              <span className="font-bold text-neutral-950 shrink-0">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
