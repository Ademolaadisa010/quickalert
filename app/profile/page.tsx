"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { INCIDENTS } from "@/lib/data";

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
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes navPop{0%{transform:scale(.8) translateY(4px);opacity:0}65%{transform:scale(1.1) translateY(-1px)}100%{transform:scale(1) translateY(0);opacity:1}}
  @keyframes scoreGrow{from{width:0}to{width:var(--target)}}
  @keyframes checkPop{0%{transform:scale(0)}70%{transform:scale(1.2)}100%{transform:scale(1)}}

  .qa-shell{display:flex;min-height:100vh;background:var(--bg);}
  .qa-sidebar{display:none;width:224px;flex-shrink:0;border-right:1px solid var(--b1);padding:20px 14px;flex-direction:column;gap:4px;position:sticky;top:0;height:100vh;overflow-y:auto;}
  @media(min-width:768px){.qa-sidebar{display:flex;}.qa-bottom-nav{display:none!important;}.qa-main{padding-bottom:24px!important;}}
  .qa-logo{display:flex;align-items:center;gap:9px;padding:6px 8px 18px;border-bottom:1px solid var(--b1);margin-bottom:12px;}
  .qa-logo-mark{width:28px;height:28px;border-radius:8px;background:var(--red);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 0 12px var(--red-glow);}
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
  .qa-report-wrap:hover .qa-report-pill{transform:scale(1.08);}
  .qa-report-wrap:active .qa-report-pill{transform:scale(.92);}
  .qa-report-label{font-size:10px;font-weight:600;color:var(--red);}
  .qa-bnav-badge{position:absolute;top:8px;right:calc(50% - 20px);min-width:16px;height:16px;padding:0 4px;border-radius:99px;background:var(--red);color:#fff;font-size:9px;font-family:'DM Mono',monospace;display:flex;align-items:center;justify-content:center;border:2px solid var(--bg);}

  .card{background:var(--s1);border:1px solid var(--b1);border-radius:16px;}
  .card2{background:var(--s2);border:1px solid var(--b1);border-radius:12px;}
  .card3{background:var(--s3);border:1px solid var(--b1);border-radius:10px;}
  .stat-card{background:var(--s1);border:1px solid var(--b1);border-radius:14px;padding:18px;}

  .btn-red{background:var(--red);color:#fff;border:none;border-radius:50px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:7px;transition:all .15s;box-shadow:0 0 24px var(--red-glow);}
  .btn-red:hover{background:#cc2834;}
  .btn-red:active{transform:scale(.96);}
  .btn-red:disabled{opacity:.4;cursor:not-allowed;box-shadow:none;}
  .btn-ghost{background:rgba(255,255,255,.06);color:rgba(255,255,255,.75);border:1px solid var(--b2);border-radius:50px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:all .15s;}
  .btn-ghost:hover{background:rgba(255,255,255,.1);color:#fff;}
  .btn-ghost:active{transform:scale(.96);}
  .btn-green{background:var(--green-dim);color:var(--green);border:1px solid rgba(82,183,136,.28);border-radius:50px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:7px;transition:all .15s;}
  .btn-green:hover{background:rgba(82,183,136,.2);}

  .lbl{font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);}
  .badge{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.05em;padding:3px 9px;border-radius:99px;text-transform:uppercase;font-weight:500;}
  .badge-red{background:var(--red-dim);color:var(--red);border:1px solid rgba(230,57,70,.25);}
  .badge-green{background:var(--green-dim);color:var(--green);border:1px solid rgba(82,183,136,.25);}
  .badge-amber{background:var(--amber-dim);color:var(--amber);border:1px solid rgba(244,162,97,.25);}
  .badge-blue{background:var(--blue-dim);color:var(--blue);border:1px solid rgba(96,165,250,.25);}
  .badge-dim{background:rgba(255,255,255,.06);color:var(--muted);border:1px solid var(--b1);}

  .pulse{animation:pulse 2s ease-in-out infinite;}
  .fadeUp{animation:fadeUp .38s ease both;}
  .fadeIn{animation:fadeIn .25s ease both;}
  .live-dot{width:6px;height:6px;border-radius:50%;background:var(--green);display:inline-block;}
  .noise{position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:.02;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:200px;}

  /* auth specific */
  .input{background:var(--s2);border:1px solid var(--b2);border-radius:10px;color:#fff;padding:11px 14px;font-size:14px;outline:none;width:100%;transition:border .15s;font-family:'DM Sans',sans-serif;}
  .input:focus{border-color:rgba(255,255,255,.3);}
  .input::placeholder{color:var(--muted);}
  .tab-switch{display:flex;background:var(--s2);border:1px solid var(--b1);border-radius:10px;padding:3px;gap:3px;}
  .tab-btn{flex:1;padding:9px 0;border-radius:8px;border:none;cursor:pointer;font-size:13px;font-weight:600;transition:all .18s;background:transparent;color:var(--muted);}
  .tab-btn.active{background:var(--s1);color:#fff;box-shadow:0 1px 4px rgba(0,0,0,.4);}
  .spin-sm{width:14px;height:14px;border-radius:50%;border:2px solid rgba(255,255,255,.25);border-top-color:#fff;animation:spin .7s linear infinite;display:inline-block;}

  /* profile specific */
  .avatar-ring{width:76px;height:76px;border-radius:50%;background:var(--red-dim);border:2px solid rgba(230,57,70,.3);display:flex;align-items:center;justify-content:center;font-size:30px;flex-shrink:0;position:relative;}
  .avatar-ring.verified::after{content:'✓';position:absolute;bottom:0;right:0;width:22px;height:22px;border-radius:50%;background:var(--green);font-size:11px;display:flex;align-items:center;justify-content:center;border:2px solid var(--bg);font-weight:700;}
  .score-bar{height:6px;background:rgba(255,255,255,.07);border-radius:99px;overflow:hidden;}
  .score-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,var(--green),#7FD8A8);animation:scoreGrow .8s ease both;}
  .history-row{display:flex;align-items:center;gap:12px;padding:13px 0;border-bottom:1px solid var(--b1);}
  .history-row:last-child{border-bottom:none;}
  .setting-row{display:flex;align-items:center;gap:12px;padding:13px 16px;cursor:pointer;transition:background .15s;border-radius:8px;}
  .setting-row:hover{background:rgba(255,255,255,.03);}
  .toggle-track{width:40px;height:22px;border-radius:99px;position:relative;cursor:pointer;border:none;transition:background .2s;flex-shrink:0;}
  .toggle-thumb{position:absolute;top:2px;width:18px;height:18px;border-radius:50%;background:#fff;transition:left .2s;}
`;

/* ── nav data ── */
const NAV_ITEMS = [
  { href:"/dashboard", label:"Dashboard",        badge:0, icon:<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd"/></svg> },
  { href:"/report",    label:"Report Emergency", badge:0, icon:<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg> },
  { href:"/map",       label:"Live Map",         badge:0, icon:<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd"/></svg> },
  { href:"/responder", label:"Responder View",   badge:INCIDENTS.filter(i=>i.status==="active").length, icon:<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.569 1.175A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z"/></svg> },
  { href:"/profile",   label:"My Profile",       badge:0, icon:<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd"/></svg> },
];
const BOTTOM_TABS = [
  { href:"/dashboard", label:"Home",    icon:<svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22"><path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd"/></svg> },
  { href:"/map",       label:"Map",     icon:<svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd"/></svg> },
  { href:"/responder", label:"Alerts",  badge:INCIDENTS.filter(i=>i.status==="active").length, icon:<svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22"><path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.569 1.175A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z"/></svg> },
  { href:"/profile",   label:"Profile", icon:<svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd"/></svg> },
];

/* ── Sidebar ── */
function Sidebar({ path }: { path: string }) {
  return (
    <aside className="qa-sidebar">
      <Link href="/dashboard" className="qa-logo">
        <div className="qa-logo-mark"><svg viewBox="0 0 20 20" fill="white" width="14" height="14"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 3a1 1 0 011 1v3.586l2.707 2.707a1 1 0 11-1.414 1.414l-3-3A1 1 0 019 10V6a1 1 0 011-1z"/></svg></div>
        <span className="qa-logo-name">QuickAlert <span style={{color:"var(--red)"}}>AI</span></span>
      </Link>
      {NAV_ITEMS.map(n=>(
        <Link key={n.href} href={n.href} className={`qa-nav-item${path===n.href?" active":""}`}>
          {n.icon}{n.label}
          {n.badge>0&&<span className="qa-nav-badge">{n.badge}</span>}
        </Link>
      ))}
      <div className="qa-user">
        <div className="qa-user-inner">
          <div className="qa-avatar">👤</div>
          <div>
            <div style={{fontSize:13,fontWeight:500,color:"#fff"}}>Anonymous</div>
            <div style={{fontSize:11,color:"var(--muted)"}}>Trusted · 847 pts</div>
          </div>
          <span className="badge badge-green" style={{marginLeft:"auto"}}>On</span>
        </div>
      </div>
    </aside>
  );
}

/* ── BottomNav ── */
function BottomNav({ path }: { path: string }) {
  return (
    <nav className="qa-bottom-nav">
      {BOTTOM_TABS.slice(0,2).map(t=>(
        <Link key={t.href} href={t.href} className={`qa-tab${path===t.href?" active":""}`}>
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
      {BOTTOM_TABS.slice(2).map(t=>(
        <Link key={t.href} href={t.href} className={`qa-tab${path===t.href?" active":""}`} style={{position:"relative"}}>
          <span className="qa-tab-icon">{t.icon}</span>
          <span className="qa-tab-label">{t.label}</span>
          {(t as any).badge>0&&<span className="qa-bnav-badge">{(t as any).badge}</span>}
        </Link>
      ))}
    </nav>
  );
}

/* ── AUTH SCREEN ── */
function AuthScreen({ onAuth }: { onAuth: (u: any) => void }) {
  const [tab,      setTab]      = useState<"login"|"signup">("login");
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [hospital, setHospital] = useState("");
  const [role,     setRole]     = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const validate = () => {
    if (!email.includes("@")) return "Enter a valid email address.";
    if (password.length < 6)  return "Password must be at least 6 characters.";
    if (tab === "signup" && !name.trim()) return "Full name is required.";
    return "";
  };

  const handleSubmit = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError(""); setLoading(true);
    // TODO: replace with Firebase Auth
    // signInWithEmailAndPassword(auth, email, password)  ← login
    // createUserWithEmailAndPassword(auth, email, password) then write users/{uid} doc ← signup
    setTimeout(() => {
      setLoading(false);
      onAuth({
        name:     name || email.split("@")[0],
        email,
        role:     role || "Reporter",
        hospital: hospital || null,
        isResponder: !!hospital,
        joined:   "April 2025",
        pts:      847,
        reports:  14,
        verified: 13,
        accuracy: 93,
      });
    }, 1400);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"80vh",padding:"32px 20px"}} className="fadeUp">
      <div style={{width:"100%",maxWidth:400}}>

        {/* Icon */}
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:64,height:64,borderRadius:16,background:"var(--red-dim)",border:"1px solid rgba(230,57,70,.22)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:28}}>
            🛡️
          </div>
          <h2 style={{fontSize:24,fontWeight:700,letterSpacing:"-0.02em",marginBottom:6}}>
            {tab==="login" ? "Welcome back" : "Create account"}
          </h2>
          <p style={{color:"var(--muted)",fontSize:13,lineHeight:1.6}}>
            {tab==="login"
              ? "Sign in to access your profile and responder tools."
              : "Join QuickAlert AI as a reporter or verified responder."}
          </p>
        </div>

        {/* Tab switch */}
        <div className="tab-switch" style={{marginBottom:20}}>
          <button className={`tab-btn${tab==="login"?" active":""}`} onClick={()=>{setTab("login");setError("");}}>Sign in</button>
          <button className={`tab-btn${tab==="signup"?" active":""}`} onClick={()=>{setTab("signup");setError("");}}>Create account</button>
        </div>

        {/* Fields */}
        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:16}}>
          {tab==="signup" && (
            <div>
              <p className="lbl" style={{marginBottom:7}}>Full name</p>
              <input className="input" placeholder="e.g. Dr. Ade Okonkwo" value={name} onChange={e=>setName(e.target.value)}/>
            </div>
          )}
          <div>
            <p className="lbl" style={{marginBottom:7}}>Email address</p>
            <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()}/>
          </div>
          <div>
            <p className="lbl" style={{marginBottom:7}}>Password</p>
            <input className="input" type="password" placeholder={tab==="signup"?"Min. 6 characters":"••••••••"} value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()}/>
          </div>
          {tab==="signup" && (
            <>
              <div style={{height:1,background:"var(--b1)",margin:"4px 0"}}/>
              <p style={{fontSize:12,color:"var(--muted)"}}>Are you a responder? Fill below to get verified access.</p>
              <div>
                <p className="lbl" style={{marginBottom:7}}>Hospital / Organisation <span style={{opacity:.5,textTransform:"none",fontSize:11}}>(optional)</span></p>
                <input className="input" placeholder="e.g. UI Teaching Hospital" value={hospital} onChange={e=>setHospital(e.target.value)}/>
              </div>
              <div>
                <p className="lbl" style={{marginBottom:7}}>Role <span style={{opacity:.5,textTransform:"none",fontSize:11}}>(optional)</span></p>
                <input className="input" placeholder="e.g. Emergency Physician" value={role} onChange={e=>setRole(e.target.value)}/>
              </div>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{background:"var(--red-dim)",border:"1px solid rgba(230,57,70,.25)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"var(--red)",marginBottom:14}}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button className="btn-red" style={{width:"100%",padding:"14px 0",fontSize:15,justifyContent:"center",borderRadius:12,marginBottom:14}} onClick={handleSubmit} disabled={loading}>
          {loading ? <><span className="spin-sm"/>Verifying…</> : tab==="login" ? "Sign in" : "Create account"}
        </button>

        {/* Divider */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <div style={{flex:1,height:1,background:"var(--b1)"}}/>
          <span style={{fontSize:11,color:"var(--dim)"}}>or</span>
          <div style={{flex:1,height:1,background:"var(--b1)"}}/>
        </div>

        {/* Anonymous note */}
        <Link href="/dashboard">
          <button className="btn-ghost" style={{width:"100%",padding:"12px 0",fontSize:13,justifyContent:"center",borderRadius:12}}>
            🕶️  Continue anonymously
          </button>
        </Link>

        <p style={{fontSize:11,color:"var(--dim)",textAlign:"center",marginTop:18,lineHeight:1.6}}>
          By continuing you agree to the QuickAlert AI{" "}
          <span style={{color:"rgba(255,255,255,.5)",textDecoration:"underline",cursor:"pointer"}}>Terms</span>{" "}
          and{" "}
          <span style={{color:"rgba(255,255,255,.5)",textDecoration:"underline",cursor:"pointer"}}>Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}

/* ── PROFILE SCREEN ── */
function ProfileScreen({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [anonMode,   setAnonMode]   = useState(true);
  const [notifs,     setNotifs]     = useState(true);
  const [nearbyAlert,setNearbyAlert]= useState(true);
  const [activeTab,  setActiveTab]  = useState<"overview"|"history"|"settings">("overview");

  const scorePercent = Math.round((user.pts / 1000) * 100);

  const HISTORY = [
    { id:"INC-001", type:"Road Accident",     loc:"Ring Road, Ibadan",       time:"2 days ago",  conf:92, status:"verified" },
    { id:"INC-003", type:"Road Accident",     loc:"Lagos-Ibadan Expressway", time:"5 days ago",  conf:85, status:"verified" },
    { id:"INC-005", type:"Fire Hazard",       loc:"Bodija Market",           time:"1 week ago",  conf:44, status:"low-conf" },
    { id:"INC-006", type:"Medical Emergency", loc:"Agodi Estate",            time:"2 weeks ago", conf:89, status:"verified" },
  ];

  return (
    <div style={{padding:"24px 20px"}} className="fadeUp">

      {/* ── Profile hero card ── */}
      <div className="card" style={{padding:"22px 20px",marginBottom:16}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:16,marginBottom:20}}>
          {/* Avatar */}
          <div className={`avatar-ring${user.isResponder?" verified":""}`}>
            {user.isResponder ? "👨‍⚕️" : "👤"}
          </div>
          {/* Info */}
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5,flexWrap:"wrap"}}>
              <h1 style={{fontSize:18,fontWeight:700,letterSpacing:"-0.01em"}}>{user.name}</h1>
              {user.isResponder
                ? <span className="badge badge-green">Verified Responder</span>
                : <span className="badge badge-dim">Reporter</span>
              }
            </div>
            <div style={{fontSize:12,color:"var(--muted)",marginBottom:3,fontFamily:"'DM Mono',monospace"}}>{user.email}</div>
            {user.isResponder && (
              <div style={{fontSize:12,color:"var(--muted)"}}>
                {user.role} · {user.hospital}
              </div>
            )}
            <div style={{fontSize:11,color:"var(--dim)",marginTop:4}}>Member since {user.joined}</div>
          </div>
          {/* Logout */}
          <button className="btn-ghost" style={{padding:"7px 14px",fontSize:12,borderRadius:8,flexShrink:0}} onClick={onLogout}>
            Sign out
          </button>
        </div>

        {/* Trust score */}
        <div style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:13}}>
            <span style={{color:"var(--muted)"}}>AI Trust Score</span>
            <span style={{fontFamily:"'DM Mono',monospace",fontWeight:600,color:"var(--green)"}}>{user.pts} / 1000 pts</span>
          </div>
          <div className="score-bar">
            <div className="score-fill" style={{"--target":`${scorePercent}%`,width:`${scorePercent}%`} as any}/>
          </div>
          <div style={{fontSize:11,color:"var(--dim)",marginTop:6}}>
            {scorePercent >= 80 ? "🏆 Top reporter — priority alert routing enabled" :
             scorePercent >= 50 ? "⭐ Trusted — keep reporting to unlock more features" :
             "📈 Keep reporting to build your trust score"}
          </div>
        </div>

        {/* Stats row */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {[
            {label:"Reports",  val:user.reports,  color:"var(--red)"},
            {label:"Verified", val:user.verified, color:"var(--green)"},
            {label:"Accuracy", val:`${user.accuracy}%`, color:"var(--amber)"},
          ].map(s=>(
            <div key={s.label} className="card3" style={{padding:"12px 8px",textAlign:"center"}}>
              <div style={{fontSize:20,fontWeight:700,color:s.color,marginBottom:3,letterSpacing:"-0.02em"}}>{s.val}</div>
              <div style={{fontSize:10,color:"var(--muted)",fontFamily:"'DM Mono',monospace"}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tab switch ── */}
      <div className="tab-switch" style={{marginBottom:16}}>
        {(["overview","history","settings"] as const).map(t=>(
          <button key={t} className={`tab-btn${activeTab===t?" active":""}`} onClick={()=>setActiveTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW tab ── */}
      {activeTab==="overview" && (
        <div style={{display:"flex",flexDirection:"column",gap:12}} className="fadeIn">

          {/* Responder badge / upgrade prompt */}
          {user.isResponder ? (
            <div className="card" style={{padding:"16px 18px"}}>
              <p className="lbl" style={{marginBottom:12}}>Responder status</p>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                <div style={{width:40,height:40,borderRadius:10,background:"var(--green-dim)",border:"1px solid rgba(82,183,136,.22)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🏥</div>
                <div>
                  <div style={{fontSize:14,fontWeight:600}}>{user.hospital}</div>
                  <div style={{fontSize:12,color:"var(--muted)"}}>{user.role}</div>
                </div>
                <span className="badge badge-green" style={{marginLeft:"auto"}}>Active</span>
              </div>
              <div style={{display:"flex",gap:8}}>
                <Link href="/responder" style={{flex:1}}>
                  <button className="btn-red" style={{width:"100%",padding:"10px 0",fontSize:13,justifyContent:"center",borderRadius:10}}>
                    View incoming alerts
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="card" style={{padding:"16px 18px",borderColor:"rgba(230,57,70,.18)"}}>
              <p className="lbl" style={{color:"var(--red)",marginBottom:12}}>Become a responder</p>
              <p style={{fontSize:13,color:"var(--muted)",lineHeight:1.6,marginBottom:14}}>
                Link your hospital credentials to receive AI-verified emergency alerts and help save lives faster.
              </p>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {["Hospital verification","Priority AI routing","Legal protection","Response history"].map(f=>(
                  <div key={f} style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"rgba(255,255,255,.65)"}}>
                    <div style={{width:18,height:18,borderRadius:"50%",background:"var(--green-dim)",border:"1px solid rgba(82,183,136,.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <svg viewBox="0 0 10 10" fill="none" width="8" height="8"><path d="M1.5 5l2.5 2.5 4.5-4" stroke="#52B788" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    {f}
                  </div>
                ))}
              </div>
              <button className="btn-red" style={{width:"100%",padding:"11px 0",fontSize:13,justifyContent:"center",borderRadius:10,marginTop:14}}>
                Apply for responder access
              </button>
            </div>
          )}

          {/* AI badges earned */}
          <div className="card" style={{padding:"16px 18px"}}>
            <p className="lbl" style={{marginBottom:14}}>AI-earned badges</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
              {[
                {icon:"⚡",title:"First Responder",  sub:"First alert reported",     earned:true,  color:"var(--amber)"},
                {icon:"🎯",title:"High Accuracy",    sub:"93%+ accuracy rate",        earned:true,  color:"var(--green)"},
                {icon:"🔥",title:"Streak Reporter",  sub:"5 reports in one week",     earned:true,  color:"var(--red)"},
                {icon:"🏆",title:"Elite Reporter",   sub:"1000+ trust score",         earned:false, color:"var(--blue)"},
              ].map(b=>(
                <div key={b.title} style={{background:b.earned?"var(--s2)":"var(--s3)",border:`1px solid ${b.earned?"var(--b2)":"var(--b1)"}`,borderRadius:10,padding:"12px 12px",opacity:b.earned?1:.45}}>
                  <div style={{fontSize:22,marginBottom:6}}>{b.icon}</div>
                  <div style={{fontSize:12,fontWeight:600,color:b.earned?b.color:"var(--muted)",marginBottom:2}}>{b.title}</div>
                  <div style={{fontSize:11,color:"var(--muted)"}}>{b.sub}</div>
                  {!b.earned && <div style={{fontSize:10,color:"var(--dim)",marginTop:4,fontFamily:"'DM Mono',monospace"}}>LOCKED</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── HISTORY tab ── */}
      {activeTab==="history" && (
        <div className="card fadeIn" style={{overflow:"hidden"}}>
          <div style={{padding:"14px 18px 12px",borderBottom:"1px solid var(--b1)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontWeight:600,fontSize:14}}>Report history</span>
            <span className="lbl">{HISTORY.length} total</span>
          </div>
          <div style={{padding:"0 18px"}}>
            {HISTORY.map((h,i)=>(
              <div key={h.id} className="history-row" style={{animationDelay:`${i*0.06}s`}}>
                <div style={{width:36,height:36,borderRadius:9,background:h.type.includes("Road")?"var(--red-dim)":h.type.includes("Medical")?"var(--blue-dim)":"var(--amber-dim)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>
                  {h.type.includes("Road")?"🚗":h.type.includes("Medical")?"🏥":"🔥"}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:3}}>{h.type}</div>
                  <div style={{fontSize:11,color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.loc}</div>
                  <div style={{fontSize:11,color:"var(--dim)",marginTop:3}}>{h.time}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:14,fontWeight:700,color:h.conf>=75?"var(--green)":h.conf>=50?"var(--amber)":"var(--red)",marginBottom:4}}>{h.conf}%</div>
                  <span className={`badge ${h.status==="verified"?"badge-green":"badge-amber"}`}>
                    {h.status==="verified"?"Verified":"Low conf."}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SETTINGS tab ── */}
      {activeTab==="settings" && (
        <div style={{display:"flex",flexDirection:"column",gap:12}} className="fadeIn">

          {/* Preferences */}
          <div className="card" style={{overflow:"hidden"}}>
            <div style={{padding:"14px 18px 10px",borderBottom:"1px solid var(--b1)"}}>
              <span style={{fontWeight:600,fontSize:14}}>Preferences</span>
            </div>
            {[
              {label:"Anonymous mode",        sub:"Hide identity from all reports",    val:anonMode,    set:setAnonMode,    ico:"🕶️"},
              {label:"Push notifications",    sub:"Get alerted when nearby incidents", val:notifs,      set:setNotifs,      ico:"🔔"},
              {label:"Nearby alert radius",   sub:"Notify me within 5km",             val:nearbyAlert, set:setNearbyAlert, ico:"📍"},
            ].map(s=>(
              <div key={s.label} className="setting-row">
                <span style={{fontSize:18}}>{s.ico}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:500}}>{s.label}</div>
                  <div style={{fontSize:11,color:"var(--muted)"}}>{s.sub}</div>
                </div>
                <button className="toggle-track" style={{background:s.val?"var(--green)":"rgba(255,255,255,.12)"}} onClick={()=>s.set(v=>!v)}>
                  <div className="toggle-thumb" style={{left:s.val?20:2}}/>
                </button>
              </div>
            ))}
          </div>

          {/* Account */}
          <div className="card" style={{overflow:"hidden"}}>
            <div style={{padding:"14px 18px 10px",borderBottom:"1px solid var(--b1)"}}>
              <span style={{fontWeight:600,fontSize:14}}>Account</span>
            </div>
            {[
              {label:"Change password",  ico:"🔐", color:"#fff"},
              {label:"Export my data",   ico:"📦", color:"#fff"},
              {label:"Delete account",   ico:"🗑️",  color:"var(--red)"},
            ].map(item=>(
              <div key={item.label} className="setting-row" style={{justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:18}}>{item.ico}</span>
                  <span style={{fontSize:13,fontWeight:500,color:item.color}}>{item.label}</span>
                </div>
                <svg viewBox="0 0 20 20" fill="var(--dim)" width="13" height="13"><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd"/></svg>
              </div>
            ))}
          </div>

          {/* Sign out */}
          <button className="btn-ghost" style={{width:"100%",padding:"13px 0",fontSize:14,justifyContent:"center",borderRadius:12}} onClick={onLogout}>
            Sign out of QuickAlert AI
          </button>
        </div>
      )}
    </div>
  );
}

/* ── PAGE ── */
export default function ProfilePage() {
  const path = usePathname();
  // TODO: replace with real Firebase Auth state
  // const { user: firebaseUser, loading } = useAuth();
  const [user, setUser] = useState<any>(null);

  const Header = () => (
    <header className="qa-header">
      <div style={{display:"flex",alignItems:"center",gap:9}}>
        <div className="qa-logo-mark"><svg viewBox="0 0 20 20" fill="white" width="14" height="14"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 3a1 1 0 011 1v3.586l2.707 2.707a1 1 0 11-1.414 1.414l-3-3A1 1 0 019 10V6a1 1 0 011-1z"/></svg></div>
        <span className="qa-logo-name">QuickAlert <span style={{color:"var(--red)"}}>AI</span></span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:6,background:"var(--s1)",border:"1px solid var(--b1)",borderRadius:10,padding:"6px 12px",fontSize:12,color:"#fff"}}>
          <span className="live-dot pulse"/>Live
        </div>
      </div>
    </header>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="noise"/>
      <div className="qa-shell">
        <Sidebar path={path}/>
        <main className="qa-main">
          <Header/>
          {user
            ? <ProfileScreen user={user} onLogout={()=>setUser(null)}/>
            : <AuthScreen onAuth={setUser}/>
          }
        </main>
      </div>
      <BottomNav path={path}/>
    </>
  );
}