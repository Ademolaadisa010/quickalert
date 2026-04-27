"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { INCIDENTS, confColor } from "@/lib/data";

/* ─────────────── STYLES ─────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');
  :root{
    --red:#E63946;--red-glow:rgba(230,57,70,0.2);--red-dim:rgba(230,57,70,0.12);
    --amber:#F4A261;--amber-dim:rgba(244,162,97,0.12);
    --green:#52B788;--green-dim:rgba(82,183,136,0.12);
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
  @keyframes ripple{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.5);opacity:0}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes navPop{0%{transform:scale(.8) translateY(4px);opacity:0}65%{transform:scale(1.1)}100%{transform:scale(1) translateY(0);opacity:1}}
  @keyframes checkPop{0%{transform:scale(0)}70%{transform:scale(1.2)}100%{transform:scale(1)}}
  @keyframes successPop{0%{transform:scale(.5);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
  @keyframes scanLine{0%{top:0%}100%{top:100%}}
  @keyframes recPulse{0%,100%{opacity:1}50%{opacity:.3}}

  .fadeUp{animation:fadeUp .38s ease both}.fadeIn{animation:fadeIn .25s ease both}
  .pulse{animation:pulse 2s ease-in-out infinite}

  /* layout */
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

  /* cards / buttons / inputs */
  .card{background:var(--s1);border:1px solid var(--b1);border-radius:16px;}
  .card2{background:var(--s2);border:1px solid var(--b1);border-radius:12px;}
  .btn-red{background:var(--red);color:#fff;border:none;border-radius:50px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:7px;transition:all .15s;box-shadow:0 0 24px var(--red-glow);}
  .btn-red:hover{background:#cc2834;}.btn-red:active{transform:scale(.96);}
  .btn-red:disabled{opacity:.45;cursor:not-allowed;box-shadow:none;}
  .btn-ghost{background:rgba(255,255,255,.06);color:rgba(255,255,255,.75);border:1px solid var(--b2);border-radius:50px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:all .15s;}
  .btn-ghost:hover{background:rgba(255,255,255,.1);color:#fff;}.btn-ghost:active{transform:scale(.96);}
  .lbl{font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);}
  .badge{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.05em;padding:3px 9px;border-radius:99px;text-transform:uppercase;font-weight:500;}
  .badge-green{background:var(--green-dim);color:var(--green);border:1px solid rgba(82,183,136,.25);}
  .badge-amber{background:var(--amber-dim);color:var(--amber);border:1px solid rgba(244,162,97,.25);}
  .badge-red-sm{background:var(--red-dim);color:var(--red);border:1px solid rgba(230,57,70,.25);}
  .input{background:var(--s2);border:1px solid var(--b2);border-radius:10px;color:#fff;padding:11px 14px;font-size:14px;outline:none;width:100%;transition:border .15s;font-family:'DM Sans',sans-serif;}
  .input:focus{border-color:rgba(255,255,255,.28);}.input::placeholder{color:var(--muted);}
  textarea.input{resize:none;line-height:1.6;}
  .toggle-track{width:40px;height:22px;border-radius:99px;position:relative;cursor:pointer;border:none;transition:background .2s;flex-shrink:0;}
  .toggle-thumb{position:absolute;top:2px;width:18px;height:18px;border-radius:50%;background:#fff;transition:left .2s;}
  .type-tile{background:var(--s2);border:1px solid var(--b1);border-radius:12px;padding:16px 14px;cursor:pointer;text-align:left;transition:all .15s;width:100%;}
  .type-tile:hover{border-color:var(--b2);background:var(--s3);}
  .type-tile.selected{background:var(--red-dim);border-color:rgba(230,57,70,.35);}
  .step-indicator{display:flex;gap:6px;justify-content:center;margin-bottom:28px;}
  .step-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.18);transition:all .3s;}
  .step-dot.done{background:var(--green);}
  .step-dot.current{width:20px;background:var(--red);}
  .check-row{display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--s2);border:1px solid var(--b1);border-radius:12px;}
  .check-circle{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .3s;}
  .spin-ring{border-radius:50%;border:2px solid var(--amber);border-top-color:transparent;animation:spin .7s linear infinite;}
  .summary-row{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--b1);font-size:13px;}
  .summary-row:last-child{border-bottom:none;}
  .live-dot{width:6px;height:6px;border-radius:50%;background:var(--green);display:inline-block;}
  .noise{position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:.02;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:200px;}

  /* camera / video */
  .cam-wrap{position:relative;width:100%;border-radius:16px;overflow:hidden;background:#000;aspect-ratio:4/3;}
  .cam-wrap video{width:100%;height:100%;object-fit:cover;display:block;}
  .cam-corner{position:absolute;width:22px;height:22px;border-color:rgba(255,255,255,.5);border-style:solid;}
  .cam-corner.tl{top:10px;left:10px;border-width:2px 0 0 2px;}
  .cam-corner.tr{top:10px;right:10px;border-width:2px 2px 0 0;}
  .cam-corner.bl{bottom:10px;left:10px;border-width:0 0 2px 2px;}
  .cam-corner.br{bottom:10px;right:10px;border-width:0 2px 2px 0;}
  .scan-bar{position:absolute;left:0;right:0;height:1.5px;background:linear-gradient(90deg,transparent,rgba(230,57,70,.55),transparent);animation:scanLine 2s linear infinite;}
  .rec-badge{position:absolute;top:10px;left:10px;background:rgba(230,57,70,.85);border-radius:6px;padding:3px 8px;font-size:11px;font-family:'DM Mono',monospace;font-weight:700;letter-spacing:.04em;display:flex;align-items:center;gap:5px;backdrop-filter:blur(6px);}
  .rec-dot{width:7px;height:7px;border-radius:50%;background:#fff;animation:recPulse .8s ease-in-out infinite;}
  .gps-overlay{position:absolute;bottom:10px;left:10px;background:rgba(0,0,0,.55);border-radius:7px;padding:4px 9px;font-size:10px;font-family:'DM Mono',monospace;color:var(--green);backdrop-filter:blur(8px);}
  .switch-btn{position:absolute;top:10px;right:10px;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.18);border-radius:8px;padding:6px 8px;cursor:pointer;color:#fff;backdrop-filter:blur(8px);}
  .countdown-ring{position:absolute;bottom:14px;left:50%;transform:translateX(-50%);}
  .countdown-ring svg{transform:rotate(-90deg);}
  .countdown-track{fill:none;stroke:rgba(255,255,255,.15);stroke-width:4;}
  .countdown-fill{fill:none;stroke:var(--red);stroke-width:4;stroke-linecap:round;stroke-dasharray:283;transition:stroke-dashoffset .9s linear;}
  .countdown-label{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace;font-size:15px;font-weight:700;color:#fff;}
  .rec-btn-wrap{position:absolute;bottom:14px;left:50%;transform:translateX(-50%);}
  .rec-btn{width:64px;height:64px;border-radius:50%;border:3px solid rgba(255,255,255,.65);background:rgba(255,255,255,.12);backdrop-filter:blur(8px);cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center;}
  .rec-btn:hover{background:rgba(255,255,255,.22);border-color:#fff;}
  .rec-btn:active{transform:scale(.93);}
  .rec-inner{width:46px;height:46px;border-radius:50%;background:var(--red);transition:border-radius .2s;}
  .rec-btn.recording .rec-inner{border-radius:8px;width:28px;height:28px;background:#fff;}
  .upload-bar{height:3px;background:rgba(255,255,255,.07);border-radius:99px;overflow:hidden;margin-top:8px;}
  .upload-fill{height:100%;border-radius:99px;transition:width .25s;}
  .gps-map{width:100%;height:80px;background:#0a120e;border-radius:8px;position:relative;overflow:hidden;margin-top:10px;}
  .playback-wrap{position:relative;width:100%;border-radius:14px;overflow:hidden;background:#000;aspect-ratio:4/3;}
  .playback-wrap video{width:100%;height:100%;object-fit:cover;display:block;}
  .retake-btn{position:absolute;top:10px;right:10px;background:rgba(0,0,0,.6);border:1px solid rgba(255,255,255,.2);border-radius:8px;padding:6px 12px;cursor:pointer;color:#fff;font-size:12px;font-weight:500;backdrop-filter:blur(8px);}
`;

/* ─────────────────── NAV DATA ────────────────────────────────────────────── */
const ACTIVE_COUNT = INCIDENTS.filter(i => i.status === "active").length;

const NAV_ITEMS = [
  { href:"/dashboard", label:"Dashboard",        badge:0,            icon:<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd"/></svg> },
  { href:"/report",    label:"Report Emergency", badge:0,            icon:<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg> },
  { href:"/map",       label:"Live Map",          badge:0,            icon:<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd"/></svg> },
  { href:"/responder", label:"Responder View",    badge:ACTIVE_COUNT, icon:<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.569 1.175A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z"/></svg> },
  { href:"/profile",   label:"My Profile",        badge:0,            icon:<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd"/></svg> },
];

const BOTTOM_TABS = [
  { href:"/dashboard", label:"Home",    icon:<svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22"><path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd"/></svg> },
  { href:"/map",       label:"Map",     icon:<svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd"/></svg> },
  { href:"/responder", label:"Alerts",  badge:ACTIVE_COUNT, icon:<svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22"><path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.569 1.175A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z"/></svg> },
  { href:"/profile",   label:"Profile", icon:<svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd"/></svg> },
];

const TYPES = [
  { id:"accident", emoji:"🚗", label:"Road Accident",     desc:"Crash, collision, vehicle damage" },
  { id:"medical",  emoji:"🏥", label:"Medical Emergency", desc:"Injury, collapse, cardiac" },
  { id:"fire",     emoji:"🔥", label:"Fire / Hazard",     desc:"Fire, gas leak, chemical" },
  { id:"other",    emoji:"📍", label:"Other Incident",    desc:"Anything else needing help" },
];

const MAX_SECONDS = 10;

/* ─────────────── NAV COMPONENTS ─────────────────────────────────────────── */
function Sidebar({ path }: { path: string }) {
  return (
    <aside className="qa-sidebar">
      <Link href="/dashboard" className="qa-logo">
        <div className="qa-logo-mark"><svg viewBox="0 0 20 20" fill="white" width="14" height="14"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 3a1 1 0 011 1v3.586l2.707 2.707a1 1 0 11-1.414 1.414l-3-3A1 1 0 019 10V6a1 1 0 011-1z"/></svg></div>
        <span className="qa-logo-name">QuickAlert <span style={{ color: "var(--red)" }}>AI</span></span>
      </Link>
      {NAV_ITEMS.map(n => (
        <Link key={n.href} href={n.href} className={`qa-nav-item${path === n.href ? " active" : ""}`}>
          {n.icon}{n.label}
          {n.badge > 0 && <span className="qa-nav-badge">{n.badge}</span>}
        </Link>
      ))}
      <div className="qa-user"><div className="qa-user-inner">
        <div className="qa-avatar">👤</div>
        <div><div style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>Anonymous</div><div style={{ fontSize: 11, color: "var(--muted)" }}>Trusted · 847 pts</div></div>
        <span className="badge badge-green" style={{ marginLeft: "auto" }}>On</span>
      </div></div>
    </aside>
  );
}

function BottomNav({ path }: { path: string }) {
  return (
    <nav className="qa-bottom-nav">
      {BOTTOM_TABS.slice(0, 2).map(t => (
        <Link key={t.href} href={t.href} className={`qa-tab${path === t.href ? " active" : ""}`}>
          <span className="qa-tab-icon">{t.icon}</span><span className="qa-tab-label">{t.label}</span>
        </Link>
      ))}
      <Link href="/report" className="qa-report-wrap">
        <div className="qa-report-pill"><svg viewBox="0 0 20 20" fill="white" width="22" height="22"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg></div>
        <span className="qa-report-label">Report</span>
      </Link>
      {BOTTOM_TABS.slice(2).map(t => (
        <Link key={t.href} href={t.href} className={`qa-tab${path === t.href ? " active" : ""}`} style={{ position: "relative" }}>
          <span className="qa-tab-icon">{t.icon}</span><span className="qa-tab-label">{t.label}</span>
          {(t as any).badge > 0 && <span className="qa-bnav-badge">{(t as any).badge}</span>}
        </Link>
      ))}
    </nav>
  );
}

/* ─────────────── GPS HOOK ────────────────────────────────────────────────── */
type GpsState = {
  status: "idle" | "acquiring" | "locked" | "error";
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  address: string;
  error: string;
};

function useGPS() {
  const [gps, setGps] = useState<GpsState>({
    status: "idle", lat: null, lng: null, accuracy: null, address: "", error: "",
  });

  const acquire = useCallback(() => {
    if (!navigator.geolocation) {
      setGps(g => ({ ...g, status: "error", error: "Geolocation not supported." }));
      return;
    }
    setGps(g => ({ ...g, status: "acquiring" }));
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        setGps(g => ({ ...g, status: "locked", lat, lng, accuracy: Math.round(accuracy) }));
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const d = await r.json();
          setGps(g => ({
            ...g,
            address: d.display_name?.split(",").slice(0, 3).join(", ") || `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
          }));
        } catch {
          setGps(g => ({ ...g, address: `${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E` }));
        }
      },
      err => setGps(g => ({ ...g, status: "error", error: err.message || "Could not get location." })),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  return { gps, acquire };
}

/* ─────────────── CAMERA + VIDEO HOOK ────────────────────────────────────── */

// ── FIX: explicit union type for recStatus includes "recording" ──
type RecStatus = "idle" | "recording" | "done";
type CamStatus = "idle" | "active" | "error";

function useVideoCapture(): {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  camStatus: CamStatus;
  camError: string;
  recStatus: RecStatus;
  elapsed: number;
  dashOffset: number;
  videoBlob: Blob | null;
  videoUrl: string | null;
  facingMode: "environment" | "user";
  startCamera: (mode?: "environment" | "user") => Promise<void>;
  startRecording: () => void;
  stopRecording: () => void;
  retake: () => void;
  switchCamera: () => void;
} {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef   = useRef<Blob[]>([]);

  const [camStatus,  setCamStatus]  = useState<CamStatus>("idle");
  const recStatusRef = useRef<RecStatus>("idle");
  const [recStatus, setRecStatusRaw] = useState<RecStatus>("idle");
  const setRecStatus = (s: RecStatus) => { recStatusRef.current = s; setRecStatusRaw(s); };
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [elapsed,    setElapsed]    = useState(0);
  const [videoBlob,  setVideoBlob]  = useState<Blob | null>(null);
  const [videoUrl,   setVideoUrl]   = useState<string | null>(null);
  const [camError,   setCamError]   = useState("");
  const elapsedTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCamStatus("idle");
  }, []);

  const startCamera = useCallback(async (mode: "environment" | "user" = "environment") => {
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCamStatus("active");
      setCamError("");
    } catch (e: any) {
      setCamStatus("error");
      setCamError(e.message || "Camera access denied.");
    }
  }, [stopCamera]);

  const stopRecording = useCallback(() => {
    if (elapsedTimer.current) { clearInterval(elapsedTimer.current); elapsedTimer.current = null; }
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    setRecStatus("idle");
  }, []);

  const startRecording = useCallback(() => {
    if (!streamRef.current || recStatusRef.current === "recording") return;
    chunksRef.current = [];
    setElapsed(0);
    setVideoBlob(null);
    setVideoUrl(null);

    const mime = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"]
      .find(m => MediaRecorder.isTypeSupported(m)) || "";

    const recorder = new MediaRecorder(streamRef.current, mime ? { mimeType: mime } : undefined);
    recorderRef.current = recorder;

    recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mime || "video/webm" });
      const url  = URL.createObjectURL(blob);
      setVideoBlob(blob);
      setVideoUrl(url);
      setRecStatus("done");
      stopCamera();
    };

    recorder.start(200);
    setRecStatus("recording");

    let sec = 0;
    elapsedTimer.current = setInterval(() => {
      sec++;
      setElapsed(sec);
      if (sec >= MAX_SECONDS) stopRecording();
    }, 1000);
  }, [recStatus, stopCamera, stopRecording]);

  const retake = useCallback(() => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoBlob(null); setVideoUrl(null); setElapsed(0); setRecStatus("idle");
    startCamera(facingMode);
  }, [videoUrl, facingMode, startCamera]);

  const switchCamera = useCallback(() => {
    const next: "environment" | "user" = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    startCamera(next);
  }, [facingMode, startCamera]);

  useEffect(() => () => {
    stopCamera();
    if (elapsedTimer.current) clearInterval(elapsedTimer.current);
  }, [stopCamera]);

  // Circumference for countdown ring (r=45) → 2π×45 ≈ 283
  const dashOffset = (elapsed / MAX_SECONDS) * 283;

  return {
    videoRef,
    camStatus:  camStatus  as CamStatus,
    camError,
    recStatus:  recStatus  as RecStatus,   // locked: "idle" | "recording" | "done"
    elapsed,
    dashOffset,
    videoBlob,
    videoUrl,
    facingMode,
    startCamera, startRecording, stopRecording, retake, switchCamera,
  };
}

