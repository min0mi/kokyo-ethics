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

  // 源流思想のみを抽出
  const availableCategories = CATEGORIES.filter((c) => c.isAvailable);

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
    <div className="max-w-4xl mx-auto px-3 py-5 space-y-4">
      <BadgeUnlockedModal badge={activeBadge} onClose={() => setActiveBadge(null)} />

      {/* ヘッダーエリア */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-300">
        <div>
          <span className="text-[11px] font-bold text-yellow-900 bg-yellow-100 px-2 py-0.5 rounded-xs">
            スピード演習（10問即答）
          </span>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 mt-1">
            {modeParam === 'due' ? '本日の復習キュー演習' : '源流思想 スピード暗記'}
          </h1>
        </div>

        {/* 単元フィルター */}
        {!isCompleted && modeParam !== 'due' && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-600 font-semibold">単元:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as CategoryId | 'all')}
              className="text-xs bg-white border border-gray-300 rounded-xs px-2 py-1 text-gray-700 focus:outline-hidden focus:border-blue-600"
            >
              <option value="all">源流思想 全単元 (10問)</option>
              {availableCategories.map((cat) => (
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
          <div className="bg-white border border-gray-300 rounded-xs p-8 text-center space-y-3">
            <h3 className="text-sm font-bold text-gray-800">出題可能な問題がありません</h3>
            <p className="text-xs text-gray-500">
              復習キューが空か、対象単元の問題が未登録です。
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                loadQuestions();
              }}
              className="py-1.5 px-4 bg-blue-600 text-white text-xs font-bold rounded-xs"
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
          modeTitle="スピード演習"
        />
      )}
    </div>
  );
}

export default function SpeedPracticePage() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-xs text-gray-500">読み込み中...</div>}>
      <SpeedQuizContent />
    </Suspense>
  );
}
