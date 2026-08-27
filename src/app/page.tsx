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
import { ShareButtons } from '@/components/share/ShareButtons';

export default function HomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dueQuestions, setDueQuestions] = useState<Question[]>([]);
  const [searchWord, setSearchWord] = useState('');
  const [categoryStats, setCategoryStats] = useState<
    Record<string, { total: number; mastered: number; learning: number; rate: number }>
  >({});
  const [totalMasteredCount, setTotalMasteredCount] = useState(0);
  const [totalQuestionsCount, setTotalQuestionsCount] = useState(0);

  // 演習設定ステート
  const [sessionConfig, setSessionConfig] = useState<QuizSessionConfig>({
    categoryIds: AVAILABLE_CATEGORY_IDS,
    enabledTypes: {
      figureToKeyword: true,
      keywordToFigure: true,
      oddOneOut: true,
      pairValidation: true,
      matching: true,
    },
    questionCount: 10,
  });

  useEffect(() => {
    const p = UserDataStore.getProfile();
    const progressMap = UserDataStore.getProgressMap();
    const allQuestions = QuestionGenerator.getAllQuestions();

    setProfile(p);
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

  // 用語を入力しなくてもEnterでマップへ遷移可能に
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchWord.trim()) {
      router.push(`/dictionary?q=${encodeURIComponent(searchWord.trim())}`);
    } else {
      router.push('/dictionary');
    }
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

  const handleStartPracticeDirect = () => {
    const params = new URLSearchParams();
    params.set('count', sessionConfig.questionCount.toString());
    params.set('f2k', sessionConfig.enabledTypes.figureToKeyword ? '1' : '0');
    params.set('k2f', sessionConfig.enabledTypes.keywordToFigure ? '1' : '0');
    params.set('odd', sessionConfig.enabledTypes.oddOneOut ? '1' : '0');
    params.set('pair', sessionConfig.enabledTypes.pairValidation ? '1' : '0');
    params.set('matching', sessionConfig.enabledTypes.matching ? '1' : '0');
    router.push(`/practice?${params.toString()}`);
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
              復習
            </span>
            <div className="text-xs text-gray-900">
              <strong className="text-xs font-bold text-red-600">
                本日の忘却曲線 復習キュー: {dueQuestions.length} 問
              </strong>
              <p className="text-gray-600 text-[11px] mt-0.5">
                {dueQuestions.length > 0
                  ? 'SM-2アルゴリズムにより本日復習期日に達した問題です。'
                  : '今日の復習は完了しています。演習を進めましょう。'}
              </p>
            </div>
          </div>

          <Link
            href="/practice?count=10"
            className="w-full sm:w-auto px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xs text-center shadow-xs shrink-0"
          >
            {dueQuestions.length > 0 ? '復習を開始する' : '演習を解く'}
          </Link>
        </div>

        {/* 用語・人物検索バー（未入力Enter対応） */}
        <div className="bg-white border border-gray-300 p-2.5 rounded-xs">
          <form onSubmit={handleSearchSubmit} className="space-y-1">
            <label className="block text-[11px] font-bold text-gray-700">
              思想・人物マップ検索 （空欄Enterで全体表示）
            </label>
            <div className="flex gap-1">
              <input
                type="text"
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                placeholder="例: エピクロス、仁（未入力でEnterも可）"
                className="flex-1 px-2 py-1 border border-gray-300 rounded-xs text-xs focus:outline-hidden focus:border-gray-500"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-gray-800 hover:bg-black text-white text-xs font-bold rounded-xs"
              >
                対応表開く
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 2カラム構成：左側メイン / 右側サイドバー */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* ===================== 左側 メインコンテンツ (8/12) ===================== */}
        <div className="lg:col-span-8 space-y-3">
          {/* ★ 1. 演習設定パネル ★ */}
          <div className="bg-white border border-gray-400 rounded-xs p-3.5 space-y-2.5 text-xs text-gray-900 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
              <strong className="text-sm font-bold text-gray-900">
                源流・日本思想・青年期 演習
              </strong>
              <span className="text-[11px] text-gray-500">人物 ⇄ 語句の対応関係特化</span>
            </div>

            {/* 問題形式 */}
            <div className="space-y-1">
              <span className="font-bold text-gray-700 block text-[11px]">
                出題形式:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {[
                  { key: 'figureToKeyword', label: '人物 ➔ 語句' },
                  { key: 'keywordToFigure', label: '語句 ➔ 人物' },
                  { key: 'oddOneOut', label: '仲間はずれ' },
                  { key: 'pairValidation', label: 'ペア正誤判定' },
                  { key: 'matching', label: '線つなぎ（6択）' },
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center gap-1.5 p-1.5 bg-gray-50 border border-gray-300 rounded-xs cursor-pointer hover:bg-gray-100"
                  >
                    <input
                      type="checkbox"
                      checked={sessionConfig.enabledTypes[key as keyof QuizSessionConfig['enabledTypes']]}
                      onChange={() => toggleType(key as keyof QuizSessionConfig['enabledTypes'])}
                      className="rounded-xs"
                    />
                    <span className="font-bold text-gray-800 text-[11px]">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 問題数の選択 */}
            <div className="space-y-1">
              <span className="font-bold text-gray-700 block text-[11px]">
                問題数:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[5, 10, 20, 30, 999].map((count) => {
                  const isSelected = sessionConfig.questionCount === count;
                  const label = count === 999 ? '全問' : `${count}問`;
                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setSessionConfig((prev) => ({ ...prev, questionCount: count }))}
                      className={`px-3 py-1 border rounded-xs font-bold text-xs ${
                        isSelected
                          ? 'bg-gray-800 text-white border-gray-800'
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
            <button
              type="button"
              onClick={handleStartPracticeDirect}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-center text-xs rounded-xs shadow-xs"
            >
              演習を開始する（{sessionConfig.questionCount === 999 ? '全問題' : `${sessionConfig.questionCount}問`}）
            </button>
          </div>

          {/* ★ 2. シンプルな単元別対照表（単元名、定着率、ボタンのみ） ★ */}
          <div className="bg-white border border-gray-300 rounded-xs overflow-hidden">
            <div className="bg-gray-100 px-3 py-1.5 border-b border-gray-300 flex items-center justify-between">
              <h2 className="text-xs font-bold text-gray-800">
                単元別一覧
              </h2>
              <span className="text-[11px] text-gray-600 font-bold">
                定着数: {totalMasteredCount} / {totalQuestionsCount} 問
              </span>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-[11px]">
                  <th className="py-1.5 px-3 font-semibold">単元名</th>
                  <th className="py-1.5 px-3 font-semibold w-32 text-center">定着率</th>
                  <th className="py-1.5 px-3 font-semibold text-right w-24">演習</th>
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
                          ? 'bg-gray-50/60 opacity-50'
                          : idx % 2 === 0
                          ? 'bg-white'
                          : 'bg-gray-50/40 hover:bg-gray-100/60'
                      }
                    >
                      {/* 1. 単元名 */}
                      <td className="py-2 px-3 font-bold text-gray-900">
                        {cat.name}
                        {!isAvailable && (
                          <span className="ml-1.5 text-[9px] bg-gray-200 text-gray-600 font-normal px-1 py-0.2 rounded-xs">
                            準備中
                          </span>
                        )}
                      </td>

                      {/* 2. 定着率 */}
                      <td className="py-2 px-3 text-center">
                        {isAvailable ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-gray-800 h-1.5 rounded-full"
                                style={{ width: `${st.rate}%` }}
                              />
                            </div>
                            <span className="font-bold text-gray-800 text-[11px] w-8 text-right">
                              {st.rate}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[10px]">-</span>
                        )}
                      </td>

                      {/* 3. 演習ボタン */}
                      <td className="py-2 px-3 text-right">
                        {isAvailable ? (
                          <Link
                            href={`/practice?category=${cat.id}&count=10`}
                            className="px-2.5 py-1 bg-gray-800 hover:bg-black text-white font-bold text-[11px] rounded-xs"
                          >
                            演習
                          </Link>
                        ) : (
                          <span className="text-[10px] text-gray-400">準備中</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===================== 右側 サイドバー (4/12) ===================== */}
        <div className="lg:col-span-4 space-y-3">
          {/* 1. ユーザー学習サマリー */}
          <div className="bg-white border border-gray-300 rounded-xs p-3 space-y-2 text-xs">
            <div className="font-bold text-gray-800 border-b border-gray-200 pb-1 flex items-center justify-between">
              <span>学習成績</span>
              <Link href="/stats" className="text-[11px] text-blue-700 hover:underline">
                詳細 »
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <div className="bg-gray-50 p-1.5 rounded-xs border border-gray-200">
                <span className="text-gray-500 block">連続学習</span>
                <strong className="text-xs text-orange-700">{profile?.streakDays || 1} 日</strong>
              </div>
              <div className="bg-gray-50 p-1.5 rounded-xs border border-gray-200">
                <span className="text-gray-500 block">経験値</span>
                <strong className="text-xs text-blue-700">{profile?.xp || 0} XP</strong>
              </div>
              <div className="bg-gray-50 p-1.5 rounded-xs border border-gray-200">
                <span className="text-gray-500 block">総解答数</span>
                <strong className="text-xs text-gray-800">{profile?.totalAnswered || 0} 問</strong>
              </div>
              <div className="bg-gray-50 p-1.5 rounded-xs border border-gray-200">
                <span className="text-gray-500 block">定着数</span>
                <strong className="text-xs text-green-700">{totalMasteredCount} 問</strong>
              </div>
              <div className="bg-gray-50 p-1.5 rounded-xs border border-gray-200 col-span-2">
                <span className="text-gray-500 block">総学習時間</span>
                <strong className="text-xs text-indigo-700">
                  {UserDataStore.formatStudyTime(profile?.totalStudyTimeSeconds || 0)}
                </strong>
              </div>
            </div>

            {/* シェアボタン */}
            <div className="pt-1 border-t border-gray-100 flex justify-end">
              <ShareButtons
                text={`【公共倫理パーフェクトマスター.com】で学習中！\n連続学習: ${profile?.streakDays || 1}日 | 解答数: ${profile?.totalAnswered || 0}問 | 定着数: ${totalMasteredCount}問\n#共通テスト #倫理 #公共`}
                buttonLabel="𝕏 で記録をシェア"
              />
            </div>
          </div>

          {/* 2. 学習問題数 折れ線グラフ（全期間・30日・14日・7日切り替え可能） */}
          <DailyLineChart initialDays={7} />

          {/* 3. 全国ランキング TOP5 */}
          <div className="bg-white border border-gray-300 rounded-xs p-3 space-y-1.5 text-xs">
            <div className="font-bold text-gray-800 border-b border-gray-200 pb-1 flex items-center justify-between">
              <span>ランキング TOP 5</span>
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
