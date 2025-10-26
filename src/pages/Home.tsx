import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { StatTile } from '../components/StatTile';
import {
  getDueCount,
  getTodayStats,
  getUserStats,
  getAverageReviewsPerDay,
  type TodayStats
} from '../services/supabaseService';

export function Home() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { selectedLanguage, setSelectedLanguage } = useLanguage();
  const [dueCount, setDueCount] = useState(0);
  const [stats, setStats] = useState<TodayStats | null>(null);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [avgPerDay, setAvgPerDay] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedLanguage]);

  async function loadData() {
    try {
      const [due, todayStats, userStats, avg] = await Promise.all([
        getDueCount(selectedLanguage),
        getTodayStats(selectedLanguage),
        getUserStats(selectedLanguage),
        getAverageReviewsPerDay()
      ]);

      setDueCount(due);
      setStats(todayStats);
      setDailyStreak(userStats?.daily_streak || 0);
      setAvgPerDay(avg);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  const accuracy =
    stats && stats.reviewed > 0
      ? Math.round(
          ((stats.goodCount + stats.easyCount) / stats.reviewed) * 100
        )
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">{user?.email}</div>
            <button
              onClick={handleSignOut}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Sign Out
            </button>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">WordFlow</h1>
          <p className="text-gray-600">Master languages with spaced repetition</p>
        </div>

        {/* Language Selector */}
        <div className="mb-6">
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
            Learning Language
          </label>
          <select
            id="language"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as 'tagalog' | 'spanish')}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition font-semibold"
          >
            <option value="tagalog">Tagalog</option>
            <option value="spanish">Spanish</option>
          </select>
        </div>

        {/* Main CTA */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/review')}
            disabled={dueCount === 0}
            className={`
              w-full py-6 px-8 rounded-2xl font-bold text-xl shadow-lg
              transition-all duration-200
              ${
                dueCount > 0
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {dueCount > 0 ? (
              <>
                Start Review
                <span className="block text-sm font-normal mt-1">
                  {dueCount} card{dueCount !== 1 ? 's' : ''} due
                </span>
              </>
            ) : (
              <>
                No cards due
                <span className="block text-sm font-normal mt-1">
                  Great job! Come back later
                </span>
              </>
            )}
          </button>
        </div>

        {/* Enhanced Stats Dashboard */}
        <div className="mb-8 space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">Your Progress</h2>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-white rounded-lg shadow">
              <div className="text-3xl mb-1">🔥</div>
              <div className="text-2xl font-bold text-gray-900">{dailyStreak}</div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </div>

            <div className="p-4 bg-white rounded-lg shadow">
              <div className="text-3xl mb-1">✅</div>
              <div className="text-2xl font-bold text-gray-900">{stats?.wordsLearned || 0}</div>
              <div className="text-sm text-gray-600">Words Learned</div>
              <div className="text-xs text-gray-500 mt-1">Easy × 3</div>
            </div>

            <div className="p-4 bg-white rounded-lg shadow">
              <div className="text-3xl mb-1">📊</div>
              <div className="text-2xl font-bold text-gray-900">{avgPerDay}</div>
              <div className="text-sm text-gray-600">Avg/Day</div>
              <div className="text-xs text-gray-500 mt-1">Last 7 days</div>
            </div>

            <div className="p-4 bg-white rounded-lg shadow">
              <div className="text-3xl mb-1">📚</div>
              <div className="text-2xl font-bold text-gray-900">{dueCount}</div>
              <div className="text-sm text-gray-600">To Review</div>
            </div>
          </div>

          {/* Today's Stats */}
          {stats && stats.reviewed > 0 && (
            <div className="mt-4">
              <h3 className="text-md font-semibold text-gray-700 mb-3">Today's Activity</h3>
              <div className="grid grid-cols-2 gap-3">
                <StatTile label="Reviewed" value={stats.reviewed} color="blue" />
                <StatTile label="Accuracy" value={`${accuracy}%`} color="green" />
              </div>

              {/* Recall Distribution */}
              <div className="mt-3 p-4 bg-white rounded-lg shadow">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Recall Distribution</h4>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div>
                    <div className="text-red-600 font-bold">{stats.againCount}</div>
                    <div className="text-gray-500">Again</div>
                  </div>
                  <div>
                    <div className="text-orange-600 font-bold">{stats.hardCount}</div>
                    <div className="text-gray-500">Hard</div>
                  </div>
                  <div>
                    <div className="text-green-600 font-bold">{stats.goodCount}</div>
                    <div className="text-gray-500">Good</div>
                  </div>
                  <div>
                    <div className="text-blue-600 font-bold">{stats.easyCount}</div>
                    <div className="text-gray-500">Easy</div>
                  </div>
                </div>
              </div>

              {stats.leechCount > 0 && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ {stats.leechCount} leech{stats.leechCount !== 1 ? 'es' : ''} detected
                    (difficult cards)
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">Quick Actions</h2>
          <button
            onClick={() => navigate('/decks')}
            className="w-full py-4 px-6 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-lg shadow border border-gray-200 transition-colors"
          >
            Browse Decks
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="w-full py-4 px-6 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-lg shadow border border-gray-200 transition-colors"
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  );
}
