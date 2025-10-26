# WordFlow

Master Spanish and Tagalog with spaced repetition - A modern language learning platform with pronunciation, daily streaks, and smart review scheduling.

## Features

- **Multi-Language Support**: Learn Spanish or Tagalog with 300+ vocabulary words per language
- **Spaced Repetition**: SM-2 algorithm ensures optimal review timing for long-term retention
- **Pronunciation**: Built-in text-to-speech using Web Speech API
- **Daily Streaks**: Track your consistency with automatic streak counting (Mountain Time)
- **Smart Metrics**:
  - Words learned (words marked "easy" 3+ times)
  - Cards due for review
  - 7-day rolling average of daily reviews
- **Auto-Generated Decks**: Create practice decks by difficulty level (Beginner, Intermediate, Advanced)
- **Deck Management**: Create, rename, and organize your learning materials
- **Keyboard Shortcuts**: Space to reveal, 1-4 to grade cards
- **Mobile Responsive**: Learn on any device

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Authentication)
- **Routing**: React Router v6
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/SlimJimPattillo/wordflow.git
cd wordflow
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

   Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the Supabase database:

   Run the SQL schema in your Supabase project:
   - Open the Supabase SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Execute the script

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
wordflow/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── CardFace.tsx
│   │   ├── GradeBar.tsx
│   │   ├── HomeButton.tsx
│   │   ├── PronunciationButton.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/         # React Context providers
│   │   ├── AuthContext.tsx      # User authentication
│   │   └── LanguageContext.tsx  # Language selection
│   ├── data/            # Word banks
│   │   ├── wordbank.ts          # Tagalog vocabulary
│   │   └── spanish-wordbank.ts  # Spanish vocabulary
│   ├── lib/             # Core configuration
│   │   └── supabase.ts          # Supabase client
│   ├── pages/           # Route pages/views
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── ForgotPassword.tsx
│   │   ├── Decks.tsx
│   │   ├── DeckView.tsx
│   │   ├── Review.tsx
│   │   ├── Results.tsx
│   │   └── Settings.tsx
│   ├── services/        # API and business logic
│   │   └── supabaseService.ts   # All database operations
│   └── App.tsx          # Root component with routing
├── supabase-schema.sql  # Database schema with RLS policies
├── .env                 # Environment variables (not in git)
└── package.json
```

## Database Schema

The app uses Supabase (PostgreSQL) with Row Level Security:

- **users**: User accounts (managed by Supabase Auth)
- **decks**: User-created flashcard decks
- **cards**: Individual flashcards with word, translation, examples
- **review_states**: SRS scheduling data per card
- **review_logs**: Historical review performance
- **user_stats**: Aggregate statistics (streak, total reviews)

All tables have RLS policies to ensure users can only access their own data.

## Spaced Repetition Algorithm

WordFlow uses the SuperMemo 2 (SM-2) algorithm for optimal review scheduling:

- **Again**: Review soon (within next 4 cards)
- **Hard**: Review moderately (within next 7 cards)
- **Good**: Review later (within next 15 cards)
- **Easy**: Review much later (within next 45 cards)

The algorithm adjusts intervals based on your performance to maximize retention.

## Keyboard Shortcuts

- **Space** - Reveal card answer
- **1** - Grade as "Again" (Forgot)
- **2** - Grade as "Hard"
- **3** - Grade as "Good"
- **4** - Grade as "Easy"

## Deployment

### Vercel Deployment

1. Push your code to GitHub

2. Import your repository in Vercel

3. Set environment variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. Deploy!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning or personal use.

## Acknowledgments

- Built with [Claude Code](https://claude.com/claude-code)
- Spaced repetition algorithm inspired by SuperMemo
- Vocabulary sourced from common language learning resources

## Support

For issues or questions, please open an issue on GitHub.
