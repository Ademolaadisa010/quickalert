"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { INCIDENTS } from "@/lib/data";

const activeAlerts = INCIDENTS.filter((i) => i.status === "active").length;

const TABS = [
  {
    href: "/dashboard",
    label: "Home",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
        <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/map",
    label: "Map",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
        <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
      </svg>
    ),
  },
  // index 2 = Report (centre pill, rendered separately)
  {
    href: "/responder",
    label: "Alerts",
    badge: activeAlerts,
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
        <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.569 1.175A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const path = usePathname();

  return (
    <nav className="bottom-nav">
      {/* Left 2 tabs */}
      {TABS.slice(0, 2).map((t) => (
        <Link key={t.href} href={t.href} className={`nav-tab${path === t.href ? " active" : ""}`}>
          <span className="nav-tab-icon">{t.icon}</span>
          <span className="nav-tab-label">{t.label}</span>
        </Link>
      ))}

      {/* Centre — Report pill */}
      <Link href="/report" className="nav-report-wrap">
        <div className="nav-report-btn">
          <svg viewBox="0 0 20 20" fill="white" width="22" height="22">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="nav-report-label">Report</span>
      </Link>

      {/* Right 2 tabs */}
      {TABS.slice(2).map((t) => (
        <Link key={t.href} href={t.href} className={`nav-tab${path === t.href ? " active" : ""}`}>
          <span className="nav-tab-icon">{t.icon}</span>
          <span className="nav-tab-label">{t.label}</span>
          {t.badge && t.badge > 0 && (
            <span className="nav-badge">{t.badge}</span>
          )}
        </Link>
      ))}
    </nav>
  );
}

/* ─────────────────────────────────────────
   DESKTOP SIDEBAR  (hidden on mobile via CSS)
───────────────────────────────────────── */
export function DesktopSidebar() {
  const path = usePathname();

  const items = [
    { href: "/dashboard", label: "Dashboard",        icon: TABS[0].icon },
    {
      href: "/report", label: "Report Emergency",
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      ),
    },
    { href: "/map",       label: "Live Map",          icon: TABS[1].icon },
    { href: "/responder", label: "Responder View",    icon: TABS[2].icon, badge: activeAlerts },
    { href: "/profile",   label: "My Profile",        icon: TABS[3].icon },
  ];

  return (
    <aside className="desktop-sidebar">
      {/* Logo */}
      <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 8px 18px", borderBottom: "1px solid var(--border)", marginBottom: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg viewBox="0 0 20 20" fill="white" width="14" height="14">
            <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 3a1 1 0 011 1v3.586l2.707 2.707a1 1 0 11-1.414 1.414l-3-3A1 1 0 019 10V6a1 1 0 011-1z" />
          </svg>
        </div>
        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>QuickAlert</span>
      </Link>

      {/* Nav items */}
      {items.map((item) => (
        <Link key={item.href} href={item.href}
          className={`sidebar-item${path === item.href ? " active" : ""}`}>
          <span style={{ flexShrink: 0, opacity: path === item.href ? 1 : 0.65 }}>{item.icon}</span>
          {item.label}
          {item.badge && item.badge > 0 && (
            <span style={{ marginLeft: "auto", background: "var(--red)", color: "#fff", fontSize: 10, fontFamily: "'DM Mono',monospace", padding: "1px 7px", borderRadius: 99 }}>
              {item.badge}
            </span>
          )}
        </Link>
      ))}

      {/* User chip */}
      <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--red-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>👤</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Anonymous</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>Trusted · 847 pts</div>
          </div>
          <span className="badge badge-green" style={{ marginLeft: "auto" }}>On</span>
        </div>
      </div>
    </aside>
  );
}