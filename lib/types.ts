// lib/types.ts
// Matches your Firestore document shapes exactly.
// Collection: "incidents"  →  IncidentDoc
// Collection: "reporters"  →  ReporterDoc

import { Timestamp } from "firebase/firestore";

export type IncidentStatus = "active" | "routing" | "responded" | "resolved";
export type Priority       = "high"   | "medium"  | "low";

export interface IncidentDoc {
  id:         string;          // Firestore doc ID
  type:       string;          // "Road Accident" | "Medical Emergency" | "Fire Hazard" | "Other"
  loc:        string;          // Human-readable address
  city:       string;
  lat:        number;
  lng:        number;
  conf:       number;          // 0–100 AI confidence score
  witnesses:  number;
  status:     IncidentStatus;
  priority:   Priority;
  responder:  string | null;   // name of assigned responder or null
  anonymous:  boolean;
  mediaUrl:   string | null;   // Cloudinary video URL
  createdAt:  Timestamp;
}

export interface ReporterDoc {
  id:        string;
  anonId:    string;           // e.g. "0x4F2"
  reports:   number;
  verified:  number;
  accuracy:  number;           // percentage 0–100
  pts:       number;
  createdAt: Timestamp;
}

// Derived helper used in the UI
export interface IncidentUI extends IncidentDoc {
  timeAgo: string;   // "2 min ago", "1 hr ago" etc.
}