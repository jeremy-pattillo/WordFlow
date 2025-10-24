import { createClient } from '@/lib/supabase/client'

export async function updateStreak(userId: string) {
  const supabase = createClient()

  // Get current date in Mountain Time
  const now = new Date()
  const mountainTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Denver' }))
  const today = mountainTime.toISOString().split('T')[0]

  // Get or create streak
  const { data: streak } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!streak) {
    // Create new streak
    await supabase.from('streaks').insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: today,
    })
    return { isNewStreak: true, currentStreak: 1, increased: true }
  }

  const lastActivityDate = new Date(streak.last_activity_date)
  const todayDate = new Date(today)

  // Calculate day difference
  const diffTime = todayDate.getTime() - lastActivityDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  let newStreak = streak.current_streak
  let increased = false

  if (diffDays === 0) {
    // Same day - no change
    return { isNewStreak: false, currentStreak: newStreak, increased: false }
  } else if (diffDays === 1) {
    // Consecutive day - increment
    newStreak += 1
    increased = true
  } else {
    // Missed days - reset to 1
    newStreak = 1
    increased = false
  }

  // Update streak
  await supabase
    .from('streaks')
    .update({
      current_streak: newStreak,
      longest_streak: Math.max(newStreak, streak.longest_streak),
      last_activity_date: today,
    })
    .eq('user_id', userId)

  return { isNewStreak: false, currentStreak: newStreak, increased }
}
