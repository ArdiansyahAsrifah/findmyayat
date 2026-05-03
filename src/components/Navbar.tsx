"use client";
import Link from "next/link";
import { useUser } from "@/app/hooks/useUser";

export default function Navbar() {
  const { user, loading } = useUser();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(245, 240, 232, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "0.5px solid #E8E2D6",
      }}
    >
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
            style={{ background: "#1C4F3A", color: "#FFFFFF" }}
          >
            ☽
          </div>
          <div>
            <p className="text-sm font-bold leading-none" style={{ color: "#1A1A1A" }}>
              FindMyAyat
            </p>
            <p className="text-[10px] tracking-widest uppercase" style={{ color: "#6B6B5E" }}>
              Verses for the heart
            </p>
          </div>
        </Link>

        {/* Right */}
        <div className="flex items-center gap-3">

          {/* My Kit */}
          <Link
            href="/my-kit"
            className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "#1A1A1A" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="3" width="12" height="10" rx="2" />
              <path d="M4 3V2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
            </svg>
            <span>My Kit</span>
          </Link>

          {/* Auth */}
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-3">
                  {/* Online dot + name */}
                  <div className="hidden sm:flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "#1C4F3A" }}
                    />
                    <span className="text-sm" style={{ color: "#1A1A1A" }}>
                      {user.name ?? user.username ?? user.email}
                    </span>
                  </div>

                  {/* Logout */}
                  <a
                    href="/api/auth/logout"
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70"
                    style={{
                      border: "0.5px solid #E8E2D6",
                      color: "#6B6B5E",
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M8 6H2M5 3l-3 3 3 3M8 1h2a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H8" />
                    </svg>
                    Logout
                  </a>
                </div>
              ) : (
                <a
                  href="/api/auth/login"
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
                  style={{
                    background: "#1C4F3A",
                    color: "#FFFFFF",
                  }}
                >
                  Login with Quran.com
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}