export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] animate-pulse">
      {/* Hero skeleton */}
      <section className="py-10 sm:py-14 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="h-10 sm:h-12 lg:h-14 bg-gray-200 dark:bg-gray-800 rounded-lg w-3/4 mx-auto" />
          <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-lg w-2/3 mx-auto" />
          <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/2 mx-auto" />
          <div className="pt-2 flex justify-center">
            <div className="h-12 w-44 bg-gray-200 dark:bg-gray-800 rounded-full" />
          </div>
          {/* Stats pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <div className="h-8 w-28 bg-gray-200 dark:bg-gray-800 rounded-full" />
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded-full" />
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded-full" />
          </div>
        </div>
      </section>

      {/* Streak + Word of the Day skeleton */}
      <div className="max-w-5xl mx-auto px-4 space-y-4">
        <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl" />
      </div>

      {/* Feature cards grid skeleton */}
      <div className="max-w-5xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
