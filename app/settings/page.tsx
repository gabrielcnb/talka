"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  useNativeLanguage,
  getLanguageByCode,
  LANGUAGES,
} from "@/app/components/LanguageSelector";
import { useXP } from "@/hooks/useXP";
import { useStreak } from "@/hooks/useStreak";
import { useTranslation } from "@/app/i18n/useTranslation";

type ConfirmingButton =
  | "xp"
  | "progress"
  | "streak"
  | "flashcards"
  | "all"
  | null;

const STORAGE_KEYS = {
  xp: "voxify_xp",
  progress: "voxify_progress",
  streak: "voxify_streak",
  flashcards: "voxify_flashcards",
  theme: "voxify_theme",
  lang: "fluency_native_lang",
} as const;

export default function SettingsPage() {
  const { t } = useTranslation();
  const { language, setLanguage, hydrated } = useNativeLanguage();
  const { level, totalXP, xpProgress, levelName } = useXP();
  const { currentStreak } = useStreak();
  const [confirming, setConfirming] = useState<ConfirmingButton>(null);
  const [changingLang, setChangingLang] = useState(false);
  const [resetDone, setResetDone] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const shareText = `I'm Level ${level} (${levelName}) on Talka! ${totalXP} XP earned, ${currentStreak} day streak. Practice English with AI at https://talka.vercel.app`;

  const handleShare = useCallback(async () => {
    if (canShare) {
      try {
        await navigator.share({ text: shareText });
      } catch {
        // User cancelled or share failed silently
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [canShare, shareText]);

  const currentLang = language ? getLanguageByCode(language) : null;

  const showResetDone = useCallback((label: string) => {
    setResetDone(label);
    setTimeout(() => setResetDone(null), 2000);
  }, []);

  const handleReset = useCallback(
    (key: ConfirmingButton) => {
      if (confirming !== key) {
        setConfirming(key);
        return;
      }

      // Confirmed - execute reset
      if (key === "all") {
        Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
        showResetDone("All data");
      } else if (key === "xp") {
        localStorage.removeItem(STORAGE_KEYS.xp);
        showResetDone("XP & Level");
      } else if (key === "progress") {
        localStorage.removeItem(STORAGE_KEYS.progress);
        showResetDone("Practice Progress");
      } else if (key === "streak") {
        localStorage.removeItem(STORAGE_KEYS.streak);
        showResetDone("Streak");
      } else if (key === "flashcards") {
        localStorage.removeItem(STORAGE_KEYS.flashcards);
        showResetDone("Flashcard Progress");
      }

      setConfirming(null);
      // Reload to reflect changes
      setTimeout(() => window.location.reload(), 800);
    },
    [confirming, showResetDone]
  );

  const handleLanguageChange = useCallback(
    (code: string) => {
      setLanguage(code);
      setChangingLang(false);
      window.location.reload();
    },
    [setLanguage]
  );

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Back to home"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-600 dark:text-gray-400"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t("settings") || "Settings"}
        </h1>
      </div>

      {/* Reset done toast */}
      {resetDone && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-fadeIn">
          {resetDone} reset successfully
        </div>
      )}

      {/* Profile Section */}
      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Profile
          </h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {/* Native Language */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Native Language
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {currentLang
                    ? `${currentLang.flag} ${currentLang.name}`
                    : "Not set"}
                </p>
              </div>
              <button
                onClick={() => setChangingLang(!changingLang)}
                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                {changingLang ? "Cancel" : "Change"}
              </button>
            </div>

            {/* Language picker */}
            {changingLang && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                      language === lang.code
                        ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300"
                        : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="truncate">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* XP & Level */}
          <div className="px-5 py-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Level & XP
            </p>
            <div className="mt-2 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{
                  background:
                    level <= 3
                      ? "linear-gradient(135deg, #6366f1, #818cf8)"
                      : level <= 6
                        ? "linear-gradient(135deg, #8b5cf6, #a78bfa)"
                        : "linear-gradient(135deg, #f59e0b, #fbbf24)",
                }}
              >
                {level}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {levelName}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${xpProgress}%`,
                        background:
                          "linear-gradient(90deg, #6366f1, #818cf8, #a78bfa)",
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {totalXP} XP
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Share Your Progress Section */}
      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-indigo-500"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Share Your Progress
            </h2>
          </div>
        </div>
        <div className="p-5 space-y-4">
          {/* Preview card */}
          <div className="relative rounded-lg border border-indigo-200 dark:border-indigo-800/50 bg-indigo-50/50 dark:bg-indigo-950/20 p-4">
            <div className="absolute top-3 left-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-indigo-300 dark:text-indigo-700"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed pl-5">
              {shareText}
            </p>
          </div>

          {/* Share / Copy button */}
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm text-white transition-all bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]"
          >
            {copied ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </>
            ) : canShare ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                Share
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy to clipboard
              </>
            )}
          </button>
        </div>
      </section>

      {/* Data Management Section */}
      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Data Management
          </h2>
        </div>
        <div className="p-5 space-y-3">
          <ResetButton
            label="Reset XP & Level"
            description="Clears all XP and resets to Level 1"
            isConfirming={confirming === "xp"}
            onClick={() => handleReset("xp")}
            onCancel={() => setConfirming(null)}
          />
          <ResetButton
            label="Reset Practice Progress"
            description="Clears progress for all practice modules"
            isConfirming={confirming === "progress"}
            onClick={() => handleReset("progress")}
            onCancel={() => setConfirming(null)}
          />
          <ResetButton
            label="Reset Streak"
            description="Resets your daily streak counter"
            isConfirming={confirming === "streak"}
            onClick={() => handleReset("streak")}
            onCancel={() => setConfirming(null)}
          />
          <ResetButton
            label="Reset Flashcard Progress"
            description="Clears all flashcard review data"
            isConfirming={confirming === "flashcards"}
            onClick={() => handleReset("flashcards")}
            onCancel={() => setConfirming(null)}
          />

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <ResetButton
              label="Reset All Data"
              description="Deletes everything: XP, progress, streak, flashcards, language, and theme"
              isConfirming={confirming === "all"}
              onClick={() => handleReset("all")}
              onCancel={() => setConfirming(null)}
              destructive
            />
          </div>
        </div>
      </section>

      {/* App Info Section */}
      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            About
          </h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          <div className="px-5 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Version
            </span>
            <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
              1.0.0
            </span>
          </div>
          <div className="px-5 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Built with
            </span>
            <span className="text-sm text-gray-900 dark:text-gray-100">
              Made with AI
            </span>
          </div>
          <div className="px-5 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Source
            </span>
            <a
              href="https://github.com/gabrielcnb/english-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center gap-1"
            >
              GitHub
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

/* ─── Reset Button Component ─── */

function ResetButton({
  label,
  description,
  isConfirming,
  onClick,
  onCancel,
  destructive = false,
}: {
  label: string;
  description: string;
  isConfirming: boolean;
  onClick: () => void;
  onCancel: () => void;
  destructive?: boolean;
}) {
  const baseStyles = destructive
    ? "border-red-200 dark:border-red-900/50 hover:border-red-300 dark:hover:border-red-800"
    : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700";

  const confirmStyles = destructive
    ? "border-red-400 dark:border-red-700 bg-red-50 dark:bg-red-950/30"
    : "border-orange-400 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/30";

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
        isConfirming ? confirmStyles : baseStyles
      }`}
    >
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            destructive
              ? "text-red-700 dark:text-red-400"
              : "text-gray-800 dark:text-gray-200"
          }`}
        >
          {label}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
          {description}
        </p>
      </div>

      <div className="flex items-center gap-2 ml-3">
        {isConfirming && (
          <button
            onClick={onCancel}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={onClick}
          className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all ${
            isConfirming
              ? destructive
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-orange-500 hover:bg-orange-600 text-white"
              : destructive
                ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          {isConfirming ? "Are you sure?" : "Reset"}
        </button>
      </div>
    </div>
  );
}
