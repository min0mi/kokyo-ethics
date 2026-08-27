'use client';

import React from 'react';
import { AdBanner } from '@/components/ads/AdBanner';

export default function RankingPage() {
  return (
    <div className="max-w-4xl mx-auto px-3 py-5 space-y-4 text-xs text-gray-900">
      {/* ページヘッダー */}
      <div className="border-b border-gray-300 pb-2">
        <span className="text-[11px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-xs border border-gray-300">
          全国ランキング
        </span>
        <h1 className="text-xl font-bold text-gray-900 mt-1">
          全国 思想マスターランキング
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          累計獲得XPによる全国学習者の順位表です。
        </p>
      </div>

      <div className="bg-white border border-gray-300 p-6 rounded-xs text-center space-y-2">
        <p className="font-bold text-gray-700 text-sm">現在、ランキング機能は準備中です。</p>
        <p className="text-gray-500 text-[11px]">今後のアップデートをお待ちください。</p>
      </div>

      <AdBanner label="Ranking Sponsor" />
    </div>
  );
}
