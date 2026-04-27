// lib/utils.ts
import { Timestamp } from "firebase/firestore";
import type { IncidentStatus } from "./types";

/** Human-readable elapsed time from a Firestore Timestamp */
export function timeAgo(ts: Timestamp): string {
  const diffMs  = Date.now() - ts.toMillis();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1)  return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr  < 24) return `${diffHr} hr ago`;
  return `${Math.floor(diffHr / 24)} days ago`;
}

/** Colour based on AI confidence score */
export function confColor(c: number): string {
  if (c >= 75) return "var(--green)";
  if (c >= 50) return "var(--amber)";
  return "var(--red)";
}

/** Badge CSS class for incident status */
export const statusBadge: Record<IncidentStatus, string> = {
  active:    "badge-red",
  routing:   "badge-amber",
  responded: "badge-green",
  resolved:  "badge-dim",
};