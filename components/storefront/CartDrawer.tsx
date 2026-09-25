"use client";

import { useState, useSyncExternalStore } from "react";
import { Minus, Plus, Trash2, X, ShoppingBag, Truck, Sparkles, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatInr } from "@/lib/product";
import { useShop } from "@/lib/cart-store";

const FREE_SHIPPING_THRESHOLD = 999;

export function CartDrawer() {
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const open = useShop((s) => s.bagOpen);
  const close = useShop((s) => s.closeBag);
  const cart = useShop((s) => s.cart);
  const setQty = useShop((s) => s.setQty);
  const remove = useShop((s) => s.removeFromCart);
  const clearCart = useShop((s) => s.clearCart);
  
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderNumber: string;
    totalAmount: number;
    subtotal: number;
    discountAmount: number;
    shippingFee: number;
  } | null>(null);

  if (!isHydrated) return null;

  const subtotal = cart.reduce((n, i) => n + i.price * i.qty, 0);
  const discountAmount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const finalTotal = subtotal - discountAmount;

  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const hasOutOfStockItem = cart.some((i) => i.maxStock <= 0);

  function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    const clean = coupon.trim().toUpperCase();
    if (clean === "INK10" || clean === "UNHINGED10" || clean === "DROP10") {
      setCouponApplied(true);
      setCouponError("");
    } else {
      setCouponError("Invalid code. Try 'UNHINGED10'");
    }
  }

  async function handleCheckout() {
    if (cart.length === 0 || isCheckingOut || hasOutOfStockItem) return;
    setIsCheckingOut(true);
    setCheckoutError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((i) => ({
            productId: i.productId,
            size: i.size,
            qty: i.qty,
          })),
          couponCode: couponApplied ? coupon : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Checkout transaction failed.");
      }

      clearCart();
      setConfirmedOrder({
        orderNumber: data.orderNumber,
        totalAmount: data.totalAmount,
        subtotal: data.subtotal,
        discountAmount: data.discountAmount,
        shippingFee: data.shippingFee,
      });
    } catch (err: unknown) {
      setCheckoutError(err instanceof Error ? err.message : "Checkout failed. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <div
      className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={close}
      />

      {/* Drawer Panel */}
      <aside
        role="dialog"
        aria-label="Shopping Bag"
        className={`absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-white text-zinc-900 shadow-2xl border-l border-zinc-200 transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 bg-zinc-50">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-zinc-700" />
            <h2 className="text-sm font-black tracking-[0.2em] uppercase text-zinc-900">
              {confirmedOrder ? "ORDER RECEIPT" : `MY BAG (${cart.reduce((a, b) => a + b.qty, 0)})`}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              if (confirmedOrder) setConfirmedOrder(null);
              close();
            }}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-black hover:bg-zinc-200 transition-colors cursor-pointer"
            aria-label="Close bag"
          >
            <X size={20} />
          </button>
        </div>

        {/* Confirmed Order Success View */}
        {confirmedOrder ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900">
                Order Confirmed!
              </h3>
              <p className="text-xs text-zinc-500">
                Your inventory has been atomically secured and reserved.
              </p>
            </div>

            <div className="w-full rounded-2xl bg-zinc-50 border border-zinc-200 p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Order ID:</span>
                <span className="font-mono font-bold text-zinc-900">{confirmedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Subtotal:</span>
                <span className="font-semibold text-zinc-900">{formatInr(confirmedOrder.subtotal)}</span>
              </div>
              {confirmedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span>-{formatInr(confirmedOrder.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-zinc-500">Shipping:</span>
                <span className="text-zinc-900">{confirmedOrder.shippingFee === 0 ? "FREE" : formatInr(confirmedOrder.shippingFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-zinc-900 pt-2 border-t border-zinc-200">
                <span>Total Paid:</span>
                <span>{formatInr(confirmedOrder.totalAmount)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setConfirmedOrder(null);
                close();
              }}
              className="w-full py-3.5 rounded-full text-xs font-black uppercase tracking-wider text-white bg-zinc-900 hover:bg-black transition-all cursor-pointer shadow-md"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Free Shipping Progress Bar */}
            <div className="border-b border-zinc-200 bg-emerald-50/60 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>
                    {remainingForFree === 0 ? (
                      <span className="text-emerald-700 font-bold">
                        You unlocked FREE Express Delivery! 🎉
                      </span>
                    ) : (
                      <span className="text-zinc-700">
                        Add <strong className="text-zinc-900">{formatInr(remainingForFree)}</strong> more for <strong>FREE Delivery</strong>
                      </span>
                    )}
                  </span>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono">{progressPercent}%</span>
              </div>

              <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Cart Item List */}
            {cart.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-base font-bold text-zinc-900">Your bag is currently empty</p>
                  <p className="mt-1 text-xs text-zinc-500 max-w-xs">
                    Browse our latest heavyweight oversized tees and graphic drops to add your first piece.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider text-white bg-zinc-900 hover:bg-black transition-all cursor-pointer shadow-md"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              <>
                <ul className="flex-1 space-y-4 overflow-y-auto p-6 divide-y divide-zinc-100">
                  {cart.map((item) => (
                    <li key={`${item.productId}-${item.size}`} className="pt-4 first:pt-0 flex gap-4">
                      {/* Thumbnail */}
                      <div className="aspect-[3/4] h-24 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover object-top"
                        />
                      </div>

                      {/* Details */}
                      <div className="min-w-0 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/product/${item.slug}`}
                              onClick={close}
                              className="font-bold text-sm text-zinc-900 hover:text-emerald-600 line-clamp-1"
                            >
                              {item.title}
                            </Link>
                            <button
                              type="button"
                              className="text-zinc-400 hover:text-red-500 p-1 cursor-pointer"
                              onClick={() => remove(item.productId, item.size)}
                              title="Remove item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[11px] font-bold bg-zinc-100 border border-zinc-200 text-zinc-700 px-2 py-0.5 rounded">
                              Size: {item.size}
                            </span>
                            <span className="text-xs font-bold text-zinc-900">
                              {formatInr(item.price)}
                            </span>
                          </div>

                          {item.maxStock <= 0 ? (
                            <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1">
                              <AlertCircle size={11} /> Out of stock in size {item.size}
                            </p>
                          ) : item.qty > item.maxStock ? (
                            <p className="text-[10px] font-bold text-amber-600 mt-1">
                              ⚠️ Only {item.maxStock} available
                            </p>
                          ) : null}
                        </div>

                        {/* Stepper */}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2 border border-zinc-300 bg-white rounded-lg p-0.5">
                            <button
                              type="button"
                              className="p-1 rounded text-zinc-500 hover:text-black hover:bg-zinc-100 cursor-pointer"
                              onClick={() =>
                                setQty(item.productId, item.size, item.qty - 1)
                              }
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-6 text-center text-xs font-mono font-bold text-zinc-900">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              className="p-1 rounded text-zinc-500 hover:text-black hover:bg-zinc-100 disabled:opacity-30 cursor-pointer"
                              disabled={item.qty >= item.maxStock}
                              onClick={() =>
                                setQty(item.productId, item.size, item.qty + 1)
                              }
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <span className="text-xs font-bold text-zinc-900">
                            {formatInr(item.price * item.qty)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Bottom Summary Section */}
                <div className="border-t border-zinc-200 bg-zinc-50 p-6 space-y-4">
                  {/* Checkout Error Banner */}
                  {checkoutError && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold animate-shake">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                      <span>{checkoutError}</span>
                    </div>
                  )}

                  {/* Promo code */}
                  <form onSubmit={applyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo Code (try UNHINGED10)"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      className="flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 uppercase font-mono outline-none focus:border-zinc-500"
                    />
                    <button
                      type="submit"
                      className="rounded-xl border border-zinc-300 bg-zinc-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-black transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>

                  {couponError && <p className="text-[11px] text-red-500">{couponError}</p>}
                  {couponApplied && (
                    <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> 10% First Drop Discount Applied!
                    </p>
                  )}

                  <div className="space-y-1.5 text-xs text-zinc-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-zinc-900">{formatInr(subtotal)}</span>
                    </div>
                    {couponApplied && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Coupon Discount</span>
                        <span>-{formatInr(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span className={remainingForFree === 0 ? "text-emerald-600 font-semibold" : "text-zinc-900"}>
                        {remainingForFree === 0 ? "FREE" : "₹99"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-zinc-900 pt-2 border-t border-zinc-200">
                      <span>Total</span>
                      <span>{formatInr(finalTotal + (remainingForFree === 0 ? 0 : 99))}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={isCheckingOut || hasOutOfStockItem || cart.length === 0}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-xs font-black tracking-[0.2em] text-white bg-zinc-900 hover:bg-black uppercase shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>SECURING YOUR DROP...</span>
                      </>
                    ) : hasOutOfStockItem ? (
                      <span>REMOVE OUT-OF-STOCK ITEMS</span>
                    ) : (
                      <>
                        <span>PROCEED TO CHECKOUT</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400 uppercase tracking-widest">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>256-Bit SSL Encrypted Checkout</span>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </aside>
    </div>
  );
}

