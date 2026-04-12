"use client";

import { useStreak } from "@/hooks/useStreak";

function getFlameColor(streak: number): string {
  if (streak >= 30) return "text-yellow-500";
  if (streak >= 7) return "text-red-500";
  return "text-orange-500";
}

function getLast7Days(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
}

export default function StreakBadge() {
  const { currentStreak, longestStreak, hasPracticedToday, practiceDays, hydrated } =
    useStreak();

  if (!hydrated) return null;

  const last7 = getLast7Days();
  const practicedSet = new Set(practiceDays);
  const flameColor = getFlameColor(currentStreak);

  return (
      <div className="flex flex-col items-center gap-3 px-5 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
        {/* Streak display */}
        <div className="flex items-center gap-2">
          {currentStreak > 0 ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 ${flameColor}`}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2c.5 3.5-1.5 6-1.5 6s2 1.5 2.5 4c.5 2.5-1 4.5-1 4.5s3-1.5 4-4.5c1-3-1-6.5-1-6.5s1.5 1 2 3.5c.5 2.5-.5 5.5-2.5 7.5S10 19 10 19s-1-2 0-4.5 3-4 3-4-2.5-.5-3.5-3S8.5 2 12 2z" />
              </svg>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {currentStreak} day{currentStreak !== 1 ? " streak" : ""}
              </span>
              {longestStreak > currentStreak && (
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                  (best: {longestStreak})
                </span>
              )}
            </>
          ) : (
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Start your streak today!
            </span>
          )}
        </div>

        {/* 7-day calendar grid */}
        <div className="flex items-center gap-2">
          {last7.map((day) => {
            const practiced = practicedSet.has(day);
            return (
              <div key={day} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                  {getDayLabel(day)}
                </span>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    practiced
                      ? "bg-indigo-500 dark:bg-indigo-400"
                      : "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {practiced && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Today indicator */}
        {hasPracticedToday && (
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
            Practiced today
          </span>
        )}
      </div>
  );
}
