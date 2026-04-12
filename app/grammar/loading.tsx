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

      {/* Exercise card skeleton */}
      <div className="p-6 bg-gray-200 dark:bg-gray-800 rounded-xl space-y-4">
        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-24" />
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-full" />
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
        {/* Options */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-300 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
        {/* Button */}
        <div className="h-11 bg-gray-300 dark:bg-gray-700 rounded-lg w-full mt-4" />
      </div>
    </div>
  );
}
