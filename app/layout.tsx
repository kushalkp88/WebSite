import type { CSSProperties, ReactNode } from "react";
import { Instrument_Serif, Geist } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { prisma } from "@/lib/prisma";
import { DEFAULT_THEME, themeToCss, type ThemePayload } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://unhinged.style"),
  title: "UNHINGED — Oversized Streetwear & Graphic Drops",
  description: "Oversized graphic tees. Loud prints. Unhinged streetwear energy.",
};

import { unstable_cache } from "next/cache";

async function loadTheme(): Promise<ThemePayload> {
  try {
    const row = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });
    if (!row) return DEFAULT_THEME;
    return {
      bgPrimary: row.bgPrimary,
      accentColor: row.accentColor,
      bannerBg: row.bannerBg,
      bannerText: row.bannerText,
    };
  } catch {
    return DEFAULT_THEME;
  }
}

const getCachedTheme = unstable_cache(
  async () => loadTheme(),
  ["site-theme-payload"],
  { tags: ["theme"], revalidate: 3600 },
);

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const theme = await getCachedTheme();
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${instrument.variable} h-full antialiased`}
      style={themeToCss(theme) as CSSProperties}
    >
      <head>
        <link rel="preconnect" href="https://ik.imagekit.io" crossOrigin="" />
        <link rel="dns-prefetch" href="https://ik.imagekit.io" />
      </head>
      <body className="min-h-full">
        <ThemeProvider initial={theme}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
