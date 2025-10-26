import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';
import { DEFAULT_SM2_CONFIG } from '../lib/srs';

// Type aliases for convenience
type Deck = Database['public']['Tables']['decks']['Row'];
type Card = Database['public']['Tables']['cards']['Row'];
type ReviewState = Database['public']['Tables']['review_states']['Row'];
type ReviewLog = Database['public']['Tables']['review_logs']['Row'];
type UserStats = Database['public']['Tables']['user_stats']['Row'];
type Rating = 'again' | 'hard' | 'good' | 'easy';

// ============================================================================
// DECK OPERATIONS
// ============================================================================

export async function createDeck(name: string, language: string): Promise<Deck> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('decks')
    .insert({
      user_id: user.id,
      name,
      language,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAllDecks(language?: string): Promise<Deck[]> {
  let query = supabase.from('decks').select('*').order('updated_at', { ascending: false });

  if (language) {
    query = query.eq('language', language);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function getDeck(id: string): Promise<Deck | null> {
  const { data, error } = await supabase.from('decks').select('*').eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

export async function updateDeck(id: string, name: string): Promise<void> {
  const { error } = await supabase.from('decks').update({ name }).eq('id', id);

  if (error) throw error;
}

export async function deleteDeck(id: string): Promise<void> {
  // Supabase cascades delete automatically via foreign keys
  const { error } = await supabase.from('decks').delete().eq('id', id);

  if (error) throw error;
}

export async function getCardCount(deckId: string): Promise<number> {
  const { count, error } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .eq('deck_id', deckId);

  if (error) throw error;
  return count || 0;
}

// ============================================================================
// CARD OPERATIONS
// ============================================================================

export interface CreateCardData {
  front: string;
  back: string;
  pos?: string;
  example?: string;
  note?: string;
  audio_url?: string;
}

export async function createCard(deckId: string, data: CreateCardData): Promise<Card> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  // Create card
  const { data: card, error: cardError } = await supabase
    .from('cards')
    .insert({
      deck_id: deckId,
      front: data.front.trim(),
      back: data.back.trim(),
      pos: data.pos?.trim() || null,
      example: data.example?.trim() || null,
      note: data.note?.trim() || null,
      audio_url: data.audio_url || null,
    })
    .select()
    .single();

  if (cardError) throw cardError;

  // Initialize review state
  const { error: stateError } = await supabase.from('review_states').insert({
    card_id: card.id,
    user_id: user.id,
    interval_days: 0,
    ease_factor: DEFAULT_SM2_CONFIG.easeFactorStart,
    repetition: 0,
    due_at: new Date().toISOString(),
    lapse_count: 0,
  });

  if (stateError) throw stateError;

  return card;
}

export async function getCardsForDeck(deckId: string): Promise<Card[]> {
  const { data, error } = await supabase.from('cards').select('*').eq('deck_id', deckId);

  if (error) throw error;
  return data || [];
}

export async function updateCard(id: string, data: Partial<CreateCardData>): Promise<void> {
  const { error } = await supabase.from('cards').update(data).eq('id', id);

  if (error) throw error;
}

export async function deleteCard(id: string): Promise<void> {
  // Cascading delete will handle review_states and review_logs
  const { error } = await supabase.from('cards').delete().eq('id', id);

  if (error) throw error;
}

export async function bulkImportCards(
  deckId: string,
  cards: CreateCardData[]
): Promise<void> {
  for (const cardData of cards) {
    await createCard(deckId, cardData);
  }
}

// ============================================================================
// REVIEW OPERATIONS
// ============================================================================

export interface DueCard extends Card {
  review_state: ReviewState;
}

export async function getDueCards(language?: string): Promise<DueCard[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const now = new Date().toISOString();

  // Get due review states
  const { data: states, error: statesError } = await supabase
    .from('review_states')
    .select('*')
    .eq('user_id', user.id)
    .lte('due_at', now);

  if (statesError) throw statesError;
  if (!states || states.length === 0) return [];

  // Get cards for those states
  const cardIds = states.map((s) => s.card_id);
  let cardQuery = supabase.from('cards').select('*, decks!inner(language)').in('id', cardIds);

  if (language) {
    cardQuery = cardQuery.eq('decks.language', language);
  }

  const { data: cards, error: cardsError } = await cardQuery;

  if (cardsError) throw cardsError;
  if (!cards) return [];

  // Combine cards with their review states
  const dueCards: DueCard[] = cards.map((card) => {
    const state = states.find((s) => s.card_id === card.id)!;
    return {
      ...card,
      review_state: state,
    };
  });

  return dueCards;
}

export async function getDueCount(language?: string): Promise<number> {
  const dueCards = await getDueCards(language);
  return dueCards.length;
}

export async function recordReview(
  cardId: string,
  rating: Rating,
  durationMs?: number
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  // Get current review state
  const { data: state, error: stateError } = await supabase
    .from('review_states')
    .select('*')
    .eq('card_id', cardId)
    .eq('user_id', user.id)
    .single();

  if (stateError) throw stateError;
  if (!state) throw new Error('Review state not found');

  // Calculate next review (using existing SRS algorithm)
  const result = calculateNextReview(state, rating);

  // Update review state
  const { error: updateError } = await supabase
    .from('review_states')
    .update({
      interval_days: result.intervalDays,
      ease_factor: result.easeFactor,
      repetition: result.repetition,
      due_at: result.dueAt.toISOString(),
      lapse_count: result.lapseCount,
    })
    .eq('card_id', cardId)
    .eq('user_id', user.id);

  if (updateError) throw updateError;

  // Log the review
  const { error: logError } = await supabase.from('review_logs').insert({
    card_id: cardId,
    user_id: user.id,
    rating,
    duration_ms: durationMs || null,
  });

  if (logError) throw logError;

  // Update user stats
  await updateUserStatsAfterReview(rating);
}

// Helper function to calculate next review (from existing srs.ts logic)
function calculateNextReview(
  state: ReviewState,
  rating: Rating
): {
  intervalDays: number;
  easeFactor: number;
  repetition: number;
  dueAt: Date;
  lapseCount: number;
} {
  const now = new Date();
  let intervalDays = state.interval_days;
  let easeFactor = state.ease_factor;
  let repetition = state.repetition;
  let lapseCount = state.lapse_count;

  const config = DEFAULT_SM2_CONFIG;

  // Handle failure (Again)
  if (rating === 'again') {
    lapseCount++;
    repetition = 0;
    intervalDays = config.learningStepsMinutes[0] / (24 * 60);
    easeFactor = Math.max(config.easeFactorFloor, easeFactor + config.lapsePenalty);
  }
  // Handle learning phase
  else if (repetition === 0) {
    if (rating === 'good') {
      repetition = 1;
      intervalDays = config.graduatingIntervalDays;
    } else if (rating === 'easy') {
      repetition = 1;
      intervalDays = config.graduatingIntervalDays * 1.5;
      easeFactor = Math.min(2.7, easeFactor + 0.15);
    } else if (rating === 'hard') {
      intervalDays = config.learningStepsMinutes[1] / (24 * 60);
    }
  }
  // Handle review phase
  else {
    repetition++;

    if (rating === 'hard') {
      easeFactor = Math.max(config.easeFactorFloor, easeFactor - 0.15);
      intervalDays = Math.max(1, intervalDays * 1.2);
    } else if (rating === 'good') {
      intervalDays = intervalDays * easeFactor;
    } else if (rating === 'easy') {
      easeFactor = Math.min(2.7, easeFactor + 0.15);
      intervalDays = intervalDays * easeFactor * 1.3;
    }
  }

  intervalDays = Math.round(intervalDays * 10) / 10;
  const dueAt = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  return {
    intervalDays,
    easeFactor,
    repetition,
    dueAt,
    lapseCount,
  };
}

// ============================================================================
// USER STATS
// ============================================================================

async function updateUserStatsAfterReview(rating: Rating): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // Get current language from settings (we'll implement this later)
  // For now, we'll update stats for all languages
  const { data: decks } = await supabase.from('decks').select('language').eq('user_id', user.id);

  const languages = [...new Set((decks || []).map((d) => d.language))];

  for (const language of languages) {
    await updateDailyStreak(user.id, language);
  }
}

async function updateDailyStreak(userId: string, language: string): Promise<void> {
  // Get or create user stats
  const { data: stats, error: fetchError } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('language', language)
    .single();

  const now = new Date();
  const today = new Date(now.toLocaleString('en-US', { timeZone: 'America/Denver' }));
  today.setHours(0, 0, 0, 0);

  if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

  if (!stats) {
    // Create new stats
    const { error: insertError } = await supabase.from('user_stats').insert({
      user_id: userId,
      language,
      daily_streak: 1,
      last_review_date: now.toISOString(),
      total_reviews: 1,
    });

    if (insertError) throw insertError;
  } else {
    const lastReview = stats.last_review_date
      ? new Date(new Date(stats.last_review_date).toLocaleString('en-US', { timeZone: 'America/Denver' }))
      : null;

    if (lastReview) {
      lastReview.setHours(0, 0, 0, 0);
    }

    let newStreak = stats.daily_streak;

    if (!lastReview || lastReview < today) {
      // Check if yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastReview && lastReview.getTime() === yesterday.getTime()) {
        // Continue streak
        newStreak++;
      } else if (!lastReview || lastReview < yesterday) {
        // Broke streak
        newStreak = 1;
      }
    }

    const { error: updateError } = await supabase
      .from('user_stats')
      .update({
        daily_streak: newStreak,
        last_review_date: now.toISOString(),
        total_reviews: stats.total_reviews + 1,
      })
      .eq('user_id', userId)
      .eq('language', language);

    if (updateError) throw updateError;
  }
}

export async function getUserStats(language: string): Promise<UserStats | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', user.id)
    .eq('language', language)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

// ============================================================================
// TODAY'S STATS
// ============================================================================

export interface TodayStats {
  reviewed: number;
  againCount: number;
  hardCount: number;
  goodCount: number;
  easyCount: number;
  leechCount: number;
  wordsLearned: number; // Cards marked "easy" 3+ times
}

export async function getTodayStats(language?: string): Promise<TodayStats> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      reviewed: 0,
      againCount: 0,
      hardCount: 0,
      goodCount: 0,
      easyCount: 0,
      leechCount: 0,
      wordsLearned: 0,
    };
  }

  // Get today's date in Mountain Time
  const now = new Date();
  const today = new Date(now.toLocaleString('en-US', { timeZone: 'America/Denver' }));
  today.setHours(0, 0, 0, 0);

  // Get review logs for today
  let logsQuery = supabase
    .from('review_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('reviewed_at', today.toISOString());

  const { data: logs, error: logsError } = await logsQuery;

  if (logsError) throw logsError;

  const stats: TodayStats = {
    reviewed: logs?.length || 0,
    againCount: 0,
    hardCount: 0,
    goodCount: 0,
    easyCount: 0,
    leechCount: 0,
    wordsLearned: 0,
  };

  for (const log of logs || []) {
    if (log.rating === 'again') stats.againCount++;
    else if (log.rating === 'hard') stats.hardCount++;
    else if (log.rating === 'good') stats.goodCount++;
    else if (log.rating === 'easy') stats.easyCount++;
  }

  // Count leeches (cards with lapse_count >= 8)
  const { count, error: leechError } = await supabase
    .from('review_states')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('lapse_count', 8);

  if (leechError) throw leechError;
  stats.leechCount = count || 0;

  // Count words learned (easy pressed 3+ times)
  stats.wordsLearned = await getWordsLearned(language);

  return stats;
}

