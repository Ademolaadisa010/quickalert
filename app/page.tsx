"use client";

import { useEffect, useRef, useState } from "react";

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [alertActive, setAlertActive] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      let val = 0;
      const interval = setInterval(() => {
        val += 2;
        setConfidence(val);
        if (val >= 87) clearInterval(interval);
      }, 30);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleDemoAlert = () => {
    setAlertActive(true);
    setTimeout(() => setAlertActive(false), 3000);
  };

  const steps = [
    {
      num: "01",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      ),
      title: "One-tap alert",
      desc: "Single button captures live GPS, camera photo, and timestamps. No gallery uploads — live only.",
    },
    {
      num: "02",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.357 2.059l.096.041a.75.75 0 01.295.279l.023.04 1.27 2.13a.75.75 0 01-.186 1.002l-.023.015a2.25 2.25 0 01-2.795-.408L9 14.5" />
        </svg>
      ),
      title: "AI verification",
      desc: "Scene analysis checks image, movement patterns, time & location consistency. Generates confidence score instantly.",
    },
    {
      num: "03",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
      title: "Multi-user confirmation",
      desc: "Nearby witnesses can corroborate. More reports raise the trust score and unlock priority routing.",
    },
    {
      num: "04",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 6.75z" />
        </svg>
      ),
      title: "Smart routing",
      desc: "Alert dispatched to nearest hospital, verified responders. Includes location, media, and confidence level.",
    },
  ];

  const stats = [
    { value: "< 30s", label: "Alert to responder" },
    { value: "87%", label: "Verified accuracy" },
    { value: "0", label: "Forced identities" },
    { value: "24/7", label: "Always on" },
  ];

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white font-['DM_Sans',sans-serif] overflow-x-hidden">
      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');
        
        :root {
          --red: #E63946;
          --red-dim: #9B1D24;
          --amber: #F4A261;
          --green: #52B788;
        }

        .pulse-dot {
          animation: pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite;
        }
        @keyframes pulse-ring {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .5; transform: scale(1.15); }
        }

        .grid-bg {
          background-image: 
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .alert-flash {
          animation: flash 0.3s ease-in-out 3;
        }
        @keyframes flash {
          0%, 100% { background-color: #E63946; }
          50% { background-color: #ff6b6b; }
        }

        .slide-in {
          animation: slideIn 0.5s ease forwards;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .step-card:hover .step-num {
          color: var(--red);
          transition: color 0.2s;
        }

        .conf-bar-fill {
          transition: width 2s cubic-bezier(0.4,0,0.2,1);
        }

        .glow-red {
          box-shadow: 0 0 40px rgba(230,57,70,0.25), 0 0 80px rgba(230,57,70,0.1);
        }

        .noise {
          position: fixed; inset: 0; pointer-events: none; z-index: 999; opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }
      `}</style>

      {/* Noise overlay */}
      <div className="noise" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/5 bg-[#0C0C0C]/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[var(--red)] flex items-center justify-center">
            <svg viewBox="0 0 20 20" className="w-4 h-4 fill-white">
              <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 3a1 1 0 011 1v3.586l2.707 2.707a1 1 0 11-1.414 1.414l-3-3A1 1 0 019 10V6a1 1 0 011-1z"/>
            </svg>
          </div>
          <span className="font-semibold tracking-tight text-white text-[15px]">QuickAlert</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[13px] text-white/50">
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
          <a href="#stats" className="hover:text-white transition-colors">Impact</a>
          <a href="#responders" className="hover:text-white transition-colors">Responders</a>
        </div>
        <a
          href="/dashboard"
          className="text-[13px] bg-white text-black font-medium px-4 py-2 rounded-full hover:bg-white/90 transition-colors"
        >
          Report
        </a>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="grid-bg relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center">
        {/* Red glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(230,57,70,0.12) 0%, transparent 70%)" }}
        />

        {/* Live badge */}
        <div className="inline-flex items-center gap-2 border border-white/10 rounded-full px-3 py-1.5 text-[12px] text-white/60 mb-8 bg-white/5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] pulse-dot inline-block" />
          Active in Ibadan, Lagos, Abuja
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6 max-w-3xl">
          Emergency response,{" "}
          <span className="text-[var(--red)]">verified</span>{" "}
          and fast.
        </h1>

        <p className="text-white/50 text-lg md:text-xl max-w-xl mb-10 font-light leading-relaxed">
          Report accidents in seconds. AI checks every alert before routing it to hospitals and
          responders — no fakes, no delays, no identity required.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 mb-16">
          <button
            onClick={handleDemoAlert}
            className={`flex items-center gap-2.5 font-semibold text-white px-7 py-3.5 rounded-full text-[15px] transition-all glow-red ${
              alertActive ? "alert-flash" : "bg-[var(--red)] hover:bg-[#c1121f]"
            }`}
          >
            <svg viewBox="0 0 20 20" className="w-4 h-4 fill-white">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
            </svg>
            {alertActive ? "Alert sent!" : "Try demo alert"}
          </button>
          <a
            href="/dashboard"
            className="flex items-center gap-2 text-[15px] text-white/60 hover:text-white transition-colors"
          >
            Report Now
            <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd"/>
            </svg>
          </a>
        </div>

        {/* Live alert mockup */}
        {alertActive && (
          <div className="fixed top-20 right-6 z-50 w-72 bg-[#1a1a1a] border border-[var(--red)]/40 rounded-2xl p-4 slide-in shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[var(--red)] rounded-lg flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 20 20" className="w-4 h-4 fill-white">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white">Alert dispatched</p>
                <p className="text-[12px] text-white/50 mt-0.5">Routing to UI Teaching Hospital · ETA 4 min</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--green)] rounded-full w-0 animate-[grow_2.5s_ease_forwards]" style={{animation:'width 2.5s ease forwards', width:'80%'}} />
                  </div>
                  <span className="text-[11px] text-[var(--green)]">High</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confidence widget */}
        <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-5 text-left">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] text-white/40 font-['DM_Mono',monospace] uppercase tracking-widest">AI Confidence</span>
            <span className="text-[12px] font-['DM_Mono',monospace] text-[var(--amber)]">{confidence}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
            <div
              className="h-full rounded-full conf-bar-fill"
              style={{
                width: `${confidence}%`,
                background: confidence > 70 ? "var(--green)" : confidence > 40 ? "var(--amber)" : "var(--red)",
              }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Image", val: "✓ Scene", ok: true },
              { label: "GPS", val: "✓ Locked", ok: true },
              { label: "Witnesses", val: "3 confirmed", ok: true },
            ].map((item) => (
              <div key={item.label} className="bg-white/5 rounded-xl p-2.5 text-center">
                <div className="text-[10px] text-white/30 mb-1">{item.label}</div>
                <div className={`text-[11px] font-medium ${item.ok ? "text-[var(--green)]" : "text-white/50"}`}>{item.val}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="border-y border-white/5 py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-bold text-white mb-1">{s.value}</div>
              <div className="text-[13px] text-white/40">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-[12px] font-['DM_Mono',monospace] text-[var(--red)] uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight max-w-lg">
              Verified in seconds, not minutes.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className="step-card group bg-white/[0.03] hover:bg-white/[0.06] border border-white/8 rounded-2xl p-6 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <span className="step-num font-['DM_Mono',monospace] text-[13px] text-white/20 transition-colors pt-0.5">{step.num}</span>
                  <div>
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="text-[var(--red)]">{step.icon}</div>
                      <h3 className="font-semibold text-[15px]">{step.title}</h3>
                    </div>
                    <p className="text-[14px] text-white/50 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Anonymous + Trust */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[12px] font-['DM_Mono',monospace] text-[var(--green)] uppercase tracking-widest mb-3">Safe to help</p>
            <h2 className="text-4xl font-bold tracking-tight mb-5">
              You're protected.<br />Always anonymous.
            </h2>
            <p className="text-white/50 leading-relaxed mb-6">
              QuickAlert verifies the <em>event</em>, not the person. Report with confidence — your identity is never exposed and you're shielded from legal blame.
            </p>
            <div className="space-y-3">
              {[
                "No forced account creation",
                "Anonymous mode on by default",
                "Trust score earned over time, never revealed",
                "Fake reporters get flagged automatically",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-[14px] text-white/70">
                  <div className="w-5 h-5 rounded-full bg-[var(--green)]/20 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#52B788" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Trust card */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-[var(--red)]/20 flex items-center justify-center text-lg">👤</div>
              <div>
                <div className="text-[14px] font-medium">Anonymous Reporter</div>
                <div className="text-[12px] text-white/40">Member since 2024</div>
              </div>
              <div className="ml-auto bg-[var(--green)]/10 border border-[var(--green)]/30 rounded-full px-3 py-1 text-[12px] text-[var(--green)] font-medium">
                Trusted
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-white/50">Trust score</span>
                <span className="font-['DM_Mono',monospace] text-white">847 pts</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full">
                <div className="h-full w-4/5 bg-[var(--green)] rounded-full" />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2">
                {[
                  { label: "Reports", val: "14" },
                  { label: "Verified", val: "13" },
                  { label: "Accuracy", val: "93%" },
                ].map((s) => (
                  <div key={s.label} className="text-center bg-white/5 rounded-xl py-3">
                    <div className="text-[15px] font-semibold">{s.val}</div>
                    <div className="text-[11px] text-white/40 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Responders */}
      <section id="responders" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto text-center mb-14">
          <p className="text-[12px] font-['DM_Mono',monospace] text-[var(--amber)] uppercase tracking-widest mb-3">For responders</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Built for the people<br />who show up.
          </h2>
        </div>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-4">
          {[
            {
              icon: "🏥",
              title: "Hospitals",
              desc: "Real-time alert feed filtered by confidence. Always know what's coming before it arrives.",
            },
            {
              icon: "🚑",
              title: "Paramedics",
              desc: "Mobile dashboard with one-tap navigation. Confidence score and witness count upfront.",
            },
            {
              icon: "🛡️",
              title: "Administrators",
              desc: "Full incident history, fake-reporter flags, and coverage analytics across regions.",
            },
          ].map((card) => (
            <div key={card.title} className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/8 rounded-2xl p-6 transition-colors text-left">
              <div className="text-2xl mb-3">{card.icon}</div>
              <h3 className="font-semibold text-[15px] mb-2">{card.title}</h3>
              <p className="text-[13px] text-white/50 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
            Every second counts.<br />
            <span className="text-[var(--red)]">Don't waste them.</span>
          </h2>
          <p className="text-white/50 mb-10 text-lg">
            Join the network of reporters and responders making Nigerian roads safer.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2.5 bg-[var(--red)] hover:bg-[#c1121f] text-white font-semibold px-8 py-4 rounded-full text-[15px] transition-colors glow-red"
          >
            Open QuickAlert
            <svg viewBox="0 0 20 20" className="w-4 h-4 fill-white">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd"/>
            </svg>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-white/30">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[var(--red)] flex items-center justify-center">
            <svg viewBox="0 0 20 20" className="w-3 h-3 fill-white">
              <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 3a1 1 0 011 1v3.586l2.707 2.707a1 1 0 11-1.414 1.414l-3-3A1 1 0 019 10V6a1 1 0 011-1z"/>
            </svg>
          </div>
          QuickAlert © 2025
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
}