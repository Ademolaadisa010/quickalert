"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  onAuthStateChanged, signOut, type User,
} from "firebase/auth";
import {
  collection, query, orderBy, onSnapshot,
  doc, updateDoc, deleteDoc, getDoc, serverTimestamp, limit,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

/* ─────────────── types ─────────────────────────────────────────────────── */
interface ResponderDoc {
  uid:          string;
  name:         string;
  email:        string;
  role:         string;
  hospital:     string;
  hospitalCity: string;
  phone:        string;
  licenseId:    string;
  status:       "pending" | "approved" | "rejected";
  createdAt:    any;
}

interface IncidentDoc {
  id:        string;
  type:      string;
  loc:       string;
  lat:       number;
  lng:       number;
  conf:      number;
  status:    string;
  priority:  string;
  responder: string | null;
  anonymous: boolean;
  mediaUrl:  string | null;
  aiSummary: string;
  aiLevel:   string;
  fake:      boolean;
  createdAt: any;
}

/* ─────────────── styles ─────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');
  :root {
    --red:#E63946;--red-glow:rgba(230,57,70,.2);--red-dim:rgba(230,57,70,.12);
    --amber:#F4A261;--amber-dim:rgba(244,162,97,.12);
    --green:#52B788;--green-dim:rgba(82,183,136,.12);
    --blue:#60A5FA;--blue-dim:rgba(96,165,250,.12);
    --purple:#A78BFA;--purple-dim:rgba(167,139,250,.12);
    --bg:#0C0C0C;--s1:#111;--s2:#161616;--s3:#1c1c1c;
    --b1:rgba(255,255,255,.07);--b2:rgba(255,255,255,.13);
    --muted:rgba(255,255,255,.38);--dim:rgba(255,255,255,.2);
    --sidebar:220px;
  }
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%;background:var(--bg);color:#fff;font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased;}
  a{color:inherit;text-decoration:none;}button{font-family:'DM Sans',sans-serif;}
  ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:10px}

  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(1.3)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}

  .fadeUp{animation:fadeUp .35s ease both}
  .fadeIn{animation:fadeIn .25s ease both}
  .pulse{animation:pulse 2s ease-in-out infinite}

  /* ── SHELL ── */
  .admin-shell{display:flex;min-height:100vh;background:var(--bg);}

  /* ── SIDEBAR ── */
  .admin-sidebar{
    width:var(--sidebar);flex-shrink:0;
    border-right:1px solid var(--b1);
    padding:0;
    display:flex;flex-direction:column;
    position:sticky;top:0;height:100vh;overflow-y:auto;
    background:rgba(9,9,9,.95);
    backdrop-filter:blur(20px);
  }
  @media(max-width:768px){
    .admin-sidebar{display:none;}
    .admin-main{padding-left:0!important;}
  }
  .sb-logo{display:flex;align-items:center;gap:10px;padding:20px 18px 16px;border-bottom:1px solid var(--b1);}
  .sb-logo-mark{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,var(--red),#b91c2c);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 0 16px var(--red-glow);}
  .sb-section{padding:12px 10px 6px;font-family:'DM Mono',monospace;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.2);}
  .sb-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:9px;margin:1px 8px;cursor:pointer;font-size:13px;font-weight:500;color:var(--muted);transition:all .15s;border:none;background:none;width:calc(100% - 16px);text-align:left;}
  .sb-item:hover{background:rgba(255,255,255,.05);color:rgba(255,255,255,.85);}
  .sb-item.active{background:var(--red-dim);color:var(--red);}
  .sb-badge{margin-left:auto;background:var(--red);color:#fff;font-size:10px;font-family:'DM Mono',monospace;padding:1px 7px;border-radius:99px;min-width:20px;text-align:center;}
  .sb-badge-amber{background:var(--amber-dim);color:var(--amber);border:1px solid rgba(244,162,97,.3);}
  .sb-footer{margin-top:auto;padding:14px 10px;border-top:1px solid var(--b1);}
  .sb-user{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:9px;}
  .sb-avatar{width:34px;height:34px;border-radius:50%;background:var(--red-dim);border:1px solid rgba(230,57,70,.25);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;}

  /* ── MAIN ── */
  .admin-main{flex:1;overflow-y:auto;min-width:0;}
  .admin-topbar{position:sticky;top:0;z-index:40;background:rgba(12,12,12,.92);backdrop-filter:blur(20px);border-bottom:1px solid var(--b1);padding:13px 24px;display:flex;align-items:center;justify-content:space-between;}
  .admin-content{padding:24px;}

  /* ── CARDS ── */
  .card{background:var(--s1);border:1px solid var(--b1);border-radius:14px;}
  .card2{background:var(--s2);border:1px solid var(--b1);border-radius:10px;}
  .stat-card{background:var(--s1);border:1px solid var(--b1);border-radius:14px;padding:20px;position:relative;overflow:hidden;}
  .stat-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.02) 0%,transparent 60%);pointer-events:none;}

  /* ── BUTTONS ── */
  .btn{border:none;border-radius:8px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:all .15s;font-family:'DM Sans',sans-serif;}
  .btn-sm{padding:6px 12px;font-size:12px;}
  .btn-md{padding:9px 18px;font-size:13px;}
  .btn-green{background:var(--green-dim);color:var(--green);border:1px solid rgba(82,183,136,.3);}
  .btn-green:hover{background:rgba(82,183,136,.22);}
  .btn-red{background:var(--red);color:#fff;box-shadow:0 0 16px var(--red-glow);}
  .btn-red:hover{background:#cc2834;}
  .btn-red:active{transform:scale(.96);}
  .btn-amber{background:var(--amber-dim);color:var(--amber);border:1px solid rgba(244,162,97,.3);}
  .btn-amber:hover{background:rgba(244,162,97,.22);}
  .btn-ghost{background:rgba(255,255,255,.06);color:rgba(255,255,255,.7);border:1px solid var(--b2);}
  .btn-ghost:hover{background:rgba(255,255,255,.1);color:#fff;}
  .btn-danger{background:var(--red-dim);color:var(--red);border:1px solid rgba(230,57,70,.3);}
  .btn-danger:hover{background:rgba(230,57,70,.2);}

  /* ── BADGES ── */
  .badge{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.05em;padding:3px 9px;border-radius:99px;text-transform:uppercase;font-weight:500;}
  .badge-green{background:var(--green-dim);color:var(--green);border:1px solid rgba(82,183,136,.25);}
  .badge-amber{background:var(--amber-dim);color:var(--amber);border:1px solid rgba(244,162,97,.25);}
  .badge-red{background:var(--red-dim);color:var(--red);border:1px solid rgba(230,57,70,.25);}
  .badge-dim{background:rgba(255,255,255,.06);color:var(--muted);border:1px solid var(--b1);}
  .badge-blue{background:var(--blue-dim);color:var(--blue);border:1px solid rgba(96,165,250,.25);}
  .badge-purple{background:var(--purple-dim);color:var(--purple);border:1px solid rgba(167,139,250,.25);}

  /* ── TABLE ── */
  .admin-table{width:100%;border-collapse:collapse;}
  .admin-table th{text-align:left;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);padding:10px 14px;border-bottom:1px solid var(--b1);font-weight:500;}
  .admin-table td{padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.04);font-size:13px;vertical-align:middle;}
  .admin-table tr:last-child td{border-bottom:none;}
  .admin-table tr:hover td{background:rgba(255,255,255,.02);}

  /* ── MISC ── */
  .lbl{font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);}
  .live-dot{width:6px;height:6px;border-radius:50%;background:var(--green);display:inline-block;}
  .noise{position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:.02;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:200px;}
  .spin-ring{border-radius:50%;border:2px solid var(--amber);border-top-color:transparent;animation:spin .7s linear infinite;}
  .skeleton{background:linear-gradient(90deg,var(--s2) 25%,var(--s3) 50%,var(--s2) 75%);background-size:400px 100%;animation:shimmer 1.4s ease-in-out infinite;border-radius:8px;}
  .tab-btn{padding:7px 14px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:1px solid var(--b2);background:transparent;color:var(--muted);transition:all .15s;}
  .tab-btn.active{background:var(--red);color:#fff;border-color:var(--red);}
  .tab-btn:hover:not(.active){background:rgba(255,255,255,.06);color:#fff;}
  .grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
  .grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
  @media(max-width:900px){.grid-4{grid-template-columns:repeat(2,1fr);}.grid-3{grid-template-columns:repeat(2,1fr);}}
  @media(max-width:540px){.grid-4,.grid-3{grid-template-columns:1fr;}}
  .conf-bar{height:4px;background:rgba(255,255,255,.07);border-radius:99px;overflow:hidden;margin-top:4px;}
  .conf-fill{height:100%;border-radius:99px;}
  .access-denied{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:70vh;gap:12;text-align:center;padding:32px;}
`;

/* ─────────────── sidebar nav items ──────────────────────────────────────── */
const SB_NAV = [
  { id:"overview",    icon:"📊", label:"Overview" },
  { id:"responders",  icon:"👥", label:"Responders" },
  { id:"incidents",   icon:"🚨", label:"Incidents" },
  { id:"analytics",   icon:"📈", label:"Analytics" },
  { id:"settings",    icon:"⚙️",  label:"Settings" },
];

/* ─────────────── helpers ────────────────────────────────────────────────── */
function timeAgo(ts: any): string {
  try {
    const ms = Date.now() - ts.toMillis();
    const m  = Math.floor(ms / 60000);
    if (m < 1)  return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h/24)}d ago`;
  } catch { return "—"; }
}

