'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Volume2, VolumeX, Flame } from 'lucide-react';
import { UserDataStore } from '@/lib/storage/userDataStore';
import { UserProfile } from '@/types';
import { sounds } from '@/lib/sound';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    const p = UserDataStore.getProfile();
    setProfile(p);
    setIsMuted(sounds.getMuted());

    const handleStorage = () => {
      setProfile(UserDataStore.getProfile());
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('user_profile_updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('user_profile_updated', handleStorage);
    };
  }, []);

  const toggleSound = () => {
    const next = !isMuted;
    sounds.setMuted(next);
    setIsMuted(next);
    if (!next) sounds.playTap();
  };

  const navLinks = [
    { href: '/', label: 'トップ・総合ポータル' },
    { href: '/practice/speed', label: 'スピード暗記' },
    { href: '/practice/standard', label: '共テ道場演習' },
    { href: '/practice/matching', label: '線つなぎ' },
    { href: '/practice/typing', label: '記述' },
    { href: '/practice/recall', label: '分類想起' },
    { href: '/dictionary', label: '用語図鑑' },
    { href: '/ranking', label: 'ランキング' },
    { href: '/badges', label: 'バッジ' },
    { href: '/stats', label: '学習分析' },
  ];

  return (
    <header className="w-full bg-white border-b-2 border-red-600 shadow-xs">
      {/* 最上段：ロゴ ＆ ユーザーステータス */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-red-600 tracking-tight">公共・倫理</span>
            <span className="text-base sm:text-lg font-bold text-gray-800">パーフェクトマスター</span>
            <span className="hidden sm:inline-block text-[11px] text-gray-500 font-normal ml-1">
              [共通テスト構造的暗記道場]
            </span>
          </Link>
        </div>

        {/* ユーザーステータス */}
        <div className="flex items-center gap-3 text-xs">
          {profile && (
            <div className="flex items-center gap-3 bg-gray-100 px-3 py-1 rounded-sm border border-gray-300">
              <span className="font-bold text-gray-700">{profile.username}</span>
              <span className="flex items-center gap-0.5 text-orange-600 font-bold">
                <Flame className="w-3.5 h-3.5 fill-orange-500" />
                {profile.streakDays}日連続
              </span>
              <span className="text-blue-700 font-bold">Lv.{profile.level}</span>
              <span className="text-gray-600">({profile.xp} XP)</span>
            </div>
          )}

          <button
            onClick={toggleSound}
            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-sm text-gray-700 flex items-center gap-1 text-[11px]"
            title={isMuted ? '効果音をON' : '効果音をミュート'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-gray-400" /> : <Volume2 className="w-3.5 h-3.5 text-blue-600" />}
            <span>音:{isMuted ? '切' : '入'}</span>
          </button>
        </div>
      </div>

      {/* ナビゲーションバー (Yahoo風のタブ・メニューバー) */}
      <nav className="bg-gray-100 border-t border-gray-300 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-2 flex items-center whitespace-nowrap text-xs font-semibold">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 border-r border-gray-200 transition ${
                  isActive
                    ? 'bg-white text-red-600 font-bold border-b-2 border-b-red-600 -mb-px'
                    : 'text-gray-700 hover:bg-gray-200 hover:text-blue-700'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
