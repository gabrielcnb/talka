"use client";

import { useState, useEffect } from "react";

export default function PinGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // PIN fixo de acesso. Lembrar via localStorage só revalida contra o PIN
  // correto (antes qualquer valor guardado destravava).
  const PIN = "REDACTED";

  useEffect(() => {
    const stored = localStorage.getItem("talka_pin");
    if (stored === PIN) setUnlocked(true);
    setHydrated(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === PIN) {
      localStorage.setItem("talka_pin", PIN);
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (!hydrated) return null;

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-2">
              <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Talka</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enter PIN to access the app</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              inputMode="numeric"
              maxLength={10}
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(false); }}
              placeholder="PIN"
              autoFocus
              className={`w-full text-center text-2xl tracking-[0.5em] font-mono px-4 py-3 rounded-xl border-2 ${
                error ? "border-red-400" : "border-gray-200 dark:border-gray-700"
              } bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500 transition-colors`}
            />
            {error && <p className="text-sm text-red-500 text-center">Incorrect PIN</p>}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
