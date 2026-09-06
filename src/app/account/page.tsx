'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';
import { UserDataStore } from '@/lib/storage/userDataStore';

type Message = { type: 'error' | 'success'; text: string } | null;

const GOOGLE_CLIENT_ID = '886799927016-5dmvu2ukjgam8srp62tv92nbj9nv10um.apps.googleusercontent.com';

type GoogleCredentialResponse = { credential: string };
type GoogleAccountsId = {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    ux_mode?: 'popup' | 'redirect';
    use_fedcm_for_button?: boolean;
    button_auto_select?: boolean;
  }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, string | number>) => void;
  prompt: (callback?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
};

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleAccountsId } };
  }
}

async function syncProfile(user: User): Promise<string> {
  if (!supabase) return '探求者';

  const localProfile = UserDataStore.getProfile();
  const { data: cloudProfile } = await supabase
    .from('profiles')
    .select('username, xp, level, streak_days, last_active_date, unlocked_badges, total_answered, total_correct')
    .eq('id', user.id)
    .maybeSingle();

  if (cloudProfile) {
    const username = cloudProfile.username || '探求者';
    UserDataStore.saveProfile({
      ...localProfile,
      id: user.id,
      username,
      xp: cloudProfile.xp,
      level: cloudProfile.level,
      streakDays: cloudProfile.streak_days,
      lastActiveDate: cloudProfile.last_active_date,
      unlockedBadgeIds: cloudProfile.unlocked_badges || [],
      totalAnswered: cloudProfile.total_answered,
      totalCorrect: cloudProfile.total_correct,
      isGuest: false,
    });
    return username;
  }

  const username = '探求者';
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
  return username;
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState('');
  const [showNicknameForm, setShowNicknameForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingNickname, setSavingNickname] = useState(false);
  const [message, setMessage] = useState<Message>(null);
  const [showGoogleFallback, setShowGoogleFallback] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!supabase) return;

    let mounted = true;
    void supabase.auth.getUser().then(({ data, error }) => {
      if (!mounted || error || !data.user) return;
      setUser(data.user);
      void syncProfile(data.user).then((username) => {
        if (!mounted) return;
        setNickname(username === '探求者' ? '' : username);
        setShowNicknameForm(username === '探求者');
      });
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      const nextUser = session?.user || null;
      setUser(nextUser);
      if (nextUser) {
        void syncProfile(nextUser).then((username) => {
          if (!mounted) return;
          setNickname(username === '探求者' ? '' : username);
          setShowNicknameForm(username === '探求者');
        });
      } else {
        setNickname('');
        setShowNicknameForm(false);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleGoogleCredential = async (response: GoogleCredentialResponse) => {
    if (!supabase || !response.credential) return;
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: response.credential,
    });

    setLoading(false);
    if (error) {
      setMessage({ type: 'error', text: `Googleログインに失敗しました：${error.message}` });
    }
  };

  const handleGooglePrompt = () => {
    const googleId = window.google?.accounts?.id;
    if (!googleId) {
      void handleGoogleLogin();
      return;
    }

    setLoading(true);
    setMessage(null);
    googleId.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        setLoading(false);
        setShowGoogleFallback(true);
        setMessage({ type: 'error', text: '自動起動できないため、Google公式ボタンを表示しました。' });
      }
    });
  };

  const initializeGoogleButton = () => {
    const googleId = window.google?.accounts?.id;
    const button = googleButtonRef.current;
    if (!googleId || !button || !supabase) return;

    button.replaceChildren();
    googleId.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
      ux_mode: 'popup',
      use_fedcm_for_button: false,
      button_auto_select: false,
    });
    googleId.renderButton(button, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      width: 400,
      logo_alignment: 'left',
    });
  };

  const handleGoogleLogin = async () => {
    if (!supabase) return;
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/account/`,
        scopes: 'openid',
      },
    });

    if (error) {
      setLoading(false);
      setMessage({ type: 'error', text: `Googleログインに失敗しました：${error.message}` });
    }
  };

  const handleSaveNickname = async () => {
    if (!supabase || !user) return;
    const trimmed = nickname.trim();
    if (!trimmed || Array.from(trimmed).length > 20) {
      setMessage({ type: 'error', text: 'ニックネームは1〜20文字で入力してください。' });
      return;
    }

    setSavingNickname(true);
    setMessage(null);
    const { error } = await supabase
      .from('profiles')
      .update({ username: trimmed })
      .eq('id', user.id);
    setSavingNickname(false);

    if (error) {
      setMessage({ type: 'error', text: `ニックネームの保存に失敗しました：${error.message}` });
      return;
    }

    const localProfile = UserDataStore.getProfile();
    UserDataStore.saveProfile({ ...localProfile, id: user.id, username: trimmed, isGuest: false });
    setNickname(trimmed);
    setShowNicknameForm(false);
    setMessage({ type: 'success', text: 'ランキング用ニックネームを保存しました。' });
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
          {showNicknameForm ? (
            <div className="border border-red-200 bg-red-50 p-4 rounded-xs space-y-3">
              <div>
                <h2 className="font-bold text-sm">ランキング用ニックネームを設定</h2>
                <p className="text-[11px] text-gray-600 mt-1">
                  Googleアカウント名は公開せず、ここで設定した名前だけをランキングに表示します。
                </p>
              </div>
              <input
                type="text"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                maxLength={20}
                placeholder="例：倫理マスター"
                className="w-full px-3 py-2 border border-gray-300 rounded-xs bg-white text-sm outline-none focus:border-red-500"
              />
              <button
                type="button"
                onClick={handleSaveNickname}
                disabled={savingNickname}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xs font-bold text-xs disabled:opacity-50"
              >
                {savingNickname ? '保存中…' : 'ニックネームを保存'}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xs">
              <p className="text-xs text-gray-700">
                ランキング名：<span className="font-bold">{nickname}</span>
              </p>
              <button
                type="button"
                onClick={() => setShowNicknameForm(true)}
                className="text-[11px] text-red-600 underline whitespace-nowrap"
              >
                変更
              </button>
            </div>
          )}
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
          <Script
            src="https://accounts.google.com/gsi/client"
            strategy="afterInteractive"
            onLoad={initializeGoogleButton}
          />
          <div
            ref={googleButtonRef}
            className={showGoogleFallback ? 'flex min-h-11 justify-center' : 'hidden'}
            aria-hidden={!showGoogleFallback}
          />
          <button
            type="button"
            onClick={handleGooglePrompt}
            disabled={loading}
            className="w-full px-4 py-3 bg-white hover:bg-gray-50 border border-gray-400 rounded-xs font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span className="text-blue-600 font-black text-lg leading-none">G</span>
            {loading ? 'Googleへ接続中…' : 'Googleでログイン・会員登録'}
          </button>
          <p className="text-[11px] text-gray-500 text-center">
            初回ログイン時に会員登録が完了し、ランキング用ニックネームを設定できます。
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