// Get count of learned words (cards marked easy 3+ times)
export async function getWordsLearned(language?: string): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 0;

  // Get all cards and count "easy" ratings for each
  const { data: logs, error } = await supabase
    .from('review_logs')
    .select('card_id, rating')
    .eq('user_id', user.id)
    .eq('rating', 'easy');

  if (error) throw error;

  // Count "easy" ratings per card
  const easyCounts = new Map<string, number>();
  for (const log of logs || []) {
    easyCounts.set(log.card_id, (easyCounts.get(log.card_id) || 0) + 1);
  }

  // Filter cards with 3+ easy ratings
  const learnedCardIds = Array.from(easyCounts.entries())
    .filter(([_, count]) => count >= 3)
    .map(([cardId, _]) => cardId);

  if (learnedCardIds.length === 0) return 0;

  // If language filter, check which of these cards belong to that language's decks
  if (language) {
    const { count, error: countError } = await supabase
      .from('cards')
      .select('*, decks!inner(language)', { count: 'exact', head: true })
      .in('id', learnedCardIds)
      .eq('decks.language', language);

    if (countError) throw countError;
    return count || 0;
  }

  return learnedCardIds.length;
}

// Get average reviews per day (last 7 days)
export async function getAverageReviewsPerDay(): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 0;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: logs, error } = await supabase
    .from('review_logs')
    .select('reviewed_at')
    .eq('user_id', user.id)
    .gte('reviewed_at', sevenDaysAgo.toISOString());

  if (error) throw error;

  return Math.round((logs?.length || 0) / 7);
}

