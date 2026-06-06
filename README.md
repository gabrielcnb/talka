# Talka

Interactive English learning app — vocabulary, grammar exercises and dictation practice (Next.js + Tailwind).

Live at [talka.vercel.app](https://talka.vercel.app)

## Features

- **Vocabulary Browser** — 200+ words organized by CEFR level (A1-C1) with phonetics, definitions, and example sentences
- **Flashcards** — spaced-repetition style cards with "Known / Review" tracking (persisted in localStorage)
- **Grammar Exercises** — fill-in-the-blank exercises generated from sentence data with shuffled options
- **Dictation** — listen to AI-generated speech and type what you hear, with word-level diff feedback
- **Pronunciation Practice** — listen to a sentence, record yourself via Web Speech API, and compare word-by-word
- **Quiz Mode** — multiple-choice vocabulary quizzes filtered by level
- **Text-to-Speech** — five AI voices (eve, ara, rex, sal, leo) powered by xAI TTS API
- **Speech Recognition** — browser-native Web Speech API for pronunciation comparison
- **Instant Translation** — translate definitions and examples into 16 languages via xAI Grok API
- **XP & Leveling** — earn XP for every activity with 10 progression levels (Beginner to Legend)
- **Daily Streak** — tracks consecutive practice days with a visual streak badge
- **Progress Tracking** — per-module completion stats stored locally
- **Dark Mode** — system-aware theme toggle
- **i18n UI** — interface available in English, Portuguese, Spanish, and more
- **PWA-ready** — includes web manifest for installable app experience
- **PIN Protection** — optional PIN gate to restrict access
- **Word of the Day** — daily highlighted word on the home page

## Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 3](https://tailwindcss.com/)
- [xAI API](https://x.ai/) — TTS (text-to-speech) and translation (Grok)
- Web Speech API — browser-native speech recognition

## Getting Started

### Prerequisites

- Node.js 18+
- An [xAI API key](https://console.x.ai/) for TTS and translation features

### Install & Run

```bash
git clone https://github.com/gabrielcnb/talka.git
cd talka
npm install
```

Create a `.env.local` file in the project root:

```env
XAI_API_KEY=your_xai_api_key
# Optional: restrict access with a PIN
# APP_PIN=1234
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
app/
  page.tsx              # Home page with dashboard
  vocabulary/           # Word browser with TTS and translation
  flashcards/           # Spaced-repetition flashcards
  grammar/              # Fill-in-the-blank exercises
  dictation/            # Listen-and-type practice
  pronunciation/        # Record and compare pronunciation
  quiz/                 # Multiple-choice vocabulary quiz
  settings/             # User preferences and data management
  api/tts/              # TTS proxy (xAI)
  api/translate/        # Translation proxy (xAI Grok)
  components/           # Shared UI components
  i18n/                 # Interface translations
hooks/                  # Custom React hooks (TTS, XP, streak, speech recognition, progress)
data/                   # Vocabulary and sentence datasets
```

## License

[MIT](./LICENSE)
