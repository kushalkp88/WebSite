"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  applyTheme,
  THEME_CHANNEL,
  type ThemePayload,
} from "@/lib/theme";

const ThemeCtx = createContext<ThemePayload | null>(null);

export function useThemeSettings() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useThemeSettings must be used within ThemeProvider");
  return ctx;
}

export function ThemeProvider({
  initial,
  children,
}: {
  initial: ThemePayload;
  children: ReactNode;
}) {
  const [theme, setTheme] = useState(initial);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const ch = new BroadcastChannel(THEME_CHANNEL);
    ch.onmessage = (event: MessageEvent<ThemePayload>) => {
      if (event.data?.bgPrimary) setTheme(event.data);
    };
    const id = setInterval(async () => {
      const res = await fetch("/api/settings");
      if (res.ok) setTheme(await res.json());
    }, 3000);
    return () => {
      ch.close();
      clearInterval(id);
    };
  }, []);

  return <ThemeCtx.Provider value={theme}>{children}</ThemeCtx.Provider>;
}
