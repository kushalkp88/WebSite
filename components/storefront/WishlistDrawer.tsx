"use client";

import { Heart, Trash2, X, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatInr } from "@/lib/product";
import { useShop } from "@/lib/cart-store";

export function WishlistDrawer() {
  const open = useShop((s) => s.wishlistOpen);
  const close = useShop((s) => s.closeWishlist);
  const wishlist = useShop((s) => s.wishlist);
  const toggleWishlist = useShop((s) => s.toggleWishlist);
  const addToCart = useShop((s) => s.addToCart);
  const openBag = useShop((s) => s.openBag);

  function moveToBag(item: typeof wishlist[number]) {
    addToCart({
      productId: item.productId,
      slug: item.slug,
      title: item.title,
      image: item.image,
      price: item.price,
      size: "M", // default size
      qty: 1,
      maxStock: 10,
    });
    toggleWishlist(item);
    close();
    openBag();
  }

  return (
    <div
      className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={close}
      />
      <aside
        role="dialog"
        aria-label="My Wishlist"
        className={`absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-zinc-950 text-white shadow-2xl border-l border-white/10 transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4.5 bg-black/50">
          <div className="flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <h2 className="text-sm font-black tracking-[0.2em] uppercase text-white">
              MY WISHLIST ({wishlist.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close wishlist"
          >
            <X size={20} />
          </button>
        </div>

        {wishlist.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-600">
              <Heart className="w-8 h-8" />
            </div>
            <div>
              <p className="text-base font-bold text-white">No items saved yet</p>
              <p className="mt-1 text-xs text-zinc-400 max-w-xs">
                Tap the heart icon on any drop to save pieces for later.
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              className="px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider text-black bg-white hover:bg-zinc-200 transition-all cursor-pointer shadow-lg"
            >
              Browse Catalog
            </button>
          </div>
        ) : (
          <ul className="flex-1 space-y-4 overflow-y-auto p-6 divide-y divide-zinc-900">
            {wishlist.map((item) => (
              <li key={item.productId} className="pt-4 first:pt-0 flex gap-4">
                <div className="h-24 w-20 rounded-xl overflow-hidden bg-zinc-900 border border-white/10 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={close}
                        className="font-bold text-sm text-zinc-100 hover:text-white line-clamp-1"
                      >
                        {item.title}
                      </Link>
                      <button
                        type="button"
                        className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer"
                        onClick={() => toggleWishlist(item)}
                        title="Remove from wishlist"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="mt-1 text-xs font-bold text-white">
                      {formatInr(item.price)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => moveToBag(item)}
                    className="mt-3 flex items-center justify-center gap-1.5 w-full rounded-xl py-2 text-xs font-bold tracking-wider text-black uppercase transition-all shadow-md active:scale-95 cursor-pointer"
                    style={{ backgroundColor: "var(--accent-color)" }}
                  >
                    <ShoppingBag size={12} />
                    <span>Move to Bag</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
