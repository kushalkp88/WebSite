"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  X,
  Shield,
  Sparkles,
  ChevronDown,
  ArrowRight,
  Flame,
  Palette,
} from "lucide-react";
import { FormEvent, useState, useRef, useEffect, useSyncExternalStore } from "react";
import { useShop } from "@/lib/cart-store";

export type NavItem = {
  label: string;
  href: string;
};

export type CategoryGroup = {
  title: string;
  items: NavItem[];
};

const MEN_CATEGORIES: CategoryGroup[] = [
  {
    title: "Plain Tee",
    items: [
      { label: "Regular", href: "/?gender=men&type=plain&category=Classic%20Fit#catalog" },
      { label: "Oversized", href: "/?gender=men&type=plain&category=Oversized#catalog" },
      { label: "Sweatshirts", href: "/?gender=men&type=plain&category=Sweatshirts#catalog" },
      { label: "Hoodies", href: "/?gender=men&type=plain&category=Hoodies#catalog" },
    ],
  },
  {
    title: "Printed Tee",
    items: [
      { label: "Regular", href: "/?gender=men&type=printed&category=Classic%20Fit#catalog" },
      { label: "Oversized", href: "/?gender=men&type=printed&category=Oversized#catalog" },
      { label: "Sweatshirts", href: "/?gender=men&type=printed&category=Sweatshirts#catalog" },
      { label: "Hoodies", href: "/?gender=men&type=printed&category=Hoodies#catalog" },
    ],
  },
];

