import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_THEME, type ThemePayload } from "@/lib/theme";

export const dynamic = "force-dynamic";

export async function GET() {
  const row =
    (await prisma.siteSettings.findUnique({ where: { id: "default" } })) ??
    (await prisma.siteSettings.create({
      data: { id: "default", ...DEFAULT_THEME },
    }));
  const theme: ThemePayload = {
    bgPrimary: row.bgPrimary,
    accentColor: row.accentColor,
    bannerBg: row.bannerBg,
    bannerText: row.bannerText,
  };
  return NextResponse.json(theme);
}

export async function PATCH(req: Request) {
  const body = (await req.json()) as Partial<ThemePayload>;
  const row = await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {
      ...(body.bgPrimary != null && { bgPrimary: body.bgPrimary }),
      ...(body.accentColor != null && { accentColor: body.accentColor }),
      ...(body.bannerBg != null && { bannerBg: body.bannerBg }),
      ...(body.bannerText != null && { bannerText: body.bannerText }),
    },
    create: { id: "default", ...DEFAULT_THEME, ...body },
  });
  return NextResponse.json({
    bgPrimary: row.bgPrimary,
    accentColor: row.accentColor,
    bannerBg: row.bannerBg,
    bannerText: row.bannerText,
  });
}
