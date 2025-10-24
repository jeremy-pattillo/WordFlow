'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { getStripe } from '@/lib/stripe/client'
import { useSearchParams } from 'next/navigation'

interface Profile {
  id: string
  email: string
  full_name: string | null
  is_premium: boolean
}

interface FitnessGoal {
  id: string
  goal_type: string
  experience_level: string
  sessions_per_week: number
  minutes_per_session: number
}

const GOAL_LABELS: Record<string, string> = {
  back_pain: 'Relieve Back Pain',
  functional_fitness: 'Functional Fitness',
  powerlifting: 'Powerlifting',
  run_faster: 'Run Faster',
  jump_higher: 'Jump Higher',
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal | null>(null)
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    loadProfile()

    // Check for donation success/cancel
    if (searchParams.get('success')) {
      alert('Thank you so much for your support! 💙 Your donation helps keep SmartMotion free for everyone.')
      window.history.replaceState({}, '', '/dashboard/profile')
    } else if (searchParams.get('canceled')) {
      alert('No worries! SmartMotion is always free to use.')
      window.history.replaceState({}, '', '/dashboard/profile')
    }
  }, [searchParams])

  const loadProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setFullName(profileData.full_name || '')
      }

      // Load fitness goal
      const { data: goalData } = await supabase
        .from('fitness_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (goalData) {
        setFitnessGoal(goalData)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id)

      if (error) throw error

      setProfile({ ...profile!, full_name: fullName })
      setEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleUpgradeToPremium = async () => {
    setUpgrading(true)
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const { sessionId, error } = await response.json()

      if (error) {
        alert(error)
        return
      }

      const stripe = await getStripe()
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId })
      }
    } catch (error) {
      console.error('Error creating checkout:', error)
      alert('Failed to start checkout')
    } finally {
      setUpgrading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-primary-blue">Loading profile...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-3xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account settings</p>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-primary-blue hover:underline text-sm font-medium"
              >
                Edit
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="text-gray-900">{profile?.email}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <div className="text-gray-900">{profile?.full_name || 'Not set'}</div>
              )}
            </div>

            {editing && (
              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => {
                    setEditing(false)
                    setFullName(profile?.full_name || '')
                  }}
                  className="flex-1 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProfile}
                  className="flex-1 bg-primary-blue hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-white rounded-3xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Support SmartMotion</h2>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                💙
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Enjoying SmartMotion?</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  SmartMotion is completely free to use! If you&apos;re finding value in your fitness journey, consider buying us a coffee. Your support helps us keep the app running and improving.
                </p>
              </div>
            </div>

            <button
              onClick={handleUpgradeToPremium}
              disabled={upgrading}
              className="w-full bg-primary-blue hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-full transition-all disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {upgrading ? 'Processing...' : '☕ Donate $1 - Support the App'}
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              100% optional • Secure payment via Stripe
            </p>
          </div>
        </div>

        {/* Fitness Goal */}
        {fitnessGoal && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Goal</h2>

            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600 mb-1">Goal</div>
                <div className="font-semibold text-gray-900">
                  {GOAL_LABELS[fitnessGoal.goal_type]}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Experience</div>
                  <div className="font-medium text-gray-900 capitalize">
                    {fitnessGoal.experience_level}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Sessions/Week</div>
                  <div className="font-medium text-gray-900">
                    {fitnessGoal.sessions_per_week}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Minutes/Session</div>
                  <div className="font-medium text-gray-900">
                    {fitnessGoal.minutes_per_session}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
