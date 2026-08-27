'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { QuestionGenerator } from '@/lib/generator/questionGenerator';
import { MatchingQuestion, CategoryId, Badge } from '@/types';
import { MatchingQuiz } from '@/components/quiz/MatchingQuiz';
import { QuizResult } from '@/components/quiz/QuizResult';
import { BadgeUnlockedModal } from '@/components/gamification/BadgeUnlockedModal';
import { CATEGORIES } from '@/data/categories';
import { Network, Filter, Sparkles } from 'lucide-react';

function MatchingQuizContent() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get('category') as CategoryId | null;

  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>(
    catParam || 'all'
  );
  const [questions, setQuestions] = useState<MatchingQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [totalXp, setTotalXp] = useState(0);
  const [activeBadge, setActiveBadge] = useState<Badge | null>(null);

  const loadQuestions = useCallback(() => {
    const cat = selectedCategory === 'all' ? undefined : selectedCategory;
    const pool = QuestionGenerator.generateMatchingQuestions(cat);
    setQuestions(pool);
    setCurrentIndex(0);
    setIsCompleted(false);
    setTotalXp(0);
  }, [selectedCategory]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleCompleteQuestion = (stats: { correct: number; total: number; xp: number }) => {
    setTotalXp((prev) => prev + stats.xp);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <BadgeUnlockedModal badge={activeBadge} onClose={() => setActiveBadge(null)} />

      {/* ヘッダーエリア */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-900 text-xs font-bold mb-1">
            <Network className="w-3.5 h-3.5 text-violet-600" />
            <span>相関整理 線つなぎマッチング</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">
            線つなぎ・ペアマッチング
          </h1>
        </div>

        {/* 単元フィルター */}
        {!isCompleted && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as CategoryId | 'all')}
              className="text-xs font-semibold bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-violet-500"
            >
              <option value="all">全単元</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.shortName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* マッチングクイズ */}
      {!isCompleted ? (
        currentQ ? (
          <div className="space-y-4">
            <div className="text-xs text-gray-400 font-semibold text-right">
              第 {currentIndex + 1} 問 / 全 {questions.length} 問
            </div>
            <MatchingQuiz
              question={currentQ}
              onComplete={handleCompleteQuestion}
              onBadgeUnlocked={(b) => setActiveBadge(b)}
            />
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm space-y-3">
            <Sparkles className="w-12 h-12 text-violet-400 mx-auto" />
            <p className="text-sm text-gray-700 font-bold">この単元には十分なマッチングデータがありません。</p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="py-2 px-4 bg-violet-600 text-white rounded-xl text-xs font-bold"
            >
              全単元に切り替える
            </button>
          </div>
        )
      ) : (
        <QuizResult
          totalQuestions={questions.length}
          correctCount={questions.length}
          xpEarned={totalXp}
          onRetry={loadQuestions}
          modeTitle="線つなぎマッチング"
        />
      )}
    </div>
  );
}

export default function MatchingPracticePage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-500">読み込み中...</div>}>
      <MatchingQuizContent />
    </Suspense>
  );
}

