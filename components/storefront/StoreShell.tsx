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
    <div className="min-h-svh bg-[var(--bg-primary,#0a0a0a)] text-white selection:bg-amber-400 selection:text-black flex flex-col justify-between">
      {/* Sticky Header Bar */}
      <div className="sticky top-0 z-50">
        <Ticker />
        <Header overlay={overlayHeader} />
      </div>

      {/* Main Page Body */}
      <main className="flex-1">{children}</main>

      {/* VIP Drop Club Newsletter Banner */}
      <section className="border-t border-white/10 bg-gradient-to-b from-black/40 via-zinc-950 to-black py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-400">
            <Sparkles className="w-3 h-3" />
            <span>JOIN THE INKDROP INNER CIRCLE</span>
          </div>

          <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Unlock 10% Off Your First Drop
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
            Get private access to secret warehouse restocks, exclusive artist capsules, and member-only pricing.
          </p>

          {subscribed ? (
            <div className="inline-flex items-center gap-2 p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-400 rounded-2xl text-xs font-bold animate-fade-in">
              <Check className="w-4 h-4" />
              <span>You&apos;re on the VIP list! Use code &ldquo;INK10&rdquo; at checkout.</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletter} className="mt-6 flex max-w-md mx-auto gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="flex-1 rounded-full border border-white/20 bg-zinc-900 px-5 py-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-white/50"
              />
              <button
                type="submit"
                className="rounded-full px-6 py-3 text-xs font-black uppercase tracking-wider text-black transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                style={{ backgroundColor: "var(--accent-color)" }}
              >
                Join Drop
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Luxury Dark Footer */}
      <footer className="border-t border-white/10 bg-black px-6 py-14 text-xs text-zinc-400">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-black tracking-tighter text-white">
                INK<span style={{ color: "var(--accent-color)" }}>DROP</span>
              </span>
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Engineered luxury streetwear & high-density graphic apparel. Heavyweight 240 GSM boxy silhouettes crafted for the subculture.
            </p>
            <p className="text-[11px] text-zinc-500">
              © {new Date().getFullYear()} INKDROP Apparel Pvt. Ltd. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <p className="font-bold uppercase tracking-widest text-white text-xs">
              Collections
            </p>
            <ul className="space-y-2 text-xs">
              <li><Link href="/?category=Oversized#catalog" className="hover:text-white transition-colors">Oversized Tees</Link></li>
              <li><Link href="/?category=Acid%20Wash#catalog" className="hover:text-white transition-colors">Acid Wash Drops</Link></li>
              <li><Link href="/?category=Heavyweight#catalog" className="hover:text-white transition-colors">240 GSM Heavyweight</Link></li>
              <li><Link href="/?badge=BEST%20SELLER#catalog" className="hover:text-white transition-colors">Best Sellers</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <p className="font-bold uppercase tracking-widest text-white text-xs">
              Customer Support
            </p>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white cursor-pointer">Track Your Order</span></li>
              <li><span className="hover:text-white cursor-pointer">Shipping & Returns</span></li>
              <li><span className="hover:text-white cursor-pointer">Size Guide & Fit</span></li>
              <li><span className="hover:text-white cursor-pointer">Contact Support</span></li>
            </ul>
          </div>

          {/* Admin & Security */}
          <div className="space-y-3">
            <p className="font-bold uppercase tracking-widest text-white text-xs">
              Store Console
            </p>
            <p className="text-xs text-zinc-400">
              Manage inventory, prices, product drops, and live storefront themes.
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white hover:text-black transition-all"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Open Admin Command Center</span>
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
