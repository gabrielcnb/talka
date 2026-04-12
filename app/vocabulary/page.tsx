"use client";

import { useState, useCallback } from "react";
import { vocabulary } from "@/data/vocabulary";
import { useTTS } from "@/hooks/useTTS";
import { useTranslation } from "@/app/i18n/useTranslation";

const levels = ["All", "A1", "A2", "B1", "B2", "C1"] as const;

function SpeakerIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className || "w-4 h-4"}
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={`animate-spin ${className || "w-4 h-4"}`}
    >
      <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
      <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity={1} />
    </svg>
  );
}

type PlayingItem = { id: number; type: "word" | "example" } | null;

function ListenButton({
  text,
  itemId,
  itemType,
  activeItem,
  isPlaying,
  isLoading,
  onPlay,
}: {
  text: string;
  itemId: number;
  itemType: "word" | "example";
  activeItem: PlayingItem;
  isPlaying: boolean;
  isLoading: boolean;
  onPlay: (id: number, type: "word" | "example", text: string) => void;
}) {
  const { t } = useTranslation();
  const isActive =
    activeItem?.id === itemId && activeItem?.type === itemType;

  const isThisPlaying = isActive && isPlaying;
  const isThisLoading = isActive && isLoading;

  return (
    <button
      type="button"
      onClick={() => onPlay(itemId, itemType, text)}
      className={`inline-flex items-center justify-center rounded-full p-1 transition-colors ${
        isThisPlaying
          ? "text-primary-600 bg-primary-50"
          : isThisLoading
          ? "text-amber-500 bg-amber-50"
          : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
      }`}
      title={t("btn_listen")}
    >
      {isThisLoading ? (
        <SpinnerIcon className="w-4 h-4" />
      ) : (
        <SpeakerIcon className="w-4 h-4" />
      )}
    </button>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className || "w-4 h-4"}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export default function VocabularyPage() {
  const { t, lang } = useTranslation();
  const [selectedLevel, setSelectedLevel] = useState<string>("All");
  const [activeItem, setActiveItem] = useState<PlayingItem>(null);
  const { speak, stop, isPlaying, isLoading } = useTTS();
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [translating, setTranslating] = useState<Record<string, boolean>>({});

  const handleTranslate = async (
    id: string,
    text: string,
    context: "definition" | "example"
  ) => {
    if (translations[id]) {
      setTranslations((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }
    setTranslating((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang: lang, context }),
      });
      const data = await res.json();
      setTranslations((prev) => ({ ...prev, [id]: data.translation }));
    } catch {
      // silently fail
    } finally {
      setTranslating((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const filtered =
    selectedLevel === "All"
      ? vocabulary
      : vocabulary.filter((w) => w.level === selectedLevel);

  const handlePlay = useCallback(
    (id: number, type: "word" | "example", text: string) => {
      if (activeItem?.id === id && activeItem?.type === type) {
        stop();
        setActiveItem(null);
        return;
      }
      stop();
      setActiveItem({ id, type });
      speak(text).finally(() => {
        setActiveItem((prev) =>
          prev?.id === id && prev?.type === type ? null : prev
        );
      });
    },
    [activeItem, speak, stop]
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("vocab_title")}</h1>

      <div className="flex gap-2 flex-wrap">
        {levels.map((level) => (
          <button
            key={level}
            onClick={() => setSelectedLevel(level)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedLevel === level
                ? "bg-primary-600 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {level === "All" ? t("level_all") : level}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500">{filtered.length} {t("vocab_words")}</p>

      <div className="grid gap-4">
        {filtered.map((word) => (
          <div
            key={word.id}
            className="bg-white rounded-lg border border-gray-200 p-4 space-y-2"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold text-gray-900">
                {word.word}
              </span>
              <ListenButton
                text={word.word}
                itemId={word.id}
                itemType="word"
                activeItem={activeItem}
                isPlaying={isPlaying}
                isLoading={isLoading}
                onPlay={handlePlay}
              />
              <span className="text-sm text-gray-500">{word.phonetic}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
                {word.partOfSpeech}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 ml-auto">
                {word.level}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-gray-700">{word.definition}</p>
                {lang !== "en" && (
                  <button
                    type="button"
                    onClick={() =>
                      handleTranslate(
                        `def-${word.id}`,
                        word.definition,
                        "definition"
                      )
                    }
                    className={`inline-flex items-center justify-center rounded-full p-1 transition-colors shrink-0 ${
                      translations[`def-${word.id}`]
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    }`}
                    title={t("btn_translate") || "Translate"}
                  >
                    {translating[`def-${word.id}`] ? (
                      <SpinnerIcon className="w-4 h-4" />
                    ) : (
                      <GlobeIcon className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
              {translations[`def-${word.id}`] && (
                <p className="text-sm text-indigo-700 bg-indigo-50 rounded px-2 py-1">
                  {translations[`def-${word.id}`]}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500 italic">
                  &quot;{word.example}&quot;
                </p>
                <ListenButton
                  text={word.example}
                  itemId={word.id}
                  itemType="example"
                  activeItem={activeItem}
                  isPlaying={isPlaying}
                  isLoading={isLoading}
                  onPlay={handlePlay}
                />
                {lang !== "en" && (
                  <button
                    type="button"
                    onClick={() =>
                      handleTranslate(
                        `ex-${word.id}`,
                        word.example,
                        "example"
                      )
                    }
                    className={`inline-flex items-center justify-center rounded-full p-1 transition-colors shrink-0 ${
                      translations[`ex-${word.id}`]
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    }`}
                    title={t("btn_translate") || "Translate"}
                  >
                    {translating[`ex-${word.id}`] ? (
                      <SpinnerIcon className="w-4 h-4" />
                    ) : (
                      <GlobeIcon className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
              {translations[`ex-${word.id}`] && (
                <p className="text-sm text-indigo-700 bg-indigo-50 rounded px-2 py-1">
                  {translations[`ex-${word.id}`]}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