function confColor(c: number) {
  return c >= 75 ? "#52B788" : c >= 40 ? "#F4A261" : "#E63946";
}

function statusBadgeClass(s: string) {
  return s==="active"?"badge-red":s==="routing"?"badge-amber":s==="responded"?"badge-green":"badge-dim";
}

/* ══════════════════════════════════════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════════════════════════════════════ */
function AdminSidebar({
  page, setPage, adminName, pendingCount, onSignOut,
}: {
  page: string; setPage: (p: string) => void;
  adminName: string; pendingCount: number; onSignOut: () => void;
}) {
  return (
    <aside className="admin-sidebar">
      {/* Logo */}
      <div className="sb-logo">
        <div className="sb-logo-mark">
          <svg viewBox="0 0 20 20" fill="white" width="16" height="16">
            <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 3a1 1 0 011 1v3.586l2.707 2.707a1 1 0 11-1.414 1.414l-3-3A1 1 0 019 10V6a1 1 0 011-1z"/>
          </svg>
        </div>
        <div>
          <div style={{fontWeight:700,fontSize:14,letterSpacing:"-0.01em"}}>QuickAlert</div>
          <div style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"var(--red)",letterSpacing:".06em"}}>ADMIN</div>
        </div>
      </div>

      {/* Nav */}
      <div style={{padding:"10px 0",flex:1}}>
        <div className="sb-section">Main</div>
        {SB_NAV.map(n => (
          <button key={n.id} className={`sb-item${page===n.id?" active":""}`} onClick={()=>setPage(n.id)}>
            <span style={{fontSize:15}}>{n.icon}</span>
            {n.label}
            {n.id==="responders" && pendingCount > 0 && (
              <span className="sb-badge">{pendingCount}</span>
            )}
          </button>
        ))}

        <div className="sb-section" style={{marginTop:8}}>Quick links</div>
        <Link href="/dashboard" className="sb-item">
          <span style={{fontSize:15}}>🏠</span> App Dashboard
        </Link>
        <Link href="/map" className="sb-item">
          <span style={{fontSize:15}}>🗺️</span> Live Map
        </Link>
        <Link href="/responder" className="sb-item">
          <span style={{fontSize:15}}>🚑</span> Responder View
        </Link>
      </div>

      {/* Footer */}
      <div className="sb-footer">
        <div className="sb-user">
          <div className="sb-avatar">🛡️</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{adminName}</div>
            <div style={{fontSize:10,color:"var(--red)",fontFamily:"'DM Mono',monospace"}}>Administrator</div>
          </div>
          <button className="btn btn-sm btn-ghost" style={{padding:"4px 8px",fontSize:11,borderRadius:6}} onClick={onSignOut} title="Sign out">
            <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12"><path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd"/><path fillRule="evenodd" d="M6 10a.75.75 0 01.75-.75h9.546l-1.048-.943a.75.75 0 111.004-1.114l2.5 2.25a.75.75 0 010 1.114l-2.5 2.25a.75.75 0 11-1.004-1.114l1.048-.943H6.75A.75.75 0 016 10z" clipRule="evenodd"/></svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ACCESS DENIED (not admin)
