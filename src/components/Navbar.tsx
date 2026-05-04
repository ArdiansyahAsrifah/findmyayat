"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/app/hooks/useUser";

const NAV_ITEMS = [
  {
    label: "Explore",
    href: "/",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="1" width="5.5" height="5.5" rx="1.5" />
        <rect x="8.5" y="1" width="5.5" height="5.5" rx="1.5" />
        <rect x="1" y="8.5" width="5.5" height="5.5" rx="1.5" />
        <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.5" />
      </svg>
    ),
  },
  {
    label: "My Kit",
    href: "/my-kit",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3.5" width="13" height="10" rx="2" />
        <path d="M4.5 3.5V2.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      </svg>
    ),
  },
];

export default function Navbar() {
  const { user, loading } = useUser();
  const pathname = usePathname();

  return (
    <aside className="layout__sidebar">
      {/* Logo */}
      <Link href="/" className="sidebar__logo">
        <div className="sidebar__logo-icon">☽</div>
        <span className="sidebar__logo-name">FindMyAyat</span>
      </Link>

      {/* Nav */}
      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar__nav-item${isActive ? " sidebar__nav-item--active" : ""}`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar__footer">
        {!loading && (
          <>
            {user ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* User name */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 11,
                    color: "var(--fg-muted)",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--green)",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user.name ?? user.username ?? user.email}
                  </span>
                </div>

                {/* Logout */}
                <a href="/api/auth/logout" className="sidebar__login">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 6H2M5 3l-3 3 3 3M8 1h2a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H8" />
                  </svg>
                  Logout
                </a>
              </div>
            ) : (
              <a href="/api/auth/login" className="sidebar__login">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6h6M7 3l3 3-3 3M4 11H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h2" />
                </svg>
                Login
              </a>
            )}
          </>
        )}

        {/* Copyright */}
        <p className="sidebar__copy">
          © 2025 FindMyAyat<br />
          Verses for the Heart
        </p>
      </div>
    </aside>
  );
}