/* ─────────────── CLOUDINARY UPLOAD ──────────────────────────────────────── */
async function uploadVideo(blob: Blob): Promise<{ url: string; publicId: string } | null> {
  try {
    const dataUrl = await new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload  = () => res(r.result as string);
      r.onerror = () => rej(new Error("Read failed"));
      r.readAsDataURL(blob);
    });
    const resp = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: dataUrl, resourceType: "video" }),
    });
    const json = await resp.json();
    if (json.error) throw new Error(json.error);
    return { url: json.url, publicId: json.publicId };
  } catch { return null; }
}

/* ─────────────── PAGE ────────────────────────────────────────────────────── */
export default function ReportPage() {
  const path = usePathname();
  const { gps, acquire } = useGPS();
  const cam = useVideoCapture();

  const [step,        setStep]        = useState(0);
  const [type,        setType]        = useState("");
  const [notes,       setNotes]       = useState("");
  const [anon,        setAnon]        = useState(true);
  const [conf,        setConf]        = useState(0);
  const [checks,      setChecks]      = useState([false, false, false]);
  const [uploadProg,  setUploadProg]  = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadErr,   setUploadErr]   = useState("");
  const verifyTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-get GPS on mount
  useEffect(() => { acquire(); }, [acquire]);

  // Start camera when entering step 1
  useEffect(() => {
    if (step === 1) cam.startCamera("environment");
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // Once video is captured → auto go to verify
  useEffect(() => {
    if (cam.videoBlob && step === 1) startVerify();
  }, [cam.videoBlob]); // eslint-disable-line react-hooks/exhaustive-deps

  const startVerify = async () => {
    if (!cam.videoBlob) return;
    setStep(2);
    setConf(0); setChecks([false, false, false]); setUploadProg(0); setUploadErr("");

    // Simulate upload progress while actually uploading
    let prog = 0;
    const progTimer = setInterval(() => { prog = Math.min(prog + 5, 88); setUploadProg(prog); }, 150);
    const result = await uploadVideo(cam.videoBlob);
    clearInterval(progTimer);
    setUploadProg(100);
    if (result) setUploadedUrl(result.url);
    else setUploadErr("Upload failed — report will include local video.");

    // AI confidence simulation
    let v = 0;
    verifyTimer.current = setInterval(() => {
      v += 2; setConf(Math.min(v, 87));
      if (v >= 25) setChecks(c => [true, c[1], c[2]]);
      if (v >= 55) setChecks(c => [c[0], true,  c[2]]);
      if (v >= 80) setChecks([true, true, true]);
      if (v >= 87) { clearInterval(verifyTimer.current!); setTimeout(() => setStep(3), 600); }
    }, 55);
  };

  const reset = () => {
    setStep(0); setType(""); setNotes(""); setConf(0);
    setChecks([false, false, false]); setUploadProg(0);
    setUploadedUrl(null); setUploadErr("");
    if (verifyTimer.current) clearInterval(verifyTimer.current);
    acquire();
  };

  useEffect(() => () => { if (verifyTimer.current) clearInterval(verifyTimer.current); }, []);

  const Header = () => (
    <header className="qa-header">
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <div className="qa-logo-mark"><svg viewBox="0 0 20 20" fill="white" width="14" height="14"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 3a1 1 0 011 1v3.586l2.707 2.707a1 1 0 11-1.414 1.414l-3-3A1 1 0 019 10V6a1 1 0 011-1z"/></svg></div>
        <span className="qa-logo-name">QuickAlert <span style={{ color: "var(--red)" }}>AI</span></span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--s1)", border: "1px solid var(--b1)", borderRadius: 10, padding: "6px 12px", fontSize: 12, color: "#fff" }}>
        <span className="live-dot pulse" />Live
      </div>
    </header>
  );

  /* ══════════════════════════════════════════════════════════════════════════
     STEP 1 — Camera / Video recorder
  ══════════════════════════════════════════════════════════════════════════ */
  if (step === 1) return (
    <>
      <style>{CSS}</style>
      <div className="noise" />
      <div className="qa-shell">
        <Sidebar path={path} />
        <main className="qa-main">
          <Header />
          <div style={{ padding: "20px", maxWidth: 560, margin: "0 auto" }}>

            {/* Back + title */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <button onClick={() => setStep(0)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 13 }}>
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>
                Back
              </button>
              <div>
                <p className="lbl" style={{ color: "var(--red)" }}>10-second live video</p>
                <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em" }}>Record the scene</h2>
              </div>
            </div>

            {/* Camera error state */}
            {cam.camStatus === "error" ? (
              <div style={{ background: "var(--s2)", border: "1px solid rgba(230,57,70,.25)", borderRadius: 16, padding: "28px 20px", textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>📷</div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Camera access denied</div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>{cam.camError}</div>
                <button className="btn-red" style={{ padding: "10px 22px", fontSize: 13 }} onClick={() => cam.startCamera("environment")}>Try again</button>
              </div>
            ) : cam.videoUrl ? (
              /* ── Video captured — show playback + confirm ── */
              <div>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>✓ 10-second video captured. Looks good?</p>
                <div className="playback-wrap" style={{ marginBottom: 14 }}>
                  <video src={cam.videoUrl} controls autoPlay loop playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button className="retake-btn" onClick={cam.retake}>Retake</button>
                </div>
                <button className="btn-red" style={{ width: "100%", padding: "14px 0", fontSize: 15, justifyContent: "center", borderRadius: 12 }} onClick={startVerify}>
                  <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495z" clipRule="evenodd" /></svg>
                  Send this alert
                </button>
              </div>
            ) : (
              /* ── Live camera + record UI ── */
              <div>
                <div className="cam-wrap" style={{ marginBottom: 14 }}>
                  {cam.camStatus === "active" ? (
                    <>
                      <video ref={cam.videoRef} autoPlay playsInline muted />

                      {/* Corner guides */}
                      <div className="cam-corner tl" /><div className="cam-corner tr" />
                      <div className="cam-corner bl" /><div className="cam-corner br" />

                      {/* Scan line */}
                      <div className="scan-bar" />

                      {/* REC badge */}
                      {cam.recStatus === "recording" && (
                        <div className="rec-badge">
                          <div className="rec-dot" />REC &nbsp;{cam.elapsed}s / {MAX_SECONDS}s
                        </div>
                      )}

                      {/* GPS overlay */}
                      {gps.status === "locked" && (
                        <div className="gps-overlay">📍 {gps.lat?.toFixed(4)}°N {gps.lng?.toFixed(4)}°E</div>
                      )}

                      {/* Flip camera (hidden while recording) */}
                      {cam.recStatus !== "recording" && (
                        <button className="switch-btn" onClick={cam.switchCamera}>
                          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" /></svg>
                        </button>
                      )}

                      {/* Countdown ring (recording) OR record button (idle) */}
                      {cam.recStatus === "recording" ? (
                        <div className="countdown-ring">
                          <svg width="72" height="72" viewBox="0 0 100 100">
                            <circle className="countdown-track" cx="50" cy="50" r="45" />
                            <circle className="countdown-fill" cx="50" cy="50" r="45" style={{ strokeDashoffset: cam.dashOffset }} />
                          </svg>
                          <div className="countdown-label">{MAX_SECONDS - cam.elapsed}</div>
                          {/* Tap ring to stop early */}
                          <button onClick={cam.stopRecording} style={{ position: "absolute", inset: 0, background: "transparent", border: "none", cursor: "pointer", borderRadius: "50%" }} />
                        </div>
                      ) : (
                        <div className="rec-btn-wrap">
                          {/* ── FIX: recStatus is now "idle"|"recording"|"done", comparison is valid ── */}
                          <button
                            className={`rec-btn${cam.recStatus === "recording" ? " recording" : ""}`}
                            onClick={cam.startRecording}
                          >
                            <div className="rec-inner" />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Camera loading */
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 10, color: "var(--muted)", padding: 40 }}>
                      <div className="spin-ring" style={{ width: 28, height: 28, borderWidth: 3 }} />
                      <span style={{ fontSize: 12 }}>Starting camera…</span>
                    </div>
                  )}
                </div>

                <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,.22)" }}>
                  {cam.recStatus === "recording"
                    ? "Recording… tap the ring to stop early"
                    : "Tap the red button to start a 10-second recording"}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
      <BottomNav path={path} />
    </>
  );

  /* ══════════════════════════════════════════════════════════════════════════
     STEP 2 — AI Verification
  ══════════════════════════════════════════════════════════════════════════ */
  if (step === 2) return (
    <>
      <style>{CSS}</style>
      <div className="noise" />
      <div className="qa-shell">
        <Sidebar path={path} />
        <main className="qa-main">
          <Header />
          <div style={{ padding: "24px 20px", maxWidth: 520, margin: "0 auto" }}>
            <div className="step-indicator">
              <div className="step-dot done" /><div className="step-dot done" />
              <div className="step-dot current" /><div className="step-dot" />
            </div>

            {/* Video preview + upload progress */}
            {cam.videoUrl && (
              <div className="card" style={{ marginBottom: 18, overflow: "hidden" }}>
                <video src={cam.videoUrl} muted playsInline loop autoPlay style={{ width: "100%", display: "block", maxHeight: 160, objectFit: "cover" }} />
                <div style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                    <span style={{ fontFamily: "'DM Mono',monospace", color: "var(--muted)" }}>
                      {uploadProg < 100
                        ? `Uploading to Cloudinary… ${uploadProg}%`
                        : uploadedUrl ? "✓ Video secured on Cloudinary" : uploadErr || "Uploading…"}
                    </span>
                    {uploadedUrl && <span className="badge badge-green">Secured</span>}
                    {uploadErr   && <span style={{ color: "var(--amber)", fontSize: 11 }}>⚠ Local only</span>}
                  </div>
                  <div className="upload-bar">
                    <div className="upload-fill" style={{ width: `${uploadProg}%`, background: uploadErr ? "var(--amber)" : "var(--green)" }} />
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center", marginBottom: 24 }}>
              <div style={{ position: "relative", width: 72, height: 72 }}>
                <div style={{ position: "absolute", inset: -8, borderRadius: "50%", border: "1px solid var(--amber)", animation: "ripple 1.8s linear infinite", opacity: .4 }} />
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--amber-dim)", border: "1px solid rgba(244,162,97,.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🤖</div>
              </div>
              <div>
                <p className="lbl" style={{ color: "var(--amber)", marginBottom: 8 }}>AI Verification</p>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Verifying alert…</h2>
                <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6 }}>Analysing video, GPS consistency<br />and movement patterns</p>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <span className="lbl">Confidence score</span>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 14, color: confColor(conf) }}>{conf}%</span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,.08)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${conf}%`, background: confColor(conf), borderRadius: 99, transition: "width .12s" }} />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                ["Video analysis",  "Scene matches reported type"],
                ["GPS verification","Location confirmed on grid"],
                ["Pattern analysis","Movement data analysed"],
              ].map(([label, value], i) => (
                <div key={label} className="check-row">
                  <div className="check-circle" style={{ background: checks[i] ? "var(--green-dim)" : "rgba(255,255,255,.05)", border: `1px solid ${checks[i] ? "rgba(82,183,136,.3)" : "var(--b1)"}` }}>
                    {checks[i]
                      ? <svg viewBox="0 0 14 14" fill="none" width="12" height="12" style={{ animation: "checkPop .25s ease both" }}><path d="M2 7l3.5 3.5L12 3" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      : <div className="spin-ring" style={{ width: 10, height: 10 }} />
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

  /* ══════════════════════════════════════════════════════════════════════════
     STEP 3 — Success
  ══════════════════════════════════════════════════════════════════════════ */
  if (step === 3) return (
    <>
      <style>{CSS}</style>
      <div className="noise" />
      <div className="qa-shell">
        <Sidebar path={path} />
        <main className="qa-main">
          <Header />
          <div style={{ padding: "24px 20px", maxWidth: 520, margin: "0 auto" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 28, gap: 14 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--green-dim)", border: "1px solid rgba(82,183,136,.28)", display: "flex", alignItems: "center", justifyContent: "center", animation: "successPop .4s cubic-bezier(.34,1.56,.64,1) both" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" width="36" height="36"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              </div>
              <div>
                <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6 }}>Help is on the way</h2>
                <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 4 }}>Alert dispatched to nearest verified hospital</p>
                <p style={{ fontFamily: "'DM Mono',monospace", color: "var(--green)", fontSize: 13 }}>Confidence 87% · ETA ~4 minutes</p>
              </div>
            </div>

            {/* Video thumbnail */}
            {cam.videoUrl && (
              <div className="card" style={{ marginBottom: 16, overflow: "hidden" }}>
                <video src={cam.videoUrl} muted playsInline loop autoPlay style={{ width: "100%", display: "block", maxHeight: 140, objectFit: "cover" }} />
                {uploadedUrl && (
                  <div style={{ padding: "8px 14px", fontSize: 11, fontFamily: "'DM Mono',monospace", color: "var(--green)", display: "flex", alignItems: "center", gap: 6 }}>
                    <span>☁ Video stored on Cloudinary</span>
                    <a href={uploadedUrl} target="_blank" rel="noreferrer" style={{ color: "rgba(82,183,136,.6)", marginLeft: "auto", fontSize: 10 }}>view →</a>
                  </div>
                )}
              </div>
            )}

            <div className="card fadeUp" style={{ padding: "18px 20px", marginBottom: 18 }}>
              <p className="lbl" style={{ marginBottom: 14 }}>Alert summary</p>
              {[
                ["Incident type", type || "Road Accident"],
                ["Location",      gps.address || "Acquiring…"],
                ["GPS coords",    gps.lat ? `${gps.lat.toFixed(5)}° N, ${gps.lng?.toFixed(5)}° E` : "—"],
                ["GPS accuracy",  gps.accuracy ? `±${gps.accuracy}m` : "—"],
                ["Video",         `10s · ${uploadedUrl ? "Cloudinary ✓" : uploadErr ? "Local only" : "Uploading…"}`],
                ["Confidence",    "87% — High"],
                ["Dispatched to", "Nearest verified hospital"],
              ].map(([k, v]) => (
                <div key={k} className="summary-row">
                  <span style={{ color: "var(--muted)" }}>{k}</span>
                  <span style={{ color: k === "Confidence" || (k === "Video" && uploadedUrl) ? "var(--green)" : "#fff", fontFamily: "'DM Mono',monospace", fontSize: 12 }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-ghost" style={{ flex: 1, padding: "12px 0", fontSize: 14, justifyContent: "center", borderRadius: 12 }} onClick={reset}>New report</button>
              <Link href="/dashboard" style={{ flex: 1 }}>
                <button className="btn-ghost" style={{ width: "100%", padding: "12px 0", fontSize: 14, justifyContent: "center", borderRadius: 12 }}>Dashboard</button>
              </Link>
            </div>
          </div>
        </main>
      </div>
      <BottomNav path={path} />
    </>
  );

  /* ══════════════════════════════════════════════════════════════════════════
     STEP 0 — Main form
  ══════════════════════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{CSS}</style>
      <div className="noise" />
      <div className="qa-shell">
        <Sidebar path={path} />
        <main className="qa-main">
          <Header />
          <div style={{ padding: "24px 20px", maxWidth: 600, margin: "0 auto" }}>
            <div className="step-indicator">
              <div className="step-dot current" /><div className="step-dot" /><div className="step-dot" /><div className="step-dot" />
            </div>

            <div style={{ marginBottom: 24 }}>
              <p className="lbl" style={{ color: "var(--red)", marginBottom: 8 }}>Emergency report</p>
              <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6 }}>What's happening?</h1>
              <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6 }}>Anonymous by default. No account required. You are protected.</p>
            </div>

            {/* ── Incident type ── */}
            <div style={{ marginBottom: 20 }}>
              <p className="lbl" style={{ marginBottom: 10 }}>Incident type</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {TYPES.map(t => (
                  <button key={t.id} className={`type-tile${type === t.label ? " selected" : ""}`} onClick={() => setType(t.label)}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{t.emoji}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: type === t.label ? "var(--red)" : "#fff", marginBottom: 3 }}>{t.label}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── GPS ── */}
            <div className="card2" style={{ padding: "14px 16px", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: gps.status === "locked" ? 6 : 0 }}>
                <p className="lbl">Live location</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {gps.status === "acquiring" && (
                    <span style={{ fontSize: 11, color: "var(--amber)", display: "flex", alignItems: "center", gap: 5 }}>
                      <div className="spin-ring" style={{ width: 10, height: 10 }} /> Acquiring…
                    </span>
                  )}
                  {gps.status === "locked" && <span className="badge badge-green">GPS ✓ ±{gps.accuracy}m</span>}
                  {gps.status === "error"   && <button onClick={acquire} className="btn-ghost" style={{ fontSize: 11, padding: "4px 10px" }}>Retry</button>}
                  {gps.status === "idle"    && <button onClick={acquire} style={{ background: "none", border: "none", color: "var(--amber)", fontSize: 12, cursor: "pointer" }}>Enable</button>}
                </div>
              </div>
              {gps.status === "locked" && (
                <>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{gps.address || `${gps.lat?.toFixed(5)}° N`}</div>
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "var(--muted)", marginTop: 2 }}>
                    {gps.lat?.toFixed(6)}° N · {gps.lng?.toFixed(6)}° E
                  </div>
                  {/* Mini GPS map */}
                  <div className="gps-map">
                    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: .1 }} viewBox="0 0 100 40" preserveAspectRatio="none">
                      {[8, 16, 24, 32].map(v => (
                        <g key={v}>
                          <line x1={v * 2.5} y1="0" x2={v * 2.5} y2="40" stroke="var(--green)" strokeWidth=".4" />
                          <line x1="0" y1={v} x2="100" y2={v} stroke="var(--green)" strokeWidth=".4" />
                        </g>
                      ))}
                    </svg>
                    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 100 40">
                      <circle cx="50" cy="20" r="10" fill="none" stroke="rgba(82,183,136,.18)" strokeWidth="1" />
                      <circle cx="50" cy="20" r="5"  fill="none" stroke="rgba(82,183,136,.35)" strokeWidth="1" />
                      <circle cx="50" cy="20" r="2.5" fill="var(--green)" opacity=".9" />
                    </svg>
                    <div style={{ position: "absolute", bottom: 4, right: 8, fontSize: 9, fontFamily: "'DM Mono',monospace", color: "rgba(82,183,136,.55)" }}>LIVE GPS</div>
                  </div>
                </>
              )}
              {gps.status === "error" && <div style={{ fontSize: 12, color: "var(--amber)", marginTop: 6 }}>{gps.error}</div>}
            </div>

            {/* ── Video record CTA ── */}
            <button
              style={{ width: "100%", background: "var(--s2)", border: `1px dashed ${type ? "rgba(230,57,70,.35)" : "var(--b1)"}`, borderRadius: 14, height: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: type ? "pointer" : "not-allowed", opacity: type ? 1 : 0.5, marginBottom: 14, transition: "all .15s" }}
              onClick={() => type && setStep(1)}
              disabled={!type}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" width="26" height="26" style={{ color: type ? "rgba(255,255,255,.35)" : "rgba(255,255,255,.12)" }}>
                <path d="M3.25 4A2.25 2.25 0 001 6.25v7.5A2.25 2.25 0 003.25 16h7.5A2.25 2.25 0 0013 13.75v-1.13l3.22 2.58A.75.75 0 0017.5 14.5v-9a.75.75 0 00-1.28-.53L13 7.38V6.25A2.25 2.25 0 0010.75 4h-7.5z" />
              </svg>
              <span style={{ fontSize: 12, color: type ? "rgba(255,255,255,.35)" : "rgba(255,255,255,.15)" }}>
                {type ? "Tap to record 10-second live video" : "Select incident type first"}
              </span>
              {type && <span style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "var(--red)" }}>NO GALLERY · LIVE ONLY · 10s MAX</span>}
            </button>

            {/* ── Notes ── */}
            <div style={{ marginBottom: 18 }}>
              <p className="lbl" style={{ marginBottom: 8 }}>Additional context <span style={{ opacity: .5, textTransform: "none", fontSize: 11 }}>(optional)</span></p>
              <textarea className="input" rows={3} placeholder="Number of vehicles, injuries visible, hazards present…" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            {/* ── Anonymous toggle ── */}
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

            {/* ── Submit ── */}
            <button
              className="btn-red"
              style={{ width: "100%", padding: "15px 0", fontSize: 15, justifyContent: "center", borderRadius: 12 }}
              onClick={() => type && setStep(1)}
              disabled={!type}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495z" clipRule="evenodd" /></svg>
              {type ? `Send ${type} Alert` : "Select an incident type first"}
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