══════════════════════════════════════════════════════════════════════════ */
function AccessDenied({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="access-denied fadeUp">
      <div style={{fontSize:48,marginBottom:16}}>🔒</div>
      <h2 style={{fontSize:22,fontWeight:700,marginBottom:8}}>Admin access only</h2>
      <p style={{color:"var(--muted)",fontSize:14,lineHeight:1.7,maxWidth:320,marginBottom:24}}>
        This dashboard is restricted to QuickAlert administrators. Your account doesn't have admin privileges.
      </p>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
        <Link href="/responder">
          <button className="btn btn-md btn-ghost">Go to Responder View</button>
        </Link>
        <button className="btn btn-md btn-danger" onClick={onSignOut}>Sign out</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   OVERVIEW PAGE
══════════════════════════════════════════════════════════════════════════ */
function OverviewPage({
  responders, incidents,
}: { responders: ResponderDoc[]; incidents: IncidentDoc[] }) {
  const pending  = responders.filter(r=>r.status==="pending").length;
  const approved = responders.filter(r=>r.status==="approved").length;
  const active   = incidents.filter(i=>i.status==="active").length;
  const avgConf  = incidents.length
    ? Math.round(incidents.reduce((s,i)=>s+i.conf,0)/incidents.length)
    : 0;

  const stats = [
    { label:"Pending Approvals", value:pending,   color:"var(--amber)", icon:"⏳", sub:"Awaiting review" },
    { label:"Active Responders", value:approved,  color:"var(--green)", icon:"👨‍⚕️", sub:"Approved accounts" },
    { label:"Active Incidents",  value:active,    color:"var(--red)",   icon:"🚨", sub:"Right now" },
    { label:"Avg AI Confidence", value:`${avgConf}%`, color:"var(--blue)",icon:"🤖", sub:"Across all reports" },
  ];

  const recentIncidents = [...incidents]
    .sort((a,b)=> (b.createdAt?.toMillis?.()||0) - (a.createdAt?.toMillis?.()||0))
    .slice(0,5);

  const recentResponders = [...responders]
    .sort((a,b)=> (b.createdAt?.toMillis?.()||0) - (a.createdAt?.toMillis?.()||0))
    .slice(0,4);

  return (
    <div>
      <div style={{marginBottom:24}}>
        <p className="lbl" style={{marginBottom:6}}>Admin Dashboard</p>
        <h1 style={{fontSize:26,fontWeight:700,letterSpacing:"-0.02em"}}>Overview</h1>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{marginBottom:24}}>
        {stats.map((s,i)=>(
          <div key={s.label} className="stat-card fadeUp" style={{animationDelay:`${i*.06}s`}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
              <span style={{fontSize:24}}>{s.icon}</span>
              <div style={{width:8,height:8,borderRadius:"50%",background:s.color,boxShadow:`0 0 8px ${s.color}`}}/>
            </div>
            <div style={{fontSize:30,fontWeight:700,color:s.color,letterSpacing:"-0.03em",marginBottom:4}}>{s.value}</div>
            <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{s.label}</div>
            <div style={{fontSize:11,color:"var(--muted)"}}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>

        {/* Recent incidents */}
        <div className="card fadeUp" style={{animationDelay:".18s"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",borderBottom:"1px solid var(--b1)"}}>
            <span style={{fontWeight:600,fontSize:14}}>Recent Incidents</span>
            <span className="lbl">{incidents.length} total</span>
          </div>
          {recentIncidents.length===0 ? (
            <div style={{padding:"24px 16px",textAlign:"center",color:"var(--muted)",fontSize:13}}>No incidents yet</div>
          ) : recentIncidents.map(inc=>(
            <div key={inc.id} style={{padding:"10px 16px",borderBottom:"1px solid rgba(255,255,255,.03)",display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:confColor(inc.conf),flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{inc.type}</div>
                <div style={{fontSize:11,color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{inc.loc}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <span className={`badge ${statusBadgeClass(inc.status)}`}>{inc.status}</span>
                <div style={{fontSize:10,color:"var(--muted)",marginTop:3}}>{timeAgo(inc.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent applications */}
        <div className="card fadeUp" style={{animationDelay:".22s"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",borderBottom:"1px solid var(--b1)"}}>
            <span style={{fontWeight:600,fontSize:14}}>Recent Applications</span>
            <span className="lbl">{responders.length} total</span>
          </div>
          {recentResponders.length===0 ? (
            <div style={{padding:"24px 16px",textAlign:"center",color:"var(--muted)",fontSize:13}}>No applications yet</div>
          ) : recentResponders.map(r=>(
            <div key={r.uid} style={{padding:"10px 16px",borderBottom:"1px solid rgba(255,255,255,.03)",display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:"var(--s2)",border:"1px solid var(--b1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>👤</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.name}</div>
                <div style={{fontSize:11,color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.role} · {r.hospitalCity}</div>
              </div>
              <span className={`badge ${r.status==="approved"?"badge-green":r.status==="rejected"?"badge-red":"badge-amber"}`}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   RESPONDERS PAGE
══════════════════════════════════════════════════════════════════════════ */
function RespondersPage({ responders, loading }: { responders: ResponderDoc[]; loading: boolean }) {
  const [filter,    setFilter]    = useState<"all"|"pending"|"approved"|"rejected">("pending");
  const [actionId,  setActionId]  = useState<string|null>(null);

  const filtered = filter==="all" ? responders : responders.filter(r=>r.status===filter);

  const handleApprove = async (uid: string) => {
    setActionId(uid);
    try {
      await updateDoc(doc(db,"responders",uid), { status:"approved", approvedAt: serverTimestamp() });
    } catch(e){ console.error(e); }
    finally { setActionId(null); }
  };

  const handleReject = async (uid: string) => {
    setActionId(uid);
    try {
      await updateDoc(doc(db,"responders",uid), { status:"rejected", rejectedAt: serverTimestamp() });
    } catch(e){ console.error(e); }
    finally { setActionId(null); }
  };

  const handleRevoke = async (uid: string) => {
    if (!confirm("Revoke access? This will set their status back to pending.")) return;
    setActionId(uid);
    try {
      await updateDoc(doc(db,"responders",uid), { status:"pending" });
    } catch(e){ console.error(e); }
    finally { setActionId(null); }
  };

  const counts = {
    all:      responders.length,
    pending:  responders.filter(r=>r.status==="pending").length,
    approved: responders.filter(r=>r.status==="approved").length,
    rejected: responders.filter(r=>r.status==="rejected").length,
  };

  return (
    <div>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:22,flexWrap:"wrap",gap:12}}>
        <div>
          <p className="lbl" style={{marginBottom:6}}>Account Management</p>
          <h1 style={{fontSize:26,fontWeight:700,letterSpacing:"-0.02em"}}>Responders</h1>
        </div>
        {counts.pending > 0 && (
          <div style={{background:"var(--amber-dim)",border:"1px solid rgba(244,162,97,.3)",borderRadius:10,padding:"8px 14px",fontSize:13,color:"var(--amber)",display:"flex",alignItems:"center",gap:7}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"var(--amber)",display:"inline-block"}} className="pulse"/>
            {counts.pending} application{counts.pending!==1?"s":""} awaiting review
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{display:"flex",gap:6,marginBottom:18,flexWrap:"wrap"}}>
        {(["pending","approved","rejected","all"] as const).map(f=>(
          <button key={f} className={`tab-btn${filter===f?" active":""}`} onClick={()=>setFilter(f)}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
            <span style={{marginLeft:4,opacity:.7}}>({counts[f]})</span>
          </button>
        ))}
      </div>

      <div className="card" style={{overflow:"hidden"}}>
        {loading ? (
          <div style={{padding:20,display:"flex",flexDirection:"column",gap:10}}>
            {[1,2,3].map(n=><div key={n} className="skeleton" style={{height:52}}/>)}
          </div>
        ) : filtered.length===0 ? (
          <div style={{padding:"36px 20px",textAlign:"center",color:"var(--muted)",fontSize:13}}>
            No {filter==="all"?"responders":filter+" applications"} found
          </div>
        ) : (
          <div style={{overflowX:"auto"}}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Responder</th>
                  <th>Role</th>
                  <th>Hospital</th>
                  <th>City</th>
                  <th>License ID</th>
                  <th>Applied</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r=>{
                  const busy = actionId===r.uid;
                  return (
                    <tr key={r.uid}>
                      <td>
                        <div style={{fontWeight:600,fontSize:13}}>{r.name}</div>
                        <div style={{fontSize:11,color:"var(--muted)"}}>{r.email}</div>
                        <div style={{fontSize:11,color:"var(--muted)"}}>{r.phone}</div>
                      </td>
                      <td>
                        <span className={`badge ${r.role==="Administrator"?"badge-purple":"badge-blue"}`} style={{fontSize:9}}>
                          {r.role}
                        </span>
                      </td>
                      <td style={{fontSize:12,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.hospital}</td>
                      <td style={{fontSize:12}}>{r.hospitalCity}</td>
                      <td style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"var(--muted)"}}>{r.licenseId||"—"}</td>
                      <td style={{fontSize:11,color:"var(--muted)",whiteSpace:"nowrap"}}>{timeAgo(r.createdAt)}</td>
                      <td>
                        <span className={`badge ${r.status==="approved"?"badge-green":r.status==="rejected"?"badge-red":"badge-amber"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                          {r.status==="pending" && <>
                            <button className="btn btn-sm btn-green" disabled={busy} onClick={()=>handleApprove(r.uid)}>
                              {busy?<div className="spin-ring" style={{width:10,height:10}}/>:"✓ Approve"}
                            </button>
                            <button className="btn btn-sm btn-danger" disabled={busy} onClick={()=>handleReject(r.uid)}>
                              ✕ Reject
                            </button>
                          </>}
                          {r.status==="approved" && (
                            <button className="btn btn-sm btn-amber" disabled={busy} onClick={()=>handleRevoke(r.uid)}>
                              {busy?<div className="spin-ring" style={{width:10,height:10}}/>:"Revoke"}
                            </button>
                          )}
                          {r.status==="rejected" && (
                            <button className="btn btn-sm btn-ghost" disabled={busy} onClick={()=>handleApprove(r.uid)}>
                              {busy?<div className="spin-ring" style={{width:10,height:10}}/>:"Re-approve"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   INCIDENTS PAGE
══════════════════════════════════════════════════════════════════════════ */
function IncidentsPage({ incidents, loading }: { incidents: IncidentDoc[]; loading: boolean }) {
  const [filter, setFilter] = useState("all");

  const STATUSES = ["all","active","routing","responded","resolved"];
  const filtered = filter==="all" ? incidents : incidents.filter(i=>i.status===filter);

  const handleMarkResolved = async (id: string) => {
    try { await updateDoc(doc(db,"incidents",id), { status:"resolved" }); }
    catch(e){ console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this incident? This cannot be undone.")) return;
    try { await deleteDoc(doc(db,"incidents",id)); }
    catch(e){ console.error(e); }
  };

  const emoji = (type: string) =>
    type?.toLowerCase().includes("road")?"🚗":type?.toLowerCase().includes("med")?"🏥":type?.toLowerCase().includes("fire")?"🔥":"📍";

  return (
    <div>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:22,flexWrap:"wrap",gap:12}}>
        <div>
          <p className="lbl" style={{marginBottom:6}}>Incident Management</p>
          <h1 style={{fontSize:26,fontWeight:700,letterSpacing:"-0.02em"}}>All Incidents</h1>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,background:"var(--s1)",border:"1px solid var(--b1)",borderRadius:10,padding:"7px 14px",fontSize:12}}>
          <span className="live-dot pulse"/>
          {incidents.filter(i=>i.status==="active").length} active
        </div>
      </div>

      {/* Filter */}
      <div style={{display:"flex",gap:6,marginBottom:18,flexWrap:"wrap"}}>
        {STATUSES.map(s=>{
          const cnt = s==="all"?incidents.length:incidents.filter(i=>i.status===s).length;
          return (
            <button key={s} className={`tab-btn${filter===s?" active":""}`} onClick={()=>setFilter(s)}>
              {s.charAt(0).toUpperCase()+s.slice(1)} ({cnt})
            </button>
          );
        })}
      </div>

      <div className="card" style={{overflow:"hidden"}}>
        {loading ? (
          <div style={{padding:20,display:"flex",flexDirection:"column",gap:10}}>
            {[1,2,3,4].map(n=><div key={n} className="skeleton" style={{height:56}}/>)}
          </div>
        ) : filtered.length===0 ? (
          <div style={{padding:"36px 20px",textAlign:"center",color:"var(--muted)",fontSize:13}}>No incidents found</div>
        ) : (
          <div style={{overflowX:"auto"}}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Location</th>
                  <th>AI Confidence</th>
                  <th>Status</th>
                  <th>Responder</th>
                  <th>Fake?</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inc=>(
                  <tr key={inc.id}>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <span>{emoji(inc.type)}</span>
                        <div>
                          <div style={{fontWeight:600,fontSize:13}}>{inc.type}</div>
                          {inc.aiSummary && (
                            <div style={{fontSize:10,color:"var(--muted)",maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{inc.aiSummary}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{fontSize:12,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"var(--muted)"}}>
                      {inc.loc}
                      <div style={{fontSize:10,fontFamily:"'DM Mono',monospace"}}>{inc.lat?.toFixed(4)}° N</div>
                    </td>
                    <td>
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:14,fontWeight:700,color:confColor(inc.conf)}}>{inc.conf}%</div>
                      <div className="conf-bar" style={{width:60}}>
                        <div className="conf-fill" style={{width:`${inc.conf}%`,background:confColor(inc.conf)}}/>
                      </div>
                    </td>
                    <td><span className={`badge ${statusBadgeClass(inc.status)}`}>{inc.status}</span></td>
                    <td style={{fontSize:12,color:inc.responder?"#fff":"var(--muted)"}}>{inc.responder||"Unassigned"}</td>
                    <td>
                      {inc.fake
                        ? <span className="badge badge-red" style={{fontSize:9}}>Flagged</span>
                        : <span className="badge badge-dim" style={{fontSize:9}}>No</span>
                      }
                    </td>
                    <td style={{fontSize:11,color:"var(--muted)",whiteSpace:"nowrap"}}>{timeAgo(inc.createdAt)}</td>
                    <td>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        {inc.status!=="resolved" && (
                          <button className="btn btn-sm btn-green" onClick={()=>handleMarkResolved(inc.id)}>
                            ✓ Resolve
                          </button>
                        )}
                        {inc.mediaUrl && (
                          <a href={inc.mediaUrl} target="_blank" rel="noreferrer">
                            <button className="btn btn-sm btn-ghost">▶ Video</button>
                          </a>
                        )}
                        <button className="btn btn-sm btn-danger" onClick={()=>handleDelete(inc.id)}>
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ANALYTICS PAGE
══════════════════════════════════════════════════════════════════════════ */
function AnalyticsPage({ responders, incidents }: { responders: ResponderDoc[]; incidents: IncidentDoc[] }) {
  const byType: Record<string,number> = {};
  const byStatus: Record<string,number> = {};
  incidents.forEach(i=>{
    byType[i.type]   = (byType[i.type]||0)+1;
    byStatus[i.status] = (byStatus[i.status]||0)+1;
  });

  const totalConf = incidents.length ? Math.round(incidents.reduce((s,i)=>s+i.conf,0)/incidents.length) : 0;
  const fakeCount = incidents.filter(i=>i.fake).length;
  const mediaCount= incidents.filter(i=>i.mediaUrl).length;
  const respRate  = incidents.length ? Math.round((incidents.filter(i=>i.status!=="active").length/incidents.length)*100) : 0;

  const typeEntries = Object.entries(byType).sort((a,b)=>b[1]-a[1]);
  const maxType = Math.max(...typeEntries.map(e=>e[1]),1);

  return (
    <div>
      <div style={{marginBottom:24}}>
        <p className="lbl" style={{marginBottom:6}}>Data & Insights</p>
        <h1 style={{fontSize:26,fontWeight:700,letterSpacing:"-0.02em"}}>Analytics</h1>
      </div>

      <div className="grid-4" style={{marginBottom:24}}>
        {[
          {l:"Total Incidents",    v:incidents.length,   c:"var(--red)",   i:"🚨"},
          {l:"Avg AI Confidence",  v:`${totalConf}%`,    c:"var(--blue)",  i:"🤖"},
          {l:"Fake Alerts Flagged",v:fakeCount,          c:"var(--amber)", i:"⚠️"},
          {l:"Response Rate",      v:`${respRate}%`,     c:"var(--green)", i:"✓"},
        ].map((s,idx)=>(
          <div key={s.l} className="stat-card fadeUp" style={{animationDelay:`${idx*.06}s`}}>
            <div style={{fontSize:22,marginBottom:10}}>{s.i}</div>
            <div style={{fontSize:28,fontWeight:700,color:s.c,letterSpacing:"-0.02em",marginBottom:4}}>{s.v}</div>
            <div style={{fontSize:12,color:"var(--muted)"}}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>

        {/* Incident types breakdown */}
        <div className="card" style={{padding:"18px 20px"}}>
          <p style={{fontWeight:600,fontSize:14,marginBottom:16}}>Incidents by Type</p>
          {typeEntries.length===0 ? (
            <div style={{color:"var(--muted)",fontSize:13}}>No data yet</div>
          ) : typeEntries.map(([type,count])=>(
            <div key={type} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:12}}>
                <span>{type}</span>
                <span style={{fontFamily:"'DM Mono',monospace",color:"var(--muted)"}}>{count}</span>
              </div>
              <div style={{height:6,background:"rgba(255,255,255,.06)",borderRadius:99}}>
                <div style={{height:"100%",width:`${(count/maxType)*100}%`,background:"var(--red)",borderRadius:99,transition:"width .6s ease"}}/>
              </div>
            </div>
          ))}
        </div>

        {/* Responder stats */}
        <div className="card" style={{padding:"18px 20px"}}>
          <p style={{fontWeight:600,fontSize:14,marginBottom:16}}>Responder Summary</p>
          {[
            {l:"Total applications", v:responders.length,                              c:"#fff"},
            {l:"Approved",           v:responders.filter(r=>r.status==="approved").length, c:"var(--green)"},
            {l:"Pending review",     v:responders.filter(r=>r.status==="pending").length,  c:"var(--amber)"},
            {l:"Rejected",           v:responders.filter(r=>r.status==="rejected").length, c:"var(--red)"},
            {l:"With video evidence",v:mediaCount,                                     c:"var(--blue)"},
          ].map(row=>(
            <div key={row.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid var(--b1)"}}>
              <span style={{fontSize:13,color:"var(--muted)"}}>{row.l}</span>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:14,fontWeight:700,color:row.c}}>{row.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SETTINGS PAGE
══════════════════════════════════════════════════════════════════════════ */
function SettingsPage({ profile }: { profile: ResponderDoc }) {
  return (
    <div>
      <div style={{marginBottom:24}}>
        <p className="lbl" style={{marginBottom:6}}>System</p>
        <h1 style={{fontSize:26,fontWeight:700,letterSpacing:"-0.02em"}}>Settings</h1>
      </div>

      <div style={{maxWidth:560,display:"flex",flexDirection:"column",gap:16}}>

        {/* Admin profile */}
        <div className="card" style={{padding:"18px 20px"}}>
          <p className="lbl" style={{marginBottom:14}}>Your admin profile</p>
          {[
            ["Name",      profile.name],
            ["Email",     profile.email],
            ["Role",      profile.role],
            ["Hospital",  profile.hospital],
            ["City",      profile.hospitalCity],
            ["Phone",     profile.phone],
            ["License",   profile.licenseId||"—"],
          ].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--b1)",fontSize:13}}>
              <span style={{color:"var(--muted)"}}>{k}</span>
              <span style={{fontWeight:500}}>{v}</span>
            </div>
          ))}
        </div>

        {/* Info */}
        <div style={{background:"var(--blue-dim)",border:"1px solid rgba(96,165,250,.2)",borderRadius:12,padding:"14px 16px",fontSize:13,color:"rgba(96,165,250,.85)",lineHeight:1.6}}>
          <strong>Approving responders:</strong> Go to the Responders tab → find the applicant → click Approve. Their account will immediately unlock the Responder dashboard.
          <br/><br/>
          <strong>Firestore rules:</strong> Admin access is determined by <code style={{fontFamily:"'DM Mono',monospace",fontSize:11}}>role == "Administrator" && status == "approved"</code> in the responders collection.
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SIGN IN FORM (for admin login)
══════════════════════════════════════════════════════════════════════════ */
function AdminSignIn() {
  const [email,   setEmail]   = useState("");
  const [pass,    setPass]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      setError(err.message?.replace("Firebase: ","") ?? "Sign in failed.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:24,background:"var(--bg)"}}>
      <div style={{width:"100%",maxWidth:380}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:56,height:56,borderRadius:14,background:"linear-gradient(135deg,var(--red),#b91c2c)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:"0 0 32px var(--red-glow)"}}>
            <svg viewBox="0 0 20 20" fill="white" width="24" height="24"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 3a1 1 0 011 1v3.586l2.707 2.707a1 1 0 11-1.414 1.414l-3-3A1 1 0 019 10V6a1 1 0 011-1z"/></svg>
          </div>
          <h1 style={{fontSize:22,fontWeight:700,marginBottom:6}}>QuickAlert Admin</h1>
          <p style={{color:"var(--muted)",fontSize:13}}>Sign in with your admin account</p>
        </div>

        {error && (
          <div style={{background:"var(--red-dim)",border:"1px solid rgba(230,57,70,.3)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"var(--red)",marginBottom:16}}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:12}}>
          <input
            style={{background:"var(--s2)",border:"1px solid var(--b2)",borderRadius:10,color:"#fff",padding:"12px 14px",fontSize:14,outline:"none",width:"100%",fontFamily:"'DM Sans',sans-serif"}}
            type="email" placeholder="admin@hospital.org" required
            value={email} onChange={e=>setEmail(e.target.value)}
          />
          <input
            style={{background:"var(--s2)",border:"1px solid var(--b2)",borderRadius:10,color:"#fff",padding:"12px 14px",fontSize:14,outline:"none",width:"100%",fontFamily:"'DM Sans',sans-serif"}}
            type="password" placeholder="Password" required
            value={pass} onChange={e=>setPass(e.target.value)}
          />
          <button
            type="submit" disabled={loading}
            style={{background:"var(--red)",color:"#fff",border:"none",borderRadius:10,padding:"13px",fontSize:15,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 0 24px var(--red-glow)",opacity:loading?.7:1,fontFamily:"'DM Sans',sans-serif"}}
          >
            {loading?<><div style={{width:14,height:14,borderRadius:"50%",border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",animation:"spin .7s linear infinite"}}/>Signing in…</>:"Sign In →"}
          </button>
        </form>

        <p style={{textAlign:"center",fontSize:12,color:"var(--muted)",marginTop:20}}>
          Not an admin? <Link href="/responder" style={{color:"var(--red)",fontWeight:600}}>Responder portal →</Link>
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════════ */
export default function AdminPage() {
  const [authUser,    setAuthUser]    = useState<User|null>(null);
  const [profile,     setProfile]     = useState<ResponderDoc|null>(null);
  const [authReady,   setAuthReady]   = useState(false);

  const [page,        setPage]        = useState("overview");
  const [responders,  setResponders]  = useState<ResponderDoc[]>([]);
  const [incidents,   setIncidents]   = useState<IncidentDoc[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  /* ── Auth listener ── */
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, async user=>{
      setAuthUser(user);
      if (user) {
        try {
          const snap = await getDoc(doc(db,"responders",user.uid));
          if (snap.exists()) setProfile({ uid:user.uid, ...snap.data() } as ResponderDoc);
          else setProfile(null);
        } catch { setProfile(null); }
      } else { setProfile(null); }
      setAuthReady(true);
    });
    return ()=>unsub();
  },[]);

  /* ── Real-time data (only when admin) ── */
  useEffect(()=>{
    if (!profile || profile.role!=="Administrator" || profile.status!=="approved") return;

    const unsubR = onSnapshot(
      query(collection(db,"responders"), orderBy("createdAt","desc")),
      snap=>{
        setResponders(snap.docs.map(d=>({uid:d.id,...d.data()} as ResponderDoc)));
        setDataLoading(false);
      },
      err=>{ console.error(err); setDataLoading(false); }
    );

    const unsubI = onSnapshot(
      query(collection(db,"incidents"), orderBy("createdAt","desc"), limit(200)),
      snap=>{
        setIncidents(snap.docs.map(d=>({id:d.id,...d.data()} as IncidentDoc)));
      }
    );

    return ()=>{ unsubR(); unsubI(); };
  },[profile]);

  const handleSignOut = useCallback(async()=>{
    await signOut(auth);
    setAuthUser(null); setProfile(null);
  },[]);

  const isAdmin = profile?.role==="Administrator" && profile?.status==="approved";
  const pendingCount = responders.filter(r=>r.status==="pending").length;

  /* ── Loading ── */
  if (!authReady) return (
    <>
      <style>{CSS}</style>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",gap:12,background:"var(--bg)",color:"var(--muted)"}}>
        <div className="spin-ring" style={{width:24,height:24,borderWidth:3}}/>
        <span>Loading…</span>
      </div>
    </>
  );

  /* ── Not signed in ── */
  if (!authUser || !profile) return (
    <><style>{CSS}</style><div className="noise"/><AdminSignIn/></>
  );

  /* ── Signed in but not admin ── */
  if (!isAdmin) return (
    <><style>{CSS}</style><div className="noise"/>
    <div style={{background:"var(--bg)",minHeight:"100vh"}}>
      <AccessDenied onSignOut={handleSignOut}/>
    </div>
    </>
  );

  /* ── Admin dashboard ── */
  const pageMap: Record<string, React.ReactNode> = {
    overview:   <OverviewPage   responders={responders} incidents={incidents}/>,
    responders: <RespondersPage responders={responders} loading={dataLoading}/>,
    incidents:  <IncidentsPage  incidents={incidents}   loading={dataLoading}/>,
    analytics:  <AnalyticsPage  responders={responders} incidents={incidents}/>,
    settings:   <SettingsPage   profile={profile}/>,
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="noise"/>
      <div className="admin-shell">

        {/* Sidebar */}
        <AdminSidebar
          page={page} setPage={setPage}
          adminName={profile.name}
          pendingCount={pendingCount}
          onSignOut={handleSignOut}
        />

        {/* Main content */}
        <main className="admin-main">
          {/* Top bar */}
          <div className="admin-topbar">
            <div>
              <div style={{fontSize:13,fontWeight:600}}>{SB_NAV.find(n=>n.id===page)?.label??page}</div>
              <div style={{fontSize:11,color:"var(--muted)"}}>QuickAlert AI · Admin Portal</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              {pendingCount > 0 && (
                <button className="btn btn-sm btn-amber" onClick={()=>setPage("responders")}>
                  ⏳ {pendingCount} pending
                </button>
              )}
              <div style={{display:"flex",alignItems:"center",gap:6,background:"var(--s1)",border:"1px solid var(--b1)",borderRadius:10,padding:"6px 12px",fontSize:12}}>
                <span className="live-dot pulse"/>Live
              </div>
            </div>
          </div>

          {/* Page content */}
          <div className="admin-content">
            {pageMap[page] ?? pageMap.overview}
          </div>
        </main>
      </div>
    </>
  );
}