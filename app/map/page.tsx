"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { statusBadge } from "@/lib/utils";
import type { IncidentDoc } from "@/lib/types";

/* ─────────────── types ─────────────────────────────────────────────────── */
interface MapIncident extends IncidentDoc {
  timeAgo: string;
  emoji:   string;
}

/* ─────────────── helpers ───────────────────────────────────────────────── */
function timeAgoLocal(ts: any): string {
  try {
    const ms = Date.now() - ts.toMillis();
    const m  = Math.floor(ms / 60000);
    if (m < 1)  return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  } catch { return ""; }
}

function incidentEmoji(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("road") || t.includes("accident")) return "🚗";
  if (t.includes("medical"))                         return "🏥";
  if (t.includes("fire"))                            return "🔥";
  return "📍";
}

function markerColor(conf: number): string {
  if (conf >= 75) return "#52B788";
  if (conf >= 40) return "#F4A261";
  return "#E63946";
}

/* ─────────────── static hospitals ─────────────────────────────────────── */
const HOSPITALS = [
  { id:"H1", name:"UI Teaching Hospital",  lat:7.4457, lng:3.8980 },
  { id:"H2", name:"Jericho Specialist",    lat:7.4100, lng:3.9280 },
  { id:"H3", name:"Ring Road State Hosp.", lat:7.3900, lng:3.9320 },
];

