import Link from "next/link";

interface Props {
  message?: string;
}

export default function ErrorState({
  message = "Terjadi kesalahan saat memuat ayat",
}: Props) {
  return (
    <div className="text-center py-20 px-4">
      <p className="text-5xl mb-4">😔</p>
      <p className="text-stone-600 font-medium mb-2">{message}</p>
      <p className="text-stone-400 text-sm mb-6">
        Refresh
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors"
      >
        <span>←</span>
        <span>Back to Home</span>
      </Link>
    </div>
  );
}