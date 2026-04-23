"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');

  :root {
    --red:#E63946; --red-glow:rgba(230,57,70,0.18); --red-dim:rgba(230,57,70,0.12);
    --amber:#F4A261; --amber-dim:rgba(244,162,97,0.12);
    --green:#52B788; --green-dim:rgba(82,183,136,0.12);
    --blue:#60A5FA; --blue-dim:rgba(96,165,250,0.12);
    --bg:#0C0C0C; --surface:#111; --surface2:#161616; --surface3:#1c1c1c;
    --border:rgba(255,255,255,0.07); --border2:rgba(255,255,255,0.13);
    --muted:rgba(255,255,255,0.38); --dim:rgba(255,255,255,0.2);
  }

  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%}
  body{background:var(--bg);color:#fff;font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
  button,input,textarea,select{font-family:inherit}
  a{color:inherit;text-decoration:none}

  ::-webkit-scrollbar{width:3px}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.07);border-radius:10px}

  /* Keyframes */
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(1.25)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes ripple{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.4);opacity:0}}
  @keyframes dash{to{stroke-dashoffset:0}}
  @keyframes barGrow{from{width:0}to{width:var(--w)}}
  @keyframes countUp{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}
  @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}

  .fadeUp{animation:fadeUp .38s ease both}
  .fadeIn{animation:fadeIn .25s ease both}
  .pulse{animation:pulse 2s ease-in-out infinite}
  .spin{animation:spin .7s linear infinite}
  .ripple{animation:ripple 1.6s linear infinite}
  .slideIn{animation:slideIn .35s ease both}

  /* Cards */
  .card{background:var(--surface);border:1px solid var(--border);border-radius:16px}
  .card2{background:var(--surface2);border:1px solid var(--border);border-radius:12px}
  .card3{background:var(--surface3);border:1px solid var(--border);border-radius:10px}

  /* Buttons */
  .btn{border:none;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:7px;font-weight:600;transition:all .15s;border-radius:50px;font-family:'DM Sans',sans-serif}
  .btn:active{transform:scale(.96)}
  .btn-red{background:var(--red);color:#fff;box-shadow:0 0 28px var(--red-glow)}
  .btn-red:hover{background:#cc2834}
  .btn-outline{background:rgba(255,255,255,0.05);color:rgba(255,255,255,.75);border:1px solid var(--border2)}
  .btn-outline:hover{background:rgba(255,255,255,0.09);color:#fff}
  .btn-green{background:var(--green-dim);color:var(--green);border:1px solid rgba(82,183,136,0.28)}
  .btn-green:hover{background:rgba(82,183,136,0.2)}
  .btn-amber{background:var(--amber-dim);color:var(--amber);border:1px solid rgba(244,162,97,0.28)}

  /* Inputs */
  .input{background:var(--surface2);border:1px solid var(--border2);border-radius:10px;color:#fff;padding:11px 14px;font-size:14px;outline:none;width:100%;transition:border .15s}
  .input:focus{border-color:rgba(255,255,255,0.25)}
  .input::placeholder{color:var(--muted)}
  textarea.input{resize:none;line-height:1.6}

  /* Label */
  .lbl{font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim)}

  /* Badge */
  .badge{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.05em;padding:3px 9px;border-radius:99px;text-transform:uppercase;font-weight:500}
  .badge-red{background:var(--red-dim);color:var(--red);border:1px solid rgba(230,57,70,0.25)}
  .badge-green{background:var(--green-dim);color:var(--green);border:1px solid rgba(82,183,136,0.25)}
  .badge-amber{background:var(--amber-dim);color:var(--amber);border:1px solid rgba(244,162,97,0.25)}
  .badge-dim{background:rgba(255,255,255,0.06);color:var(--muted);border:1px solid var(--border)}

  /* Grid bg */
  .gbg{background-image:linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px);background-size:40px 40px}

  /* Noise */
  .noise{position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:.02;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:200px}

  /* Sidebar nav item */
  .nav-item{display:flex;align-items:center;gap:10px;padding:10px 13px;border-radius:10px;cursor:pointer;font-size:13.5px;font-weight:500;color:var(--muted);transition:all .15s;border:none;background:none;width:100%;text-align:left}
  .nav-item:hover{background:rgba(255,255,255,0.05);color:rgba(255,255,255,.78)}
  .nav-item.active{background:var(--red-dim);color:var(--red)}

  /* Page layout */
  .layout{display:flex;min-height:100vh}
  .sidebar{width:230px;flex-shrink:0;border-right:1px solid var(--border);padding:20px 14px;display:flex;flex-direction:column;gap:4px;position:sticky;top:0;height:100vh;overflow-y:auto}
  .main{flex:1;overflow-y:auto;min-width:0}

  /* Scrollable page content */
  .page-wrap{padding:32px;max-width:960px}

  /* Stat card */
  .stat-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:20px}

  /* Table */
  .tbl{width:100%;border-collapse:collapse}
  .tbl th{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--dim);padding:10px 14px;text-align:left;border-bottom:1px solid var(--border)}
  .tbl td{padding:13px 14px;font-size:13.5px;border-bottom:1px solid rgba(255,255,255,0.04);vertical-align:middle}
  .tbl tr:last-child td{border-bottom:none}
  .tbl tr:hover td{background:rgba(255,255,255,0.02)}

  /* Divider */
  .divider{border:none;border-top:1px solid var(--border);margin:0}

  /* Mobile */
  @media(max-width:768px){
    .sidebar{display:none}
    .page-wrap{padding:20px 16px}
    .hide-mobile{display:none!important}
  }
