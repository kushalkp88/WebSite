"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useState } from "react";
import { CartDrawer } from "./CartDrawer";
import { Header } from "./Header";
import { WishlistDrawer } from "./WishlistDrawer";
import { Sparkles, Check } from "lucide-react";

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
        <Header overlay={overlayHeader} />
      </div>

      {/* Main Page Body */}
      <main className="flex-1">{children}</main>

      {/* VIP Club Newsletter Banner */}
      <section className="border-t border-zinc-200 bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>JOIN THE UNHINGED CLUB</span>
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
              <span>You&apos;re subscribed! Use code &ldquo;UNHINGED10&rdquo; at checkout.</span>
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
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          {/* Left Brand Description Col */}
          <div className="space-y-3 md:col-span-1">
            <p className="font-bold uppercase tracking-widest text-zinc-900 text-xs">
              About UNHINGED
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Online fashion store for trending men&apos;s streetwear. High quality oversized t-shirts, sweatshirts, hoodies & joggers.
            </p>
            <p className="text-[11px] text-zinc-400 pt-1">
              © {new Date().getFullYear()} UNHINGED Apparel. All rights reserved.
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

          {/* Right Bottom Logo Col */}
          <div className="md:col-span-1 flex flex-col md:items-end justify-start">
            <Link href="/" className="inline-block">
              <img
                src="/unhinged-logo.png"
                alt="Unhinged"
                className="h-9 sm:h-12 w-auto object-contain hover:opacity-90 transition-opacity"
              />
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
