'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { createClient } from '@/lib/supabase/client'

interface Exercise {
  id: string
  name: string
  description: string
  goal_types: string[]
  experience_levels: string[]
  muscle_groups: string[]
  equipment_needed: string[]
}

interface WorkoutLog {
  exercise_id: string
  sets: number
  reps: number
  weight: number | null
  notes: string
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [userGoal, setUserGoal] = useState<string | null>(null)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [loading, setLoading] = useState(true)
  const [logModal, setLogModal] = useState(false)
  const [workoutLog, setWorkoutLog] = useState<WorkoutLog>({
    exercise_id: '',
    sets: 3,
    reps: 10,
    weight: null,
    notes: '',
  })
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Get user's fitness goal
      const { data: goalData } = await supabase
        .from('fitness_goals')
        .select('goal_type, experience_level')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (goalData) {
        setUserGoal(goalData.goal_type)

        // Get exercises matching user's goal
        const { data: exerciseData } = await supabase
          .from('exercises')
          .select('*')
          .contains('goal_types', [goalData.goal_type])
          .contains('experience_levels', [goalData.experience_level])

        if (exerciseData) {
          setExercises(exerciseData)
          setFilteredExercises(exerciseData)
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const openLogModal = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    setWorkoutLog({
      exercise_id: exercise.id,
      sets: 3,
      reps: 10,
      weight: null,
      notes: '',
    })
    setLogModal(true)
    setSuccess(false)
  }

  const handleLogWorkout = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase.from('workout_logs').insert({
        user_id: user.id,
        exercise_id: workoutLog.exercise_id,
        sets: workoutLog.sets,
        reps: workoutLog.reps,
        weight: workoutLog.weight,
        notes: workoutLog.notes,
      })

      if (error) throw error

      // Update streak
      const today = new Date().toISOString().split('T')[0]
      const { data: streakData } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (streakData) {
        const lastDate = new Date(streakData.last_activity_date)
        const currentDate = new Date(today)
        const diffDays = Math.floor(
          (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        let newStreak = streakData.current_streak
        if (diffDays === 1) {
          newStreak += 1
        } else if (diffDays > 1) {
          newStreak = 1
        }

        await supabase
          .from('streaks')
          .update({
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, streakData.longest_streak),
            last_activity_date: today,
          })
          .eq('user_id', user.id)
      }

      setSuccess(true)
      setTimeout(() => {
        setLogModal(false)
        setSuccess(false)
      }, 2000)
    } catch (error) {
      console.error('Error logging workout:', error)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-primary-blue">Loading exercises...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Exercise Library</h1>
          <p className="text-gray-600">
            Exercises recommended for your goal
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {exercise.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{exercise.description}</p>

              <div className="space-y-2 mb-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Muscle Groups</div>
                  <div className="flex flex-wrap gap-1">
                    {exercise.muscle_groups.map((group) => (
                      <span
                        key={group}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                      >
                        {group}
                      </span>
                    ))}
                  </div>
                </div>

                {exercise.equipment_needed.length > 0 &&
                  exercise.equipment_needed[0] !== 'none' && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Equipment</div>
                      <div className="flex flex-wrap gap-1">
                        {exercise.equipment_needed.map((equipment) => (
                          <span
                            key={equipment}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            {equipment}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              <button
                onClick={() => openLogModal(exercise)}
                className="w-full bg-primary-blue hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Log Workout
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Log Workout Modal */}
      {logModal && selectedExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Log: {selectedExercise.name}
            </h2>

            {success ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <div className="text-lg font-semibold text-green-600">
                  Workout logged successfully!
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sets
                  </label>
                  <input
                    type="number"
                    value={workoutLog.sets}
                    onChange={(e) =>
                      setWorkoutLog({ ...workoutLog, sets: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reps
                  </label>
                  <input
                    type="number"
                    value={workoutLog.reps}
                    onChange={(e) =>
                      setWorkoutLog({ ...workoutLog, reps: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (lbs) - Optional
                  </label>
                  <input
                    type="number"
                    value={workoutLog.weight || ''}
                    onChange={(e) =>
                      setWorkoutLog({
                        ...workoutLog,
                        weight: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    min="0"
                    step="0.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes - Optional
                  </label>
                  <textarea
                    value={workoutLog.notes}
                    onChange={(e) =>
                      setWorkoutLog({ ...workoutLog, notes: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setLogModal(false)}
                    className="flex-1 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogWorkout}
                    className="flex-1 bg-primary-blue hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Log Workout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
