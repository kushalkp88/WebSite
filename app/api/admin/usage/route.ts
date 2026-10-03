import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

interface CachedUsage {
  data: unknown;
  timestamp: number;
}

let usageCache: CachedUsage | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

export async function GET() {
  try {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

    // Check memory cache first
    if (usageCache && Date.now() - usageCache.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(usageCache.data);
    }

    if (!privateKey) {
      // Calculate local disk storage if ImageKit is not yet configured
      let localBytes = 0;
      let fileCount = 0;
      const scanDirs = [
        path.join(process.cwd(), "public", "uploads"),
        path.join(process.cwd(), "public", "products"),
      ];

      for (const dir of scanDirs) {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          for (const f of files) {
            const stat = fs.statSync(path.join(dir, f));
            if (stat.isFile()) {
              localBytes += stat.size;
              fileCount++;
            }
          }
        }
      }

      const fallbackData = {
        configured: false,
        provider: "Local Storage (ImageKit Keys Pending)",
        bandwidth: { usedBytes: 0, limitBytes: 20 * 1024 * 1024 * 1024, usedPercent: 0 },
        storage: {
          usedBytes: localBytes,
          limitBytes: 20 * 1024 * 1024 * 1024,
          usedPercent: Math.min(100, (localBytes / (20 * 1024 * 1024 * 1024)) * 100),
        },
        fileCount,
        transformations: 0,
      };

      usageCache = { data: fallbackData, timestamp: Date.now() };
      return NextResponse.json(fallbackData);
    }

    const authHeader = "Basic " + Buffer.from(`${privateKey}:`).toString("base64");
    const today = new Date().toISOString().split("T")[0];
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0];

    // Query ImageKit Account Management API
    const res = await fetch(
      `https://api.imagekit.io/v1/accounts/usage?startDate=${firstOfMonth}&endDate=${today}`,
      {
        headers: { Authorization: authHeader },
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) {
      // If ImageKit returns non-200 (e.g. invalid keys or rate limited), return graceful fallback
      console.warn(`ImageKit usage returned HTTP ${res.status}`);
      const data = {
        configured: true,
        provider: "ImageKit.io (API Sync Pending)",
        bandwidth: { usedBytes: 0, limitBytes: 20 * 1024 * 1024 * 1024, usedPercent: 0 },
        storage: { usedBytes: 0, limitBytes: 20 * 1024 * 1024 * 1024, usedPercent: 0 },
        transformations: 0,
      };
      return NextResponse.json(data);
    }

    const raw = await res.json();
    const bandwidthBytes = raw.usage?.bandwidth?.value || 0;
    const storageBytes = raw.usage?.storage?.value || 0;
    const bandwidthLimitBytes = 20 * 1024 * 1024 * 1024; // 20 GB default plan limit
    const storageLimitBytes = 20 * 1024 * 1024 * 1024;

    const data = {
      configured: true,
      provider: "ImageKit.io",
      bandwidth: {
        usedBytes: bandwidthBytes,
        limitBytes: bandwidthLimitBytes,
        usedPercent: Math.min(100, (bandwidthBytes / bandwidthLimitBytes) * 100),
      },
      storage: {
        usedBytes: storageBytes,
        limitBytes: storageLimitBytes,
        usedPercent: Math.min(100, (storageBytes / storageLimitBytes) * 100),
      },
      transformations: raw.usage?.imageTransformation?.value || 0,
    };

    usageCache = { data, timestamp: Date.now() };
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch usage";
    return NextResponse.json({ configured: false, error: message }, { status: 500 });
  }
}
