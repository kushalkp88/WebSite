import type { CSSProperties } from "react";
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
  title: "INKDROP — The Print Drop",
  description: "Oversized graphic tees. Loud prints. Streetwear energy.",
};

export const dynamic = "force-dynamic";

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

export default async function RootLayout({
  children,
}: LayoutProps<"/">) {
  const theme = await loadTheme();
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${instrument.variable} h-full antialiased`}
      style={themeToCss(theme) as CSSProperties}
    >
      <body className="min-h-full">
        <ThemeProvider initial={theme}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
