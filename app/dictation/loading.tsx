export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      {/* Title */}
      <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-36" />

      {/* Level buttons row */}
      <div className="flex gap-2 flex-wrap">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-9 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
        ))}
      </div>

      {/* Main dictation card */}
      <div className="p-6 bg-gray-200 dark:bg-gray-800 rounded-xl space-y-4">
        {/* Play button area */}
        <div className="flex justify-center py-4">
          <div className="h-16 w-16 bg-gray-300 dark:bg-gray-700 rounded-full" />
        </div>
        {/* Input area */}
        <div className="h-24 bg-gray-300 dark:bg-gray-700 rounded-lg" />
        {/* Submit button */}
        <div className="h-11 bg-gray-300 dark:bg-gray-700 rounded-lg w-full" />
      </div>
    </div>
  );
}
