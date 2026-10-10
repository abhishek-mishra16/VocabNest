# VocabNest 2.0 — Ocean / Calm

A responsive vocabulary-learning web app concept built with React, Vite, Express, a JSON-file data store, and Lucide icons. The public homepage uses a calm ocean-inspired visual identity; the learning workspace keeps vocabulary, quizzes, and data views clean and purpose-specific instead of repeating ocean imagery on every screen.

## Included in this starter

- Scrollable marketing homepage with Features, How it Works, and call-to-action sections
- Gentle floating word labels, hover states, smooth transitions, responsive navigation, and reduced-motion support
- Signup and login screens with basic client-side form validation (demo mode only)
- Learning dashboard with collection statistics and daily word card
- Personal vocabulary library with search and topic filters
- Add/delete words, favorite words, and persistent file-based storage
- Practice quiz with answer feedback and score summary
- Daily Words page with quick practice prompts
- Three interactive practice modes: Word Match, Sentence Builder, and Guess the Word
- Sentence Checker page with local rule-based tips (no AI API call yet)
- Progress overview with library/favorites totals and a weekly activity visualization
- Profile & Settings page with language, daily-goal, and difficulty preferences
- Responsive desktop, tablet, and mobile layouts
- Express REST API with input validation and duplicate-word handling

## Important: current authentication / production status

The signup/login screen currently creates a **browser-local demo session** so you can preview the user flow. It does **not** provide secure passwords, real authentication, or separate private data per account. Do not use it for real users until server-side authentication, password hashing, session security, per-user database ownership, and account recovery are implemented. The sentence checker currently provides local rule-based tips, not AI-generated feedback. Pronunciation audio, real streak tracking, spaced repetition, saved long-term progress, and multi-user accounts are future integration work; the UI describes some of these as planned capabilities rather than claiming they are already live.

## Tech stack

- Frontend: React 18, Vite, Lucide icons, CSS
- Backend: Node.js, Express
- Data storage: JSON file (`server/data/vocabnest.json`); no native database addon is required

## Run locally

Requirements: Node.js 18+ and npm (Node.js 26.7.0 is supported by this version because it no longer compiles `better-sqlite3`).

```bash
npm install
npm run dev
```

Open the Vite URL printed in the terminal (usually `http://localhost:5173`). The API runs at `http://localhost:4000`.

## Production build

```bash
npm run build
npm start
```

The Express server serves the built frontend from `dist` when it exists. The JSON data file is created at `server/data/vocabnest.json` and seeded with sample words on first launch.

## API overview

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/words` | List words; supports search/category/favorite filters |
| GET | `/api/stats` | Collection totals |
| POST | `/api/words` | Add a word |
| PATCH | `/api/words/:id/favorite` | Toggle favorite |
| DELETE | `/api/words/:id` | Delete a word |

## Deploying

Use a Node.js host that supports persistent storage. Configure persistent storage for `server/data` so the vocabulary JSON file survives restarts. GitHub Pages alone cannot run this Express API. Before a public launch, complete real multi-user authentication, per-user data separation, production configuration, and tests.

## License

MIT — feel free to adapt this project for your portfolio.
