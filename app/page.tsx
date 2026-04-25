"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function LandingPage() {
  const [alertActive, setAlertActive]   = useState(false);
  const [confidence,  setConfidence]    = useState(0);
  const [aiTyped,     setAiTyped]       = useState("");
  const [aiDone,      setAiDone]        = useState(false);
  const [scanLine,    setScanLine]      = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      let v = 0;
      const id = setInterval(() => {
        v += 1;
        setConfidence(v);
        if (v >= 87) clearInterval(id);
      }, 22);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const AI_TEXT = "Analysing scene… Road accident detected. Confidence: HIGH. Routing to nearest hospital. ETA 4 min.";
  useEffect(() => {
    let i = 0;
    const t = setTimeout(() => {
      const id = setInterval(() => {
        i++;
        setAiTyped(AI_TEXT.slice(0, i));
        if (i >= AI_TEXT.length) { clearInterval(id); setAiDone(true); }
      }, 28);
    }, 1400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setScanLine(v => (v + 1) % 100), 30);
    return () => clearInterval(id);
  }, []);

  const handleDemoAlert = () => {
    setAlertActive(true);
    setTimeout(() => setAlertActive(false), 3500);
  };

  const steps = [
    {
      num: "01", color: "#E63946",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width="22" height="22"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>,
      title: "One-tap alert",
      desc: "Single button captures live GPS, camera photo, and timestamps. No gallery — live capture only.",
    },
    {
      num: "02", color: "#F4A261",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width="22" height="22"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/><path strokeLinecap="round" strokeLinejoin="round" d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"/></svg>,
      title: "AI verification",
      desc: "Our AI engine analyses the scene image, movement patterns, and location consistency — generating a real-time confidence score.",
    },
    {
      num: "03", color: "#52B788",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width="22" height="22"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/></svg>,
      title: "Multi-user confirmation",
      desc: "Nearby witnesses corroborate the report. More confirmations raise the trust score and unlock priority routing.",
    },
    {
      num: "04", color: "#60A5FA",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width="22" height="22"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 6.75z"/></svg>,
      title: "Smart routing",
      desc: "Alert dispatched to the nearest verified hospital and responders with full context — location, media, and confidence level.",
    },
  ];

  const stats = [
    { value: "< 30s", label: "Alert to responder", color: "#E63946" },
    { value: "87%",   label: "AI verified accuracy", color: "#52B788" },
    { value: "0",     label: "Forced identities",  color: "#F4A261" },
    { value: "24/7",  label: "Always on",          color: "#60A5FA" },
  ];

  const confColor = confidence > 70 ? "#52B788" : confidence > 40 ? "#F4A261" : "#E63946";

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');

        :root {
          --red: #E63946;
          --red-dim: #9B1D24;
          --amber: #F4A261;
          --green: #52B788;
          --blue: #60A5FA;
        }

        .grid-bg {
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .noise {
          position: fixed; inset: 0; pointer-events: none; z-index: 999; opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }

        @keyframes fadeUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes pulse     { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.35;transform:scale(1.3)} }
        @keyframes flash     { 0%,100%{background:#E63946} 50%{background:#ff6b6b} }
        @keyframes glow-pulse{ 0%,100%{box-shadow:0 0 40px rgba(230,57,70,0.25),0 0 80px rgba(230,57,70,0.1)} 50%{box-shadow:0 0 60px rgba(230,57,70,0.4),0 0 120px rgba(230,57,70,0.15)} }
        @keyframes orbit     { from{transform:rotate(0deg) translateX(90px) rotate(0deg)} to{transform:rotate(360deg) translateX(90px) rotate(-360deg)} }
        @keyframes orbit2    { from{transform:rotate(180deg) translateX(60px) rotate(-180deg)} to{transform:rotate(540deg) translateX(60px) rotate(-540deg)} }
        @keyframes blink     { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes shimmer   { from{transform:translateX(-100%)} to{transform:translateX(200%)} }

        .fadeUp   { animation: fadeUp   .55s ease both; }
        .fadeIn   { animation: fadeIn   .3s ease both; }
        .pulse    { animation: pulse    2s ease-in-out infinite; }
        .pulse-dot{ animation: pulse    2s cubic-bezier(0.4,0,0.6,1) infinite; }
        .flash    { animation: flash    .3s ease-in-out 4; }
        .blink    { animation: blink    1.1s step-end infinite; }

        .ai-badge {
          position: relative; overflow: hidden;
          background: linear-gradient(135deg, rgba(230,57,70,0.15) 0%, rgba(244,162,97,0.1) 50%, rgba(96,165,250,0.15) 100%);
          border: 1px solid rgba(230,57,70,0.3);
        }
        .ai-badge::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
          animation: shimmer 2.5s ease-in-out infinite;
        }

        .step-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 24px;
          transition: all .25s; position: relative; overflow: hidden;
        }
        .step-card::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 60%);
          opacity: 0; transition: opacity .25s;
        }
        .step-card:hover { background: rgba(255,255,255,0.045); border-color: rgba(255,255,255,0.13); transform: translateY(-2px); }
        .step-card:hover::before { opacity: 1; }

        .terminal {
          background: #0a0a0a;
          border: 1px solid rgba(82,183,136,0.2);
          border-radius: 14px; font-family: 'DM Mono', monospace;
          position: relative; overflow: hidden;
        }
        .terminal::before {
          content: ''; position: absolute; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(82,183,136,0.4), transparent);
          animation: shimmer 3s ease-in-out infinite;
          top: var(--scan, 50%); opacity: .4;
        }

        .conf-bar-fill { transition: width 2.2s cubic-bezier(0.4,0,0.2,1); }

        .glow-red-btn {
          background: var(--red);
          box-shadow: 0 0 32px rgba(230,57,70,0.4);
          transition: all .2s;
        }
        .glow-red-btn:hover { background: #cc2834; box-shadow: 0 0 48px rgba(230,57,70,0.55); }
        .glow-red-btn:active { transform: scale(.97); }

        .resp-card { transition: all .2s; }
        .resp-card:hover { background: rgba(255,255,255,0.05)!important; border-color: rgba(255,255,255,0.12)!important; transform: translateY(-2px); }

        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.08); border-radius: 10px; }

        /* ── RESPONSIVE ── */
        .nav-links { display: flex; }
        .stats-grid { grid-template-columns: repeat(4,1fr); }
        .hero-panel-grid { grid-template-columns: 1fr 1fr; }
        .ai-engine-grid { grid-template-columns: repeat(3,1fr); }
        .how-grid { grid-template-columns: repeat(2,1fr); }
        .trust-grid { grid-template-columns: 1fr 1fr; gap: 48px; }
        .resp-grid { grid-template-columns: repeat(3,1fr); }
        .sp { padding: 96px 24px; }

        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .hero-panel-grid { grid-template-columns: 1fr !important; }
          .ai-engine-grid { grid-template-columns: 1fr !important; }
          .how-grid { grid-template-columns: 1fr !important; }
          .trust-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
          .resp-grid { grid-template-columns: 1fr !important; }
          .sp { padding: 60px 18px !important; }
          .hero-sec { padding: 100px 18px 60px !important; }
          .cta-btns { flex-direction: column !important; align-items: stretch !important; }
          .cta-btns a, .cta-btns button { justify-content: center; }
          .resp-cta-inner { flex-direction: column !important; align-items: flex-start !important; }
          .final-cta-btns { flex-direction: column !important; align-items: stretch !important; }
          .final-cta-btns a { justify-content: center !important; }
        }

        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; gap: 10px !important; }
          .pipeline-row { flex-wrap: wrap; }
          .pipeline-row > div { flex: 1 1 60px !important; }
        }
      `}</style>

      <div className="noise" />

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 24px",
        background: "rgba(12,12,12,0.85)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: "var(--red)", boxShadow: "0 0 16px rgba(230,57,70,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 20 20" fill="white" width="16" height="16">
              <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 3a1 1 0 011 1v3.586l2.707 2.707a1 1 0 11-1.414 1.414l-3-3A1 1 0 019 10V6a1 1 0 011-1z"/>
            </svg>
          </div>
          <div>
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>QuickAlert</span>
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em", color: "var(--red)" }}> AI</span>
          </div>
        </div>

        <div className="nav-links" style={{ alignItems: "center", gap: 28, fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
          {[["#how","How it works"],["#ai","AI Engine"],["#stats","Impact"],["#responders","Responders"]].map(([h,l]) => (
            <a key={h} href={h} style={{ transition: "color .15s" }}
              onMouseEnter={e=>(e.currentTarget.style.color="#fff")}
              onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.45)")}>{l}</a>
          ))}
        </div>

        <a href="/dashboard" style={{
          fontSize: 13, fontWeight: 600, padding: "8px 18px",
          borderRadius: 99, background: "var(--red)",
          boxShadow: "0 0 20px rgba(230,57,70,0.35)",
          transition: "all .2s", color: "#fff",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#cc2834"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--red)"; }}>
          Open app →
        </a>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} className="grid-bg hero-sec" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 24px 80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "35%", left: "50%", transform: "translate(-50%,-50%)", width: "min(700px,100vw)", height: "min(700px,100vw)", borderRadius: "50%", background: "radial-gradient(circle, rgba(230,57,70,0.12) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "60%", left: "30%", width: "min(400px,80vw)", height: "min(400px,80vw)", borderRadius: "50%", background: "radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* AI badge */}
        <div className="ai-badge fadeUp" style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 99, padding: "6px 14px", fontSize: 12, marginBottom: 28 }}>
          <svg viewBox="0 0 20 20" fill="var(--red)" width="13" height="13">
            <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
          </svg>
          <span style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'DM Mono',monospace", letterSpacing: "0.05em", textTransform: "uppercase", fontSize: 10 }}>Powered by AI · Available worldwide</span>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} className="pulse-dot" />
        </div>

        {/* Headline */}
        <h1 className="fadeUp" style={{ fontSize: "clamp(38px, 7vw, 76px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.03, marginBottom: 22, maxWidth: 780, animationDelay: "0.08s" }}>
          Emergency response,{" "}
          <span style={{ color: "var(--red)", position: "relative" }}>
            AI-verified
            <svg style={{ position: "absolute", bottom: -6, left: 0, right: 0, width: "100%", opacity: 0.4 }} viewBox="0 0 300 8" preserveAspectRatio="none">
              <path d="M0 6 Q75 0 150 5 Q225 10 300 4" fill="none" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </span>{" "}
          and fast.
        </h1>

        <p className="fadeUp" style={{ color: "rgba(255,255,255,0.45)", fontSize: "clamp(15px, 2vw, 18px)", maxWidth: 520, lineHeight: 1.7, marginBottom: 36, fontWeight: 300, animationDelay: "0.15s" }}>
          QuickAlert AI analyses every report with computer vision and real-time data before routing to hospitals — eliminating fake alerts and saving critical minutes.
        </p>

        {/* CTAs */}
        <div className="fadeUp cta-btns" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 52, animationDelay: "0.22s" }}>
          <Link href="/report"
            className={`glow-red-btn ${alertActive ? "flash" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: "#fff", padding: "14px 28px", borderRadius: 99, fontSize: 15, border: "none", cursor: "pointer" }}
          >
            <svg viewBox="0 0 20 20" fill="white" width="15" height="15"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg>
            Report Now
          </Link>
          <a href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, color: "rgba(255,255,255,0.5)", fontWeight: 500, transition: "color .2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}>
            Open dashboard
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd"/></svg>
          </a>
        </div>

        {/* Demo toast */}
        {alertActive && (
          <div className="fadeIn" style={{ position: "fixed", top: 80, right: 16, zIndex: 60, width: "min(300px, calc(100vw - 32px))", background: "#111", border: "1px solid rgba(230,57,70,0.4)", borderRadius: 16, padding: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(230,57,70,0.15)" }}>
            <div style={{ display: "flex", gap: 3, marginBottom: 10 }}>
              {["#E63946","#F4A261","rgba(255,255,255,0.15)"].map((c,i) => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />)}
            </div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "rgba(82,183,136,0.9)", marginBottom: 8 }}>quickalert-ai · engine v2.1</div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
              <span style={{ color: "var(--amber)" }}>▸ </span>scene_analysis<span style={{ color: "rgba(255,255,255,0.3)" }}>({"{"}img, gps{"}"}) </span><br/>
              <span style={{ color: "var(--green)" }}>  ✓ Road accident — 92% conf.</span><br/>
              <span style={{ color: "var(--amber)" }}>▸ </span>route_to_hospital<span style={{ color: "rgba(255,255,255,0.3)" }}>(nearest)</span><br/>
              <span style={{ color: "var(--green)" }}>  ✓ Nearest hospital — 4 min</span>
            </div>
            <div style={{ marginTop: 10, height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 99 }}>
              <div style={{ height: "100%", width: "80%", background: "var(--green)", borderRadius: 99, transition: "width 2s ease" }} />
            </div>
          </div>
        )}

        {/* Hero panels */}
        <div className="fadeUp hero-panel-grid" style={{ display: "grid", gap: 12, width: "100%", maxWidth: 680, animationDelay: "0.3s" }}>
          {/* AI terminal */}
          <div className="terminal" style={{ padding: 16, "--scan": `${scanLine}%` } as any}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)" }} className="pulse" />
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>AI Engine · Live</span>
            </div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "rgba(82,183,136,0.85)", lineHeight: 1.7, minHeight: 70, textAlign: "left" }}>
              {aiTyped}
              {!aiDone && <span className="blink" style={{ color: "var(--green)" }}>▌</span>}
            </div>
            {aiDone && (
              <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
                {[["SCENE","✓"],["GPS","✓"],["PATTERN","✓"]].map(([l,v]) => (
                  <div key={l} style={{ flex: 1, background: "rgba(82,183,136,0.08)", border: "1px solid rgba(82,183,136,0.15)", borderRadius: 6, padding: "5px 4px", textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: "rgba(82,183,136,0.5)", fontFamily: "'DM Mono',monospace", marginBottom: 2 }}>{l}</div>
                    <div style={{ fontSize: 12, color: "var(--green)", fontFamily: "'DM Mono',monospace" }}>{v}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confidence widget */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 16, textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>AI Confidence</span>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 15, fontWeight: 500, color: confColor }}>{confidence}%</span>
            </div>
            <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 99, overflow: "hidden", marginBottom: 14 }}>
              <div className="conf-bar-fill" style={{ height: "100%", width: `${confidence}%`, background: confColor, borderRadius: 99 }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {[["Image analysis", 88],["GPS accuracy", 94],["Pattern match", 87]].map(([l,v]) => (
                <div key={l as string} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono',monospace", width: 82, flexShrink: 0 }}>{l}</div>
                  <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 99 }}>
                    <div style={{ height: "100%", width: `${v}%`, background: "var(--green)", borderRadius: 99 }} />
                  </div>
                  <div style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "var(--green)", width: 22, textAlign: "right" }}>{v}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section id="stats" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "56px 20px" }}>
        <div className="stats-grid" style={{ maxWidth: 860, margin: "0 auto", display: "grid", gap: 14 }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: "center", padding: "20px 12px", borderRadius: 16, background: "rgba(255,255,255,0.02)" }}>
              <div style={{ fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 700, color: s.color, marginBottom: 6, letterSpacing: "-0.03em" }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI ENGINE ── */}
      <section id="ai" className="sp" style={{ padding: "96px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "var(--red)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>AI Engine</p>
            <h2 style={{ fontSize: "clamp(28px,5vw,52px)", fontWeight: 700, letterSpacing: "-0.025em", marginBottom: 16 }}>
              Not just an app.<br />
              <span style={{ color: "var(--red)" }}>An intelligent system.</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.42)", fontSize: "clamp(14px,2vw,16px)", maxWidth: 540, margin: "0 auto", lineHeight: 1.7 }}>
              Our multi-layered AI pipeline processes visual, spatial, and social signals to ensure every alert is authentic and actionable.
            </p>
          </div>
          <div className="ai-engine-grid" style={{ display: "grid", gap: 12, marginBottom: 16 }}>
            {[
              { icon: "📸", title: "Computer Vision",  color: "var(--red)",   desc: "Scene classification, object detection, and accident type recognition from live camera images." },
              { icon: "🧠", title: "Pattern Matching",  color: "var(--amber)", desc: "Cross-references movement patterns, time, location, and historical data to verify authenticity." },
              { icon: "📡", title: "Real-time Routing", color: "var(--green)", desc: "Calculates nearest hospital ETA, responder availability, and optimal dispatch route instantly." },
            ].map(item => (
              <div key={item.title} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "24px 20px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle, ${item.color}22, transparent 70%)` }} />
                <div style={{ fontSize: 28, marginBottom: 14 }}>{item.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: item.color }}>{item.title}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.42)", lineHeight: 1.65 }}>{item.desc}</div>
              </div>
            ))}
          </div>
          {/* Pipeline */}
          <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "20px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 6 }}>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Confidence pipeline — INC-001</span>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "var(--green)" }}>HIGH · 92%</span>
            </div>
            <div className="pipeline-row" style={{ display: "flex", gap: 6 }}>
              {[["Vision",88,"var(--red)"],["Location",94,"var(--amber)"],["Pattern",87,"var(--blue)"],["Social",76,"var(--green)"],["Final",92,"var(--green)"]].map(([l,v,c]) => (
                <div key={l as string} style={{ flex: "1 1 50px" }}>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 99, marginBottom: 6, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${v}%`, background: c as string, borderRadius: 99 }} />
                  </div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", fontFamily: "'DM Mono',monospace", textAlign: "center" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="sp" style={{ padding: "96px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ marginBottom: 44 }}>
            <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "var(--red)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>How it works</p>
            <h2 style={{ fontSize: "clamp(26px,4.5vw,48px)", fontWeight: 700, letterSpacing: "-0.025em", maxWidth: 520 }}>
              From tap to rescue<br />in under 30 seconds.
            </h2>
          </div>
          <div className="how-grid" style={{ display: "grid", gap: 12 }}>
            {steps.map((step, i) => (
              <div key={step.num} className="step-card" style={{ animationDelay: `${i*0.08}s` }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "rgba(255,255,255,0.18)", paddingTop: 2, flexShrink: 0 }}>{step.num}</div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{ color: step.color, background: `${step.color}18`, borderRadius: 8, padding: 6, display: "flex" }}>{step.icon}</div>
                      <h3 style={{ fontSize: 14, fontWeight: 600 }}>{step.title}</h3>
                    </div>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ANONYMOUS + TRUST ── */}
      <section className="sp" style={{ padding: "96px 24px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="trust-grid" style={{ maxWidth: 900, margin: "0 auto", display: "grid", alignItems: "center" }}>
          <div>
            <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "var(--green)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>Safe to help</p>
            <h2 style={{ fontSize: "clamp(26px,4vw,44px)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 18, lineHeight: 1.1 }}>
              You're protected.<br />Always anonymous.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.42)", fontSize: 15, lineHeight: 1.75, marginBottom: 28 }}>
              QuickAlert AI verifies the <em>event</em>, not the person. Report freely — your identity is never exposed and you're legally shielded from blame, anywhere in the world.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "No forced account creation",
                "Anonymous mode on by default",
                "AI trust score grows privately over time",
                "Fake reporters auto-flagged and removed",
              ].map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "rgba(255,255,255,0.65)" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(82,183,136,0.15)", border: "1px solid rgba(82,183,136,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg viewBox="0 0 12 12" fill="none" width="10" height="10"><path d="M2 6l3 3 5-5" stroke="#52B788" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Trust card */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 18, borderBottom: "1px solid rgba(255,255,255,0.06)", flexWrap: "wrap" }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(230,57,70,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>👤</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Anonymous Reporter</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Mono',monospace" }}>ID: 0x4F2A · since 2024</div>
              </div>
              <div style={{ background: "rgba(82,183,136,0.12)", border: "1px solid rgba(82,183,136,0.3)", borderRadius: 99, padding: "3px 10px", fontSize: 11, color: "var(--green)", fontFamily: "'DM Mono',monospace" }}>TRUSTED</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>AI Trust Score</span>
              <span style={{ fontFamily: "'DM Mono',monospace", color: "#fff", fontWeight: 600 }}>847 pts</span>
            </div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 99, marginBottom: 20, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "82%", background: "linear-gradient(90deg, var(--green), #7FD8A8)", borderRadius: 99 }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 }}>
              {[{label:"Reports",val:"14"},{label:"Verified",val:"13"},{label:"Accuracy",val:"93%"}].map(s => (
                <div key={s.label} style={{ textAlign: "center", background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "12px 8px" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 3 }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Mono',monospace" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(96,165,250,0.07)", border: "1px solid rgba(96,165,250,0.15)", borderRadius: 10, padding: "10px 12px", display: "flex", gap: 8, alignItems: "flex-start" }}>
              <svg viewBox="0 0 20 20" fill="var(--blue)" width="14" height="14" style={{ flexShrink: 0, marginTop: 1 }}><path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>
              <span style={{ fontSize: 11, color: "rgba(96,165,250,0.8)", lineHeight: 1.5 }}>AI score calculated from verified reports, response time, and accuracy — never publicly linked to identity.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── RESPONDERS ── */}
      <section id="responders" className="sp" style={{ padding: "96px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "var(--amber)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>For responders</p>
            <h2 style={{ fontSize: "clamp(26px,4.5vw,48px)", fontWeight: 700, letterSpacing: "-0.025em" }}>
              Built for the people<br />who show up.
            </h2>
          </div>
          <div className="resp-grid" style={{ display: "grid", gap: 12 }}>
            {[
              { icon: "🏥", title: "Hospitals",      color: "var(--red)",   desc: "Real-time alert feed filtered by AI confidence score. Know what's coming before it arrives." },
              { icon: "🚑", title: "Paramedics",     color: "var(--amber)", desc: "One-tap navigation, confidence score, witness count — everything needed in seconds." },
              { icon: "🛡️", title: "Administrators", color: "var(--blue)",  desc: "Full incident history, AI flagged fakes, and regional analytics across all deployments." },
            ].map(card => (
              <div key={card.title} className="resp-card" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "24px 20px" }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{card.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: card.color }}>{card.title}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.42)", lineHeight: 1.65 }}>{card.desc}</div>
              </div>
            ))}
          </div>
          <div className="resp-cta-inner" style={{ marginTop: 20, background: "rgba(230,57,70,0.06)", border: "1px solid rgba(230,57,70,0.18)", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Are you a verified responder?</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.42)" }}>Create an account and link your hospital credentials to receive AI-routed alerts.</div>
            </div>
            <a href="/profile" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--red)", color: "#fff", fontWeight: 600, fontSize: 14, padding: "10px 22px", borderRadius: 99, boxShadow: "0 0 20px rgba(230,57,70,0.35)", whiteSpace: "nowrap", transition: "all .2s", flexShrink: 0 }}
              onMouseEnter={e => (e.currentTarget.style.background = "#cc2834")}
              onMouseLeave={e => (e.currentTarget.style.background = "var(--red)")}>
              Create responder account →
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="sp" style={{ padding: "96px 24px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(230,57,70,0.12)", border: "1px solid rgba(230,57,70,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", position: "relative" }}>
            <svg viewBox="0 0 20 20" fill="var(--red)" width="28" height="28"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg>
            <div style={{ position: "absolute", width: 8, height: 8, borderRadius: "50%", background: "var(--green)", animation: "orbit 3s linear infinite", boxShadow: "0 0 8px var(--green)" }} />
            <div style={{ position: "absolute", width: 5, height: 5, borderRadius: "50%", background: "var(--amber)", animation: "orbit2 2.2s linear infinite", boxShadow: "0 0 6px var(--amber)" }} />
          </div>
          <h2 style={{ fontSize: "clamp(28px,5vw,56px)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.08, marginBottom: 16 }}>
            Every second counts.<br />
            <span style={{ color: "var(--red)" }}>Don't waste them.</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.42)", fontSize: "clamp(14px,2vw,16px)", lineHeight: 1.7, marginBottom: 36 }}>
            Join the AI-powered network of reporters and responders making roads safer — worldwide.
          </p>
          <div className="final-cta-btns" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <a href="/dashboard" className="glow-red-btn" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#fff", fontWeight: 700, fontSize: 15, padding: "14px 30px", borderRadius: 99, textDecoration: "none" }}>
              Open QuickAlert AI
              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd"/></svg>
            </a>
            <a href="/profile" style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "rgba(255,255,255,0.45)", fontSize: 14, fontWeight: 500, transition: "color .2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}>
              Responder sign in →
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "24px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 20 20" fill="white" width="11" height="11"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 3a1 1 0 011 1v3.586l2.707 2.707a1 1 0 11-1.414 1.414l-3-3A1 1 0 019 10V6a1 1 0 011-1z"/></svg>
          </div>
          <span><strong style={{ color: "rgba(255,255,255,0.4)" }}>QuickAlert AI</strong> © 2025</span>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {["Privacy","Terms","Contact"].map(l => (
            <a key={l} href="#" style={{ transition: "color .15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}