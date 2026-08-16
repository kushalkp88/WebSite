"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Menu, Search, ShoppingBag, X, Shield, Sparkles } from "lucide-react";
import { FormEvent, useState, useSyncExternalStore } from "react";
import { useShop } from "@/lib/cart-store";

const NAV = [
  { href: "/#catalog", label: "All Drops" },
  { href: "/?category=Oversized#catalog", label: "Oversized" },
  { href: "/?badge=BEST%20SELLER#catalog", label: "Best Sellers" },
  { href: "/?category=Acid%20Wash#catalog", label: "Acid Wash" },
  { href: "/admin", label: "Admin Panel", special: true },
];

const emptySubscribe = () => () => {};

export function Header({ overlay = false }: { overlay?: boolean }) {
  const router = useRouter();
  const search = useShop((s) => s.search);
  const setSearch = useShop((s) => s.setSearch);
  const openBag = useShop((s) => s.openBag);
  const openWishlist = useShop((s) => s.openWishlist);
  const cartCount = useShop((s) => s.cart.reduce((n, i) => n + i.qty, 0));
  const wishCount = useShop((s) => s.wishlist.length);
  
  const [query, setQuery] = useState(search);
  const [menuOpen, setMenuOpen] = useState(false);

  // Safe client hydration check without cascading render warning
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  function onSearch(e: FormEvent) {
    e.preventDefault();
    setSearch(query);
    router.push("/#catalog");
    setMenuOpen(false);
  }

  return (
    <header
      className={`transition-all duration-300 ${
        overlay
          ? "border-b border-white/10 bg-black/60 backdrop-blur-xl"
          : "border-b border-white/10 bg-black/85 backdrop-blur-xl shadow-lg"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Mobile Menu Trigger */}
        <button
          type="button"
          className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 lg:hidden cursor-pointer"
          aria-label="Open menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Brand Logo */}
        <Link href="/" className="shrink-0 group flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-white/20 flex items-center justify-center text-white font-black text-xs group-hover:scale-105 transition-transform">
            <span style={{ color: "var(--accent-color)" }}>ID</span>
          </div>
          <span className="font-[family-name:var(--font-geist-sans)] text-2xl font-black tracking-tighter text-white">
            INK<span style={{ color: "var(--accent-color)" }}>DROP</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-bold uppercase tracking-[0.18em] text-zinc-300">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors duration-200 hover:text-white ${
                item.special
                  ? "flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 bg-white/5 text-zinc-200 hover:bg-white/10"
                  : ""
              }`}
            >
              {item.special && <Shield className="w-3 h-3 text-amber-400" />}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Search & Action Icons */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Desktop Search Bar */}
          <form onSubmit={onSearch} className="hidden sm:block relative w-48 md:w-64">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tees, fits..."
              className="w-full rounded-full border border-white/15 bg-zinc-900/90 py-2 pl-9 pr-4 text-xs font-medium text-white placeholder-zinc-500 outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all"
            />
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSearch("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </form>

          {/* Wishlist Button */}
          <button
            type="button"
            className="relative p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Open wishlist"
            onClick={openWishlist}
          >
            <Heart size={20} />
            {isHydrated && wishCount > 0 && (
              <span
                className="absolute top-0.5 right-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full px-1 text-[10px] font-black text-black shadow-md animate-bounce"
                style={{ background: "var(--accent-color)" }}
              >
                {wishCount}
              </span>
            )}
          </button>

          {/* Cart Bag Button */}
          <button
            type="button"
            className="relative p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2"
            aria-label="Open shopping bag"
            onClick={openBag}
          >
            <ShoppingBag size={20} />
            {isHydrated && cartCount > 0 && (
              <span
                className="absolute top-0.5 right-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full px-1 text-[10px] font-black text-black shadow-md animate-pulse"
                style={{ background: "var(--accent-color)" }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-black/95 px-5 py-6 space-y-4 lg:hidden backdrop-blur-2xl animate-fade-up">
          <form onSubmit={onSearch} className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search drops, collections..."
              className="w-full rounded-xl border border-white/15 bg-zinc-900 py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none"
            />
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
            />
          </form>

          <div className="space-y-1.5 pt-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between p-3 rounded-xl text-xs font-bold uppercase tracking-widest text-zinc-200 hover:bg-white/10 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <span>{item.label}</span>
                {item.special ? (
                  <Shield className="w-4 h-4 text-amber-400" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
