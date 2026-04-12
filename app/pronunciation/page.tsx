"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { sentences } from "@/data/sentences";
import { useTTS } from "@/hooks/useTTS";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useTranslation } from "@/app/i18n/useTranslation";
import FeedbackAnimation from "@/app/components/FeedbackAnimation";

const levels = ["A1", "A2", "B1", "B2", "C1"] as const;
const voices = ["eve", "ara", "rex", "sal", "leo"] as const;

function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function computeSimilarity(
  original: string,
  spoken: string
): { score: number; comparisons: { word: string; correct: boolean }[] } {
  const origWords = normalize(original);
  const spokenWords = normalize(spoken);

  const comparisons = origWords.map((word, i) => ({
    word,
    correct: i < spokenWords.length && spokenWords[i] === word,
  }));

  const correctCount = comparisons.filter((c) => c.correct).length;
  const score = origWords.length > 0 ? Math.round((correctCount / origWords.length) * 100) : 0;

  return { score, comparisons };
}

export default function PronunciationPage() {
  const { t } = useTranslation();
  const [selectedLevel, setSelectedLevel] = useState<string>("A1");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState<string>("rex");
  const [totalScore, setTotalScore] = useState({ points: 0, attempts: 0 });
  const [feedback, setFeedback] = useState<{ show: boolean; type: "correct" | "wrong" | "great" }>({ show: false, type: "correct" });
  const feedbackShownRef = useRef(false);

  const { speak, stop, isPlaying, isLoading } = useTTS();
  const {
    isListening,
    transcript,
    hasFinished,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
  } = useSpeechRecognition();

  const filtered = useMemo(
    () => sentences.filter((s) => s.level === selectedLevel),
    [selectedLevel]
  );
  const current = filtered[currentIndex];

  const result = useMemo(() => {
    if (!hasFinished || !transcript || !current) return null;
    return computeSimilarity(current.text, transcript);
  }, [hasFinished, transcript, current]);

  // Trigger feedback animation when result is available
  useEffect(() => {
    if (hasFinished && !isListening && result && !feedbackShownRef.current) {
      feedbackShownRef.current = true;
      const type: "correct" | "wrong" | "great" =
        result.score >= 80 ? "great" : result.score >= 50 ? "correct" : "wrong";
      setFeedback({ show: true, type });
      setTimeout(() => setFeedback((prev) => ({ ...prev, show: false })), 1600);
    }
    if (!hasFinished) {
      feedbackShownRef.current = false;
    }
  }, [hasFinished, isListening, result]);

  const changeLevel = useCallback(
    (level: string) => {
      stop();
      stopListening();
      resetTranscript();
      setSelectedLevel(level);
      setCurrentIndex(0);
      setTotalScore({ points: 0, attempts: 0 });
    },
    [stop, stopListening, resetTranscript]
  );

  const handleListen = useCallback(() => {
    speak(current.text, selectedVoice);
  }, [speak, current, selectedVoice]);

  const handleRecord = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  }, [isListening, stopListening, startListening, resetTranscript]);

  const handleNext = useCallback(() => {
    if (result) {
      setTotalScore((prev) => ({
        points: prev.points + result.score,
        attempts: prev.attempts + 1,
      }));
    }
    stop();
    stopListening();
    resetTranscript();
    setCurrentIndex((prev) => (prev + 1) % filtered.length);
  }, [result, stop, stopListening, resetTranscript, filtered.length]);

  if (!current) return <p className="text-gray-500">No sentences available for this level.</p>;

  const avgScore =
    totalScore.attempts > 0
      ? Math.round(totalScore.points / totalScore.attempts)
      : null;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">{t("pron_title")}</h1>
      <p className="text-gray-600 dark:text-gray-400">
        {t("pron_desc")}
      </p>

      {/* Level filter */}
      <div className="flex gap-2 flex-wrap">
        {levels.map((level) => (
          <button
            key={level}
            onClick={() => changeLevel(level)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedLevel === level
                ? "bg-amber-500 text-white"
                : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Voice selector + score */}
      <div className="flex items-center gap-4 flex-wrap">
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          {t("pron_voice")}:
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {voices.map((v) => (
              <option key={v} value={v}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </option>
            ))}
          </select>
        </label>

        {avgScore !== null && (
          <p className="text-sm text-gray-500">
            {t("pron_avg_score")}: <span className="font-semibold text-amber-600">{avgScore}%</span>{" "}
            ({totalScore.attempts} attempt{totalScore.attempts !== 1 ? "s" : ""})
          </p>
        )}
      </div>

      {/* Main card */}
      <div className="relative bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 space-y-5">
        <FeedbackAnimation show={feedback.show} type={feedback.type} />
        <p className="text-sm text-gray-500">
          {currentIndex + 1} {t("pron_sentence_of")} {filtered.length}
        </p>

        {/* Sentence display */}
        <p className="text-lg text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
          {current.text}
        </p>

        {/* Listen button */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleListen}
            disabled={isLoading || isPlaying}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 transition-colors"
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 5.586v12.828a1 1 0 01-1.707.707L5.586 15z" />
              </svg>
            )}
            {isLoading ? t("pron_loading") : isPlaying ? t("pron_playing") : t("pron_listen")}
          </button>

          {/* Record button */}
          {isSupported ? (
            <button
              onClick={handleRecord}
              disabled={isPlaying || isLoading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${
                isListening
                  ? "bg-red-500 text-white hover:bg-red-600 animate-pulse"
                  : "bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
              }`}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
              {isListening ? t("pron_stop") : t("pron_record")}
            </button>
          ) : (
            <p className="text-sm text-red-500 self-center">
              {t("pron_not_supported")}
            </p>
          )}
        </div>

        {/* Live transcript while recording */}
        {isListening && transcript && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-700 font-medium mb-1">{t("pron_record")}...</p>
            <p className="text-gray-700 italic">{transcript}</p>
          </div>
        )}

        {/* Result comparison */}
        {hasFinished && !isListening && transcript && result && (
          <div className="space-y-4">
            {/* Score badge */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${
                result.score >= 80
                  ? "bg-green-100 text-green-700"
                  : result.score >= 50
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              Score: {result.score}%
              {result.score >= 80 && ` - ${t("pron_great")}`}
              {result.score >= 50 && result.score < 80 && ` - ${t("pron_good")}`}
              {result.score < 50 && ` - ${t("pron_practice")}`}
            </div>

            {/* Word-by-word comparison */}
            <div className="p-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {t("pron_target")}
                </p>
                <p className="text-gray-800 leading-relaxed">
                  {result.comparisons.map((c, i) => (
                    <span
                      key={i}
                      className={
                        c.correct
                          ? "text-green-600 font-medium"
                          : "text-red-500 font-medium underline decoration-red-300"
                      }
                    >
                      {c.word}
                      {i < result.comparisons.length - 1 ? " " : ""}
                    </span>
                  ))}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {t("pron_you_said")}
                </p>
                <p className="text-gray-700 dark:text-gray-300 italic">{transcript}</p>
              </div>
            </div>

            {/* Next button */}
            <button
              onClick={handleNext}
              className="px-6 py-2.5 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
            >
              {t("pron_next")}
            </button>
          </div>
        )}

        {/* No transcript after recording */}
        {hasFinished && !isListening && !transcript && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">
              {t("pron_no_speech")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
