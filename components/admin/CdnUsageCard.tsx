"use client";

import { useEffect, useState } from "react";
import { HardDrive, Activity, RefreshCw } from "lucide-react";

interface UsageData {
  configured: boolean;
  provider: string;
  bandwidth: { usedBytes: number; limitBytes: number; usedPercent: number };
  storage: { usedBytes: number; limitBytes: number; usedPercent: number };
  transformations: number;
}

function formatBytes(bytes: number) {
  if (!bytes || bytes === 0) return "0 MB";
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CdnUsageCard() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadUsage() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/usage");
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
      }
    } catch (e) {
      console.error("Failed to load CDN usage:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;
    fetch("/api/admin/usage")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: UsageData | null) => {
        if (!ignore && data) {
          setUsage(data);
        }
      })
      .catch((e) => {
        console.error("Failed to load CDN usage:", e);
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  if (!usage) return null;

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-sm hover:border-zinc-700 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              usage.configured ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            }`}
          />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            CDN & Media Quota
          </span>
          <span className="text-xs text-zinc-500 font-mono">({usage.provider})</span>
        </div>
        <button
          type="button"
          onClick={loadUsage}
          disabled={loading}
          className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Refresh usage statistics"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Bandwidth Usage */}
        <div className="p-3 bg-zinc-950/50 border border-zinc-800/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
              <Activity className="w-3.5 h-3.5 text-blue-400" /> Bandwidth (Monthly)
            </span>
            <span className="text-zinc-300 font-mono text-xs">
              {formatBytes(usage.bandwidth.usedBytes)} / {formatBytes(usage.bandwidth.limitBytes)}
            </span>
          </div>
          <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                usage.bandwidth.usedPercent > 85 ? "bg-red-500" : "bg-blue-500"
              }`}
              style={{ width: `${Math.max(3, usage.bandwidth.usedPercent)}%` }}
            />
          </div>
          <div className="text-[11px] text-zinc-500 flex justify-between">
            <span>Consumed: {usage.bandwidth.usedPercent.toFixed(1)}%</span>
            <span>Edge WebP/AVIF cached</span>
          </div>
        </div>

        {/* Media Storage */}
        <div className="p-3 bg-zinc-950/50 border border-zinc-800/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
              <HardDrive className="w-3.5 h-3.5 text-purple-400" /> Active Media Storage
            </span>
            <span className="text-zinc-300 font-mono text-xs">
              {formatBytes(usage.storage.usedBytes)} / {formatBytes(usage.storage.limitBytes)}
            </span>
          </div>
          <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                usage.storage.usedPercent > 85 ? "bg-red-500" : "bg-purple-500"
              }`}
              style={{ width: `${Math.max(3, usage.storage.usedPercent)}%` }}
            />
          </div>
          <div className="text-[11px] text-zinc-500 flex justify-between">
            <span>Consumed: {usage.storage.usedPercent.toFixed(1)}%</span>
            <span>Visually lossless compressed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
