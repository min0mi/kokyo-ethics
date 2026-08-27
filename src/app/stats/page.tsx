'use client';

import React, { useState, useEffect } from 'react';
import { UserDataStore } from '@/lib/storage/userDataStore';
import { SRSEngine } from '@/lib/srs/srsEngine';
import { QuestionGenerator } from '@/lib/generator/questionGenerator';
import { CATEGORIES } from '@/data/categories';
import { UserProfile } from '@/types';
import { BarChart3, Zap } from 'lucide-react';
import { AdBanner } from '@/components/ads/AdBanner';

export default function StatsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [counts, setCounts] = useState({
    total: 0,
    mastered: 0,
    review: 0,
    learning: 0,
    new: 0,
  });
  const [categoryData, setCategoryData] = useState<
    { name: string; era: string; mastered: number; total: number; rate: number }[]
  >([]);

  useEffect(() => {
    const p = UserDataStore.getProfile();
    const progressMap = UserDataStore.getProgressMap();
    const allQs = QuestionGenerator.getAllQuestions();

    setProfile(p);

    let mastered = 0;
    let review = 0;
    let learning = 0;
    let unattempted = 0;

    allQs.forEach((q) => {
      const prog = progressMap[q.id];
      if (!prog || prog.state === 'new') {
        unattempted += 1;
      } else if (prog.state === 'mastered') {
        mastered += 1;
      } else if (prog.state === 'review') {
        review += 1;
      } else {
        learning += 1;
      }
    });

    setCounts({
      total: allQs.length,
      mastered,
      review,
      learning,
      new: unattempted,
    });

    // カテゴリごとの進捗
    const catList = CATEGORIES.map((cat) => {
      const catQs = allQs.filter((q) => q.categoryId === cat.id);
      const res = SRSEngine.calculateCategoryStats(catQs, progressMap);
      return {
        name: cat.shortName,
        era: cat.era,
        mastered: res.mastered,
        total: res.total,
        rate: res.rate,
      };
    });
    setCategoryData(catList);
  }, []);

  const overallAccuracy =
    profile && profile.totalAnswered > 0
      ? Math.round((profile.totalCorrect / profile.totalAnswered) * 100)
      : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* ページタイトル */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 mb-1">
          <BarChart3 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
          学習習熟度・忘却曲線分析
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          SuperMemo-2 (SM-2) アルゴリズムによる各問題の定着ステータスを可視化
        </p>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs">
          <span className="text-xs text-gray-400 font-bold block mb-1">総解答数</span>
          <div className="text-2xl font-black text-gray-900">{profile?.totalAnswered || 0} 問</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs">
          <span className="text-xs text-gray-400 font-bold block mb-1">通算正答率</span>
          <div className="text-2xl font-black text-indigo-600">{overallAccuracy}%</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs">
          <span className="text-xs text-gray-400 font-bold block mb-1">定着完了 (Mastered)</span>
          <div className="text-2xl font-black text-emerald-600">{counts.mastered} 問</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs">
          <span className="text-xs text-gray-400 font-bold block mb-1">獲得XP</span>
          <div className="text-2xl font-black text-amber-600 flex items-center gap-1">
            <Zap className="w-5 h-5 fill-amber-500 text-amber-500" />
            {profile?.xp || 0}
          </div>
        </div>
      </div>

      {/* 忘却曲線 ステータス内訳 */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">記憶定着ステータス内訳</h3>
            <p className="text-xs text-gray-500">全問題プール ({counts.total}問) の習熟フェーズ</p>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            SM-2 SRS
          </span>
        </div>

        {/* スタックバーグラフ */}
        <div className="space-y-2">
          <div className="w-full bg-gray-100 rounded-full h-4 flex overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${(counts.mastered / (counts.total || 1)) * 100}%` }}
              title={`Mastered: ${counts.mastered}問`}
            />
            <div
              className="bg-indigo-500 h-full transition-all duration-500"
              style={{ width: `${(counts.review / (counts.total || 1)) * 100}%` }}
              title={`Review期: ${counts.review}問`}
            />
            <div
              className="bg-amber-400 h-full transition-all duration-500"
              style={{ width: `${(counts.learning / (counts.total || 1)) * 100}%` }}
              title={`Learning中: ${counts.learning}問`}
            />
            <div
              className="bg-gray-200 h-full transition-all duration-500"
              style={{ width: `${(counts.new / (counts.total || 1)) * 100}%` }}
              title={`未着手: ${counts.new}問`}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-gray-700">定着完了 (30日+): {counts.mastered}問</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-500" />
              <span className="text-gray-700">復習期 (7〜14日): {counts.review}問</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-gray-700">学習中 (1〜3日): {counts.learning}問</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-300" />
              <span className="text-gray-400">未学習: {counts.new}問</span>
            </div>
          </div>
        </div>
      </div>

      {/* 広告枠 */}
      <AdBanner label="Stats Sponsor" />

      {/* 単元別マスター率一覧 */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-900">単元別マスター度</h3>
        <div className="space-y-4">
          {categoryData.map((cat, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <span>{cat.name} <span className="font-normal text-gray-400">（{cat.era}）</span></span>
                <span className="text-indigo-600 font-extrabold">{cat.rate}% ({cat.mastered}/{cat.total}問)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${cat.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

