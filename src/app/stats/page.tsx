'use client';

import React, { useState, useEffect } from 'react';
import { UserDataStore } from '@/lib/storage/userDataStore';
import { SRSEngine, CategoryDetailedStats } from '@/lib/srs/srsEngine';
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
    correct: 0,
    wrong: 0,
    new: 0,
  });
  const [categoryData, setCategoryData] = useState<
    { name: string; era: string; groupName: string; stats: CategoryDetailedStats; isAvailable: boolean }[]
  >([]);

  useEffect(() => {
    const p = UserDataStore.getProfile();
    const progressMap = UserDataStore.getProgressMap();
    const allQs = QuestionGenerator.getAllQuestions();

    setProfile(p);

    let mastered = 0;
    let correct = 0;
    let wrong = 0;
    let unattempted = 0;

    allQs.forEach((q) => {
      const prog = progressMap[q.id];
      if (!prog || prog.totalAttempts === 0 || prog.state === 'new') {
        unattempted += 1;
      } else if (prog.state === 'mastered') {
        mastered += 1;
      } else if (prog.correctStreak > 0) {
        correct += 1;
      } else {
        wrong += 1;
      }
    });

    setCounts({
      total: allQs.length,
      mastered,
      correct,
      wrong,
      new: unattempted,
    });

    const catList = CATEGORIES.map((cat) => {
      const catQs = allQs.filter((q) => q.categoryId === cat.id);
      const res = SRSEngine.calculateCategoryStats(catQs, progressMap);
      return {
        name: cat.name,
        era: cat.era,
        groupName: cat.groupName || '源流思想',
        stats: res,
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
    <div className="max-w-5xl mx-auto px-3 py-5 space-y-4 text-xs text-gray-900">
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
            全{counts.total}問の学習進捗および SuperMemo-2 (SM-2) アルゴリズムに基づく記憶定着フェーズの可視化
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
            全体の記憶定着フェーズ内訳（全{counts.total}問）
          </h2>
          <span className="text-[11px] bg-blue-50 text-blue-800 font-bold px-2 py-0.5 border border-blue-200 rounded-xs">
            SM-2 アルゴリズム
          </span>
        </div>

        {/* スタックバー */}
        <div className="w-full bg-gray-200 h-3.5 rounded-xs flex overflow-hidden border border-gray-300">
          <div
            className="bg-green-600 h-full"
            style={{ width: `${(counts.mastered / (counts.total || 1)) * 100}%` }}
            title={`定着完了: ${counts.mastered}問`}
          />
          <div
            className="bg-blue-600 h-full"
            style={{ width: `${(counts.correct / (counts.total || 1)) * 100}%` }}
            title={`正答中: ${counts.correct}問`}
          />
          <div
            className="bg-red-500 h-full"
            style={{ width: `${(counts.wrong / (counts.total || 1)) * 100}%` }}
            title={`誤答/要復習: ${counts.wrong}問`}
          />
          <div
            className="bg-gray-200 h-full"
            style={{ width: `${(counts.new / (counts.total || 1)) * 100}%` }}
            title={`未着手: ${counts.new}問`}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-green-600 inline-block rounded-xs" />
            <span className="font-bold text-green-900">定着完了 (30日+): {counts.mastered}問</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-blue-600 inline-block rounded-xs" />
            <span className="font-bold text-blue-900">正答中 (1〜14日): {counts.correct}問</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-red-500 inline-block rounded-xs" />
            <span className="font-bold text-red-700">誤答・要復習: {counts.wrong}問</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-gray-300 inline-block rounded-xs" />
            <span className="text-gray-500">未学習: {counts.new}問</span>
          </div>
        </div>
      </div>

      {/* 広告枠 */}
      <AdBanner label="Stats Sponsor" />

      {/* 単元別マスター度 */}
      <div className="bg-white border border-gray-300 p-4 rounded-xs space-y-3 text-xs">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <h2 className="font-bold text-gray-900 text-sm">
            単元別 学習率 ＆ 記憶定着内訳
          </h2>
          <span className="text-[10px] text-gray-500 font-normal">
            <span className="text-green-700 font-bold">■</span>定着 <span className="text-blue-600 font-bold">■</span>正答 <span className="text-red-500 font-bold">■</span>誤答
          </span>
        </div>

        <div className="space-y-3">
          {categoryData.map((cat, idx) => {
            const st = cat.stats;
            return (
              <div key={idx} className="space-y-1 bg-gray-50/50 p-2.5 rounded-xs border border-gray-200">
                <div className="flex justify-between text-xs items-center">
                  <div>
                    <span className="font-bold text-gray-900">{cat.name}</span>
                    <span className="text-gray-500 text-[11px] ml-1.5">({cat.groupName})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-900 font-bold">学習率: {st.studyRate}%</span>
                    <span className="text-[10px] text-gray-500 ml-1.5">({st.mastered + st.correct + st.wrong}/{st.total}問)</span>
                  </div>
                </div>

                {/* 3色プログレスバー */}
                <div className="w-full bg-gray-200 h-2.5 rounded-xs flex overflow-hidden border border-gray-300">
                  {st.masteredRate > 0 && (
                    <div
                      style={{ width: `${st.masteredRate}%` }}
                      className="bg-green-600 h-full"
                      title={`定着: ${st.mastered}問 (${st.masteredRate}%)`}
                    />
                  )}
                  {st.correctRate > 0 && (
                    <div
                      style={{ width: `${st.correctRate}%` }}
                      className="bg-blue-600 h-full"
                      title={`正答中: ${st.correct}問 (${st.correctRate}%)`}
                    />
                  )}
                  {st.wrongRate > 0 && (
                    <div
                      style={{ width: `${st.wrongRate}%` }}
                      className="bg-red-500 h-full"
                      title={`誤答/要復習: ${st.wrong}問 (${st.wrongRate}%)`}
                    />
                  )}
                </div>

                <div className="flex justify-between text-[10px] text-gray-500 pt-0.5">
                  <span className="text-green-800 font-semibold">定着: {st.mastered}問 ({st.masteredRate}%)</span>
                  <span className="text-blue-800 font-semibold">正答中: {st.correct}問 ({st.correctRate}%)</span>
                  <span className="text-red-600 font-semibold">誤答: {st.wrong}問 ({st.wrongRate}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
