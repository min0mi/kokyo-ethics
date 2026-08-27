'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Flame,
  Zap,
  Volume2,
  VolumeX,
  BookOpen,
  Trophy,
  Award,
  BarChart3,
  Sparkles,
  Menu,
  X,
  GraduationCap,
} from 'lucide-react';
import { UserDataStore } from '@/lib/storage/userDataStore';
import { UserProfile } from '@/types';
import { sounds } from '@/lib/sound';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const p = UserDataStore.getProfile();
    setProfile(p);
    setIsMuted(sounds.getMuted());

    // プロファイル更新イベントのリスナー
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
    { href: '/', label: '学習ダッシュボード', icon: Sparkles },
    { href: '/dictionary', label: '思想・用語図鑑', icon: BookOpen },
    { href: '/ranking', label: '全国ランキング', icon: Trophy },
    { href: '/badges', label: 'バッジ実績', icon: Award },
    { href: '/stats', label: '習熟度・分析', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition font-bold text-lg sm:text-xl tracking-tight"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="leading-tight text-gray-900 font-extrabold text-base sm:text-lg">
                  公共倫理<span className="text-indigo-600">パーフェクトマスター</span>
                </span>
                <span className="text-[10px] text-gray-400 font-normal">共通テスト構造的暗記道場</span>
              </div>
            </Link>
          </div>

          {/* PC向け ナビリンク */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* ユーザー進捗ステータス (ストリーク & レベル) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {profile && (
              <>
                {/* 連続日数 (ストリーク) */}
                <div
                  className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-amber-800 text-xs font-bold shadow-xs cursor-default"
                  title="連続学習日数"
                >
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-bounce" />
                  <span>{profile.streakDays}日</span>
                </div>

                {/* レベル & XP */}
                <div
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-indigo-900 text-xs font-bold"
                  title={`累計XP: ${profile.xp} XP`}
                >
                  <Zap className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
                  <span>Lv.{profile.level}</span>
                  <span className="text-[10px] text-indigo-500 font-normal">({profile.xp} XP)</span>
                </div>
              </>
            )}

            {/* 音声トグル */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition"
              title={isMuted ? '効果音をONにする' : '効果音をミュートする'}
              aria-label="Toggle sound"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-gray-400" />
              ) : (
                <Volume2 className="w-5 h-5 text-indigo-600" />
              )}
            </button>

            {/* スマホ用メニューボタン */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* スマホ用展開メニュー */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg animate-in slide-in-from-top-2">
          {profile && (
            <div className="px-3 py-2 mb-2 bg-indigo-50/70 rounded-lg flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-700">{profile.username}</span>
              <div className="flex items-center gap-2 font-bold text-indigo-700">
                <span>Lv.{profile.level}</span>
                <span>{profile.xp} XP</span>
              </div>
            </div>
          )}
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};

