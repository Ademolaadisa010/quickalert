// lib/utils.ts
// Shared utility functions used across the app

/* ── AI confidence → colour ───────────────────────────────────────────────── */
export function confColor(conf: number): string {
  if (conf >= 75) return "#52B788"; // green  — HIGH
  if (conf >= 40) return "#F4A261"; // amber  — MEDIUM
  return "#E63946";                 // red    — LOW
}

/* ── Firestore status → badge CSS class ──────────────────────────────────── */
export const statusBadge: Record<string, string> = {
  active:    "badge-red",
  routing:   "badge-amber",
  responded: "badge-green",
  resolved:  "badge-dim",
};

/* ── Format a Firestore Timestamp as "X min ago" ─────────────────────────── */
export function timeAgo(ts: any): string {
  try {
    const ms = Date.now() - ts.toMillis();
    const m  = Math.floor(ms / 60000);
    if (m < 1)  return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  } catch {
    return "";
  }
}

/* ── Incident type → emoji ───────────────────────────────────────────────── */
export function incidentEmoji(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("road") || t.includes("accident")) return "🚗";
  if (t.includes("medical"))                         return "🏥";
  if (t.includes("fire"))                            return "🔥";
  return "📍";
}

/* ── Confidence → priority string ────────────────────────────────────────── */
export function confToPriority(conf: number): "high" | "medium" | "low" {
  if (conf >= 75) return "high";
  if (conf >= 40) return "medium";
  return "low";
}