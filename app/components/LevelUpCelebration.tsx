"use client";

import { useState, useEffect, useCallback } from "react";

const CONFETTI_COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#eab308", // gold
  "#06b6d4", // cyan
  "#f43f5e", // rose
];

interface LevelUpDetail {
  newLevel: number;
  levelName: string;
}

function generateConfetti(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    left: Math.random() * 100,
    delay: Math.random() * 2,
    size: 6 + Math.random() * 6,
    duration: 2 + Math.random() * 2,
    rotation: Math.random() * 360,
    swayAmount: -30 + Math.random() * 60,
  }));
}

export default function LevelUpCelebration() {
  const [visible, setVisible] = useState(false);
  const [levelInfo, setLevelInfo] = useState<LevelUpDetail | null>(null);
  const [confetti] = useState(() => generateConfetti(40));

  const dismiss = useCallback(() => {
    setVisible(false);
    setLevelInfo(null);
  }, []);

  useEffect(() => {
    function handleLevelUp(e: Event) {
      const detail = (e as CustomEvent<LevelUpDetail>).detail;
      setLevelInfo(detail);
      setVisible(true);
    }

    window.addEventListener("voxify_level_up", handleLevelUp);
    return () => window.removeEventListener("voxify_level_up", handleLevelUp);
  }, []);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(dismiss, 5000);
    return () => clearTimeout(timer);
  }, [visible, dismiss]);

  if (!visible || !levelInfo) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={dismiss}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Confetti particles */}
      {confetti.map((c) => (
        <div
          key={c.id}
          className="absolute rounded-sm pointer-events-none"
          style={{
            left: `${c.left}%`,
            top: "-10%",
            width: c.size,
            height: c.size,
            backgroundColor: c.color,
            transform: `rotate(${c.rotation}deg)`,
            animation: `confettiFall ${c.duration}s ${c.delay}s ease-in forwards`,
            opacity: 0,
          }}
        />
      ))}

      {/* Modal */}
      <div
        className="relative z-10 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center animate-[modalPop_0.4s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Trophy icon */}
        <div className="flex justify-center mb-4">
          <div className="text-5xl animate-[iconBounce_1s_ease-in-out_infinite]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="url(#goldGrad)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          </div>
        </div>

        {/* Level Up text */}
        <h2
          className="text-3xl font-extrabold mb-2"
          style={{
            background: "linear-gradient(135deg, #6366f1, #a855f7, #eab308)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Level Up!
        </h2>

        {/* Level info */}
        <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
          Level {levelInfo.newLevel} - {levelInfo.levelName}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Keep practicing to reach the next level!
        </p>

        {/* Continue button */}
        <button
          onClick={dismiss}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-violet-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          Continue
        </button>
      </div>

      {/* Keyframe styles */}
      <style jsx>{`
        @keyframes confettiFall {
          0% {
            top: -10%;
            opacity: 1;
            transform: rotate(0deg) translateX(0px);
          }
          50% {
            opacity: 1;
          }
          100% {
            top: 110%;
            opacity: 0;
            transform: rotate(720deg) translateX(${Math.random() > 0.5 ? "" : "-"}40px);
          }
        }
        @keyframes modalPop {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes iconBounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </div>
  );
}
