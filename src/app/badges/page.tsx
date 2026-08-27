'use client';

import React, { useState, useEffect } from 'react';
import { UserDataStore } from '@/lib/storage/userDataStore';
import { BADGES } from '@/data/badges';
import { UserProfile } from '@/types';
import { AdBanner } from '@/components/ads/AdBanner';

export default function BadgesPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    setProfile(UserDataStore.getProfile());
  }, []);

  const unlockedCount = profile?.unlockedBadgeIds.length || 0;
  const totalCount = BADGES.length;
  const progressRate = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="max-w-4xl mx-auto px-3 py-5 space-y-4">
      {/* ページヘッダー */}
      <div className="border-b border-gray-300 pb-2">
        <span className="text-[11px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-xs border border-gray-300">
          実績コレクション
        </span>
        <h1 className="text-xl font-bold text-gray-900 mt-1">
          バッジ獲得一覧
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          学習の継続日数や正答数に応じて解放される達成バッジです。（全{totalCount}種）
        </p>
      </div>

      {/* 進捗サマリー */}
      <div className="bg-white border border-gray-300 p-3.5 rounded-xs space-y-2 text-xs">
        <div className="flex justify-between items-center font-bold">
          <span className="text-gray-700">獲得進捗状況</span>
          <span className="text-blue-700">{unlockedCount} / {totalCount} 個 達成 ({progressRate}%)</span>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressRate}%` }}
          />
        </div>
      </div>

      {/* バッジ一覧グリッド */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
        {BADGES.map((badge) => {
          const isUnlocked = profile?.unlockedBadgeIds.includes(badge.id);

          return (
            <div
              key={badge.id}
              className={`p-3 rounded-xs border space-y-1.5 ${
                isUnlocked
                  ? 'bg-white border-yellow-400 shadow-2xs'
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className={`font-bold text-xs ${isUnlocked ? 'text-gray-900' : 'text-gray-400 font-normal italic'}`}>
                  {isUnlocked ? badge.name : 'Secret Badge'}
                </h3>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-xs ${
                    isUnlocked
                      ? 'bg-yellow-100 text-yellow-900 border border-yellow-300'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isUnlocked ? '[獲得済]' : '[ロック中]'}
                </span>
              </div>

              <p className="text-[11px] text-gray-600 leading-tight">
                {isUnlocked ? badge.description : '問題をたくさん解くか、連続学習することで獲得できます。'}
              </p>

              <div className="text-[10px] text-blue-700 font-semibold pt-1 border-t border-gray-100">
                報酬: +50 XP
              </div>
            </div>
          );
        })}
      </div>

      {/* 広告枠 */}
      <AdBanner label="Badges Sponsor" />
    </div>
  );
}
