import { useNavigate, useLocation } from 'react-router-dom';
import { StatTile } from '../components/StatTile';
import { HomeButton } from '../components/HomeButton';

export function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const { stats, cardsReviewed } = location.state || { stats: null, cardsReviewed: 0 };

  if (!stats) {
    // If no stats, redirect to home
    setTimeout(() => navigate('/'), 100);
    return null;
  }

  const totalReviews = stats.again + stats.hard + stats.good + stats.easy;
  const accuracy =
    totalReviews > 0
      ? Math.round(((stats.good + stats.easy) / totalReviews) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-6">
      <div className="max-w-md mx-auto">
        {/* Home Button */}
        <div className="mb-4">
          <HomeButton />
        </div>

        {/* Celebration Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Session Complete!
          </h1>
          <p className="text-gray-600">
            You reviewed {cardsReviewed} card{cardsReviewed !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Session Summary</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatTile label="Total Reviews" value={totalReviews} color="blue" />
            <StatTile label="Accuracy" value={`${accuracy}%`} color="green" />
          </div>

          {/* Detailed Breakdown */}
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Rating Distribution
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Again (Forgot)</span>
                <span className="text-sm font-bold text-red-600">{stats.again}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Hard</span>
                <span className="text-sm font-bold text-orange-600">{stats.hard}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Good</span>
                <span className="text-sm font-bold text-green-600">{stats.good}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Easy</span>
                <span className="text-sm font-bold text-blue-600">{stats.easy}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Encouragement Message */}
        <div className="mb-8 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <p className="text-sm text-indigo-900 text-center">
            {accuracy >= 90
              ? '🌟 Excellent work! You\'re mastering these words!'
              : accuracy >= 70
              ? '👍 Good job! Keep up the consistent practice!'
              : '💪 Keep going! Consistency is key to learning!'}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow"
          >
            Back to Home
          </button>
          <button
            onClick={() => navigate('/review')}
            className="w-full py-4 px-6 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-lg shadow border border-gray-200"
          >
            Review More Cards
          </button>
        </div>
      </div>
    </div>
  );
}
