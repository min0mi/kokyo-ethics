'use client';

import React from 'react';
import Link from 'next/link';
import { RotateCcw, Home } from 'lucide-react';
import { AdBanner } from '@/components/ads/AdBanner';

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

  return (
    <div className="w-full max-w-xl mx-auto bg-white border border-gray-300 rounded-sm p-6 space-y-5 text-center">
      <div className="border-b border-gray-200 pb-3">
        <span className="text-xs font-bold bg-gray-100 text-gray-700 px-2 py-0.5 border border-gray-300 rounded-xs inline-block mb-1">
          {modeTitle}
        </span>
        <h2 className="text-xl font-bold text-gray-900">演習が完了しました</h2>
      </div>

      {/* スコアテーブル */}
      <table className="w-full text-xs border border-gray-300 mx-auto">
        <tbody>
          <tr className="border-b border-gray-300 bg-gray-50">
            <td className="p-2.5 font-bold text-gray-600 w-1/3">正答数</td>
            <td className="p-2.5 font-black text-base text-gray-900">{correctCount} / {totalQuestions} 問</td>
          </tr>
          <tr className="border-b border-gray-300">
            <td className="p-2.5 font-bold text-gray-600">正答率</td>
            <td className="p-2.5 font-black text-base text-blue-700">{accuracy}%</td>
          </tr>
          <tr className="bg-yellow-50/50">
            <td className="p-2.5 font-bold text-gray-600">獲得経験値</td>
            <td className="p-2.5 font-black text-base text-yellow-700">+{xpEarned} XP</td>
          </tr>
        </tbody>
      </table>

      {/* 広告枠 */}
      <AdBanner format="rectangle" label="Sponsor" />

      {/* ボタン群 */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={onRetry}
          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-sm flex items-center justify-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          もう一度解く
        </button>

        <Link
          href="/"
          className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-sm border border-gray-300 flex items-center justify-center gap-1"
        >
          <Home className="w-3.5 h-3.5" />
          トップへ戻る
        </Link>
      </div>
    </div>
  );
};
