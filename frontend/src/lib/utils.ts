import { type ClassValue, clsx } from "clsx";
import type { SyntheticEvent } from "react";
import { twMerge } from "tailwind-merge";

export const IMAGE_PLACEHOLDER_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Crect width='640' height='360' fill='%231b263b'/%3E%3Cpath d='m190 250 75-82 55 60 52-49 78 71H190Z' fill='%236b7280'/%3E%3Ccircle cx='230' cy='120' r='28' fill='%239ca3af'/%3E%3C/svg%3E";

export function normalizeImageUrl(
  url?: string | null,
  baseUrl = import.meta.env.VITE_API_URL ?? "",
) {
  const value = url?.trim();
  if (!value) return IMAGE_PLACEHOLDER_URL;

  const driveMatch = value.match(
    /^https?:\/\/(?:www\.)?drive\.google\.com\/file\/d\/([^/?#]+)\/view(?:[?#].*)?$/i,
  );
  if (driveMatch) {
    return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
  }

  if (/^https?:\/\//i.test(value)) return value;

  // Files uploaded to the FastAPI backend are served from /uploads/... at the
  // API origin (which excludes the /api/v1 path segment). Resolve those to the
  // backend origin so the browser does not request them from the frontend
  // origin. Other relative paths (e.g. /images/...) are frontend static assets
  // and are returned unchanged.
  if (value.startsWith("/uploads/")) {
    const base = baseUrl.trim().replace(/\/+$/, "");
    if (base) {
      try {
        return `${new URL(base).origin}${value}`;
      } catch {
        // Strip a trailing /api/v1 from non-standard configured base URLs.
        const origin = base.replace(/\/api\/v1$/i, "");
        return `${origin}/${value.replace(/^\/+/, "")}`;
      }
    }
  }

  return value;
}

// Media (video/image) URLs are normalized the same way: absolute URLs
// pass through, and backend-served /uploads/... paths resolve to the API origin
// via VITE_API_URL. Alias kept for call-site clarity at video sites.
export const normalizeMediaUrl = normalizeImageUrl;

export function handleImageError(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = IMAGE_PLACEHOLDER_URL;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
