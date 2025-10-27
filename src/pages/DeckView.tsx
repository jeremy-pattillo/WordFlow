import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HomeButton } from '../components/HomeButton';
import { PronunciationButton } from '../components/PronunciationButton';
import { getDeck, getCardsForDeck, deleteCard } from '../services/supabaseService';

interface Deck {
  id: string;
  name: string;
  language: string;
  created_at: string;
  updated_at: string;
}

interface Card {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  pos: string | null;
  example: string | null;
  note: string | null;
  audio_url: string | null;
  created_at: string;
  updated_at: string;
}

export function DeckView() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeckData();
  }, [deckId]);

  async function loadDeckData() {
    if (!deckId) {
      navigate('/decks');
      return;
    }

    try {
      const [deckData, cardsData] = await Promise.all([
        getDeck(deckId),
        getCardsForDeck(deckId),
      ]);

      if (!deckData) {
        navigate('/decks');
        return;
      }

      setDeck(deckData);
      setCards(cardsData);
    } catch (error) {
      console.error('Failed to load deck:', error);
      navigate('/decks');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteCard(cardId: string) {
    if (confirm('Are you sure you want to delete this card?')) {
      try {
        await deleteCard(cardId);
        setCards(cards.filter(c => c.id !== cardId));
      } catch (error) {
        console.error('Failed to delete card:', error);
        alert('Failed to delete card. Please try again.');
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading deck...</p>
        </div>
      </div>
    );
  }

  if (!deck) {
    return null;
  }

  const languageLabel = deck.language === 'spanish' ? 'Spanish' : 'Tagalog';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4">
            <HomeButton />
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{deck.name}</h1>
              <p className="text-gray-600 mt-1">
                {cards.length} card{cards.length !== 1 ? 's' : ''} • {languageLabel}
              </p>
            </div>
            <button
              onClick={() => navigate('/review', { state: { deckId: deck.id } })}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
            >
              Start Review
            </button>
          </div>
        </div>

        {/* Cards List */}
        <div className="space-y-3">
          {cards.length === 0 ? (
            <div className="p-8 bg-white rounded-lg shadow text-center">
              <p className="text-gray-500">No cards in this deck yet.</p>
            </div>
          ) : (
            cards.map((card) => (
              <div
                key={card.id}
                className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs text-gray-500 uppercase">{languageLabel}</p>
                          <PronunciationButton
                            text={card.front}
                            language={deck.language as 'spanish' | 'tagalog'}
                          />
                        </div>
                        <p className="text-lg font-semibold text-gray-900">
                          {card.front}
                        </p>
                        {card.pos && (
                          <p className="text-sm text-gray-500 italic mt-1">
                            ({card.pos})
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">English</p>
                        <p className="text-lg font-semibold text-indigo-600">
                          {card.back}
                        </p>
                      </div>
                    </div>
                    {card.example && (
                      <div className="mt-3 p-2 bg-gray-50 rounded">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Example:</span> {card.example}
                        </p>
                      </div>
                    )}
                    {card.note && (
                      <div className="mt-2 p-2 bg-yellow-50 rounded">
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Note:</span> {card.note}
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
