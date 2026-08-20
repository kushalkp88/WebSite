export const THEME_CHANNEL = "inkdrop-theme";

export type ThemePayload = {
  bgPrimary: string;
  accentColor: string;
  bannerBg: string;
  bannerText: string;
};

export const DEFAULT_THEME: ThemePayload = {
  bgPrimary: "#ffffff",
  accentColor: "#16a34a",
  bannerBg: "#ffffff",
  bannerText:
    "⚡ FREE SHIPPING ON ALL ORDERS OVER ₹999  ·  100% COTTON OVERSIZED TEES  ·  BUY 2 @ ₹1099  ·  7-DAY EASY DOORSTEP RETURNS",
};

export function themeToCss(theme: ThemePayload): Record<string, string> {
  return {
    "--bg-primary": theme.bgPrimary,
    "--accent-color": theme.accentColor,
    "--banner-bg": theme.bannerBg,
  };
}

export function applyTheme(theme: ThemePayload) {
  const root = document.documentElement;
  root.style.setProperty("--bg-primary", theme.bgPrimary);
  root.style.setProperty("--accent-color", theme.accentColor);
  root.style.setProperty("--banner-bg", theme.bannerBg);
}

export function broadcastTheme(theme: ThemePayload) {
  const ch = new BroadcastChannel(THEME_CHANNEL);
  ch.postMessage(theme);
  ch.close();
}