const WOMEN_CATEGORIES: CategoryGroup[] = [
  {
    title: "Plain Tee",
    items: [
      { label: "Crop Top", href: "/?gender=women&type=plain&category=Crop%20Top#catalog" },
      { label: "Boyfriend Fit", href: "/?gender=women&type=plain&category=Boyfriend%20Fit#catalog" },
      { label: "Oversized", href: "/?gender=women&type=plain&category=Oversized#catalog" },
      { label: "Sweatshirts", href: "/?gender=women&type=plain&category=Sweatshirts#catalog" },
      { label: "Hoodies", href: "/?gender=women&type=plain&category=Hoodies#catalog" },
    ],
  },
  {
    title: "Printed Tee",
    items: [
      { label: "Crop Top", href: "/?gender=women&type=printed&category=Crop%20Top#catalog" },
      { label: "Boyfriend Fit", href: "/?gender=women&type=printed&category=Boyfriend%20Fit#catalog" },
      { label: "Oversized", href: "/?gender=women&type=printed&category=Oversized#catalog" },
      { label: "Sweatshirts", href: "/?gender=women&type=printed&category=Sweatshirts#catalog" },
      { label: "Hoodies", href: "/?gender=women&type=printed&category=Hoodies#catalog" },
    ],
  },
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
  const [activeDropdown, setActiveDropdown] = useState<"men" | "women" | null>(null);

  // Mobile accordion states
  const [mobileMenOpen, setMobileMenOpen] = useState(false);
  const [mobileWomenOpen, setMobileWomenOpen] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);

  // Safe client hydration check
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    setSearch(query);
    router.push("/#catalog");
    setMenuOpen(false);
    setActiveDropdown(null);
  }

  function handleNavClick() {
    setActiveDropdown(null);
    setMenuOpen(false);
  }

  return (
    <header
      ref={navRef}
      className="relative z-50 bg-white border-b border-zinc-200 text-zinc-900 shadow-2xs"
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
        <Link href="/" className="shrink-0 group flex items-center" onClick={handleNavClick}>
          <img
            src="/unhinged-logo.png"
            alt="Unhinged"
            className="h-9 sm:h-11 w-auto object-contain hover:opacity-90 transition-opacity"
          />
        </Link>

        {/* Desktop Navigation Links with Multi-Level Mega Menus */}
        <nav className="hidden lg:flex items-center gap-7 text-[11px] font-black uppercase tracking-[0.16em] text-zinc-800">
          {/* MEN Dropdown Trigger */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown("men")}
          >
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === "men" ? null : "men")}
              className={`flex items-center gap-1.5 py-2 hover:text-emerald-600 transition-colors cursor-pointer ${
                activeDropdown === "men" ? "text-emerald-600 font-extrabold" : ""
              }`}
            >
              <span>MEN</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  activeDropdown === "men" ? "rotate-180 text-emerald-600" : "text-zinc-400"
                }`}
              />
            </button>

            {/* MEN Mega Menu Dropdown */}
            {activeDropdown === "men" && (
              <div
                onMouseLeave={() => setActiveDropdown(null)}
                className="absolute top-full left-0 mt-1 w-[460px] rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl animate-fade-down z-50"
              >
                <div className="grid grid-cols-2 gap-6">
                  {MEN_CATEGORIES.map((cat) => (
                    <div key={cat.title} className="space-y-2.5">
                      <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-1.5 pb-1 border-b border-zinc-100">
                        <Flame className="w-3.5 h-3.5 text-emerald-600" />
                        {cat.title}
                      </h4>
                      <ul className="space-y-1">
                        {cat.items.map((item) => (
                          <li key={item.label}>
                            <Link
                              href={item.href}
                              onClick={handleNavClick}
                              className="group flex items-center justify-between text-xs font-bold text-zinc-600 hover:text-emerald-600 hover:translate-x-1 transition-all py-1.5 px-2 rounded-lg hover:bg-zinc-50"
                            >
                              <span>{item.label}</span>
                              <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 text-emerald-600 transition-opacity" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Bottom Strip */}
                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-end bg-zinc-50 -mx-5 -mb-5 p-3.5 rounded-b-2xl">
                  <Link
                    href="/?gender=men#catalog"
                    onClick={handleNavClick}
                    className="text-[11px] font-black text-emerald-600 hover:text-emerald-700 uppercase flex items-center gap-1"
                  >
                    <span>View All Men&apos;s Drops</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* WOMEN Dropdown Trigger */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown("women")}
          >
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === "women" ? null : "women")}
              className={`flex items-center gap-1.5 py-2 hover:text-emerald-600 transition-colors cursor-pointer ${
                activeDropdown === "women" ? "text-emerald-600 font-extrabold" : ""
              }`}
            >
              <span>WOMEN</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  activeDropdown === "women" ? "rotate-180 text-emerald-600" : "text-zinc-400"
                }`}
              />
            </button>

            {/* WOMEN Mega Menu Dropdown */}
            {activeDropdown === "women" && (
              <div
                onMouseLeave={() => setActiveDropdown(null)}
                className="absolute top-full left-0 mt-1 w-[480px] rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl animate-fade-down z-50"
              >
                <div className="grid grid-cols-2 gap-6">
                  {WOMEN_CATEGORIES.map((cat) => (
                    <div key={cat.title} className="space-y-2.5">
                      <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-1.5 pb-1 border-b border-zinc-100">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        {cat.title}
                      </h4>
                      <ul className="space-y-1">
                        {cat.items.map((item) => (
                          <li key={item.label}>
                            <Link
                              href={item.href}
                              onClick={handleNavClick}
                              className="group flex items-center justify-between text-xs font-bold text-zinc-600 hover:text-emerald-600 hover:translate-x-1 transition-all py-1.5 px-2 rounded-lg hover:bg-zinc-50"
                            >
                              <span>{item.label}</span>
                              <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 text-emerald-600 transition-opacity" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Bottom Strip */}
                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-end bg-zinc-50 -mx-5 -mb-5 p-3.5 rounded-b-2xl">
                  <Link
                    href="/?gender=women#catalog"
                    onClick={handleNavClick}
                    className="text-[11px] font-black text-emerald-600 hover:text-emerald-700 uppercase flex items-center gap-1"
                  >
                    <span>View All Women&apos;s Drops</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* CUSTOMIZATION Direct Link */}
          <Link
            href="/customization"
            onClick={handleNavClick}
            className="flex items-center gap-1.5 py-2 hover:text-emerald-600 transition-colors"
          >
            <Palette className="w-3.5 h-3.5 text-emerald-600" />
            <span>CUSTOMIZATION</span>
          </Link>

          {/* Admin Panel Button */}
          <Link
            href="/admin"
            onClick={handleNavClick}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-200 bg-zinc-50 text-zinc-800 hover:bg-zinc-100 hover:text-emerald-600 transition-all shadow-2xs"
          >
            <Shield className="w-3 h-3 text-emerald-600" />
            <span>ADMIN PANEL</span>
          </Link>
        </nav>

        {/* Right Search & Action Icons */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Desktop Search Bar */}
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

      {/* Mobile Drawer Menu with Accordions */}
      {menuOpen && (
        <div className="border-t border-zinc-200 bg-white px-5 py-6 space-y-4 lg:hidden shadow-lg animate-fade-up max-h-[85vh] overflow-y-auto">
          {/* Mobile Search Bar */}
          <form onSubmit={onSearch} className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search drops, fits..."
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50 py-3 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 outline-none"
            />
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
            />
          </form>

          {/* Mobile Category Accordions */}
          <div className="space-y-2 pt-2">
            {/* MEN Accordion */}
            <div className="border border-zinc-200 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setMobileMenOpen(!mobileMenOpen)}
                className="w-full flex items-center justify-between p-3.5 text-xs font-black uppercase tracking-widest text-zinc-900 bg-zinc-50 hover:bg-zinc-100"
              >
                <span className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-emerald-600" />
                  MEN
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    mobileMenOpen ? "rotate-180 text-emerald-600" : "text-zinc-400"
                  }`}
                />
              </button>

              {mobileMenOpen && (
                <div className="p-4 bg-white space-y-4 border-t border-zinc-200 animate-fade-in">
                  {MEN_CATEGORIES.map((cat) => (
                    <div key={cat.title} className="space-y-2">
                      <p className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
                        {cat.title}
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {cat.items.map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={handleNavClick}
                            className="p-2 rounded-lg bg-zinc-50 hover:bg-emerald-50 text-xs font-bold text-zinc-800 hover:text-emerald-700 transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* WOMEN Accordion */}
            <div className="border border-zinc-200 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setMobileWomenOpen(!mobileWomenOpen)}
                className="w-full flex items-center justify-between p-3.5 text-xs font-black uppercase tracking-widest text-zinc-900 bg-zinc-50 hover:bg-zinc-100"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  WOMEN
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    mobileWomenOpen ? "rotate-180 text-emerald-600" : "text-zinc-400"
                  }`}
                />
              </button>

              {mobileWomenOpen && (
                <div className="p-4 bg-white space-y-4 border-t border-zinc-200 animate-fade-in">
                  {WOMEN_CATEGORIES.map((cat) => (
                    <div key={cat.title} className="space-y-2">
                      <p className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
                        {cat.title}
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {cat.items.map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={handleNavClick}
                            className="p-2 rounded-lg bg-zinc-50 hover:bg-emerald-50 text-xs font-bold text-zinc-800 hover:text-emerald-700 transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CUSTOMIZATION Direct Link */}
            <Link
              href="/customization"
              onClick={handleNavClick}
              className="flex items-center justify-between p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50 text-xs font-black uppercase tracking-widest text-emerald-900 hover:bg-emerald-100 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-emerald-600" />
                CUSTOMIZATION
              </span>
              <ArrowRight size={14} className="text-emerald-600" />
            </Link>

            {/* ADMIN PANEL */}
            <Link
              href="/admin"
              onClick={handleNavClick}
              className="flex items-center justify-between p-3.5 rounded-2xl border border-zinc-200 bg-zinc-50 text-xs font-black uppercase tracking-widest text-zinc-800 hover:bg-zinc-100 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                ADMIN PANEL
              </span>
              <ArrowRight size={14} className="text-zinc-400" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
