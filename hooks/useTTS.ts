"use client";

import { useState, useCallback, useRef } from "react";

interface UseTTSReturn {
  speak: (text: string, voice?: string) => Promise<void>;
  stop: () => void;
  isPlaying: boolean;
  isLoading: boolean;
}

export function useTTS(): UseTTSReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  const speak = useCallback(
    async (text: string, voice?: string) => {
      stop();
      setIsLoading(true);

      try {
        const pin = typeof window !== "undefined" ? localStorage.getItem("talka_pin") || "" : "";
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-app-pin": pin },
          body: JSON.stringify({ text, voice }),
        });

        if (!res.ok) throw new Error("TTS failed");

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(url);
          audioRef.current = null;
        };

        setIsLoading(false);
        setIsPlaying(true);
        await audio.play();
      } catch {
        setIsLoading(false);
        setIsPlaying(false);
      }
    },
    [stop]
  );

  return { speak, stop, isPlaying, isLoading };
}
