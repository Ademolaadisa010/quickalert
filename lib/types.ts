// lib/types.ts
// Shared TypeScript types used across the app

import type { Timestamp } from "firebase/firestore";

/* ── Firestore incident document ──────────────────────────────────────────── */
export interface IncidentDoc {
  id:          string;
  type:        string;                          // "Road Accident" | "Medical Emergency" | etc.
  loc:         string;                          // human-readable address
  city:        string;
  lat:         number;
  lng:         number;
  accuracy:    number | null;                   // GPS accuracy in metres
  conf:        number;                          // AI confidence 0–100
  witnesses:   number;
  status:      "active" | "routing" | "responded" | "resolved";
  priority:    "high" | "medium" | "low";
  responder:   string | null;
  anonymous:   boolean;
  mediaUrl:    string | null;                   // Cloudinary video URL
  notes:       string;
  aiSummary:   string;
  aiLevel:     "LOW" | "MEDIUM" | "HIGH" | "";
  fake:        boolean;
  createdAt:    Timestamp | null;
  // dispatch fields (optional — set when incident is dispatched to a hospital)
  dispatchedTo: string | null;
  hospitalName: string | null;
  distKm:       number | null;
}

/* ── IncidentUI — IncidentDoc + derived UI fields ─────────────────────────── */
export interface IncidentUI extends IncidentDoc {
  timeAgo: string;   // e.g. "2m ago"
}

/* ── Firestore reporter document (leaderboard) ────────────────────────────── */
export interface ReporterDoc {
  id:       string;
  anonId:   string;   // e.g. "4F2A"
  pts:      number;
  reports:  number;
  accuracy: number;   // percentage 0–100
  createdAt: Timestamp | null;
}