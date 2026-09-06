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

  const navLinks = [
    { href: '/', label: 'トップ' },
    { href: '/dictionary', label: '思想・人物対応表' },
    { href: '/stats', label: '学習進捗・グラフ' },
    { href: '/badges', label: 'バッジ実績' },
    { href: '/contact', label: 'お問い合わせ・誤植報告' },
  ];

  return (
    <header className="w-full bg-white border-b-2 border-red-600 shadow-xs">
      {/* 最上段：ロゴ ＆ ユーザーステータス ＆ 科目切替 */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex flex-wrap items-center justify-start gap-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-red-600 tracking-tight">
              公共倫理パーフェクトマスター.com
            </span>
            <span className="hidden sm:inline-block text-[11px] text-gray-500 font-normal ml-1">[共通テスト構造的暗記特訓]</span>
          </Link>
        </div>

        {/* この2つだけタイトル横に置く主要アクション */}
        <div className="flex max-w-full shrink-0 items-center gap-1.5 rounded-xl border border-red-100 bg-gradient-to-r from-red-50 via-white to-blue-50 p-1.5 shadow-sm lg:ml-3">
            <Link
              href="/ranking"
              aria-label="全国ランキングを見る"
              className={`group inline-flex min-h-11 items-center gap-2 rounded-lg border-2 px-3.5 py-2 text-xs font-black leading-tight transition hover:-translate-y-0.5 hover:shadow-md ${
                pathname === '/ranking'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-[0_3px_0_#0f172a]'
                  : 'border-slate-800 bg-slate-800 text-white shadow-[0_3px_0_#0f172a] hover:bg-slate-700'
              }`}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-current stroke-2">
                <path d="M8 21h8M12 17v4M6 4h12v4a6 6 0 0 1-12 0V4Z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 6H3v1a4 4 0 0 0 4 4M18 6h3v1a4 4 0 0 1-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="flex flex-col items-start">
                <span className="text-[9px] font-bold tracking-[0.14em] text-white/65">学習仲間</span>
                <span>全国ランキング</span>
              </span>
            </Link>
            <Link
              href="/account"
              aria-label={profile?.isGuest ? '会員登録する' : 'アカウントを開く'}
              className={`group inline-flex min-h-11 items-center gap-2 rounded-lg border-2 px-3.5 py-2 text-xs font-black leading-tight transition hover:-translate-y-0.5 hover:shadow-md ${
                pathname === '/account'
                  ? 'border-red-700 bg-red-700 text-white shadow-[0_3px_0_#991b1b]'
                  : 'border-red-600 bg-red-600 text-white shadow-[0_3px_0_#991b1b] hover:bg-red-500'
              }`}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-current stroke-2">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5 20a7 7 0 0 1 14 0" strokeLinecap="round" />
                <path d="M19 4v4M17 6h4" strokeLinecap="round" />
              </svg>
              <span className="flex flex-col items-start">
                <span className="text-[9px] font-bold tracking-[0.14em] text-white/70">学習を保存</span>
                <span>{profile?.isGuest ? '会員登録' : 'アカウント'}</span>
              </span>
            </Link>
        </div>
      </div>

      {/* タイトル下：学習状況と設定 */}
      <div className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-1.5 flex items-center justify-end gap-2.5 text-xs flex-wrap">
          {daysUntilTest !== null && (
            <div className="bg-red-50 text-red-700 px-2.5 py-1 border border-red-300 rounded-xs font-black text-[11px] select-none">
              共テまであと {daysUntilTest}日
            </div>
          )}
          {profile && (
            <div className="hidden md:flex items-center gap-2 bg-gray-100 px-2.5 py-1 rounded-xs border border-gray-300 text-[11px]">
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