// ============================================================================
// AUTO-DECK GENERATION
// ============================================================================

export async function generateAutoDeck(
  language: string,
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  // Import word banks
  const { WORD_BANK } = await import('../data/wordbank');
  const { SPANISH_WORD_BANK } = await import('../data/spanish-wordbank');

  const wordBank = language === 'spanish' ? SPANISH_WORD_BANK : WORD_BANK;

  // Get all existing cards for this user to avoid duplicates
  const { data: existingCards } = await supabase
    .from('cards')
    .select('front, decks!inner(user_id, language)')
    .eq('decks.user_id', user.id)
    .eq('decks.language', language);

  const existingWords = new Set(existingCards?.map((c) => c.front.toLowerCase()) || []);

  // Filter word bank
  let availableWords = wordBank.filter(
    (w) => !existingWords.has((language === 'spanish' ? w.spanish : w.tagalog).toLowerCase())
  );

  if (difficulty) {
    availableWords = availableWords.filter((w) => w.difficulty === difficulty);
  }

  // Shuffle and select 50 words
  const shuffled = availableWords.sort(() => Math.random() - 0.5);
  const selectedWords = shuffled.slice(0, Math.min(50, shuffled.length));

  if (selectedWords.length === 0) {
    throw new Error('No new words available for this difficulty level');
  }

  // Create deck name
  const baseName = difficulty
    ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
    : 'Mixed';

  // Check for existing decks with same base name
  const { data: existingDecks } = await supabase
    .from('decks')
    .select('name')
    .eq('user_id', user.id)
    .eq('language', language);

  const sameNameDecks = existingDecks?.filter(
    (d) => d.name === baseName || d.name.startsWith(`${baseName} `)
  ) || [];

  const deckName = sameNameDecks.length > 0
    ? `${baseName} ${sameNameDecks.length + 1}`
    : baseName;

  // Create deck
  const deck = await createDeck(deckName, language);

  // Prepare all cards for batch insert
  const cardsToInsert = selectedWords.map((word) => ({
    deck_id: deck.id,
    front: (language === 'spanish' ? word.spanish : word.tagalog).trim(),
    back: word.english.trim(),
    pos: word.pos?.trim() || null,
    example: null,
    note: null,
    audio_url: null,
  }));

  // Batch insert cards
  const { data: insertedCards, error: cardsError } = await supabase
    .from('cards')
    .insert(cardsToInsert)
    .select();

  if (cardsError) throw cardsError;

  // Batch insert review states
  const reviewStatesToInsert = insertedCards!.map((card) => ({
    card_id: card.id,
    user_id: user.id,
    interval_days: 0,
    ease_factor: DEFAULT_SM2_CONFIG.easeFactorStart,
    repetition: 0,
    due_at: new Date().toISOString(),
    lapse_count: 0,
  }));

  const { error: statesError } = await supabase
    .from('review_states')
    .insert(reviewStatesToInsert);

  if (statesError) throw statesError;

  return deck.id;
}
