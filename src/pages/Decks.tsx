import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { HomeButton } from '../components/HomeButton';
import {
  getAllDecks,
  generateAutoDeck,
  deleteDeck,
  updateDeck,
  getCardCount,
} from '../services/supabaseService';

interface Deck {
  id: string;
  name: string;
  language: string;
  created_at: string;
  updated_at: string;
}

interface DeckWithCount extends Deck {
  cardCount: number;
}

export function Decks() {
  const navigate = useNavigate();
  const { selectedLanguage } = useLanguage();
  const [decks, setDecks] = useState<DeckWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    loadDecks();
  }, [selectedLanguage]);

  async function loadDecks() {
    try {
      const allDecks = await getAllDecks(selectedLanguage);
      const decksWithCounts = await Promise.all(
        allDecks.map(async (deck) => ({
          ...deck,
          cardCount: await getCardCount(deck.id),
        }))
      );
      setDecks(decksWithCounts);
    } catch (error) {
      console.error('Failed to load decks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateAutoDeck(difficulty?: 'beginner' | 'intermediate' | 'advanced') {
    setGenerating(true);
    try {
      await generateAutoDeck(selectedLanguage, difficulty);
      await loadDecks();
    } catch (error) {
      console.error('Failed to generate auto-deck:', error);
      alert('Failed to generate deck. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleDeleteDeck(deckId: string, deckName: string) {
    if (confirm(`Are you sure you want to delete "${deckName}"? This will delete all cards in this deck.`)) {
      try {
        await deleteDeck(deckId);
        await loadDecks();
      } catch (error) {
        console.error('Failed to delete deck:', error);
        alert('Failed to delete deck. Please try again.');
      }
    }
  }

  function startEditing(deck: DeckWithCount) {
    setEditingDeckId(deck.id);
    setEditingName(deck.name);
  }

  function cancelEditing() {
    setEditingDeckId(null);
    setEditingName('');
  }

  async function saveRename(deckId: string) {
    if (!editingName.trim()) {
      alert('Deck name cannot be empty');
      return;
    }

    try {
      await updateDeck(deckId, editingName.trim());
      await loadDecks();
      setEditingDeckId(null);
      setEditingName('');
    } catch (error) {
      console.error('Failed to rename deck:', error);
      alert('Failed to rename deck. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading decks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4">
            <HomeButton />
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              {selectedLanguage === 'tagalog' ? 'Tagalog' : 'Spanish'} Decks
            </h1>
          </div>
        </div>

        {/* Generate Auto-Deck Section */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Generate Auto-Deck
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Create a deck of 50 unique words from our {selectedLanguage === 'tagalog' ? 'Tagalog' : 'Spanish'} word bank
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleGenerateAutoDeck('beginner')}
              disabled={generating}
              className="py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg disabled:opacity-50 transition"
            >
              Beginner
            </button>
            <button
              onClick={() => handleGenerateAutoDeck('intermediate')}
              disabled={generating}
              className="py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg disabled:opacity-50 transition"
            >
              Intermediate
            </button>
            <button
              onClick={() => handleGenerateAutoDeck('advanced')}
              disabled={generating}
              className="py-3 px-4 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg disabled:opacity-50 transition"
            >
              Advanced
            </button>
            <button
              onClick={() => handleGenerateAutoDeck()}
              disabled={generating}
              className="py-3 px-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg disabled:opacity-50 transition"
            >
              Mixed
            </button>
          </div>
          {generating && (
            <div className="mt-3 flex items-center gap-2">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent"></div>
              <p className="text-sm text-gray-600">Generating deck...</p>
            </div>
          )}
        </div>

        {/* Decks List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Your Decks</h2>
          {decks.length === 0 ? (
            <div className="p-8 bg-white rounded-lg shadow text-center">
              <p className="text-gray-500">No decks yet. Generate an auto-deck to get started!</p>
            </div>
          ) : (
            decks.map((deck) => (
              <div
                key={deck.id}
                className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {editingDeckId === deck.id ? (
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveRename(deck.id);
                            if (e.key === 'Escape') cancelEditing();
                          }}
                          className="flex-1 px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => saveRename(deck.id)}
                          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <h3 className="text-lg font-semibold text-gray-900">
                        {deck.name}
                      </h3>
                    )}
                    <p className="text-sm text-gray-500">
                      {deck.cardCount} card{deck.cardCount !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Created {new Date(deck.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {editingDeckId !== deck.id && (
                      <>
                        <button
                          onClick={() => navigate(`/deck/${deck.id}`)}
                          className="px-3 py-2 text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium rounded transition"
                        >
                          View
                        </button>
                        <button
                          onClick={() => startEditing(deck)}
                          className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded transition"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => handleDeleteDeck(deck.id, deck.name)}
                          className="px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded transition"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
