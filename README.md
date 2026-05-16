# QuickAlert AI 🚨

> AI-powered emergency reporting and response platform — built with Next.js, Firebase, Gemini Vision, and Cloudinary.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth-orange?logo=firebase)](https://firebase.google.com)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-blue?logo=google)](https://aistudio.google.com)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Video%20Storage-purple)](https://cloudinary.com)

---

## What is QuickAlert AI?

QuickAlert AI is a real-time emergency reporting system that lets anyone record a **10-second live video** of an emergency, automatically analyses it with **Gemini AI vision**, captures GPS coordinates, uploads the video to **Cloudinary**, saves the incident to **Firestore**, and dispatches the alert to the **nearest verified hospital**.

Verified hospital staff register as responders, get approved by an admin, and receive live incoming alerts they can accept and respond to directly from the app.

---

## Features

| Feature | Description |
|---|---|
| 🎥 **Live video capture** | 10-second live camera recording — no gallery uploads allowed |
| 🤖 **Gemini AI analysis** | Frame extracted from video and analysed by Gemini 2.5 Flash vision |
| 📍 **Real GPS** | `navigator.geolocation` + OpenStreetMap reverse geocoding |
| ☁️ **Cloudinary upload** | Video stored securely with a public URL |
| 🔥 **Firestore real-time** | Incidents, dispatches, reporters — all live with `onSnapshot` |
| 🏥 **Hospital dispatch** | Nearest approved hospital found via Haversine distance formula |
| 🛡️ **Firebase Auth** | Responders sign up, admin approves, auth gates the responder dashboard |
| 🗺️ **Leaflet map** | Live incident map with OpenStreetMap tiles and hospital pins |
| 🖥️ **Admin dashboard** | Approve/reject responders, manage incidents, view analytics |
| 📊 **Dashboard** | Real-time KPIs, confidence sparkline, incident list, top reporters |

---

## Pages

```
/              → Landing page
/dashboard     → Live incident dashboard (public)
/report        → Submit emergency report (10s video + GPS + AI)
/map           → Real-time incident map (Leaflet)
/responder     → Responder portal (Firebase Auth required)
/profile       → User profile & settings
/admin         → Admin dashboard (Administrator role required)
```

---

## Tech Stack

- **Framework** — Next.js 16 (App Router, Turbopack)
- **Language** — TypeScript
- **Styling** — Inline CSS-in-JS (zero Tailwind dependency)
- **Database** — Firebase Firestore (real-time)
- **Auth** — Firebase Authentication (Email/Password)
- **AI** — Google Gemini 2.5 Flash (vision — free tier)
- **Storage** — Cloudinary (video upload)
- **Map** — Leaflet.js + OpenStreetMap
- **Geocoding** — Nominatim (free, no key needed)

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-username/quickalert.git
cd quickalert
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the project root:

```env
# ── Gemini AI (FREE) ─────────────────────────────────────────
# Get your free key at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=AIzaSy...

# ── Cloudinary ───────────────────────────────────────────────
# Dashboard → Settings → Upload → Add unsigned upload preset
# The preset MUST have "Video" resource type enabled
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset

# ── Firebase ─────────────────────────────────────────────────
# Firebase Console → Project Settings → Your apps → SDK setup
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 3. Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com) → create a project
2. Enable **Firestore Database** (start in test mode, then apply the rules below)
3. Enable **Authentication** → Email/Password provider
4. Copy your Firebase config into `.env.local`

#### Firestore collections

The app uses these collections automatically:

| Collection | Purpose |
|---|---|
| `incidents` | Emergency reports submitted by users |
| `dispatches` | Dispatch records sent to hospitals |
| `responders` | Hospital staff accounts (pending/approved/rejected) |
| `reporters` | Anonymous reporter leaderboard |

#### Firestore Security Rules

Go to Firestore → Rules tab and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() { return request.auth != null; }

    function isApprovedResponder() {
      return isSignedIn()
        && exists(/databases/$(database)/documents/responders/$(request.auth.uid))
        && get(/databases/$(database)/documents/responders/$(request.auth.uid)).data.status == "approved";
    }

    function isAdmin() {
      return isSignedIn()
        && exists(/databases/$(database)/documents/responders/$(request.auth.uid))
        && get(/databases/$(database)/documents/responders/$(request.auth.uid)).data.role == "Administrator"
        && get(/databases/$(database)/documents/responders/$(request.auth.uid)).data.status == "approved";
    }

    match /incidents/{id} {
      allow read:   if true;
      allow create: if true;
      allow update: if isApprovedResponder() || isAdmin();
      allow delete: if isAdmin();
    }

    match /dispatches/{id} {
      allow read:   if isApprovedResponder() || isAdmin();
      allow create: if true;
      allow update: if isApprovedResponder() || isAdmin();
      allow delete: if isAdmin();
    }

    match /responders/{uid} {
      allow read: if (isSignedIn() && request.auth.uid == uid) || isAdmin();
      allow create: if isSignedIn() && request.auth.uid == uid;
      allow update: if isAdmin()
        || (isSignedIn() && request.auth.uid == uid
            && request.resource.data.status == resource.data.status);
      allow delete: if isAdmin();
    }

    match /reporters/{id} {
      allow read, create, update: if true;
      allow delete: if false;
    }

    match /admin/{id} {
      allow read, write: if isAdmin();
    }
  }
}
```

### 4. Create the admin account

**Step 1** — Firebase Console → Authentication → Users → **Add user**
- Enter an email and password
- Copy the generated **UID**

**Step 2** — Firestore → `responders` collection → **Add document**
- Document ID: the UID you copied
- Fields:

| Field | Value |
|---|---|
| `name` | `QuickAlert Admin` |
| `email` | your admin email |
| `role` | `Administrator` |
| `hospital` | `QuickAlert HQ` |
| `hospitalCity` | your city |
| `phone` | your phone |
| `licenseId` | `ADMIN-001` |
| `status` | `approved` |
| `createdAt` | *(timestamp — today)* |

**Step 3** — Go to `http://localhost:3000/admin` and sign in.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How a Report Works

```
User opens /report
    ↓
Selects incident type
    ↓
GPS acquired (navigator.geolocation → Nominatim reverse geocode)
    ↓
Opens live camera (getUserMedia)
    ↓
Records 10-second video (MediaRecorder)
    ↓
Reviews playback → clicks "Send this alert"
    ↓
[Concurrent]
  ├── Frame extracted from video (canvas)  →  POST /api/analyze (Gemini Vision)
  └── Video blob → base64                  →  POST /api/upload  (Cloudinary)
    ↓
AI result: verdict (YES/NO), confidence %, what Gemini sees, checks
    ↓
Incident saved to Firestore (incidents collection)
    ↓
Nearest approved hospital found (Haversine formula)
    ↓
Dispatch written to Firestore (dispatches collection)
    ↓
Success screen shows: hospital name, distance, video thumbnail, AI summary
```

---

## How Responder Approval Works

```
Responder visits /responder → clicks "Create Account"
    ↓
Fills form: name, email, password, role, hospital, city, phone, license ID
    ↓
Firebase Auth account created + Firestore responders/{uid} doc created
    ↓ status: "pending"
Admin logs into /admin → Responders tab → clicks ✓ Approve
    ↓ status: "approved"
Responder signs in → gets full access to live incoming alerts
```

---

## Project Structure

```
quickalert/
├── app/
│   ├── admin/          # Admin dashboard (approve responders, manage incidents)
│   ├── api/
│   │   ├── analyze/    # POST — Gemini AI vision analysis
│   │   └── upload/     # POST — Cloudinary video upload
│   ├── dashboard/      # Live KPI dashboard (Firestore real-time)
│   ├── map/            # Leaflet incident map
│   ├── profile/        # User profile & settings
│   ├── report/         # Emergency report flow (video + GPS + AI)
│   ├── responder/      # Responder portal (Firebase Auth gated)
│   └── page.tsx        # Landing page
├── lib/
│   ├── firebase.ts     # Firebase app init (db + auth exports)
│   ├── types.ts        # Shared TypeScript interfaces
│   ├── utils.ts        # confColor, statusBadge, timeAgo, etc.
│   └── data.ts         # Static mock data (used for fallback UI)
├── .env.local          # Your secret keys (never commit this)
├── firestore.rules     # Copy-paste into Firebase Console
└── README.md
```

---

## API Routes

### `POST /api/analyze`

Analyses a video frame with Gemini Vision AI.

**Request body:**
```json
{
  "frameDataUrl": "data:image/jpeg;base64,...",
  "incidentType": "Road Accident",
  "gpsLat": 7.38,
  "gpsLng": 3.94,
  "gpsAccuracy": 5,
  "notes": "Two vehicles involved"
}
```

**Response:**
```json
{
  "verdict": "YES",
  "confidence": 87,
  "level": "HIGH",
  "fake": false,
  "whatISee": "Two vehicles with visible front-end collision damage on a road.",
  "summary": "YES — this image shows a road accident with vehicle damage. Confidence is HIGH.",
  "checks": {
    "imageAnalysis":  { "passed": true, "detail": "Collision damage visible" },
    "gpsConsistency": { "passed": true, "detail": "GPS recorded: 7.38° N, 3.94° E" },
    "patternMatch":   { "passed": true, "detail": "Visual matches Road Accident type" }
  }
}
```

### `POST /api/upload`

Uploads a video to Cloudinary.

**Request body:**
```json
{
  "data": "data:video/webm;base64,...",
  "resourceType": "video",
  "folder": "quickalert/videos"
}
```

**Response:**
```json
{
  "url": "https://res.cloudinary.com/...",
  "publicId": "quickalert/videos/abc123",
  "duration": 10,
  "width": 1280,
  "height": 960,
  "resourceType": "video"
}
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ | Google Gemini API key (free at aistudio.google.com) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ✅ | Your Cloudinary cloud name |
| `CLOUDINARY_UPLOAD_PRESET` | ✅ | Unsigned upload preset (video enabled) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ✅ | Firebase project API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ✅ | Firestore project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ✅ | Firebase app ID |

---

## Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Add all environment variables in **Vercel → Settings → Environment Variables**.

### Self-hosted

```bash
npm run build
npm start
```

> ⚠️ The `/api/analyze` route has a 30s timeout — make sure your host supports it.

---

## License

MIT — free to use, modify, and deploy.

---

## Contributing

Pull requests welcome. For major changes, open an issue first.

---

*Built with ❤️ for faster emergency response.*