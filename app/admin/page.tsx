import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/product";
import { DEFAULT_THEME } from "@/lib/theme";
import { AdminApp } from "@/components/admin/AdminApp";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [settings, rows] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "default" } }),
    prisma.product.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <AdminApp
      theme={
        settings
          ? {
              bgPrimary: settings.bgPrimary,
              accentColor: settings.accentColor,
              bannerBg: settings.bannerBg,
              bannerText: settings.bannerText,
            }
          : DEFAULT_THEME
      }
      products={rows.map(serializeProduct)}
    />
  );
}
