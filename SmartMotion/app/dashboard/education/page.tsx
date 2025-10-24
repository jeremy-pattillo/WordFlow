import DashboardLayout from '@/components/DashboardLayout'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EducationPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Get user's fitness goal
  const { data: fitnessGoal } = await supabase
    .from('fitness_goals')
    .select('goal_type')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single() as { data: { goal_type: string } | null }

  if (!fitnessGoal) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Please set up your fitness goal first</p>
        </div>
      </DashboardLayout>
    )
  }

  // Get education content for user's goal
  const { data: educationContent } = await supabase
    .from('education_content')
    .select('*')
    .eq('goal_type', fitnessGoal.goal_type)
    .order('order_index', { ascending: true }) as { data: any[] | null }

  const goalLabels: Record<string, string> = {
    back_pain: 'Relieve Back Pain',
    functional_fitness: 'Functional Fitness',
    powerlifting: 'Powerlifting',
    run_faster: 'Run Faster',
    jump_higher: 'Jump Higher',
  }

  const contentTypeIcons: Record<string, string> = {
    article: '📄',
    video: '🎥',
    infographic: '📊',
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary-blue to-blue-500 p-8 rounded-3xl text-white">
          <h1 className="text-2xl font-bold mb-2">Learn & Grow 📚</h1>
          <p className="text-blue-100">
            {goalLabels[fitnessGoal.goal_type]} - Personalized content just for you
          </p>
        </div>

        {!educationContent || educationContent.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-5xl mb-4">📖</div>
            <p className="text-gray-600">No educational content available yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {educationContent.map((content, index) => (
              <div
                key={content.id}
                className="bg-white rounded-3xl shadow-sm p-8 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-6">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center text-3xl">
                      {contentTypeIcons[content.content_type]}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    {/* Meta */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-block bg-blue-100 text-primary-blue text-xs font-bold px-3 py-1 rounded-full">
                        Lesson {index + 1}
                      </span>
                      <span className="inline-block bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full capitalize">
                        {content.content_type}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {content.title}
                    </h2>

                    {/* Body */}
                    <div className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                      {content.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tip Card */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-100 rounded-3xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
              💡
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Keep Learning!</h3>
              <p className="text-gray-700 leading-relaxed">
                Complete your daily quiz to reinforce what you&apos;ve learned and track your progress. Small steps lead to big changes!
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