`;

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Ico = {
  home: <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd"/></svg>,
  alert: <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg>,
  map: <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd"/></svg>,
  users: <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.569 1.175A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z"/></svg>,
  check: <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd"/></svg>,
  arrow: <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd"/></svg>,
  phone: <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5A15 15 0 012 3.5z" clipRule="evenodd"/></svg>,
  camera: <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20"><path fillRule="evenodd" d="M1 8a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 018.07 3h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0016.07 6H17a2 2 0 012 2v7a2 2 0 01-2 2H3a2 2 0 01-2-2V8zm13.5 3a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM10 14a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd"/></svg>,
  pin: <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd"/></svg>,
  close: <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/></svg>,
  bell: <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M4 8a6 6 0 1112 0c0 1.887.454 3.665 1.257 5.234a.75.75 0 01-.515 1.076 32.91 32.91 0 01-3.256.508 3.5 3.5 0 01-6.972 0 32.903 32.903 0 01-3.256-.508.75.75 0 01-.515-1.076A11.448 11.448 0 004 8zm6 7c-.655 0-1.305-.02-1.95-.057a2 2 0 003.9 0c-.645.038-1.295.057-1.95.057z" clipRule="evenodd"/></svg>,
};

// ─── DATA ──────────────────────────────────────────────────────────────────────
const INCIDENTS = [
  {id:"INC-001",type:"Road Accident",loc:"Ring Road / Iwo Rd Junction",city:"Ibadan",time:"2 min ago",raw:2,conf:92,witnesses:4,status:"active",dist:"0.8 km",priority:"high",responder:null},
  {id:"INC-002",type:"Medical Emergency",loc:"UI Campus, Gate 1",city:"Ibadan",time:"8 min ago",raw:8,conf:78,witnesses:1,status:"active",dist:"2.4 km",priority:"medium",responder:"Dr. Ade Okonkwo"},
  {id:"INC-003",type:"Road Accident",loc:"Lagos-Ibadan Expressway, KM 12",city:"Ibadan",time:"15 min ago",raw:15,conf:85,witnesses:3,status:"routing",dist:"4.1 km",priority:"high",responder:"UI Teaching Hospital"},
  {id:"INC-004",type:"Road Accident",loc:"Challenge Roundabout",city:"Ibadan",time:"34 min ago",raw:34,conf:61,witnesses:2,status:"responded",dist:"6.3 km",priority:"low",responder:"Jericho Specialist"},
  {id:"INC-005",type:"Fire Hazard",loc:"Bodija Market, Block C",city:"Ibadan",time:"1 hr ago",raw:60,conf:44,witnesses:1,status:"resolved",dist:"3.2 km",priority:"low",responder:"LASEMA"},
  {id:"INC-006",type:"Medical Emergency",loc:"Agodi Estate, Entrance",city:"Ibadan",time:"2 hr ago",raw:120,conf:89,witnesses:2,status:"resolved",dist:"5.5 km",priority:"high",responder:"State Hospital"},
];

const CONF_COLOR = (c: number) => c >= 75 ? "var(--green)" : c >= 50 ? "var(--amber)" : "var(--red)";
const STATUS_BADGE: Record<string, string> = {
  active: "badge-red", routing: "badge-amber", responded: "badge-green", resolved: "badge-dim"
};

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin }: { onLogin: (name: string) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className="page-wrap fadeUp" style={{ maxWidth: 420, margin: "0 auto", paddingTop: 80 }}>
      <div className="card" style={{ padding: 32 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--red-dim)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", border: "1px solid rgba(230,57,70,0.25)" }}>
            <span style={{ fontSize: 28 }}>🛡️</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>Responder Login</h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Please sign in to access official emergency response tools.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
          <div>
            <div className="lbl" style={{ marginBottom: 8 }}>Full Name</div>
            <input className="input" placeholder="e.g. Dr. Ade Okonkwo" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <div className="lbl" style={{ marginBottom: 8 }}>Official Email / ID</div>
            <input className="input" placeholder="name@hospital.gov.ng" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-red" style={{ width: "100%", padding: "16px 0", fontSize: 15 }} onClick={() => name && onLogin(name)}>
          Sign In & Verify
        </button>
        <p style={{ fontSize: 11, color: "var(--dim)", textAlign: "center", marginTop: 20, lineHeight: 1.5 }}>
          By signing in, you agree to the emergency responder code of conduct and accountability protocols.
        </p>
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ page, setPage, user }: { page: string; setPage: (p: string) => void; user: any }) {
  const nav = [
    { id: "dashboard", label: "Dashboard", icon: Ico.home },
    { id: "report",    label: "Report Emergency", icon: Ico.alert },
    { id: "map",       label: "Live Map", icon: Ico.map },
    { id: "responder", label: "Responder View", icon: Ico.users },
  ];
  return (
    <aside className="sidebar">
      {/* Logo */}
      <a href="/" style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 8px 18px", borderBottom: "1px solid var(--border)", marginBottom: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg viewBox="0 0 20 20" fill="white" width="14" height="14"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 3a1 1 0 011 1v3.586l2.707 2.707a1 1 0 11-1.414 1.414l-3-3A1 1 0 019 10V6a1 1 0 011-1z" /></svg>
        </div>
        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>QuickAlert</span>
      </a>
      {/* Nav */}
      {nav.map(n => (
        <button key={n.id} className={`nav-item${page === n.id ? " active" : ""}`} onClick={() => setPage(n.id)}>
          {n.icon}
          {n.label}
          {n.id === "responder" && INCIDENTS.filter(i => i.status === "active").length > 0 && (
            <span style={{ marginLeft: "auto", background: "var(--red)", color: "#fff", fontSize: 10, fontFamily: "'DM Mono',monospace", padding: "1px 6px", borderRadius: 99 }}>
              {INCIDENTS.filter(i => i.status === "active").length}
            </span>
          )}
        </button>
      ))}
      {/* Bottom user */}
      <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: user ? "var(--green-dim)" : "rgba(230,57,70,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, border: user ? "1px solid rgba(82,183,136,0.25)" : "none" }}>👤</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{user?.name || "Anonymous"}</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>{user ? "Verified Responder" : "Trusted · 847 pts"}</div>
          </div>
          {user ? <div className="badge badge-green" style={{ marginLeft: "auto" }}>Live</div> : <div className="badge badge-green" style={{ marginLeft: "auto" }}>On</div>}
        </div>
      </div>
    </aside>
  );
}

// ─── PAGE: DASHBOARD ──────────────────────────────────────────────────────────
function Dashboard({ setPage }: { setPage: (p: string) => void }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(x => x + 1), 3000); return () => clearInterval(t); }, []);

  const active = INCIDENTS.filter(i => i.status === "active");
  const resolved = INCIDENTS.filter(i => i.status === "resolved").length;

  const miniChart = [42, 58, 35, 71, 88, 65, 92, 78, 55, 87, 73, 91];

  return (
    <div className="page-wrap fadeUp">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div className="lbl" style={{ marginBottom: 6 }}>Overview</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>Dashboard</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 14px", fontSize: 13 }}>
            <span className="pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
            Live
          </div>
          <button className="btn btn-red" style={{ padding: "9px 18px", fontSize: 13 }} onClick={() => setPage("report")}>
            {Ico.alert} Report
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Active alerts",   val: active.length,  color: "var(--red)",   sub: "↑ 2 in last hour" },
          { label: "Avg response",    val: "28s",           color: "var(--green)", sub: "↓ 4s from yesterday" },
          { label: "Verified today",  val: "14",            color: "var(--amber)", sub: "87% accuracy" },
          { label: "Resolved 24h",    val: resolved,       color: "var(--blue)",  sub: "All clear ✓" },
        ].map((s, i) => (
          <div key={i} className="stat-card fadeUp" style={{ animationDelay: `${i * 0.06}s` }}>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: s.color, marginBottom: 4 }}>{s.val}</div>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16, marginBottom: 16 }}>
        {/* Active incidents */}
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Active Incidents</div>
            <button className="btn btn-outline" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => setPage("map")}>View map</button>
          </div>
          <table className="tbl">
            <thead><tr><th>Type</th><th>Location</th><th>Conf.</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {INCIDENTS.filter(i => i.status !== "resolved").slice(0, 4).map(inc => (
                <tr key={inc.id}>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{inc.type}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>{inc.time}</div>
                  </td>
                  <td style={{ fontSize: 12.5, color: "rgba(255,255,255,0.65)" }}>{inc.loc.split(",")[0]}</td>
                  <td>
                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, color: CONF_COLOR(inc.conf) }}>{inc.conf}%</span>
                  </td>
                  <td><span className={`badge ${STATUS_BADGE[inc.status]}`}>{inc.status}</span></td>
                  <td><button className="btn btn-outline" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => setPage("responder")}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Mini chart */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Confidence trend</div>
              <span className="lbl">Last 12 alerts</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 60 }}>
              {miniChart.map((v, i) => (
                <div key={i} style={{ flex: 1, borderRadius: 3, background: CONF_COLOR(v), height: `${v}%`, opacity: .7 + (i === miniChart.length - 1 ? .3 : 0), transition: "height .3s" }} />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>Avg: 72%</span>
              <span style={{ fontSize: 11, color: "var(--green)", fontFamily: "'DM Mono',monospace" }}>↑ +8%</span>
            </div>
          </div>
          {/* Quick actions */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Quick actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Report emergency", icon: Ico.alert, page: "report", color: "var(--red)" },
                { label: "Open live map", icon: Ico.map, page: "map", color: "var(--blue)" },
                { label: "Responder alerts", icon: Ico.users, page: "responder", color: "var(--amber)" },
              ].map(a => (
                <button key={a.page} className="btn btn-outline" style={{ width: "100%", justifyContent: "flex-start", padding: "10px 14px", fontSize: 13, borderRadius: 10, gap: 10 }} onClick={() => setPage(a.page)}>
                  <span style={{ color: a.color }}>{a.icon}</span>
                  {a.label}
                  <span style={{ marginLeft: "auto" }}>{Ico.arrow}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE: REPORT ─────────────────────────────────────────────────────────────
function ReportPage({ setPage }: { setPage: (p: string) => void }) {
  const [step, setStep] = useState(0);
  const [type, setType] = useState("");
  const [notes, setNotes] = useState("");
  const [conf, setConf] = useState(0);
  const [checks, setChecks] = useState([false, false, false]);
  const timerRef = useRef<any>(null);

  const startReport = () => {
    if (!type) return;
    setStep(1);
    setTimeout(() => {
      setStep(2);
      let v = 0;
      timerRef.current = setInterval(() => {
        v += 2; setConf(Math.min(v, 87));
        if (v >= 25) setChecks(c => [true, c[1], c[2]]);
        if (v >= 55) setChecks(c => [c[0], true, c[2]]);
        if (v >= 80) setChecks([true, true, true]);
        if (v >= 87) { clearInterval(timerRef.current); setTimeout(() => setStep(3), 700); }
      }, 55);
    }, 1800);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const types = [
    { id: "accident", emoji: "🚗", label: "Road Accident",     desc: "Crash, collision, vehicle damage" },
    { id: "medical",  emoji: "🏥", label: "Medical Emergency", desc: "Injury, collapse, cardiac" },
    { id: "fire",     emoji: "🔥", label: "Fire / Hazard",      desc: "Fire, gas leak, chemical" },
    { id: "other",    emoji: "📍", label: "Other Incident",     desc: "Anything else requiring help" },
  ];

  if (step === 1) return (
    <div className="page-wrap" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
      <div style={{ position: "relative", width: 80, height: 80, marginBottom: 24 }}>
        <div className="ripple" style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid var(--red)" }} />
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--red-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {Ico.camera}
        </div>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Opening camera…</h2>
      <p style={{ color: "var(--muted)", fontSize: 14 }}>Capturing live photo and GPS coordinates</p>
    </div>
  );

  if (step === 2) return (
    <div className="page-wrap" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", maxWidth: 480 }}>
      <div className="lbl" style={{ color: "var(--amber)", marginBottom: 20 }}>AI Verification</div>
      <div style={{ position: "relative", width: 72, height: 72, marginBottom: 24 }}>
        <div className="ripple" style={{ position: "absolute", inset: -8, borderRadius: "50%", border: "1px solid var(--amber)", opacity: .5 }} />
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--amber-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🤖</div>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Verifying alert…</h2>
      <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 28, textAlign: "center" }}>Analysing scene, location consistency and movement patterns</p>
      {/* Confidence bar */}
      <div style={{ width: "100%", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span className="lbl">Confidence score</span>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 14, color: CONF_COLOR(conf) }}>{conf}%</span>
        </div>
        <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${conf}%`, background: CONF_COLOR(conf), borderRadius: 99, transition: "width .15s" }} />
        </div>
      </div>
      {/* Check items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
        {[["Image analysis", "Scene matches reported type"], ["GPS verification", "Location confirmed on grid"], ["Pattern analysis", "Movement data analysed"]].map(([l, v], i) => (
          <div key={l} className="card2" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: checks[i] ? "var(--green-dim)" : "rgba(255,255,255,0.05)", border: `1px solid ${checks[i] ? "rgba(82,183,136,.3)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .3s" }}>
              {checks[i] ? <span style={{ color: "var(--green)" }}>{Ico.check}</span> : <div className="spin" style={{ width: 10, height: 10, borderRadius: "50%", border: "1.5px solid var(--amber)", borderTopColor: "transparent" }} />}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{l}</div>
              <div style={{ fontSize: 11, color: checks[i] ? "var(--green)" : "var(--muted)" }}>{checks[i] ? v : "Processing…"}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (step === 3) return (
    <div className="page-wrap fadeUp" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", maxWidth: 500 }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--green-dim)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, border: "1px solid rgba(82,183,136,0.3)" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" width="34" height="34"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
      </div>
      <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Help is on the way</h2>
      <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 4 }}>Alert dispatched to UI Teaching Hospital</p>
      <p style={{ fontFamily: "'DM Mono',monospace", color: "var(--green)", fontSize: 13, marginBottom: 32 }}>Confidence 87% · ETA ~4 minutes</p>
      {/* Summary card */}
      <div className="card" style={{ width: "100%", padding: 20, marginBottom: 20 }}>
        <div className="lbl" style={{ marginBottom: 14 }}>Alert summary</div>
        {[["Incident type", type || "Road Accident"], ["Location", "Ring Road / Iwo Rd, Ibadan"], ["GPS accuracy", "±3 metres"], ["Confidence", "87% — High"], ["Witnesses", "Awaiting corroboration"], ["Dispatched to", "UI Teaching Hospital"]].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
            <span style={{ color: "var(--muted)" }}>{k}</span>
            <span style={{ color: k === "Confidence" ? "var(--green)" : "#fff", fontFamily: k === "GPS accuracy" ? "'DM Mono',monospace" : undefined, fontSize: k === "GPS accuracy" ? 12 : 13 }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, width: "100%" }}>
        <button className="btn btn-outline" style={{ flex: 1, padding: "12px 0", fontSize: 14 }} onClick={() => { setStep(0); setType(""); setConf(0); setChecks([false, false, false]); }}>New report</button>
        <button className="btn btn-outline" style={{ flex: 1, padding: "12px 0", fontSize: 14 }} onClick={() => setPage("dashboard")}>Dashboard</button>
      </div>
    </div>
  );

  return (
    <div className="page-wrap fadeUp" style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 28 }}>
        <div className="lbl" style={{ color: "var(--red)", marginBottom: 8 }}>Emergency report</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6 }}>What's happening?</h1>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>Your identity is protected. Anonymous by default. No account required.</p>
      </div>

      {/* Type selector */}
      <div style={{ marginBottom: 24 }}>
        <div className="lbl" style={{ marginBottom: 12 }}>Incident type</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {types.map(t => (
            <button key={t.id} onClick={() => setType(t.label)}
              style={{ background: type === t.label ? "var(--red-dim)" : "var(--surface2)", border: `1px solid ${type === t.label ? "rgba(230,57,70,0.35)" : "var(--border)"}`, borderRadius: 12, padding: "16px 14px", cursor: "pointer", textAlign: "left", transition: "all .15s" }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{t.emoji}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: type === t.label ? "var(--red)" : "#fff", marginBottom: 3 }}>{t.label}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Live location */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div className="lbl" style={{ marginBottom: 10 }}>Live location (auto-detected)</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "var(--green)" }}>{Ico.pin}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Ring Road / Iwo Road Junction, Ibadan</div>
            <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "'DM Mono',monospace" }}>7.3775° N, 3.9470° E · ±3m accuracy</div>
          </div>
          <div className="badge badge-green" style={{ marginLeft: "auto" }}>GPS ✓</div>
        </div>
      </div>

      {/* Camera preview */}
      <div style={{ width: "100%", height: 140, background: "#080808", border: "1px solid var(--border)", borderRadius: 12, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
        <div style={{ color: "rgba(255,255,255,0.15)" }}>{Ico.camera}</div>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>Live camera — tap to capture</span>
      </div>

      {/* Notes */}
      <div style={{ marginBottom: 24 }}>
        <div className="lbl" style={{ marginBottom: 8 }}>Additional context <span style={{ fontSize: 10, opacity: .6 }}>(optional)</span></div>
        <textarea className="input" rows={3} placeholder="Number of vehicles, injuries visible, hazards…" value={notes} onChange={e => setNotes(e.target.value)} />
      </div>

      {/* Anonymous toggle */}
      <div className="card2" style={{ padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 18 }}>🕶️</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Anonymous mode</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Your identity will not be shared with responders</div>
        </div>
        <div style={{ marginLeft: "auto", background: "var(--green)", width: 40, height: 22, borderRadius: 99, position: "relative", cursor: "pointer" }}>
          <div style={{ position: "absolute", top: 2, left: 20, width: 18, height: 18, borderRadius: "50%", background: "#fff" }} />
        </div>
      </div>

      <button className="btn btn-red" style={{ width: "100%", padding: "16px 0", fontSize: 15 }} onClick={startReport} disabled={!type}>
        {Ico.alert} {type ? `Send ${type} Alert` : "Select incident type first"}
      </button>
      <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 10 }}>Protected under Good Samaritan provisions · No forced identity</p>
    </div>
  );
}

