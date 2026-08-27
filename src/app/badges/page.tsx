'use client';

import React, { useState, useEffect } from 'react';
import { BADGES } from '@/data/badges';
import { UserDataStore } from '@/lib/storage/userDataStore';
import { UserProfile } from '@/types';
import {
  Award,
  Lock,
  Sparkles,
  CheckCircle2,
  Flame,
  Zap,
  BookOpen,
  Trophy,
  Gauge,
  Landmark,
  Compass,
  Network,
  Edit3,
} from 'lucide-react';
import { AdBanner } from '@/components/ads/AdBanner';

export default function BadgesPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    setProfile(UserDataStore.getProfile());
  }, []);

  const unlockedIds = profile?.unlockedBadgeIds || [];
  const progressPercent = Math.round((unlockedIds.length / BADGES.length) * 100);

  const getBadgeIcon = (iconName: string, isUnlocked: boolean) => {
    const props = { className: `w-7 h-7 ${isUnlocked ? 'text-amber-600' : 'text-gray-400'}` };
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles {...props} />;
      case 'Flame':
        return <Flame {...props} />;
      case 'Award':
        return <Award {...props} />;
      case 'Crown':
      case 'Trophy':
        return <Trophy {...props} />;
      case 'Zap':
        return <Zap {...props} />;
      case 'Gauge':
        return <Gauge {...props} />;
      case 'Landmark':
        return <Landmark {...props} />;
      case 'Compass':
        return <Compass {...props} />;
      case 'BookOpen':
        return <BookOpen {...props} />;
      case 'Network':
        return <Network {...props} />;
      case 'Edit3':
        return <Edit3 {...props} />;
      default:
        return <Award {...props} />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* ページヘッダー */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-600 mb-1">
          <Award className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
          バッジ・実績コレクション
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          学習を継続し、特定の条件や単元を制覇して限定バッジをコンプリートしよう！
        </p>
      </div>

      {/* 獲得進捗バー */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs text-gray-400 font-bold block mb-1">総バッジ獲得率</span>
          <div className="text-2xl font-black text-gray-900">
            {unlockedIds.length} / {BADGES.length} 個 解放済み
          </div>
        </div>

        <div className="w-full sm:w-1/2">
          <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
            <span>Progress</span>
            <span className="text-indigo-600">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-amber-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 広告枠 */}
      <AdBanner label="Badges Sponsor" />

      {/* バッジ一覧グリッド */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BADGES.map((badge) => {
          const isUnlocked = unlockedIds.includes(badge.id);

          return (
            <div
              key={badge.id}
              className={`rounded-3xl p-6 border transition-all duration-300 flex items-start gap-4 ${
                isUnlocked
                  ? 'bg-white border-amber-200 shadow-md shadow-amber-50/50 hover:shadow-lg'
                  : 'bg-gray-50/60 border-gray-200 opacity-60'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  isUnlocked
                    ? 'bg-gradient-to-tr from-amber-200 to-yellow-100 border border-amber-300 shadow-inner'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isUnlocked ? getBadgeIcon(badge.icon, true) : <Lock className="w-6 h-6 text-gray-400" />}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3
                    className={`font-black text-sm ${
                      isUnlocked ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {badge.name}
                  </h3>
                  {isUnlocked && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">{badge.description}</p>

                <div className="pt-2 text-[10px] font-bold text-amber-600">
                  ボーナス: +50 XP
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

