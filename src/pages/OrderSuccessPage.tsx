// OrderSuccessPage.tsx

import React, { useEffect, useState } from 'react';
import {
  CheckCircle,
  Truck,
  ShoppingBag,
  IndianRupee,
} from 'lucide-react';

import { Order } from '../types';
import { getOrderById } from '../services/orderService';
import { OrderTimeline } from '../components/order/OrderTimeline';

interface OrderSuccessPageProps {
  orderId: string;
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
  })
    .format(Number(amount) || 0)
    .replace('₹', '')
    .trim();
};

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({
  orderId,
  onNavigate,
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    const loadOrder = async () => {
      if (!orderId) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const result = await getOrderById(orderId);

        if (!mounted) {
          return;
        }

        setOrder(result);
      } catch (error) {
        console.error('Error loading order:', error);

        if (mounted) {
          setOrder(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOrder();

    return () => {
      mounted = false;
    };
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
        <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-black text-neutral-900">
          Order Confirmed
        </h2>

        <p className="text-xs text-neutral-500">
          Your order has been recorded successfully.
        </p>

        <p className="text-[11px] text-neutral-400 font-mono break-all">
          Reference ID: {orderId}
        </p>

        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => onNavigate('/orders')}
            className="px-5 py-2.5 bg-neutral-900 hover:bg-black text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
          >
            View All Orders
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/shop')}
            className="px-5 py-2.5 bg-white border border-neutral-300 hover:border-neutral-900 text-neutral-900 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Shop
          </button>
        </div>
      </div>
    );
  }

  const subtotal = Number(order.subtotal) || 0;
  const discount = Number(order.discount) || 0;
  const shippingFee = Number(order.shippingFee) || 0;
  const tax = Number(order.tax) || 0;
  const total = Number(order.total) || 0;

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
          We've received your order and our workshop is
          preparing your heavyweight tees for dispatch.
          A confirmation has been sent to{' '}
          <strong>{order.customerEmail}</strong>.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">

          <button
            type="button"
            onClick={() =>
              onNavigate(`/track/${order.id}`)
            }
            className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Truck className="w-4 h-4" />
            <span>Live Order Tracking</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/shop')}
            className="px-5 py-2.5 bg-white border border-neutral-300 hover:border-neutral-900 text-neutral-900 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>

        </div>
      </div>

      {/* Live Timeline */}
      <OrderTimeline order={order} />

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Shipping Details */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-3">

          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-2">
            Delivery Destination
          </h3>

          <p className="text-xs font-bold text-neutral-900">
            {order.shippingAddress.fullName}
          </p>

          <p className="text-xs text-neutral-600 leading-relaxed">
            {order.shippingAddress.addressLine1}
            {order.shippingAddress.addressLine2
              ? `, ${order.shippingAddress.addressLine2}`
              : ''}
          </p>

          <p className="text-xs text-neutral-600">
            {order.shippingAddress.city},{' '}
            {order.shippingAddress.state}{' '}
            {order.shippingAddress.postalCode}
          </p>

          {order.shippingAddress.landmark && (
            <p className="text-xs text-neutral-500">
              Landmark: {order.shippingAddress.landmark}
            </p>
          )}

          <p className="text-xs text-neutral-500 font-mono">
            Contact: {order.shippingAddress.phone}
          </p>

          <p className="text-[11px] text-neutral-400">
            Carrier:{' '}
            {order.carrierName || 'Standard Ground'}
          </p>

          {order.estimatedDelivery && (
            <p className="text-[11px] text-neutral-400">
              Estimated Delivery:{' '}
              {order.estimatedDelivery}
            </p>
          )}

        </div>

        {/* Financial Breakdown */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-3">

          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-2">
            Payment Breakdown
          </h3>

          <div className="space-y-1.5 text-xs text-neutral-600">

            <div className="flex justify-between items-center">
              <span>Subtotal</span>

              <span className="font-semibold text-neutral-900 inline-flex items-center">
                <IndianRupee className="w-3 h-3" />
                {formatINR(subtotal)}
              </span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between items-center text-emerald-600">
                <span>
                  Discount
                  {order.couponCode
                    ? ` (${order.couponCode})`
                    : ''}
                </span>

                <span className="inline-flex items-center">
                  -
                  <IndianRupee className="w-3 h-3" />
                  {formatINR(discount)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span>Shipping</span>

              <span className="font-semibold text-neutral-900">
                {shippingFee === 0 ? (
                  'FREE'
                ) : (
                  <span className="inline-flex items-center">
                    <IndianRupee className="w-3 h-3" />
                    {formatINR(shippingFee)}
                  </span>
                )}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span>Estimated Tax</span>

              <span className="font-semibold text-neutral-900 inline-flex items-center">
                <IndianRupee className="w-3 h-3" />
                {formatINR(tax)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Payment Method</span>

              <span className="font-semibold text-neutral-900 uppercase">
                {order.paymentMethod || 'UPI'}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Payment Status</span>

              <span
                className={
                  order.paymentStatus === 'paid'
                    ? 'font-bold text-emerald-600 uppercase'
                    : 'font-bold text-amber-600 uppercase'
                }
              >
                {order.paymentStatus || 'Pending'}
              </span>
            </div>

            <div className="border-t border-neutral-200 pt-2 flex justify-between font-bold text-neutral-950 text-sm">
              <span>
                {order.paymentStatus === 'paid'
                  ? 'Total Paid'
                  : 'Total Due'}
              </span>

              <span className="inline-flex items-center">
                <IndianRupee className="w-4 h-4" />
                {formatINR(total)}
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* Ordered Items */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">

        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-2">
          Ordered Garments ({order.items.length})
        </h3>

        <div className="divide-y divide-neutral-100">

          {order.items.map((item) => {

            const quantity =
              Number(item.quantity) || 1;

            const price =
              Number(item.price) || 0;

            return (
              <div
                key={item.id}
                className="py-3 flex items-center justify-between gap-4 text-xs"
              >

                <img
                  src={item.image || ''}
                  alt={item.name || 'Product'}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-lg object-cover border border-neutral-200 shrink-0"
                />

                <div className="flex-1 min-w-0">

                  <p className="font-bold text-neutral-900 truncate">
                    {item.name}
                  </p>

                  <p className="text-neutral-500">
                    Size: {item.size || 'Standard'}
                    {' • '}
                    Color: {item.color || 'Default'}
                    {' • '}
                    Qty: {quantity}
                  </p>

                </div>

                <span className="font-bold text-neutral-950 shrink-0 inline-flex items-center">
                  <IndianRupee className="w-3.5 h-3.5" />
                  {formatINR(price * quantity)}
                </span>

              </div>
            );
          })}

        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-wrap justify-center gap-3 pt-2">

        <button
          type="button"
          onClick={() =>
            onNavigate(`/track/${order.id}`)
          }
          className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
        >
          <Truck className="w-4 h-4" />
          Track Order
        </button>

        <button
          type="button"
          onClick={() =>
            onNavigate('/orders')
          }
          className="px-5 py-2.5 bg-white border border-neutral-300 hover:border-neutral-900 text-neutral-900 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
        >
          Order History
        </button>

        <button
          type="button"
          onClick={() => onNavigate('/shop')}
          className="px-5 py-2.5 bg-white border border-neutral-300 hover:border-neutral-900 text-neutral-900 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
        >
          <ShoppingBag className="w-4 h-4" />
          Continue Shopping
        </button>

      </div>

    </div>
  );
};
