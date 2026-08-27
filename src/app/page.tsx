'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap,
  Play,
  Sparkles,
  BookOpen,
  ArrowRight,
  Clock,
  Layers,
  ChevronRight,
  Brain,
  Edit3,
  Network,
} from 'lucide-react';
import { CATEGORIES } from '@/data/categories';
import { QuestionGenerator } from '@/lib/generator/questionGenerator';
import { SRSEngine } from '@/lib/srs/srsEngine';
import { UserDataStore } from '@/lib/storage/userDataStore';
import { Question, Badge } from '@/types';
import { AdBanner } from '@/components/ads/AdBanner';
import { BadgeUnlockedModal } from '@/components/gamification/BadgeUnlockedModal';

export default function HomePage() {
  const [dueQuestions, setDueQuestions] = useState<Question[]>([]);
  const [activeBadge, setActiveBadge] = useState<Badge | null>(null);
  const [categoryStats, setCategoryStats] = useState<
    Record<string, { total: number; mastered: number; rate: number }>
  >({});

  useEffect(() => {
    const progressMap = UserDataStore.getProgressMap();
    const allQuestions = QuestionGenerator.getAllQuestions();

    // 今日復習すべき問題を抽出
    const due = SRSEngine.getDueQuestions(allQuestions, progressMap);
    setDueQuestions(due);

    // 単元別統計
    const stats: Record<string, { total: number; mastered: number; rate: number }> = {};
    CATEGORIES.forEach((cat) => {
      const catQs = allQuestions.filter((q) => q.categoryId === cat.id);
      const res = SRSEngine.calculateCategoryStats(catQs, progressMap);
      stats[cat.id] = { total: res.total, mastered: res.mastered, rate: res.rate };
    });
    setCategoryStats(stats);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* バッジ解放モーダル */}
      <BadgeUnlockedModal badge={activeBadge} onClose={() => setActiveBadge(null)} />

      {/* トップヒーロー ＆ 今日の復習ステータス */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>共通テスト「公共、倫理」構造的記憶システム</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              思想のつながりを、<br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-indigo-200">
                脳に焼き付ける。
              </span>
            </h1>

            <p className="text-indigo-100/80 text-xs sm:text-sm leading-relaxed max-w-xl">
              単なる一問一答ではなく、人物・キーワード・定義・著書・エピソードを交差させて暗記。
              忘却曲線アルゴリズムが最適な復習タイミングを自動計算します。
            </p>

            {/* クイックアクション */}
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/practice/speed"
                className="py-3 px-6 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 transition transform active:scale-95 text-xs sm:text-sm flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                スピード暗記（mikan風）を始める
              </Link>
              <Link
                href="/practice/standard"
                className="py-3 px-5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl backdrop-blur-md transition text-xs sm:text-sm flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                分野別演習（道場風）
              </Link>
            </div>
          </div>

          {/* 今日の復習カード */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-indigo-200 font-semibold mb-2">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-300" />
                  今日やるべき復習キュー
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold">
                  SM-2 Algorithm
                </span>
              </div>

              <div className="text-3xl sm:text-4xl font-black text-white mb-1">
                {dueQuestions.length} <span className="text-sm font-normal text-indigo-200">問</span>
              </div>
              <p className="text-xs text-indigo-200/80">
                {dueQuestions.length > 0
                  ? '忘却曲線に基づき、今日復習すると記憶定着率が最も高まる問題です。'
                  : '今日の復習は完了しています！新規の単元学習に進みましょう。'}
              </p>
            </div>

            <Link
              href={dueQuestions.length > 0 ? '/practice/speed?mode=due' : '/practice/speed'}
              className="w-full py-3 bg-white text-indigo-900 hover:bg-indigo-50 rounded-xl font-bold text-center text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-1.5"
            >
              <Play className="w-4 h-4 fill-indigo-900" />
              {dueQuestions.length > 0 ? '復習キューを開始する' : '新しい問題を解く'}
            </Link>
          </div>
        </div>
      </div>

      {/* トップ広告枠 */}
      <AdBanner label="Sponsor" />

      {/* 5つの演習モード選択セクション */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              特訓モードを選ぶ
            </h2>
            <p className="text-xs text-gray-500">目的に応じた多彩な出題形式で飽きずに完全網羅</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* モード1: mikan風スピード暗記 */}
          <Link
            href="/practice/speed"
            className="group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-gray-200/80 hover:border-indigo-400 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
                <Zap className="w-6 h-6 fill-amber-500 text-amber-500" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 px-2 py-0.5 bg-amber-50 rounded-full inline-block">
                mikanスタイル
              </span>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition">
                スピード暗記特訓
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                1問3秒でサクサク回す4択カード演習。人物・キーワード・著書をテンポよく反射レベルで即答。
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>演習を開始する</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* モード2: 過去問道場風詳細演習 */}
          <Link
            href="/practice/standard"
            className="group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-gray-200/80 hover:border-indigo-400 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-full inline-block">
                道場スタイル
              </span>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition">
                共テ実践・深堀り道場
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                全問題に「判断語句のひっかけ解説」付き。共通テスト特有の紛らわしい選択肢の見分け方を伝授。
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>演習を開始する</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* モード3: 線つなぎマッチング */}
          <Link
            href="/practice/matching"
            className="group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-gray-200/80 hover:border-indigo-400 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-600 flex items-center justify-center group-hover:scale-110 transition">
                <Network className="w-6 h-6 text-violet-600" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 px-2 py-0.5 bg-violet-50 rounded-full inline-block">
                相関マップ
              </span>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition">
                線つなぎマッチング
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                人物とキーワード・著書を左右タップで対応づけるパズル感覚の演習。思想の相関関係を立体的に整理。
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>演習を開始する</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* モード4: キーワード記述マスター */}
          <Link
            href="/practice/typing"
            className="group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-gray-200/80 hover:border-indigo-400 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
                <Edit3 className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded-full inline-block">
                完全定着
              </span>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition">
                キーワード記述マスター
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                定義や人物名から用語を直接入力。うろ覚えを徹底排除し、記述・スペルまで正確に定着させます。
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>演習を開始する</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* モード5: 分類想起トレーニング */}
          <Link
            href="/practice/recall"
            className="group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-gray-200/80 hover:border-indigo-400 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition">
                <Brain className="w-6 h-6 text-cyan-600" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 px-2 py-0.5 bg-cyan-50 rounded-full inline-block">
                アクティブリコール
              </span>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition">
                分類想起セルフチェック
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                「〇〇に属する人物を3人答えよ」などの高次想起問題。模範解答を確認して自己評価を行います。
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>演習を開始する</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* モード6: 思想・用語図鑑 */}
          <Link
            href="/dictionary"
            className="group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-gray-200/80 hover:border-indigo-400 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center group-hover:scale-110 transition">
                <Layers className="w-6 h-6 text-rose-600" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 px-2 py-0.5 bg-rose-50 rounded-full inline-block">
                ナレッジベース
              </span>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition">
                思想・用語図鑑
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                共テ頻出の哲学者・キーワード・著書・エピソードを体系的に検索・閲覧できるデジタルナレッジ図鑑。
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>図鑑を開く</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>
      </section>

      {/* 単元別マスター状況セクション */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              単元別マスター進捗
            </h2>
            <p className="text-xs text-gray-500">分野ごとの定着度と忘却曲線のステータス</p>
          </div>
          <Link
            href="/stats"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            詳細分析 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.slice(0, 8).map((cat) => {
            const stat = categoryStats[cat.id] || { total: 0, mastered: 0, rate: 0 };
            return (
              <Link
                key={cat.id}
                href={`/practice/standard?category=${cat.id}`}
                className="bg-white rounded-2xl p-4 border border-gray-200/80 hover:border-indigo-300 shadow-xs hover:shadow-md transition group"
              >
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="text-gray-800 truncate">{cat.shortName}</span>
                  <span className="text-indigo-600 font-extrabold">{stat.rate}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden mb-2">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${stat.rate}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span>{cat.era}</span>
                  <span>
                    {stat.mastered} / {stat.total}問
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
