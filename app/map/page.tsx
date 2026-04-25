"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { INCIDENTS, confColor, statusBadge } from "@/lib/data";

/* ── styles ── */
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
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(1.3)}}
  @keyframes ripple{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.5);opacity:0}}
  @keyframes navPop{0%{transform:scale(.8) translateY(4px);opacity:0}65%{transform:scale(1.1) translateY(-1px)}100%{transform:scale(1) translateY(0);opacity:1}}
  @keyframes pinPop{0%{transform:translate(-50%,-50%) scale(0);opacity:0}70%{transform:translate(-50%,-50%) scale(1.15)}100%{transform:translate(-50%,-50%) scale(1);opacity:1}}

  .qa-shell{display:flex;min-height:100vh;background:var(--bg);}

  /* sidebar */
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

  /* main */
  .qa-main{flex:1;overflow-y:auto;min-width:0;padding-bottom:calc(var(--nav) + 20px);}
  .qa-header{position:sticky;top:0;z-index:50;background:rgba(12,12,12,0.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid var(--b1);padding:14px 20px;display:flex;align-items:center;justify-content:space-between;}

  /* bottom nav */
  .qa-bottom-nav{position:fixed;bottom:0;left:0;right:0;z-index:100;height:var(--nav);background:rgba(9,9,9,0.93);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-top:1px solid rgba(255,255,255,.07);display:flex;align-items:stretch;justify-content:space-around;padding-bottom:env(safe-area-inset-bottom,0px);}
  .qa-tab{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;background:none;border:none;cursor:pointer;padding:8px 4px;position:relative;color:rgba(255,255,255,.3);-webkit-tap-highlight-color:transparent;text-decoration:none;}
  .qa-tab.active{color:var(--red);}
  .qa-tab.active .qa-tab-icon{animation:navPop .28s cubic-bezier(.34,1.56,.64,1) both;}
  .qa-tab-label{font-size:10px;font-weight:500;letter-spacing:.02em;}
  .qa-tab.active .qa-tab-label{color:var(--red);}
  .qa-tab.active::after{content:'';position:absolute;bottom:5px;left:50%;transform:translateX(-50%);width:4px;height:4px;border-radius:50%;background:var(--red);opacity:.7;}
  .qa-report-wrap{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;background:none;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;text-decoration:none;}
  .qa-report-pill{width:50px;height:50px;border-radius:50%;background:var(--red);display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 3px var(--bg),0 0 24px var(--red-glow),0 4px 16px rgba(0,0,0,.5);transition:transform .18s;margin-top:-20px;}
  .qa-report-wrap:hover .qa-report-pill{transform:scale(1.08);}
  .qa-report-wrap:active .qa-report-pill{transform:scale(.92);}
  .qa-report-label{font-size:10px;font-weight:600;color:var(--red);}
  .qa-bnav-badge{position:absolute;top:8px;right:calc(50% - 20px);min-width:16px;height:16px;padding:0 4px;border-radius:99px;background:var(--red);color:#fff;font-size:9px;font-family:'DM Mono',monospace;display:flex;align-items:center;justify-content:center;border:2px solid var(--bg);}

  /* shared */
  .card{background:var(--s1);border:1px solid var(--b1);border-radius:16px;}
  .card2{background:var(--s2);border:1px solid var(--b1);border-radius:12px;}
  .btn-red{background:var(--red);color:#fff;border:none;border-radius:50px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:7px;transition:all .15s;box-shadow:0 0 24px var(--red-glow);}
  .btn-red:hover{background:#cc2834;}
  .btn-red:active{transform:scale(.96);}
  .btn-ghost{background:rgba(255,255,255,.06);color:rgba(255,255,255,.75);border:1px solid var(--b2);border-radius:50px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:all .15s;}
  .btn-ghost:hover{background:rgba(255,255,255,.1);color:#fff;}
  .btn-ghost:active{transform:scale(.96);}
  .lbl{font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);}
  .badge{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.05em;padding:3px 9px;border-radius:99px;text-transform:uppercase;font-weight:500;}
  .badge-red{background:var(--red-dim);color:var(--red);border:1px solid rgba(230,57,70,.25);}
  .badge-green{background:var(--green-dim);color:var(--green);border:1px solid rgba(82,183,136,.25);}
  .badge-amber{background:var(--amber-dim);color:var(--amber);border:1px solid rgba(244,162,97,.25);}
  .badge-dim{background:rgba(255,255,255,.06);color:var(--muted);border:1px solid var(--b1);}
  .pulse{animation:pulse 2s ease-in-out infinite;}
  .fadeUp{animation:fadeUp .38s ease both;}
  .live-dot{width:6px;height:6px;border-radius:50%;background:var(--green);display:inline-block;}
  .noise{position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:.02;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:200px;}

  /* map specific */
  .map-canvas{position:relative;border-radius:16px;overflow:hidden;background:#060e08;border:1px solid var(--b1);}
  .map-pin{position:absolute;transform:translate(-50%,-50%);border-radius:50%;border:2px solid rgba(0,0,0,.6);cursor:pointer;transition:transform .15s;animation:pinPop .35s cubic-bezier(.34,1.56,.64,1) both;}
  .map-pin:hover{transform:translate(-50%,-50%) scale(1.55)!important;}
  .filter-btn{padding:6px 13px;font-size:12px;border-radius:8px;cursor:pointer;font-weight:600;font-family:'DM Sans',sans-serif;transition:all .15s;border:1px solid var(--b2);background:rgba(255,255,255,.05);color:rgba(255,255,255,.65);}
  .filter-btn:hover{background:rgba(255,255,255,.09);color:#fff;}
  .filter-btn.active{background:var(--red);color:#fff;border-color:var(--red);box-shadow:0 0 16px var(--red-glow);}
  .popup-card{position:absolute;top:12px;left:12px;background:var(--s1);border:1px solid var(--b2);border-radius:14px;padding:16px;width:210px;z-index:10;animation:fadeUp .22s ease both;}
  .inc-row{padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.04);cursor:pointer;transition:background .15s;}
  .inc-row:last-child{border-bottom:none;}
  .inc-row:hover{background:rgba(255,255,255,.025);}
`;

/* ── shared nav data ── */
const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard",       badge: 0,    icon: <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd"/></svg> },
  { href: "/report",    label: "Report Emergency",badge: 0,    icon: <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg> },
  { href: "/map",       label: "Live Map",        badge: 0,    icon: <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd"/></svg> },
  { href: "/responder", label: "Responder View",  badge: INCIDENTS.filter(i=>i.status==="active").length, icon: <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.569 1.175A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z"/></svg> },
  { href: "/profile",   label: "My Profile",      badge: 0,    icon: <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd"/></svg> },
];

const BOTTOM_TABS = [
  { href: "/dashboard", label: "Home",    icon: <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22"><path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd"/></svg> },
  { href: "/map",       label: "Map",     icon: <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd"/></svg> },
  { href: "/responder", label: "Alerts",  badge: INCIDENTS.filter(i=>i.status==="active").length, icon: <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22"><path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.569 1.175A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z"/></svg> },
  { href: "/profile",   label: "Profile", icon: <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd"/></svg> },
];

/* ── map pin data ── */
const PINS = [
  { ...INCIDENTS[0], x: 38, y: 29 },
  { ...INCIDENTS[1], x: 62, y: 51 },
  { ...INCIDENTS[2], x: 21, y: 66 },
  { ...INCIDENTS[3], x: 74, y: 39 },
  { ...INCIDENTS[4], x: 50, y: 73 },
  { id: "H1", type: "Hospital", loc: "UI Teaching Hospital",  conf: 100, x: 55, y: 27 },
  { id: "H2", type: "Hospital", loc: "Jericho Specialist",    conf: 100, x: 78, y: 57 },
] as any[];

function pinColor(p: any) {
  if (p.type === "Hospital") return "var(--blue)";
  return confColor(p.conf);
}

/* ── Sidebar ── */
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

/* ── BottomNav ── */
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

/* ── PAGE ── */
export default function MapPage() {
  const path = usePathname();
  const [sel, setSel]       = useState<any>(null);
  const [filter, setFilter] = useState("all");

  const FILTERS = ["all", "active", "routing", "resolved"] as const;
  const filtered = INCIDENTS.filter(i => filter === "all" || i.status === filter);

  return (
    <>
      <style>{CSS}</style>
      <div className="noise" />

      <div className="qa-shell">
        <Sidebar path={path} />

        <main className="qa-main">
          {/* Header */}
          <header className="qa-header">
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div className="qa-logo-mark">
                <svg viewBox="0 0 20 20" fill="white" width="14" height="14"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 3a1 1 0 011 1v3.586l2.707 2.707a1 1 0 11-1.414 1.414l-3-3A1 1 0 019 10V6a1 1 0 011-1z"/></svg>
              </div>
              <span className="qa-logo-name">QuickAlert</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--s1)", border: "1px solid var(--b1)", borderRadius: 10, padding: "6px 12px", fontSize: 12, color: "#fff" }}>
                <span className="live-dot pulse" />
                Live
              </div>
              <Link href="/report" className="btn-red" style={{ padding: "8px 16px", fontSize: 13 }}>Report</Link>
            </div>
          </header>

          {/* Body */}
          <div style={{ padding: "24px 20px" }}>

            {/* Title + filters */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <p className="lbl" style={{ marginBottom: 6 }}>Live</p>
                <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>Incident Map</h1>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {FILTERS.map(f => (
                  <button
                    key={f}
                    className={`filter-btn${filter === f ? " active" : ""}`}
                    onClick={() => setFilter(f)}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Map + list two-col on desktop, stacked on mobile */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>

              {/* Map canvas */}
              <div className="map-canvas fadeUp" style={{ minHeight: 420 }}>

                {/* Grid lines */}
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: .1 }} viewBox="0 0 100 100" preserveAspectRatio="none">
                  {[10,20,30,40,50,60,70,80,90].map(v => (
                    <g key={v}>
                      <line x1={v} y1="0" x2={v} y2="100" stroke="var(--green)" strokeWidth=".25"/>
                      <line x1="0" y1={v} x2="100" y2={v} stroke="var(--green)" strokeWidth=".25"/>
                    </g>
                  ))}
                </svg>

                {/* Roads */}
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: .18 }} viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0,50 Q25,47 50,49 Q75,51 100,49" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="1.8"/>
                  <path d="M50,0 Q49,25 50,49 Q51,75 50,100" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="1.8"/>
                  <path d="M0,28 Q35,30 55,36 Q75,42 100,40" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="1.2"/>
                  <path d="M0,72 Q40,69 60,65 Q80,60 100,62" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="1.2"/>
                  <path d="M20,0 Q22,30 24,50 Q26,70 28,100" fill="none" stroke="rgba(255,255,255,.13)" strokeWidth=".7"/>
                  <path d="M72,0 Q71,30 70,50 Q69,70 68,100" fill="none" stroke="rgba(255,255,255,.13)" strokeWidth=".7"/>
                </svg>

                {/* Active ripple on INC-001 */}
                <div style={{ position: "absolute", left: "38%", top: "29%", transform: "translate(-50%,-50%)", width: 28, height: 28, borderRadius: "50%", border: "2px solid var(--red)", animation: "ripple 1.6s linear infinite", opacity: .45, pointerEvents: "none" }} />

                {/* Pins */}
                {PINS.map((p, i) => (
                  <button
                    key={p.id}
                    className="map-pin"
                    style={{
                      left: `${p.x}%`, top: `${p.y}%`,
                      width: p.type === "Hospital" ? 16 : 12,
                      height: p.type === "Hospital" ? 16 : 12,
                      background: pinColor(p),
                      boxShadow: `0 0 12px ${pinColor(p)}`,
                      animationDelay: `${i * 0.06}s`,
                      border: "none",
                    }}
                    onClick={() => setSel(sel?.id === p.id ? null : p)}
                  />
                ))}

                {/* Compass */}
                <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,.55)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: "3px 10px", fontSize: 11, fontFamily: "'DM Mono',monospace", color: "rgba(255,255,255,.4)" }}>N ↑</div>
                <div style={{ position: "absolute", bottom: 12, left: 12, fontSize: 11, color: "rgba(255,255,255,.28)", fontFamily: "'DM Mono',monospace" }}>Ibadan, Oyo State · Nigeria</div>

                {/* Legend */}
                <div style={{ position: "absolute", bottom: 12, right: 12, display: "flex", flexDirection: "column", gap: 5, background: "rgba(0,0,0,.55)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 8, padding: "8px 10px" }}>
                  {([["var(--red)","High conf."],["var(--amber)","Medium conf."],["var(--blue)","Hospital"]] as [string,string][]).map(([c,l]) => (
                    <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "rgba(255,255,255,.42)" }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: c, display: "inline-block" }} />
                      {l}
                    </div>
                  ))}
                </div>

                {/* Selected popup */}
                {sel && (
                  <div className="popup-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#fff" }}>{sel.type}</div>
                      <button onClick={() => setSel(null)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>{sel.loc}</div>
                    {sel.conf < 100 && (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}>
                          <span style={{ color: "var(--muted)" }}>Confidence</span>
                          <span style={{ color: confColor(sel.conf), fontFamily: "'DM Mono',monospace" }}>{sel.conf}%</span>
                        </div>
                        <div style={{ height: 3, background: "rgba(255,255,255,.08)", borderRadius: 99, marginBottom: 12 }}>
                          <div style={{ height: "100%", width: `${sel.conf}%`, background: confColor(sel.conf), borderRadius: 99 }} />
                        </div>
                        <div style={{ display: "flex", gap: 7 }}>
                          <span className={`badge ${statusBadge[sel.status as keyof typeof statusBadge]}`}>{sel.status}</span>
                          <span style={{ fontSize: 11, color: "var(--muted)" }}>{sel.time}</span>
                        </div>
                        <Link href="/responder">
                          <button className="btn-red" style={{ width: "100%", padding: "8px 0", fontSize: 12, marginTop: 12, borderRadius: 10, justifyContent: "center" }}>Respond →</button>
                        </Link>
                      </>
                    )}
                    {sel.type === "Hospital" && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span className="badge badge-green">Ready</span>
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>Accepting patients</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Incident list below map */}
              <div className="card fadeUp" style={{ overflow: "hidden", animationDelay: ".15s" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 12px", borderBottom: "1px solid var(--b1)" }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: "#fff" }}>
                    Incidents
                    <span style={{ marginLeft: 8, fontFamily: "'DM Mono',monospace", fontSize: 10, color: "var(--muted)" }}>({filtered.length})</span>
                  </span>
                  <span className="lbl">{filter === "all" ? "All statuses" : filter}</span>
                </div>
                <div>
                  {filtered.map(inc => (
                    <div
                      key={inc.id}
                      className="inc-row"
                      onClick={() => {
                        const pin = PINS.find(p => p.id === inc.id);
                        if (pin) setSel(sel?.id === inc.id ? null : pin);
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {/* Color dot */}
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: confColor(inc.conf), flexShrink: 0, boxShadow: `0 0 6px ${confColor(inc.conf)}` }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{inc.type}</span>
                            <span className={`badge ${statusBadge[inc.status]}`}>{inc.status}</span>
                          </div>
                          <div style={{ fontSize: 11, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inc.loc}</div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, fontWeight: 700, color: confColor(inc.conf) }}>{inc.conf}%</div>
                          <div style={{ fontSize: 10, color: "var(--muted)" }}>{inc.time}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <BottomNav path={path} />
    </>
  );
}