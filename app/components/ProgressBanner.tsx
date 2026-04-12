"use client";

import { useProgress } from "@/hooks/useProgress";

function formatLastPracticed(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ProgressBanner() {
  const { progress, hydrated } = useProgress();

  // Don't render during SSR or if no progress yet
  if (!hydrated) return null;

  const hasProgress =
    progress.dictation.total > 0 || progress.pronunciation.totalAttempts > 0;

  if (!hasProgress) return null;

  const dictPct =
    progress.dictation.total > 0
      ? Math.round((progress.dictation.correct / progress.dictation.total) * 100)
      : 0;

  const avgPronunciation = Math.round(progress.pronunciation.avgScore);
  const showStreak = progress.dictation.bestStreak > 3;

  return (
    <section className="max-w-4xl mx-auto px-4 py-4">
      <div className="flex flex-wrap items-center justify-center gap-4 px-6 py-4 bg-white border border-gray-200 rounded-xl shadow-sm">
        {/* Dictation stats */}
        {progress.dictation.total > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-purple-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              <span className="font-semibold text-gray-900">
                {progress.dictation.correct}
              </span>{" "}
              correct dictations ({dictPct}%)
            </span>
            {showStreak && (
              <span
                className="inline-flex items-center gap-0.5 text-orange-500 font-medium"
                title={`Best streak: ${progress.dictation.bestStreak}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2c.5 3.5-1.5 6-1.5 6s2 1.5 2.5 4c.5 2.5-1 4.5-1 4.5s3-1.5 4-4.5c1-3-1-6.5-1-6.5s1.5 1 2 3.5c.5 2.5-.5 5.5-2.5 7.5S10 19 10 19s-1-2 0-4.5 3-4 3-4-2.5-.5-3.5-3S8.5 2 12 2z" />
                </svg>
                {progress.dictation.bestStreak}
              </span>
            )}
          </div>
        )}

        {/* Separator */}
        {progress.dictation.total > 0 &&
          progress.pronunciation.totalAttempts > 0 && (
            <div className="hidden sm:block w-px h-5 bg-gray-200" />
          )}

        {/* Pronunciation stats */}
        {progress.pronunciation.totalAttempts > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-rose-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
            <span>
              <span className="font-semibold text-gray-900">{avgPronunciation}%</span>{" "}
              avg pronunciation
            </span>
          </div>
        )}

        {/* Separator */}
        {(progress.dictation.total > 0 ||
          progress.pronunciation.totalAttempts > 0) &&
          progress.lastPracticed && (
            <div className="hidden sm:block w-px h-5 bg-gray-200" />
          )}

        {/* Last practiced */}
        {progress.lastPracticed && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Last practiced: {formatLastPracticed(progress.lastPracticed)}</span>
          </div>
        )}
      </div>
    </section>
  );
}
