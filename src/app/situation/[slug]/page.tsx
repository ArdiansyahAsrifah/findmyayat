import { getSituationBySlug, situations } from "@/lib/situations";
import { getAyatsBySituation } from "@/lib/quranapi";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import SituationPageClient from "./SituationPageClient";
import ErrorState from "@/components/ErrorState";
import { Suspense } from "react";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { Ayat } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return situations.map((s) => ({ slug: s.slug }));
}

export default async function SituationPage({ params }: Props) {
  const { slug } = await params;
  const situation = getSituationBySlug(slug);
  if (!situation) notFound();

  let ayats: Ayat[] = [];
  let hasError = false;

  try {
    ayats = await getAyatsBySituation(situation.searchQuery, 5);
  } catch {
    hasError = true;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <Suspense fallback={<LoadingSkeleton />}>
        {hasError ? (
          <ErrorState message="Failed to load verses. Please check your internet connection." />
        ) : (
          <SituationPageClient situation={situation} initialAyats={ayats} />
        )}
      </Suspense>
    </div>
  );
}