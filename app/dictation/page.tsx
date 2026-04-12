"use client";

import { useState, useCallback } from "react";
import { sentences } from "@/data/sentences";

const levels = ["A1", "A2", "B1", "B2", "C1"] as const;

export default function DictationPage() {
  const [selectedLevel, setSelectedLevel] = useState<string>("A1");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const filtered = sentences.filter((s) => s.level === selectedLevel);
  const current = filtered[currentIndex];

  const checkAnswer = useCallback(() => {
    if (!current) return;
    setShowResult(true);
    const isCorrect =
      userInput.trim().toLowerCase() === current.text.toLowerCase();
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  }, [current, userInput]);

  const nextSentence = useCallback(() => {
    setShowResult(false);
    setUserInput("");
    setCurrentIndex((prev) => (prev + 1) % filtered.length);
  }, [filtered.length]);

  const changeLevel = (level: string) => {
    setSelectedLevel(level);
    setCurrentIndex(0);
    setUserInput("");
    setShowResult(false);
    setScore({ correct: 0, total: 0 });
  };

  if (!current) return <p>No sentences available.</p>;

  const isCorrect =
    userInput.trim().toLowerCase() === current.text.toLowerCase();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">Dictation</h1>
      <p className="text-gray-600">
        Read the sentence, hide it, then type it from memory.
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

      {score.total > 0 && (
        <p className="text-sm text-gray-500">
          Score: {score.correct}/{score.total}
        </p>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <p className="text-sm text-gray-500">
          Sentence {currentIndex + 1} of {filtered.length}
        </p>

        {!showResult && (
          <details className="cursor-pointer">
            <summary className="text-primary-600 font-medium">
              Show sentence (read then hide)
            </summary>
            <p className="mt-2 text-lg text-gray-800">{current.text}</p>
          </details>
        )}

        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type the sentence here..."
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
            Check
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
                {isCorrect ? "Correct!" : "Not quite."}
              </p>
              {!isCorrect && (
                <p className="mt-1 text-sm">
                  Correct answer: <strong>{current.text}</strong>
                </p>
              )}
            </div>
            <button
              onClick={nextSentence}
              className="px-6 py-2 bg-accent-600 text-white rounded-lg font-medium hover:bg-accent-700 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
