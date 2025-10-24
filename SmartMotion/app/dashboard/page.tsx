'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import StreakCelebration from '@/components/StreakCelebration'
import { updateStreak } from '@/lib/streaks'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [fitnessGoal, setFitnessGoal] = useState<any>(null)
  const [streak, setStreak] = useState<any>(null)
  const [workoutCount, setWorkoutCount] = useState(0)
  const [quizCount, setQuizCount] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (!currentUser) {
        router.push('/auth/signin')
        return
      }

      setUser(currentUser)

      // Update streak automatically on dashboard load
      const streakResult = await updateStreak(currentUser.id)

      // Show celebration if streak increased
      if (streakResult.increased) {
        setShowCelebration(true)
      }

      // Get user's active fitness goal
      const { data: goalData } = await supabase
        .from('fitness_goals')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('is_active', true)
        .single()

      setFitnessGoal(goalData)

      // Get updated user's streak
      const { data: streakData } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', currentUser.id)
        .single()

      setStreak(streakData)

      // Get recent workout count
      const { count: workouts } = await supabase
        .from('workout_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', currentUser.id)

      setWorkoutCount(workouts || 0)

      // Get quiz completion count
      const { count: quizzes } = await supabase
        .from('quiz_responses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', currentUser.id)

      setQuizCount(quizzes || 0)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const goalLabels: Record<string, string> = {
    back_pain: 'Relieve Back Pain',
    functional_fitness: 'Functional Fitness',
    powerlifting: 'Powerlifting',
    run_faster: 'Run Faster',
    jump_higher: 'Jump Higher',
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-primary-blue">Loading your dashboard...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <>
      {showCelebration && streak && (
        <StreakCelebration
          streak={streak.current_streak}
          onClose={() => setShowCelebration(false)}
        />
      )}
      <DashboardLayout>
        <div className="space-y-6">
        {/* Greeting */}
        <div className="bg-gradient-to-br from-primary-blue to-blue-500 p-8 rounded-3xl text-white">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-blue-100">
            {fitnessGoal
              ? `You're working toward: ${goalLabels[fitnessGoal.goal_type]}`
              : 'Ready to set your first goal?'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">
                🔥
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {streak?.current_streak || 0}
            </div>
            <div className="text-sm text-gray-500">Day Streak</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                💪
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {workoutCount || 0}
            </div>
            <div className="text-sm text-gray-500">Workouts</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
                🧠
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {quizCount || 0}
            </div>
            <div className="text-sm text-gray-500">Quizzes</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl">
                ⭐
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {streak?.longest_streak || 0}
            </div>
            <div className="text-sm text-gray-500">Best Streak</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">What would you like to do today?</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/quiz"
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border-2 border-transparent hover:border-primary-blue"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl mb-4">
                🧠
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Daily Quiz</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Learn something new about fitness today</p>
            </Link>

            <Link
              href="/dashboard/exercises"
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border-2 border-transparent hover:border-primary-blue"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl mb-4">
                💪
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Log Workout</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Record your progress and build your streak</p>
            </Link>

            <Link
              href="/dashboard/education"
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border-2 border-transparent hover:border-primary-blue"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl mb-4">
                📚
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Learn</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Explore personalized educational content</p>
            </Link>
          </div>
        </div>

        {/* Goal Summary */}
        {fitnessGoal && (
          <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Training Plan</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  📊
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Experience Level</div>
                  <div className="font-semibold text-gray-900 capitalize">
                    {fitnessGoal.experience_level}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  📅
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Sessions per Week</div>
                  <div className="font-semibold text-gray-900">
                    {fitnessGoal.sessions_per_week}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  ⏱️
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Minutes per Session</div>
                  <div className="font-semibold text-gray-900">
                    {fitnessGoal.minutes_per_session}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
    </>
  )
}
