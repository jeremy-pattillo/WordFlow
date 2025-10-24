'use client'

import { useEffect, useState } from 'react'

interface StreakCelebrationProps {
  streak: number
  onClose: () => void
}

export default function StreakCelebration({ streak, onClose }: StreakCelebrationProps) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
      setTimeout(onClose, 300)
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in">
      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-3xl p-8 shadow-2xl max-w-md mx-4 text-center transform animate-in zoom-in duration-300">
        <div className="text-7xl mb-4 animate-bounce">🔥</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Streak Updated!
        </h2>
        <p className="text-6xl font-bold text-orange-500 mb-3">
          {streak}
        </p>
        <p className="text-lg text-gray-700">
          {streak === 1
            ? "Let's start fresh! Keep it going! 💪"
            : `${streak} days strong! You're crushing it! 🎉`}
        </p>
      </div>
    </div>
  )
}
