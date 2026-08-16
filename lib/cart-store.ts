"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Size } from "./product";

export type CartItem = {
  productId: string;
  slug: string;
  title: string;
  image: string;
  price: number;
  size: Size;
  qty: number;
  maxStock: number;
};

export type WishlistItem = {
  productId: string;
  slug: string;
  title: string;
  image: string;
  price: number;
};

type ShopState = {
  cart: CartItem[];
  wishlist: WishlistItem[];
  bagOpen: boolean;
  wishlistOpen: boolean;
  search: string;
  setSearch: (search: string) => void;
  openBag: () => void;
  closeBag: () => void;
  openWishlist: () => void;
  closeWishlist: () => void;
  addToCart: (item: CartItem) => void;
  setQty: (productId: string, size: Size, qty: number) => void;
  removeFromCart: (productId: string, size: Size) => void;
  toggleWishlist: (item: WishlistItem) => void;
};

export const useShop = create<ShopState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      bagOpen: false,
      wishlistOpen: false,
      search: "",
      setSearch: (search) => set({ search }),
      openBag: () => set({ bagOpen: true }),
      closeBag: () => set({ bagOpen: false }),
      openWishlist: () => set({ wishlistOpen: true }),
      closeWishlist: () => set({ wishlistOpen: false }),
      addToCart: (item) => {
        if (item.maxStock <= 0) return;
        const existing = get().cart.find(
          (i) => i.productId === item.productId && i.size === item.size,
        );
        if (existing) {
          set({
            bagOpen: true,
            cart: get().cart.map((i) =>
              i.productId === item.productId && i.size === item.size
                ? {
                    ...i,
                    maxStock: item.maxStock,
                    qty: Math.min(i.qty + item.qty, item.maxStock),
                  }
                : i,
            ),
          });
        } else {
          set({
            bagOpen: true,
            cart: [
              ...get().cart,
              { ...item, qty: Math.min(item.qty, item.maxStock) },
            ],
          });
        }
      },
      setQty: (productId, size, qty) => {
        set({
          cart: get()
            .cart.map((i) =>
              i.productId === productId && i.size === size
                ? { ...i, qty: Math.min(Math.max(qty, 0), i.maxStock) }
                : i,
            )
            .filter((i) => i.qty > 0),
        });
      },
      removeFromCart: (productId, size) =>
        set({
          cart: get().cart.filter(
            (i) => !(i.productId === productId && i.size === size),
          ),
        }),
      toggleWishlist: (item) => {
        const has = get().wishlist.some((w) => w.productId === item.productId);
        set({
          wishlist: has
            ? get().wishlist.filter((w) => w.productId !== item.productId)
            : [...get().wishlist, item],
        });
      },
    }),
    {
      name: "inkdrop-shop",
      partialize: (s) => ({ cart: s.cart, wishlist: s.wishlist }),
    },
  ),
);
