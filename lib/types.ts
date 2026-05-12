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
  createdAt:   Timestamp | null;
}