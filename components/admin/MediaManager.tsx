"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Upload, 
  Trash2, 
  Copy, 
  Check, 
  Image as ImageIcon, 
  Search, 
  Plus, 
  RefreshCw,
  FileImage
} from "lucide-react";

export interface UploadedImageItem {
  url: string;
  filename: string;
  size: number;
  mtime: string;
}

interface MediaManagerProps {
  onShowToast: (msg: string, type?: "success" | "error") => void;
  onCreateProductWithImage?: (imageUrl: string) => void;
}

export function MediaManager({ onShowToast, onCreateProductWithImage }: MediaManagerProps) {
  const [images, setImages] = useState<UploadedImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function fetchImages() {
    try {
      setLoading(true);
      const res = await fetch("/api/upload");
      if (res.ok) {
        const data = (await res.json()) as { images: UploadedImageItem[] };
        setImages(data.images || []);
      }
    } catch {
      onShowToast("Failed to load uploaded images", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;
    fetch("/api/upload")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { images?: UploadedImageItem[] } | null) => {
        if (!ignore && data?.images) {
          setImages(data.images);
        }
      })
      .catch(() => {
        if (!ignore) {
          onShowToast("Failed to load uploaded images", "error");
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [onShowToast]);

  async function handleUploadFiles(files: FileList | File[]) {
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    setUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      let data: {
        success?: boolean;
        error?: string;
        urls?: string[];
        files?: Array<{ name: string }>;
      } = {};
      try {
        data = (await res.json()) as typeof data;
      } catch {
        throw new Error(`Upload failed (HTTP ${res.status})`);
      }

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      const count = data.urls?.length || 1;
      onShowToast(
        `Successfully uploaded ${count} image${count > 1 ? "s" : ""} from your computer!`,
        "success"
      );
      await fetchImages();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload image";
      onShowToast(message, "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleDeleteImage(url: string, filename: string) {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;

    try {
      const res = await fetch(`/api/upload?url=${encodeURIComponent(url)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        let data: { error?: string } = {};
        try {
          data = (await res.json()) as typeof data;
        } catch {}
        throw new Error(data.error || "Failed to delete");
      }

      onShowToast(`Deleted "${filename}"`, "success");
      setImages((prev) => prev.filter((img) => img.url !== url));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete file";
      onShowToast(message, "error");
    }
  }

  function handleCopy(url: string) {
    // If relative, copy full origin or relative path
    const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(url);
    onShowToast("Image URL copied to clipboard!", "success");
    setTimeout(() => setCopiedUrl(null), 2500);
  }

  function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function formatDate(iso: string) {
    try {
      const date = new Date(iso);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }

  const filteredImages = images.filter((img) =>
    img.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Media & Image Uploads
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Upload images from your computer to store, manage, and use across product drops and theme banners.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchImages}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
            title="Refresh media gallery"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center justify-center gap-2 bg-white text-zinc-950 hover:bg-zinc-100 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer focus:ring-2 focus:ring-zinc-400 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{uploading ? "Uploading..." : "Upload from Computer"}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleUploadFiles(e.target.files);
            }}
          />
        </div>
      </div>

      {/* Drag and Drop Upload Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files) handleUploadFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer group ${
          isDragOver
            ? "border-amber-400 bg-amber-400/10 scale-[1.01]"
            : "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-zinc-700"
        }`}
      >
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 group-hover:bg-zinc-800 text-amber-400 flex items-center justify-center mx-auto transition-colors shadow-inner">
            {uploading ? (
              <RefreshCw className="w-8 h-8 animate-spin" />
            ) : (
              <Upload className="w-8 h-8 group-hover:-translate-y-1 transition-transform" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100">
              {uploading ? "Uploading images to server..." : "Click or drag images here to upload"}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Supports JPG, PNG, WebP, GIF, SVG, and AVIF up to 10MB per file.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold bg-zinc-800/80 text-zinc-300 px-3.5 py-1.5 rounded-xl border border-zinc-700/60">
            <FileImage className="w-3.5 h-3.5 text-amber-400" />
            <span>Select files from computer</span>
          </div>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search uploaded files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-600 rounded-xl pl-10 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>

        <div className="text-xs text-zinc-400 w-full sm:w-auto text-right">
          Total: <strong className="text-zinc-200">{images.length}</strong> files (
          <strong className="text-zinc-200">
            {formatBytes(images.reduce((acc, curr) => acc + curr.size, 0))}
          </strong>
          )
        </div>
      </div>

      {/* Images Grid */}
      {loading ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-16 text-center">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-300">Loading uploaded media...</p>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center">
          <ImageIcon className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-zinc-300">
            {searchQuery ? "No matching images found" : "No uploaded images yet"}
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? "Try a different search term or clear the filter."
              : "Upload your first image from your computer using the upload area above."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((img) => {
            const isCopied = copiedUrl === img.url;
            return (
              <div
                key={img.url}
                className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all flex flex-col group"
              >
                {/* Image Preview Container */}
                <div className="h-44 bg-zinc-950 relative overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.url, img.filename)}
                      className="p-1.5 rounded-lg bg-black/70 hover:bg-red-600 text-zinc-300 hover:text-white backdrop-blur-sm transition-colors cursor-pointer"
                      title="Delete file"
                      aria-label="Delete image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Info & Actions */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-zinc-200 truncate" title={img.filename}>
                      {img.filename}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
                      <span>{formatBytes(img.size)}</span>
                      <span>{formatDate(img.mtime)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/80">
                    <button
                      type="button"
                      onClick={() => handleCopy(img.url)}
                      className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 px-2.5 rounded-xl border transition-all cursor-pointer ${
                        isCopied
                          ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/60"
                          : "bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-700/60"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>

                    {onCreateProductWithImage && (
                      <button
                        type="button"
                        onClick={() => onCreateProductWithImage(img.url)}
                        className="flex items-center justify-center gap-1 p-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-semibold transition-colors cursor-pointer"
                        title="Create new product with this image"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Use in Product</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
