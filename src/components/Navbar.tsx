"use client";

import Link from "next/link";
import { useUser } from "@/app/hooks/useUser";

export default function Navbar() {
  const { user, loading } = useUser();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-100">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🕌</span>
          <span className="font-bold text-stone-800 text-lg">
            FindMyAyat
          </span>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          
          {/* My Kit */}
          <Link
            href="/my-kit"
            className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-emerald-600 transition-colors"
          >
            <span>📚</span>
            <span>My Kit</span>
          </Link>

          {/* Auth Section */}
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-3">
                  
                  {/* User Name */}
                  <span className="text-sm text-stone-500 hidden sm:block">
                    {user.name ?? user.username ?? user.email}
                  </span>

                  {/* Logout */}
                  <a
                    href="/api/auth/logout"
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 hover:border-red-200 hover:text-red-500 transition-colors"
                  >
                    Logout
                  </a>
                </div>
              ) : (
                
                /* Login */
                <a
                  href="/api/auth/login"
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
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