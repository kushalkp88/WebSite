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
    <section className="border-y border-white/10 bg-black/40 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {perks.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="flex items-center gap-3.5 group"
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition-all duration-300 group-hover:scale-110 group-hover:border-white/30"
                  style={{ color: "var(--accent-color)" }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-wider text-white uppercase">
                    {p.title}
                  </h4>
                  <p className="mt-0.5 text-[11px] text-zinc-400 font-medium">
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
