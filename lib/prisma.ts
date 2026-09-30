import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Automatically route through Neon PgBouncer pooler with connection limit guards
function getPooledDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url || !url.includes(".neon.tech")) return url;

  let pooledUrl = url;
  if (!pooledUrl.includes("-pooler")) {
    pooledUrl = pooledUrl.replace(/@(ep-[^.]+)/, "@$1-pooler");
  }

  if (!pooledUrl.includes("connection_limit")) {
    const separator = pooledUrl.includes("?") ? "&" : "?";
    pooledUrl = `${pooledUrl}${separator}connection_limit=10&pool_timeout=15`;
  }

  return pooledUrl;
}

const databaseUrl = getPooledDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: databaseUrl,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

