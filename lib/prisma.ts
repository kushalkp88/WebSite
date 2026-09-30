import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Automatically route through Neon PgBouncer pooler without modifying .env
const databaseUrl =
  process.env.DATABASE_URL?.includes(".neon.tech") &&
  !process.env.DATABASE_URL.includes("-pooler")
    ? process.env.DATABASE_URL.replace(/@(ep-[^.]+)/, "@$1-pooler")
    : process.env.DATABASE_URL;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: databaseUrl,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

