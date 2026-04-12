"use client";

import { useState } from "react";
import { vocabulary } from "@/data/vocabulary";

const levels = ["All", "A1", "A2", "B1", "B2", "C1"] as const;

export default function VocabularyPage() {
  const [selectedLevel, setSelectedLevel] = useState<string>("All");

  const filtered =
    selectedLevel === "All"
      ? vocabulary
      : vocabulary.filter((w) => w.level === selectedLevel);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Vocabulary</h1>

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
            {level}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500">{filtered.length} words</p>

      <div className="grid gap-4">
        {filtered.map((word) => (
          <div
            key={word.id}
            className="bg-white rounded-lg border border-gray-200 p-4 space-y-2"
          >
            <div className="flex items-baseline gap-3">
              <span className="text-lg font-semibold text-gray-900">
                {word.word}
              </span>
              <span className="text-sm text-gray-500">{word.phonetic}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
                {word.partOfSpeech}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 ml-auto">
                {word.level}
              </span>
            </div>
            <p className="text-gray-700">{word.definition}</p>
            <p className="text-sm text-gray-500 italic">
              &quot;{word.example}&quot;
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
