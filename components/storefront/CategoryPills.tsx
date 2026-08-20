"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Flame, Sparkles, Shirt, Layers, Tag } from "lucide-react";

const QUICK_TAGS = [
  { id: "ALL", label: "All Drops", icon: Shirt },
  { id: "BEST_SELLER", label: "Best Sellers", badge: "BEST SELLER", icon: Flame },
  { id: "OVERSIZED", label: "Oversized Fit", category: "Oversized", icon: Layers },
  { id: "ACID_WASH", label: "Acid Wash", category: "Acid Wash", icon: Sparkles },
  { id: "HEAVYWEIGHT", label: "Heavyweight 240 GSM", category: "Heavyweight", icon: Tag },
];

export function CategoryPills() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
  const currentBadge = searchParams.get("badge");

  function handleSelect(item: typeof QUICK_TAGS[number]) {
    const params = new URLSearchParams();
    if (item.category) params.set("category", item.category);
    if (item.badge) params.set("badge", item.badge);
    
    const queryStr = params.toString();
    router.push(queryStr ? `/?${queryStr}#catalog` : "/#catalog");
  }

  return (
    <div className="flex items-center gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-none">
      {QUICK_TAGS.map((item) => {
        const Icon = item.icon;
        const isActive =
          (item.id === "ALL" && !currentCategory && !currentBadge) ||
          (item.category && currentCategory === item.category) ||
          (item.badge && currentBadge === item.badge);

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleSelect(item)}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-zinc-900 text-white font-black shadow-2xs scale-105"
                : "border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:text-zinc-900 shadow-2xs"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-zinc-500"}`} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
