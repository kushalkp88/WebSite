import { Truck, ShieldCheck, RefreshCw, Zap } from "lucide-react";

export function TrustBar() {
  const perks = [
    {
      icon: Truck,
      title: "FREE EXPRESS SHIPPING",
      subtitle: "On all orders above ₹999",
    },
    {
      icon: Zap,
      title: "240 GSM HEAVYWEIGHT",
      subtitle: "100% combed compact cotton",
    },
    {
      icon: RefreshCw,
      title: "7-DAY EASY RETURNS",
      subtitle: "Hassle-free doorstep pickup",
    },
    {
      icon: ShieldCheck,
      title: "SECURE PAYMENTS & COD",
      subtitle: "UPI, Cards & Cash on Delivery",
    },
  ];

  return (
    <section className="border-y border-zinc-200 bg-zinc-50/80">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {perks.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="flex items-center gap-3.5 group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-emerald-600 transition-all duration-300 group-hover:scale-105 group-hover:border-emerald-500 shadow-2xs">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-wider text-zinc-900 uppercase">
                    {p.title}
                  </h4>
                  <p className="mt-0.5 text-[11px] text-zinc-500 font-medium">
                    {p.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
