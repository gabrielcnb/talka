"use client";

import { useState, useRef, useEffect } from "react";
import { useNativeLanguage, getLanguageByCode, LANGUAGES } from "./LanguageSelector";

export default function LanguageBadge() {
  const { language, setLanguage, hydrated } = useNativeLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!hydrated || !language) return null;

  const current = getLanguageByCode(language);
  if (!current) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors duration-150 cursor-pointer"
      >
        <span className="text-base">{current.flag}</span>
        <span className="text-xs font-medium text-indigo-700">{current.name}</span>
        <svg
          className={`w-3.5 h-3.5 text-indigo-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 max-h-72 overflow-y-auto rounded-xl bg-white shadow-lg border border-gray-200 z-50 py-1 animate-dropIn">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-100 cursor-pointer ${
                lang.code === language
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.name}</span>
              {lang.code === language && (
                <svg className="w-4 h-4 ml-auto text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}

          <style jsx>{`
            @keyframes dropIn {
              from {
                opacity: 0;
                transform: translateY(-4px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .animate-dropIn {
              animation: dropIn 0.15s ease-out;
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
