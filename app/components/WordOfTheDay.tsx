"use client";

import { useState, useMemo } from "react";
import { vocabulary } from "@/data/vocabulary";
import { useTTS } from "@/hooks/useTTS";
import { useNativeLanguage } from "./LanguageSelector";

export default function WordOfTheDay() {
  const { speak, isPlaying, isLoading } = useTTS();
  const { language, hydrated } = useNativeLanguage();
  const [translation, setTranslation] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);

  const word = useMemo(() => {
    const now = new Date();
    const index = now.getDate() + now.getMonth() * 31;
    return vocabulary[index % vocabulary.length];
  }, []);

  const handleTranslate = async () => {
    if (translation || translating || !language) return;
    setTranslating(true);
    try {
      const pin = localStorage.getItem("talka_pin") || "";
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-app-pin": pin },
        body: JSON.stringify({
          text: `${word.word} — ${word.definition}`,
          targetLang: language,
          context: word.example,
        }),
      });
      const data = await res.json();
      setTranslation(data.translation ?? data.text ?? null);
    } catch {
      setTranslation("Translation failed");
    } finally {
      setTranslating(false);
    }
  };

  const partOfSpeechColors: Record<string, string> = {
    noun: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
    verb: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
    adjective: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    adverb: "bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300",
  };

  const badgeColor =
    partOfSpeechColors[word.partOfSpeech] ??
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

  const showTranslate = hydrated && language && language !== "en";

  return (
    <section className="max-w-2xl mx-auto px-4 py-4">
      <div className="relative rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 p-[2px]">
        <div className="rounded-[14px] bg-white dark:bg-gray-900 p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-amber-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Word of the Day
            </span>
            <span
              className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor}`}
            >
              {word.partOfSpeech}
            </span>
          </div>

          {/* Word + phonetic */}
          <div className="flex items-baseline gap-3 mb-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              {word.word}
            </h2>
            <span className="text-sm text-gray-400 dark:text-gray-500 font-mono">
              {word.phonetic}
            </span>
          </div>

          {/* Definition */}
          <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base mb-2">
            {word.definition}
          </p>

          {/* Example */}
          <p className="text-gray-500 dark:text-gray-400 text-sm italic mb-4">
            &ldquo;{word.example}&rdquo;
          </p>

          {/* Translation */}
          {translation && (
            <p className="text-indigo-600 dark:text-indigo-400 text-sm mb-4 border-l-2 border-indigo-400 pl-3">
              {translation}
            </p>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-2">
            {/* Listen */}
            <button
              onClick={() => speak(word.word)}
              disabled={isPlaying || isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                </svg>
              )}
              {isPlaying ? "Playing..." : "Listen"}
            </button>

            {/* Translate */}
            {showTranslate && (
              <button
                onClick={handleTranslate}
                disabled={translating || !!translation}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900/50 disabled:opacity-50 transition-colors"
              >
                {translating ? (
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                    />
                  </svg>
                )}
                {translation ? "Translated" : "Translate"}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
