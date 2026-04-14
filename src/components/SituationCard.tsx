import Link from "next/link";
import { Situation } from "@/types";

interface Props {
  situation: Situation;
}

export default function SituationCard({ situation }: Props) {
  return (
    <Link href={`/situation/${situation.slug}`}>
      <div className="group bg-white rounded-2xl p-5 border border-stone-100 hover:border-emerald-200 hover:shadow-md transition-all duration-200 cursor-pointer h-full">
        <div className="text-3xl mb-3">{situation.emoji}</div>
        <h3 className="font-semibold text-stone-800 text-sm mb-1 group-hover:text-emerald-700 transition-colors">
          {situation.title}
        </h3>
        <p className="text-stone-400 text-xs leading-relaxed">
          {situation.description}
        </p>
      </div>
    </Link>
  );
}