/* ─────────────────────────────────────────────────────────────────────────
   STYLES
── ────────────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');
  :root{
    --red:#E63946;--red-glow:rgba(230,57,70,0.2);--red-dim:rgba(230,57,70,0.12);
    --amber:#F4A261;--amber-dim:rgba(244,162,97,0.12);
    --green:#52B788;--green-dim:rgba(82,183,136,0.12);
    --blue:#60A5FA;
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
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(1.3)}}
  @keyframes ripple{0%{transform:scale(1);opacity:.8}100%{transform:scale(3);opacity:0}}
  @keyframes navPop{0%{transform:scale(.8) translateY(4px);opacity:0}65%{transform:scale(1.1)}100%{transform:scale(1) translateY(0);opacity:1}}
  @keyframes shimmer{0%{background-position:-200px 0}100%{background-position:200px 0}}

  .fadeUp{animation:fadeUp .38s ease both}
  .pulse{animation:pulse 2s ease-in-out infinite}
  .skeleton{background:linear-gradient(90deg,var(--s2) 25%,var(--s3) 50%,var(--s2) 75%);background-size:400px 100%;animation:shimmer 1.4s ease-in-out infinite;border-radius:8px;}

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
  .qa-report-wrap:hover .qa-report-pill{transform:scale(1.08);}.qa-report-wrap:active .qa-report-pill{transform:scale(.92);}
  .qa-report-label{font-size:10px;font-weight:600;color:var(--red);}
  .qa-bnav-badge{position:absolute;top:8px;right:calc(50% - 20px);min-width:16px;height:16px;padding:0 4px;border-radius:99px;background:var(--red);color:#fff;font-size:9px;font-family:'DM Mono',monospace;display:flex;align-items:center;justify-content:center;border:2px solid var(--bg);}

  .card{background:var(--s1);border:1px solid var(--b1);border-radius:16px;}
  .card2{background:var(--s2);border:1px solid var(--b1);border-radius:12px;}
  .btn-red{background:var(--red);color:#fff;border:none;border-radius:50px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:7px;transition:all .15s;box-shadow:0 0 24px var(--red-glow);}
  .btn-red:hover{background:#cc2834;}.btn-red:active{transform:scale(.96);}
  .lbl{font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);}
  .badge{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.05em;padding:3px 9px;border-radius:99px;text-transform:uppercase;font-weight:500;}
  .badge-red{background:var(--red-dim);color:var(--red);border:1px solid rgba(230,57,70,.25);}
  .badge-green{background:var(--green-dim);color:var(--green);border:1px solid rgba(82,183,136,.25);}
  .badge-amber{background:var(--amber-dim);color:var(--amber);border:1px solid rgba(244,162,97,.25);}
  .badge-dim{background:rgba(255,255,255,.06);color:var(--muted);border:1px solid var(--b1);}
  .live-dot{width:6px;height:6px;border-radius:50%;background:var(--green);display:inline-block;}
  .noise{position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:.02;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:200px;}

  /* leaflet overrides */
  .leaflet-container{background:#0a0f08!important;font-family:'DM Sans',sans-serif;}
  .leaflet-tile{filter:brightness(0.35) saturate(0.4) hue-rotate(90deg);}
  .leaflet-control-zoom a{background:var(--s2)!important;color:#fff!important;border-color:var(--b1)!important;}
  .leaflet-control-zoom a:hover{background:var(--s3)!important;}
  .leaflet-control-attribution{background:rgba(10,10,10,0.7)!important;color:rgba(255,255,255,.3)!important;font-size:9px!important;}
  .leaflet-popup-content-wrapper{background:var(--s1)!important;border:1px solid var(--b2)!important;border-radius:12px!important;box-shadow:0 8px 32px rgba(0,0,0,.6)!important;color:#fff!important;padding:0!important;}
  .leaflet-popup-content{margin:0!important;width:auto!important;}
  .leaflet-popup-tip{background:var(--s1)!important;}
  .leaflet-popup-close-button{color:var(--muted)!important;font-size:18px!important;top:8px!important;right:8px!important;}
  .leaflet-popup-close-button:hover{color:#fff!important;}

  /* map */
  #qa-leaflet-map{width:100%;height:440px;border-radius:16px;overflow:hidden;border:1px solid var(--b1);}
  @media(min-width:768px){#qa-leaflet-map{height:520px;}}

  /* popup */
  .qa-popup{padding:14px 16px;min-width:210px;}
  .qa-popup-title{font-size:13px;font-weight:700;margin-bottom:3px;}
  .qa-popup-loc{font-size:11px;color:var(--muted);margin-bottom:10px;line-height:1.4;}
  .qa-popup-bar{height:3px;background:rgba(255,255,255,.1);border-radius:99px;margin-bottom:8px;}
  .qa-popup-fill{height:100%;border-radius:99px;}
  .qa-popup-meta{display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap;}
  .qa-popup-ai{font-size:10px;color:rgba(96,165,250,.75);line-height:1.4;margin-bottom:8px;padding:6px 8px;background:rgba(96,165,250,.06);border-radius:6px;border:1px solid rgba(96,165,250,.12);}
  .qa-popup-btn{width:100%;padding:8px 0;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;border:none;background:var(--red);color:#fff;transition:all .15s;}
  .qa-popup-btn:hover{background:#cc2834;}

  /* my location */
  .qa-my-loc{width:16px;height:16px;border-radius:50%;background:#60A5FA;border:3px solid #fff;box-shadow:0 0 0 4px rgba(96,165,250,.3),0 0 20px rgba(96,165,250,.5);}

  /* filters */
  .filter-btn{padding:6px 13px;font-size:12px;border-radius:8px;cursor:pointer;font-weight:600;font-family:'DM Sans',sans-serif;transition:all .15s;border:1px solid var(--b2);background:rgba(255,255,255,.05);color:rgba(255,255,255,.65);}
  .filter-btn:hover{background:rgba(255,255,255,.09);color:#fff;}
  .filter-btn.active{background:var(--red);color:#fff;border-color:var(--red);box-shadow:0 0 16px var(--red-glow);}

  /* incident list */
  .inc-row{padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.04);cursor:pointer;transition:background .15s;}
  .inc-row:last-child{border-bottom:none;}.inc-row:hover{background:rgba(255,255,255,.025);}.inc-row.selected{background:var(--red-dim);}

  /* locate */
  .locate-btn{position:absolute;bottom:60px;right:12px;z-index:400;background:var(--s1);border:1px solid var(--b1);border-radius:10px;padding:8px;cursor:pointer;color:#fff;display:flex;align-items:center;justify-content:center;transition:all .15s;}
  .locate-btn:hover{background:var(--s2);}
`;

/* ─────────────── nav ───────────────────────────────────────────────────── */
const NAV_ITEMS = [
  {href:"/dashboard",label:"Dashboard",      badge:0,icon:<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd"/></svg>},
  {href:"/report",   label:"Report Emergency",badge:0,icon:<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg>},
  {href:"/map",      label:"Live Map",        badge:0,icon:<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd"/></svg>},
  {href:"/responder",label:"Responder View",  badge:0,icon:<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.569 1.175A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z"/></svg>},
  {href:"/profile",  label:"My Profile",      badge:0,icon:<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd"/></svg>},
];
const BOTTOM_TABS = [
  {href:"/dashboard",label:"Home",   icon:<svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22"><path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd"/></svg>},
  {href:"/map",      label:"Map",    icon:<svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd"/></svg>},
  {href:"/responder",label:"Alerts", badge:0,icon:<svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22"><path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.569 1.175A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z"/></svg>},
  {href:"/profile",  label:"Profile",icon:<svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd"/></svg>},
];

function Sidebar({ path, activeCount }: { path:string; activeCount:number }) {
  return (
    <aside className="qa-sidebar">
      <Link href="/dashboard" className="qa-logo">
        <div className="qa-logo-mark"><svg viewBox="0 0 20 20" fill="white" width="14" height="14"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 3a1 1 0 011 1v3.586l2.707 2.707a1 1 0 11-1.414 1.414l-3-3A1 1 0 019 10V6a1 1 0 011-1z"/></svg></div>
        <span className="qa-logo-name">QuickAlert <span style={{color:"var(--red)"}}>AI</span></span>
      </Link>
      {NAV_ITEMS.map(n=>{
        const badge = n.href==="/responder" ? activeCount : n.badge;
        return (
          <Link key={n.href} href={n.href} className={`qa-nav-item${path===n.href?" active":""}`}>
            {n.icon}{n.label}{badge>0&&<span className="qa-nav-badge">{badge}</span>}
          </Link>
        );
      })}
      <div className="qa-user"><div className="qa-user-inner">
        <div className="qa-avatar">👤</div>
        <div><div style={{fontSize:13,fontWeight:500,color:"#fff"}}>Anonymous</div><div style={{fontSize:11,color:"var(--muted)"}}>Trusted</div></div>
        <span className="badge badge-green" style={{marginLeft:"auto"}}>On</span>
      </div></div>
    </aside>
  );
}

function BottomNav({ path, activeCount }: { path:string; activeCount:number }) {
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
          {t.href==="/responder"&&activeCount>0&&<span className="qa-bnav-badge">{activeCount}</span>}
        </Link>
      ))}
    </nav>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   LEAFLET MAP — receives live Firestore incidents as props
── ────────────────────────────────────────────────────────────────────── */
function LeafletMap({
  incidents,
  filter,
  selectedId,
  onSelect,
}: {
  incidents:  MapIncident[];
  filter:     string;
  selectedId: string | null;
  onSelect:   (id: string | null) => void;
}) {
  const mapRef     = useRef<any>(null);
  const LRef       = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const myLocRef   = useRef<any>(null);

  /* ── Load Leaflet CSS once ── */
  useEffect(() => {
    if (document.getElementById("leaflet-css")) return;
    const link  = document.createElement("link");
    link.id     = "leaflet-css";
    link.rel    = "stylesheet";
    link.href   = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }, []);

  /* ── Popup HTML builders ── */
  const buildIncidentPopup = (inc: MapIncident) => {
    const color = markerColor(inc.conf);
    const badgeClass = inc.status==="active"?"badge-red":inc.status==="routing"?"badge-amber":inc.status==="responded"?"badge-green":"badge-dim";
    return `
      <div class="qa-popup">
        <div class="qa-popup-title">${inc.emoji} ${inc.type}</div>
        <div class="qa-popup-loc">${inc.loc}</div>
        <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:5px;">
          <span style="color:var(--muted)">AI Confidence</span>
          <span style="font-family:'DM Mono',monospace;color:${color};font-weight:700">${inc.conf}%</span>
        </div>
        <div class="qa-popup-bar">
          <div class="qa-popup-fill" style="width:${inc.conf}%;background:${color}"></div>
        </div>
        <div class="qa-popup-meta">
          <span class="badge ${badgeClass}">${inc.status}</span>
          <span style="font-size:11px;color:var(--muted)">${inc.timeAgo}</span>
          ${inc.witnesses > 0 ? `<span style="font-size:11px;color:var(--muted)">· 👥 ${inc.witnesses}</span>` : ""}
        </div>
        ${(inc as any).aiSummary ? `<div class="qa-popup-ai">🤖 ${(inc as any).aiSummary}</div>` : ""}
        ${inc.status !== "resolved"
          ? `<button class="qa-popup-btn" onclick="window.location.href='/responder'">🚑 Respond to this alert</button>`
          : `<div style="text-align:center;font-size:12px;color:var(--green);padding:4px 0">✓ Resolved</div>`
        }
      </div>`;
  };

  const buildHospitalPopup = (h: typeof HOSPITALS[0]) =>
    `<div class="qa-popup">
      <div class="qa-popup-title">🏥 ${h.name}</div>
      <div class="qa-popup-loc">Verified hospital — accepting emergency patients</div>
      <div class="qa-popup-meta">
        <span class="badge badge-green">Ready</span>
        <span style="font-size:11px;color:var(--muted)">24/7 Emergency</span>
      </div>
    </div>`;

  /* ── Icon factories ── */
  const makeIcon = (color: string, size: number, L: any) =>
    L.divIcon({
      className: "", iconSize:[size,size], iconAnchor:[size/2,size/2],
      html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2.5px solid rgba(0,0,0,.55);box-shadow:0 0 ${size}px ${color};cursor:pointer;transition:transform .15s;" onmouseover="this.style.transform='scale(1.5)'" onmouseout="this.style.transform='scale(1)'"></div>`,
    });

  const makeMyLocIcon = (L: any) =>
    L.divIcon({ className:"", iconSize:[20,20], iconAnchor:[10,10], html:`<div class="qa-my-loc"></div>` });

  /* ── Init map once ── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const init = async () => {
      // @ts-ignore
      const mod = await import("leaflet");
      const L   = mod.default || mod;
      LRef.current = L;
      if (mapRef.current) return;
      const map = L.map("qa-leaflet-map", { center:[7.3850,3.9470], zoom:13 });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:"© OpenStreetMap contributors", maxZoom:19,
      }).addTo(map);
      mapRef.current = map;
      // Static hospital markers
      HOSPITALS.forEach(h => {
        L.marker([h.lat,h.lng], { icon:makeIcon("#60A5FA",14,L) })
          .addTo(map)
          .bindPopup(buildHospitalPopup(h), { maxWidth:220 });
      });
    };
    init();
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current=null; } };
  }, []); // eslint-disable-line

  /* ── Sync Firestore incidents → map markers (runs on every update) ── */
  useEffect(() => {
    if (!mapRef.current || !LRef.current) return;
    const L   = LRef.current;
    const map = mapRef.current;

    // Remove stale markers (incident deleted from Firestore)
    const liveIds = new Set(incidents.map(i => i.id));
    Object.keys(markersRef.current).forEach(id => {
      if (!liveIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Add or update markers
    incidents.forEach(inc => {
      if (!inc.lat || !inc.lng) return;

      const visible = filter === "all" || inc.status === filter;

      if (!visible) {
        markersRef.current[inc.id]?.remove();
        return;
      }

      const color = markerColor(inc.conf);
      const size  = inc.priority === "high" ? 18 : 14;

      if (markersRef.current[inc.id]) {
        // Update popup in case conf/status changed since last snapshot
        markersRef.current[inc.id].setPopupContent(buildIncidentPopup(inc));
        markersRef.current[inc.id].addTo(map);
      } else {
        // Brand new incident from Firestore
        const marker = L.marker([inc.lat, inc.lng], { icon:makeIcon(color, size, L) })
          .addTo(map)
          .bindPopup(buildIncidentPopup(inc), { maxWidth:240 });
        marker.on("click", () => onSelect(inc.id));
        markersRef.current[inc.id] = marker;
      }
    });
  }, [incidents, filter]); // eslint-disable-line

  /* ── Pan + open popup on selection ── */
  useEffect(() => {
    if (!mapRef.current || !selectedId) return;
    const inc = incidents.find(i => i.id === selectedId);
    if (!inc?.lat) return;
    mapRef.current.setView([inc.lat, inc.lng], 15, { animate:true, duration:0.8 });
    markersRef.current[selectedId]?.openPopup();
  }, [selectedId, incidents]);

  /* ── Locate me ── */
  const locateMe = useCallback(() => {
    if (!navigator.geolocation || !mapRef.current || !LRef.current) return;
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude:lat, longitude:lng } = pos.coords;
      const L = LRef.current;
      myLocRef.current?.remove();
      myLocRef.current = L.marker([lat,lng], { icon:makeMyLocIcon(L) })
        .addTo(mapRef.current)
        .bindPopup("<div style='padding:10px 12px;font-size:12px;color:#fff'>📍 You are here</div>")
        .openPopup();
      mapRef.current.setView([lat,lng], 15, { animate:true });
    }, () => alert("Could not get location — please allow access."));
  }, []);

  return (
    <div style={{ position:"relative" }}>
      <div id="qa-leaflet-map" />
      <button className="locate-btn" onClick={locateMe} title="Show my location">
        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
          <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd"/>
        </svg>
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE
── ────────────────────────────────────────────────────────────────────── */
export default function MapPage() {
  const path = usePathname();

  const [filter,     setFilter]     = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [incidents,  setIncidents]  = useState<MapIncident[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const FILTERS = ["all","active","routing","responded","resolved"] as const;

  /* ── Real-time Firestore listener ── */
  useEffect(() => {
    const q = query(
      collection(db, "incidents"),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    const unsub = onSnapshot(q,
      snap => {
        const docs: MapIncident[] = snap.docs
          .map(d => {
            const data = d.data() as IncidentDoc;
            return {
              ...data,
              id:      d.id,
              timeAgo: timeAgoLocal(data.createdAt),
              emoji:   incidentEmoji(data.type),
            };
          })
          .filter(d => d.lat && d.lng); // only incidents with valid GPS
        setIncidents(docs);
        setLoading(false);
        setError(null);
      },
      err => {
        console.error("Firestore map error:", err);
        setError("Could not load incidents. Check Firestore rules.");
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const filtered    = incidents.filter(i => filter === "all" || i.status === filter);
  const activeCount = incidents.filter(i => i.status === "active").length;

  return (
    <>
      <style>{CSS}</style>
      <div className="noise" />
      <div className="qa-shell">
        <Sidebar path={path} activeCount={activeCount} />

        <main className="qa-main">
          <header className="qa-header">
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              <div className="qa-logo-mark"><svg viewBox="0 0 20 20" fill="white" width="14" height="14"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 3a1 1 0 011 1v3.586l2.707 2.707a1 1 0 11-1.414 1.414l-3-3A1 1 0 019 10V6a1 1 0 011-1z"/></svg></div>
              <span className="qa-logo-name">QuickAlert <span style={{color:"var(--red)"}}>AI</span></span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{display:"flex",alignItems:"center",gap:6,background:"var(--s1)",border:"1px solid var(--b1)",borderRadius:10,padding:"6px 12px",fontSize:12,color:"#fff"}}>
                <span className="live-dot pulse"/>
                {loading ? "Connecting…" : `Live · ${incidents.length} incident${incidents.length!==1?"s":""}`}
              </div>
              <Link href="/report" className="btn-red" style={{padding:"8px 16px",fontSize:13}}>Report</Link>
            </div>
          </header>

          <div style={{padding:"24px 20px"}}>

            {/* Title + filters */}
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:18,flexWrap:"wrap",gap:12}}>
              <div>
                <p className="lbl" style={{marginBottom:5}}>Firestore · Real-time</p>
                <h1 style={{fontSize:26,fontWeight:700,letterSpacing:"-0.02em"}}>Incident Map</h1>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {FILTERS.map(f => {
                  const count = f==="all" ? incidents.length : incidents.filter(i=>i.status===f).length;
                  return (
                    <button key={f} className={`filter-btn${filter===f?" active":""}`} onClick={()=>setFilter(f)}>
                      {f.charAt(0).toUpperCase()+f.slice(1)}
                      {count > 0 && <span style={{marginLeft:4,opacity:.7}}>({count})</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{background:"var(--red-dim)",border:"1px solid rgba(230,57,70,.25)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"var(--red)",marginBottom:14}}>
                ⚠ {error}
              </div>
            )}

            {/* Legend */}
            <div style={{display:"flex",gap:14,marginBottom:14,flexWrap:"wrap"}}>
              {[["#E63946","Low confidence"],["#F4A261","Medium conf."],["#52B788","High conf."],["#60A5FA","Hospital"]].map(([c,l])=>(
                <div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"var(--muted)"}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:c,display:"inline-block",boxShadow:`0 0 5px ${c}`}}/>
                  {l}
                </div>
              ))}
            </div>

            {/* Map */}
            <div style={{marginBottom:14}}>
              {loading
                ? <div className="skeleton" style={{width:"100%",height:440,borderRadius:16}}/>
                : incidents.length === 0
                  ? (
                    <div style={{width:"100%",height:440,borderRadius:16,background:"var(--s2)",border:"1px solid var(--b1)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,color:"var(--muted)"}}>
                      <div style={{fontSize:36}}>🗺️</div>
                      <div style={{fontSize:14,fontWeight:500}}>No incidents yet</div>
                      <div style={{fontSize:12}}>Reports submitted will appear here in real time</div>
                      <Link href="/report" className="btn-red" style={{padding:"9px 20px",fontSize:13,marginTop:4}}>Submit first report</Link>
                    </div>
                  )
                  : (
                    <LeafletMap
                      incidents={filtered}
                      filter={filter}
                      selectedId={selectedId}
                      onSelect={setSelectedId}
                    />
                  )
              }
            </div>

            {/* Incident list */}
            <div className="card fadeUp" style={{overflow:"hidden",animationDelay:".1s"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 15px 11px",borderBottom:"1px solid var(--b1)"}}>
                <span style={{fontWeight:600,fontSize:14}}>
                  Incidents
                  <span style={{marginLeft:8,fontFamily:"'DM Mono',monospace",fontSize:10,color:"var(--muted)"}}>({filtered.length})</span>
                </span>
                <span className="lbl">{filter==="all"?"All statuses":filter}</span>
              </div>
              <div>
                {loading ? (
                  [1,2,3].map(n=>(
                    <div key={n} style={{padding:"12px 14px",borderBottom:"1px solid rgba(255,255,255,.04)",display:"flex",gap:10,alignItems:"center"}}>
                      <div className="skeleton" style={{width:9,height:9,borderRadius:"50%",flexShrink:0}}/>
                      <div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}>
                        <div className="skeleton" style={{height:13,width:"55%"}}/>
                        <div className="skeleton" style={{height:10,width:"75%"}}/>
                      </div>
                      <div className="skeleton" style={{width:36,height:16,borderRadius:4}}/>
                    </div>
                  ))
                ) : filtered.length === 0 ? (
                  <div style={{padding:"28px 16px",textAlign:"center",color:"var(--muted)",fontSize:13}}>
                    {incidents.length === 0
                      ? "No incidents in database yet — submit a report to see it here"
                      : "No incidents match this filter"}
                  </div>
                ) : (
                  filtered.map(inc=>(
                    <div
                      key={inc.id}
                      className={`inc-row${selectedId===inc.id?" selected":""}`}
                      onClick={()=>setSelectedId(selectedId===inc.id?null:inc.id)}
                    >
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:9,height:9,borderRadius:"50%",background:markerColor(inc.conf),flexShrink:0,boxShadow:`0 0 7px ${markerColor(inc.conf)}`}}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap"}}>
                            <span style={{fontSize:14}}>{inc.emoji}</span>
                            <span style={{fontSize:13,fontWeight:600}}>{inc.type}</span>
                            <span className={`badge ${statusBadge[inc.status]}`}>{inc.status}</span>
                            {inc.priority==="high" && <span className="badge badge-red" style={{fontSize:9}}>HIGH</span>}
                          </div>
                          <div style={{fontSize:11,color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{inc.loc}</div>
                          <div style={{fontSize:10,color:"var(--dim)",marginTop:2,fontFamily:"'DM Mono',monospace"}}>
                            {inc.lat.toFixed(4)}° N · {inc.lng.toFixed(4)}° E
                            {inc.accuracy ? ` · ±${inc.accuracy}m` : ""}
                          </div>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{fontFamily:"'DM Mono',monospace",fontSize:14,fontWeight:700,color:markerColor(inc.conf)}}>{inc.conf}%</div>
                          <div style={{fontSize:10,color:"var(--muted)"}}>{inc.timeAgo}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Stats strip */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:14}}>
              {[
                {l:"Active",   v:incidents.filter(i=>i.status==="active").length,   c:"var(--red)"},
                {l:"Routing",  v:incidents.filter(i=>i.status==="routing").length,  c:"var(--amber)"},
                {l:"Resolved", v:incidents.filter(i=>i.status==="resolved").length, c:"var(--green)"},
              ].map(s=>(
                <div key={s.l} className="card2" style={{padding:"12px 14px",textAlign:"center"}}>
                  {loading
                    ? <div className="skeleton" style={{height:22,width:"40%",margin:"0 auto 6px"}}/>
                    : <div style={{fontSize:22,fontWeight:700,color:s.c,letterSpacing:"-0.02em"}}>{s.v}</div>
                  }
                  <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{s.l}</div>
                </div>
              ))}
            </div>

          </div>
        </main>
      </div>

      <BottomNav path={path} activeCount={activeCount} />
    </>
  );
}