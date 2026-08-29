'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserDataStore } from '@/lib/storage/userDataStore';
import { UserProfile } from '@/types';
import { sounds } from '@/lib/sound';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [daysUntilTest, setDaysUntilTest] = useState<number | null>(null);

  const isChemistry = pathname?.startsWith('/chemistry');

  useEffect(() => {
    const p = UserDataStore.getProfile();
    setProfile(p);
    setIsMuted(sounds.getMuted());

    const calculateDays = () => {
      const targetDate = new Date('2027-01-16T00:00:00+09:00');
      const now = new Date();
      const targetUtc = Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      const nowUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
      const diffMs = targetUtc - nowUtc;
      return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    };
    setDaysUntilTest(calculateDays());

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

  const navLinks = isChemistry
    ? [
        { href: '/chemistry', label: 'トップ' },
        { href: '/chemistry/dictionary', label: '物質・色対応表' },
        { href: '/chemistry/precipitates', label: '沈殿と条件' },
        { href: '/chemistry/stats', label: '学習進捗・グラフ' },
        { href: '/contact', label: 'お問い合わせ・誤植報告' },
      ]
    : [
        { href: '/', label: 'トップ' },
        { href: '/dictionary', label: '思想・人物対応表' },
        { href: '/stats', label: '学習進捗・グラフ' },
        { href: '/badges', label: 'バッジ実績' },
        { href: '/contact', label: 'お問い合わせ・誤植報告' },
      ];

  return (
    <header className="w-full bg-white border-b-2 border-red-600 shadow-xs">
      {/* 最上段：ロゴ ＆ ユーザーステータス ＆ 科目切替 */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Link href={isChemistry ? "/chemistry" : "/"} className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-red-600 tracking-tight">
              {isChemistry ? '共テ無機化学パーフェクトマスター.com' : '公共倫理パーフェクトマスター.com'}
            </span>
            {isChemistry && (
              <span className="bg-amber-400 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider ml-0.5 shadow-xs">
                beta
              </span>
            )}
            <span className="hidden sm:inline-block text-[11px] text-gray-500 font-normal ml-1">
              {isChemistry ? '[物質・色 構造的暗記特訓]' : '[共通テスト構造的暗記特訓]'}
            </span>
          </Link>
        </div>

        {/* ユーザーステータス ＆ 科目切り替え */}
        <div className="flex items-center gap-2.5 text-xs flex-wrap">
          {daysUntilTest !== null && (
            <div className="bg-red-50 text-red-700 px-2.5 py-1 border border-red-300 rounded-xs font-black text-[11px] select-none">
              共テまであと {daysUntilTest}日
            </div>
          )}
          {profile && (
            <div className="hidden md:flex items-center gap-2 bg-gray-100 px-2.5 py-1 rounded-xs border border-gray-300 text-[11px]">
              <span className="font-bold text-gray-700">{profile.username}</span>
              <span className="text-gray-400">|</span>
              <span className="text-orange-700 font-bold">
                連続 {profile.streakDays}日
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-blue-700 font-bold">Lv.{profile.level}</span>
            </div>
          )}

          <button
            onClick={toggleSound}
            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xs text-gray-700 text-[11px] font-semibold"
            title={isMuted ? '効果音をON' : '効果音をミュート'}
          >
            音: {isMuted ? '切' : '入'}
          </button>

          {/* 科目切替ボタン（右上） */}
          <div className="flex items-center gap-1 border-l border-gray-300 pl-2">
            <Link
              href="/"
              className={`px-2 py-1 rounded-xs text-[11px] font-bold transition flex items-center gap-1 ${
                !isChemistry
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
              }`}
            >
              公共倫理
            </Link>
            <Link
              href="/chemistry"
              className={`px-2 py-1 rounded-xs text-[11px] font-bold transition flex items-center gap-1 ${
                isChemistry
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}
            >
              無機化学 <span className="bg-amber-400 text-black text-[9px] px-1 py-0.2 rounded-xs font-black">beta</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ナビゲーションバー */}
      <nav className="bg-gray-100 border-t border-gray-300 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-2 flex items-center whitespace-nowrap text-xs font-semibold">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 border-r border-gray-200 transition ${
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
