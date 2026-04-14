import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-100">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🕌</span>
          <span className="font-bold text-stone-800 text-lg">FindMyAyat</span>
        </Link>
        <Link
          href="/my-kit"
          className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-emerald-600 transition-colors"
        >
          <span>📚</span>
          <span>My Kit</span>
        </Link>
      </div>
    </nav>
  );
}