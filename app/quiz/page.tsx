"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { vocabulary, VocabWord } from "@/data/vocabulary";
import { useTranslation } from "@/app/i18n/useTranslation";
import { useXP } from "@/hooks/useXP";
import { useStreak } from "@/hooks/useStreak";

type Level = "A1" | "A2" | "B1" | "B2" | "C1";

interface Question {
  word: VocabWord;
  options: VocabWord[];
  correctIndex: number;
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateQuestions(level: Level): Question[] {
  const levelWords = vocabulary.filter((w) => w.level === level);
  const shuffled = shuffle(levelWords);

  return shuffled.map((word) => {
    // Pick 3 random wrong answers from the same level
    const others = levelWords.filter((w) => w.id !== word.id);
    const wrongOptions = shuffle(others).slice(0, 3);
    const allOptions = shuffle([word, ...wrongOptions]);
    const correctIndex = allOptions.findIndex((o) => o.id === word.id);

    return { word, options: allOptions, correctIndex };
  });
}

const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1"];

export default function QuizPage() {
  const { t } = useTranslation();
  const { addXP } = useXP();
  const { recordPractice } = useStreak();

  const [selectedLevel, setSelectedLevel] = useState<Level>("A1");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [showFeedback, setShowFeedback] = useState<"correct" | "wrong" | null>(null);

  const startQuiz = useCallback(
    (level: Level) => {
      setSelectedLevel(level);
      setQuestions(generateQuestions(level));
      setCurrentIndex(0);
      setSelectedOption(null);
      setCorrect(0);
      setAnswered(false);
      setFinished(false);
      setXpGained(0);
      setShowFeedback(null);
    },
    []
  );

  useEffect(() => {
    startQuiz("A1");
  }, [startQuiz]);

  const currentQuestion = questions[currentIndex];

  const handleSelect = (optionIndex: number) => {
    if (answered) return;
    setSelectedOption(optionIndex);
    setAnswered(true);

    const isCorrect = optionIndex === currentQuestion.correctIndex;
    if (isCorrect) {
      setCorrect((prev) => prev + 1);
      setXpGained((prev) => prev + 10);
      setShowFeedback("correct");
      addXP("quiz_correct");
    } else {
      setXpGained((prev) => prev + 2);
      setShowFeedback("wrong");
      addXP("quiz_wrong");
    }
    recordPractice();

    const delay = isCorrect ? 1500 : 2500;
    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        setFinished(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
        setAnswered(false);
        setShowFeedback(null);
      }
    }, delay);
  };

  const scorePercent = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;

  if (questions.length === 0) {
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
          {t("quiz_title")}
        </h1>
      </div>

      {/* Level Selector */}
      <div className="flex flex-wrap justify-center gap-2">
        {LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => startQuiz(level)}
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

      {/* Score Bar */}
      {!finished && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t("quiz_score")}: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{correct}/{currentIndex + (answered ? 1 : 0)}</span>
          </span>
          <span className="text-sm text-gray-400 dark:text-gray-500">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
      )}

      {/* Question Card or Summary */}
      {finished ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t("quiz_finish")}
          </h2>
          <div className="space-y-2">
            <div className="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              {scorePercent}%
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {correct} / {questions.length} {t("quiz_correct").replace("!", "")}
            </p>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              +{xpGained} XP
            </p>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000"
              style={{ width: `${scorePercent}%` }}
            />
          </div>
          <button
            onClick={() => startQuiz(selectedLevel)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            {t("quiz_play_again")}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ) : currentQuestion ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-100 dark:border-gray-800 shadow-lg overflow-hidden">
          {/* Definition */}
          <div className="p-6 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 border-b border-gray-100 dark:border-gray-800">
            <p className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-2">
              {t("quiz_question")}
            </p>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
              &ldquo;{currentQuestion.word.definition}&rdquo;
            </p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
              {currentQuestion.word.partOfSpeech}
            </span>
          </div>

          {/* Options */}
          <div className="p-6 space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectOption = idx === currentQuestion.correctIndex;

              let btnClass =
                "w-full text-left px-5 py-4 rounded-xl border-2 font-medium transition-all duration-200 ";

              if (!answered) {
                btnClass +=
                  "border-gray-200 dark:border-gray-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-gray-700 dark:text-gray-200 cursor-pointer";
              } else if (isCorrectOption) {
                btnClass +=
                  "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300";
              } else if (isSelected && !isCorrectOption) {
                btnClass +=
                  "border-red-400 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300";
              } else {
                btnClass +=
                  "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 opacity-60";
              }

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelect(idx)}
                  disabled={answered}
                  className={btnClass}
                >
                  <span className="inline-flex items-center gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-500 dark:text-gray-400">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option.word}</span>
                    {answered && isCorrectOption && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {answered && isSelected && !isCorrectOption && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Feedback + Learning Moment */}
          {answered && (
            <div className="px-6 pb-6 space-y-3">
              {/* Feedback badge */}
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                  showFeedback === "correct"
                    ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                    : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                }`}
              >
                {showFeedback === "correct" ? t("quiz_correct") : t("quiz_wrong")}
                <span className="text-xs font-medium ml-1">
                  {showFeedback === "correct" ? "+10 XP" : "+2 XP"}
                </span>
              </div>

              {/* Learning moment */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {currentQuestion.word.word}
                  </span>
                  <span className="text-sm text-indigo-500 dark:text-indigo-400 font-mono">
                    {currentQuestion.word.phonetic}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  {currentQuestion.word.example}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Progress dots */}
      {!finished && questions.length > 0 && (
        <div className="flex justify-center gap-1.5 flex-wrap">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                idx === currentIndex
                  ? "bg-indigo-500 scale-125"
                  : idx < currentIndex
                  ? "bg-indigo-300 dark:bg-indigo-600"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
