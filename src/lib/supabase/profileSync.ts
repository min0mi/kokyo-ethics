import { UserProfile } from '@/types';
import { supabase } from '@/lib/supabase/client';

/**
 * ログイン中のユーザーのプロフィール統計をランキング用テーブルへ反映する。
 * 未設定・未ログイン時はローカル学習を妨げないよう何もしない。
 */
export async function syncProfileToCloud(profile: UserProfile): Promise<void> {
  if (!supabase || typeof window === 'undefined') return;

  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) return;

  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      username: profile.username.slice(0, 30) || '探求者',
      xp: profile.xp,
      level: profile.level,
      streak_days: profile.streakDays,
      last_active_date: profile.lastActiveDate,
      unlocked_badges: profile.unlockedBadgeIds,
      total_answered: profile.totalAnswered,
      total_correct: profile.totalCorrect,
    },
    { onConflict: 'id' }
  );

  if (error) {
    console.error('Failed to sync profile to Supabase:', error);
  }
}
