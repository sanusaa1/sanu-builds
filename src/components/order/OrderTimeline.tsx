import React from 'react';
import {
  Check,
  Clock,
  Package,
  Truck,
  Home,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

import { Order, OrderStatus } from '../../types';

interface OrderTimelineProps {
  order: Order;
}

const STAGES: {
  key: OrderStatus;
  label: string;
  icon: React.ElementType;
}[] = [
  {
    key: 'pending',
    label: 'Order Placed',
    icon: Clock,
  },
  {
    key: 'confirmed',
    label: 'Confirmed',
    icon: ShieldCheck,
  },
  {
    key: 'processing',
    label: 'Processing',
    icon: Clock,
  },
  {
    key: 'packed',
    label: 'Packed',
    icon: Package,
  },
  {
    key: 'shipped',
    label: 'Shipped',
    icon: Truck,
  },
  {
    key: 'out_for_delivery',
    label: 'Out for Delivery',
    icon: Truck,
  },
  {
    key: 'delivered',
    label: 'Delivered',
    icon: Home,
  },
];

export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  order,
}) => {
  const isCancelled =
    order.orderStatus === 'cancelled';

  const isReturned =
    order.orderStatus === 'returned' ||
    order.orderStatus === 'refunded';

  /*
   * Cancelled Order
   */
  if (isCancelled) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3 text-rose-900">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider">
            Order Cancelled
          </h4>

          <p className="text-xs text-rose-700 mt-0.5">
            {order.statusHistory?.find(
              (h) => h.status === 'cancelled'
            )?.note ||
              'This order was cancelled.'}
          </p>
        </div>
      </div>
    );
  }

  /*
   * Returned / Refunded Order
   */
  if (isReturned) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-amber-900">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider">
            {order.orderStatus === 'refunded'
              ? 'Order Refunded'
              : 'Order Returned'}
          </h4>

          <p className="text-xs text-amber-700 mt-0.5">
            {order.statusHistory?.find(
              (h) => h.status === order.orderStatus
            )?.note ||
              `This order was ${order.orderStatus}.`}
          </p>
        </div>
      </div>
    );
  }

  /*
   * Find Current Stage
   */
  const currentStageIndex = STAGES.findIndex(
    (stage) => stage.key === order.orderStatus
  );

  const activeIndex =
    currentStageIndex === -1
      ? 0
      : currentStageIndex;

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Order Status Progression
          </span>

          <h4 className="text-base font-black text-neutral-900 capitalize">
            {order.orderStatus.replace(/_/g, ' ')}
          </h4>
        </div>

        {order.trackingNumber && (
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Tracking Number (
              {order.carrierName ||
                'Expedited Standard'}
              )
            </span>

            <p className="text-xs font-mono font-bold text-neutral-900">
              {order.trackingNumber}
            </p>
          </div>
        )}
      </div>

      {/* RESPONSIVE TIMELINE */}
      <div className="relative">
        {/* DESKTOP TIMELINE */}
        <div className="hidden md:grid grid-cols-7 gap-2">
          {STAGES.map((stage, index) => {
            const isCompleted =
              index < activeIndex;

            const isCurrent =
              index === activeIndex;

            const historyItem =
              order.statusHistory?.find(
                (history) =>
                  history.status === stage.key
              );

            const Icon = stage.icon;

            return (
              <div
                key={stage.key}
                className="flex flex-col items-center text-center relative"
              >
                {/* CONNECTOR */}
                {index < STAGES.length - 1 && (
                  <div
                    className={`absolute top-4 left-1/2 w-full h-0.5 z-0 ${
                      index < activeIndex
                        ? 'bg-neutral-950'
                        : 'bg-neutral-200'
                    }`}
                  />
                )}

                {/* NODE */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 transition-all ${
                    isCurrent
                      ? 'bg-neutral-950 text-white ring-4 ring-neutral-200 shadow-md'
                      : isCompleted
                      ? 'bg-neutral-950 text-white'
                      : 'bg-neutral-100 text-neutral-400 border border-neutral-300'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                {/* LABEL */}
                <span
                  className={`mt-2 text-[11px] font-bold tracking-tight leading-tight ${
                    isCurrent
                      ? 'text-neutral-950'
                      : isCompleted
                      ? 'text-neutral-700'
                      : 'text-neutral-400'
                  }`}
                >
                  {stage.label}
                </span>

                {/* DATE */}
                {historyItem && (
                  <span className="text-[10px] text-neutral-400 mt-0.5 font-mono">
                    {new Date(
                      historyItem.timestamp
                    ).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* MOBILE TIMELINE */}
        <div className="md:hidden space-y-4">
          {STAGES.map((stage, index) => {
            const isCompleted =
              index < activeIndex;

            const isCurrent =
              index === activeIndex;

            const historyItem =
              order.statusHistory?.find(
                (history) =>
                  history.status === stage.key
              );

            const Icon = stage.icon;

            return (
              <div
                key={stage.key}
                className="flex items-start gap-3 relative"
              >
                {/* VERTICAL CONNECTOR */}
                {index < STAGES.length - 1 && (
                  <div
                    className={`absolute top-6 left-3.5 w-0.5 h-10 ${
                      index < activeIndex
                        ? 'bg-neutral-950'
                        : 'bg-neutral-200'
                    }`}
                  />
                )}

                {/* NODE */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                    isCurrent
                      ? 'bg-neutral-950 text-white ring-2 ring-neutral-300'
                      : isCompleted
                      ? 'bg-neutral-950 text-white'
                      : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* CONTENT */}
                <div className="flex-1 pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs font-bold ${
                        isCurrent
                          ? 'text-neutral-950'
                          : isCompleted
                          ? 'text-neutral-800'
                          : 'text-neutral-400'
                      }`}
                    >
                      {stage.label}
                    </span>

                    {historyItem && (
                      <span className="text-[10px] text-neutral-400 font-mono shrink-0">
                        {new Date(
                          historyItem.timestamp
                        ).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>

                  {historyItem?.note && (
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      {historyItem.note}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
