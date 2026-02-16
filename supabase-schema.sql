-- WordFlow Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Decks table
CREATE TABLE decks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('tagalog', 'spanish')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Cards table
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deck_id UUID REFERENCES decks(id) ON DELETE CASCADE NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  pos TEXT,
  example TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Review states table
CREATE TABLE review_states (
  card_id UUID PRIMARY KEY REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  interval_days INTEGER DEFAULT 0 NOT NULL,
  ease_factor DECIMAL DEFAULT 2.5 NOT NULL,
  repetition INTEGER DEFAULT 0 NOT NULL,
  due_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  lapse_count INTEGER DEFAULT 0 NOT NULL
);

-- Review logs table
CREATE TABLE review_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reviewed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  rating TEXT NOT NULL CHECK (rating IN ('again', 'hard', 'good', 'easy')),
  duration_ms INTEGER
);

-- User stats table
CREATE TABLE user_stats (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('tagalog', 'spanish')),
  daily_streak INTEGER DEFAULT 0 NOT NULL,
  last_review_date TIMESTAMPTZ,
  total_reviews INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, language)
);

-- Create indexes for performance
CREATE INDEX idx_decks_user_id ON decks(user_id);
CREATE INDEX idx_decks_language ON decks(language);
CREATE INDEX idx_cards_deck_id ON cards(deck_id);
CREATE INDEX idx_review_states_user_id ON review_states(user_id);
CREATE INDEX idx_review_states_due_at ON review_states(due_at);
CREATE INDEX idx_review_logs_user_id ON review_logs(user_id);
CREATE INDEX idx_review_logs_reviewed_at ON review_logs(reviewed_at);
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Decks policies
CREATE POLICY "Users can view their own decks"
  ON decks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own decks"
  ON decks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decks"
  ON decks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decks"
  ON decks FOR DELETE
  USING (auth.uid() = user_id);

-- Cards policies (users can access cards from their decks)
CREATE POLICY "Users can view cards from their decks"
  ON cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = cards.deck_id
      AND decks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert cards to their decks"
  ON cards FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = cards.deck_id
      AND decks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cards in their decks"
  ON cards FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = cards.deck_id
      AND decks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete cards from their decks"
  ON cards FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = cards.deck_id
      AND decks.user_id = auth.uid()
    )
  );

-- Review states policies
CREATE POLICY "Users can view their own review states"
  ON review_states FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own review states"
  ON review_states FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own review states"
  ON review_states FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own review states"
  ON review_states FOR DELETE
  USING (auth.uid() = user_id);

-- Review logs policies
CREATE POLICY "Users can view their own review logs"
  ON review_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own review logs"
  ON review_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User stats policies
CREATE POLICY "Users can view their own stats"
  ON user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
  ON user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
  ON user_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_decks_updated_at BEFORE UPDATE ON decks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
