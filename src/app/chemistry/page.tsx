'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CATEGORIES, FOCUS_SERIES } from '@/data/chemistry/categories';
import { QuestionGenerator, AVAILABLE_CATEGORY_IDS } from '@/lib/chemistry/questionGenerator';
import { SRSEngine, CategoryDetailedStats } from '@/lib/srs/srsEngine';
import { UserDataStore } from '@/lib/storage/userDataStore';
import { UserProfile, Question, QuizSessionConfig } from '@/types';
import { AdBanner } from '@/components/ads/AdBanner';
import dynamic from 'next/dynamic';

const DailyLineChart = dynamic(
  () => import('@/components/chemistry/stats/DailyLineChart').then((mod) => mod.DailyLineChart),
  { ssr: false, loading: () => <div className="p-4 text-center text-xs text-gray-400">グラフ読み込み中...</div> }
);
import { ShareButtons } from '@/components/share/ShareButtons';
import { LearningStatusCard, LearningStatusItem } from '@/components/LearningStatusCard';

const categoryChipTone = (groupName?: string) => {
  if (groupName === 'ハロゲン・ハロゲン化銀シリーズ') return 'border-cyan-200 bg-cyan-50 text-cyan-900 hover:border-cyan-400';
  if (groupName === '炎色反応シリーズ') return 'border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-400';
  if (groupName === '酸化物・水酸化物シリーズ') return 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-400';
  if (groupName === '重要金属シリーズ') return 'border-violet-200 bg-violet-50 text-violet-900 hover:border-violet-400';
  return 'border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-400';
};
const GAS_MODE_LABELS: Record<string, string> = {
  all: '全範囲', gas_to_raw: '物質→原料', raw_to_gas: '原料→物質', heat: '加熱の有無',
  gas_to_collection: '物質→捕集法', collection_to_gas: '捕集法→物質',
  gas_to_drying: '物質→乾燥剤', drying_to_gas: '乾燥剤→物質',
};
const GAS_MODES = Object.keys(GAS_MODE_LABELS);

