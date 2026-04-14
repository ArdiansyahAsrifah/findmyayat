import { getSituationBySlug } from "@/lib/situations";
import { getAyatsBySituation } from "@/lib/quranapi";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import SituationPageClient from "./SituationPageClient";
import ErrorState from "@/components/ErrorState";
import { Suspense } from "react";
import LoadingSkeleton from "@/components/LoadingSkeleton";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function SituationPage({ params }: Props) {
  const { slug } = await params;
  const situation = getSituationBySlug(slug);

  if (!situation) notFound();

  let ayats: any[] = [];
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
          <ErrorState message="Gagal memuat ayat. Periksa koneksi internetmu." />
        ) : (
          <SituationPageClient situation={situation} initialAyats={ayats} />
        )}
      </Suspense>
    </div>
  );
}