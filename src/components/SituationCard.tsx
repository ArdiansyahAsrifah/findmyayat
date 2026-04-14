"use client";

import Link from "next/link";
import { Situation } from "@/types";

interface Props {
  situation: Situation;
}

export default function SituationCard({ situation }: Props) {
  // 🔒 Guard clause (prevent undefined slug → 404)
  if (!situation || !situation.slug) {
    console.warn("Invalid situation data:", situation);
    return null;
  }

  return (
    <Link
      href={`/situation/${situation.slug}`}
      className="block h-full"
    >
      <div className="group bg-white rounded-2xl p-5 border border-stone-100 hover:border-emerald-200 hover:shadow-md transition-all duration-200 cursor-pointer h-full">
        {/* Emoji */}
        <div className="text-3xl mb-3">{situation.emoji}</div>

        {/* Title */}
        <h3 className="font-semibold text-stone-800 text-sm mb-1 group-hover:text-emerald-700 transition-colors">
          {situation.title}
        </h3>

        {/* Description */}
        <p className="text-stone-400 text-xs leading-relaxed">
          {situation.description}
        </p>
      </div>
    </Link>
  );
}