export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      {/* Title */}
      <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-48" />

      {/* Level buttons row */}
      <div className="flex gap-2 flex-wrap">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-9 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
        ))}
      </div>

      {/* Vocabulary card list */}
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="p-4 bg-gray-200 dark:bg-gray-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-32" />
              <div className="h-5 w-5 bg-gray-300 dark:bg-gray-700 rounded-full" />
            </div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-48" />
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-64" />
          </div>
        ))}
      </div>
    </div>
  );
}
