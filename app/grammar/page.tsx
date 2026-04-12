"use client";

import { useState } from "react";
import { sentences } from "@/data/sentences";

const levels = ["All", "A1", "A2", "B1", "B2", "C1"] as const;

export default function GrammarPage() {
  const [selectedLevel, setSelectedLevel] = useState<string>("All");

  const filtered =
    selectedLevel === "All"
      ? sentences
      : sentences.filter((s) => s.level === selectedLevel);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Grammar Practice</h1>

      <div className="flex gap-2 flex-wrap">
        {levels.map((level) => (
          <button
            key={level}
            onClick={() => setSelectedLevel(level)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedLevel === level
                ? "bg-accent-600 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500">{filtered.length} sentences</p>

      <div className="grid gap-3">
        {filtered.map((sentence) => (
          <div
            key={sentence.id}
            className="bg-white rounded-lg border border-gray-200 p-4 flex items-start justify-between gap-4"
          >
            <p className="text-gray-800">{sentence.text}</p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent-100 text-accent-700 whitespace-nowrap">
              {sentence.level}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
