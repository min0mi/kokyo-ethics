'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CATEGORIES } from '@/data/categories';
import { QuestionGenerator } from '@/lib/generator/questionGenerator';
import { SRSEngine } from '@/lib/srs/srsEngine';
import { UserDataStore } from '@/lib/storage/userDataStore';
import { UserProfile, Question } from '@/types';
import { BADGES } from '@/data/badges';
import { AdBanner } from '@/components/ads/AdBanner';

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

  useEffect(() => {
    const p = UserDataStore.getProfile();
    const progressMap = UserDataStore.getProgressMap();
    const allQuestions = QuestionGenerator.getAllQuestions();

    setProfile(p);
    setTotalQuestionsCount(allQuestions.length);

    // 今日復習すべき問題
    const due = SRSEngine.getDueQuestions(allQuestions, progressMap);
    setDueQuestions(due);

    // 単元別統計
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

  // ランキング簡易データ
  const topRankers = [
    { rank: 1, name: 'ソクラテスの弟子', xp: 4850, streak: 24 },
    { rank: 2, name: 'イデア探求者', xp: 4120, streak: 18 },
    { rank: 3, name: 'カントの散歩道', xp: 3740, streak: 15 },
    { rank: 4, name: '超人ニーチェ', xp: 3200, streak: 12 },
    { rank: 5, name: '実存サルトル', xp: 2850, streak: 9 },
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
                  : '今日の復習は完了しています。源流思想の単元学習を進めましょう。'}
              </p>
            </div>
          </div>

          <Link
            href={dueQuestions.length > 0 ? '/practice/speed?mode=due' : '/practice/speed'}
            className="w-full sm:w-auto px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xs text-center shadow-xs shrink-0"
          >
            {dueQuestions.length > 0 ? '復習を開始する' : '全問ランダム演習'}
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
                placeholder="例: イデア、ソクラテス、無知の知"
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
          {/* 1. 演習モード一覧（6分割パネル） */}
          <div className="bg-white border border-gray-300 rounded-xs overflow-hidden">
            <div className="bg-gray-100 px-3 py-1.5 border-b border-gray-300 flex items-center justify-between">
              <h2 className="text-xs font-bold text-gray-800">
                [演習モード一覧] 問題形式から選ぶ
              </h2>
              <span className="text-[11px] text-gray-500">源流思想対応</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y divide-gray-200 text-xs">
              <Link
                href="/practice/speed"
                className="p-2.5 hover:bg-blue-50 transition flex flex-col justify-between space-y-1 group"
              >
                <div className="flex items-center gap-1 font-bold text-blue-700 group-hover:underline">
                  <span>スピード演習</span>
                  <span className="text-[10px] bg-yellow-100 text-yellow-900 px-1 rounded-xs">即答10問</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-tight">
                  1問3秒で4択即答。キーボード[1-4]対応・正解時自動送り。
                </p>
              </Link>

              <Link
                href="/practice/standard"
                className="p-2.5 hover:bg-blue-50 transition flex flex-col justify-between space-y-1 group"
              >
                <div className="flex items-center gap-1 font-bold text-blue-700 group-hover:underline">
                  <span>標準解説演習</span>
                  <span className="text-[10px] bg-blue-100 text-blue-900 px-1 rounded-xs">判断ポイント</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-tight">
                  判断語句のひっかけ解説付き。共通テスト本番対策。
                </p>
              </Link>

              <Link
                href="/practice/matching"
                className="p-2.5 hover:bg-blue-50 transition flex flex-col justify-between space-y-1 group"
              >
                <div className="flex items-center gap-1 font-bold text-blue-700 group-hover:underline">
                  <span>線つなぎ演習</span>
                  <span className="text-[10px] bg-purple-100 text-purple-900 px-1 rounded-xs">6択余りあり</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-tight">
                  人物と語句・主著を対応づけ。余分な選択肢が含まれます。
                </p>
              </Link>

              <Link
                href="/practice/typing"
                className="p-2.5 hover:bg-blue-50 transition flex flex-col justify-between space-y-1 group"
              >
                <div className="flex items-center gap-1 font-bold text-blue-700 group-hover:underline">
                  <span>キーワード記述</span>
                  <span className="text-[10px] bg-green-100 text-green-900 px-1 rounded-xs">用語入力</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-tight">
                  定義から用語をキーボード入力。正確な用字を定着。
                </p>
              </Link>

              <Link
                href="/practice/recall"
                className="p-2.5 hover:bg-blue-50 transition flex flex-col justify-between space-y-1 group"
              >
                <div className="flex items-center gap-1 font-bold text-blue-700 group-hover:underline">
                  <span>分類想起演習</span>
                  <span className="text-[10px] bg-cyan-100 text-cyan-900 px-1 rounded-xs">自己採点</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-tight">
                  「〇〇派の人物を3人答えよ」などのアクティブリコール。
                </p>
              </Link>

              <Link
                href="/dictionary"
                className="p-2.5 hover:bg-blue-50 transition flex flex-col justify-between space-y-1 group"
              >
                <div className="flex items-center gap-1 font-bold text-blue-700 group-hover:underline">
                  <span>思想・用語図鑑</span>
                  <span className="text-[10px] bg-gray-200 text-gray-800 px-1 rounded-xs">全項目検索</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-tight">
                  思想家・用語・著書・エピソードの検索＆一覧。
                </p>
              </Link>
            </div>
          </div>

          {/* 2. 単元別一覧表（源流思想を本稼働、その他は準備中） */}
          <div className="bg-white border border-gray-300 rounded-xs overflow-hidden">
            <div className="bg-gray-100 px-3 py-1.5 border-b border-gray-300 flex items-center justify-between">
              <h2 className="text-xs font-bold text-gray-800">
                [単元別 演習対照表] 源流思想・分野から直接選ぶ
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
                    <th className="py-1.5 px-2.5 font-semibold text-right">演習リンク</th>
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
                                href={`/practice/standard?category=${cat.id}`}
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
                            <div className="inline-flex items-center gap-1">
                              <Link
                                href={`/practice/speed?category=${cat.id}`}
                                className="px-1.5 py-0.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold text-[10px] rounded-xs"
                                title="スピード4択"
                              >
                                4択
                              </Link>
                              <Link
                                href={`/practice/matching?category=${cat.id}`}
                                className="px-1.5 py-0.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] rounded-xs"
                                title="線つなぎ（6択）"
                              >
                                線つなぎ
                              </Link>
                              <Link
                                href={`/practice/typing?category=${cat.id}`}
                                className="px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-xs"
                                title="キーワード記述"
                              >
                                記述
                              </Link>
                              <Link
                                href={`/practice/recall?category=${cat.id}`}
                                className="px-1.5 py-0.5 bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-[10px] rounded-xs"
                                title="分類想起"
                              >
                                想起
                              </Link>
                            </div>
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

          {/* 2. 全国ランキング TOP5 */}
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

          {/* 3. バッジ獲得状況ミニ */}
          <div className="bg-white border border-gray-300 rounded-xs p-3 space-y-1.5 text-xs">
            <div className="font-bold text-gray-800 border-b border-gray-200 pb-1 flex items-center justify-between">
              <span>[バッジ実績]</span>
              <Link href="/badges" className="text-[11px] text-blue-700 hover:underline">
                全13種 »
              </Link>
            </div>

            <div className="grid grid-cols-4 gap-1 pt-0.5 text-center">
              {BADGES.slice(0, 8).map((b) => {
                const isUnlocked = profile?.unlockedBadgeIds.includes(b.id);
                return (
                  <div
                    key={b.id}
                    className={`p-1 rounded-xs border text-[9px] truncate ${
                      isUnlocked
                        ? 'bg-yellow-50 border-yellow-300 text-yellow-900 font-bold'
                        : 'bg-gray-50 border-gray-200 text-gray-400'
                    }`}
                    title={`${b.name}: ${b.description}`}
                  >
                    {isUnlocked ? '[済]' : '[未]'} {b.name}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. スポンサー広告枠 */}
          <AdBanner format="rectangle" label="Sponsor Link" />

          {/* 5. ご案内 */}
          <div className="bg-white border border-gray-300 rounded-xs p-2.5 space-y-1 text-xs text-gray-600">
            <div className="font-bold text-gray-800 border-b border-gray-200 pb-1">
              [共通テスト源流思想の攻略法]
            </div>
            <ul className="list-disc pl-3.5 space-y-0.5 text-[11px] text-gray-700">
              <li>ギリシャ思想: ソクラテス/プラトン/アリストテレスの内在・超越の対比。</li>
              <li>宗教思想: キリスト教の「アガペー」とイスラームの「六信五行」。</li>
              <li>中国思想: 儒家（孔子・孟子・荀子）の徳治と法家・道家の相違。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
