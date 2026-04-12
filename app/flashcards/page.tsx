"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { vocabulary, VocabWord } from "@/data/vocabulary";
import { useTTS } from "@/hooks/useTTS";
import { useTranslation } from "@/app/i18n/useTranslation";

type Level = "A1" | "A2" | "B1" | "B2" | "C1";
const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1"];

const STORAGE_KEY = "voxify_flashcards";

interface FlashcardState {
  known: number[];
  review: number[];
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function loadState(): FlashcardState {
  if (typeof window === "undefined") return { known: [], review: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { known: [], review: [] };
}

function saveState(state: FlashcardState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export default function FlashcardsPage() {
  const { t } = useTranslation();
  const { speak, isPlaying, isLoading } = useTTS();

  const [selectedLevel, setSelectedLevel] = useState<Level>("A1");
  const [flipped, setFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flashState, setFlashState] = useState<FlashcardState>({ known: [], review: [] });
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffledWords, setShuffledWords] = useState<VocabWord[]>([]);

  // Load saved state
  useEffect(() => {
    setFlashState(loadState());
  }, []);

  // Get words for current level
  const levelWords = useMemo(
    () => vocabulary.filter((w) => w.level === selectedLevel),
    [selectedLevel]
  );

  // Apply shuffle or use original order
  useEffect(() => {
    setShuffledWords(isShuffled ? shuffle(levelWords) : levelWords);
    setCurrentIndex(0);
    setFlipped(false);
  }, [levelWords, isShuffled]);

  const words = shuffledWords;
  const currentWord = words[currentIndex] ?? null;

  const knownCount = useMemo(
    () => flashState.known.filter((id) => words.some((w) => w.id === id)).length,
    [flashState.known, words]
  );

  const reviewCount = useMemo(
    () => flashState.review.filter((id) => words.some((w) => w.id === id)).length,
    [flashState.review, words]
  );

  const progressPercent = words.length > 0 ? Math.round(((knownCount + reviewCount) / words.length) * 100) : 0;

  const goToCard = useCallback(
    (index: number) => {
      if (index >= 0 && index < words.length) {
        setCurrentIndex(index);
        setFlipped(false);
      }
    },
    [words.length]
  );

  const markWord = useCallback(
    (type: "known" | "review") => {
      if (!currentWord) return;
      setFlashState((prev) => {
        const newState = {
          known: prev.known.filter((id) => id !== currentWord.id),
          review: prev.review.filter((id) => id !== currentWord.id),
        };
        newState[type] = [...newState[type], currentWord.id];
        saveState(newState);
        return newState;
      });
      // Advance to next card
      if (currentIndex < words.length - 1) {
        goToCard(currentIndex + 1);
      }
    },
    [currentWord, currentIndex, words.length, goToCard]
  );

  const handleShuffle = useCallback(() => {
    setIsShuffled((prev) => !prev);
  }, []);

  const handleListen = useCallback(
    (text: string) => {
      if (!isPlaying && !isLoading) {
        speak(text);
      }
    },
    [speak, isPlaying, isLoading]
  );

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowRight") {
        goToCard(currentIndex + 1);
      } else if (e.key === "ArrowLeft") {
        goToCard(currentIndex - 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentIndex, goToCard]);

  if (words.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
          {t("nav_flashcards")}
        </h1>
      </div>

      {/* Level Selector */}
      <div className="flex flex-wrap justify-center gap-2">
        {LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => {
              setSelectedLevel(level);
              setCurrentIndex(0);
              setFlipped(false);
            }}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              selectedLevel === level
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-4 text-sm font-medium">
          <span className="text-emerald-600 dark:text-emerald-400">
            {t("flash_known")}: {knownCount}
          </span>
          <span className="text-orange-500 dark:text-orange-400">
            {t("flash_review")}: {reviewCount}
          </span>
        </div>
        <span className="text-sm text-gray-400 dark:text-gray-500">
          {currentIndex + 1} {t("pron_sentence_of")} {words.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Flashcard */}
      {currentWord && (
        <div
          className="relative w-full cursor-pointer"
          style={{ perspective: "1000px", minHeight: "320px" }}
          onClick={() => setFlipped((f) => !f)}
        >
          <div
            className="relative w-full h-full transition-transform duration-600"
            style={{
              transformStyle: "preserve-3d",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
              transition: "transform 0.6s",
              minHeight: "320px",
            }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 w-full rounded-2xl border-2 border-gray-100 dark:border-gray-800 shadow-xl bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-8 gap-4"
              style={{ backfaceVisibility: "hidden" }}
            >
              {/* Part of speech badge */}
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                {currentWord.partOfSpeech}
              </span>

              {/* Word */}
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 text-center">
                {currentWord.word}
              </h2>

              {/* Phonetic */}
              <p className="text-lg text-indigo-500 dark:text-indigo-400 font-mono">
                {currentWord.phonetic}
              </p>

              {/* Listen button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleListen(currentWord.word);
                }}
                disabled={isPlaying || isLoading}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
                {isPlaying ? t("dictation_playing") : t("btn_listen")}
              </button>

              {/* Hint */}
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">
                {t("flash_tap_to_flip")}
              </p>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 w-full rounded-2xl border-2 border-gray-100 dark:border-gray-800 shadow-xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 flex flex-col items-center justify-center p-8 gap-4"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              {/* Part of speech badge */}
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                {currentWord.partOfSpeech}
              </span>

              {/* Definition */}
              <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 text-center leading-relaxed">
                {currentWord.definition}
              </p>

              {/* Example */}
              <p className="text-base text-gray-600 dark:text-gray-400 italic text-center">
                &ldquo;{currentWord.example}&rdquo;
              </p>

              {/* Listen button for example */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleListen(currentWord.example);
                }}
                disabled={isPlaying || isLoading}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/80 dark:bg-gray-800/80 text-indigo-600 dark:text-indigo-400 hover:bg-white dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
                {isPlaying ? t("dictation_playing") : t("btn_listen")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {/* Previous */}
        <button
          onClick={() => goToCard(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Previous"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Review Again */}
        <button
          onClick={() => markWord("review")}
          className="px-5 py-3 rounded-full text-sm font-semibold bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/60 transition-colors shadow-sm"
        >
          {t("flash_review")}
        </button>

        {/* Got It */}
        <button
          onClick={() => markWord("known")}
          className="px-5 py-3 rounded-full text-sm font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors shadow-sm"
        >
          {t("flash_got_it")}
        </button>

        {/* Next */}
        <button
          onClick={() => goToCard(currentIndex + 1)}
          disabled={currentIndex >= words.length - 1}
          className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Shuffle Button */}
      <div className="flex justify-center">
        <button
          onClick={handleShuffle}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            isShuffled
              ? "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M15.5 2a.5.5 0 01.5.5v3a.5.5 0 01-.5.5h-3a.5.5 0 010-1h1.793L11.146 2.354a.5.5 0 01.708-.708L14.5 4.293V2.5a.5.5 0 01.5-.5h.5zM2.5 4a.5.5 0 00-.5.5v1a.5.5 0 001 0v-1a.5.5 0 00-.5-.5zm3 0a.5.5 0 00-.5.5v1a.5.5 0 001 0v-1a.5.5 0 00-.5-.5zm3 0a.5.5 0 00-.5.5v1a.5.5 0 001 0v-1a.5.5 0 00-.5-.5z" />
          </svg>
          {t("flash_shuffle")}
        </button>
      </div>
    </div>
  );
}
