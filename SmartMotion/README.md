# SmartMotion - Fitness Education & Habit Formation App

SmartMotion is a personalized fitness education platform that helps users learn proper exercise techniques, build lasting habits, and track their progress toward their fitness goals.

## Features

- 🎯 **Personalized Goal Setting**: Tailored fitness plans based on your goals, experience, and schedule
- 🔐 **Authentication**: Email/password and Google OAuth via Supabase
- 💪 **Exercise Library**: Goal-specific exercises with detailed instructions
- 🧠 **Daily Quizzes**: Reinforce learning with daily fitness knowledge quizzes
- 📈 **Progress Tracking**: Log workouts, track streaks, and monitor improvements
- 📚 **Education Content**: Goal-oriented articles and learning materials
- 💳 **Premium Subscriptions**: Stripe integration for premium features
- 👤 **Profile Management**: Update goals, preferences, and account settings

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Payments**: Stripe
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account

### Installation

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Set up environment variables:

Copy `.env.example` to `.env.local` and fill in your credentials:

\`\`\`bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
\`\`\`

3. Set up Supabase database:

Run the migration file at `supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor.

Optionally, run `supabase/seed.sql` to populate sample exercises, quizzes, and education content.

4. Configure authentication providers in Supabase:
   - Enable Email/Password authentication
   - Enable Google OAuth (add your Google OAuth credentials)

5. Set up Stripe webhook:
   - Create a webhook endpoint pointing to `https://your-domain.com/api/webhook`
   - Add the webhook secret to your `.env.local`

### Development

Run the development server:

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Building for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## Project Structure

\`\`\`
SmartMotion/
├── app/                    # Next.js app directory
│   ├── api/               # API routes (Stripe)
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Protected dashboard pages
│   ├── onboarding/        # User onboarding flow
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
├── lib/                   # Utilities and configs
│   ├── supabase/         # Supabase client & types
│   └── stripe/           # Stripe client
├── supabase/             # Database migrations & seeds
└── public/               # Static assets
\`\`\`

## Database Schema

- **profiles**: User profile information
- **fitness_goals**: User fitness goals and preferences
- **exercises**: Exercise library with goal mappings
- **workout_logs**: User workout history
- **quizzes**: Fitness knowledge quizzes
- **quiz_responses**: User quiz answers
- **streaks**: User activity streaks
- **education_content**: Learning materials

## Color Palette

Inspired by Houston jersey colors:
- Primary Blue: `#5DADE2`
- Light Blue: `#AED6F1`
- Accent Red: `#E74C3C`
- Background: White

## License

Private - All rights reserved
