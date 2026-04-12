import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900">
          Learn English with AI
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Practice vocabulary, grammar, and dictation across all CEFR levels
          from A1 to C1.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/vocabulary"
          className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-primary-400 hover:shadow-lg transition-all"
        >
          <h2 className="text-xl font-semibold text-primary-700 mb-2">
            Vocabulary
          </h2>
          <p className="text-gray-600">
            Learn new words with definitions, phonetics, and example sentences.
            Filter by level.
          </p>
        </Link>

        <Link
          href="/grammar"
          className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-accent-400 hover:shadow-lg transition-all"
        >
          <h2 className="text-xl font-semibold text-accent-700 mb-2">
            Grammar
          </h2>
          <p className="text-gray-600">
            Study sentence structures and patterns at different difficulty
            levels.
          </p>
        </Link>

        <Link
          href="/dictation"
          className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all"
        >
          <h2 className="text-xl font-semibold text-purple-700 mb-2">
            Dictation
          </h2>
          <p className="text-gray-600">
            Listen to sentences and type what you hear. Real listening practice.
          </p>
        </Link>

        <Link
          href="/pronunciation"
          className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-amber-400 hover:shadow-lg transition-all"
        >
          <h2 className="text-xl font-semibold text-amber-700 mb-2">
            Pronunciation
          </h2>
          <p className="text-gray-600">
            Listen to correct pronunciation, record yourself, and compare
            word-by-word.
          </p>
        </Link>
      </div>
    </div>
  );
}
