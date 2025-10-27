import { useState, useRef } from 'react';

interface PronunciationButtonProps {
  text: string;
  language: 'spanish' | 'tagalog';
  className?: string;
}

export function PronunciationButton({ text, language, className = '' }: PronunciationButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = () => {
    if (speaking) return;

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Map language to Google Translate language code
    const languageCode = language === 'spanish' ? 'es' : 'tl';

    // Create Google Translate TTS URL
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${languageCode}&q=${encodeURIComponent(text)}`;

    // Create and play audio
    const audio = new Audio(ttsUrl);
    audioRef.current = audio;

    audio.addEventListener('play', () => setSpeaking(true));
    audio.addEventListener('ended', () => setSpeaking(false));
    audio.addEventListener('error', () => {
      setSpeaking(false);
      console.error('Failed to load pronunciation audio');
    });

    audio.play().catch((error) => {
      console.error('Failed to play pronunciation:', error);
      setSpeaking(false);
    });
  };

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
