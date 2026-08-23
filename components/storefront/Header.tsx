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
      className={`transition-all duration-300 bg-white border-b border-zinc-200 text-zinc-900 shadow-2xs`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Mobile Menu Trigger */}
        <button
          type="button"
          className="p-2 rounded-xl text-zinc-700 hover:text-black hover:bg-zinc-100 lg:hidden cursor-pointer"
          aria-label="Open menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Brand Logo (Unhinged) */}
        <Link href="/" className="shrink-0 group flex items-center">
          <img
            src="/unhinged-logo.png"
            alt="Unhinged"
            className="h-9 sm:h-11 w-auto object-contain hover:opacity-90 transition-opacity"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-[11px] font-black uppercase tracking-[0.15em] text-zinc-800">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors duration-200 hover:text-emerald-600 ${
                item.special
                  ? "flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-200 bg-zinc-50 text-zinc-800 hover:bg-zinc-100"
                  : ""
              }`}
            >
              {item.special && <Shield className="w-3 h-3 text-emerald-600" />}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Search & Action Icons */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Desktop Search Bar (Matching Veirdo's light purple search box) */}
          <form onSubmit={onSearch} className="hidden sm:block relative w-48 md:w-64">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Try searching "T-shirt"'
              className="w-full rounded-xl border border-purple-200 bg-purple-50/60 py-2 pl-9 pr-8 text-xs font-medium text-zinc-900 placeholder-purple-400 outline-none focus:border-purple-400 focus:bg-white transition-all shadow-2xs"
            />
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 pointer-events-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSearch("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-800"
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </form>

          {/* Wishlist Button */}
          <button
            type="button"
            className="relative p-2 rounded-xl text-zinc-800 hover:text-emerald-600 hover:bg-zinc-100 transition-colors cursor-pointer"
            aria-label="Open wishlist"
            onClick={openWishlist}
          >
            <Heart size={20} />
            {isHydrated && wishCount > 0 && (
              <span
                className="absolute top-0.5 right-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full px-1 text-[10px] font-black text-white bg-emerald-600 shadow-md animate-bounce"
              >
                {wishCount}
              </span>
            )}
          </button>

          {/* Cart Bag Button */}
          <button
            type="button"
            className="relative p-2 rounded-xl text-zinc-800 hover:text-emerald-600 hover:bg-zinc-100 transition-colors cursor-pointer flex items-center gap-2"
            aria-label="Open shopping bag"
            onClick={openBag}
          >
            <ShoppingBag size={20} />
            {isHydrated && cartCount > 0 && (
              <span
                className="absolute top-0.5 right-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full px-1 text-[10px] font-black text-white bg-emerald-600 shadow-md animate-pulse"
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <div className="border-t border-zinc-200 bg-white px-5 py-6 space-y-4 lg:hidden shadow-lg animate-fade-up">
          <form onSubmit={onSearch} className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search drops, collections..."
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50 py-3 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 outline-none"
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
                className="flex items-center justify-between p-3 rounded-xl text-xs font-bold uppercase tracking-widest text-zinc-800 hover:bg-zinc-100 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <span>{item.label}</span>
                {item.special ? (
                  <Shield className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
