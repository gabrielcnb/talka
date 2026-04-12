"use client";

import { useState, useEffect } from "react";
import { translations } from "./translations";

export function useTranslation() {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const stored = localStorage.getItem("fluency_native_lang");
    if (stored && translations[stored]) {
      setLang(stored);
    }

    // Set document lang to "en" since the primary content is English
    document.documentElement.lang = "en";

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "fluency_native_lang" && e.newValue && translations[e.newValue]) {
        setLang(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const t = (key: string): string => {
    return translations[lang]?.[key] ?? translations.en?.[key] ?? key;
  };

  return { t, lang };
}
