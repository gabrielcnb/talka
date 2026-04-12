import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-16 text-center">
      {/* Speech bubble SVG illustration */}
      <div className="mb-6 relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="url(#gradient404)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-80"
        >
          <defs>
            <linearGradient id="gradient404" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <line x1="9" y1="10" x2="9" y2="10" strokeWidth="3" />
          <line x1="15" y1="10" x2="15" y2="10" strokeWidth="3" />
          <path d="M9.5 13.5c.5.5 1.5 1 2.5 1s2-.5 2.5-1" />
        </svg>
      </div>

      {/* 404 heading */}
      <h1 className="text-8xl sm:text-9xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-4 select-none">
        404
      </h1>

      {/* Subtitle */}
      <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
        Page not found
      </h2>

      {/* Friendly message */}
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-10 text-lg">
        Looks like this page went on vacation. Let&apos;s get you back to learning!
      </p>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
        >
          Go Home
        </Link>
        <Link
          href="/pronunciation"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-950/80 transition-all duration-200 hover:-translate-y-0.5"
        >
          Start Practicing
        </Link>
      </div>
    </div>
  );
}
