'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CATEGORIES } from '@/data/categories';
import { QuestionGenerator, AVAILABLE_CATEGORY_IDS } from '@/lib/generator/questionGenerator';
import { SRSEngine } from '@/lib/srs/srsEngine';
import { UserDataStore } from '@/lib/storage/userDataStore';
import { UserProfile, Question, QuizSessionConfig } from '@/types';
import { AdBanner } from '@/components/ads/AdBanner';
import { DailyLineChart } from '@/components/stats/DailyLineChart';

export default function HomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dueQuestions, setDueQuestions] = useState<Question[]>([]);
  const [searchWord, setSearchWord] = useState('');
  const [dailyData, setDailyData] = useState<{ date: string; label: string; total: number; correct: number }[]>([]);
  const [categoryStats, setCategoryStats] = useState<
    Record<string, { total: number; mastered: number; learning: number; rate: number }>
  >({});
  const [totalMasteredCount, setTotalMasteredCount] = useState(0);
  const [totalQuestionsCount, setTotalQuestionsCount] = useState(0);

  // 一括演習設定ステート
  const [sessionConfig, setSessionConfig] = useState<QuizSessionConfig>({
    categoryIds: AVAILABLE_CATEGORY_IDS,
    enabledTypes: {
      choice: true,
      matching: true,
      typing: true,
      recall: true,
    },
    questionCount: 10,
  });

  useEffect(() => {
    const p = UserDataStore.getProfile();
    const progressMap = UserDataStore.getProgressMap();
    const allQuestions = QuestionGenerator.getAllQuestions();
    const history = UserDataStore.getDailyHistory(7);

    setProfile(p);
    setDailyData(history);
    setTotalQuestionsCount(allQuestions.length);

    const due = SRSEngine.getDueQuestions(allQuestions, progressMap);
    setDueQuestions(due);

    let totalMastered = 0;
    const stats: Record<string, { total: number; mastered: number; learning: number; rate: number }> = {};
    CATEGORIES.forEach((cat) => {
      const catQs = allQuestions.filter((q) => q.categoryId === cat.id);
      const res = SRSEngine.calculateCategoryStats(catQs, progressMap);
      stats[cat.id] = { total: res.total, mastered: res.mastered, learning: res.learning, rate: res.rate };
      if (cat.isAvailable) {
        totalMastered += res.mastered;
      }
    });
    setCategoryStats(stats);
    setTotalMasteredCount(totalMastered);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchWord.trim()) return;
    router.push(`/dictionary?q=${encodeURIComponent(searchWord.trim())}`);
  };

  const toggleType = (key: keyof QuizSessionConfig['enabledTypes']) => {
    setSessionConfig((prev) => ({
      ...prev,
      enabledTypes: {
        ...prev.enabledTypes,
        [key]: !prev.enabledTypes[key],
      },
    }));
  };

  const topRankers = [
    { rank: 1, name: 'ソクラテスの弟子', xp: 4850 },
    { rank: 2, name: 'イデア探求者', xp: 4120 },
    { rank: 3, name: 'カントの散歩道', xp: 3740 },
    { rank: 4, name: '超人ニーチェ', xp: 3200 },
    { rank: 5, name: '実存サルトル', xp: 2850 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 space-y-3">
      {/* 最上段：復習アラート ＆ 検索バー */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        {/* 今日の復習ブロック */}
        <div className="lg:col-span-2 bg-yellow-50 border border-yellow-400 p-2.5 rounded-xs flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <span className="bg-red-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-xs shrink-0">
              重要
            </span>
            <div className="text-xs text-gray-900">
              <strong className="text-xs font-bold text-red-600">
                本日の忘却曲線 復習キュー: {dueQuestions.length} 問
              </strong>
              <p className="text-gray-600 text-[11px] mt-0.5">
                {dueQuestions.length > 0
                  ? 'SM-2アルゴリズムにより本日復習期日に達した問題です。'
                  : '今日の復習は完了しています。源流思想の総合演習を進めましょう。'}
              </p>
            </div>
          </div>

          <Link
            href="/practice?count=10"
            className="w-full sm:w-auto px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xs text-center shadow-xs shrink-0"
          >
            {dueQuestions.length > 0 ? '復習を開始する' : '総合演習を解く'}
          </Link>
        </div>

        {/* 用語・人物クイック検索バー */}
        <div className="bg-white border border-gray-300 p-2.5 rounded-xs">
          <form onSubmit={handleSearchSubmit} className="space-y-1">
            <label className="block text-[11px] font-bold text-gray-700">
              思想家・キーワード・著書の図鑑検索
            </label>
            <div className="flex gap-1">
              <input
                type="text"
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                placeholder="例: エピクロス、アタラクシア、仁"
                className="flex-1 px-2 py-1 border border-gray-300 rounded-xs text-xs focus:outline-hidden focus:border-blue-600"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xs"
              >
                検索
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 2カラム構成：左側メイン / 右側サイドバー */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* ===================== 左側 メインコンテンツ (8/12) ===================== */}
        <div className="lg:col-span-8 space-y-3">
          {/* ★ 1. 一括演習設定パネル（問題形式ON/OFF ＆ 問題数選択） ★ */}
          <div className="bg-white border-2 border-blue-600 rounded-xs p-3.5 sm:p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
              <div>
                <span className="text-[11px] font-bold bg-blue-100 text-blue-900 px-1.5 py-0.2 rounded-xs mr-1.5">
                  一律設定
                </span>
                <strong className="text-sm font-bold text-gray-900">
                  源流思想 総合演習（形式ON/OFF・問題数選択）
                </strong>
              </div>
              <span className="text-[11px] text-gray-500">源流思想 5単元対象</span>
            </div>

            {/* 問題形式のON/OFF */}
            <div className="space-y-1">
              <span className="font-bold text-gray-700 block text-[11px]">
                出題形式（チェックでON/OFF）:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <label className="flex items-center gap-1.5 p-1.5 bg-gray-50 border border-gray-300 rounded-xs cursor-pointer hover:bg-blue-50">
                  <input
                    type="checkbox"
                    checked={sessionConfig.enabledTypes.choice}
                    onChange={() => toggleType('choice')}
                    className="rounded-xs"
                  />
                  <span className="font-bold text-gray-800 text-[11px]">4択選択問題</span>
                </label>

                <label className="flex items-center gap-1.5 p-1.5 bg-gray-50 border border-gray-300 rounded-xs cursor-pointer hover:bg-blue-50">
                  <input
                    type="checkbox"
                    checked={sessionConfig.enabledTypes.matching}
                    onChange={() => toggleType('matching')}
                    className="rounded-xs"
                  />
                  <span className="font-bold text-gray-800 text-[11px]">線つなぎ（6択）</span>
                </label>

                <label className="flex items-center gap-1.5 p-1.5 bg-gray-50 border border-gray-300 rounded-xs cursor-pointer hover:bg-blue-50">
                  <input
                    type="checkbox"
                    checked={sessionConfig.enabledTypes.typing}
                    onChange={() => toggleType('typing')}
                    className="rounded-xs"
                  />
                  <span className="font-bold text-gray-800 text-[11px]">キーワード記述</span>
                </label>

                <label className="flex items-center gap-1.5 p-1.5 bg-gray-50 border border-gray-300 rounded-xs cursor-pointer hover:bg-blue-50">
                  <input
                    type="checkbox"
                    checked={sessionConfig.enabledTypes.recall}
                    onChange={() => toggleType('recall')}
                    className="rounded-xs"
                  />
                  <span className="font-bold text-gray-800 text-[11px]">分類想起</span>
                </label>
              </div>
            </div>

            {/* 問題数の選択 */}
            <div className="space-y-1">
              <span className="font-bold text-gray-700 block text-[11px]">
                出題問題数:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[5, 10, 20, 30, 999].map((count) => {
                  const isSelected = sessionConfig.questionCount === count;
                  const label = count === 999 ? '全問演習' : `${count}問`;
                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setSessionConfig((prev) => ({ ...prev, questionCount: count }))}
                      className={`px-3 py-1 border rounded-xs font-bold text-xs ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* スタートボタン */}
            <Link
              href={`/practice?count=${sessionConfig.questionCount}`}
              className="block w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-center text-xs rounded-xs shadow-xs"
            >
              上記の設定で演習を開始する（{sessionConfig.questionCount === 999 ? '全問題' : `${sessionConfig.questionCount}問`}）
            </Link>
          </div>

          {/* 2. 単元別対照表 */}
          <div className="bg-white border border-gray-300 rounded-xs overflow-hidden">
            <div className="bg-gray-100 px-3 py-1.5 border-b border-gray-300 flex items-center justify-between">
              <h2 className="text-xs font-bold text-gray-800">
                [単元別対照表] 源流思想・分野一覧
              </h2>
              <span className="text-[11px] text-gray-600 font-bold">
                源流思想 定着数: {totalMasteredCount} / {totalQuestionsCount} 問
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-[11px]">
                    <th className="py-1.5 px-2.5 font-semibold">単元・分野名</th>
                    <th className="py-1.5 px-2 font-semibold w-24">時代区分</th>
                    <th className="py-1.5 px-2 font-semibold w-16 text-center">定着率</th>
                    <th className="py-1.5 px-2.5 font-semibold text-right">単元別演習</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {CATEGORIES.map((cat, idx) => {
                    const st = categoryStats[cat.id] || { total: 0, mastered: 0, learning: 0, rate: 0 };
                    const isAvailable = cat.isAvailable;

                    return (
                      <tr
                        key={cat.id}
                        className={
                          !isAvailable
                            ? 'bg-gray-50/70 opacity-60'
                            : idx % 2 === 0
                            ? 'bg-white'
                            : 'bg-gray-50/50 hover:bg-blue-50/40'
                        }
                      >
                        <td className="py-2 px-2.5">
                          <div className="flex items-center gap-1.5">
                            {isAvailable ? (
                              <Link
                                href={`/practice?category=${cat.id}`}
                                className="font-bold text-blue-700 hover:underline"
                              >
                                {cat.name}
                              </Link>
                            ) : (
                              <span className="font-bold text-gray-500">{cat.name}</span>
                            )}

                            {!isAvailable && (
                              <span className="text-[9px] bg-gray-200 text-gray-600 px-1 py-0.2 rounded-xs">
                                準備中
                              </span>
                            )}
                            {isAvailable && (
                              <span className="text-[9px] bg-green-100 text-green-800 font-bold px-1 py-0.2 rounded-xs">
                                稼働中
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-500 line-clamp-1">
                            {cat.description}
                          </span>
                        </td>

                        <td className="py-2 px-2 text-[11px] text-gray-500">
                          {cat.era}
                        </td>

                        <td className="py-2 px-2 text-center">
                          {isAvailable ? (
                            <>
                              <div className="font-bold text-gray-800 text-[10px]">{st.rate}%</div>
                              <div className="w-12 bg-gray-200 h-1 rounded-full mx-auto overflow-hidden">
                                <div
                                  className="bg-blue-600 h-1 rounded-full"
                                  style={{ width: `${st.rate}%` }}
                                />
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-400 text-[10px]">-</span>
                          )}
                        </td>

                        <td className="py-2 px-2.5 text-right">
                          {isAvailable ? (
                            <Link
                              href={`/practice?category=${cat.id}`}
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-xs"
                            >
                              この単元を演習
                            </Link>
                          ) : (
                            <span className="text-[10px] text-gray-400 font-mono">Coming Soon</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ===================== 右側 サイドバー (4/12) ===================== */}
        <div className="lg:col-span-4 space-y-3">
          {/* 1. ユーザー学習サマリー */}
          <div className="bg-white border border-gray-300 rounded-xs p-3 space-y-2 text-xs">
            <div className="font-bold text-gray-800 border-b border-gray-200 pb-1 flex items-center justify-between">
              <span>[学習成績]</span>
              <Link href="/stats" className="text-[11px] text-blue-700 hover:underline">
                詳細分析 »
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div className="bg-gray-50 p-1.5 rounded-xs border border-gray-200">
                <span className="text-gray-500 block">連続学習</span>
                <strong className="text-sm text-orange-700">{profile?.streakDays || 1} 日</strong>
              </div>
              <div className="bg-gray-50 p-1.5 rounded-xs border border-gray-200">
                <span className="text-gray-500 block">獲得経験値</span>
                <strong className="text-sm text-blue-700">{profile?.xp || 0} XP</strong>
              </div>
              <div className="bg-gray-50 p-1.5 rounded-xs border border-gray-200">
                <span className="text-gray-500 block">総解答数</span>
                <strong className="text-sm text-gray-800">{profile?.totalAnswered || 0} 問</strong>
              </div>
              <div className="bg-gray-50 p-1.5 rounded-xs border border-gray-200">
                <span className="text-gray-500 block">定着完了</span>
                <strong className="text-sm text-green-700">{totalMasteredCount} 問</strong>
              </div>
            </div>
          </div>

          {/* 2. 直近7日間の日別学習問題数グラフ */}
          <DailyLineChart data={dailyData} />

          {/* 3. 全国ランキング TOP5 */}
          <div className="bg-white border border-gray-300 rounded-xs p-3 space-y-1.5 text-xs">
            <div className="font-bold text-gray-800 border-b border-gray-200 pb-1 flex items-center justify-between">
              <span>[全国ランキング TOP 5]</span>
              <Link href="/ranking" className="text-[11px] text-blue-700 hover:underline">
                全体 »
              </Link>
            </div>

            <div className="space-y-1">
              {topRankers.map((r) => (
                <div key={r.rank} className="flex items-center justify-between text-[11px] py-0.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-3.5 h-3.5 text-center font-bold text-[9px] leading-3.5 rounded-xs ${
                        r.rank === 1
                          ? 'bg-yellow-400 text-black'
                          : r.rank === 2
                          ? 'bg-gray-300 text-black'
                          : r.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'text-gray-500'
                      }`}
                    >
                      {r.rank}
                    </span>
                    <span className="font-semibold text-gray-800 truncate max-w-[120px]">{r.name}</span>
                  </div>
                  <span className="font-bold text-blue-700">{r.xp} XP</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. スポンサー広告枠 */}
          <AdBanner format="rectangle" label="Sponsor Link" />
        </div>
      </div>
    </div>
  );
}
