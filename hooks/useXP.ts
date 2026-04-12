"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "voxify_xp";

const LEVEL_THRESHOLDS = [0, 50, 150, 300, 500, 800, 1200, 1800, 2500, 3500];

const LEVEL_NAMES = [
  "Beginner",
  "Elementary",
  "Pre-Intermediate",
  "Intermediate",
  "Upper-Intermediate",
  "Advanced",
  "Proficient",
  "Expert",
  "Master",
  "Legend",
];

export const XP_REWARDS = {
  dictation_correct: 10,
  dictation_wrong: 2,
  pronunciation_great: 15, // >= 80%
  pronunciation_good: 8, // >= 50%
  pronunciation_practice: 3, // < 50%
  vocabulary_listen: 1,
  vocabulary_translate: 2,
  quiz_correct: 10,
  quiz_wrong: 2,
} as const;

export type XPRewardType = keyof typeof XP_REWARDS;

interface XPState {
  xp: number;
  level: number;
  xpToNext: number;
  totalXP: number;
}

function getLevelFromXP(totalXP: number): number {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  return level;
}

function getXPToNext(totalXP: number, level: number): number {
  if (level >= LEVEL_THRESHOLDS.length) return 0;
  return LEVEL_THRESHOLDS[level] - totalXP;
}

function getXPProgress(totalXP: number, level: number): number {
  if (level >= LEVEL_THRESHOLDS.length) return 100;
  const currentThreshold = LEVEL_THRESHOLDS[level - 1];
  const nextThreshold = LEVEL_THRESHOLDS[level];
  const range = nextThreshold - currentThreshold;
  if (range <= 0) return 100;
  return Math.min(100, ((totalXP - currentThreshold) / range) * 100);
}

function loadXP(): number {
  if (typeof window === "undefined") return 0;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return typeof parsed.totalXP === "number" ? parsed.totalXP : 0;
    }
  } catch {}
  return 0;
}

function saveXP(totalXP: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ totalXP }));
  } catch {}
}

export function useXP() {
  const [totalXP, setTotalXP] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTotalXP(loadXP());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      saveXP(totalXP);
    }
  }, [totalXP, hydrated]);

  const level = getLevelFromXP(totalXP);
  const xpToNext = getXPToNext(totalXP, level);
  const xpProgress = getXPProgress(totalXP, level);
  const levelName = LEVEL_NAMES[level - 1] || "Legend";

  const addXP = useCallback((type: XPRewardType) => {
    const amount = XP_REWARDS[type];
    setTotalXP((prev) => {
      const newTotal = prev + amount;
      const oldLevel = getLevelFromXP(prev);
      const newLevel = getLevelFromXP(newTotal);

      // Dispatch level-up event if level increased
      if (newLevel > oldLevel && typeof window !== "undefined") {
        const newLevelName = LEVEL_NAMES[newLevel - 1] || "Legend";
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent("voxify_level_up", {
              detail: { newLevel, levelName: newLevelName },
            })
          );
        }, 0);
      }

      return newTotal;
    });
    // Dispatch event so XPBar can react
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("voxify_xp_gain", { detail: { amount } })
      );
    }
  }, []);

  return {
    xp: hydrated ? totalXP - LEVEL_THRESHOLDS[level - 1] : 0,
    level: hydrated ? level : 1,
    xpToNext: hydrated ? xpToNext : 50,
    xpProgress: hydrated ? xpProgress : 0,
    totalXP: hydrated ? totalXP : 0,
    addXP,
    levelName: hydrated ? levelName : "Beginner",
  };
}
