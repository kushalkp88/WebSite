export const THEME_CHANNEL = "inkdrop-theme";

export type ThemePayload = {
  bgPrimary: string;
  accentColor: string;
  bannerBg: string;
  bannerText: string;
};

export const DEFAULT_THEME: ThemePayload = {
  bgPrimary: "#0a0a0a",
  accentColor: "#F5E642",
  bannerBg: "#1D4ED8",
  bannerText:
    "🚚 prepaid orders ship on priority  ·  new drop: the print drop  ·  buy 2 @ ₹1099  ·  oversized graphics just landed",
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
