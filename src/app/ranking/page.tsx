'use client';

import React, { useState, useEffect } from 'react';
import { UserDataStore } from '@/lib/storage/userDataStore';
import { UserProfile } from '@/types';
import { Trophy, Flame, Zap, Edit2, Check } from 'lucide-react';
import { AdBanner } from '@/components/ads/AdBanner';

interface LeaderboardUser {
  rank: number;
  username: string;
  xp: number;
  level: number;
  streakDays: number;
  totalCorrect: number;
  isCurrentUser?: boolean;
}

export default function RankingPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    const p = UserDataStore.getProfile();
    setProfile(p);
    setNewName(p.username);
  }, []);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const updated = UserDataStore.updateUsername(newName);
    setProfile(updated);
    setIsEditingName(false);
    // ヘッダーへ通知
    window.dispatchEvent(new Event('user_profile_updated'));
  };

  // 上位ダミーランキングデータ（Supabase接続時はDBからリアルタイム取得）
  const mockLeaderboard: LeaderboardUser[] = [
    { rank: 1, username: 'ソクラテスの弟子', xp: 4850, level: 10, streakDays: 24, totalCorrect: 420 },
    { rank: 2, username: 'イデア探求者', xp: 4120, level: 9, streakDays: 18, totalCorrect: 380 },
    { rank: 3, username: 'カントの散歩道', xp: 3740, level: 8, streakDays: 15, totalCorrect: 340 },
    { rank: 4, username: '超人ニーチェ', xp: 3200, level: 8, streakDays: 12, totalCorrect: 290 },
    { rank: 5, username: '実存サルトル', xp: 2850, level: 7, streakDays: 9, totalCorrect: 260 },
    { rank: 6, username: '功利主義マスター', xp: 2400, level: 7, streakDays: 8, totalCorrect: 220 },
    { rank: 7, username: 'タブララサ', xp: 1950, level: 6, streakDays: 7, totalCorrect: 180 },
    { rank: 8, username: '共テ満点目標', xp: 1600, level: 5, streakDays: 5, totalCorrect: 150 },
  ];

  // 自分の順位（暫定算出）
  const userXp = profile?.xp || 0;
  const userRank =
    mockLeaderboard.filter((u) => u.xp > userXp).length + 1;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* タイトル */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-600 mb-1">
          <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
          全国 思想マスターランキング
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          全国の共通テスト受験生・学習者と累計獲得XPを競い合おう！
        </p>
      </div>

      {/* 自分のステータス & ニックネーム編集 */}
      {profile && (
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-xl font-black text-amber-300">
              #{userRank}
            </div>

            <div className="space-y-1">
              {!isEditingName ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{profile.username}</span>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1 text-indigo-200 hover:text-white transition"
                    title="ニックネームを変更"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveName} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    maxLength={15}
                    className="px-3 py-1 bg-white/20 rounded-lg text-sm text-white font-bold placeholder-white/50 focus:outline-hidden focus:ring-2 focus:ring-amber-300"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="p-1.5 bg-amber-400 text-slate-950 rounded-lg font-bold hover:bg-amber-300 transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              <div className="flex items-center gap-3 text-xs text-indigo-200">
                <span>Lv.{profile.level}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
                  {profile.streakDays}日連続
                </span>
                <span>•</span>
                <span>正答 {profile.totalCorrect}問</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 px-5 py-3 rounded-2xl backdrop-blur-md border border-white/10">
            <Zap className="w-6 h-6 text-amber-300 fill-amber-300" />
            <div className="text-right">
              <span className="text-[10px] text-indigo-200 font-semibold block uppercase">Total XP</span>
              <span className="text-xl font-black text-amber-300">{profile.xp} XP</span>
            </div>
          </div>
        </div>
      )}

      {/* 広告枠 */}
      <AdBanner label="Ranking Sponsor" />

      {/* ランキング表 */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200/80 overflow-hidden">
        <div className="p-4 sm:p-6 bg-slate-50/50 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-800">TOP 思想求道者</h3>
          <span className="text-xs text-gray-400">毎時自動更新</span>
        </div>

        <div className="divide-y divide-gray-100">
          {mockLeaderboard.map((user) => {
            let rankColor = 'bg-gray-100 text-gray-600';
            if (user.rank === 1) rankColor = 'bg-amber-400 text-amber-950 shadow-md shadow-amber-200';
            if (user.rank === 2) rankColor = 'bg-slate-300 text-slate-900';
            if (user.rank === 3) rankColor = 'bg-amber-700 text-amber-50';

            return (
              <div
                key={user.rank}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${rankColor}`}
                  >
                    {user.rank}
                  </div>

                  <div>
                    <div className="font-bold text-sm text-gray-900 flex items-center gap-2">
                      <span>{user.username}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 font-bold rounded-md">
                        Lv.{user.level}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <span className="flex items-center gap-0.5">
                        <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                        {user.streakDays}日
                      </span>
                      <span>•</span>
                      <span>正解 {user.totalCorrect}問</span>
                    </div>
                  </div>
                </div>

                <div className="font-black text-sm text-indigo-600 flex items-center gap-1">
                  <Zap className="w-4 h-4 fill-indigo-600" />
                  <span>{user.xp} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

