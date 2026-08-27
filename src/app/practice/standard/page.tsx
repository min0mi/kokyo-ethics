'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { QuestionGenerator } from '@/lib/generator/questionGenerator';
import { ChoiceQuestion, CategoryId, Badge } from '@/types';
import { ChoiceQuiz } from '@/components/quiz/ChoiceQuiz';
import { QuizResult } from '@/components/quiz/QuizResult';
import { BadgeUnlockedModal } from '@/components/gamification/BadgeUnlockedModal';
import { CATEGORIES } from '@/data/categories';
import { BookOpen, Filter } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <BadgeUnlockedModal badge={activeBadge} onClose={() => setActiveBadge(null)} />

      {/* ヘッダーエリア */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 text-xs font-bold mb-1">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>過去問道場風 詳細演習 (10問)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">
            共テ実践・深堀り道場
          </h1>
        </div>

        {/* 単元フィルター */}
        {!isCompleted && (
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
            isSpeedMode={false}
            onComplete={handleComplete}
            onBadgeUnlocked={(b) => setActiveBadge(b)}
          />
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">問題が見つかりませんでした。</p>
          </div>
        )
      ) : (
        <QuizResult
          totalQuestions={results?.total || 10}
          correctCount={results?.correct || 0}
          xpEarned={results?.xp || 0}
          onRetry={loadQuestions}
          modeTitle="共テ実践・深堀り道場"
        />
      )}
    </div>
  );
}

export default function StandardPracticePage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-500">読み込み中...</div>}>
      <StandardQuizContent />
    </Suspense>
  );
}

