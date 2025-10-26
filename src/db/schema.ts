import Dexie, { type Table } from 'dexie';

export type Rating = 'again' | 'hard' | 'good' | 'easy';
export type PracticeDirection = 'tl_to_en' | 'en_to_tl' | 'mixed';
export type Theme = 'system' | 'light' | 'dark';

export interface Deck {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  pos?: string;
  example?: string;
  note?: string;
  audioUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewState {
  cardId: string;
  intervalDays: number;
  easeFactor: number;
  repetition: number;
  dueAt: Date;
  lapseCount: number;
}

export interface ReviewLog {
  id: string;
  cardId: string;
  reviewedAt: Date;
  rating: Rating;
  durationMs?: number;
}

export interface Settings {
  id: number;
  newPerDayCap: number;
  practiceDirection: PracticeDirection;
  theme: Theme;
}

export class WordFlowDB extends Dexie {
  decks!: Table<Deck, string>;
  cards!: Table<Card, string>;
  reviewStates!: Table<ReviewState, string>;
  reviewLogs!: Table<ReviewLog, string>;
  settings!: Table<Settings, number>;

  constructor() {
    super('WordFlowDB');

    this.version(1).stores({
      decks: 'id, name, createdAt, updatedAt',
      cards: 'id, deckId, front, back, createdAt, updatedAt',
      reviewStates: 'cardId, dueAt, lapseCount',
      reviewLogs: 'id, cardId, reviewedAt',
      settings: 'id'
    });
  }
}

export const db = new WordFlowDB();
