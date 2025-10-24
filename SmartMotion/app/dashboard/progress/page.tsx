import DashboardLayout from '@/components/DashboardLayout'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ProgressPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Get user's workout logs
  const { data: workoutLogs } = await supabase
    .from('workout_logs')
    .select(`
      *,
      exercises (name, muscle_groups)
    `)
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false })
    .limit(20)

  // Get streak data
  const { data: streak } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Calculate workout frequency
  const last7Days = new Date()
  last7Days.setDate(last7Days.getDate() - 7)

  const { count: recentWorkouts } = await supabase
    .from('workout_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('completed_at', last7Days.toISOString())

  // Get quiz accuracy
  const { data: quizResponses } = await supabase
    .from('quiz_responses')
    .select('is_correct')
    .eq('user_id', user.id)

  const quizAccuracy = quizResponses && quizResponses.length > 0
    ? Math.round((quizResponses.filter(r => r.is_correct).length / quizResponses.length) * 100)
    : 0

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Progress</h1>
          <p className="text-gray-600">Track your fitness journey</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary-blue">
            <div className="text-sm text-gray-600 mb-1">Current Streak</div>
            <div className="text-3xl font-bold text-gray-900">
              {streak?.current_streak || 0}
            </div>
            <div className="text-xs text-gray-500">days</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="text-sm text-gray-600 mb-1">Longest Streak</div>
            <div className="text-3xl font-bold text-gray-900">
              {streak?.longest_streak || 0}
            </div>
            <div className="text-xs text-gray-500">days</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <div className="text-sm text-gray-600 mb-1">Workouts (7 days)</div>
            <div className="text-3xl font-bold text-gray-900">
              {recentWorkouts || 0}
            </div>
            <div className="text-xs text-gray-500">sessions</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
            <div className="text-sm text-gray-600 mb-1">Quiz Accuracy</div>
            <div className="text-3xl font-bold text-gray-900">
              {quizAccuracy}%
            </div>
            <div className="text-xs text-gray-500">correct</div>
          </div>
        </div>

        {/* Recent Workouts */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Workouts</h2>

          {!workoutLogs || workoutLogs.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No workouts logged yet. Start by logging your first workout!
            </p>
          ) : (
            <div className="space-y-4">
              {workoutLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-light transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {log.exercises?.name}
                      </h3>
                      <div className="text-sm text-gray-600">
                        {new Date(log.completed_at).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {log.sets} × {log.reps}
                      </div>
                      {log.weight && (
                        <div className="text-sm text-gray-600">{log.weight} lbs</div>
                      )}
                    </div>
                  </div>

                  {log.exercises?.muscle_groups && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {log.exercises.muscle_groups.map((group: string) => (
                        <span
                          key={group}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                        >
                          {group}
                        </span>
                      ))}
                    </div>
                  )}

                  {log.notes && (
                    <div className="text-sm text-gray-600 mt-2 italic">
                      &quot;{log.notes}&quot;
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
