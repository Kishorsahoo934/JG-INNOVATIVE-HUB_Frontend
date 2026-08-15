import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import EShopLayout from '../components/EShopLayout';
import SEO from '@/components/SEO';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { paymentsApi, deliveryApi, couponsApi, Address, Product } from '../services/api';
import { normalizeIndianMobile10, isValidIndianMobile10 } from '@/utils/phone';
import { isContactUs3dProduct } from '@/utils/productHelpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { calculateGstBreakdown, formatPrice } from '@/utils/price';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

const ADDRESS_REQUIRED_MSG = 'Please add or select a delivery address to continue.';
const PENDING_CHECKOUT_KEY = 'pendingCheckoutPayment';
const CHECKOUT_FORM_STATE_KEY = 'checkoutFormState';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState<{ product: Product; quantity: number } | null>(null);
  const [deliveryAgreement, setDeliveryAgreement] = useState(false);
  const [waitForCompletionAgreement, setWaitForCompletionAgreement] = useState(false);
  const [useAccountMobile, setUseAccountMobile] = useState(true);
  const [otherDeliveryMobile, setOtherDeliveryMobile] = useState('');
  const [stateCharges, setStateCharges] = useState<{ defaultShippingCharge: number } | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    finalPrice: number;
  } | null>(null);
  const [couponApplying, setCouponApplying] = useState(false);
  const [buyNowHydrated, setBuyNowHydrated] = useState(false);
  const [paymentUiLocked, setPaymentUiLocked] = useState(false);
  /** After Razorpay succeeds — keep full-screen lock until server verify + navigation (fixes mobile race). */
  const [isConfirmingOrder, setIsConfirmingOrder] = useState(false);
  const paymentInProgressRef = useRef(false);
  const popStateHandlerRef = useRef<(() => void) | null>(null);

  const loadRazorpay = () =>
    new Promise<void>((resolve, reject) => {
      if (window.Razorpay) return resolve();
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay'));
      document.body.appendChild(script);
    });

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CHECKOUT_FORM_STATE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as {
        selectedAddress?: string;
        deliveryAgreement?: boolean;
        waitForCompletionAgreement?: boolean;
        useAccountMobile?: boolean;
        otherDeliveryMobile?: string;
        couponInput?: string;
      };
      if (saved.selectedAddress) setSelectedAddress(saved.selectedAddress);
      if (typeof saved.deliveryAgreement === 'boolean') setDeliveryAgreement(saved.deliveryAgreement);
      if (typeof saved.waitForCompletionAgreement === 'boolean') setWaitForCompletionAgreement(saved.waitForCompletionAgreement);
      if (typeof saved.useAccountMobile === 'boolean') setUseAccountMobile(saved.useAccountMobile);
      if (typeof saved.otherDeliveryMobile === 'string') setOtherDeliveryMobile(saved.otherDeliveryMobile);
      if (typeof saved.couponInput === 'string') setCouponInput(saved.couponInput);
    } catch {
      sessionStorage.removeItem(CHECKOUT_FORM_STATE_KEY);
    }
  }, []);

  useEffect(() => {
    if (user?.addresses) {
      setAddresses(user.addresses);
      const hasCurrentSelected =
        Boolean(selectedAddress) && user.addresses.some((a) => a._id === selectedAddress);
      if (!hasCurrentSelected) {
        const defaultAddress = user.addresses.find((a) => a.isDefault) || user.addresses[0];
        setSelectedAddress(defaultAddress?._id || '');
      }
    } else if (user && Array.isArray(user.addresses)) {
      setAddresses([]);
      setSelectedAddress('');
    }
  }, [user, selectedAddress]);

  useEffect(() => {
    sessionStorage.setItem(
      CHECKOUT_FORM_STATE_KEY,
      JSON.stringify({
        selectedAddress,
        deliveryAgreement,
        waitForCompletionAgreement,
        useAccountMobile,
        otherDeliveryMobile,
        couponInput,
      })
    );
  }, [
    selectedAddress,
    deliveryAgreement,
    waitForCompletionAgreement,
    useAccountMobile,
    otherDeliveryMobile,
    couponInput,
  ]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('buyNowItem');
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as { product: Product; quantity: number };
          if (parsed?.product && parsed?.quantity) {
            setBuyNowItem(parsed);
          }
        } catch {
          sessionStorage.removeItem('buyNowItem');
        }
      }
    } finally {
      setBuyNowHydrated(true);
    }
  }, []);

  /** Cart always wins over a stale Buy now session when both exist */
  useEffect(() => {
    if (items.length > 0 && buyNowItem) {
      sessionStorage.removeItem('buyNowItem');
      setBuyNowItem(null);
    }
  }, [items.length, buyNowItem]);

  const detachPaymentPopstateGuard = useCallback(() => {
    const h = popStateHandlerRef.current;
    if (h) {
      window.removeEventListener('popstate', h);
      popStateHandlerRef.current = null;
    }
  }, []);

  const clearPaymentHistoryGuard = useCallback(() => {
    const hadGuard = Boolean(popStateHandlerRef.current);
    detachPaymentPopstateGuard();
    if (hadGuard) window.history.back();
  }, [detachPaymentPopstateGuard]);

  const releaseCheckoutPayment = useCallback(() => {
    paymentInProgressRef.current = false;
    setPaymentUiLocked(false);
    setIsConfirmingOrder(false);
    setIsPlacingOrder(false);
    clearPaymentHistoryGuard();
  }, [clearPaymentHistoryGuard]);

  useEffect(() => {
    return () => detachPaymentPopstateGuard();
  }, [detachPaymentPopstateGuard]);

  const paymentOverlayActive = isPlacingOrder || paymentUiLocked || isConfirmingOrder;

  useEffect(() => {
    if (!paymentOverlayActive) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [paymentOverlayActive]);

  const selectedAddr = addresses.find((a) => a._id === selectedAddress);
  const addressState = selectedAddr?.state || '';

  useEffect(() => {
    if (!addressState) {
      setStateCharges(null);
      return;
    }
    deliveryApi.getStateCharges(addressState).then((data) => {
      setStateCharges({
        defaultShippingCharge: data.defaultShippingCharge ?? 0,
      });
    }).catch(() => setStateCharges({ defaultShippingCharge: 0 }));
  }, [addressState]);

  const normalizedProfileMobile = useMemo(
    () => normalizeIndianMobile10(user?.mobile || ''),
    [user?.mobile]
  );
  const hasProfileMobile = Boolean(user && isValidIndianMobile10(normalizedProfileMobile));

  useEffect(() => {
    if (hasProfileMobile) {
      setUseAccountMobile(true);
    } else {
      setUseAccountMobile(false);
    }
  }, [hasProfileMobile]);

  const usingBuyNowCheckout = items.length === 0 && buyNowItem != null;
  const checkoutItems = usingBuyNowCheckout
    ? [{ product: buyNowItem!.product, quantity: buyNowItem!.quantity }]
    : items;
  const checkoutSubtotal = usingBuyNowCheckout
    ? buyNowItem!.product.price * buyNowItem!.quantity
    : totalPrice;
  const breakdown = useMemo(() => calculateGstBreakdown(checkoutSubtotal), [checkoutSubtotal]);
  const shippingCharge = stateCharges?.defaultShippingCharge ?? 0;
  const totalWithShipping = Math.round((breakdown.total + shippingCharge) * 100) / 100;

  const payableTotal = appliedCoupon ? appliedCoupon.finalPrice : totalWithShipping;

  useEffect(() => {
    setAppliedCoupon(null);
  }, [totalWithShipping]);

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) {
      toast({ title: 'Coupon', description: 'Enter a coupon code.', variant: 'destructive' });
      return;
    }
    try {
      setCouponApplying(true);
      const res = await couponsApi.apply({
        coupon_code: code,
        order_total: totalWithShipping,
      });
      setAppliedCoupon({
        code: code.trim(),
        discountAmount: res.discount_amount,
        finalPrice: res.final_price,
      });
      toast({ title: 'Coupon applied', description: res.message });
    } catch (e) {
      setAppliedCoupon(null);
      toast({
        title: 'Coupon not applied',
        description: e instanceof Error ? e.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setCouponApplying(false);
    }
  };

  const normalizedOtherMobile = normalizeIndianMobile10(otherDeliveryMobile);
  const deliveryContactDigits =
    hasProfileMobile && useAccountMobile ? normalizedProfileMobile : normalizedOtherMobile;
  const deliveryContactOk = deliveryAgreement && isValidIndianMobile10(deliveryContactDigits);

  useEffect(() => {
    if (!buyNowHydrated || !user || paymentInProgressRef.current) return;
    const raw = sessionStorage.getItem(PENDING_CHECKOUT_KEY);
    if (!raw) return;
    let pending: {
      createdAt: number;
      razorpayOrderId: string;
      payload: {
        products: Array<{ productId: string; qty: number }>;
        address: Address;
        deliveryAgreement: boolean;
        deliveryMobileNumber: string;
        couponCode?: string;
      };
      summary: {
        subtotal: number;
        gstAmount: number;
        deliveryCharge: number;
        couponDiscount: number;
        total: number;
      };
      hadContactUsOrder: boolean;
      wasBuyNow: boolean;
    } | null = null;
    try {
      pending = JSON.parse(raw);
    } catch {
      sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
      return;
    }
    if (!pending?.razorpayOrderId || !pending?.payload) {
      sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
      return;
    }
    if (Date.now() - Number(pending.createdAt || 0) > 1000 * 60 * 90) {
      sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
      return;
    }

    let cancelled = false;
    const recover = async () => {
      paymentInProgressRef.current = true;
      setIsPlacingOrder(true);
      setPaymentUiLocked(true);
      setIsConfirmingOrder(true);
      try {
        const verify = await paymentsApi.reconcileRazorpayOrder({
          razorpay_order_id: pending!.razorpayOrderId,
          ...pending!.payload,
        });
        if (cancelled) return;
        if (verify?.success && verify.data) {
          const orderId = (verify.data as { orderId?: string }).orderId;
          sessionStorage.setItem(
            'lastOrderSummary',
            JSON.stringify({
              ...pending!.summary,
              orderId: orderId ? String(orderId) : undefined,
            })
          );
          if (pending!.hadContactUsOrder) sessionStorage.setItem('orderForContactUs', '1');
          if (pending!.wasBuyNow) {
            sessionStorage.removeItem('buyNowItem');
            setBuyNowItem(null);
          } else {
            clearCart();
          }
          sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
          paymentInProgressRef.current = false;
          detachPaymentPopstateGuard();
          navigate('/order-success', { replace: true, state: verify.data });
          return;
        }
      } catch {
        // Not captured yet or failed — drop stale pending record so user can retry fresh.
        sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
      }
      if (cancelled) return;
      releaseCheckoutPayment();
    };
    void recover();

    return () => {
      cancelled = true;
    };
  }, [buyNowHydrated, user, clearCart, detachPaymentPopstateGuard, navigate, releaseCheckoutPayment]);

  const handlePlaceOrder = async () => {
    if (paymentInProgressRef.current) return;
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`, { replace: true });
      return;
    }
    const address = addresses.find((a) => a._id === selectedAddress);
    if (!address || !selectedAddress) {
      toast({ title: 'Address required', description: ADDRESS_REQUIRED_MSG, variant: 'destructive' });
      return;
    }
    if (!deliveryAgreement) {
      toast({
        title: 'Confirmation required',
        description: 'Confirm your delivery mobile and the notice about incorrect numbers.',
        variant: 'destructive',
      });
      return;
    }
    if (!waitForCompletionAgreement) {
      toast({
        title: 'Confirmation required',
        description: 'Please confirm that you will wait until automatic redirect to the order page after payment.',
        variant: 'destructive',
      });
      return;
    }
    if (!isValidIndianMobile10(deliveryContactDigits)) {
      toast({
        title: 'Delivery mobile',
        description: hasProfileMobile && useAccountMobile
          ? 'Your account does not have a valid mobile. Use another number or update your profile.'
          : 'Enter a valid 10-digit Indian mobile for delivery contact.',
        variant: 'destructive',
      });
      return;
    }
    for (const item of checkoutItems) {
      if (item.product.stock > 0 && item.quantity > item.product.stock) {
        toast({ title: 'Not enough stock', description: `Reduce quantity for ${item.product.name}.`, variant: 'destructive' });
        return;
      }
    }
    try {
      paymentInProgressRef.current = true;
      setIsPlacingOrder(true);
      await loadRazorpay();
      const payload = {
        products: checkoutItems.map(({ product, quantity }) => ({
          productId: product._id,
          qty: quantity,
        })),
        address,
        deliveryAgreement: true,
        deliveryMobileNumber: deliveryContactDigits,
        ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
      };
      const res = await paymentsApi.createRazorpayOrder(payload);
      if (!res.success || !res.data) {
        const err = (res as { message?: string }).message;
        if (err) toast({ title: 'Error', description: err, variant: 'destructive' });
        releaseCheckoutPayment();
        return;
      }

      const totalPayableLabel = formatPrice(res.data.totalAmount ?? payableTotal);
      const hadContactUsOrder = checkoutItems.some((item) => isContactUs3dProduct(item.product));
      sessionStorage.setItem(
        PENDING_CHECKOUT_KEY,
        JSON.stringify({
          createdAt: Date.now(),
          razorpayOrderId: res.data.orderId,
          payload,
          summary: {
            subtotal: breakdown.subtotal,
            gstAmount: breakdown.gstAmount,
            deliveryCharge: shippingCharge,
            couponDiscount: appliedCoupon?.discountAmount ?? 0,
            total: res.data.totalAmount ?? payableTotal,
          },
          hadContactUsOrder,
          wasBuyNow: items.length === 0,
        })
      );
      window.history.pushState({ checkoutPaymentGuard: 1 }, '');
      const onPopState = () => {
        if (!paymentInProgressRef.current) return;
        window.history.pushState({ checkoutPaymentGuard: 1 }, '');
      };
      popStateHandlerRef.current = onPopState;
      window.addEventListener('popstate', onPopState);
      setPaymentUiLocked(true);

      const options = {
        key: res.data.keyId,
        amount: res.data.amount,
        currency: res.data.currency,
        order_id: res.data.orderId,
        name: 'Innovative Hub',
        description: `Order Payment • Total Payable ₹${totalPayableLabel}`,
        notes: {
          totalPayable: `₹${totalPayableLabel}`,
        },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          setIsConfirmingOrder(true);
          const verifyBody = {
            ...response,
            products: payload.products,
            address: payload.address,
            deliveryAgreement: payload.deliveryAgreement,
            deliveryMobileNumber: payload.deliveryMobileNumber,
            ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
          };
          let verify: Awaited<ReturnType<typeof paymentsApi.verifyRazorpayPayment>> | null = null;
          try {
            let lastErr: unknown;
            for (let attempt = 0; attempt < 3; attempt++) {
              try {
                verify = await paymentsApi.verifyRazorpayPayment(verifyBody);
                break;
              } catch (e) {
                lastErr = e;
                if (attempt < 2) await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
              }
            }
            if (!verify && lastErr) throw lastErr;
          } catch (err) {
            console.error('Payment verification failed:', err);
            toast({
              title: 'Could not confirm order',
              description:
                err instanceof Error
                  ? err.message
                  : 'Payment may have succeeded. Check My orders or contact support if money was debited.',
              variant: 'destructive',
            });
            releaseCheckoutPayment();
            return;
          }
          if (verify?.success && verify.data) {
            sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
            const orderId = (verify.data as { orderId?: string }).orderId;
            sessionStorage.setItem(
              'lastOrderSummary',
              JSON.stringify({
                subtotal: breakdown.subtotal,
                gstAmount: breakdown.gstAmount,
                deliveryCharge: shippingCharge,
                couponDiscount: appliedCoupon?.discountAmount ?? 0,
                total: res.data.totalAmount ?? payableTotal,
                orderId: orderId ? String(orderId) : undefined,
              })
            );
            if (hadContactUsOrder) sessionStorage.setItem('orderForContactUs', '1');
            if (items.length === 0) {
              sessionStorage.removeItem('buyNowItem');
              setBuyNowItem(null);
            } else {
              clearCart();
            }
            paymentInProgressRef.current = false;
            detachPaymentPopstateGuard();
            navigate('/order-success', { replace: true, state: verify.data });
            return;
          }
          toast({
            title: 'Could not confirm order',
            description: 'Please check My orders or contact support if payment was deducted.',
            variant: 'destructive',
          });
          releaseCheckoutPayment();
        },
        modal: {
          ondismiss: async () => {
            sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
            await paymentsApi.reportFailure({ reason: 'Checkout dismissed' });
            releaseCheckoutPayment();
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', async (resp: { error?: { description?: string } }) => {
        sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
        await paymentsApi.reportFailure({ reason: resp?.error?.description || 'Payment failed' });
        releaseCheckoutPayment();
      });
      razorpay.open();
    } catch (error) {
      console.error('Failed to place order:', error);
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to place order', variant: 'destructive' });
      releaseCheckoutPayment();
    }
  };

  if (buyNowHydrated && checkoutItems.length === 0) {
    return (
      <EShopLayout hideSearch>
        <SEO title="Checkout" description="Complete your order at Innovative Hub." path="/checkout" noIndex />
        <div className="container mx-auto px-3 sm:px-4 py-12 text-center">
          <p className="text-muted-foreground mb-4">No checkout items found right now.</p>
          <Link to="/cart" className="text-primary hover:underline font-medium">
            Go to cart
          </Link>
        </div>
      </EShopLayout>
    );
  }

  if (!buyNowHydrated) {
    return (
      <EShopLayout hideSearch>
        <SEO title="Checkout" description="Complete your order at Innovative Hub." path="/checkout" noIndex />
        <div className="container mx-auto px-3 sm:px-4 py-12 flex justify-center">
          <p className="text-muted-foreground">Loading checkout…</p>
        </div>
      </EShopLayout>
    );
  }

  return (
    <EShopLayout hideSearch>
      <SEO title="Checkout" description="Complete your order at Innovative Hub." path="/checkout" noIndex />
      {paymentOverlayActive && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-3 bg-background/90 backdrop-blur-sm px-4 touch-none overscroll-none"
          style={{ overscrollBehavior: 'none' }}
          role="alertdialog"
          aria-busy="true"
          aria-live="polite"
          aria-label={isConfirmingOrder ? 'Confirming order' : 'Payment in progress'}
        >
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent shrink-0" />
          <p className="text-sm font-medium text-foreground text-center max-w-md leading-relaxed">
            {isConfirmingOrder ? (
              <>
                Do not press back or leave this screen. We are confirming your order with the server — this can take a
                minute on slow networks.
              </>
            ) : paymentUiLocked ? (
              'Complete payment in the secure window. Do not close this tab.'
            ) : (
              'Preparing secure checkout…'
            )}
          </p>
        </div>
      )}
      <div className="container mx-auto px-3 sm:px-4 pt-2 lg:pt-3 pb-8 sm:pb-12 max-w-full">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-6 sm:mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Address Selection */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">Delivery Address</h2>
              {!selectedAddress && addresses.length > 0 && (
                <p className="text-sm text-destructive mb-3" role="alert">
                  {ADDRESS_REQUIRED_MSG}
                </p>
              )}
              {addresses.length === 0 && (
                <p className="text-sm text-muted-foreground mb-3">You will be redirected to add an address.</p>
              )}
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label key={addr._id} className={`flex flex-col sm:flex-row gap-3 p-4 min-h-[52px] border rounded-lg cursor-pointer transition-colors touch-manipulation ${selectedAddress === addr._id ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <input type="radio" name="address" checked={selectedAddress === addr._id} onChange={() => setSelectedAddress(addr._id)} className="mt-1 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">{addr.fullName}</p>
                      <p className="text-sm text-muted-foreground">{addr.addressLine1}, {addr.addressLine2}</p>
                      <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="text-sm text-muted-foreground">{addr.mobile}</p>
                    </div>
                  </label>
                ))}
                <Link
                  to={`/account?tab=addresses&returnTo=${encodeURIComponent('/checkout')}`}
                  className="block text-sm text-primary hover:underline mt-2"
                >
                  Add new address
                </Link>
              </div>
            </div>

            {/* Delivery contact & shipping notice */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">Delivery contact</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Shipping cost is set from your selected address&apos;s state using the rates configured in admin (included in your total below).
              </p>
              <div className="space-y-4">
                {hasProfileMobile ? (
                  <>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="deliveryMobileChoice"
                        checked={useAccountMobile}
                        onChange={() => setUseAccountMobile(true)}
                        className="mt-1 shrink-0"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">Use mobile from my account (default)</p>
                        <p className="text-sm text-muted-foreground">Ending in …{normalizedProfileMobile.slice(-4)}</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="deliveryMobileChoice"
                        checked={!useAccountMobile}
                        onChange={() => setUseAccountMobile(false)}
                        className="mt-1 shrink-0"
                      />
                      <div className="flex-1 min-w-0 space-y-2">
                        <p className="text-sm font-medium text-foreground">Use a different number for this order only</p>
                        {!useAccountMobile && (
                          <div className="max-w-xs">
                            <Label htmlFor="checkout-delivery-mobile" className="sr-only">
                              Mobile for this order
                            </Label>
                            <Input
                              id="checkout-delivery-mobile"
                              type="tel"
                              inputMode="numeric"
                              autoComplete="tel"
                              placeholder="10-digit mobile"
                              value={otherDeliveryMobile}
                              onChange={(e) => setOtherDeliveryMobile(e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    </label>
                  </>
                ) : (
                  <div className="space-y-2 max-w-xs">
                    <Label htmlFor="checkout-delivery-mobile">Mobile for delivery updates</Label>
                    <Input
                      id="checkout-delivery-mobile"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="10-digit mobile"
                      value={otherDeliveryMobile}
                      onChange={(e) => setOtherDeliveryMobile(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Add a mobile to your account in settings to pre-fill this next time.
                    </p>
                  </div>
                )}
                <p className="text-sm text-amber-800 dark:text-amber-200/90 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900 rounded-lg p-3">
                  Provide a correct number you actively use. Wrong or unreachable numbers may delay or cancel delivery. Payments may be non-refundable in such cases per our policy.
                </p>
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="delivery-agreement"
                    checked={deliveryAgreement}
                    onCheckedChange={(v) => setDeliveryAgreement(v === true)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="delivery-agreement" className="text-sm cursor-pointer leading-snug">
                    I confirm this mobile is correct for delivery contact and I understand incorrect details may affect delivery and refunds.
                  </Label>
                </div>
              </div>
            </div>

            {/* Coupon */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">Coupon</h2>
              <p className="text-sm text-muted-foreground mb-3">
                Have a code? Apply it here. If your order total changes, you will need to apply it again.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Label htmlFor="checkout-coupon" className="sr-only">
                  Enter Coupon Code
                </Label>
                <Input
                  id="checkout-coupon"
                  placeholder="Enter Coupon Code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="sm:flex-1"
                  disabled={couponApplying}
                  autoComplete="off"
                />
                <div className="flex gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleApplyCoupon}
                    disabled={couponApplying || !couponInput.trim()}
                    className="min-w-[88px]"
                  >
                    {couponApplying ? 'Applying…' : 'Apply'}
                  </Button>
                  {appliedCoupon && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setAppliedCoupon(null);
                        toast({ title: 'Coupon removed' });
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
              {appliedCoupon && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-3" role="status">
                  You save ₹{formatPrice(appliedCoupon.discountAmount)} — new total ₹{formatPrice(appliedCoupon.finalPrice)}.
                </p>
              )}
            </div>

            {/* Payment */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">Payment Method</h2>
              <div className="p-4 border border-primary rounded-lg bg-primary/5">
                <p className="font-medium text-foreground">Razorpay</p>
                <p className="text-sm text-muted-foreground">Pay securely via UPI, Cards, Net Banking</p>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 h-fit">
            <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {checkoutItems.map(({ product, quantity }) => (
                <div key={product._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm">
                  <span className="text-muted-foreground">{product.name.substring(0, 30)}... x{quantity}</span>
                  <span>₹{formatPrice(product.price * quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4 mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Subtotal (Excluding GST)</span>
                <span>₹{formatPrice(breakdown.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>GST @18%</span>
                <span>₹{formatPrice(breakdown.gstAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Shipping (by state)</span>
                <span>₹{formatPrice(shippingCharge)}</span>
              </div>
              {appliedCoupon && appliedCoupon.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400 mb-2">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span>−₹{formatPrice(appliedCoupon.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold">
                <span>Total Payable</span>
                <span className="text-primary">₹{formatPrice(payableTotal)}</span>
              </div>
            </div>
            {!selectedAddress && (
              <p className="text-sm text-destructive mb-3" role="alert">
                {ADDRESS_REQUIRED_MSG}
              </p>
            )}
            <div className="mb-3 rounded-lg border border-amber-300/70 bg-amber-50/70 dark:bg-amber-950/30 dark:border-amber-800 px-3 py-2.5">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                Mandatory payment completion confirmation
              </p>
              <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
                I WILL WAIT TILL COMPLETE PAYMENT PROCESS UNTIL IT AUTOMATIC BRING TO ORDER PAGE OF WEBSITE OTHER WISE PAYMENT GET FAILED MAY NOT BE REFUNDABLE.
              </p>
              <div className="mt-2 flex items-start gap-2">
                <Checkbox
                  id="wait-for-completion-agreement"
                  checked={waitForCompletionAgreement}
                  onCheckedChange={(v) => setWaitForCompletionAgreement(v === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="wait-for-completion-agreement" className="text-xs sm:text-sm cursor-pointer leading-snug">
                  I understand and I will wait until the order-success page opens automatically.
                </Label>
              </div>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || !selectedAddress || !deliveryContactOk || !waitForCompletionAgreement}
              aria-busy={isPlacingOrder}
              aria-disabled={!selectedAddress || !deliveryContactOk || !waitForCompletionAgreement}
            >
              {isPlacingOrder ? 'Processing...' : 'Place Order'}
            </Button>
          </div>
        </div>
      </div>
    </EShopLayout>
  );
};

export default CheckoutPage;
