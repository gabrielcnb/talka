"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "fluency_native_lang";

export interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "pt-BR", name: "Portuguese (Brazil)", flag: "🇧🇷" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "th", name: "Thai", flag: "🇹🇭" },
  { code: "vi", name: "Vietnamese", flag: "🇻🇳" },
  { code: "pl", name: "Polish", flag: "🇵🇱" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
];

export function useNativeLanguage() {
  const [language, setLanguageState] = useState<string | null>(null);
  const [isSet, setIsSet] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setLanguageState(stored);
      setIsSet(true);
    }
    setHydrated(true);
  }, []);

  const setLanguage = useCallback((code: string) => {
    localStorage.setItem(STORAGE_KEY, code);
    setLanguageState(code);
    setIsSet(true);
  }, []);

  return { language, setLanguage, isSet, hydrated };
}

export function getLanguageByCode(code: string): LanguageOption | undefined {
  return LANGUAGES.find((l) => l.code === code);
}

export default function LanguageSelector() {
  const { isSet, setLanguage, hydrated } = useNativeLanguage();
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (hydrated && !isSet) {
      setVisible(true);
    }
  }, [hydrated, isSet]);

  const handleSelect = (code: string) => {
    setClosing(true);
    setTimeout(() => {
      setLanguage(code);
      setVisible(false);
      setClosing(false);
      window.location.reload();
    }, 250);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        closing ? "opacity-0" : "opacity-100"
      }`}
      style={{ backdropFilter: "blur(8px)", backgroundColor: "rgba(30, 27, 75, 0.6)" }}
    >
      <div
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl transition-all duration-300 ${
          closing ? "scale-95 opacity-0" : "scale-100 opacity-100 animate-fadeIn"
        }`}
      >
        <div className="px-8 pt-8 pb-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
            <span className="text-3xl">🌍</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            What&apos;s your native language?
          </h2>
          <p className="text-gray-500 text-sm">
            This helps us personalize your English learning experience.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 px-8 pb-8 pt-4">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-100 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md transition-all duration-150 cursor-pointer group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-150">
                {lang.flag}
              </span>
              <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700 text-center leading-tight">
                {lang.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
