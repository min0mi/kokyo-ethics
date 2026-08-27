'use client';

import React, { useState, useEffect } from 'react';
import { UserDataStore } from '@/lib/storage/userDataStore';
import { UserProfile } from '@/types';
import { AdBanner } from '@/components/ads/AdBanner';

interface LeaderboardUser {
  rank: number;
  username: string;
  xp: number;
  level: number;
  streakDays: number;
  totalCorrect: number;
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
    window.dispatchEvent(new Event('user_profile_updated'));
  };

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

  const userXp = profile?.xp || 0;
  const userRank = mockLeaderboard.filter((u) => u.xp > userXp).length + 1;

  return (
    <div className="max-w-4xl mx-auto px-3 py-5 space-y-4">
      {/* ページヘッダー */}
      <div className="border-b border-gray-300 pb-2">
        <span className="text-[11px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-xs border border-gray-300">
          全国ランキング
        </span>
        <h1 className="text-xl font-bold text-gray-900 mt-1">
          全国 思想マスターランキング
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          累計獲得XPによる全国学習者の順位表です。（毎時自動集計）
        </p>
      </div>

      {/* 自分のステータス */}
      {profile && (
        <div className="bg-white border-2 border-blue-600 p-4 rounded-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-700 text-white font-black text-sm flex items-center justify-center rounded-xs shrink-0">
              #{userRank}
            </div>

            <div className="space-y-0.5">
              {!isEditingName ? (
                <div className="flex items-center gap-2">
                  <strong className="text-sm text-gray-900">{profile.username}</strong>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-[11px] text-blue-700 hover:underline font-bold"
                  >
                    [名前変更]
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveName} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    maxLength={15}
                    className="px-2 py-0.5 border border-gray-300 rounded-xs text-xs font-bold"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-2 py-0.5 bg-blue-600 text-white rounded-xs font-bold text-[11px]"
                  >
                    保存
                  </button>
                </form>
              )}

              <div className="text-gray-600 space-x-2">
                <span>Lv.{profile.level}</span>
                <span>|</span>
                <span>連続 {profile.streakDays}日</span>
                <span>|</span>
                <span>正答 {profile.totalCorrect}問</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 border border-gray-300 px-3 py-1.5 rounded-xs text-right">
            <span className="text-[10px] text-gray-500 block">TOTAL XP</span>
            <span className="text-base font-black text-blue-700">{profile.xp} XP</span>
          </div>
        </div>
      )}

      {/* 広告枠 */}
      <AdBanner label="Ranking Sponsor" />

      {/* ランキング表 */}
      <div className="bg-white border border-gray-300 rounded-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 text-gray-700 text-[11px]">
              <th className="py-2 px-3 font-bold w-14 text-center">順位</th>
              <th className="py-2 px-3 font-bold">ユーザー名</th>
              <th className="py-2 px-3 font-bold w-20 text-center">レベル</th>
              <th className="py-2 px-3 font-bold w-24 text-center">連続日数</th>
              <th className="py-2 px-3 font-bold w-28 text-right">獲得XP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockLeaderboard.map((user) => (
              <tr key={user.rank} className="hover:bg-blue-50/50">
                <td className="py-2.5 px-3 text-center font-bold">
                  <span
                    className={`inline-block w-5 h-5 leading-5 rounded-xs text-[11px] ${
                      user.rank === 1
                        ? 'bg-yellow-400 text-black font-black'
                        : user.rank === 2
                        ? 'bg-gray-300 text-black font-bold'
                        : user.rank === 3
                        ? 'bg-amber-700 text-white font-bold'
                        : 'text-gray-600'
                    }`}
                  >
                    {user.rank}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-bold text-gray-800">
                  {user.username}
                </td>
                <td className="py-2.5 px-3 text-center text-gray-600">
                  Lv.{user.level}
                </td>
                <td className="py-2.5 px-3 text-center text-orange-700 font-semibold">
                  {user.streakDays}日
                </td>
                <td className="py-2.5 px-3 text-right font-black text-blue-700">
                  {user.xp} XP
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
