import { useNavigate } from 'react-router-dom';

export function HomeButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/')}
      className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2 font-semibold transition"
    >
      ← Home
    </button>
  );
}
