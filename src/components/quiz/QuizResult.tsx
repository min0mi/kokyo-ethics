'use client';

import React from 'react';
import Link from 'next/link';
import { RotateCcw, Home } from 'lucide-react';
import { AdBanner } from '@/components/ads/AdBanner';
import { UserDataStore } from '@/lib/storage/userDataStore';

interface QuizResultProps {
  totalQuestions: number;
  correctCount: number;
  xpEarned: number;
  elapsedSeconds?: number;
  onRetry: () => void;
  modeTitle: string;
}

export const QuizResult: React.FC<QuizResultProps> = ({
  totalQuestions,
  correctCount,
  xpEarned,
  elapsedSeconds,
  onRetry,
  modeTitle,
}) => {
  const accuracy = Math.round((correctCount / totalQuestions) * 100) || 0;

  return (
    <div className="w-full max-w-xl mx-auto bg-white border border-gray-300 rounded-xs p-6 space-y-4 text-center text-gray-900 shadow-xs">
      <div className="border-b border-gray-200 pb-2.5">
        <span className="text-[11px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 border border-gray-300 rounded-xs inline-block mb-1">
          {modeTitle}
        </span>
        <h2 className="text-lg font-bold text-gray-900">演習が完了しました</h2>
      </div>

      {/* スコアテーブル */}
      <table className="w-full text-xs border border-gray-300 mx-auto">
        <tbody>
          <tr className="border-b border-gray-200 bg-gray-50">
            <td className="p-2.5 font-bold text-gray-600 w-1/3">正答数</td>
            <td className="p-2.5 font-black text-sm text-gray-900">{correctCount} / {totalQuestions} 問</td>
          </tr>
          <tr className="border-b border-gray-200">
            <td className="p-2.5 font-bold text-gray-600">正答率</td>
            <td className="p-2.5 font-black text-sm text-blue-700">{accuracy}%</td>
          </tr>
          {elapsedSeconds !== undefined && elapsedSeconds > 0 && (
            <tr className="border-b border-gray-200 bg-gray-50">
              <td className="p-2.5 font-bold text-gray-600">今回の学習時間</td>
              <td className="p-2.5 font-black text-sm text-gray-800">
                {UserDataStore.formatStudyTime(elapsedSeconds)}
              </td>
            </tr>
          )}
          <tr className="bg-yellow-50/50">
            <td className="p-2.5 font-bold text-gray-600">獲得経験値</td>
            <td className="p-2.5 font-black text-sm text-yellow-800">+{xpEarned} XP</td>
          </tr>
        </tbody>
      </table>

      {/* 広告枠 */}
      <AdBanner format="rectangle" label="Sponsor" />

      {/* ボタン群 */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onRetry}
          className="flex-1 py-2.5 bg-gray-800 hover:bg-black text-white font-bold text-xs rounded-xs flex items-center justify-center gap-1 shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>もう一度解く</span>
        </button>
        <Link
          href="/"
          className="flex-1 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-bold text-xs rounded-xs flex items-center justify-center gap-1 shadow-xs"
        >
          <Home className="w-3.5 h-3.5" />
          <span>トップへ戻る</span>
        </Link>
      </div>
    </div>
  );
};
