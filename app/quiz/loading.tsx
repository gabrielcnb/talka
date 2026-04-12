export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      {/* Title */}
      <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-24" />

      {/* Level buttons row */}
      <div className="flex gap-2 flex-wrap">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-9 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
        ))}
      </div>

      {/* Quiz card */}
      <div className="p-6 bg-gray-200 dark:bg-gray-800 rounded-xl space-y-4">
        {/* Progress bar */}
        <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded-full w-full" />
        {/* Question */}
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-full" />
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
        {/* Answer options */}
        <div className="space-y-3 pt-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-300 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
