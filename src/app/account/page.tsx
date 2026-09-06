'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';
import { UserDataStore } from '@/lib/storage/userDataStore';

type Message = { type: 'error' | 'success'; text: string } | null;

async function syncProfile(user: User) {
  if (!supabase) return;

  const localProfile = UserDataStore.getProfile();
  const { data: cloudProfile } = await supabase
    .from('profiles')
    .select('username, xp, level, streak_days, last_active_date, unlocked_badges, total_answered, total_correct')
    .eq('id', user.id)
    .maybeSingle();

  if (cloudProfile) {
    UserDataStore.saveProfile({
      ...localProfile,
      id: user.id,
      username: cloudProfile.username || localProfile.username,
      xp: cloudProfile.xp,
      level: cloudProfile.level,
      streakDays: cloudProfile.streak_days,
      lastActiveDate: cloudProfile.last_active_date,
      unlockedBadgeIds: cloudProfile.unlocked_badges || [],
      totalAnswered: cloudProfile.total_answered,
      totalCorrect: cloudProfile.total_correct,
      isGuest: false,
    });
    return;
  }

  const metadataName = user.user_metadata?.full_name || user.user_metadata?.name;
  const username = String(metadataName || localProfile.username || '探求者').slice(0, 30);
  const { error } = await supabase.from('profiles').insert({
    id: user.id,
    username,
    xp: localProfile.xp,
    level: localProfile.level,
    streak_days: localProfile.streakDays,
    last_active_date: localProfile.lastActiveDate,
    unlocked_badges: localProfile.unlockedBadgeIds,
    total_answered: localProfile.totalAnswered,
    total_correct: localProfile.totalCorrect,
  });

  if (!error) {
    UserDataStore.saveProfile({ ...localProfile, id: user.id, username, isGuest: false });
  }
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  useEffect(() => {
    if (!supabase) return;

    let mounted = true;
    void supabase.auth.getUser().then(({ data, error }) => {
      if (!mounted || error || !data.user) return;
      setUser(data.user);
      void syncProfile(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      const nextUser = session?.user || null;
      setUser(nextUser);
      if (nextUser) void syncProfile(nextUser);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
    if (!supabase) return;
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/account/`,
      },
    });

    if (error) {
      setLoading(false);
      setMessage({ type: 'error', text: `Googleログインに失敗しました：${error.message}` });
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (error) {
      setMessage({ type: 'error', text: `ログアウトに失敗しました：${error.message}` });
      return;
    }
    setUser(null);
    setMessage({ type: 'success', text: 'ログアウトしました。' });
  };

  return (
    <main className="max-w-2xl mx-auto px-3 py-8 text-sm text-gray-900">
      <div className="border-b border-gray-300 pb-3 mb-5">
        <span className="text-[11px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-xs border border-gray-300">
          会員登録・ログイン
        </span>
        <h1 className="text-2xl font-black mt-2">学習記録を保存する</h1>
        <p className="text-xs text-gray-500 mt-1">
          Googleアカウントでログインすると、学習記録をアカウントに紐付けられます。
        </p>
      </div>

      {!isSupabaseConfigured ? (
        <section className="bg-amber-50 border border-amber-300 p-5 rounded-xs space-y-2">
          <h2 className="font-bold">現在は準備中です</h2>
          <p className="text-xs text-gray-700">
            管理者による認証設定が完了すると、Googleログインを利用できます。
          </p>
        </section>
      ) : user ? (
        <section className="bg-white border border-gray-300 p-5 rounded-xs space-y-4">
          <div>
            <p className="font-bold">ログイン中</p>
            <p className="text-xs text-gray-600 mt-1 break-all">{user.email}</p>
          </div>
          <p className="text-xs text-gray-600">
            このアカウントで、今後ランキングや複数端末での学習記録同期を利用できるようにします。
          </p>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xs font-bold text-xs disabled:opacity-50"
          >
            {loading ? '処理中…' : 'ログアウト'}
          </button>
        </section>
      ) : (
        <section className="bg-white border border-gray-300 p-5 rounded-xs space-y-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full px-4 py-3 bg-white hover:bg-gray-50 border border-gray-400 rounded-xs font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span className="text-blue-600 font-black text-lg leading-none">G</span>
            {loading ? 'Googleへ移動中…' : 'Googleでログイン・会員登録'}
          </button>
          <p className="text-[11px] text-gray-500 text-center">
            初回ログイン時に会員登録も完了します。表示名は後から変更できるようにする予定です。
          </p>
        </section>
      )}

      {message && (
        <p className={`mt-4 p-3 text-xs border rounded-xs ${message.type === 'error' ? 'bg-red-50 border-red-300 text-red-700' : 'bg-green-50 border-green-300 text-green-700'}`}>
          {message.text}
        </p>
      )}

      <p className="text-[11px] text-gray-500 mt-5">
        アカウント情報の取り扱いは、<Link href="/privacy" className="underline hover:text-red-600">プライバシーポリシー</Link>をご確認ください。
      </p>
    </main>
  );
}
