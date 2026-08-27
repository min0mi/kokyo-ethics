'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Zap,
  RotateCcw,
  Home,
} from 'lucide-react';
import { AdBanner } from '@/components/ads/AdBanner';
import { sounds } from '@/lib/sound';

interface QuizResultProps {
  totalQuestions: number;
  correctCount: number;
  xpEarned: number;
  onRetry: () => void;
  modeTitle: string;
}

export const QuizResult: React.FC<QuizResultProps> = ({
  totalQuestions,
  correctCount,
  xpEarned,
  onRetry,
  modeTitle,
}) => {
  const accuracy = Math.round((correctCount / totalQuestions) * 100) || 0;
  const isPerfect = correctCount === totalQuestions && totalQuestions > 0;

  useEffect(() => {
    if (isPerfect) {
      sounds.playFanfare();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    }
  }, [isPerfect]);

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 text-center animate-in zoom-in-95">
      {/* クラウン/トロフィーアイコン */}
      <div className="inline-flex p-4 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-white shadow-xl shadow-amber-100 mb-4 animate-bounce">
        <Trophy className="w-12 h-12" />
      </div>

      <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full mb-2">
        {modeTitle} 演習完了
      </span>

      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">
        {isPerfect ? '🎉 パーフェクト達成！' : 'お疲れ様でした！'}
      </h2>
      <p className="text-gray-500 text-xs sm:text-sm mb-6">
        忘却曲線アルゴリズムに基づき、適切な時期に自動で復習キューに入ります。
      </p>

      {/* スコア・正答率カード */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
          <span className="text-[11px] text-gray-400 font-semibold block mb-1">正答数</span>
          <span className="text-xl sm:text-2xl font-black text-gray-800">
            {correctCount}
            <span className="text-xs text-gray-400 font-normal"> / {totalQuestions}</span>
          </span>
        </div>

        <div className="bg-indigo-50/70 border border-indigo-100 p-3 rounded-2xl">
          <span className="text-[11px] text-indigo-500 font-semibold block mb-1">正答率</span>
          <span className="text-xl sm:text-2xl font-black text-indigo-600">{accuracy}%</span>
        </div>

        <div className="bg-amber-50/70 border border-amber-100 p-3 rounded-2xl">
          <span className="text-[11px] text-amber-600 font-semibold block mb-1">獲得XP</span>
          <span className="text-xl sm:text-2xl font-black text-amber-600 flex items-center justify-center gap-0.5">
            <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
            +{xpEarned}
          </span>
        </div>
      </div>

      {/* 広告バナー枠（結果画面） */}
      <AdBanner format="rectangle" label="Result Sponsor" />

      {/* アクションボタン */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
        <button
          onClick={onRetry}
          className="w-full sm:w-1/2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition transform active:scale-95 text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          もう一度演習する
        </button>

        <Link
          href="/"
          className="w-full sm:w-1/2 py-3.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold flex items-center justify-center gap-2 transition text-sm"
        >
          <Home className="w-4 h-4" />
          ダッシュボードへ戻る
        </Link>
      </div>
    </div>
  );
};

