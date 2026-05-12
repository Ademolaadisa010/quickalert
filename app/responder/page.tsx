"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  doc, setDoc, getDoc, collection,
  query, where, onSnapshot, orderBy,
  updateDoc, serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { INCIDENTS, confColor, statusBadge } from "@/lib/data";

/* ─────────────── types ─────────────────────────────────────────────────── */
type AccountStatus = "pending" | "approved" | "rejected";

interface ResponderProfile {
  uid:          string;
  name:         string;
  email:        string;
  role:         string;          // "Emergency Physician" | "Paramedic" | "Nurse" | "Administrator"
  hospital:     string;
  hospitalCity: string;
  phone:        string;
  licenseId:    string;
  status:       AccountStatus;
  createdAt:    any;
}

/* ─────────────── styles ─────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');
  :root{
    --red:#E63946;--red-glow:rgba(230,57,70,0.2);--red-dim:rgba(230,57,70,0.12);
    --amber:#F4A261;--amber-dim:rgba(244,162,97,0.12);
    --green:#52B788;--green-dim:rgba(82,183,136,0.12);
    --blue:#60A5FA;--blue-dim:rgba(96,165,250,0.12);
    --bg:#0C0C0C;--s1:#111;--s2:#161616;--s3:#1c1c1c;
    --b1:rgba(255,255,255,0.07);--b2:rgba(255,255,255,0.13);
    --muted:rgba(255,255,255,0.38);--dim:rgba(255,255,255,0.2);
    --nav:70px;
  }
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%;background:var(--bg);color:#fff;font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased;}
  a{color:inherit;text-decoration:none;}button{font-family:'DM Sans',sans-serif;}
  ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:10px}

  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(1.3)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes navPop{0%{transform:scale(.8) translateY(4px);opacity:0}65%{transform:scale(1.1)}100%{transform:scale(1) translateY(0);opacity:1}}

  .fadeUp{animation:fadeUp .38s ease both}
  .fadeIn{animation:fadeIn .25s ease both}
  .pulse{animation:pulse 2s ease-in-out infinite}

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
  .qa-main{flex:1;overflow-y:auto;min-width:0;padding-bottom:calc(var(--nav)+20px);}
  .qa-header{position:sticky;top:0;z-index:50;background:rgba(12,12,12,0.9);backdrop-filter:blur(20px);border-bottom:1px solid var(--b1);padding:14px 20px;display:flex;align-items:center;justify-content:space-between;}
  .qa-bottom-nav{position:fixed;bottom:0;left:0;right:0;z-index:100;height:var(--nav);background:rgba(9,9,9,0.93);backdrop-filter:blur(24px);border-top:1px solid rgba(255,255,255,.07);display:flex;align-items:stretch;justify-content:space-around;padding-bottom:env(safe-area-inset-bottom,0px);}
  .qa-tab{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;background:none;border:none;cursor:pointer;padding:8px 4px;position:relative;color:rgba(255,255,255,.3);-webkit-tap-highlight-color:transparent;text-decoration:none;}
  .qa-tab.active{color:var(--red);}.qa-tab.active .qa-tab-icon{animation:navPop .28s cubic-bezier(.34,1.56,.64,1) both;}
  .qa-tab-label{font-size:10px;font-weight:500;letter-spacing:.02em;}.qa-tab.active .qa-tab-label{color:var(--red);}
  .qa-tab.active::after{content:'';position:absolute;bottom:5px;left:50%;transform:translateX(-50%);width:4px;height:4px;border-radius:50%;background:var(--red);opacity:.7;}
  .qa-report-wrap{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;background:none;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;text-decoration:none;}
  .qa-report-pill{width:50px;height:50px;border-radius:50%;background:var(--red);display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 3px var(--bg),0 0 24px var(--red-glow),0 4px 16px rgba(0,0,0,.5);transition:transform .18s;margin-top:-20px;}
  .qa-report-wrap:active .qa-report-pill{transform:scale(.92);}
  .qa-report-label{font-size:10px;font-weight:600;color:var(--red);}
  .qa-bnav-badge{position:absolute;top:8px;right:calc(50% - 20px);min-width:16px;height:16px;padding:0 4px;border-radius:99px;background:var(--red);color:#fff;font-size:9px;font-family:'DM Mono',monospace;display:flex;align-items:center;justify-content:center;border:2px solid var(--bg);}

  .card{background:var(--s1);border:1px solid var(--b1);border-radius:16px;}
  .card2{background:var(--s2);border:1px solid var(--b1);border-radius:12px;}
  .btn-red{background:var(--red);color:#fff;border:none;border-radius:50px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:7px;transition:all .15s;box-shadow:0 0 24px var(--red-glow);}
  .btn-red:hover{background:#cc2834;}.btn-red:active{transform:scale(.96);}
  .btn-red:disabled{opacity:.45;cursor:not-allowed;}
  .btn-ghost{background:rgba(255,255,255,.06);color:rgba(255,255,255,.75);border:1px solid var(--b2);border-radius:50px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:all .15s;}
  .btn-ghost:hover{background:rgba(255,255,255,.1);color:#fff;}.btn-ghost:active{transform:scale(.96);}
  .btn-green{background:var(--green-dim);color:var(--green);border:1px solid rgba(82,183,136,.28);border-radius:50px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:7px;transition:all .15s;}
  .btn-green:hover{background:rgba(82,183,136,.22);}
  .lbl{font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);}
  .badge{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.05em;padding:3px 9px;border-radius:99px;text-transform:uppercase;font-weight:500;}
  .badge-red{background:var(--red-dim);color:var(--red);border:1px solid rgba(230,57,70,.25);}
  .badge-green{background:var(--green-dim);color:var(--green);border:1px solid rgba(82,183,136,.25);}
  .badge-amber{background:var(--amber-dim);color:var(--amber);border:1px solid rgba(244,162,97,.25);}
  .badge-dim{background:rgba(255,255,255,.06);color:var(--muted);border:1px solid var(--b1);}
  .live-dot{width:6px;height:6px;border-radius:50%;background:var(--green);display:inline-block;}
  .noise{position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:.02;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:200px;}
  .spin-ring{border-radius:50%;border:2px solid var(--amber);border-top-color:transparent;animation:spin .7s linear infinite;}
  .spin-sm{width:14px;height:14px;border-radius:50%;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;animation:spin .7s linear infinite;display:inline-block;}

  .input{background:var(--s2);border:1px solid var(--b2);border-radius:10px;color:#fff;padding:11px 14px;font-size:14px;outline:none;width:100%;transition:border .15s;font-family:'DM Sans',sans-serif;}
  .input:focus{border-color:rgba(255,255,255,.28);}.input::placeholder{color:var(--muted);}
  select.input{cursor:pointer;}

  .form-group{display:flex;flex-direction:column;gap:6px;margin-bottom:14px;}
  .form-label{font-size:12px;font-weight:500;color:rgba(255,255,255,.65);}
  .form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  @media(max-width:480px){.form-row{grid-template-columns:1fr;}}

  .alert-card{background:var(--s1);border:1px solid var(--b1);border-radius:16px;overflow:hidden;transition:border-color .15s;}
  .alert-card:hover{border-color:var(--b2);}
  .alert-header{padding:17px 18px;cursor:pointer;}
  .alert-detail{border-top:1px solid var(--b1);padding:16px 18px;animation:fadeIn .22s ease both;}
  .conf-mini-bar{flex:1;height:3px;background:rgba(255,255,255,.07);border-radius:99px;overflow:hidden;}
  .conf-mini-fill{height:100%;border-radius:99px;}
  .stat-card{background:var(--s1);border:1px solid var(--b1);border-radius:14px;padding:18px;}

  .tab-btn{padding:7px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:1px solid var(--b2);background:transparent;color:var(--muted);transition:all .15s;}
  .tab-btn.active{background:var(--red);color:#fff;border-color:var(--red);box-shadow:0 0 16px var(--red-glow);}
  .tab-btn:hover:not(.active){background:rgba(255,255,255,.06);color:#fff;}
`;

/* ─────────────── nav data ───────────────────────────────────────────────── */
const NAV_ITEMS = [
  {href:"/dashboard",label:"Dashboard",       badge:0,icon:<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd"/></svg>},
  {href:"/report",   label:"Report Emergency",badge:0,icon:<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg>},
  {href:"/map",      label:"Live Map",         badge:0,icon:<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd"/></svg>},
  {href:"/responder",label:"Responder View",   badge:INCIDENTS.filter(i=>i.status==="active").length,icon:<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.569 1.175A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z"/></svg>},
  {href:"/profile",  label:"My Profile",       badge:0,icon:<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd"/></svg>},
];
const BOTTOM_TABS = [
  {href:"/dashboard",label:"Home",   icon:<svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22"><path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd"/></svg>},
  {href:"/map",      label:"Map",    icon:<svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd"/></svg>},
  {href:"/responder",label:"Alerts", badge:INCIDENTS.filter(i=>i.status==="active").length,icon:<svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22"><path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.569 1.175A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z"/></svg>},
  {href:"/profile",  label:"Profile",icon:<svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd"/></svg>},
];

const ROLES = ["Emergency Physician","Paramedic","Emergency Nurse","Ambulance Driver","Administrator"];
const HOSPITALS_LIST = [
  "UI Teaching Hospital, Ibadan",
  "Jericho Specialist Hospital, Ibadan",
  "Ring Road State Hospital, Ibadan",
  "Adeoyo Maternity Hospital, Ibadan",
  "Bowen University Teaching Hospital, Ogbomoso",
  "LUTH — Lagos University Teaching Hospital",
  "Ikorodu General Hospital, Lagos",
  "UNTH — University of Nigeria Teaching Hospital, Enugu",
  "UCTH — University of Calabar Teaching Hospital",
  "Other (specify in notes)",
];

/* ─────────────── nav components ─────────────────────────────────────────── */
function Sidebar({ path }: { path: string }) {
  return (
    <aside className="qa-sidebar">
      <Link href="/dashboard" className="qa-logo">
        <div className="qa-logo-mark"><svg viewBox="0 0 20 20" fill="white" width="14" height="14"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 3a1 1 0 011 1v3.586l2.707 2.707a1 1 0 11-1.414 1.414l-3-3A1 1 0 019 10V6a1 1 0 011-1z"/></svg></div>
        <span className="qa-logo-name">QuickAlert <span style={{color:"var(--red)"}}>AI</span></span>
      </Link>
      {NAV_ITEMS.map(n=>(
        <Link key={n.href} href={n.href} className={`qa-nav-item${path===n.href?" active":""}`}>
          {n.icon}{n.label}{n.badge>0&&<span className="qa-nav-badge">{n.badge}</span>}
        </Link>
      ))}
      <div className="qa-user"><div className="qa-user-inner">
        <div className="qa-avatar">👤</div>
        <div><div style={{fontSize:13,fontWeight:500,color:"#fff"}}>Anonymous</div><div style={{fontSize:11,color:"var(--muted)"}}>Reporter</div></div>
      </div></div>
    </aside>
  );
}
function BottomNav({ path }: { path: string }) {
  return (
    <nav className="qa-bottom-nav">
      {BOTTOM_TABS.slice(0,2).map(t=>(
        <Link key={t.href} href={t.href} className={`qa-tab${path===t.href?" active":""}`}>
          <span className="qa-tab-icon">{t.icon}</span><span className="qa-tab-label">{t.label}</span>
        </Link>
      ))}
      <Link href="/report" className="qa-report-wrap">
        <div className="qa-report-pill"><svg viewBox="0 0 20 20" fill="white" width="22" height="22"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg></div>
        <span className="qa-report-label">Report</span>
      </Link>
      {BOTTOM_TABS.slice(2).map(t=>(
        <Link key={t.href} href={t.href} className={`qa-tab${path===t.href?" active":""}`} style={{position:"relative"}}>
          <span className="qa-tab-icon">{t.icon}</span><span className="qa-tab-label">{t.label}</span>
          {(t as any).badge>0&&<span className="qa-bnav-badge">{(t as any).badge}</span>}
        </Link>
      ))}
    </nav>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   AUTH FORMS
══════════════════════════════════════════════════════════════════════════ */
function AuthForms({ onAuthed }: { onAuthed: () => void }) {
  const [tab,     setTab]     = useState<"signin"|"signup">("signin");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  /* sign in */
  const [siEmail, setSiEmail] = useState("");
  const [siPass,  setSiPass]  = useState("");

  /* sign up */
  const [suName,     setSuName]     = useState("");
  const [suEmail,    setSuEmail]    = useState("");
  const [suPass,     setSuPass]     = useState("");
  const [suPass2,    setSuPass2]    = useState("");
  const [suRole,     setSuRole]     = useState("");
  const [suHospital, setSuHospital] = useState("");
  const [suCity,     setSuCity]     = useState("");
  const [suPhone,    setSuPhone]    = useState("");
  const [suLicense,  setSuLicense]  = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await signInWithEmailAndPassword(auth, siEmail, siPass);
      onAuthed();
    } catch (err: any) {
      setError(err.message?.replace("Firebase: ","") ?? "Sign in failed.");
    } finally { setLoading(false); }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (suPass !== suPass2) { setError("Passwords do not match."); return; }
    if (!suRole || !suHospital) { setError("Please fill in all required fields."); return; }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, suEmail, suPass);
      // Save full responder profile to Firestore — status starts as "pending"
      const profile: Omit<ResponderProfile,"uid"> = {
        name:         suName,
        email:        suEmail,
        role:         suRole,
        hospital:     suHospital,
        hospitalCity: suCity,
        phone:        suPhone,
        licenseId:    suLicense,
        status:       "pending",
        createdAt:    serverTimestamp(),
      };
      await setDoc(doc(db, "responders", cred.user.uid), profile);
      onAuthed();
    } catch (err: any) {
      setError(err.message?.replace("Firebase: ","") ?? "Registration failed.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{maxWidth:480,margin:"0 auto",padding:"32px 20px"}}>
      {/* Header */}
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{width:60,height:60,borderRadius:16,background:"var(--red-dim)",border:"1px solid rgba(230,57,70,.22)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,margin:"0 auto 16px"}}>🛡️</div>
        <h1 style={{fontSize:24,fontWeight:700,letterSpacing:"-0.02em",marginBottom:6}}>Responder Portal</h1>
        <p style={{color:"var(--muted)",fontSize:14,lineHeight:1.6}}>Verified hospital staff and emergency responders only.</p>
      </div>

      {/* Tab switcher */}
      <div style={{display:"flex",gap:8,marginBottom:24,background:"var(--s2)",border:"1px solid var(--b1)",borderRadius:12,padding:4}}>
        {(["signin","signup"] as const).map(t=>(
          <button key={t} className={`tab-btn${tab===t?" active":""}`} style={{flex:1,borderRadius:8}} onClick={()=>{setTab(t);setError("");}}>
            {t==="signin"?"Sign In":"Create Account"}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{background:"var(--red-dim)",border:"1px solid rgba(230,57,70,.3)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"var(--red)",marginBottom:16}}>
          ⚠ {error}
        </div>
      )}

      {/* ── SIGN IN ── */}
      {tab==="signin" && (
        <form onSubmit={handleSignIn}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="input" type="email" placeholder="doctor@hospital.org" required value={siEmail} onChange={e=>setSiEmail(e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="input" type="password" placeholder="••••••••" required value={siPass} onChange={e=>setSiPass(e.target.value)}/>
          </div>
          <button className="btn-red" type="submit" disabled={loading} style={{width:"100%",padding:"14px 0",fontSize:15,justifyContent:"center",borderRadius:12,marginTop:6}}>
            {loading ? <><div className="spin-ring" style={{width:14,height:14}}/>Signing in…</> : "Sign In →"}
          </button>
          <p style={{textAlign:"center",fontSize:12,color:"var(--muted)",marginTop:14}}>
            Don't have an account? <button type="button" onClick={()=>setTab("signup")} style={{background:"none",border:"none",color:"var(--red)",cursor:"pointer",fontWeight:600,fontSize:12}}>Create one</button>
          </p>
        </form>
      )}

      {/* ── SIGN UP ── */}
      {tab==="signup" && (
        <form onSubmit={handleSignUp}>
          <p className="lbl" style={{marginBottom:14,color:"var(--amber)"}}>Personal details</p>

          <div className="form-group">
            <label className="form-label">Full name *</label>
            <input className="input" type="text" placeholder="Dr. Ade Okonkwo" required value={suName} onChange={e=>setSuName(e.target.value)}/>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email address *</label>
              <input className="input" type="email" placeholder="you@hospital.org" required value={suEmail} onChange={e=>setSuEmail(e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Phone number *</label>
              <input className="input" type="tel" placeholder="+234 800 000 0000" required value={suPhone} onChange={e=>setSuPhone(e.target.value)}/>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input className="input" type="password" placeholder="Min 6 characters" required value={suPass} onChange={e=>setSuPass(e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm password *</label>
              <input className="input" type="password" placeholder="Repeat password" required value={suPass2} onChange={e=>setSuPass2(e.target.value)}/>
            </div>
          </div>

          <div style={{height:1,background:"var(--b1)",margin:"8px 0 18px"}}/>
          <p className="lbl" style={{marginBottom:14,color:"var(--amber)"}}>Hospital & credentials</p>

          <div className="form-group">
            <label className="form-label">Role / Position *</label>
            <select className="input" required value={suRole} onChange={e=>setSuRole(e.target.value)}>
              <option value="">Select your role…</option>
              {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Hospital / Institution *</label>
            <select className="input" required value={suHospital} onChange={e=>setSuHospital(e.target.value)}>
              <option value="">Select hospital…</option>
              {HOSPITALS_LIST.map(h=><option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">City / Location *</label>
              <input className="input" type="text" placeholder="e.g. Ibadan, Oyo" required value={suCity} onChange={e=>setSuCity(e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">License / Staff ID</label>
              <input className="input" type="text" placeholder="e.g. MDCN-12345" value={suLicense} onChange={e=>setSuLicense(e.target.value)}/>
            </div>
          </div>

          {/* Info box */}
          <div style={{background:"rgba(96,165,250,.07)",border:"1px solid rgba(96,165,250,.18)",borderRadius:10,padding:"10px 14px",marginBottom:16,display:"flex",gap:8}}>
            <svg viewBox="0 0 20 20" fill="#60A5FA" width="14" height="14" style={{flexShrink:0,marginTop:2}}><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd"/></svg>
            <span style={{fontSize:12,color:"rgba(96,165,250,.8)",lineHeight:1.5}}>
              Your account will be reviewed by a QuickAlert admin before you can access alerts. This usually takes 24–48 hours. You'll be notified once approved.
            </span>
          </div>

          <button className="btn-red" type="submit" disabled={loading} style={{width:"100%",padding:"14px 0",fontSize:15,justifyContent:"center",borderRadius:12}}>
            {loading ? <><div className="spin-ring" style={{width:14,height:14}}/>Submitting…</> : "Submit Application →"}
          </button>
          <p style={{textAlign:"center",fontSize:12,color:"var(--muted)",marginTop:14}}>
            Already registered? <button type="button" onClick={()=>setTab("signin")} style={{background:"none",border:"none",color:"var(--red)",cursor:"pointer",fontWeight:600,fontSize:12}}>Sign in</button>
          </p>
        </form>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PENDING APPROVAL SCREEN
══════════════════════════════════════════════════════════════════════════ */
function PendingScreen({ profile, onSignOut }: { profile: ResponderProfile; onSignOut: () => void }) {
  return (
    <div style={{maxWidth:480,margin:"0 auto",padding:"48px 20px",textAlign:"center"}}>
      <div style={{width:72,height:72,borderRadius:20,background:"var(--amber-dim)",border:"1px solid rgba(244,162,97,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,margin:"0 auto 20px"}}>⏳</div>
      <h2 style={{fontSize:22,fontWeight:700,marginBottom:8}}>Application pending review</h2>
      <p style={{color:"var(--muted)",fontSize:14,lineHeight:1.7,marginBottom:24}}>
        Your account is waiting for admin verification. Once a QuickAlert admin confirms your hospital credentials, you'll gain full access to the responder dashboard.
      </p>

      <div className="card2" style={{padding:"16px 18px",textAlign:"left",marginBottom:20}}>
        <p className="lbl" style={{marginBottom:12}}>Your submitted details</p>
        {[
          ["Name",      profile.name],
          ["Role",      profile.role],
          ["Hospital",  profile.hospital],
          ["City",      profile.hospitalCity],
          ["Phone",     profile.phone],
          ["License ID",profile.licenseId||"Not provided"],
        ].map(([k,v])=>(
          <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid var(--b1)",fontSize:13}}>
            <span style={{color:"var(--muted)"}}>{k}</span>
            <span style={{color:"#fff",fontWeight:500}}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{background:"var(--amber-dim)",border:"1px solid rgba(244,162,97,.25)",borderRadius:10,padding:"10px 14px",fontSize:12,color:"var(--amber)",marginBottom:20,textAlign:"left"}}>
        📧 Once approved, you'll be able to sign back in and immediately access incoming emergency alerts.
      </div>

      <button className="btn-ghost" style={{width:"100%",padding:"12px 0",fontSize:14,justifyContent:"center",borderRadius:12}} onClick={onSignOut}>
        Sign out
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   REJECTED SCREEN
══════════════════════════════════════════════════════════════════════════ */
function RejectedScreen({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div style={{maxWidth:440,margin:"0 auto",padding:"48px 20px",textAlign:"center"}}>
      <div style={{fontSize:40,marginBottom:16}}>❌</div>
      <h2 style={{fontSize:22,fontWeight:700,marginBottom:8}}>Application not approved</h2>
      <p style={{color:"var(--muted)",fontSize:14,lineHeight:1.7,marginBottom:24}}>
        Your account application was reviewed and could not be approved. This may be due to incomplete or unverifiable credentials.
      </p>
      <p style={{color:"var(--muted)",fontSize:13,marginBottom:24}}>
        Contact <a href="mailto:admin@quickalert.ai" style={{color:"var(--red)"}}>admin@quickalert.ai</a> if you believe this is an error.
      </p>
      <button className="btn-ghost" style={{width:"100%",padding:"12px 0",fontSize:14,justifyContent:"center",borderRadius:12}} onClick={onSignOut}>
        Sign out
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   RESPONDER DASHBOARD (approved users only)
══════════════════════════════════════════════════════════════════════════ */
function ResponderDashboard({ profile, onSignOut }: { profile: ResponderProfile; onSignOut: () => void }) {
  const [expanded, setExpanded] = useState<string|null>(null);
  const [accepted, setAccepted] = useState<string[]>([]);
  const [loading,  setLoading]  = useState<string|null>(null);

  const active = INCIDENTS.filter(i => i.status === "active" || i.status === "routing");

  const handleAccept = async (id: string) => {
    setLoading(id);
    try {
      // Update the incident in Firestore
      await updateDoc(doc(db, "incidents", id), {
        responder:  profile.name,
        status:     "routing",
        respondedAt: serverTimestamp(),
      });
      setAccepted(a => [...a, id]);
    } catch (err) {
      console.error("Accept error:", err);
    } finally { setLoading(null); }
  };

  const emoji = (type: string) =>
    type.includes("Road")?"🚗":type.includes("Medical")?"🏥":"🔥";

  return (
    <div style={{padding:"24px 20px"}}>
      {/* Title */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <div>
          <p className="lbl" style={{color:"var(--amber)",marginBottom:6}}>Responder · Approved</p>
          <h1 style={{fontSize:26,fontWeight:700,letterSpacing:"-0.02em"}}>Incoming Alerts</h1>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:6,background:"var(--green-dim)",border:"1px solid rgba(82,183,136,.25)",borderRadius:10,padding:"7px 12px",fontSize:12,color:"var(--green)"}}>
            <span className="live-dot pulse"/>On duty
          </div>
          <button className="btn-ghost" style={{padding:"7px 14px",fontSize:12,borderRadius:10}} onClick={onSignOut}>Sign out</button>
        </div>
      </div>

      {/* Responder strip */}
      <div className="card2" style={{padding:"12px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:40,height:40,borderRadius:"50%",background:"var(--green-dim)",border:"1px solid rgba(82,183,136,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>👨‍⚕️</div>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:600}}>{profile.name}</div>
          <div style={{fontSize:11,color:"var(--muted)"}}>{profile.role} · {profile.hospital}</div>
        </div>
        <span className="badge badge-green">Verified</span>
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:22}}>
        {[
          {l:"Incoming", v:active.length,   c:"var(--red)"},
          {l:"Accepted", v:accepted.length, c:"var(--green)"},
          {l:"Avg ETA",  v:"4m",            c:"var(--blue)"},
        ].map(s=>(
          <div key={s.l} className="stat-card">
            <div style={{fontSize:26,fontWeight:700,color:s.c,marginBottom:3,letterSpacing:"-0.02em"}}>{s.v}</div>
            <div style={{fontSize:12,color:"var(--muted)"}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Alert cards */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {active.length === 0 ? (
          <div className="card2" style={{padding:"32px 20px",textAlign:"center",color:"var(--muted)",fontSize:14}}>
            <div style={{fontSize:28,marginBottom:8}}>✓</div>
            No active alerts right now
          </div>
        ) : active.map((inc,idx)=>{
          const done = accepted.includes(inc.id);
          const open = expanded === inc.id;
          const busy = loading === inc.id;
          return (
            <div key={inc.id} className="alert-card fadeUp" style={{animationDelay:`${idx*0.07}s`,opacity:done?.6:1,transition:"opacity .3s"}}>
              <div className="alert-header" onClick={()=>setExpanded(open?null:inc.id)}>
                <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                  <div style={{width:42,height:42,borderRadius:11,flexShrink:0,background:inc.priority==="high"?"var(--red-dim)":"var(--amber-dim)",border:`1px solid ${inc.priority==="high"?"rgba(230,57,70,.22)":"rgba(244,162,97,.22)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>
                    {emoji(inc.type)}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4,flexWrap:"wrap"}}>
                      <span style={{fontSize:15,fontWeight:600}}>{inc.type}</span>
                      {inc.priority==="high"&&<span className="badge badge-red" style={{fontSize:9}}>HIGH</span>}
                      <span className={`badge ${(statusBadge as any)[inc.status]??'badge-dim'}`}>{inc.status}</span>
                    </div>
                    <div style={{fontSize:12,color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:6}}>{inc.loc}</div>
                    <div style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:"var(--dim)"}}>
                      <span>📍 {inc.dist}</span><span>·</span>
                      <span>👥 {inc.witnesses}</span><span>·</span>
                      <span>{inc.time}</span>
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:22,fontWeight:700,color:confColor(inc.conf)}}>{inc.conf}%</div>
                    <div style={{fontSize:10,color:"var(--muted)"}}>conf.</div>
                  </div>
                </div>
                <div style={{marginTop:10,height:3,background:"rgba(255,255,255,.07)",borderRadius:99}}>
                  <div style={{height:"100%",width:`${inc.conf}%`,background:confColor(inc.conf),borderRadius:99}}/>
                </div>
              </div>

              {open && (
                <div className="alert-detail">
                  <p className="lbl" style={{marginBottom:10}}>AI breakdown</p>
                  <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:16}}>
                    {([["Image analysis",88],["GPS accuracy",94],["Pattern match",inc.conf]] as [string,number][]).map(([l,v])=>(
                      <div key={l} style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:94,fontSize:11,color:"var(--muted)",flexShrink:0}}>{l}</div>
                        <div className="conf-mini-bar"><div className="conf-mini-fill" style={{width:`${v}%`,background:confColor(v)}}/></div>
                        <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:confColor(v),width:28,textAlign:"right"}}>{v}%</div>
                      </div>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    <button className="btn-ghost" style={{flex:1,padding:"10px 0",fontSize:13,justifyContent:"center",borderRadius:10,minWidth:90}}>
                      🗺️ Navigate
                    </button>
                    <button className="btn-ghost" style={{flex:1,padding:"10px 0",fontSize:13,justifyContent:"center",borderRadius:10,minWidth:90}}>
                      📞 Call
                    </button>
                    <button className={done?"btn-green":"btn-red"} style={{flex:2,padding:"10px 0",fontSize:13,justifyContent:"center",borderRadius:10,minWidth:120}}
                      onClick={()=>!done&&handleAccept(inc.id)}>
                      {busy?<><span className="spin-sm"/>Confirming…</>:done?<>✓ Accepted</>:<>Accept &amp; Respond</>}
                    </button>
                  </div>
                </div>
              )}

              {!open && !done && (
                <div style={{padding:"0 18px 14px",display:"flex",gap:8}}>
                  <button className="btn-ghost" style={{flex:1,padding:"8px 0",fontSize:13,justifyContent:"center",borderRadius:10}} onClick={()=>setExpanded(inc.id)}>View details</button>
                  <button className="btn-red" style={{flex:2,padding:"8px 0",fontSize:13,justifyContent:"center",borderRadius:10}} onClick={()=>handleAccept(inc.id)}>
                    {busy?<><span className="spin-sm"/>Confirming…</>:<>Accept &amp; Respond</>}
                  </button>
                </div>
              )}
              {!open && done && (
                <div style={{padding:"0 18px 13px",fontSize:13,color:"var(--green)",textAlign:"center",fontWeight:500}}>
                  ✓ Response confirmed — en route
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE — orchestrates auth state + profile fetch
══════════════════════════════════════════════════════════════════════════ */
export default function ResponderPage() {
  const path = usePathname();

  const [authUser,  setAuthUser]  = useState<User|null>(null);
  const [profile,   setProfile]   = useState<ResponderProfile|null>(null);
  const [authReady, setAuthReady] = useState(false);   // waiting for onAuthStateChanged

  /* ── Listen to Firebase Auth ── */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (user) {
        // Fetch the Firestore responder profile
        try {
          const snap = await getDoc(doc(db, "responders", user.uid));
          if (snap.exists()) {
            setProfile({ uid: user.uid, ...(snap.data() as Omit<ResponderProfile,"uid">) });
          } else {
            // Signed in via Firebase Auth but no profile doc → sign out
            await signOut(auth);
            setAuthUser(null);
          }
        } catch { /* ignore — will show auth form */ }
      } else {
        setProfile(null);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut(auth);
    setAuthUser(null);
    setProfile(null);
  }, []);

  const Header = () => (
    <header className="qa-header">
      <div style={{display:"flex",alignItems:"center",gap:9}}>
        <div className="qa-logo-mark"><svg viewBox="0 0 20 20" fill="white" width="14" height="14"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 3a1 1 0 011 1v3.586l2.707 2.707a1 1 0 11-1.414 1.414l-3-3A1 1 0 019 10V6a1 1 0 011-1z"/></svg></div>
        <span className="qa-logo-name">QuickAlert <span style={{color:"var(--red)"}}>AI</span></span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6,background:"var(--s1)",border:"1px solid var(--b1)",borderRadius:10,padding:"6px 12px",fontSize:12,color:"#fff"}}>
        <span className="live-dot pulse"/>Live
      </div>
    </header>
  );

  /* ── Loading spinner ── */
  if (!authReady) return (
    <>
      <style>{CSS}</style>
      <div className="qa-shell">
        <Sidebar path={path}/>
        <main className="qa-main">
          <Header/>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",gap:12,color:"var(--muted)"}}>
            <div className="spin-ring" style={{width:28,height:28,borderWidth:3}}/>
            <span style={{fontSize:13}}>Loading…</span>
          </div>
        </main>
      </div>
      <BottomNav path={path}/>
    </>
  );

  /* ── Determine what to show ── */
  let body: React.ReactNode;
  if (!authUser || !profile) {
    body = <AuthForms onAuthed={() => {}} />;
  } else if (profile.status === "pending") {
    body = <PendingScreen profile={profile} onSignOut={handleSignOut} />;
  } else if (profile.status === "rejected") {
    body = <RejectedScreen onSignOut={handleSignOut} />;
  } else {
    // status === "approved"
    body = <ResponderDashboard profile={profile} onSignOut={handleSignOut} />;
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="noise"/>
      <div className="qa-shell">
        <Sidebar path={path}/>
        <main className="qa-main">
          <Header/>
          {body}
        </main>
      </div>
      <BottomNav path={path}/>
    </>
  );
}