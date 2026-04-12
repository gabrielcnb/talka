"use client";

import { useState, useEffect, useCallback } from "react";

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string; // YYYY-MM-DD
  practiceDays: string[]; // array of YYYY-MM-DD dates practiced
}

const DEFAULT_STREAK: StreakState = {
  currentStreak: 0,
  longestStreak: 0,
  lastPracticeDate: "",
  practiceDays: [],
};

const STORAGE_KEY = "voxify_streak";

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function calculateStreak(practiceDays: string[]): number {
  if (practiceDays.length === 0) return 0;

  const today = getToday();
  const sorted = [...practiceDays].sort().reverse();

  // Streak must include today to be "current"
  if (sorted[0] !== today) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + "T00:00:00");
    const curr = new Date(sorted[i] + "T00:00:00");
    const diffMs = prev.getTime() - curr.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function trimToLast30Days(days: string[]): string[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return days.filter((d) => d >= cutoffStr);
}

function loadStreak(): StreakState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STREAK;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STREAK, ...parsed };
  } catch {
    return DEFAULT_STREAK;
  }
}

function saveStreak(state: StreakState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable
  }
}

export function useStreak() {
  const [state, setState] = useState<StreakState>(DEFAULT_STREAK);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount (SSR-safe)
  useEffect(() => {
    const loaded = loadStreak();
    // Recalculate streak on load (in case days passed since last visit)
    loaded.currentStreak = calculateStreak(loaded.practiceDays);
    setState(loaded);
    setHydrated(true);
  }, []);

  const recordPractice = useCallback(() => {
    setState((prev) => {
      const today = getToday();
      if (prev.practiceDays.includes(today)) return prev;

      const newDays = trimToLast30Days([...prev.practiceDays, today]);
      const currentStreak = calculateStreak(newDays);
      const longestStreak = Math.max(prev.longestStreak, currentStreak);

      const next: StreakState = {
        currentStreak,
        longestStreak,
        lastPracticeDate: today,
        practiceDays: newDays,
      };
      saveStreak(next);
      return next;
    });
  }, []);

  const hasPracticedToday = hydrated && state.practiceDays.includes(getToday());

  return {
    currentStreak: state.currentStreak,
    longestStreak: state.longestStreak,
    hasPracticedToday,
    recordPractice,
    practiceDays: state.practiceDays,
    hydrated,
  };
}
