import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Lock,
  Plus,
  Sparkles,
} from 'lucide-react';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Address, PaymentMethod } from '../types';
import {
  getUserAddresses,
  saveUserAddress,
} from '../services/userService';
import { createOrder } from '../services/orderService';

interface CheckoutPageProps {
  onNavigate: (
    route: string,
    params?: Record<string, string>
  ) => void;
}

/**
 * Firestore does not allow undefined values.
 *
 * This helper recursively removes undefined values
 * from objects and arrays before sending data to Firestore.
 */
const removeUndefined = <T,>(value: T): T => {
  if (Array.isArray(value)) {
    return value
      .map((item) => removeUndefined(item))
      .filter((item) => item !== undefined) as T;
  }

  if (
    value !== null &&
    typeof value === 'object'
  ) {
    const result: Record<string, unknown> = {};

    Object.entries(
      value as Record<string, unknown>
    ).forEach(([key, item]) => {
      if (item !== undefined) {
        result[key] = removeUndefined(item);
      }
    });

    return result as T;
  }

  return value;
};

export const CheckoutPage: React.FC<
  CheckoutPageProps
> = ({ onNavigate }) => {
  const {
    cart,
    subtotal,
    discount,
    shippingFee,
    tax,
    total,
    appliedCoupon,
    clearCart,
  } = useCart();

  const {
    currentUser,
    userProfile,
  } = useAuth();

  const {
    success,
    error: toastError,
  } = useToast();

  const [
    savedAddresses,
    setSavedAddresses,
  ] = useState<Address[]>([]);

  const [
    selectedAddressId,
    setSelectedAddressId,
  ] = useState<string>('');

  const [
    isAddingNewAddress,
    setIsAddingNewAddress,
  ] = useState<boolean>(false);

  const [
    deliveryMethod,
    setDeliveryMethod,
  ] = useState<'standard' | 'express'>(
    'standard'
  );

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState<PaymentMethod>('card');

  const [
    placingOrder,
    setPlacingOrder,
  ] = useState<boolean>(false);

  /*
   * Address form
   */
  const [
    addressForm,
    setAddressForm,
  ] = useState<Omit<Address, 'id'>>({
    fullName: userProfile?.name || '',
    phone: userProfile?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    landmark: '',
    isDefault: true,
  });

  /*
   * Payment mock fields
   */
  const [
    cardNumber,
    setCardNumber,
  ] = useState(
    '4242 •••• •••• 4242'
  );

  const [
    cardExpiry,
    setCardExpiry,
  ] = useState('12/28');

  const [
    cardCvc,
    setCardCvc,
  ] = useState('888');

  const [
    upiId,
    setUpiId,
  ] = useState('builder@okaxis');

  /*
   * Load saved addresses
   */
  useEffect(() => {
    if (cart.length === 0) {
      onNavigate('/cart');
      return;
    }

    if (!currentUser) {
      setIsAddingNewAddress(true);
      return;
    }

    let mounted = true;

    const loadAddresses = async () => {
      try {
        const addresses =
          await getUserAddresses(
            currentUser.uid
          );

        if (!mounted) {
          return;
        }

        setSavedAddresses(addresses);

        if (addresses.length > 0) {
          const defaultAddress =
            addresses.find(
              (address) =>
                address.isDefault
            ) || addresses[0];

          setSelectedAddressId(
            defaultAddress.id
          );

          setIsAddingNewAddress(false);
        } else {
          setSelectedAddressId('');
          setIsAddingNewAddress(true);
        }
      } catch (err) {
        console.error(
          'Error loading user addresses:',
          err
        );

        if (!mounted) {
          return;
        }

        setIsAddingNewAddress(true);

        toastError(
          'Could not load saved addresses.'
        );
      }
    };

    loadAddresses();

    return () => {
      mounted = false;
    };
  }, [
    currentUser,
    cart.length,
    onNavigate,
    toastError,
  ]);

  /*
   * Sync profile information into
   * address form.
   */
  useEffect(() => {
    if (!userProfile) {
      return;
    }

    setAddressForm((previous) => ({
      ...previous,

      fullName:
        previous.fullName ||
        userProfile.name ||
        '',

      phone:
        previous.phone ||
        userProfile.phone ||
        '',
    }));
  }, [userProfile]);

  /*
   * Validate address
   */
  const isAddressValid = (
    address: Omit<Address, 'id'>
  ) => {
    return Boolean(
      address.fullName?.trim() &&
        address.phone?.trim() &&
        address.addressLine1?.trim() &&
        address.city?.trim() &&
        address.state?.trim() &&
        address.postalCode?.trim()
    );
  };

  /*
   * Save new address
   */
  const handleSaveNewAddress = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!isAddressValid(addressForm)) {
      toastError(
        'Please fill out all required address fields.'
      );
      return;
    }

    if (!currentUser) {
      setSelectedAddressId(
        'guest_temp'
      );

      setIsAddingNewAddress(false);

      success(
        'Delivery address selected.'
      );

      return;
    }

    try {
      const safeAddress =
        removeUndefined({
          ...addressForm,

          fullName:
            addressForm.fullName.trim(),

          phone:
            addressForm.phone.trim(),

          addressLine1:
            addressForm.addressLine1.trim(),

          addressLine2:
            addressForm.addressLine2?.trim() ||
            null,

          city:
            addressForm.city.trim(),

          state:
            addressForm.state.trim(),

          postalCode:
            addressForm.postalCode.trim(),

          country:
            addressForm.country?.trim() ||
            'United States',

          landmark:
            addressForm.landmark?.trim() ||
            null,

          isDefault:
            Boolean(addressForm.isDefault),
        });

      const saved =
        await saveUserAddress(
          currentUser.uid,
          safeAddress
        );

      setSavedAddresses(
        (previous) => [
          ...previous,
          saved,
        ]
      );

      setSelectedAddressId(saved.id);

      setIsAddingNewAddress(false);

      success(
        'Address saved successfully.'
      );
    } catch (err) {
      console.error(
        'Error saving address:',
        err
      );

      toastError(
        'Could not save address. Please try again.'
      );
    }
  };

  /*
   * Select saved address
   */
  const handleSelectAddress = (
    addressId: string
  ) => {
    setSelectedAddressId(addressId);
    setIsAddingNewAddress(false);
  };

  /*
   * Place order
   */
  const handlePlaceOrder = async () => {
    if (placingOrder) {
      return;
    }

    /*
     * -----------------------------------------
     * STEP 1: Resolve active address
     * -----------------------------------------
     */
    let activeAddress: Address;

    if (
      isAddingNewAddress ||
      selectedAddressId ===
        'guest_temp' ||
      savedAddresses.length === 0
    ) {
      if (
        !isAddressValid(addressForm)
      ) {
        toastError(
          'Please provide a complete delivery address.'
        );
        return;
      }

      activeAddress =
        removeUndefined({
          ...addressForm,

          id: `addr_temp_${Date.now()}`,

          fullName:
            addressForm.fullName.trim(),

          phone:
            addressForm.phone.trim(),

          addressLine1:
            addressForm.addressLine1.trim(),

          addressLine2:
            addressForm.addressLine2?.trim() ||
            null,

          city:
            addressForm.city.trim(),

          state:
            addressForm.state.trim(),

          postalCode:
            addressForm.postalCode.trim(),

          country:
            addressForm.country?.trim() ||
            'United States',

          landmark:
            addressForm.landmark?.trim() ||
            null,

          isDefault:
            Boolean(addressForm.isDefault),
        });
    } else {
      const foundAddress =
        savedAddresses.find(
          (address) =>
            address.id ===
            selectedAddressId
        );

      if (!foundAddress) {
        toastError(
          'Please select a valid delivery address.'
        );
        return;
      }

      activeAddress =
        removeUndefined(
          foundAddress
        );
    }

    /*
     * -----------------------------------------
     * STEP 2: Calculate shipping
     * -----------------------------------------
     */
    const baseShipping =
      Number(shippingFee) || 0;

    const finalShipping =
      deliveryMethod === 'express'
        ? baseShipping + 8
        : baseShipping;

    /*
     * -----------------------------------------
     * STEP 3: Calculate totals
     * -----------------------------------------
     */
    const safeSubtotal =
      Number(subtotal) || 0;

    const safeDiscount =
      Number(discount) || 0;

    const safeTax =
      Number(tax) || 0;

    const finalTotal =
      Math.round(
        (
          safeSubtotal -
          safeDiscount +
          finalShipping +
          safeTax
        ) * 100
      ) / 100;

    /*
     * -----------------------------------------
     * STEP 4: Coupon
     *
     * NEVER send undefined to Firestore.
     * -----------------------------------------
     */
    const couponCode =
      appliedCoupon?.code?.trim() ||
      null;

    /*
     * -----------------------------------------
     * STEP 5: Clean cart items
     *
     * This protects against undefined
     * fields inside cart objects too.
     * -----------------------------------------
     */
    const safeItems = cart.map(
      (item) =>
        removeUndefined({
          ...item,

          quantity:
            Number(item.quantity) || 1,

          price:
            Number(item.price) || 0,

          name:
            item.name || '',

          image:
            item.image || '',

          size:
            item.size || null,
        })
    );

    /*
     * -----------------------------------------
     * STEP 6: Create Firestore-safe order
     * -----------------------------------------
     */
    const orderData = removeUndefined({
      userId:
        currentUser?.uid || 'guest',

      customerName:
        activeAddress.fullName || '',

      customerEmail:
        currentUser?.email ||
        'guest@sanubuilds.com',

      customerPhone:
        activeAddress.phone || '',

      items: safeItems,

      shippingAddress:
        activeAddress,

      subtotal:
        safeSubtotal,

      discount:
        safeDiscount,

      /*
       * IMPORTANT:
       * null is allowed by Firestore.
       * undefined is NOT allowed.
       */
      couponCode:
        couponCode,

      shippingFee:
        finalShipping,

      tax:
        safeTax,

      total:
        finalTotal,

      paymentMethod:
        paymentMethod || 'card',

      paymentStatus:
        paymentMethod === 'cod'
          ? 'pending'
          : 'paid',

      orderStatus:
        'confirmed',

      carrierName:
        deliveryMethod === 'express'
          ? 'FedEx Priority Air'
          : 'Expedited Standard Ground',

      estimatedDelivery:
        deliveryMethod === 'express'
          ? '1 - 2 Business Days'
          : '3 - 5 Business Days',

      deliveryMethod:
        deliveryMethod,

      createdAt:
        new Date().toISOString(),
    });

    /*
     * Debug:
     * Check if anything undefined
     * somehow remains.
     */
    console.log(
      'Creating Firestore order:',
      orderData
    );

    setPlacingOrder(true);

    try {
      /*
       * -----------------------------------------
       * STEP 7: Create order
       * -----------------------------------------
       */
      const orderResult =
        await createOrder(
          orderData
        );

      /*
       * -----------------------------------------
       * STEP 8: Clear cart ONLY after
       * successful order creation
       * -----------------------------------------
       */
      await clearCart();

      /*
       * -----------------------------------------
       * STEP 9: Success
       * -----------------------------------------
       */
      success(
        `Order #${orderResult.orderNumber} placed successfully!`
      );

      onNavigate(
        `/order-success/${orderResult.id}`
      );
    } catch (err) {
      console.error(
        'Error placing order:',
        err
      );

      toastError(
        'Could not process order. Please check connection and try again.'
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  /*
   * Express shipping display
   */
  const displayTotal =
    deliveryMethod === 'express'
      ? Number(total || 0) + 8
      : Number(total || 0);

  /*
   * Empty cart protection
   */
  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* HEADER */}
      <div className="border-b border-neutral-200 pb-4 flex items-center justify-between">

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Secure 256-Bit SSL Checkout
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight uppercase mt-0.5">
            Checkout
          </h1>
        </div>

        <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 text-xs font-bold">
          <Lock className="w-3.5 h-3.5" />
          <span>
            Encrypted Payment
          </span>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT */}
        <div className="lg:col-span-8 space-y-8">

          {/* ADDRESS */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-5 shadow-xs">

            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">

              <div className="flex items-center gap-2">

                <div className="w-6 h-6 rounded-full bg-neutral-950 text-white flex items-center justify-center text-xs font-bold">
                  1
                </div>

                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                  Delivery Address
                </h3>

              </div>

              {savedAddresses.length > 0 &&
                !isAddingNewAddress && (
                  <button
                    type="button"
                    onClick={() =>
                      setIsAddingNewAddress(
                        true
                      )
                    }
                    className="text-xs font-bold text-neutral-900 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>
                      Add New Address
                    </span>
                  </button>
                )}

            </div>

            {/* SAVED ADDRESSES */}
            {savedAddresses.length > 0 &&
            !isAddingNewAddress ? (

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {savedAddresses.map(
                  (address) => (

                    <button
                      type="button"
                      key={address.id}
                      onClick={() =>
                        handleSelectAddress(
                          address.id
                        )
                      }
                      className={`text-left p-4 rounded-xl border-2 cursor-pointer transition-all space-y-1 ${
                        selectedAddressId ===
                        address.id
                          ? 'border-neutral-950 bg-neutral-50/70 shadow-xs'
                          : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                    >

                      <div className="flex items-center justify-between">

                        <span className="text-xs font-bold text-neutral-900">
                          {address.fullName}
                        </span>

                        {address.isDefault && (
                          <span className="text-[10px] font-bold uppercase bg-neutral-200 px-1.5 py-0.5 rounded text-neutral-800">
                            Default
                          </span>
                        )}

                      </div>

                      <p className="text-xs text-neutral-600 leading-relaxed">
                        {address.addressLine1}

                        {address.addressLine2
                          ? `, ${address.addressLine2}`
                          : ''}
                      </p>

                      <p className="text-xs text-neutral-600">
                        {address.city},{' '}
                        {address.state}{' '}
                        {address.postalCode}
                      </p>

                      <p className="text-xs text-neutral-500 font-mono">
                        Phone:{' '}
                        {address.phone}
                      </p>

                    </button>

                  )
                )}

              </div>

            ) : (

              /* NEW ADDRESS FORM */
              <form
                onSubmit={
                  handleSaveNewAddress
                }
                className="space-y-4"
              >

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Full Name *
                    </label>

                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Rivers"
                      value={
                        addressForm.fullName
                      }
                      onChange={(event) =>
                        setAddressForm(
                          (previous) => ({
                            ...previous,
                            fullName:
                              event.target
                                .value,
                          })
                        )
                      }
                      className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Phone Number *
                    </label>

                    <input
                      type="tel"
                      required
                      placeholder="+91 9876543210"
                      value={
                        addressForm.phone
                      }
                      onChange={(event) =>
                        setAddressForm(
                          (previous) => ({
                            ...previous,
                            phone:
                              event.target
                                .value,
                          })
                        )
                      }
                      className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Street Address *
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="House No., Street, Area"
                    value={
                      addressForm.addressLine1
                    }
                    onChange={(event) =>
                      setAddressForm(
                        (previous) => ({
                          ...previous,
                          addressLine1:
                            event.target
                              .value,
                        })
                      )
                    }
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Address Line 2
                  </label>

                  <input
                    type="text"
                    placeholder="Apartment, Floor, Building"
                    value={
                      addressForm.addressLine2 ||
                      ''
                    }
                    onChange={(event) =>
                      setAddressForm(
                        (previous) => ({
                          ...previous,
                          addressLine2:
                            event.target
                              .value,
                        })
                      )
                    }
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      City *
                    </label>

                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={
                        addressForm.city
                      }
                      onChange={(event) =>
                        setAddressForm(
                          (previous) => ({
                            ...previous,
                            city:
                              event.target
                                .value,
                          })
                        )
                      }
                      className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      State *
                    </label>

                    <input
                      type="text"
                      required
                      placeholder="State"
                      value={
                        addressForm.state
                      }
                      onChange={(event) =>
                        setAddressForm(
                          (previous) => ({
                            ...previous,
                            state:
                              event.target
                                .value,
                          })
                        )
                      }
                      className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Postal Code *
                    </label>

                    <input
                      type="text"
                      required
                      placeholder="Postal Code"
                      value={
                        addressForm.postalCode
                      }
                      onChange={(event) =>
                        setAddressForm(
                          (previous) => ({
                            ...previous,
                            postalCode:
                              event.target
                                .value,
                          })
                        )
                      }
                      className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Landmark
                  </label>

                  <input
                    type="text"
                    placeholder="Nearby landmark"
                    value={
                      addressForm.landmark ||
                      ''
                    }
                    onChange={(event) =>
                      setAddressForm(
                        (previous) => ({
                          ...previous,
                          landmark:
                            event.target
                              .value,
                        })
                      )
                    }
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                  />
                </div>

                {savedAddresses.length > 0 && (
                  <div className="flex justify-end gap-2 pt-2">

                    <button
                      type="button"
                      onClick={() =>
                        setIsAddingNewAddress(
                          false
                        )
                      }
                      className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                    >
                      Use Saved Address
                    </button>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-black"
                    >
                      Save & Use
                    </button>

                  </div>
                )}

              </form>
            )}

          </div>

          {/* DELIVERY METHOD */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4 shadow-xs">

            <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">

              <div className="w-6 h-6 rounded-full bg-neutral-950 text-white flex items-center justify-center text-xs font-bold">
                2
              </div>

              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                Delivery Method
              </h3>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <button
                type="button"
                onClick={() =>
                  setDeliveryMethod(
                    'standard'
                  )
                }
                className={`text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                  deliveryMethod ===
                  'standard'
                    ? 'border-neutral-950 bg-neutral-50'
                    : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >

                <div>
                  <span className="text-xs font-bold text-neutral-900 block">
                    Standard Tracked Courier
                  </span>

                  <span className="text-[11px] text-neutral-500">
                    3 - 5 Business Days
                  </span>
                </div>

                <span className="text-xs font-black text-neutral-950">
                  {baseShippingDisplay(
                    shippingFee
                  )}
                </span>

              </button>

              <button
                type="button"
                onClick={() =>
                  setDeliveryMethod(
                    'express'
                  )
                }
                className={`text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                  deliveryMethod ===
                  'express'
                    ? 'border-neutral-950 bg-neutral-50'
                    : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >

                <div>
                  <span className="text-xs font-bold text-neutral-900 block">
                    FedEx Priority Air
                  </span>

                  <span className="text-[11px] text-neutral-500">
                    1 - 2 Business Days
                  </span>
                </div>

                <span className="text-xs font-black text-neutral-950">
                  +$8.00
                </span>

              </button>

            </div>

          </div>

          {/* PAYMENT */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4 shadow-xs">

            <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">

              <div className="w-6 h-6 rounded-full bg-neutral-950 text-white flex items-center justify-center text-xs font-bold">
                3
              </div>

              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                Payment Option
              </h3>

            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">

              {[
                {
                  id: 'card',
                  label: 'Credit Card',
                  icon: CreditCard,
                },
                {
                  id: 'razorpay',
                  label: 'Razorpay / Net',
                  icon: Sparkles,
                },
                {
                  id: 'upi',
                  label: 'UPI / QR',
                  icon: Lock,
                },
                {
                  id: 'cod',
                  label: 'Cash On Delivery',
                  icon: Truck,
                },
              ].map((method) => (

                <button
                  key={method.id}
                  type="button"
                  onClick={() =>
                    setPaymentMethod(
                      method.id as PaymentMethod
                    )
                  }
                  className={`p-3 rounded-lg border-2 text-left transition-all flex flex-col items-center justify-center gap-1.5 ${
                    paymentMethod ===
                    method.id
                      ? 'border-neutral-950 bg-neutral-950 text-white shadow-xs'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
                  }`}
                >

                  <method.icon className="w-4 h-4" />

                  <span className="text-[11px] font-bold text-center">
                    {method.label}
                  </span>

                </button>

              ))}

            </div>

            {/* CARD */}
            {paymentMethod ===
              'card' && (

              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                    Card Number
                  </label>

                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(event) =>
                      setCardNumber(
                        event.target.value
                      )
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg font-mono focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                      Expiry Date
                    </label>

                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(event) =>
                        setCardExpiry(
                          event.target.value
                        )
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                      CVV
                    </label>

                    <input
                      type="password"
                      value={cardCvc}
                      onChange={(event) =>
                        setCardCvc(
                          event.target.value
                        )
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg font-mono focus:outline-none"
                    />
                  </div>

                </div>

              </div>
            )}

            {/* UPI */}
            {paymentMethod ===
              'upi' && (

              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">

                <label className="block text-[11px] font-bold text-neutral-600">
                  Virtual Payment Address (VPA)
                </label>

                <input
                  type="text"
                  value={upiId}
                  onChange={(event) =>
                    setUpiId(
                      event.target.value
                    )
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg font-mono focus:outline-none"
                />

              </div>
            )}

            {/* RAZORPAY */}
            {paymentMethod ===
              'razorpay' && (

              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">

                <div className="flex items-center gap-2 text-xs text-neutral-600">

                  <Sparkles className="w-4 h-4 text-neutral-900" />

                  <span>
                    Razorpay / Net Banking payment will
                    be processed securely.
                  </span>

                </div>

              </div>
            )}

            {/* COD */}
            {paymentMethod ===
              'cod' && (

              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">

                <div className="flex items-center gap-2 text-xs text-neutral-600">

                  <Truck className="w-4 h-4 text-neutral-900" />

                  <span>
                    Pay when your order is delivered.
                  </span>

                </div>

              </div>
            )}

          </div>

        </div>

        {/* RIGHT */}
        <div className="lg:col-span-4 space-y-4 sticky top-24">

          <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4 shadow-xs">

            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-3">
              Order Review ({cart.length}{' '}
              styles)
            </h3>

            {/* ITEMS */}
            <div className="max-h-48 overflow-y-auto space-y-2 divide-y divide-neutral-100 pr-1">

              {cart.map((item) => (

                <div
                  key={item.id}
                  className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs"
                >

                  <img
                    src={item.image || ''}
                    alt={item.name || 'Product'}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded object-cover border border-neutral-200 shrink-0"
                  />

                  <div className="flex-1 min-w-0">

                    <p className="font-semibold text-neutral-900 truncate">
                      {item.name}
                    </p>

                    <p className="text-[11px] text-neutral-400">
                      {item.size || 'Standard'}{' '}
                      • Qty{' '}
                      {Number(
                        item.quantity
                      ) || 1}
                    </p>

                  </div>

                  <span className="font-bold text-neutral-900 shrink-0">
                    $
                    {(
                      (Number(
                        item.price
                      ) || 0) *
                      (Number(
                        item.quantity
                      ) || 1)
                    ).toFixed(2)}
                  </span>

                </div>

              ))}

            </div>

            {/* CALCULATIONS */}
            <div className="space-y-2 text-xs text-neutral-600 border-t border-neutral-100 pt-3">

              <div className="flex justify-between">

                <span>
                  Subtotal
                </span>

                <span className="font-semibold text-neutral-900">
                  $
                  {(
                    Number(
                      subtotal
                    ) || 0
                  ).toFixed(2)}
                </span>

              </div>

              {Number(discount) >
                0 && (

                <div className="flex justify-between text-emerald-600 font-medium">

                  <span>
                    Discount
                    {appliedCoupon?.code
                      ? ` (${appliedCoupon.code})`
                      : ''}
                  </span>

                  <span>
                    -$
                    {(
                      Number(
                        discount
                      ) || 0
                    ).toFixed(2)}
                  </span>

                </div>
              )}

              <div className="flex justify-between">

                <span>
                  Shipping (
                  {deliveryMethod ===
                  'express'
                    ? 'Priority Air'
                    : 'Standard'}
                  )
                </span>

                <span className="font-semibold text-neutral-900">

                  {deliveryMethod ===
                  'express'
                    ? `$${(
                        (Number(
                          shippingFee
                        ) || 0) +
                        8
                      ).toFixed(2)}`
                    : Number(
                        shippingFee
                      ) === 0
                    ? 'FREE'
                    : `$${(
                        Number(
                          shippingFee
                        ) || 0
                      ).toFixed(2)}`}

                </span>

              </div>

              <div className="flex justify-between">

                <span>
                  Estimated Tax
                </span>

                <span className="font-semibold text-neutral-900">
                  $
                  {(
                    Number(tax) ||
                    0
                  ).toFixed(2)}
                </span>

              </div>

              <div className="border-t border-neutral-200 pt-3 flex justify-between items-baseline">

                <span className="text-sm font-bold text-neutral-900">
                  Total Due
                </span>

                <span className="text-xl font-black text-neutral-950">
                  $
                  {displayTotal.toFixed(
                    2
                  )}
                </span>

              </div>

            </div>

            {/* PLACE ORDER */}
            <button
              id="confirm-place-order-btn"
              type="button"
              disabled={
                placingOrder
              }
              onClick={
                handlePlaceOrder
              }
              className="w-full py-3.5 bg-neutral-950 hover:bg-neutral-800 disabled:bg-neutral-400 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
            >

              {placingOrder ? (

                <span>
                  Processing Order...
                </span>

              ) : (

                <>
                  <ShieldCheck className="w-4 h-4" />

                  <span>
                    Place Order • $
                    {displayTotal.toFixed(
                      2
                    )}
                  </span>
                </>

              )}

            </button>

            <p className="text-[10px] text-neutral-400 text-center leading-normal">
              By confirming, you agree to
              Sanu Builds Terms of Service
              and 30-Day Return Policy.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

/*
 * Standard shipping display helper.
 */
const baseShippingDisplay = (
  shipping: number
): string => {
  const value =
    Number(shipping) || 0;

  return value === 0
    ? 'FREE'
    : `$${value.toFixed(2)}`;
};
