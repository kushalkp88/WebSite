"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Package, 
  Palette, 
  ExternalLink, 
  Menu, 
  X, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight
} from "lucide-react";
import type { ProductDTO } from "@/lib/product";
import type { ThemePayload } from "@/lib/theme";
import { OverviewPanel } from "./OverviewPanel";
import { ProductManager } from "./ProductManager";
import { ThemePanel } from "./ThemePanel";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

export function AdminApp({
  theme,
  products,
}: {
  theme: ThemePayload;
  products: ProductDTO[];
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "theme">("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Navigation targets passed down to child components
  const [targetEditProduct, setTargetEditProduct] = useState<ProductDTO | null>(null);
  const [targetCreateProduct, setTargetCreateProduct] = useState(false);

  function showToast(message: string, type: "success" | "error" = "success") {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }

  function handleOverviewAddProduct() {
    setTargetEditProduct(null);
    setTargetCreateProduct(true);
    setActiveTab("products");
  }

  function handleOverviewEditProduct(p: ProductDTO) {
    setTargetCreateProduct(false);
    setTargetEditProduct(p);
    setActiveTab("products");
  }

  function handleOverviewGoToTheme() {
    setActiveTab("theme");
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-400 selection:text-black">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Logo & Tag */}
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-black font-black text-xs shadow-md">
              ID
            </div>
            <div>
              <p className="text-sm font-black tracking-tight text-white">INKDROP</p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                ADMIN CONSOLE
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded-lg text-zinc-400 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav
          className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto"
          role="tablist"
          aria-label="Admin Sections"
        >
          {/* Tab 1: Dashboard Overview */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "overview"}
            onClick={() => {
              setActiveTab("overview");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/60"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${activeTab === "overview" ? "text-amber-400" : ""}`} />
            <span>Overview</span>
          </button>

          {/* Tab 2: Products & Inventory */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "products"}
            onClick={() => {
              setTargetCreateProduct(false);
              setTargetEditProduct(null);
              setActiveTab("products");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "products"
                ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/60"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
            }`}
          >
            <div className="flex items-center gap-3">
              <Package className={`w-4 h-4 ${activeTab === "products" ? "text-amber-400" : ""}`} />
              <span>Products</span>
            </div>
            <span className="text-xs bg-zinc-950 text-zinc-400 font-mono px-2 py-0.5 rounded-full border border-zinc-800">
              {products.length}
            </span>
          </button>

          {/* Tab 3: Theme & Customizer */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "theme"}
            onClick={() => {
              setActiveTab("theme");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "theme"
                ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/60"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
            }`}
          >
            <Palette className={`w-4 h-4 ${activeTab === "theme" ? "text-amber-400" : ""}`} />
            <span>Theme & Branding</span>
          </button>
        </nav>

        {/* Storefront Link Footer */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/40">
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-700/50 transition-all group"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Live Storefront
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
          </Link>
        </div>
      </aside>

      {/* MAIN BODY AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 lg:hidden cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
              <span>Admin</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-zinc-100 font-semibold capitalize">
                {activeTab === "overview"
                  ? "Dashboard Overview"
                  : activeTab === "products"
                  ? "Product Catalog"
                  : "Theme Customizer"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="text-xs bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5"
            >
              <span>Storefront</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </Link>
          </div>
        </header>

        {/* Tab Content Container */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {activeTab === "overview" && (
            <OverviewPanel
              products={products}
              onAddProduct={handleOverviewAddProduct}
              onEditProduct={handleOverviewEditProduct}
              onGoToTheme={handleOverviewGoToTheme}
            />
          )}

          {activeTab === "products" && (
            <ProductManager
              initial={products}
              editingTarget={targetEditProduct}
              creatingTarget={targetCreateProduct}
              onClearTargets={() => {
                setTargetEditProduct(null);
                setTargetCreateProduct(false);
              }}
              onShowToast={showToast}
            />
          )}

          {activeTab === "theme" && (
            <ThemePanel initial={theme} onShowToast={showToast} />
          )}
        </main>
      </div>

      {/* FLOATING TOAST NOTIFICATIONS */}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-2xl flex items-center gap-3 border text-xs font-medium backdrop-blur-md animate-fade-in ${
              t.type === "success"
                ? "bg-zinc-900/95 border-emerald-500/50 text-emerald-300"
                : "bg-zinc-900/95 border-red-500/50 text-red-300"
            }`}
          >
            {t.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <p className="flex-1 leading-snug">{t.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
