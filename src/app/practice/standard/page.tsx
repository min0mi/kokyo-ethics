'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { QuestionGenerator } from '@/lib/generator/questionGenerator';
import { ChoiceQuestion, CategoryId, Badge } from '@/types';
import { ChoiceQuiz } from '@/components/quiz/ChoiceQuiz';
import { QuizResult } from '@/components/quiz/QuizResult';
import { BadgeUnlockedModal } from '@/components/gamification/BadgeUnlockedModal';
import { CATEGORIES } from '@/data/categories';

function StandardQuizContent() {
  const searchParams = useSearchParams();
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

  const availableCategories = CATEGORIES.filter((c) => c.isAvailable);

  const loadQuestions = useCallback(() => {
    const cat = selectedCategory === 'all' ? undefined : selectedCategory;
    const f2k = QuestionGenerator.generateFigureToKeyword(cat);
    const k2f = QuestionGenerator.generateKeywordToFigure(cat);
    const km = QuestionGenerator.generateKeywordMeaning(cat);
    const books = QuestionGenerator.generateBookQuestions(cat);
    const eps = QuestionGenerator.generateEpisodeQuestions(cat);

    const pool = [...f2k, ...k2f, ...km, ...books, ...eps];
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestions(shuffled);
    setIsCompleted(false);
    setResults(null);
  }, [selectedCategory]);

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
          <span className="text-[11px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded-xs">
            標準解説演習（10問）
          </span>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 mt-1">
            源流思想 共通テスト標準演習
          </h1>
        </div>

        {/* 単元フィルター */}
        {!isCompleted && (
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
            isSpeedMode={false}
            onComplete={handleComplete}
            onBadgeUnlocked={(b) => setActiveBadge(b)}
          />
        ) : (
          <div className="bg-white border border-gray-300 rounded-xs p-8 text-center">
            <p className="text-xs text-gray-500">問題が見つかりませんでした。</p>
          </div>
        )
      ) : (
        <QuizResult
          totalQuestions={results?.total || 10}
          correctCount={results?.correct || 0}
          xpEarned={results?.xp || 0}
          onRetry={loadQuestions}
          modeTitle="標準解説演習"
        />
      )}
    </div>
  );
}

export default function StandardPracticePage() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-xs text-gray-500">読み込み中...</div>}>
      <StandardQuizContent />
    </Suspense>
  );
}
