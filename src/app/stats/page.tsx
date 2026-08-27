'use client';

import React, { useState, useEffect } from 'react';
import { UserDataStore } from '@/lib/storage/userDataStore';
import { SRSEngine } from '@/lib/srs/srsEngine';
import { QuestionGenerator } from '@/lib/generator/questionGenerator';
import { CATEGORIES } from '@/data/categories';
import { UserProfile } from '@/types';
import { AdBanner } from '@/components/ads/AdBanner';
import { DailyLineChart } from '@/components/stats/DailyLineChart';
import { ShareButtons } from '@/components/share/ShareButtons';

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
    { name: string; era: string; mastered: number; total: number; rate: number; isAvailable: boolean }[]
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

    const catList = CATEGORIES.map((cat) => {
      const catQs = allQs.filter((q) => q.categoryId === cat.id);
      const res = SRSEngine.calculateCategoryStats(catQs, progressMap);
      return {
        name: cat.shortName,
        era: cat.era,
        mastered: res.mastered,
        total: res.total,
        rate: res.rate,
        isAvailable: !!cat.isAvailable,
      };
    });
    setCategoryData(catList);
  }, []);

  const overallAccuracy =
    profile && profile.totalAnswered > 0
      ? Math.round((profile.totalCorrect / profile.totalAnswered) * 100)
      : 0;

  return (
    <div className="max-w-5xl mx-auto px-3 py-5 space-y-4">
      {/* ページヘッダー */}
      <div className="border-b border-gray-300 pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <span className="text-[11px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-xs border border-gray-300">
            学習進捗・忘却曲線
          </span>
          <h1 className="text-xl font-bold text-gray-900 mt-1">
            学習習熟度・忘却曲線分析
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            日別の学習問題数推移および SuperMemo-2 (SM-2) アルゴリズムに基づく記憶定着フェーズの可視化
          </p>
        </div>

        {profile && (
          <ShareButtons
            text={`【公共倫理パーフェクトマスター.com】で学習中！\n連続学習: ${profile.streakDays}日 | 総解答数: ${profile.totalAnswered}問 | 定着完了: ${counts.mastered}問\n#共通テスト #倫理 #公共`}
            buttonLabel="𝕏 で進捗をシェア"
          />
        )}
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
        <div className="bg-white border border-gray-300 p-3 rounded-xs">
          <span className="text-gray-500 block mb-1">総解答数</span>
          <strong className="text-lg text-gray-900">{profile?.totalAnswered || 0} 問</strong>
        </div>

        <div className="bg-white border border-gray-300 p-3 rounded-xs">
          <span className="text-gray-500 block mb-1">通算正答率</span>
          <strong className="text-lg text-blue-700">{overallAccuracy}%</strong>
        </div>

        <div className="bg-white border border-gray-300 p-3 rounded-xs">
          <span className="text-gray-500 block mb-1">定着完了 (30日+)</span>
          <strong className="text-lg text-green-700">{counts.mastered} 問</strong>
        </div>

        <div className="bg-white border border-gray-300 p-3 rounded-xs">
          <span className="text-gray-500 block mb-1">総学習時間</span>
          <strong className="text-lg text-indigo-700">
            {UserDataStore.formatStudyTime(profile?.totalStudyTimeSeconds || 0)}
          </strong>
        </div>

        <div className="bg-white border border-gray-300 p-3 rounded-xs">
          <span className="text-gray-500 block mb-1">獲得経験値</span>
          <strong className="text-lg text-yellow-700">{profile?.xp || 0} XP</strong>
        </div>
      </div>

      {/* ★ 日別学習問題数の折れ線グラフ（全期間対応） ★ */}
      <DailyLineChart initialDays={7} />

      {/* 記憶定着ステータス内訳 */}
      <div className="bg-white border border-gray-300 p-4 rounded-xs space-y-3 text-xs">
        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
          <h2 className="font-bold text-gray-900 text-sm">
            記憶定着フェーズ内訳（源流思想 全{counts.total}問）
          </h2>
          <span className="text-[11px] bg-blue-50 text-blue-800 font-bold px-2 py-0.5 border border-blue-200 rounded-xs">
            SM-2 アルゴリズム
          </span>
        </div>

        {/* スタックバー */}
        <div className="w-full bg-gray-200 h-3 rounded-xs flex overflow-hidden">
          <div
            className="bg-green-600 h-full"
            style={{ width: `${(counts.mastered / (counts.total || 1)) * 100}%` }}
            title={`定着完了: ${counts.mastered}問`}
          />
          <div
            className="bg-blue-600 h-full"
            style={{ width: `${(counts.review / (counts.total || 1)) * 100}%` }}
            title={`復習期: ${counts.review}問`}
          />
          <div
            className="bg-yellow-500 h-full"
            style={{ width: `${(counts.learning / (counts.total || 1)) * 100}%` }}
            title={`学習中: ${counts.learning}問`}
          />
          <div
            className="bg-gray-300 h-full"
            style={{ width: `${(counts.new / (counts.total || 1)) * 100}%` }}
            title={`未着手: ${counts.new}問`}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-green-600 inline-block" />
            <span>定着完了: {counts.mastered}問</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-blue-600 inline-block" />
            <span>復習期 (7〜14日): {counts.review}問</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-yellow-500 inline-block" />
            <span>学習中 (1〜3日): {counts.learning}問</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-gray-300 inline-block" />
            <span className="text-gray-500">未学習: {counts.new}問</span>
          </div>
        </div>
      </div>

      {/* 広告枠 */}
      <AdBanner label="Stats Sponsor" />

      {/* 単元別マスター度 */}
      <div className="bg-white border border-gray-300 p-4 rounded-xs space-y-3 text-xs">
        <h2 className="font-bold text-gray-900 text-sm border-b border-gray-200 pb-2">
          単元別 習熟度一覧
        </h2>

        <div className="space-y-2.5">
          {categoryData.map((cat, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs">
                <div>
                  <span className="font-bold text-gray-800">{cat.name}</span>
                  <span className="text-gray-500 text-[11px] ml-1.5">({cat.era})</span>
                  {!cat.isAvailable && (
                    <span className="ml-2 text-[10px] text-gray-400 font-mono">[準備中]</span>
                  )}
                </div>
                {cat.isAvailable ? (
                  <span className="text-blue-700 font-bold">
                    {cat.rate}% ({cat.mastered}/{cat.total}問)
                  </span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 rounded-full"
                  style={{ width: `${cat.isAvailable ? cat.rate : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
