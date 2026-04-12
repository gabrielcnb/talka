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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
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
        </a>

        <a
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
        </a>

        <a
          href="/dictation"
          className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all"
        >
          <h2 className="text-xl font-semibold text-purple-700 mb-2">
            Dictation
          </h2>
          <p className="text-gray-600">
            Practice listening and writing. Type what you hear to improve your
            skills.
          </p>
        </a>
      </div>
    </div>
  );
}
