interface Card {
  id: string;
  front: string;
  back: string;
  pos: string | null;
  example: string | null;
  note: string | null;
}

interface CardFaceProps {
  card: Card;
  revealed: boolean;
  direction?: 'tl_to_en' | 'en_to_tl';
}

export function CardFace({ card, revealed, direction = 'tl_to_en' }: CardFaceProps) {
  const showFront = direction === 'tl_to_en';
  const frontText = showFront ? card.front : card.back;
  const backText = showFront ? card.back : card.front;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8 min-h-[300px] flex flex-col justify-center items-center relative">
        {/* Front side (always visible) */}
        <div className="text-center mb-6">
          <p className="text-4xl font-bold text-gray-900 mb-2">{frontText}</p>
          {!revealed && card.pos && (
            <p className="text-sm text-gray-500 italic">({card.pos})</p>
          )}
        </div>

        {/* Divider */}
        {revealed && (
          <div className="w-full border-t-2 border-gray-200 my-4"></div>
        )}

        {/* Back side (revealed) */}
        {revealed && (
          <div className="text-center space-y-4">
            <p className="text-3xl font-semibold text-indigo-600">{backText}</p>

            {card.pos && (
              <p className="text-sm text-gray-500 italic">({card.pos})</p>
            )}

            {card.example && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{card.example}</p>
              </div>
            )}

            {card.note && (
              <div className="mt-2 p-2 bg-yellow-50 rounded-lg">
                <p className="text-xs text-gray-600">{card.note}</p>
              </div>
            )}
          </div>
        )}

        {/* Tap to reveal hint */}
        {!revealed && (
          <div className="mt-8">
            <p className="text-sm text-gray-400">Tap or press Space to reveal</p>
          </div>
        )}
      </div>
    </div>
  );
}