export default function HomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dueQuestions, setDueQuestions] = useState<Question[]>([]);
  const [searchWord, setSearchWord] = useState('');
  const [categoryStats, setCategoryStats] = useState<Record<string, CategoryDetailedStats>>({});
  const [totalMasteredCount, setTotalMasteredCount] = useState(0);
  const [totalQuestionsCount, setTotalQuestionsCount] = useState(0);
  const [gasStats, setGasStats] = useState<Record<string, { answered: number; correct: number; wrong: number; mastered: number; total: number }>>({});

  // 演習範囲ステート（全範囲 / 非金属元素 / 主要金属元素 / 遷移金属元素 / 沈殿反応）
  const [selectedScope, setSelectedScope] = useState<string>('all');
  const [onlyWeak, setOnlyWeak] = useState<boolean>(false);
  const [gasMode, setGasMode] = useState<'all' | 'raw_to_gas' | 'gas_to_raw' | 'heat' | 'gas_to_collection' | 'collection_to_gas' | 'gas_to_drying' | 'drying_to_gas'>('all');

  // 演習設定ステート
  const [sessionConfig, setSessionConfig] = useState<QuizSessionConfig>({
    categoryIds: AVAILABLE_CATEGORY_IDS,
    enabledTypes: {
      figureToKeyword: true,
      keywordToFigure: true,
      oddOneOut: false,
      pairValidation: false,
      matching: false,
    },
    questionCount: 10,
  });

  const handleScopeChange = (scope: string) => {
    setSelectedScope(scope);
    if (scope === 'gas' || (scope !== 'all' && GAS_MODES.includes(scope))) {
      if (GAS_MODES.includes(scope)) setGasMode(scope as typeof gasMode);
      setSessionConfig((prev) => ({ ...prev, categoryIds: [] }));
      return;
    }
    if (scope === 'all') {
      setSessionConfig((prev) => ({ ...prev, categoryIds: AVAILABLE_CATEGORY_IDS }));
    } else {
      const catIds = FOCUS_SERIES.find((series) => series.id === scope)?.categoryIds || [];
      setSessionConfig((prev) => ({ ...prev, categoryIds: catIds }));
    }
  };

  useEffect(() => {
    const p = UserDataStore.getProfile();
    const progressMap = UserDataStore.getProgressMap();
    const allQuestions = QuestionGenerator.getAllQuestions();

    setProfile(p);
    setTotalQuestionsCount(allQuestions.length);

    const due = SRSEngine.getDueQuestions(allQuestions, progressMap);
    setDueQuestions(due);

    let totalMastered = 0;
    const stats: Record<string, CategoryDetailedStats> = {};
    CATEGORIES.forEach((cat) => {
      const catQs = allQuestions.filter((q) => q.categoryId === cat.id);
      const res = SRSEngine.calculateCategoryStats(catQs, progressMap);
      stats[cat.id] = res;
      if (cat.isAvailable) {
        totalMastered += res.mastered;
      }
    });
    setCategoryStats(stats);
    setTotalMasteredCount(totalMastered);
    const gasPrefixes: Record<string, { prefix: string; total: number }> = {
      '物質→原料': { prefix: 'gas-raw-', total: 14 }, '原料→物質': { prefix: 'raw-gas-', total: 14 }, '加熱の有無': { prefix: 'gas-heat-', total: 14 },
      '物質→捕集法': { prefix: 'gas-col-', total: 14 }, '捕集法→物質': { prefix: 'col-gas-', total: 14 }, '物質→乾燥剤': { prefix: 'gas-dry-', total: 8 }, '乾燥剤→物質': { prefix: 'dry-gas-', total: 14 },
    };
    const nextGasStats: Record<string, { answered: number; correct: number; wrong: number; mastered: number; total: number }> = {};
    Object.entries(gasPrefixes).forEach(([label, meta]) => {
      const rows = Object.entries(progressMap).filter(([id]) => id.startsWith(meta.prefix));
      nextGasStats[label] = { total: meta.total, answered: rows.reduce((n, [, v]) => n + v.totalAttempts, 0), correct: rows.reduce((n, [, v]) => n + v.totalCorrect, 0), wrong: rows.filter(([, v]) => v.totalAttempts > v.totalCorrect).length, mastered: rows.filter(([, v]) => v.state === 'mastered').length };
    });
    setGasStats(nextGasStats);
  }, []);

  // 用語を入力しなくてもEnterでマップへ遷移可能に
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchWord.trim()) {
      router.push(`/chemistry/dictionary?q=${encodeURIComponent(searchWord.trim())}`);
    } else {
      router.push('/chemistry/dictionary');
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
    if (GAS_MODES.includes(selectedScope)) {
      router.push(`/chemistry/manufacturing?count=${sessionConfig.questionCount}&mode=${gasMode}`);
      return;
    }
    const params = new URLSearchParams();
    params.set('count', sessionConfig.questionCount.toString());
    params.set('f2k', sessionConfig.enabledTypes.figureToKeyword ? '1' : '0');
    params.set('k2f', sessionConfig.enabledTypes.keywordToFigure ? '1' : '0');
    if (onlyWeak) {
      params.set('weak', '1');
    }
    if (selectedScope !== 'all') {
      const selectedSeries = FOCUS_SERIES.find((series) => series.id === selectedScope);
      if (selectedSeries) params.set('group', selectedSeries.name + 'シリーズ');
    }
    router.push(`/chemistry/practice?${params.toString()}`);
  };



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
            href="/chemistry/practice?count=10"
            className="w-full sm:w-auto px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xs text-center shadow-xs shrink-0"
          >
            {dueQuestions.length > 0 ? '復習を開始する' : '演習を解く'}
          </Link>
        </div>

        {/* 物質・色検索バー（未入力Enter対応） */}
        <div className="bg-white border border-gray-300 p-2.5 rounded-xs">
          <form onSubmit={handleSearchSubmit} className="space-y-1">
            <label className="block text-[11px] font-bold text-gray-700">
              物質・色の検索 （空欄Enterで全体表示）
            </label>
            <div className="flex gap-1">
              <input
                type="text"
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                placeholder="例：Cl2、AgCl、黄色"
                className="flex-1 px-2 py-1 border border-gray-300 rounded-xs text-base sm:text-xs focus:outline-hidden focus:border-gray-500"
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
                共通テスト 無機化学 演習 (beta)
              </strong>
              <span className="text-[11px] text-gray-500">物質 ⇄ 色の対応関係特化</span>
            </div>

            {/* 出題範囲の選択（全範囲 / 非金属元素 / 主要金属元素 / 遷移金属元素 / 沈殿反応） */}
            <div className="space-y-1">
              <span className="font-bold text-gray-700 block text-[11px]">
                色暗記シリーズ
              </span>
              <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-gray-50/70 p-2">
                {[
                  { key: 'all', label: '全範囲', groupName: 'all' },
                  ...FOCUS_SERIES.map((series) => ({ key: series.id, label: series.name, groupName: CATEGORIES.find((c) => series.categoryIds.includes(c.id))?.groupName })),
                ].map(({ key, label, groupName }) => {
                  const isSel = selectedScope === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleScopeChange(key)}
                      aria-pressed={isSel}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-bold text-[11px] shadow-xs transition-all ${
                        isSel
                          ? 'border-gray-900 bg-gray-900 text-white shadow-md ring-2 ring-gray-900/10'
                          : categoryChipTone(groupName)
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${isSel ? 'bg-white' : 'bg-current opacity-60'}`} />
                      {label}
                    </button>
                  );
                })}
              </div>
              <span className="font-bold text-gray-700 block text-[11px] mt-2">製法暗記シリーズ</span>
              <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-gray-50/70 p-2">
                {[['all','全範囲'],['gas_to_raw','物質→原料'],['raw_to_gas','原料→物質'],['heat','加熱の有無'],['gas_to_collection','物質→捕集法'],['collection_to_gas','捕集法→物質'],['gas_to_drying','物質→乾燥剤'],['drying_to_gas','乾燥剤→物質']].map(([value,label]) => <button key={value} type="button" onClick={() => handleScopeChange(value)} aria-pressed={selectedScope === value} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-bold text-[11px] shadow-xs transition-all ${selectedScope === value ? 'border-gray-900 bg-gray-900 text-white shadow-md' : 'border-sky-200 bg-sky-50 text-sky-900 hover:border-sky-400'}`}><span className={`h-1.5 w-1.5 rounded-full ${selectedScope === value ? 'bg-white' : 'bg-current opacity-60'}`} />{label}</button>)}
              </div>
            </div>

            {/* 出題対象 */}
            <div className="space-y-1">
              <span className="font-bold text-gray-700 block text-[11px]">
                出題対象:
              </span>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-gray-850 text-[11px]">
                  <input
                    type="radio"
                    name="onlyWeak"
                    checked={!onlyWeak}
                    onChange={() => setOnlyWeak(false)}
                    className="rounded-xs text-gray-800 focus:ring-gray-800"
                  />
                  <span>全問題</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-red-650 text-[11px]">
                  <input
                    type="radio"
                    name="onlyWeak"
                    checked={onlyWeak}
                    onChange={() => setOnlyWeak(true)}
                    className="rounded-xs text-red-600 focus:ring-red-500"
                  />
                  <span>間違えた問題（弱点のみ）</span>
                </label>
              </div>
            </div>

            {/* 色暗記シリーズの問題形式 */}
            {!GAS_MODES.includes(selectedScope) && <div className="space-y-1 rounded-lg border border-gray-200 bg-gray-50/70 p-2">
              <span className="font-bold text-gray-700 block text-[11px]">
                出題形式:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {[
                  { key: 'figureToKeyword', label: '色 ➔ 物質' },
                  { key: 'keywordToFigure', label: '物質 ➔ 色' },
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
            </div>}

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
              【{GAS_MODES.includes(selectedScope) ? GAS_MODE_LABELS[selectedScope] : selectedScope === 'all' ? '色暗記・全範囲' : FOCUS_SERIES.find((series) => series.id === selectedScope)?.name}】演習を開始する（{sessionConfig.questionCount === 999 ? '全問題' : `${sessionConfig.questionCount}問`}）
            </button>
          </div>

          {/* ★ 2. シンプルな単元別対照表（単元名、定着率、ボタンのみ） ★ */}
          <div className="space-y-3"><div><h2 className="text-sm font-black text-gray-900">シリーズ別の学習状況</h2><p className="mt-0.5 text-[11px] text-gray-500">正解・不正解・定着をシリーズごとに確認できます。</p></div><div className="space-y-4">
            <LearningStatusCard title="色暗記シリーズ" items={Object.entries(categoryStats).filter(([id])=>CATEGORIES.some(c=>c.id===id&&c.isAvailable)).map(([id,s])=>({label:CATEGORIES.find(c=>c.id===id)?.name||'色暗記項目',total:s.total,answered:s.mastered+s.correct+s.wrong,correct:s.correct,wrong:s.wrong,mastered:s.mastered}))} />
            <LearningStatusCard title="製法暗記シリーズ" items={Object.entries(gasStats).map(([label,s])=>({label,...s}))} />
          </div>
          </div>
          <div className="hidden bg-white border border-gray-300 rounded-xs overflow-hidden">
            <div className="bg-gray-100 px-3 py-1.5 border-b border-gray-300 flex items-center justify-between">
              <h2 className="text-xs font-bold text-gray-800">
                シリーズ別の学習状況
              </h2>
              <span className="text-[11px] text-gray-600 font-bold">
                定着数: {totalMasteredCount} / {totalQuestionsCount} 問
              </span>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-[10px]">
                  <th className="py-1.5 px-3 font-semibold">色暗記シリーズ</th>
                  <th className="py-1.5 px-3 font-semibold text-center w-64">
                    <div className="flex items-center justify-between gap-1">
                      <span>学習率・進捗</span>
                      <span className="text-[9px] text-gray-500 font-normal">
                        <span className="text-green-700 font-bold">■</span>定着 <span className="text-blue-600 font-bold">■</span>正答 <span className="text-red-500 font-bold">■</span>誤答
                      </span>
                    </div>
                  </th>
                  <th className="py-1.5 px-3 font-semibold text-right w-20">演習</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {['物質と色（分類なしの項目も学習できます）'].map((group) => {
                  const groupCats = CATEGORIES.filter((cat) => cat.isAvailable);
                  return (
                    <React.Fragment key={group}>
                      <tr className="bg-gray-100/80 border-t border-b border-gray-300">
                        <td colSpan={3} className="py-1 px-3 font-black text-gray-800 text-[11px]">
                          ■ {group}
                        </td>
                      </tr>
                      {groupCats.map((cat, idx) => {
                        const st = categoryStats[cat.id] || {
                          total: 0,
                          mastered: 0,
                          correct: 0,
                          wrong: 0,
                          unattempted: 0,
                          studyRate: 0,
                          masteredRate: 0,
                          correctRate: 0,
                          wrongRate: 0,
                          rate: 0,
                          learning: 0,
                        };
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
                            <td className="py-2 px-3 font-bold text-gray-900 pl-5">
                              {cat.name}
                            </td>

                            {/* 2. 学習率 ＆ 3色プログレスバー */}
                            <td className="py-2 px-3">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-bold text-gray-900">
                                    学習率: {st.studyRate}%
                                  </span>
                                  <span className="text-[10px] text-gray-500">
                                    {st.mastered + st.correct + st.wrong} / {st.total}問
                                  </span>
                                </div>

                                {/* 3色プログレスバー */}
                                <div className="w-full bg-gray-200 h-2 rounded-xs flex overflow-hidden border border-gray-300">
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

                                {/* 内訳テキスト */}
                                <div className="flex items-center justify-between text-[9px] text-gray-500 pt-0.5">
                                  <span className="text-green-800 font-bold">
                                    定着: {st.mastered}問 ({st.masteredRate}%)
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-red-600 font-bold">
                                      誤答: {st.wrong}問 ({st.wrongRate}%)
                                    </span>
                                    {st.wrong > 0 && isAvailable && (
                                      <Link
                                        href={`/chemistry/practice?category=${cat.id}&count=10&weak=1`}
                                        className="px-1 py-0.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-[9px] rounded-xs transition"
                                      >
                                        弱点演習
                                      </Link>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* 3. 演習ボタン */}
                            <td className="py-2 px-3 text-right align-middle">
                              {isAvailable ? (
                                <Link
                                  href={`/chemistry/practice?category=${cat.id}&count=10`}
                                  className="px-2.5 py-1 bg-gray-800 hover:bg-black text-white font-bold text-[11px] rounded-xs shadow-xs"
                                >
                                  演習
                                </Link>
                              ) : (
                                <span className="text-[10px] text-gray-500 font-bold bg-gray-200 px-2 py-1 rounded-xs select-none">
                                  準備中
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
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
              <Link href="/chemistry/stats" className="text-[11px] text-blue-700 hover:underline">
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
                text={`【共テ無機化学パーフェクトマスター.com】で学習中！
連続学習: ${profile?.streakDays || 1}日 | 解答数: ${profile?.totalAnswered || 0}問 | 定着数: ${totalMasteredCount}問
#共通テスト #化学 #無機化学`}
                buttonLabel="𝕏 で記録をシェア"
              />
            </div>
          </div>

          {/* 2. 学習問題数 折れ線グラフ（全期間・30日・14日・7日切り替え可能） */}
          <DailyLineChart initialDays={7} />



          {/* 4. スポンサー広告枠 */}
          <AdBanner format="rectangle" label="Sponsor Link" />
        </div>
      </div>
    </div>
  );
}












