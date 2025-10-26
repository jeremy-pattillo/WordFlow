import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { HomeButton } from '../components/HomeButton';
import { CardFace } from '../components/CardFace';
import { GradeBar } from '../components/GradeBar';
import { ProgressHeader } from '../components/ProgressHeader';
import { getDueCards, recordReview, type DueCard } from '../services/supabaseService';

type Rating = 'again' | 'hard' | 'good' | 'easy';

interface QueuedCard extends DueCard {
  timesReviewed: number;
}

export function Review() {
  const navigate = useNavigate();
  const { selectedLanguage } = useLanguage();
  const [reviewQueue, setReviewQueue] = useState<QueuedCard[]>([]);
  const [currentCard, setCurrentCard] = useState<QueuedCard | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [totalReviewed, setTotalReviewed] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });

  useEffect(() => {
    loadCards();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyPress(e: KeyboardEvent) {
      if (loading || !currentCard) return;

      if (!revealed && e.key === ' ') {
        e.preventDefault();
        setRevealed(true);
      } else if (revealed) {
        const ratings: Record<string, Rating> = {
          '1': 'again',
          '2': 'hard',
          '3': 'good',
          '4': 'easy',
        };
        if (ratings[e.key]) {
          e.preventDefault();
          handleGrade(ratings[e.key]);
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [revealed, loading, currentCard]);

  async function loadCards() {
    try {
      const dueCards = await getDueCards(selectedLanguage);
      if (dueCards.length === 0) {
        setTimeout(() => navigate('/'), 1000);
        return;
      }

      const queuedCards: QueuedCard[] = dueCards.map(card => ({
        ...card,
        timesReviewed: 0,
      }));

      setReviewQueue(queuedCards);
      setCurrentCard(queuedCards[0]);
    } catch (error) {
      console.error('Failed to load due cards:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleReveal = useCallback(() => {
    if (!revealed) {
      setRevealed(true);
    }
  }, [revealed]);

  const requeueCard = (rating: Rating): number => {
    // Determine requeue position based on rating with randomness
    let maxPosition: number;

    switch (rating) {
      case 'again':
        // Within next 4 cards (1-4)
        maxPosition = Math.min(4, reviewQueue.length);
        break;
      case 'hard':
        // Within next 7 cards (3-7)
        maxPosition = Math.min(7, reviewQueue.length);
        break;
      case 'good':
        // Within next 15 cards (8-15)
        maxPosition = Math.min(15, reviewQueue.length);
        break;
      case 'easy':
        // Within next 45 cards or end of queue (20-45)
        maxPosition = Math.min(45, reviewQueue.length);
        break;
      default:
        maxPosition = reviewQueue.length;
    }

    // Add randomness - pick a random position within the range
    const minPosition = rating === 'again' ? 1 :
                       rating === 'hard' ? 3 :
                       rating === 'good' ? 8 :
                       20;

    const actualMin = Math.min(minPosition, maxPosition);
    const position = Math.floor(Math.random() * (maxPosition - actualMin + 1)) + actualMin;

    return Math.min(position, reviewQueue.length);
  };

  const handleGrade = useCallback(
    async (rating: Rating) => {
      if (!revealed || !currentCard) return;

      const duration = Date.now() - startTime;
      const updatedCard = { ...currentCard, timesReviewed: currentCard.timesReviewed + 1 };

      try {
        // Record the review in DB
        await recordReview(currentCard.id, rating, duration);

        // Update session stats
        setSessionStats((prev) => ({
          ...prev,
          [rating]: prev[rating] + 1,
        }));

        setTotalReviewed(prev => prev + 1);

        // Remove current card from queue
        const remainingQueue = reviewQueue.slice(1);

        // Determine if card should be requeued
        const shouldRequeue = rating === 'again' || rating === 'hard' ||
                             (rating === 'good' && updatedCard.timesReviewed < 2);

        if (shouldRequeue && remainingQueue.length > 0) {
          // Requeue the card
          const position = requeueCard(rating);
          const newQueue = [
            ...remainingQueue.slice(0, position),
            updatedCard,
            ...remainingQueue.slice(position),
          ];

          setReviewQueue(newQueue);
          setCurrentCard(newQueue[0]);
        } else if (remainingQueue.length > 0) {
          // Move to next card without requeuing
          setReviewQueue(remainingQueue);
          setCurrentCard(remainingQueue[0]);
        } else {
          // Session complete - no more cards
          navigate('/results', {
            state: { stats: sessionStats, cardsReviewed: totalReviewed + 1 },
          });
          return;
        }

        // Reset for next card
        setRevealed(false);
        setStartTime(Date.now());
      } catch (error) {
        console.error('Failed to record review:', error);
      }
    },
    [revealed, currentCard, reviewQueue, startTime, sessionStats, totalReviewed, navigate]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading cards...</p>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No cards due!
          </h2>
          <p className="text-gray-600 mb-6">Great job! Come back later for more practice.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Home Button */}
      <div className="p-4">
        <HomeButton />
      </div>

      {/* Progress Header */}
      <ProgressHeader
        current={totalReviewed + 1}
        total={totalReviewed + reviewQueue.length}
        dueCount={reviewQueue.length}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center p-6">
        <div
          onClick={handleReveal}
          className="cursor-pointer w-full"
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleReveal();
          }}
        >
          <CardFace card={currentCard} revealed={revealed} direction="tl_to_en" language={selectedLanguage} />
        </div>

        {/* Grade Bar */}
        {revealed && (
          <div className="mt-6 w-full animate-fadeIn">
            <GradeBar onGrade={handleGrade} />
          </div>
        )}

        {/* Keyboard hints */}
        <div className="mt-6 text-center text-sm text-gray-500">
          {!revealed ? (
            <p>Press Space to reveal</p>
          ) : (
            <p>Press 1-4 to grade</p>
          )}
        </div>
      </div>
    </div>
  );
}
