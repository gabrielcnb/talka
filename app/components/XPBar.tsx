"use client";

import { useXP } from "@/hooks/useXP";
import { useEffect, useState } from "react";

export default function XPBar() {
  const { level, xpProgress, totalXP, xpToNext, levelName } = useXP();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    function handleXPGain() {
      setPulse(true);
      const timeout = setTimeout(() => setPulse(false), 600);
      return () => clearTimeout(timeout);
    }

    window.addEventListener("voxify_xp_gain", handleXPGain);
    return () => window.removeEventListener("voxify_xp_gain", handleXPGain);
  }, []);

  return (
    <div className="bg-indigo-900/40 dark:bg-indigo-950/60 border-b border-indigo-500/20">
      <div className="max-w-5xl mx-auto px-6 py-1.5 flex items-center gap-3">
        {/* Level Badge */}
        <div
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{
            background:
              level <= 3
                ? "linear-gradient(135deg, #6366f1, #818cf8)"
                : level <= 6
                  ? "linear-gradient(135deg, #8b5cf6, #a78bfa)"
                  : "linear-gradient(135deg, #f59e0b, #fbbf24)",
          }}
          title={levelName}
        >
          {level}
        </div>

        {/* Progress bar - hidden on mobile */}
        <div className="hidden sm:flex flex-1 items-center gap-2">
          <div className="flex-1 h-2 bg-indigo-950/50 dark:bg-indigo-950/80 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                pulse ? "animate-xp-pulse" : ""
              }`}
              style={{
                width: `${xpProgress}%`,
                background: "linear-gradient(90deg, #6366f1, #818cf8, #a78bfa)",
              }}
            />
          </div>
          <span className="text-[11px] text-indigo-200/70 dark:text-indigo-300/60 whitespace-nowrap font-medium">
            {totalXP} XP
            {xpToNext > 0 && (
              <span className="text-indigo-300/40 ml-1">
                ({xpToNext} to lvl {level + 1})
              </span>
            )}
          </span>
        </div>

        {/* Mobile: just show XP count next to badge */}
        <span className="sm:hidden text-[11px] text-indigo-200/70 font-medium">
          {totalXP} XP
        </span>
      </div>

      <style jsx>{`
        @keyframes xp-pulse {
          0%,
          100% {
            opacity: 1;
            box-shadow: none;
          }
          50% {
            opacity: 0.8;
            box-shadow: 0 0 12px 2px rgba(129, 140, 248, 0.6);
          }
        }
        .animate-xp-pulse {
          animation: xp-pulse 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
}
