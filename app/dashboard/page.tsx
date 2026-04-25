"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { INCIDENTS, confColor, statusBadge } from "@/lib/data";

const TREND = [42, 58, 35, 71, 88, 65, 92, 78, 55, 87, 73, 91];

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

  .qa-shell{display:flex;min-height:100vh;background:var(--bg);}

  /* ── sidebar ── */
  .qa-sidebar{
    display:none;
    width:224px;flex-shrink:0;
    border-right:1px solid var(--b1);
    padding:20px 14px;
    flex-direction:column;gap:4px;
    position:sticky;top:0;height:100vh;overflow-y:auto;
  }
  @media(min-width:768px){.qa-sidebar{display:flex;} .qa-bottom-nav{display:none!important;} .qa-main{padding-bottom:24px!important;}}

  .qa-logo{display:flex;align-items:center;gap:9px;padding:6px 8px 18px;border-bottom:1px solid var(--b1);margin-bottom:12px;}
  .qa-logo-mark{width:28px;height:28px;border-radius:8px;background:var(--red);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .qa-logo-name{font-weight:700;font-size:15px;letter-spacing:-0.01em;color:#fff;}

  .qa-nav-item{
    display:flex;align-items:center;gap:10px;padding:10px 13px;border-radius:10px;
    cursor:pointer;font-size:13.5px;font-weight:500;color:var(--muted);
    transition:all .15s;border:none;background:none;width:100%;text-align:left;color:var(--muted);
  }
  .qa-nav-item:hover{background:rgba(255,255,255,.05);color:rgba(255,255,255,.8);}
  .qa-nav-item.active{background:var(--red-dim);color:var(--red);}
  .qa-nav-badge{margin-left:auto;background:var(--red);color:#fff;font-size:10px;font-family:'DM Mono',monospace;padding:1px 7px;border-radius:99px;}

  .qa-user{margin-top:auto;padding-top:16px;border-top:1px solid var(--b1);}
  .qa-user-inner{display:flex;align-items:center;gap:10px;padding:8px 10px;}
  .qa-avatar{width:32px;height:32px;border-radius:50%;background:var(--red-dim);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;}

  /* ── main content ── */
  .qa-main{flex:1;overflow-y:auto;min-width:0;padding-bottom:calc(var(--nav) + 20px);}

  /* ── sticky header ── */
  .qa-header{
    position:sticky;top:0;z-index:50;
    background:rgba(12,12,12,0.9);
    backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
    border-bottom:1px solid var(--b1);
    padding:14px 20px;
    display:flex;align-items:center;justify-content:space-between;
  }

  /* ── bottom nav ── */
  .qa-bottom-nav{
    position:fixed;bottom:0;left:0;right:0;z-index:100;
    height:var(--nav);
    background:rgba(9,9,9,0.93);
    backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
    border-top:1px solid rgba(255,255,255,.07);
    display:flex;align-items:stretch;justify-content:space-around;
    padding-bottom:env(safe-area-inset-bottom,0px);
  }
  .qa-tab{
    flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;
    background:none;border:none;cursor:pointer;padding:8px 4px;position:relative;color:rgba(255,255,255,.3);
    -webkit-tap-highlight-color:transparent;text-decoration:none;
  }
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

  /* ── content pieces ── */
  .gbg{background-image:linear-gradient(rgba(255,255,255,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.022) 1px,transparent 1px);background-size:40px 40px;}
  .card{background:var(--s1);border:1px solid var(--b1);border-radius:16px;}
  .card2{background:var(--s2);border:1px solid var(--b1);border-radius:12px;}
  .stat-card{background:var(--s1);border:1px solid var(--b1);border-radius:14px;padding:18px;}
  .btn-red{background:var(--red);color:#fff;border:none;border-radius:50px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:7px;transition:all .15s;box-shadow:0 0 24px var(--red-glow);}
  .btn-red:hover{background:#cc2834;}
  .btn-red:active{transform:scale(.96);}
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
`;

/* ── nav items shared ── */
const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard",         badge: 0,
    icon: <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd"/></svg> },
  { href: "/report",    label: "Report Emergency",  badge: 0,
    icon: <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg> },
  { href: "/map",       label: "Live Map",           badge: 0,
    icon: <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd"/></svg> },
  { href: "/responder", label: "Responder View",     badge: INCIDENTS.filter(i=>i.status==="active").length,
    icon: <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.569 1.175A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z"/></svg> },
  { href: "/profile",   label: "My Profile",         badge: 0,
    icon: <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd"/></svg> },
];

const BOTTOM_TABS = [
  { href: "/dashboard", label: "Home",
    icon: <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22"><path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd"/></svg> },
  { href: "/map",       label: "Map",
    icon: <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd"/></svg> },
  { href: "/responder", label: "Alerts",  badge: INCIDENTS.filter(i=>i.status==="active").length,
    icon: <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22"><path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.569 1.175A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z"/></svg> },
  { href: "/profile",   label: "Profile",
    icon: <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd"/></svg> },
];

function Sidebar({ path }: { path: string }) {
  return (
    <aside className="qa-sidebar">
      <Link href="/dashboard" className="qa-logo">
        <div className="qa-logo-mark">
          <svg viewBox="0 0 20 20" fill="white" width="14" height="14">
            <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 3a1 1 0 011 1v3.586l2.707 2.707a1 1 0 11-1.414 1.414l-3-3A1 1 0 019 10V6a1 1 0 011-1z"/>
          </svg>
        </div>
        <span className="qa-logo-name">QuickAlert</span>
      </Link>

      {NAV_ITEMS.map(n => (
        <Link key={n.href} href={n.href} className={`qa-nav-item${path === n.href ? " active" : ""}`}>
          {n.icon}
          {n.label}
          {n.badge > 0 && <span className="qa-nav-badge">{n.badge}</span>}
        </Link>
      ))}

      <div className="qa-user">
        <div className="qa-user-inner">
          <div className="qa-avatar">👤</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>Anonymous</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.38)" }}>Trusted · 847 pts</div>
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
          <svg viewBox="0 0 20 20" fill="white" width="22" height="22">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
          </svg>
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

export default function DashboardPage() {
  const path = usePathname();
  const active   = INCIDENTS.filter(i => i.status === "active");
  const resolved = INCIDENTS.filter(i => i.status === "resolved").length;

  const kpis = [
    { label: "Active alerts",  value: active.length, color: "var(--red)",   sub: "↑ 2 in last hour" },
    { label: "Avg response",   value: "28s",          color: "var(--green)", sub: "↓ 4s from yesterday" },
    { label: "Verified today", value: "14",           color: "var(--amber)", sub: "87% accuracy" },
    { label: "Resolved 24h",   value: resolved,       color: "var(--blue)",  sub: "All clear ✓" },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="noise" />

      <div className="qa-shell">
        <Sidebar path={path} />

        <main className="qa-main gbg">
          {/* Header */}
          <header className="qa-header">
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div className="qa-logo-mark">
                <svg viewBox="0 0 20 20" fill="white" width="14" height="14">
                  <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 3a1 1 0 011 1v3.586l2.707 2.707a1 1 0 11-1.414 1.414l-3-3A1 1 0 019 10V6a1 1 0 011-1z"/>
                </svg>
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

            <div style={{ marginBottom: 22 }}>
              <p className="lbl" style={{ marginBottom: 6 }}>Overview</p>
              <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>Dashboard</h1>
            </div>

            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {kpis.map((k, i) => (
                <div key={k.label} className="stat-card fadeUp" style={{ animationDelay: `${i * 0.07}s` }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: k.color, marginBottom: 4, letterSpacing: "-0.02em" }}>{k.value}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#fff", marginBottom: 3 }}>{k.label}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{k.sub}</div>
                </div>
              ))}
            </div>

            {/* Sparkline */}
            <div className="card fadeUp" style={{ padding: "18px 18px 14px", marginBottom: 16, animationDelay: ".28s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: "#fff" }}>Confidence trend</span>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span className="lbl">last 12</span>
                  <span style={{ fontSize: 11, color: "var(--green)", fontFamily: "'DM Mono',monospace" }}>↑ +8%</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 56 }}>
                {TREND.map((v, i) => (
                  <div key={i} style={{ flex: 1, borderRadius: "3px 3px 0 0", background: confColor(v), height: `${v}%`, opacity: i === TREND.length - 1 ? 1 : 0.55 }} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <span style={{ fontSize: 10, color: "var(--muted)" }}>Avg: 72%</span>
                <span style={{ fontSize: 10, color: "var(--muted)" }}>Latest: 91%</span>
              </div>
            </div>

            {/* Incident list header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span className="lbl">Active incidents</span>
              <Link href="/map" style={{ fontSize: 12, color: "var(--red)", fontWeight: 500 }}>See map →</Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
              {INCIDENTS.filter(i => i.status !== "resolved").map((inc, idx) => (
                <div key={inc.id} className="card fadeUp" style={{ padding: "14px 16px", animationDelay: `${0.32 + idx * 0.06}s` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: inc.priority === "high" ? "var(--red-dim)" : "var(--amber-dim)", border: `1px solid ${inc.priority === "high" ? "rgba(230,57,70,.22)" : "rgba(244,162,97,.22)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                      {inc.type.includes("Road") ? "🚗" : inc.type.includes("Medical") ? "🏥" : "🔥"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{inc.type}</span>
                        {inc.priority === "high" && <span className="badge badge-red" style={{ fontSize: 9 }}>HIGH</span>}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inc.loc}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className={`badge ${statusBadge[inc.status]}`}>{inc.status}</span>
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>{inc.time}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 20, fontWeight: 700, color: confColor(inc.conf) }}>{inc.conf}%</div>
                      <div style={{ fontSize: 10, color: "var(--muted)" }}>conf.</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 11, height: 3, background: "rgba(255,255,255,.07)", borderRadius: 99 }}>
                    <div style={{ height: "100%", width: `${inc.conf}%`, background: confColor(inc.conf), borderRadius: 99 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <p className="lbl" style={{ marginBottom: 10 }}>Quick actions</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 }}>
              {[
                { href: "/report",    emoji: "🚨", label: "Report",    sub: "Send an alert",  color: "var(--red)" },
                { href: "/map",       emoji: "🗺️",  label: "Live map", sub: "View incidents", color: "var(--blue)" },
                { href: "/responder", emoji: "🚑",  label: "Respond",  sub: "Accept alerts",  color: "var(--amber)" },
                { href: "/profile",   emoji: "👤",  label: "Profile",  sub: "Trust score",    color: "var(--green)" },
              ].map(a => (
                <Link key={a.href} href={a.href} className="card2"
                  style={{ padding: "14px 12px", display: "flex", flexDirection: "column", gap: 7, cursor: "pointer", transition: "background .15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--s3)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "")}>
                  <span style={{ fontSize: 22 }}>{a.emoji}</span>
                  <div style={{ fontSize: 13, fontWeight: 600, color: a.color }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{a.sub}</div>
                </Link>
              ))}
            </div>

            {/* Top reporters */}
            <p className="lbl" style={{ marginBottom: 10 }}>Top reporters today</p>
            <div className="card" style={{ overflow: "hidden" }}>
              {[
                { id: "0x4F2", reports: 4, accuracy: 96,  pts: 320 },
                { id: "0x9B1", reports: 3, accuracy: 88,  pts: 215 },
                { id: "0xC37", reports: 2, accuracy: 100, pts: 190 },
              ].map((r, i) => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderBottom: i < 2 ? "1px solid var(--b1)" : "none" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: ["var(--red-dim)", "var(--green-dim)", "var(--amber-dim)"][i], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>👤</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontFamily: "'DM Mono',monospace", marginBottom: 2, color: "#fff" }}>Anon #{r.id}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>{r.reports} reports · {r.accuracy}% accurate</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: "var(--green)" }}>{r.pts}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>pts</div>
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
}