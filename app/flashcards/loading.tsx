export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      {/* Title */}
      <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-40" />

      {/* Level buttons row */}
      <div className="flex gap-2 flex-wrap">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-9 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
        ))}
      </div>

      {/* Flashcard skeleton */}
      <div className="p-8 bg-gray-200 dark:bg-gray-800 rounded-xl space-y-4 min-h-[280px] flex flex-col items-center justify-center">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-48" />
        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-32" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mt-2" />
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <div className="h-10 w-28 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        <div className="h-10 w-28 bg-gray-200 dark:bg-gray-800 rounded-lg" />
      </div>
    </div>
  );
}
