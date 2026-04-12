"use client";

import { useState, useEffect, useCallback } from "react";

export interface Progress {
  dictation: { correct: number; total: number; bestStreak: number; currentStreak: number };
  pronunciation: { totalAttempts: number; avgScore: number; bestScore: number };
  lastPracticed: string; // ISO date
}

const DEFAULT_PROGRESS: Progress = {
  dictation: { correct: 0, total: 0, bestStreak: 0, currentStreak: 0 },
  pronunciation: { totalAttempts: 0, avgScore: 0, bestScore: 0 },
  lastPracticed: "",
};

const STORAGE_KEY = "voxify_progress";

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROGRESS, ...parsed };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

function saveProgress(progress: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // localStorage full or unavailable
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(DEFAULT_PROGRESS);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount (SSR-safe)
  useEffect(() => {
    setProgress(loadProgress());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: Progress) => {
    next.lastPracticed = new Date().toISOString();
    setProgress(next);
    saveProgress(next);
  }, []);

  const updateDictation = useCallback(
    (correct: boolean) => {
      setProgress((prev) => {
        const d = { ...prev.dictation };
        d.total += 1;
        if (correct) {
          d.correct += 1;
          d.currentStreak += 1;
          if (d.currentStreak > d.bestStreak) {
            d.bestStreak = d.currentStreak;
          }
        } else {
          d.currentStreak = 0;
        }
        const next: Progress = { ...prev, dictation: d };
        next.lastPracticed = new Date().toISOString();
        saveProgress(next);
        return next;
      });
    },
    []
  );

  const updatePronunciation = useCallback(
    (score: number) => {
      setProgress((prev) => {
        const p = { ...prev.pronunciation };
        const totalScore = p.avgScore * p.totalAttempts + score;
        p.totalAttempts += 1;
        p.avgScore = totalScore / p.totalAttempts;
        if (score > p.bestScore) {
          p.bestScore = score;
        }
        const next: Progress = { ...prev, pronunciation: p };
        next.lastPracticed = new Date().toISOString();
        saveProgress(next);
        return next;
      });
    },
    []
  );

  const resetProgress = useCallback(() => {
    const fresh = { ...DEFAULT_PROGRESS };
    setProgress(fresh);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { progress, hydrated, updateDictation, updatePronunciation, resetProgress };
}
