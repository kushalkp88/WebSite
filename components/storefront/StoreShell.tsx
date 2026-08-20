"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useState } from "react";
import { CartDrawer } from "./CartDrawer";
import { Header } from "./Header";
import { Ticker } from "./Ticker";
import { WishlistDrawer } from "./WishlistDrawer";
import { Sparkles, Shield, Check } from "lucide-react";

export function StoreShell({
  overlayHeader = false,
  children,
}: {
  overlayHeader?: boolean;
  children: ReactNode;
}) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  }

  return (
    <div className="min-h-svh bg-white text-zinc-900 selection:bg-emerald-500 selection:text-white flex flex-col justify-between">
      {/* Sticky Header Bar */}
      <div className="sticky top-0 z-50">
        <Ticker />
        <Header overlay={overlayHeader} />
      </div>

      {/* Main Page Body */}
      <main className="flex-1">{children}</main>

      {/* VIP Club Newsletter Banner */}
      <section className="border-t border-zinc-200 bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>JOIN THE VEIRDO CLUB</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 uppercase">
            Unlock 10% Off Your First Order
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto">
            Get private access to secret drop restocks, artist capsules, and member-only discounts.
          </p>

          {subscribed ? (
            <div className="inline-flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold animate-fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>You&apos;re subscribed! Use code &ldquo;VEIRDO10&rdquo; at checkout.</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletter} className="mt-5 flex max-w-md mx-auto gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="flex-1 rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-500 shadow-2xs"
              />
              <button
                type="submit"
                className="rounded-full px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-zinc-900 hover:bg-black transition-all cursor-pointer shrink-0 shadow-2xs"
              >
                Join Club
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Clean White Footer */}
      <footer className="border-t border-zinc-200 bg-white px-6 py-12 text-xs text-zinc-600">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-black tracking-tighter text-emerald-600 font-[family-name:var(--font-geist-sans)]">
                VEIRDO<span className="text-zinc-900">.</span>
              </span>
            </Link>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Online fashion store for trending men&apos;s streetwear. High quality oversized t-shirts, sweatshirts, hoodies & joggers.
            </p>
            <p className="text-[11px] text-zinc-400">
              © {new Date().getFullYear()} VEIRDO Apparel. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <p className="font-bold uppercase tracking-widest text-zinc-900 text-xs">
              Collections
            </p>
            <ul className="space-y-2 text-xs text-zinc-600">
              <li><Link href="/?category=Oversized#catalog" className="hover:text-black transition-colors">Oversized Tees</Link></li>
              <li><Link href="/?category=Acid%20Wash#catalog" className="hover:text-black transition-colors">Acid Wash Drops</Link></li>
              <li><Link href="/?category=Heavyweight#catalog" className="hover:text-black transition-colors">240 GSM Heavyweight</Link></li>
              <li><Link href="/?badge=BEST%20SELLER#catalog" className="hover:text-black transition-colors">Best Sellers</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <p className="font-bold uppercase tracking-widest text-zinc-900 text-xs">
              Customer Care
            </p>
            <ul className="space-y-2 text-xs text-zinc-600">
              <li><span className="hover:text-black cursor-pointer">Track Your Order</span></li>
              <li><span className="hover:text-black cursor-pointer">Shipping & Returns</span></li>
              <li><span className="hover:text-black cursor-pointer">Size Guide & Fit</span></li>
              <li><span className="hover:text-black cursor-pointer">Contact Support</span></li>
            </ul>
          </div>

          {/* Admin */}
          <div className="space-y-3">
            <p className="font-bold uppercase tracking-widest text-zinc-900 text-xs">
              Store Admin
            </p>
            <p className="text-xs text-zinc-500">
              Manage inventory, prices, products, and live storefront theme.
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-bold text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all shadow-2xs"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Open Admin Center</span>
            </Link>
          </div>
        </div>
      </footer>

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <WishlistDrawer />
    </div>
  );
}
