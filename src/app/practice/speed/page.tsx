'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { QuestionGenerator } from '@/lib/generator/questionGenerator';
import { SRSEngine } from '@/lib/srs/srsEngine';
import { UserDataStore } from '@/lib/storage/userDataStore';
import { ChoiceQuestion, CategoryId, Badge } from '@/types';
import { ChoiceQuiz } from '@/components/quiz/ChoiceQuiz';
import { QuizResult } from '@/components/quiz/QuizResult';
import { BadgeUnlockedModal } from '@/components/gamification/BadgeUnlockedModal';
import { CATEGORIES } from '@/data/categories';
import { Zap, Filter, Sparkles } from 'lucide-react';

function SpeedQuizContent() {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get('mode');
  const catParam = searchParams.get('category') as CategoryId | null;

  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>(
    catParam || 'all'
  );
  const [questions, setQuestions] = useState<ChoiceQuestion[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState<{ correct: number; total: number; xp: number } | null>(
    null
  );
  const [activeBadge, setActiveBadge] = useState<Badge | null>(null);

  const loadQuestions = useCallback(() => {
    let pool: ChoiceQuestion[] = [];

    if (modeParam === 'due') {
      const allQs = QuestionGenerator.getAllQuestions();
      const progressMap = UserDataStore.getProgressMap();
      const due = SRSEngine.getDueQuestions(allQs, progressMap);
      pool = due.filter(
        (q) =>
          q.type === 'figure_to_keyword' ||
          q.type === 'keyword_to_figure' ||
          q.type === 'keyword_meaning' ||
          q.type === 'figure_to_book' ||
          q.type === 'book_to_figure' ||
          q.type === 'figure_to_episode'
      ) as ChoiceQuestion[];
    }

    if (pool.length === 0) {
      const cat = selectedCategory === 'all' ? undefined : selectedCategory;
      const f2k = QuestionGenerator.generateFigureToKeyword(cat);
      const k2f = QuestionGenerator.generateKeywordToFigure(cat);
      const km = QuestionGenerator.generateKeywordMeaning(cat);
      const books = QuestionGenerator.generateBookQuestions(cat);
      const eps = QuestionGenerator.generateEpisodeQuestions(cat);
      pool = [...f2k, ...k2f, ...km, ...books, ...eps];
    }

    // ランダムに10問抽出
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestions(shuffled);
    setIsCompleted(false);
    setResults(null);
  }, [selectedCategory, modeParam]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleComplete = (stats: { correct: number; total: number; xp: number }) => {
    setResults(stats);
    setIsCompleted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <BadgeUnlockedModal badge={activeBadge} onClose={() => setActiveBadge(null)} />

      {/* ヘッダーエリア */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-1">
            <Zap className="w-3.5 h-3.5 fill-amber-600 text-amber-600" />
            <span>mikan風 スピード暗記特訓 (10問)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">
            {modeParam === 'due' ? '今日の復習キュー特訓' : 'スピード暗記マスター'}
          </h1>
        </div>

        {/* 単元フィルター */}
        {!isCompleted && modeParam !== 'due' && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as CategoryId | 'all')}
              className="text-xs font-semibold bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">全単元から出題 (10問)</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.shortName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* クイズ実行部 */}
      {!isCompleted ? (
        questions.length > 0 ? (
          <ChoiceQuiz
            questions={questions}
            isSpeedMode={true}
            onComplete={handleComplete}
            onBadgeUnlocked={(b) => setActiveBadge(b)}
          />
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm space-y-4">
            <Sparkles className="w-12 h-12 text-indigo-400 mx-auto" />
            <h3 className="text-lg font-bold text-gray-800">出題可能な問題がありません</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              復習キューが空か、該当単元の問題がすべてマスター済みです。
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                loadQuestions();
              }}
              className="py-2.5 px-6 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-indigo-700 transition"
            >
              全単元から出題する
            </button>
          </div>
        )
      ) : (
        <QuizResult
          totalQuestions={results?.total || 10}
          correctCount={results?.correct || 0}
          xpEarned={results?.xp || 0}
          onRetry={loadQuestions}
          modeTitle="スピード暗記特訓"
        />
      )}
    </div>
  );
}

export default function SpeedPracticePage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-500">読み込み中...</div>}>
      <SpeedQuizContent />
    </Suspense>
  );
}

