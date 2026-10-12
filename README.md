# 🌊 VocabNest — Ocean / Calm

**Learn new words. Build confidence. Make English a daily habit.**

VocabNest is a responsive vocabulary-learning web application designed to make learning English engaging, accessible, and consistent.

The application combines a calm, ocean-inspired landing page with a clean, modern learning workspace. Explore vocabulary, practice through interactive games, test your knowledge with quizzes, and track your learning activity.

> **Design philosophy:** Ocean-inspired visuals belong primarily on the homepage. Vocabulary, games, quizzes, and progress pages use clean, purpose-specific interfaces to keep learning focused.

---

## ✨ Features

### 🏠 Landing Page
- Responsive, scrollable homepage.
- Ocean/Calm-inspired visual identity.
- Floating vocabulary labels and subtle animations.
- Smooth transitions and interactive hover effects.
- Features, How It Works, and call-to-action sections.
- Responsive navigation for desktop and mobile.
- Reduced-motion support for accessibility.

### 📚 Vocabulary Learning
- Browse your vocabulary collection.
- Search words and filter by topic.
- Add and delete vocabulary entries.
- Save favorite words for revision.
- Explore a daily word and quick practice prompts.
- View collection statistics.

### 🎮 Interactive Learning Games
Practice vocabulary through different activities:

- **Word Match:** Match words with their meanings.
- **Sentence Builder:** Practice using vocabulary in sentences.
- **Guess the Word:** Identify words from clues.

### 📝 Practice Quiz
- Answer vocabulary questions.
- Receive answer feedback.
- Review your score after completing a quiz.

### 🤖 Sentence Checker
- Get basic, rule-based writing suggestions.
- Practice improving English sentences.

**Note:** The current sentence checker does not use an AI API.

### 📈 Progress Dashboard
- View vocabulary and favorite totals.
- Explore a basic weekly activity visualization.
- Review available learning statistics.

### ⚙️ Profile & Settings
- Choose language preferences.
- Configure daily learning goals.
- Select a difficulty preference.

### 🔐 Signup & Login
- Preview the signup and login user interface.
- Basic client-side form validation.
- Browser-local demo session.

**Important:** Authentication is currently for demonstration purposes and is not suitable for real user accounts.

### 📱 Responsive Design
- Desktop, tablet, and mobile layouts.
- Clean navigation and readable content.
- Purpose-specific page designs.
- Subtle animations and interactive UI elements.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | Frontend UI |
| Vite | Development server and build tooling |
| CSS | Responsive styling and animations |
| Lucide | Icons |
| Node.js | JavaScript runtime |
| Express | REST API |
| JSON file storage | Basic vocabulary data persistence |

### Data Storage

The application uses a JSON file for vocabulary storage:

`server/data/vocabnest.json`

This avoids requiring a native database addon such as `better-sqlite3`.

The current storage design is intended for a starter project. A production application with multiple users should use a database with proper user-level data isolation.

---

## 🚀 Getting Started

Follow these steps to run VocabNest locally.

### Prerequisites

Install:

- [Node.js](https://nodejs.org/)
- npm, which is included with Node.js
- [Git](https://git-scm.com/) (optional, for version control)

This project uses Node.js built-in functionality for JSON file storage instead of compiling `better-sqlite3`.

### 1. Clone the Repository

```bash
git clone https://github.com/abhishek-mishra16/VocabNest.git
```

Navigate into the project directory:

```bash
cd VocabNest
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

Open the frontend URL printed in your terminal. It is typically:

http://localhost:5173

The Express API normally runs at:

http://localhost:4000

Keep the terminal running while using the application.

> If your project scripts start both the frontend and backend together, you do not need to start them separately.

---

## 🏗️ Production Build

Create a production frontend build:

```bash
npm run build
```

Start the application:

```bash
npm start
```

The Express server is configured to serve the built frontend from `dist` when that directory exists.

The vocabulary JSON file is stored at:

`server/data/vocabnest.json`

The application may create and seed this file with sample words on its first launch.

**Deployment note:** Confirm the server's storage path and persistence settings before deploying. Temporary hosting filesystems may be cleared during restarts or redeployments.

---

## 🔌 API Reference

The Express API provides the following endpoints.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Check API availability |
| `GET` | `/api/words` | Retrieve vocabulary entries |
| `GET` | `/api/stats` | Retrieve collection statistics |
| `POST` | `/api/words` | Add a vocabulary entry |
| `PATCH` | `/api/words/:id/favorite` | Toggle a word's favorite status |
| `DELETE` | `/api/words/:id` | Delete a vocabulary entry |

The vocabulary endpoint supports search, category, and favorite filters as implemented by the server.

### Example Health Check

Open this address while the backend is running:

http://localhost:4000/api/health

The exact response depends on the current API implementation.

---

## 🔒 Authentication and Security

The current signup/login interface is a demonstration implementation.

It does **not** provide production-ready authentication, secure password storage, or separate private data for individual accounts.

Before using VocabNest with real users, implement:

- Server-side authentication.
- Secure password hashing.
- Protected sessions or a properly configured authentication mechanism.
- Authorization checks on API endpoints.
- Per-user vocabulary and progress ownership.
- Account recovery and password reset.
- Input validation and appropriate rate limiting.
- Secure production configuration.

Never commit passwords, API keys, session secrets, or `.env` files to GitHub.

---

## 🚧 Current Limitations

VocabNest is an evolving project. The current starter implementation has the following limitations:

- Signup/login uses a browser-local demo session.
- Vocabulary storage is JSON-file based.
- Multi-user account isolation is not implemented.
- The sentence checker provides basic local rules rather than AI-generated feedback.
- Full learning-history persistence and real streak tracking are not implemented.
- Spaced repetition and pronunciation audio require further development.
- Production authentication, deployment configuration, and comprehensive testing remain future work.

These features should not be considered production-ready until they have been implemented and tested.

---

## ☁️ Deployment

VocabNest contains both a frontend and an Express backend.

For deployment:

1. Build the React frontend.
2. Deploy the Express API to a Node.js-compatible hosting service.
3. Configure the frontend to communicate with the deployed API.
4. Configure persistent storage for vocabulary data.
5. Implement production authentication before supporting real accounts.
6. Test all navigation, games, API endpoints, and responsive layouts.

**GitHub hosts the source code; uploading the repository does not automatically deploy the application.**

GitHub Pages alone cannot run the Express backend.

---

## 🗺️ Roadmap

Potential future improvements include:

- [ ] Secure, multi-user authentication.
- [ ] Separate vocabulary collections for each account.
- [ ] Persistent user progress and learning history.
- [ ] Real daily and longest streak tracking.
- [ ] Spaced-repetition review scheduling.
- [ ] Pronunciation audio.
- [ ] AI-powered sentence feedback.
- [ ] Personalized learning recommendations.
- [ ] Production database integration.
- [ ] Automated tests and deployment workflows.

---

## 🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

If you want to contribute:

1. Fork the repository.
2. Create a feature branch.
3. Make and test your changes.
4. Submit a pull request with a clear description.

Please avoid committing secrets, credentials, or generated dependency folders.

---

## 📄 License

This project is licensed under the MIT License. See the [`LICENSE`](LICENSE) file for details.

---

## 💙 About VocabNest

VocabNest aims to make vocabulary learning simple, engaging, and consistent through focused practice and an inviting user experience.

**Learn a word today. Grow your vocabulary every day.**

