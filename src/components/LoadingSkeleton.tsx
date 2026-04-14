export default function LoadingSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-20">
      {/* Back button skeleton */}
      <div className="h-4 w-16 bg-stone-200 rounded animate-pulse mb-6" />

      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-12 w-12 bg-stone-200 rounded-2xl animate-pulse mb-3" />
        <div className="h-7 w-48 bg-stone-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-stone-200 rounded animate-pulse" />
      </div>

      {/* Cards skeleton */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-stone-100 overflow-hidden mb-4"
        >
          {/* Badge */}
          <div className="bg-stone-50 px-5 py-3">
            <div className="h-3 w-32 bg-stone-200 rounded animate-pulse" />
          </div>

          <div className="p-5">
            {/* Arabic text */}
            <div className="space-y-2 mb-4">
              <div className="h-6 w-full bg-stone-200 rounded animate-pulse" />
              <div className="h-6 w-3/4 bg-stone-200 rounded animate-pulse ml-auto" />
            </div>

            {/* Translation */}
            <div className="space-y-2 mb-4">
              <div className="h-3 w-full bg-stone-100 rounded animate-pulse" />
              <div className="h-3 w-5/6 bg-stone-100 rounded animate-pulse" />
              <div className="h-3 w-4/6 bg-stone-100 rounded animate-pulse" />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-3 border-t border-stone-100">
              <div className="h-8 w-28 bg-stone-100 rounded-xl animate-pulse" />
              <div className="h-8 w-24 bg-stone-100 rounded-xl animate-pulse" />
              <div className="h-8 w-16 bg-stone-100 rounded-xl animate-pulse ml-auto" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}