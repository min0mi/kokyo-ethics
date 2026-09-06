'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';
import { UserDataStore } from '@/lib/storage/userDataStore';
import { FIGURES } from '@/data/figures';
import { CATEGORIES } from '@/data/categories';

type Message = { type: 'error' | 'success'; text: string } | null;
type CloudProfile = { username: string; rankingVisible: boolean; favoriteFigureId: string };

const availableCategoryIds = new Set(
  CATEGORIES.filter((category) => category.isAvailable).map((category) => category.id)
);
const selectableFigures = FIGURES.filter((figure) => availableCategoryIds.has(figure.categoryId));
const figuresByCategory = CATEGORIES.filter((category) => category.isAvailable)
  .map((category) => ({
    category,
    figures: selectableFigures
      .filter((figure) => figure.categoryId === category.id)
      .sort((a, b) => a.name.localeCompare(b.name, 'ja')),
  }))
  .filter(({ figures }) => figures.length > 0);

async function syncProfile(user: User): Promise<CloudProfile> {
  if (!supabase) return { username: '探求者', rankingVisible: true, favoriteFigureId: '' };

  const localProfile = UserDataStore.getProfile();
  const { data: cloudProfile } = await supabase
    .from('profiles')
    .select('username, ranking_visible, favorite_figure_id, xp, level, streak_days, last_active_date, unlocked_badges, total_answered, total_correct')
    .eq('id', user.id)
    .maybeSingle();

  if (cloudProfile) {
    const username = cloudProfile.username || '探求者';
    UserDataStore.saveProfile({
      ...localProfile,
      id: user.id,
      username,
      favoriteFigureId: cloudProfile.favorite_figure_id || undefined,
      xp: cloudProfile.xp,
      level: cloudProfile.level,
      streakDays: cloudProfile.streak_days,
      lastActiveDate: cloudProfile.last_active_date,
      unlockedBadgeIds: cloudProfile.unlocked_badges || [],
      totalAnswered: cloudProfile.total_answered,
      totalCorrect: cloudProfile.total_correct,
      isGuest: false,
    });
    return {
      username,
      rankingVisible: cloudProfile.ranking_visible !== false,
      favoriteFigureId: cloudProfile.favorite_figure_id || '',
    };
  }

  const username = '探求者';
  const { error } = await supabase.from('profiles').insert({
    id: user.id,
    username,
    favorite_figure_id: localProfile.favoriteFigureId || null,
    ranking_visible: true,
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
  return { username, rankingVisible: true, favoriteFigureId: localProfile.favoriteFigureId || '' };
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState('');
  const [showNicknameForm, setShowNicknameForm] = useState(false);
  const [rankingVisible, setRankingVisible] = useState(true);
  const [favoriteFigureId, setFavoriteFigureId] = useState('');
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingNickname, setSavingNickname] = useState(false);
  const [savingRankingVisibility, setSavingRankingVisibility] = useState(false);
  const [savingFavoriteFigure, setSavingFavoriteFigure] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [message, setMessage] = useState<Message>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    let mounted = true;
    void supabase.auth.getUser().then(({ data, error }) => {
      if (!mounted || error || !data.user) return;
      setUser(data.user);
      void syncProfile(data.user).then(({ username, rankingVisible: visible, favoriteFigureId: favoriteId }) => {
        if (!mounted) return;
        setNickname(username === '探求者' ? '' : username);
        setShowNicknameForm(username === '探求者');
        setRankingVisible(visible);
        setFavoriteFigureId(favoriteId);
      });
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'PASSWORD_RECOVERY') setIsRecoveryMode(true);
      const nextUser = session?.user || null;
      setUser(nextUser);
      if (nextUser) {
        void syncProfile(nextUser).then(({ username, rankingVisible: visible, favoriteFigureId: favoriteId }) => {
          if (!mounted) return;
          setNickname(username === '探求者' ? '' : username);
          setShowNicknameForm(username === '探求者');
          setRankingVisible(visible);
          setFavoriteFigureId(favoriteId);
        });
      } else {
        setNickname('');
        setShowNicknameForm(false);
        setRankingVisible(true);
        setFavoriteFigureId('');
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleEmailAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    if (!supabase) return;
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setMessage({ type: 'error', text: 'メールアドレスを正しく入力してください。' });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'パスワードは6文字以上で入力してください。' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const result = isSignUp
      ? await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: { emailRedirectTo: `${window.location.origin}/account/` },
        })
      : await supabase.auth.signInWithPassword({ email: trimmedEmail, password });

    setLoading(false);
    if (result.error) {
      setMessage({ type: 'error', text: `${isSignUp ? '会員登録' : 'ログイン'}に失敗しました：${result.error.message}` });
      return;
    }
    if (isSignUp && !result.data.session) {
      setMessage({ type: 'success', text: '確認メールを送信しました。メール内のリンクを開いて登録を完了してください。' });
      setPassword('');
      return;
    }
    setMessage({ type: 'success', text: 'ログインしました。' });
  };


  const handlePasswordReset = async () => {
    if (!supabase) return;
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setMessage({ type: 'error', text: 'パスワード再設定に使うメールアドレスを入力してください。' });
      return;
    }
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: window.location.origin + '/account/',
    });
    setLoading(false);
    if (error) {
      setMessage({ type: 'error', text: '再設定メールの送信に失敗しました：' + error.message });
      return;
    }
    setMessage({ type: 'success', text: 'パスワード再設定用のメールを送信しました。' });
  };

  const handlePasswordUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    if (!supabase) return;
    event.preventDefault();
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: '新しいパスワードは6文字以上で入力してください。' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setMessage({ type: 'error', text: '新しいパスワードが一致していません。' });
      return;
    }
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      setMessage({ type: 'error', text: 'パスワードの変更に失敗しました：' + error.message });
      return;
    }
    setNewPassword('');
    setConfirmNewPassword('');
    setIsRecoveryMode(false);
    setMessage({ type: 'success', text: 'パスワードを変更しました。' });
  };

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


  const handleSaveRankingVisibility = async () => {
    if (!supabase || !user) return;
    setSavingRankingVisibility(true);
    setMessage(null);
    const { error } = await supabase
      .from('profiles')
      .update({ ranking_visible: rankingVisible })
      .eq('id', user.id);
    setSavingRankingVisibility(false);
    if (error) {
      setMessage({ type: 'error', text: 'ランキング設定の保存に失敗しました：' + error.message });
      return;
    }
    setMessage({ type: 'success', text: rankingVisible ? 'ランキングへの参加を有効にしました。' : 'ランキングから非表示にしました。' });
  };

  const handleSaveFavoriteFigure = async () => {
    if (!supabase || !user) return;
    if (favoriteFigureId && !selectableFigures.some((figure) => figure.id === favoriteFigureId)) {
      setMessage({ type: 'error', text: '一覧から思想家を選択してください。' });
      return;
    }

    setSavingFavoriteFigure(true);
    setMessage(null);
    const { error } = await supabase
      .from('profiles')
      .update({ favorite_figure_id: favoriteFigureId || null })
      .eq('id', user.id);
    setSavingFavoriteFigure(false);

    if (error) {
      setMessage({ type: 'error', text: '好きな思想家の保存に失敗しました：' + error.message });
      return;
    }

    const localProfile = UserDataStore.getProfile();
    UserDataStore.saveProfile({
      ...localProfile,
      id: user.id,
      favoriteFigureId: favoriteFigureId || undefined,
      isGuest: false,
    });
    setMessage({
      type: 'success',
      text: favoriteFigureId ? '好きな思想家を保存しました。' : '好きな思想家の設定を解除しました。',
    });
  };

  const handleDeleteAccount = async () => {
    if (!supabase || !user) return;
    const confirmed = window.confirm('アカウントと学習記録を削除します。この操作は元に戻せません。続行しますか？');
    if (!confirmed) return;
    setDeletingAccount(true);
    setMessage(null);
    const { error } = await supabase.rpc('delete_my_account');
    setDeletingAccount(false);
    if (error) {
      setMessage({ type: 'error', text: '退会処理に失敗しました：' + error.message });
      return;
    }
    await supabase.auth.signOut();
    localStorage.removeItem('kokyo_user_profile');
    localStorage.removeItem('kokyo_user_progress_map');
    setUser(null);
    setNickname('');
    setFavoriteFigureId('');
    setShowNicknameForm(false);
    setMessage({ type: 'success', text: 'アカウントと学習記録を削除しました。' });
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
    setFavoriteFigureId('');
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
          メールアドレスまたはGoogleで登録すると、学習記録をアカウントに紐付けられます。
        </p>
      </div>

      {!isSupabaseConfigured ? (
        <section className="bg-amber-50 border border-amber-300 p-5 rounded-xs space-y-2">
          <h2 className="font-bold">現在は準備中です</h2>
          <p className="text-xs text-gray-700">
            管理者による認証設定が完了すると、会員登録を利用できます。
          </p>
        </section>
      ) : isRecoveryMode ? (
        <section className="bg-white border border-gray-300 p-5 rounded-xs space-y-4">
          <div>
            <h2 className="font-bold">新しいパスワードを設定</h2>
            <p className="text-xs text-gray-600 mt-1">新しいパスワードを入力して、変更を確定してください。</p>
          </div>
          <form onSubmit={handlePasswordUpdate} className="space-y-3">
            <label className="block text-xs font-bold">
              新しいパスワード（6文字以上）
              <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" minLength={6} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xs bg-white text-sm outline-none focus:border-red-500" />
            </label>
            <label className="block text-xs font-bold">
              新しいパスワード（確認）
              <input type="password" value={confirmNewPassword} onChange={(event) => setConfirmNewPassword(event.target.value)} autoComplete="new-password" minLength={6} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xs bg-white text-sm outline-none focus:border-red-500" />
            </label>
            <button type="submit" disabled={loading} className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xs font-bold text-sm disabled:opacity-50">
              {loading ? '変更中…' : 'パスワードを変更'}
            </button>
          </form>
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
                  メールアドレスは公開せず、ここで設定した名前だけをランキングに表示します。
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
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div>
              <h2 className="font-bold text-sm">好きな思想家</h2>
              <p className="text-[11px] text-gray-600 mt-1">
                任意で1人選べます。ランキング参加中はニックネームの下に表示されます。
              </p>
            </div>
            <select
              value={favoriteFigureId}
              onChange={(event) => setFavoriteFigureId(event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xs bg-white text-sm outline-none focus:border-red-500"
            >
              <option value="">選択しない</option>
              {figuresByCategory.map(({ category, figures }) => (
                <optgroup key={category.id} label={category.name}>
                  {figures.map((figure) => (
                    <option key={figure.id} value={figure.id}>
                      {figure.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <button
              type="button"
              onClick={handleSaveFavoriteFigure}
              disabled={savingFavoriteFigure}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xs font-bold text-xs disabled:opacity-50"
            >
              {savingFavoriteFigure ? '保存中…' : '好きな思想家を保存'}
            </button>
          </div>
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div>
              <h2 className="font-bold text-sm">ランキング設定</h2>
              <p className="text-[11px] text-gray-600 mt-1">OFFにすると、全国ランキングからあなたの名前と成績を非表示にします。</p>
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-700">
              <input type="checkbox" checked={rankingVisible} onChange={(event) => setRankingVisible(event.target.checked)} className="h-4 w-4 accent-red-600" />
              全国ランキングに参加する
            </label>
            <button type="button" onClick={handleSaveRankingVisibility} disabled={savingRankingVisibility} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xs font-bold text-xs disabled:opacity-50">
              {savingRankingVisibility ? '保存中…' : 'ランキング設定を保存'}
            </button>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xs font-bold text-xs disabled:opacity-50"
          >
            {loading ? '処理中…' : 'ログアウト'}
          </button>
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={deletingAccount}
            className="block text-[11px] text-red-700 underline disabled:opacity-50"
          >
            {deletingAccount ? '退会処理中…' : '退会してデータを削除'}
          </button>
        </section>
      ) : (
        <section className="bg-white border border-gray-300 p-5 rounded-xs space-y-4">
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setMessage(null); }}
              className={`flex-1 pb-2 text-xs font-bold ${!isSignUp ? 'border-b-2 border-red-600 text-red-700' : 'text-gray-500'}`}
            >
              ログイン
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setMessage(null); }}
              className={`flex-1 pb-2 text-xs font-bold ${isSignUp ? 'border-b-2 border-red-600 text-red-700' : 'text-gray-500'}`}
            >
              新規登録
            </button>
          </div>
          <form onSubmit={handleEmailAuth} className="space-y-3">
            <label className="block text-xs font-bold">
              メールアドレス
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="example@email.com"
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xs bg-white text-sm outline-none focus:border-red-500"
              />
            </label>
            <label className="block text-xs font-bold">
              パスワード（6文字以上）
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
                minLength={6}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xs bg-white text-sm outline-none focus:border-red-500"
              />
            </label>
            {!isSignUp && (
              <button type="button" onClick={handlePasswordReset} disabled={loading} className="text-[11px] text-red-700 underline disabled:opacity-50">
                パスワードを忘れた場合はこちら
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xs font-bold text-sm disabled:opacity-50"
            >
              {loading ? '処理中…' : isSignUp ? 'メールアドレスで新規登録' : 'メールアドレスでログイン'}
            </button>
          </form>
          <p className="text-[11px] text-gray-500 text-center">
            初回登録後に、ランキング用ニックネームを設定できます。
          </p>
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <span className="h-px flex-1 bg-gray-200" />
            <span>または</span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>
          <button
            type="button"
            onClick={() => void handleGoogleLogin()}
            disabled={loading}
            className="w-full px-4 py-3 bg-white hover:bg-gray-50 border border-gray-400 rounded-xs font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span className="text-blue-600 font-black text-lg leading-none">G</span>
            {loading ? 'Googleへ接続中…' : 'Googleで続ける'}
          </button>
          <p className="text-[11px] text-gray-500 text-center">
            メールアドレスが確認済みの場合、既存のアカウントに自動で紐づきます。
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
