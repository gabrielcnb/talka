"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { sentences, Sentence } from "@/data/sentences";
import { useTTS } from "@/hooks/useTTS";
import { useTranslation } from "@/app/i18n/useTranslation";
import { useXP } from "@/hooks/useXP";
import { useStreak } from "@/hooks/useStreak";

const levels = ["All", "A1", "A2", "B1", "B2", "C1"] as const;

interface Exercise {
  original: string;
  display: string;
  blanks: string[];
  options: string[];
  blankIndices: number[];
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function createExercise(
  sentence: Sentence,
  allSentencesAtLevel: Sentence[]
): Exercise {
  const text = sentence.text;
  // Remove trailing punctuation for word splitting, we'll handle it
  const words = text.split(/\s+/);

  // Find content words (4+ chars, not first word to keep sentence readable)
  const contentWordIndices: number[] = [];
  for (let i = 0; i < words.length; i++) {
    const clean = words[i].replace(/[^a-zA-Z'-]/g, "");
    if (clean.length >= 4) {
      contentWordIndices.push(i);
    }
  }

  // Fallback: if no content words found, pick any word with 3+ chars
  if (contentWordIndices.length === 0) {
    for (let i = 0; i < words.length; i++) {
      const clean = words[i].replace(/[^a-zA-Z'-]/g, "");
      if (clean.length >= 3) {
        contentWordIndices.push(i);
      }
    }
  }

  // Still nothing? Pick middle word
  if (contentWordIndices.length === 0) {
    contentWordIndices.push(Math.floor(words.length / 2));
  }

  const isAdvanced = ["B1", "B2", "C1"].includes(sentence.level);
  const numBlanks =
    isAdvanced && contentWordIndices.length >= 2
      ? Math.random() < 0.5
        ? 2
        : 1
      : 1;

  // Pick random indices to blank out
  const shuffledIndices = shuffleArray(contentWordIndices);
  const blankIndices = shuffledIndices.slice(0, numBlanks).sort((a, b) => a - b);

  // Extract the blanked words (clean, without punctuation)
  const blanks = blankIndices.map((idx) =>
    words[idx].replace(/[^a-zA-Z'-]/g, "")
  );

  // Build display string with ___ in place of blanked words
  const displayWords = words.map((word, idx) => {
    if (blankIndices.includes(idx)) {
      // Preserve punctuation around the blank
      const leading = word.match(/^[^a-zA-Z'-]*/)?.[0] || "";
      const trailing = word.match(/[^a-zA-Z'-]*$/)?.[0] || "";
      return leading + "___" + trailing;
    }
    return word;
  });
  const display = displayWords.join(" ");

  // Generate distractors from other sentences at same level
  const otherWords: string[] = [];
  for (const s of allSentencesAtLevel) {
    if (s.id === sentence.id) continue;
    for (const w of s.text.split(/\s+/)) {
      const clean = w.replace(/[^a-zA-Z'-]/g, "");
      if (
        clean.length >= 4 &&
        !blanks.includes(clean) &&
        !otherWords.includes(clean)
      ) {
        otherWords.push(clean);
      }
    }
  }

  // Pick 2-3 distractors
  const numDistractors = numBlanks === 2 ? 3 : 2;
  const distractors = shuffleArray(otherWords).slice(0, numDistractors);

  // Combine and shuffle options
  const options = shuffleArray([...blanks, ...distractors]);

  return { original: text, display, blanks, options, blankIndices };
}

function SpeakerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
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
      width="20"
      height="20"
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

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function GrammarPage() {
  const { t } = useTranslation();
  const { addXP } = useXP();
  const { recordPractice } = useStreak();
  const [selectedLevel, setSelectedLevel] = useState<string>("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [answerState, setAnswerState] = useState<
    "pending" | "correct" | "wrong"
  >("pending");
  const [exerciseSeed, setExerciseSeed] = useState(0);
  const { speak, stop, isPlaying, isLoading } = useTTS();

  const filtered = useMemo(
    () =>
      selectedLevel === "All"
        ? sentences
        : sentences.filter((s) => s.level === selectedLevel),
    [selectedLevel]
  );

  // Shuffle filtered sentences once per level change / reset
  const shuffledFiltered = useMemo(
    () => shuffleArray(filtered),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtered, exerciseSeed]
  );

  const currentSentence = shuffledFiltered[currentIndex] as
    | Sentence
    | undefined;

  // Build exercise from current sentence
  const exercise = useMemo(() => {
    if (!currentSentence) return null;
    const sameLevelSentences = sentences.filter(
      (s) => s.level === currentSentence.level
    );
    return createExercise(currentSentence, sameLevelSentences);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSentence, exerciseSeed]);

  // Reset state when level changes
  useEffect(() => {
    setCurrentIndex(0);
    setScore(0);
    setTotalAnswered(0);
    setSelectedWords([]);
    setAnswerState("pending");
    stop();
    setExerciseSeed((s) => s + 1);
  }, [selectedLevel, stop]);

  const handleSelectWord = useCallback(
    (word: string) => {
      if (!exercise || answerState !== "pending") return;

      const newSelected = [...selectedWords, word];
      setSelectedWords(newSelected);

      // Check if all blanks are filled
      if (newSelected.length === exercise.blanks.length) {
        const isCorrect = newSelected.every(
          (w, i) => w.toLowerCase() === exercise.blanks[i].toLowerCase()
        );

        setTotalAnswered((prev) => prev + 1);

        if (isCorrect) {
          setScore((prev) => prev + 1);
          setAnswerState("correct");
          addXP("dictation_correct");
        } else {
          setAnswerState("wrong");
          addXP("dictation_wrong");
        }
        recordPractice();
      }
    },
    [exercise, answerState, selectedWords, addXP, recordPractice]
  );

  const handleNext = useCallback(() => {
    stop();
    if (currentIndex < shuffledFiltered.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Loop back to start with new shuffle
      setCurrentIndex(0);
      setExerciseSeed((s) => s + 1);
    }
    setSelectedWords([]);
    setAnswerState("pending");
  }, [currentIndex, shuffledFiltered.length, stop]);

  const handleListen = useCallback(() => {
    if (!exercise) return;
    if (isPlaying) {
      stop();
    } else {
      speak(exercise.original);
    }
  }, [exercise, isPlaying, speak, stop]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setScore(0);
    setTotalAnswered(0);
    setSelectedWords([]);
    setAnswerState("pending");
    stop();
    setExerciseSeed((s) => s + 1);
  }, [stop]);

  // Build the display with filled-in words
  const renderSentence = () => {
    if (!exercise) return null;

    const parts = exercise.display.split("___");
    const result: React.ReactNode[] = [];

    for (let i = 0; i < parts.length; i++) {
      result.push(
        <span key={`part-${i}`} className="text-gray-800 dark:text-gray-200">
          {parts[i]}
        </span>
      );

      if (i < parts.length - 1) {
        const filledWord = selectedWords[i];
        const isCorrectWord =
          filledWord &&
          filledWord.toLowerCase() === exercise.blanks[i].toLowerCase();
        const showResult = answerState !== "pending";

        if (filledWord) {
          result.push(
            <span
              key={`blank-${i}`}
              className={`inline-block px-2 py-0.5 mx-1 rounded font-semibold transition-colors ${
                showResult
                  ? isCorrectWord
                    ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700"
                    : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700 line-through"
                  : "bg-accent-100 dark:bg-accent-900/40 text-accent-700 dark:text-accent-400 border border-accent-300 dark:border-accent-700"
              }`}
            >
              {filledWord}
            </span>
          );
        } else {
          result.push(
            <span
              key={`blank-${i}`}
              className="inline-block w-20 sm:w-28 border-b-2 border-gray-400 dark:border-gray-500 mx-1"
            >
              &nbsp;
            </span>
          );
        }
      }
    }

    return result;
  };

  // Show correct answer when wrong
  const renderCorrectAnswer = () => {
    if (!exercise || answerState !== "wrong") return null;
    return (
      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        <span className="font-medium text-green-600 dark:text-green-400">
          Correct:{" "}
        </span>
        <span className="text-gray-800 dark:text-gray-200">
          {exercise.original}
        </span>
      </div>
    );
  };

  if (shuffledFiltered.length === 0) {
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
        <p className="text-gray-500 text-center py-12">
          No sentences found for this level.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">{t("grammar_title")}</h1>

      {/* Level filter */}
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

      {/* Score and progress bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {currentIndex + 1} of {shuffledFiltered.length}
        </p>
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Score: {score}/{totalAnswered}
          </p>
          {currentSentence && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent-100 dark:bg-accent-900/40 text-accent-700 dark:text-accent-400 whitespace-nowrap">
              {currentSentence.level}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
        <div
          className="bg-accent-600 h-1.5 rounded-full transition-all duration-300"
          style={{
            width: `${((currentIndex + 1) / shuffledFiltered.length) * 100}%`,
          }}
        />
      </div>

      {/* Exercise card */}
      {exercise && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          {/* Sentence with blanks */}
          <div className="text-lg sm:text-xl leading-relaxed mb-6">
            {renderSentence()}
          </div>

          {/* Correct answer display */}
          {renderCorrectAnswer()}

          {/* Status indicator */}
          {answerState === "correct" && (
            <div className="flex items-center gap-2 mb-4 text-green-600 dark:text-green-400">
              <CheckIcon />
              <span className="font-medium">Correct!</span>
            </div>
          )}
          {answerState === "wrong" && (
            <div className="flex items-center gap-2 mb-4 text-red-600 dark:text-red-400">
              <XIcon />
              <span className="font-medium">Not quite.</span>
            </div>
          )}

          {/* Option pills */}
          {answerState === "pending" && (
            <div className="flex flex-wrap gap-2 mb-6">
              {exercise.options.map((word, idx) => {
                const isAlreadySelected = selectedWords.includes(word);
                return (
                  <button
                    key={`${word}-${idx}`}
                    onClick={() => handleSelectWord(word)}
                    disabled={isAlreadySelected}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isAlreadySelected
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-gray-200 dark:border-gray-700"
                        : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-accent-50 dark:hover:bg-accent-900/20 hover:border-accent-400 dark:hover:border-accent-600 hover:text-accent-700 dark:hover:text-accent-400 active:scale-95"
                    }`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            {/* Listen button - only after answering */}
            {answerState !== "pending" && (
              <button
                onClick={handleListen}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isPlaying
                    ? "bg-accent-100 dark:bg-accent-900/40 text-accent-700 dark:text-accent-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
                aria-label={t("btn_listen")}
              >
                {isLoading ? <LoadingSpinner /> : <SpeakerIcon />}
                {t("btn_listen")}
              </button>
            )}

            {/* Next button */}
            {answerState !== "pending" && (
              <button
                onClick={handleNext}
                className="flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-medium bg-accent-600 hover:bg-accent-700 text-white transition-colors"
              >
                Next
              </button>
            )}

            {/* Reset selection (only when partially filled, before submission) */}
            {answerState === "pending" && selectedWords.length > 0 && (
              <button
                onClick={() => setSelectedWords([])}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Restart button */}
      {totalAnswered > 0 && (
        <div className="text-center">
          <button
            onClick={handleRestart}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-accent-600 dark:hover:text-accent-400 transition-colors"
          >
            Restart exercises
          </button>
        </div>
      )}
    </div>
  );
}
