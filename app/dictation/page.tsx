"use client";

import { useState, useCallback } from "react";
import { sentences } from "@/data/sentences";
import { useTTS } from "@/hooks/useTTS";
import { useTranslation } from "@/app/i18n/useTranslation";

const levels = ["A1", "A2", "B1", "B2", "C1"] as const;
const voices = ["eve", "ara", "rex", "sal", "leo"] as const;

export default function DictationPage() {
  const { t } = useTranslation();
  const [selectedLevel, setSelectedLevel] = useState<string>("A1");
  const [selectedVoice, setSelectedVoice] = useState<string>("rex");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const { speak, stop, isPlaying, isLoading } = useTTS();

  const filtered = sentences.filter((s) => s.level === selectedLevel);
  const current = filtered[currentIndex];

  const playSentence = useCallback(() => {
    if (!current) return;
    setHasPlayed(true);
    speak(current.text, selectedVoice);
  }, [current, selectedVoice, speak]);

  const checkAnswer = useCallback(() => {
    if (!current) return;
    stop();
    setShowResult(true);
    const isCorrect =
      userInput.trim().toLowerCase() === current.text.toLowerCase();
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  }, [current, userInput, stop]);

  const nextSentence = useCallback(() => {
    stop();
    setShowResult(false);
    setUserInput("");
    setHasPlayed(false);
    setCurrentIndex((prev) => (prev + 1) % filtered.length);
  }, [filtered.length, stop]);

  const changeLevel = (level: string) => {
    stop();
    setSelectedLevel(level);
    setCurrentIndex(0);
    setUserInput("");
    setShowResult(false);
    setHasPlayed(false);
    setScore({ correct: 0, total: 0 });
  };

  if (!current) return <p>No sentences available.</p>;

  const isCorrect =
    userInput.trim().toLowerCase() === current.text.toLowerCase();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">{t("dictation_title")}</h1>
      <p className="text-gray-600">
        {t("dictation_desc")}
      </p>

      <div className="flex gap-2 flex-wrap">
        {levels.map((level) => (
          <button
            key={level}
            onClick={() => changeLevel(level)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedLevel === level
                ? "bg-purple-600 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label htmlFor="voice-select" className="text-sm font-medium text-gray-700">
            {t("dictation_voice")}:
          </label>
          <select
            id="voice-select"
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {voices.map((voice) => (
              <option key={voice} value={voice}>
                {voice.charAt(0).toUpperCase() + voice.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <span className="text-xs text-gray-400">Speed: Normal (1x)</span>
      </div>

      {score.total > 0 && (
        <p className="text-sm text-gray-500">
          {t("dictation_score")}: {score.correct}/{score.total}
        </p>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <p className="text-sm text-gray-500">
          Sentence {currentIndex + 1} of {filtered.length}
        </p>

        {!showResult && (
          <button
            onClick={playSentence}
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-medium text-lg transition-colors ${
              isPlaying
                ? "bg-purple-100 border-2 border-purple-400 text-purple-700"
                : "bg-purple-600 text-white hover:bg-purple-700"
            } disabled:opacity-50`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading...
              </>
            ) : isPlaying ? (
              <>
                <svg className="h-6 w-6 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
                {t("dictation_playing")}
              </>
            ) : (
              <>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                {hasPlayed ? t("dictation_play_again") : t("dictation_play")}
              </>
            )}
          </button>
        )}

        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={hasPlayed ? "Type what you heard..." : "Click Play to listen first..."}
          className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          rows={3}
          disabled={showResult}
        />

        {!showResult ? (
          <button
            onClick={checkAnswer}
            disabled={!userInput.trim()}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {t("dictation_check")}
          </button>
        ) : (
          <div className="space-y-3">
            <div
              className={`p-3 rounded-lg ${
                isCorrect
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              <p className="font-medium">
                {isCorrect ? t("dictation_correct") : t("dictation_wrong")}
              </p>
              {!isCorrect && (
                <p className="mt-1 text-sm">
                  {t("dictation_correct_answer")}: <strong>{current.text}</strong>
                </p>
              )}
            </div>
            <button
              onClick={nextSentence}
              className="px-6 py-2 bg-accent-600 text-white rounded-lg font-medium hover:bg-accent-700 transition-colors"
            >
              {t("dictation_next")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
