import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "English AI - Learn English",
  description: "Practice English vocabulary, grammar, and dictation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-primary-600">
              English AI
            </a>
            <div className="flex gap-6">
              <a
                href="/vocabulary"
                className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
              >
                Vocabulary
              </a>
              <a
                href="/grammar"
                className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
              >
                Grammar
              </a>
              <a
                href="/dictation"
                className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
              >
                Dictation
              </a>
              <a
                href="/pronunciation"
                className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
              >
                Pronunciation
              </a>
            </div>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
