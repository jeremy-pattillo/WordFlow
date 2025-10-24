'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { createClient } from '@/lib/supabase/client'

interface Quiz {
  id: string
  goal_type: string
  question: string
  options: Record<string, string>
  correct_answer: string
  explanation: string
  difficulty: string
}

export default function QuizPage() {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [loading, setLoading] = useState(true)
  const [completedToday, setCompletedToday] = useState(false)
  const [stats, setStats] = useState({ total: 0, correct: 0 })

  const supabase = createClient()

  useEffect(() => {
    loadQuiz()
  }, [])

  const loadQuiz = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Get user's fitness goal
      const { data: goalData } = await supabase
        .from('fitness_goals')
        .select('goal_type')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (!goalData) return

      // Get quiz stats
      const { data: responses } = await supabase
        .from('quiz_responses')
        .select('is_correct')
        .eq('user_id', user.id)

      if (responses) {
        setStats({
          total: responses.length,
          correct: responses.filter((r) => r.is_correct).length,
        })
      }

      // Check if user has completed a quiz today
      const today = new Date().toISOString().split('T')[0]
      const { data: todayQuiz } = await supabase
        .from('quiz_responses')
        .select('completed_at')
        .eq('user_id', user.id)
        .gte('completed_at', today)
        .limit(1)

      if (todayQuiz && todayQuiz.length > 0) {
        setCompletedToday(true)
        setLoading(false)
        return
      }

      // Get all quizzes for user's goal
      const { data: allQuizzes } = await supabase
        .from('quizzes')
        .select('id')
        .eq('goal_type', goalData.goal_type)

      if (!allQuizzes || allQuizzes.length === 0) return

      // Get quizzes the user has already answered
      const { data: answeredQuizzes } = await supabase
        .from('quiz_responses')
        .select('quiz_id')
        .eq('user_id', user.id)

      const answeredIds = answeredQuizzes?.map((q) => q.quiz_id) || []

      // Find an unanswered quiz
      const unansweredIds = allQuizzes
        .filter((q) => !answeredIds.includes(q.id))
        .map((q) => q.id)

      let quizId: string

      if (unansweredIds.length > 0) {
        // Pick a random unanswered quiz
        quizId = unansweredIds[Math.floor(Math.random() * unansweredIds.length)]
      } else {
        // All quizzes answered, pick a random one
        quizId = allQuizzes[Math.floor(Math.random() * allQuizzes.length)].id
      }

      // Load the selected quiz
      const { data: quizData } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single()

      if (quizData) {
        setQuiz(quizData)
      }
    } catch (error) {
      console.error('Error loading quiz:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedAnswer || !quiz) return

    const correct = selectedAnswer === quiz.correct_answer
    setIsCorrect(correct)
    setSubmitted(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Save quiz response
      await supabase.from('quiz_responses').upsert({
        user_id: user.id,
        quiz_id: quiz.id,
        user_answer: selectedAnswer,
        is_correct: correct,
      })
    } catch (error) {
      console.error('Error saving quiz response:', error)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-primary-blue">Loading quiz...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (completedToday) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-10 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-sm">
              🎉
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Great job today!
            </h2>
            <p className="text-gray-700 mb-8 text-lg">
              You&apos;ve completed today&apos;s quiz. Keep up the amazing work and come back tomorrow!
            </p>
            <div className="bg-white p-8 rounded-2xl shadow-sm max-w-sm mx-auto">
              <div className="text-sm text-gray-500 mb-2">Your Overall Accuracy</div>
              <div className="text-5xl font-bold text-primary-blue mb-2">
                {stats.total > 0
                  ? Math.round((stats.correct / stats.total) * 100)
                  : 0}%
              </div>
              <div className="text-sm text-gray-600">
                {stats.correct} out of {stats.total} quizzes correct
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!quiz) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-gray-600">No quiz available</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Today&apos;s Knowledge Check 🧠</h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="inline-block bg-white px-3 py-1 rounded-full text-gray-700 capitalize">
              {quiz.difficulty}
            </span>
            {stats.total > 0 && (
              <span className="text-gray-600">
                Your accuracy: {Math.round((stats.correct / stats.total) * 100)}%
              </span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {quiz.question}
          </h2>

          <div className="space-y-3 mb-8">
            {Object.entries(quiz.options).map(([key, value]) => (
              <button
                key={key}
                onClick={() => !submitted && setSelectedAnswer(key)}
                disabled={submitted}
                className={`w-full p-5 text-left rounded-2xl border-2 transition-all ${
                  submitted
                    ? key === quiz.correct_answer
                      ? 'border-green-400 bg-green-50 shadow-sm'
                      : key === selectedAnswer
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                    : selectedAnswer === key
                    ? 'border-primary-blue bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      submitted
                        ? key === quiz.correct_answer
                          ? 'bg-green-500 text-white'
                          : key === selectedAnswer
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                        : selectedAnswer === key
                        ? 'bg-primary-blue text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {submitted && key === quiz.correct_answer ? '✓' : key}
                  </div>
                  <div className="font-medium text-gray-900">{value}</div>
                </div>
              </button>
            ))}
          </div>

          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className="w-full bg-primary-blue hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Check My Answer
            </button>
          ) : (
            <div className="space-y-4">
              <div
                className={`p-6 rounded-2xl ${
                  isCorrect ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200' : 'bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                    isCorrect ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {isCorrect ? '✓' : '✗'}
                  </div>
                  <div className="font-bold text-lg text-gray-900">
                    {isCorrect ? 'You got it right!' : 'Not quite, but great try!'}
                  </div>
                </div>
                <div className="text-gray-700 leading-relaxed pl-15">{quiz.explanation}</div>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-900 font-semibold py-4 px-6 rounded-full transition-colors"
              >
                Done for Today
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
