"use client";

import { useEffect, useState } from "react";

type FeedbackType = "correct" | "wrong" | "great";

interface FeedbackAnimationProps {
  show: boolean;
  type: FeedbackType;
  xpGained?: number;
}

const config: Record<FeedbackType, { xp: number }> = {
  correct: { xp: 10 },
  wrong: { xp: 2 },
  great: { xp: 15 },
};

export default function FeedbackAnimation({
  show,
  type,
  xpGained,
}: FeedbackAnimationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!visible) return null;

  const xp = xpGained ?? config[type].xp;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
      {/* Backdrop pulse */}
      <div
        className={`absolute inset-0 rounded-lg animate-feedback-backdrop ${
          type === "correct"
            ? "bg-green-500/10"
            : type === "great"
            ? "bg-amber-500/10"
            : "bg-red-500/10"
        }`}
      />

      {/* Icon */}
      <div className="flex flex-col items-center gap-2">
        {type === "correct" && (
          <div className="animate-feedback-scale">
            <svg
              className="w-20 h-20 text-green-500 drop-shadow-lg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}

        {type === "wrong" && (
          <div className="animate-feedback-shake">
            <svg
              className="w-20 h-20 text-red-500 drop-shadow-lg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        )}

        {type === "great" && (
          <div className="animate-feedback-scale">
            {/* Star burst */}
            <div className="relative">
              <svg
                className="w-20 h-20 text-amber-400 drop-shadow-lg"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {/* Burst particles */}
              <div className="absolute inset-0 animate-feedback-burst">
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                  <div
                    key={deg}
                    className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full bg-amber-400"
                    style={{
                      transform: `rotate(${deg}deg) translateY(-40px)`,
                      opacity: 0.8,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* XP floating text */}
        <div className="animate-feedback-float-up">
          <span
            className={`text-lg font-bold drop-shadow-md ${
              type === "correct"
                ? "text-green-500"
                : type === "great"
                ? "text-amber-500"
                : "text-red-500"
            }`}
          >
            +{xp} XP
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes feedback-scale {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          40% {
            transform: scale(1.3);
            opacity: 1;
          }
          60% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }

        @keyframes feedback-shake {
          0% {
            transform: translateX(0) scale(0);
            opacity: 0;
          }
          20% {
            transform: translateX(0) scale(1.1);
            opacity: 1;
          }
          30% {
            transform: translateX(-8px) scale(1);
          }
          40% {
            transform: translateX(8px) scale(1);
          }
          50% {
            transform: translateX(-6px) scale(1);
          }
          60% {
            transform: translateX(6px) scale(1);
          }
          70% {
            transform: translateX(-3px) scale(1);
          }
          80% {
            transform: translateX(3px) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateX(0) scale(1);
            opacity: 0;
          }
        }

        @keyframes feedback-float-up {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: translateY(-30px);
            opacity: 0;
          }
        }

        @keyframes feedback-backdrop {
          0% {
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes feedback-burst {
          0% {
            transform: scale(0.5);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        :global(.animate-feedback-scale) {
          animation: feedback-scale 1.5s ease-out forwards;
        }
        :global(.animate-feedback-shake) {
          animation: feedback-shake 1.5s ease-out forwards;
        }
        :global(.animate-feedback-float-up) {
          animation: feedback-float-up 1.5s ease-out forwards;
        }
        :global(.animate-feedback-backdrop) {
          animation: feedback-backdrop 1.5s ease-out forwards;
        }
        :global(.animate-feedback-burst) {
          animation: feedback-burst 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
