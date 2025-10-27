import { useState, useEffect } from 'react';

interface PronunciationButtonProps {
  text: string;
  language: 'spanish' | 'tagalog';
  className?: string;
}

export function PronunciationButton({ text, language, className = '' }: PronunciationButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSupported(false);
    }
  }, []);

  const speak = () => {
    if (!supported || speaking) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Set speech parameters
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Event handlers
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    let bestVoice = null;

    if (language === 'spanish') {
      // Try to find Spanish voices in priority order
      const priorities = ['es-MX', 'es-US', 'es-ES', 'es-'];
      for (const priority of priorities) {
        bestVoice = voices.find(v => v.lang.startsWith(priority));
        if (bestVoice) break;
      }
      utterance.lang = bestVoice?.lang || 'es-US';
    } else {
      // Try to find Tagalog voices
      const priorities = ['tl-PH', 'fil-PH', 'tl-', 'fil-'];
      for (const priority of priorities) {
        bestVoice = voices.find(v => v.lang.startsWith(priority));
        if (bestVoice) break;
      }
      utterance.lang = bestVoice?.lang || 'tl-PH';
    }

    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  if (!supported) {
    return null;
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); // Prevent card flip on click
        speak();
      }}
      disabled={speaking}
      className={`p-2 rounded-full transition-colors ${
        speaking
          ? 'bg-indigo-200 text-indigo-800'
          : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-600'
      } disabled:opacity-50 ${className}`}
      title="Hear pronunciation"
      aria-label="Hear pronunciation"
    >
      {speaking ? (
        <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
}
