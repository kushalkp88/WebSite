"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { CartDrawer } from "./CartDrawer";
import { Header } from "./Header";
import { WishlistDrawer } from "./WishlistDrawer";
import { MessageCircle, Mail } from "lucide-react";

export function StoreShell({
  overlayHeader = false,
  children,
}: {
  overlayHeader?: boolean;
  children: ReactNode;
}) {

  return (
    <div className="min-h-svh bg-white text-zinc-900 selection:bg-emerald-500 selection:text-white flex flex-col justify-between">
      {/* Sticky Header Bar */}
      <div className="sticky top-0 z-50">
        <Header overlay={overlayHeader} />
      </div>

      {/* Main Page Body */}
      <main className="flex-1">{children}</main>


      {/* Clean Streetwear Footer */}
      <footer className="border-t border-zinc-200 bg-white px-6 py-14 text-xs text-zinc-600">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* 1. Brand Manifesto */}
          <div className="space-y-3.5 lg:col-span-5">
            <h4 className="font-black uppercase tracking-[0.2em] text-zinc-950 text-xs">
              About UNHINGED
            </h4>
            <p className="text-xs sm:text-[13px] text-zinc-600 leading-relaxed max-w-xl">
              Born to inspire fearless self-expression, our collection celebrates the beauty of being unpredictable, original, and unrestrained. We design high-quality essentials built to break routine and distort traditional norms. We don&apos;t chase trends or ask for approval—we capture raw energy and turn it into a uniform for the bold.
            </p>
          </div>

          {/* 2. Policies */}
          <div className="space-y-3.5 lg:col-span-2">
            <h4 className="font-black uppercase tracking-[0.2em] text-zinc-950 text-xs">
              Policies
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-600 font-medium">
              <li>
                <Link href="/policies/privacy" className="hover:text-black transition-colors block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/terms" className="hover:text-black transition-colors block">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/policies/returns" className="hover:text-black transition-colors block">
                  Refund & Return Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping" className="hover:text-black transition-colors block">
                  Shipping & Delivery Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Contact */}
          <div className="space-y-3.5 lg:col-span-2">
            <h4 className="font-black uppercase tracking-[0.2em] text-zinc-950 text-xs">
              Contact
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-600 font-medium">
              <li>
                <a
                  href="https://wa.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-zinc-700 hover:text-black transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-zinc-800 shrink-0" />
                  <span>WhatsApp Support</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@unhinged.in"
                  className="inline-flex items-center gap-2 text-zinc-700 hover:text-black transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-zinc-800 shrink-0" />
                  <span>support@unhinged.in</span>
                </a>
              </li>
            </ul>
          </div>

          {/* 4. Connect */}
          <div className="space-y-3.5 lg:col-span-3">
            <h4 className="font-black uppercase tracking-[0.2em] text-zinc-950 text-xs">
              Connect
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-600 font-medium">
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition-colors block"
                >
                  Instagram (@unhinged)
                </a>
              </li>
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition-colors block"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition-colors block"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://spotify.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition-colors block"
                >
                  Spotify // Studio Playlist
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Sub-Footer Bar with Brand Logo */}
        <div className="mx-auto max-w-7xl mt-12 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400">
          <p>© {new Date().getFullYear()} UNHINGED Apparel. All rights reserved.</p>
          <Link href="/" className="inline-block group">
            <img
              src="/unhinged-logo.png"
              srcSet="/unhinged-logo-hires.png 2x"
              alt="UNHINGED"
              className="h-6 sm:h-7 w-auto object-contain opacity-85 group-hover:opacity-100 transition-opacity"
            />
          </Link>
        </div>
      </footer>

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <WishlistDrawer />
    </div>
  );
}
