'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const GOAL_TYPES = [
  { id: 'back_pain', label: 'Relieve Back Pain', icon: '🔥', description: 'Build a resilient back to reduce pain and improve daily activity' },
  { id: 'functional_fitness', label: 'Functional Fitness', icon: '💪', description: 'Improve strength and mobility for everyday tasks' },
  { id: 'powerlifting', label: 'Powerlifting', icon: '🏋️', description: 'Build maximum strength in the squat, bench, and deadlift' },
  { id: 'run_faster', label: 'Run Faster', icon: '🏃', description: 'Improve running mechanics, speed, and endurance' },
  { id: 'jump_higher', label: 'Jump Higher', icon: '⛹️', description: 'Develop explosive power and vertical jump ability' },
]

const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Beginner', description: 'New to fitness or this specific goal' },
  { id: 'intermediate', label: 'Intermediate', description: 'Some experience with training' },
  { id: 'advanced', label: 'Advanced', description: 'Extensive training experience' },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [goalType, setGoalType] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [sessionsPerWeek, setSessionsPerWeek] = useState(3)
  const [minutesPerSession, setMinutesPerSession] = useState(15)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async () => {
    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      // Deactivate any existing goals
      await supabase
        .from('fitness_goals')
        .update({ is_active: false })
        .eq('user_id', user.id)

      // Create new fitness goal
      const { error: goalError } = await supabase
        .from('fitness_goals')
        .insert({
          user_id: user.id,
          goal_type: goalType,
          experience_level: experienceLevel,
          sessions_per_week: sessionsPerWeek,
          minutes_per_session: minutesPerSession,
          is_active: true,
        })

      if (goalError) throw goalError

      // Initialize streak for user
      const today = new Date().toISOString().split('T')[0]
      await supabase
        .from('streaks')
        .upsert({
          user_id: user.id,
          current_streak: 0,
          longest_streak: 0,
          last_activity_date: today,
        })

      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const selectedGoal = GOAL_TYPES.find(g => g.id === goalType)

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-light to-white px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-blue mb-2">
            Let&apos;s Personalize Your Journey
          </h1>
          <p className="text-gray-600">Step {step} of 3</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                What&apos;s your primary fitness goal?
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {GOAL_TYPES.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => setGoalType(goal.id)}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${
                      goalType === goal.id
                        ? 'border-primary-blue bg-blue-50'
                        : 'border-gray-200 hover:border-primary-light'
                    }`}
                  >
                    <div className="text-4xl mb-2">{goal.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {goal.label}
                    </h3>
                    <p className="text-sm text-gray-600">{goal.description}</p>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!goalType}
                className="w-full mt-6 bg-primary-blue hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                What&apos;s your experience level with {selectedGoal?.label.toLowerCase()}?
              </h2>
              <div className="space-y-3">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setExperienceLevel(level.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      experienceLevel === level.id
                        ? 'border-primary-blue bg-blue-50'
                        : 'border-gray-200 hover:border-primary-light'
                    }`}
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {level.label}
                    </h3>
                    <p className="text-sm text-gray-600">{level.description}</p>
                  </button>
                ))}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!experienceLevel}
                  className="flex-1 bg-primary-blue hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                How often will you train?
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sessions per week: {sessionsPerWeek}
                </label>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={sessionsPerWeek}
                  onChange={(e) => setSessionsPerWeek(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>7</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minutes per session: {minutesPerSession}
                </label>
                <input
                  type="range"
                  min="3"
                  max="120"
                  step="3"
                  value={minutesPerSession}
                  onChange={(e) => setMinutesPerSession(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>3 min</span>
                  <span>120 min</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Your Plan Summary</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>🎯 Goal: {selectedGoal?.label}</li>
                  <li>📊 Level: {EXPERIENCE_LEVELS.find(l => l.id === experienceLevel)?.label}</li>
                  <li>📅 {sessionsPerWeek} sessions per week</li>
                  <li>⏱️ {minutesPerSession} minutes per session</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-primary-blue hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating your plan...' : 'Start Training'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
