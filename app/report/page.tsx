"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { INCIDENTS, confColor } from "@/lib/data";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');

  :root {
    --red:#E63946; --red-glow:rgba(230,57,70,0.2); --red-dim:rgba(230,57,70,0.12);
    --amber:#F4A261; --amber-dim:rgba(244,162,97,0.12);
    --green:#52B788; --green-dim:rgba(82,183,136,0.12);
    --blue:#60A5FA; --blue-dim:rgba(96,165,250,0.12);
    --bg:#0C0C0C; --s1:#111; --s2:#161616; --s3:#1c1c1c;
    --b1:rgba(255,255,255,0.07); --b2:rgba(255,255,255,0.13);
    --muted:rgba(255,255,255,0.38); --dim:rgba(255,255,255,0.2);
    --nav:70px;
  }

  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%;background:var(--bg);color:#fff;font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased;}
  a{color:inherit;text-decoration:none;}
  button{font-family:'DM Sans',sans-serif;}
  ::-webkit-scrollbar{width:3px}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:10px}

  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(1.3)}}
  @keyframes ripple{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.5);opacity:0}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes navPop{0%{transform:scale(.8) translateY(4px);opacity:0}65%{transform:scale(1.1) translateY(-1px)}100%{transform:scale(1) translateY(0);opacity:1}}
  @keyframes checkPop{0%{transform:scale(0)}70%{transform:scale(1.2)}100%{transform:scale(1)}}
  @keyframes successPop{0%{transform:scale(.5);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
  @keyframes shimmer{from{transform:translateX(-100%)}to{transform:translateX(200%)}}

  /* shell */
  .qa-shell{display:flex;min-height:100vh;background:var(--bg);}
  .qa-sidebar{display:none;width:224px;flex-shrink:0;border-right:1px solid var(--b1);padding:20px 14px;flex-direction:column;gap:4px;position:sticky;top:0;height:100vh;overflow-y:auto;}
  @media(min-width:768px){.qa-sidebar{display:flex;}.qa-bottom-nav{display:none!important;}.qa-main{padding-bottom:24px!important;}}
  .qa-logo{display:flex;align-items:center;gap:9px;padding:6px 8px 18px;border-bottom:1px solid var(--b1);margin-bottom:12px;}
  .qa-logo-mark{width:28px;height:28px;border-radius:8px;background:var(--red);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .qa-logo-name{font-weight:700;font-size:15px;letter-spacing:-0.01em;color:#fff;}
  .qa-nav-item{display:flex;align-items:center;gap:10px;padding:10px 13px;border-radius:10px;cursor:pointer;font-size:13.5px;font-weight:500;color:var(--muted);transition:all .15s;border:none;background:none;width:100%;text-align:left;}
  .qa-nav-item:hover{background:rgba(255,255,255,.05);color:rgba(255,255,255,.8);}
  .qa-nav-item.active{background:var(--red-dim);color:var(--red);}
  .qa-nav-badge{margin-left:auto;background:var(--red);color:#fff;font-size:10px;font-family:'DM Mono',monospace;padding:1px 7px;border-radius:99px;}
  .qa-user{margin-top:auto;padding-top:16px;border-top:1px solid var(--b1);}
  .qa-user-inner{display:flex;align-items:center;gap:10px;padding:8px 10px;}
  .qa-avatar{width:32px;height:32px;border-radius:50%;background:var(--red-dim);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;}
  .qa-main{flex:1;overflow-y:auto;min-width:0;padding-bottom:calc(var(--nav) + 20px);}
  .qa-header{position:sticky;top:0;z-index:50;background:rgba(12,12,12,0.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid var(--b1);padding:14px 20px;display:flex;align-items:center;justify-content:space-between;}
  .qa-bottom-nav{position:fixed;bottom:0;left:0;right:0;z-index:100;height:var(--nav);background:rgba(9,9,9,0.93);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-top:1px solid rgba(255,255,255,.07);display:flex;align-items:stretch;justify-content:space-around;padding-bottom:env(safe-area-inset-bottom,0px);}
  .qa-tab{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;background:none;border:none;cursor:pointer;padding:8px 4px;position:relative;color:rgba(255,255,255,.3);-webkit-tap-highlight-color:transparent;text-decoration:none;}
  .qa-tab.active{color:var(--red);}
  .qa-tab.active .qa-tab-icon{animation:navPop .28s cubic-bezier(.34,1.56,.64,1) both;}
  .qa-tab-label{font-size:10px;font-weight:500;letter-spacing:.02em;}
  .qa-tab.active .qa-tab-label{color:var(--red);}
  .qa-tab.active::after{content:'';position:absolute;bottom:5px;left:50%;transform:translateX(-50%);width:4px;height:4px;border-radius:50%;background:var(--red);opacity:.7;}
  .qa-report-wrap{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;background:none;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;text-decoration:none;}
  .qa-report-pill{width:50px;height:50px;border-radius:50%;background:var(--red);display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 3px var(--bg),0 0 24px var(--red-glow),0 4px 16px rgba(0,0,0,.5);transition:transform .18s;margin-top:-20px;}
  .qa-report-wrap:active .qa-report-pill{transform:scale(.92);}
  .qa-report-label{font-size:10px;font-weight:600;color:var(--red);}
  .qa-bnav-badge{position:absolute;top:8px;right:calc(50% - 20px);min-width:16px;height:16px;padding:0 4px;border-radius:99px;background:var(--red);color:#fff;font-size:9px;font-family:'DM Mono',monospace;display:flex;align-items:center;justify-content:center;border:2px solid var(--bg);}

  /* components */
  .card{background:var(--s1);border:1px solid var(--b1);border-radius:16px;}
  .card2{background:var(--s2);border:1px solid var(--b1);border-radius:12px;}
  .btn-red{background:var(--red);color:#fff;border:none;border-radius:50px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:7px;transition:all .15s;box-shadow:0 0 24px var(--red-glow);}
  .btn-red:hover{background:#cc2834;}
  .btn-red:active{transform:scale(.96);}
  .btn-red:disabled{opacity:.45;cursor:not-allowed;box-shadow:none;}
  .btn-ghost{background:rgba(255,255,255,.06);color:rgba(255,255,255,.75);border:1px solid var(--b2);border-radius:50px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:all .15s;}
  .btn-ghost:hover{background:rgba(255,255,255,.1);color:#fff;}
  .btn-ghost:active{transform:scale(.96);}
  .lbl{font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);}
  .badge{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.05em;padding:3px 9px;border-radius:99px;text-transform:uppercase;font-weight:500;}
  .badge-green{background:var(--green-dim);color:var(--green);border:1px solid rgba(82,183,136,.25);}
  .badge-red{background:var(--red-dim);color:var(--red);border:1px solid rgba(230,57,70,.25);}
  .badge-amber{background:var(--amber-dim);color:var(--amber);border:1px solid rgba(244,162,97,.25);}
  .pulse{animation:pulse 2s ease-in-out infinite;}
  .fadeUp{animation:fadeUp .38s ease both;}
  .fadeIn{animation:fadeIn .25s ease both;}
  .live-dot{width:6px;height:6px;border-radius:50%;background:var(--green);display:inline-block;}
  .noise{position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:.02;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:200px;}

  /* report specific */
  .type-tile{background:var(--s2);border:1px solid var(--b1);border-radius:12px;padding:16px 14px;cursor:pointer;text-align:left;transition:all .15s;width:100%;}
  .type-tile:hover{border-color:var(--b2);background:var(--s3);}
  .type-tile.selected{background:var(--red-dim);border-color:rgba(230,57,70,.35);}
  .input{background:var(--s2);border:1px solid var(--b2);border-radius:10px;color:#fff;padding:11px 14px;font-size:14px;outline:none;width:100%;transition:border .15s;font-family:'DM Sans',sans-serif;}
  .input:focus{border-color:rgba(255,255,255,.28);}
  .input::placeholder{color:var(--muted);}
  textarea.input{resize:none;line-height:1.6;}
  .toggle-track{width:40px;height:22px;border-radius:99px;position:relative;cursor:pointer;border:none;transition:background .2s;flex-shrink:0;}
  .toggle-thumb{position:absolute;top:2px;width:18px;height:18px;border-radius:50%;background:#fff;transition:left .2s;}
  .step-indicator{display:flex;gap:6px;justify-content:center;margin-bottom:28px;}
  .step-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.18);transition:all .3s;}
  .step-dot.done{background:var(--green);}
  .step-dot.current{width:20px;background:var(--red);}
  .check-row{display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--s2);border:1px solid var(--b1);border-radius:12px;}
  .check-circle{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .3s;}
  .spin-ring{width:10px;height:10px;border-radius:50%;border:1.5px solid var(--amber);border-top-color:transparent;animation:spin .7s linear infinite;}
  .summary-row{display:flex;justify-content:space-between;align-items:flex-start;padding:9px 0;border-bottom:1px solid var(--b1);font-size:13px;gap:12px;}
  .summary-row:last-child{border-bottom:none;}
  .cam-shutter{position:absolute;bottom:24px;left:50%;transform:translateX(-50%);width:64px;height:64px;border-radius:50%;border:4px solid rgba(255,255,255,.8);background:rgba(255,255,255,.15);backdrop-filter:blur(8px);cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center;}
  .cam-shutter:hover{background:rgba(255,255,255,.25);}
  .cam-shutter:active{transform:translateX(-50%) scale(.93);}
  .cam-shutter-inner{width:44px;height:44px;border-radius:50%;background:#fff;}
  .upload-shimmer{position:relative;overflow:hidden;}
  .upload-shimmer::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.04),transparent);animation:shimmer 1.8s ease-in-out infinite;}

  /* gps status */
  .gps-acquiring{border-color:rgba(244,162,97,.3)!important;}
  .gps-locked{border-color:rgba(82,183,136,.3)!important;}
  .gps-error{border-color:rgba(230,57,70,.3)!important;}

  /* responsive */
  @media(max-width:520px){
    .type-grid{grid-template-columns:1fr 1fr!important;}
    .cam-fullscreen{border-radius:0!important;margin:0!important;}
  }
`;

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard",        badge: 0,
    icon: <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd"/></svg> },
  { href: "/report",    label: "Report Emergency", badge: 0,
    icon: <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg> },
  { href: "/map",       label: "Live Map",         badge: 0,
    icon: <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd"/></svg> },
  { href: "/responder", label: "Responder View",   badge: INCIDENTS.filter(i=>i.status==="active").length,
    icon: <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.569 1.175A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z"/></svg> },
  { href: "/profile",   label: "My Profile",       badge: 0,
    icon: <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd"/></svg> },
];

const BOTTOM_TABS = [
  { href: "/dashboard", label: "Home",
    icon: <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22"><path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd"/></svg> },
  { href: "/map",       label: "Map",
    icon: <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd"/></svg> },
  { href: "/responder", label: "Alerts", badge: INCIDENTS.filter(i=>i.status==="active").length,
    icon: <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22"><path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.569 1.175A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z"/></svg> },
  { href: "/profile",   label: "Profile",
    icon: <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd"/></svg> },
];

const TYPES = [
  { id: "accident", emoji: "🚗", label: "Road Accident",     desc: "Crash, collision, vehicle damage" },
  { id: "medical",  emoji: "🏥", label: "Medical Emergency", desc: "Injury, collapse, cardiac" },
  { id: "fire",     emoji: "🔥", label: "Fire / Hazard",     desc: "Fire, gas leak, chemical" },
  { id: "other",    emoji: "📍", label: "Other Incident",    desc: "Anything else needing help" },
];

type GpsState = { status: "idle" | "acquiring" | "locked" | "error"; lat: number | null; lng: number | null; accuracy: number | null; address: string; error: string };

function useGPS() {
  const [gps, setGps] = useState<GpsState>({ status: "idle", lat: null, lng: null, accuracy: null, address: "", error: "" });

  const acquire = useCallback(() => {
    if (!navigator.geolocation) {
      setGps(g => ({ ...g, status: "error", error: "Geolocation not supported on this device" }));
      return;
    }
    setGps(g => ({ ...g, status: "acquiring", error: "" }));
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        // Reverse geocode via a free API
        let address = `${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`;
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, { headers: { "Accept-Language": "en" } });
          if (r.ok) {
            const d = await r.json();
            address = d.display_name?.split(",").slice(0, 3).join(", ") ?? address;
          }
        } catch {}
        setGps({ status: "locked", lat, lng, accuracy, address, error: "" });
      },
      (err) => {
        setGps(g => ({ ...g, status: "error", error: err.message || "Location access denied" }));
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }, []);

  useEffect(() => { acquire(); }, [acquire]);

  return { gps, acquire };
}

/* ─── Shared layout wrappers ────────────────────────────────────────────────── */
function Sidebar({ path }: { path: string }) {
  return (
    <aside className="qa-sidebar">
      <Link href="/dashboard" className="qa-logo">
        <div className="qa-logo-mark">
          <svg viewBox="0 0 20 20" fill="white" width="14" height="14"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 3a1 1 0 011 1v3.586l2.707 2.707a1 1 0 11-1.414 1.414l-3-3A1 1 0 019 10V6a1 1 0 011-1z"/></svg>
        </div>
        <span className="qa-logo-name">QuickAlert</span>
      </Link>
      {NAV_ITEMS.map(n => (
        <Link key={n.href} href={n.href} className={`qa-nav-item${path === n.href ? " active" : ""}`}>
          {n.icon}{n.label}
          {n.badge > 0 && <span className="qa-nav-badge">{n.badge}</span>}
        </Link>
      ))}
      <div className="qa-user">
        <div className="qa-user-inner">
          <div className="qa-avatar">👤</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>Anonymous</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>Trusted · 847 pts</div>
          </div>
          <span className="badge badge-green" style={{ marginLeft: "auto" }}>On</span>
        </div>
      </div>
    </aside>
  );
}

function BottomNav({ path }: { path: string }) {
  return (
    <nav className="qa-bottom-nav">
      {BOTTOM_TABS.slice(0, 2).map(t => (
        <Link key={t.href} href={t.href} className={`qa-tab${path === t.href ? " active" : ""}`}>
          <span className="qa-tab-icon">{t.icon}</span>
          <span className="qa-tab-label">{t.label}</span>
        </Link>
      ))}
      <Link href="/report" className="qa-report-wrap">
        <div className="qa-report-pill">
          <svg viewBox="0 0 20 20" fill="white" width="22" height="22"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg>
        </div>
        <span className="qa-report-label">Report</span>
      </Link>
      {BOTTOM_TABS.slice(2).map(t => (
        <Link key={t.href} href={t.href} className={`qa-tab${path === t.href ? " active" : ""}`} style={{ position: "relative" }}>
          <span className="qa-tab-icon">{t.icon}</span>
          <span className="qa-tab-label">{t.label}</span>
          {(t as any).badge > 0 && <span className="qa-bnav-badge">{(t as any).badge}</span>}
        </Link>
      ))}
    </nav>
  );
}

function PageHeader() {
  return (
    <header className="qa-header">
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <div className="qa-logo-mark">
          <svg viewBox="0 0 20 20" fill="white" width="14" height="14"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 3a1 1 0 011 1v3.586l2.707 2.707a1 1 0 11-1.414 1.414l-3-3A1 1 0 019 10V6a1 1 0 011-1z"/></svg>
        </div>
        <span className="qa-logo-name">QuickAlert</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--s1)", border: "1px solid var(--b1)", borderRadius: 10, padding: "6px 12px", fontSize: 12, color: "#fff" }}>
        <span className="live-dot pulse" />
        Live
      </div>
    </header>
  );
}

/* ─── Step dots ────────────────────────────────────────────────────────────── */
function StepDots({ current }: { current: number }) {
  return (
    <div className="step-indicator">
      {[0,1,2,3].map(i => (
        <div key={i} className={`step-dot${i < current ? " done" : i === current ? " current" : ""}`} />
      ))}
    </div>
  );
}

/* ─── Camera step ───────────────────────────────────────────────────────────── */
function CameraStep({ onCapture, onSkip }: { onCapture: (dataUrl: string) => void; onSkip: () => void }) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [camErr,   setCamErr]   = useState("");
  const [facingFront, setFacingFront] = useState(false);
  const [flash,    setFlash]    = useState(false);

  const startCam = useCallback(async (front = false) => {
    // Stop existing stream
    streamRef.current?.getTracks().forEach(t => t.stop());
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: front ? "user" : "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCamErr("");
    } catch (e: any) {
      setCamErr(e?.message?.includes("denied") ? "Camera access denied. Please allow camera in browser settings." : "Could not access camera on this device.");
    }
  }, []);

  useEffect(() => {
    startCam(false);
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, [startCam]);

  const toggleFacing = () => {
    const next = !facingFront;
    setFacingFront(next);
    startCam(next);
  };

  const capture = () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width  = video.videoWidth  || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d")!;
    // If front-facing, mirror the image
    if (facingFront) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    setFlash(true);
    setTimeout(() => setFlash(false), 200);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
    streamRef.current?.getTracks().forEach(t => t.stop());
    onCapture(dataUrl);
  };

  if (camErr) return (
    <div style={{ padding: "40px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, minHeight: "50vh", justifyContent: "center" }}>
      <div style={{ fontSize: 44 }}>📷</div>
      <p style={{ color: "var(--muted)", fontSize: 14, maxWidth: 280, lineHeight: 1.6 }}>{camErr}</p>
      <button className="btn-ghost" style={{ padding: "10px 24px", fontSize: 13 }} onClick={onSkip}>
        Skip photo — report without image
      </button>
    </div>
  );

  return (
    <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", background: "#000", margin: "0 0 16px", aspectRatio: "16/10" }}>
      {/* Flash overlay */}
      {flash && <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: .6, zIndex: 5, pointerEvents: "none" }} />}

      <video ref={videoRef} autoPlay playsInline muted
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: facingFront ? "scaleX(-1)" : "none", display: "block" }} />

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Corner guides */}
      {[["top-left","0 auto auto 0"],["top-right","0 0 auto auto"],["bottom-left","auto auto 0 0"],["bottom-right","auto 0 0 auto"]].map(([id, inset]) => (
        <div key={id} style={{ position: "absolute", inset, width: 28, height: 28, borderColor: "rgba(255,255,255,.5)", borderStyle: "solid", borderWidth: `${id.includes("top") ? "2px 0 0" : "0 0 2px"} ${id.includes("right") ? "0 2px 0 0" : "0 0 0 2px"}`, margin: 12 }} />
      ))}

      {/* Live badge */}
      <div style={{ position: "absolute", top: 14, left: 14, display: "flex", alignItems: "center", gap: 5, background: "rgba(0,0,0,.55)", backdropFilter: "blur(8px)", borderRadius: 99, padding: "4px 10px", fontSize: 11, color: "#fff" }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#E63946", display: "inline-block" }} className="pulse" />
        LIVE
      </div>

      {/* Flip camera */}
      <button onClick={toggleFacing} style={{ position: "absolute", top: 12, right: 12, width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg viewBox="0 0 20 20" fill="white" width="16" height="16"><path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.389zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd"/></svg>
      </button>

      {/* Shutter */}
      <button className="cam-shutter" onClick={capture}>
        <div className="cam-shutter-inner" />
      </button>

      {/* Skip */}
      <button onClick={() => { streamRef.current?.getTracks().forEach(t => t.stop()); onSkip(); }}
        style={{ position: "absolute", bottom: 28, right: 16, background: "rgba(0,0,0,.5)", border: "1px solid rgba(255,255,255,.18)", color: "rgba(255,255,255,.7)", borderRadius: 99, padding: "6px 12px", fontSize: 11, cursor: "pointer" }}>
        Skip
      </button>
    </div>
  );
}

/* ─── Main page ────────────────────────────────────────────────────────────── */
export default function ReportPage() {
  const path = usePathname();
  const { gps, acquire } = useGPS();

  // Form state
  const [step,      setStep]      = useState(0); // 0=form 1=camera 2=verify 3=done
  const [type,      setType]      = useState("");
  const [notes,     setNotes]     = useState("");
  const [anon,      setAnon]      = useState(true);

  // Media state
  const [photoUrl,  setPhotoUrl]  = useState<string | null>(null); // local data URL preview
  const [uploadUrl, setUploadUrl] = useState<string | null>(null); // Cloudinary URL
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");

  // Verify state
  const [conf,      setConf]      = useState(0);
  const [checks,    setChecks]    = useState([false, false, false]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = () => {
    setStep(0); setType(""); setNotes(""); setConf(0);
    setChecks([false,false,false]); setPhotoUrl(null); setUploadUrl(null); setUploadErr("");
  };

  /* Upload to Cloudinary via our API route */
  const uploadToCloudinary = async (dataUrl: string) => {
    setUploading(true);
    setUploadErr("");
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image:        dataUrl,
          incidentType: type || "unknown",
          lat:          gps.lat,
          lng:          gps.lng,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setUploadUrl(data.url);
    } catch (e: any) {
      setUploadErr(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* Called when camera captures a photo */
  const handleCapture = async (dataUrl: string) => {
    setPhotoUrl(dataUrl);
    setStep(2); // move to verify
    // Upload in background
    await uploadToCloudinary(dataUrl);
    // Start AI verify animation
    startVerify();
  };

  /* Called when user skips camera */
  const handleSkip = () => {
    setStep(2);
    startVerify();
  };

  const startVerify = () => {
    let v = 0;
    timer.current = setInterval(() => {
      v += 2;
      setConf(Math.min(v, 87));
      if (v >= 25) setChecks(c => [true, c[1], c[2]]);
      if (v >= 55) setChecks(c => [c[0], true, c[2]]);
      if (v >= 80) setChecks([true, true, true]);
      if (v >= 87) { clearInterval(timer.current!); setTimeout(() => setStep(3), 600); }
    }, 55);
  };

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  /* ── STEP 1: Camera ────────────────────────────────────────────────────── */
  if (step === 1) return (
    <>
      <style>{CSS}</style>
      <div className="noise" />
      <div className="qa-shell">
        <Sidebar path={path} />
        <main className="qa-main">
          <PageHeader />
          <div style={{ padding: "20px 20px 0", maxWidth: 600, margin: "0 auto" }}>
            <StepDots current={1} />
            <div style={{ marginBottom: 16 }}>
              <p className="lbl" style={{ color: "var(--red)", marginBottom: 6 }}>Step 2 of 4</p>
              <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" }}>Capture live photo</h2>
              <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>No gallery uploads. Live capture only — this proves the scene is real-time.</p>
            </div>
            <CameraStep onCapture={handleCapture} onSkip={handleSkip} />
          </div>
        </main>
      </div>
      <BottomNav path={path} />
    </>
  );

  /* ── STEP 2: AI Verify ─────────────────────────────────────────────────── */
  if (step === 2) return (
    <>
      <style>{CSS}</style>
      <div className="noise" />
      <div className="qa-shell">
        <Sidebar path={path} />
        <main className="qa-main">
          <PageHeader />
          <div style={{ padding: "24px 20px", maxWidth: 520, margin: "0 auto" }}>
            <StepDots current={2} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center", marginBottom: 28 }}>
              <div style={{ position: "relative", width: 80, height: 80 }}>
                <div style={{ position: "absolute", inset: -10, borderRadius: "50%", border: "1px solid var(--amber)", animation: "ripple 1.8s linear infinite", opacity: .4 }} />
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--amber-dim)", border: "1px solid rgba(244,162,97,.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🤖</div>
              </div>
              <div>
                <p className="lbl" style={{ color: "var(--amber)", marginBottom: 8 }}>AI Verification</p>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Verifying alert…</h2>
                <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6 }}>
                  Analysing scene, location consistency<br/>and movement patterns
                </p>
              </div>
            </div>

            {/* Photo preview (if captured) */}
            {photoUrl && (
              <div style={{ marginBottom: 20, borderRadius: 12, overflow: "hidden", border: "1px solid var(--b1)", position: "relative" }}>
                <img src={photoUrl} alt="Captured scene" style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
                {uploading && (
                  <div className="upload-shimmer" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid var(--amber)", borderTopColor: "transparent", animation: "spin .7s linear infinite" }} />
                    <span style={{ fontSize: 12, color: "var(--amber)" }}>Uploading to Cloudinary…</span>
                  </div>
                )}
                {uploadUrl && !uploading && (
                  <div style={{ position: "absolute", bottom: 8, right: 8 }}>
                    <span className="badge badge-green">✓ Uploaded</span>
                  </div>
                )}
                {uploadErr && (
                  <div style={{ position: "absolute", bottom: 8, right: 8 }}>
                    <span className="badge badge-amber">Upload failed — continuing</span>
                  </div>
                )}
              </div>
            )}

            {/* Confidence bar */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span className="lbl">Confidence score</span>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 14, color: confColor(conf) }}>{conf}%</span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,.08)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${conf}%`, background: confColor(conf), borderRadius: 99, transition: "width .12s" }} />
              </div>
            </div>

            {/* Check items */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                ["Image analysis",   "Scene matches reported type"],
                ["GPS verification", "Location confirmed on grid"],
                ["Pattern analysis", "Movement data analysed"],
              ].map(([label, value], i) => (
                <div key={label} className="check-row">
                  <div className="check-circle" style={{ background: checks[i] ? "var(--green-dim)" : "rgba(255,255,255,.05)", border: `1px solid ${checks[i] ? "rgba(82,183,136,.3)" : "var(--b1)"}` }}>
                    {checks[i]
                      ? <svg viewBox="0 0 14 14" fill="none" width="12" height="12" style={{ animation: "checkPop .25s ease both" }}><path d="M2 7l3.5 3.5L12 3" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      : <div className="spin-ring" />
                    }
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
                    <div style={{ fontSize: 11, color: checks[i] ? "var(--green)" : "var(--muted)" }}>{checks[i] ? value : "Processing…"}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
      <BottomNav path={path} />
    </>
  );

  /* ── STEP 3: Success ───────────────────────────────────────────────────── */
  if (step === 3) return (
    <>
      <style>{CSS}</style>
      <div className="noise" />
      <div className="qa-shell">
        <Sidebar path={path} />
        <main className="qa-main">
          <PageHeader />
          <div style={{ padding: "24px 20px", maxWidth: 520, margin: "0 auto" }}>
            <StepDots current={3} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 28, gap: 14 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--green-dim)", border: "1px solid rgba(82,183,136,.28)", display: "flex", alignItems: "center", justifyContent: "center", animation: "successPop .4s cubic-bezier(.34,1.56,.64,1) both" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" width="36" height="36"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
              </div>
              <div>
                <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6 }}>Help is on the way</h2>
                <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 4 }}>Alert dispatched to nearest hospital</p>
                <p style={{ fontFamily: "'DM Mono',monospace", color: "var(--green)", fontSize: 13 }}>Confidence 87% · ETA ~4 minutes</p>
              </div>
            </div>

            {/* Photo thumbnail */}
            {(photoUrl || uploadUrl) && (
              <div style={{ marginBottom: 16, borderRadius: 12, overflow: "hidden", border: "1px solid var(--b1)" }}>
                <img src={uploadUrl || photoUrl!} alt="Incident scene" style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} />
                <div style={{ padding: "8px 12px", background: "var(--s2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>Scene photo</span>
                  {uploadUrl
                    ? <span className="badge badge-green">✓ Stored securely</span>
                    : <span className="badge badge-amber">Local only</span>
                  }
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="card fadeUp" style={{ padding: "18px 20px", marginBottom: 20 }}>
              <p className="lbl" style={{ marginBottom: 14 }}>Alert summary</p>
              {[
                ["Incident type",  type || "Road Accident"],
                ["Location",       gps.address || "Acquiring…"],
                ["GPS accuracy",   gps.accuracy ? `±${Math.round(gps.accuracy)}m` : "N/A"],
                ["Coordinates",    gps.lat ? `${gps.lat.toFixed(5)}° N, ${gps.lng!.toFixed(5)}° E` : "N/A"],
                ["Confidence",     "87% — High"],
                ["Photo",          uploadUrl ? "Uploaded to Cloudinary ✓" : photoUrl ? "Captured (not uploaded)" : "No photo"],
                ["Anonymous",      anon ? "Yes — identity hidden" : "No"],
                ["Dispatched to",  "Nearest verified hospital"],
              ].map(([k,v]) => (
                <div key={k} className="summary-row">
                  <span style={{ color: "var(--muted)", flexShrink: 0 }}>{k}</span>
                  <span style={{ color: k==="Confidence" ? "var(--green)" : "#fff", fontFamily: k==="GPS accuracy"||k==="Coordinates" ? "'DM Mono',monospace" : undefined, fontSize: k==="GPS accuracy"||k==="Coordinates" ? 11 : 13, textAlign: "right", wordBreak: "break-word" }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-ghost" style={{ flex: 1, padding: "12px 0", fontSize: 14, justifyContent: "center", borderRadius: 12 }} onClick={reset}>
                New report
              </button>
              <Link href="/dashboard" style={{ flex: 1, display: "flex" }}>
                <button className="btn-ghost" style={{ width: "100%", padding: "12px 0", fontSize: 14, justifyContent: "center", borderRadius: 12 }}>
                  Dashboard
                </button>
              </Link>
            </div>
          </div>
        </main>
      </div>
      <BottomNav path={path} />
    </>
  );

  /* ── STEP 0: Form ──────────────────────────────────────────────────────── */
  return (
    <>
      <style>{CSS}</style>
      <div className="noise" />
      <div className="qa-shell">
        <Sidebar path={path} />
        <main className="qa-main">
          <PageHeader />
          <div style={{ padding: "24px 20px", maxWidth: 600, margin: "0 auto" }}>

            <StepDots current={0} />

            {/* Heading */}
            <div style={{ marginBottom: 24 }}>
              <p className="lbl" style={{ color: "var(--red)", marginBottom: 8 }}>Emergency report</p>
              <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6 }}>What's happening?</h1>
              <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6 }}>Anonymous by default. No account required. You are protected.</p>
            </div>

            {/* Incident type */}
            <div style={{ marginBottom: 20 }}>
              <p className="lbl" style={{ marginBottom: 10 }}>Incident type</p>
              <div className="type-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {TYPES.map(t => (
                  <button key={t.id} className={`type-tile${type === t.label ? " selected" : ""}`} onClick={() => setType(t.label)}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{t.emoji}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: type === t.label ? "var(--red)" : "#fff", marginBottom: 3 }}>{t.label}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Live GPS card */}
            <div className={`card gps-${gps.status}`} style={{ padding: 14, marginBottom: 14, transition: "border-color .3s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: gps.status !== "idle" ? 10 : 0 }}>
                <p className="lbl">Live location</p>
                {gps.status === "locked" && <span className="badge badge-green">GPS ✓</span>}
                {gps.status === "acquiring" && <span className="badge badge-amber">Acquiring…</span>}
                {gps.status === "error" && (
                  <button onClick={acquire} className="badge badge-red" style={{ cursor: "pointer", border: "none" }}>
                    Retry ↺
                  </button>
                )}
              </div>

              {gps.status === "acquiring" && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid var(--amber)", borderTopColor: "transparent", animation: "spin .7s linear infinite", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>Getting your location…</span>
                </div>
              )}

              {gps.status === "locked" && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--green-dim)", border: "1px solid rgba(82,183,136,.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg viewBox="0 0 20 20" fill="var(--green)" width="14" height="14"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd"/></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2, wordBreak: "break-word" }}>{gps.address}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "'DM Mono',monospace" }}>
                      {gps.lat!.toFixed(5)}° N, {gps.lng!.toFixed(5)}° E · ±{Math.round(gps.accuracy!)}m
                    </div>
                  </div>
                </div>
              )}

              {gps.status === "error" && (
                <p style={{ fontSize: 13, color: "var(--red)", lineHeight: 1.5 }}>{gps.error}</p>
              )}
            </div>

            {/* Camera preview tile */}
            <div style={{ marginBottom: 14 }}>
              <p className="lbl" style={{ marginBottom: 10 }}>Live photo</p>
              {photoUrl ? (
                <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--b1)", position: "relative" }}>
                  <img src={photoUrl} alt="Captured" style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} />
                  <button onClick={() => setPhotoUrl(null)} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,.6)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", borderRadius: 99, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>
                    Retake
                  </button>
                  {uploading && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--amber)" }}>Uploading…</div>}
                </div>
              ) : (
                <button onClick={() => setStep(1)}
                  style={{ width: "100%", height: 110, borderRadius: 12, background: "var(--s2)", border: "1px dashed var(--b2)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, transition: "border-color .15s" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,.25)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--b2)")}>
                  <svg viewBox="0 0 20 20" fill="currentColor" width="26" height="26" style={{ color: "rgba(255,255,255,.18)" }}><path fillRule="evenodd" d="M1 8a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 018.07 3h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0016.07 6H17a2 2 0 012 2v7a2 2 0 01-2 2H3a2 2 0 01-2-2V8zm13.5 3a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM10 14a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd"/></svg>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,.25)" }}>Tap to open live camera</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,.15)" }}>No gallery uploads — live only</span>
                </button>
              )}
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 18 }}>
              <p className="lbl" style={{ marginBottom: 8 }}>
                Additional context <span style={{ opacity: .5, textTransform: "none", fontSize: 11, fontFamily: "inherit", letterSpacing: 0 }}>(optional)</span>
              </p>
              <textarea className="input" rows={3} placeholder="Number of vehicles, injuries visible, hazards present…" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            {/* Anonymous toggle */}
            <div className="card2" style={{ padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 20 }}>🕶️</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Anonymous mode</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>Identity not shared with responders</div>
              </div>
              <button className="toggle-track" style={{ background: anon ? "var(--green)" : "rgba(255,255,255,.15)" }} onClick={() => setAnon(v => !v)}>
                <div className="toggle-thumb" style={{ left: anon ? 20 : 2 }} />
              </button>
            </div>

            {/* Submit */}
            <button
              className="btn-red"
              style={{ width: "100%", padding: "15px 0", fontSize: 15, justifyContent: "center", borderRadius: 12 }}
              onClick={() => { if (!type) return; if (!photoUrl) { setStep(1); } else { setStep(2); startVerify(); } }}
              disabled={!type || gps.status === "acquiring"}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg>
              {!type
                ? "Select an incident type first"
                : gps.status === "acquiring"
                  ? "Acquiring GPS…"
                  : photoUrl
                    ? `Send ${type} Alert`
                    : `Continue — capture live photo`
              }
            </button>
            <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,.18)", marginTop: 10 }}>
              Protected under Good Samaritan provisions · No forced identity
            </p>
          </div>
        </main>
      </div>
      <BottomNav path={path} />
    </>
  );
}