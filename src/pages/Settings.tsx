import { useNavigate } from 'react-router-dom';
import { HomeButton } from '../components/HomeButton';

export function Settings() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4">
            <HomeButton />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>

        {/* Settings Content */}
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
            <p className="text-sm text-gray-600 mb-2">
              <strong>WordFlow</strong> v1.0.0
            </p>
            <p className="text-sm text-gray-600">
              A modern language learning app supporting Tagalog & Spanish with spaced repetition (SM-2 algorithm).
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">App Features</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✅ Spaced repetition (SM-2 algorithm)</li>
              <li>✅ Auto-generated decks (500+ words)</li>
              <li>✅ Offline-first with IndexedDB</li>
              <li>✅ Keyboard shortcuts (Space, 1-4)</li>
              <li>✅ Mobile-optimized interface</li>
            </ul>
          </div>

          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Keyboard Shortcuts</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Reveal card</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Space</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Grade: Again</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">1</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Grade: Hard</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">2</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Grade: Good</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">3</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Grade: Easy</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">4</kbd>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Data Management</h2>
            <p className="text-sm text-gray-600 mb-3">
              All your data is stored locally on your device using IndexedDB.
            </p>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                  indexedDB.deleteDatabase('TagalogFlashDB');
                  alert('Data cleared. Reloading...');
                  window.location.reload();
                }
              }}
              className="w-full py-3 px-4 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg"
            >
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
