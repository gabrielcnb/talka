"use client";

import { useState } from "react";
import { sentences } from "@/data/sentences";
import { useTTS } from "@/hooks/useTTS";
import { useTranslation } from "@/app/i18n/useTranslation";

const levels = ["All", "A1", "A2", "B1", "B2", "C1"] as const;

function SpeakerIcon() {
  return (
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
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="animate-spin"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1" />
    </svg>
  );
}

export default function GrammarPage() {
  const { t } = useTranslation();
  const [selectedLevel, setSelectedLevel] = useState<string>("All");
  const [playingSentenceId, setPlayingSentenceId] = useState<number | null>(null);
  const { speak, stop, isPlaying, isLoading } = useTTS();

  const filtered =
    selectedLevel === "All"
      ? sentences
      : sentences.filter((s) => s.level === selectedLevel);

  const handleSpeak = (sentenceId: number, text: string) => {
    if (playingSentenceId === sentenceId && isPlaying) {
      stop();
      setPlayingSentenceId(null);
    } else {
      setPlayingSentenceId(sentenceId);
      speak(text);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("grammar_title")}</h1>

      <div className="flex gap-2 flex-wrap">
        {levels.map((level) => (
          <button
            key={level}
            onClick={() => setSelectedLevel(level)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedLevel === level
                ? "bg-accent-600 text-white"
                : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {level === "All" ? t("level_all") : level}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500">{filtered.length} {t("grammar_sentences")}</p>

      <div className="grid gap-3">
        {filtered.map((sentence) => {
          const isActive = playingSentenceId === sentence.id;
          const showLoading = isActive && isLoading;
          const showPlaying = isActive && isPlaying && !isLoading;

          return (
            <div
              key={sentence.id}
              className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  onClick={() => handleSpeak(sentence.id, sentence.text)}
                  className={`mt-0.5 flex-shrink-0 p-1.5 rounded-full transition-colors ${
                    showLoading
                      ? "text-accent-500"
                      : showPlaying
                        ? "bg-accent-100 text-accent-600"
                        : "text-gray-400 hover:text-accent-600 hover:bg-gray-100"
                  }`}
                  aria-label={t("btn_listen")}
                >
                  {showLoading ? <LoadingSpinner /> : <SpeakerIcon />}
                </button>
                <p className="text-gray-800 dark:text-gray-200">{sentence.text}</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent-100 text-accent-700 whitespace-nowrap">
                {sentence.level}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
