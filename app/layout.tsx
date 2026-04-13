import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import NavLinks from "@/components/NavLinks";
import MobileMenu from "@/components/MobileMenu";
import LanguageSelector from "./components/LanguageSelector";
import LanguageBadge from "./components/LanguageBadge";
import ThemeToggle from "./components/ThemeToggle";
import XPBar from "./components/XPBar";
import LevelUpCelebration from "./components/LevelUpCelebration";
import PinGate from "./components/PinGate";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://talka-app.vercel.app'),
  title: {
    default: "Talka - Master English with AI",
    template: "%s | Talka",
  },
  description:
    "AI-powered English learning: pronunciation practice, vocabulary, grammar, and dictation with speech recognition and text-to-speech.",
  manifest: "/manifest.json",
  themeColor: "#4f46e5",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Talka",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Talka - Master English with AI",
    description:
      "AI-powered English learning with pronunciation practice, vocabulary building, and real-time speech recognition.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <PinGate>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:outline-none">
          Skip to content
        </a>
        <nav className="relative bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 shadow-lg">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-xl font-bold text-white hover:opacity-90 transition-opacity"
            >
              {/* Speech bubble / waveform icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-cyan-300"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <path d="M8 10h.01" />
                <path d="M12 10h.01" />
                <path d="M16 10h.01" />
              </svg>
              Talka
            </Link>
            <div className="flex items-center gap-4">
              <NavLinks />
              <LanguageBadge />
              <ThemeToggle />
              <Link
                href="/settings"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Settings"
                title="Settings"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white/80"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </Link>
              <MobileMenu />
            </div>
          </div>
        </nav>
        <XPBar />
        <LevelUpCelebration />

        <LanguageSelector />

        <main id="main-content" className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
          {children}
        </main>

        <footer className="border-t border-gray-200/60 dark:border-gray-800/60 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-6 py-4 text-center text-sm text-gray-400 dark:text-gray-500">
            Powered by AI
          </div>
        </footer>
        </PinGate>
      </body>
    </html>
  );
}