// ─── PAGE: MAP ────────────────────────────────────────────────────────────────
function MapPage({ setPage }: { setPage: (p: string) => void }) {
  const [sel, setSel] = useState<typeof INCIDENTS[0] | null>(null);
  const [filter, setFilter] = useState("all");

  const pins = [
    { ...INCIDENTS[0], x: 38, y: 29 },
    { ...INCIDENTS[1], x: 62, y: 50 },
    { ...INCIDENTS[2], x: 21, y: 65 },
    { ...INCIDENTS[3], x: 74, y: 38 },
    { ...INCIDENTS[4], x: 50, y: 72 },
    { x: 55, y: 28, id: "HOSP-1", type: "Hospital", loc: "UI Teaching Hospital", status: "ready", conf: 100, witnesses: 0 } as any,
    { x: 78, y: 56, id: "HOSP-2", type: "Hospital", loc: "Jericho Specialist", status: "ready", conf: 100, witnesses: 0 } as any,
  ];

  const pinColor = (p: any) => p.type === "Hospital" ? "var(--blue)" : CONF_COLOR(p.conf);
  const filtered = INCIDENTS.filter(i => filter === "all" || i.status === filter);

  return (
    <div className="page-wrap fadeUp">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div className="lbl" style={{ marginBottom: 6 }}>Live</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>Incident Map</h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["all", "active", "routing", "resolved"].map(f => (
            <button key={f} className={`btn ${filter === f ? "btn-red" : "btn-outline"}`} style={{ padding: "7px 14px", fontSize: 12, borderRadius: 8 }} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
        {/* Map canvas */}
        <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", background: "#0a120e", border: "1px solid var(--border)", minHeight: 440 }}>
          {/* Grid lines */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: .12 }} viewBox="0 0 100 100" preserveAspectRatio="none">
            {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(v => (
              <g key={v}>
                <line x1={v} y1="0" x2={v} y2="100" stroke="var(--green)" strokeWidth=".25" />
                <line x1="0" y1={v} x2="100" y2={v} stroke="var(--green)" strokeWidth=".25" />
              </g>
            ))}
          </svg>
          {/* Roads */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: .18 }} viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,50 Q25,47 50,49 Q75,51 100,49" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="1.8" />
            <path d="M50,0 Q49,25 50,49 Q51,75 50,100" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="1.8" />
            <path d="M0,28 Q35,30 55,36 Q75,42 100,40" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="1.2" />
            <path d="M0,72 Q40,69 60,65 Q80,60 100,62" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="1.2" />
            <path d="M20,0 Q22,30 24,50 Q26,70 28,100" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth=".8" />
            <path d="M72,0 Q71,30 70,50 Q69,70 68,100" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth=".8" />
          </svg>
          {/* Ripple on active */}
          <div style={{ position: "absolute", left: "38%", top: "29%", transform: "translate(-50%,-50%)", width: 28, height: 28, borderRadius: "50%", border: "2px solid var(--red)", animation: "ripple 1.6s linear infinite", opacity: .4 }} />
          {/* Pins */}
          {pins.map(p => (
            <button key={p.id} onClick={() => setSel(p as any)}
              style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)", width: p.type === "Hospital" ? 16 : 13, height: p.type === "Hospital" ? 16 : 13, borderRadius: "50%", background: pinColor(p), border: `2px solid rgba(0,0,0,0.6)`, cursor: "pointer", boxShadow: `0 0 12px ${pinColor(p)}`, transition: "transform .15s", zIndex: 2 }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translate(-50%,-50%) scale(1.5)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "translate(-50%,-50%) scale(1)")}
            />
          ))}
          {/* UI corners */}
          <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontFamily: "'DM Mono',monospace", color: "rgba(255,255,255,0.4)" }}>N ↑</div>
          <div style={{ position: "absolute", bottom: 12, left: 12, fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono',monospace" }}>Ibadan, Oyo State · Nigeria</div>
          {/* Legend */}
          <div style={{ position: "absolute", bottom: 12, right: 12, display: "flex", flexDirection: "column", gap: 5, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 10px" }}>
            {[["var(--red)", "High conf. incident"], ["var(--amber)", "Medium conf."], ["var(--blue)", "Hospital"]].map(([c, l]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: c, display: "inline-block" }} />
                {l}
              </div>
            ))}
          </div>
          {/* Selected popup */}
          {sel && (
            <div className="fadeIn" style={{ position: "absolute", top: 12, left: 12, background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: 12, padding: "14px 16px", width: 220, zIndex: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{sel.type}</div>
                <button style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }} onClick={() => setSel(null)}>{Ico.close}</button>
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>{sel.loc}</div>
              {sel.conf < 100 && <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: "var(--muted)" }}>Confidence</span>
                  <span style={{ color: CONF_COLOR(sel.conf), fontFamily: "'DM Mono',monospace" }}>{sel.conf}%</span>
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 99 }}><div style={{ height: "100%", width: `${sel.conf}%`, background: CONF_COLOR(sel.conf), borderRadius: 99 }} /></div>
              </div>}
              {sel.conf < 100 && <button className="btn btn-red" style={{ width: "100%", padding: "8px 0", fontSize: 12 }} onClick={() => setPage("responder")}>Respond →</button>}
            </div>
          )}
        </div>

        {/* Incident list */}
        <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
          <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--border)", fontWeight: 600, fontSize: 14 }}>Incidents</div>
          <div style={{ maxHeight: 420, overflowY: "auto" }}>
            {filtered.map(inc => (
              <div key={inc.id} style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", transition: "background .15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={e => (e.currentTarget.style.background = "")}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: CONF_COLOR(inc.conf), marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{inc.type}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 5 }}>{inc.loc.split(",")[0]}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className={`badge ${STATUS_BADGE[inc.status]}`}>{inc.status}</span>
                      <span style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: CONF_COLOR(inc.conf) }}>{inc.conf}%</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", whiteSpace: "nowrap" }}>{inc.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE: RESPONDER ──────────────────────────────────────────────────────────
function ResponderPage({ user, onRequireLogin }: { user: any; onRequireLogin: () => void }) {
  const [accepted, setAccepted] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const active = INCIDENTS.filter(i => i.status === "active" || i.status === "routing");

  const handleRespond = (id: string) => {
    if (!user) {
      onRequireLogin();
      return;
    }
    setAccepted(a => [...a, id]);
  };

  return (
    <div className="page-wrap fadeUp">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div className="lbl" style={{ color: "var(--amber)", marginBottom: 6 }}>Responder</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>Incoming Alerts</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--green-dim)", border: "1px solid rgba(82,183,136,0.25)", borderRadius: 10, padding: "8px 14px", fontSize: 13, color: "var(--green)" }}>
            <span className="pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
            On duty
          </div>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
        {[{ l: "Incoming", v: active.length, c: "var(--red)" }, { l: "Accepted", v: accepted.length, c: "var(--green)" }, { l: "Avg ETA", v: "4m 12s", c: "var(--blue)" }].map(s => (
          <div key={s.l} className="stat-card">
            <div style={{ fontSize: 28, fontWeight: 700, color: s.c, marginBottom: 4 }}>{s.v}</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Alert cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {active.map((inc, idx) => {
          const done = accepted.includes(inc.id);
          const open = expanded === inc.id;
          return (
            <div key={inc.id} className="card fadeUp" style={{ overflow: "hidden", animationDelay: `${idx * 0.07}s`, opacity: done ? .55 : 1, transition: "opacity .3s" }}>
              {/* Header */}
              <div style={{ padding: "18px 20px", cursor: "pointer" }} onClick={() => setExpanded(open ? null : inc.id)}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: inc.priority === "high" ? "var(--red-dim)" : "var(--amber-dim)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${inc.priority === "high" ? "rgba(230,57,70,0.25)" : "rgba(244,162,97,0.25)"}` }}>
                    <span style={{ fontSize: 18 }}>{inc.type.includes("Road") ? "🚗" : inc.type.includes("Medical") ? "🏥" : "🔥"}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 600 }}>{inc.type}</span>
                      {inc.priority === "high" && <span className="badge badge-red">HIGH</span>}
                      <span className={`badge ${STATUS_BADGE[inc.status]}`} style={{ marginLeft: 2 }}>{inc.status}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{inc.loc}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 20, fontWeight: 700, color: CONF_COLOR(inc.conf) }}>{inc.conf}%</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>confidence</div>
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              {open && (
                <div className="fadeIn" style={{ borderTop: "1px solid var(--border)", padding: "16px 20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
                    {[["Distance", inc.dist], ["Witnesses", inc.witnesses + "" + (inc.witnesses === 1 ? " person" : " people")], ["Reported", inc.time], ["Confidence", inc.conf + "%"]].map(([l, v]) => (
                      <div key={l} className="card3" style={{ padding: "10px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{v}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  {/* Confidence bar */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                      <span style={{ color: "var(--muted)" }}>AI confidence breakdown</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {[["Image analysis", 88], ["GPS accuracy", 94], ["Pattern match", inc.conf]].map(([l, v]) => (
                        <div key={l} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 90, fontSize: 11, color: "var(--muted)", flexShrink: 0 }}>{l}</div>
                          <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 99 }}>
                            <div style={{ height: "100%", width: `${v}%`, background: CONF_COLOR(v as number), borderRadius: 99 }} />
                          </div>
                          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: CONF_COLOR(v as number), width: 28, textAlign: "right" }}>{v}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn btn-outline" style={{ flex: 1, padding: "11px 0", fontSize: 14 }}>Navigate</button>
                    <button className="btn btn-outline" style={{ flex: 1, padding: "11px 0", fontSize: 14 }}>Call hospital</button>
                    <button className={`btn ${done ? "btn-green" : "btn-red"}`} style={{ flex: 2, padding: "11px 0", fontSize: 14 }} onClick={() => handleRespond(inc.id)}>
                      {done ? "✓ Accepted" : user ? "Accept & Respond" : "Login to Respond"}
                    </button>
                  </div>
                </div>
              )}

              {/* Collapsed CTA */}
              {!open && !done && (
                <div style={{ padding: "0 20px 16px", display: "flex", gap: 8 }}>
                  <button className="btn btn-outline" style={{ flex: 1, padding: "9px 0", fontSize: 13 }} onClick={() => setExpanded(inc.id)}>View details</button>
                  <button className="btn btn-red" style={{ flex: 2, padding: "9px 0", fontSize: 13 }} onClick={() => handleRespond(inc.id)}>
                    {user ? "Accept & Respond" : "Login to Respond"}
                  </button>
                </div>
              )}
              {!open && done && (
                <div style={{ padding: "0 20px 14px", fontSize: 13, color: "var(--green)", textAlign: "center" }}>✓ Response confirmed — en route</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── APP ROOT ──────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [user, setUser] = useState<any>(null);

  const handleLogin = (name: string) => {
    setUser({ name });
    setPage("responder");
  };

  const pages: Record<string, React.ReactNode> = {
    dashboard: <Dashboard setPage={setPage} />,
    report:    <ReportPage setPage={setPage} />,
    map:       <MapPage setPage={setPage} />,
    responder: <ResponderPage user={user} onRequireLogin={() => setPage("login")} />,
    login:     <LoginPage onLogin={handleLogin} />,
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="noise" />
      <div className="layout">
        <Sidebar page={page} setPage={setPage} user={user} />
        <main className="main">
          {pages[page] ?? <Dashboard setPage={setPage} />}
        </main>
      </div>
    </>
  );
}