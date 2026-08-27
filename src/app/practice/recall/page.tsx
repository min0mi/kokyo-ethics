'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { QuestionGenerator } from '@/lib/generator/questionGenerator';
import { RecallQuestion, CategoryId, Badge } from '@/types';
import { RecallQuiz } from '@/components/quiz/RecallQuiz';
import { QuizResult } from '@/components/quiz/QuizResult';
import { BadgeUnlockedModal } from '@/components/gamification/BadgeUnlockedModal';
import { CATEGORIES } from '@/data/categories';
import { Brain, Filter } from 'lucide-react';

function RecallQuizContent() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get('category') as CategoryId | null;

  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>(
    catParam || 'all'
  );
  const [questions, setQuestions] = useState<RecallQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [activeBadge, setActiveBadge] = useState<Badge | null>(null);

  const loadQuestions = useCallback(() => {
    const cat = selectedCategory === 'all' ? undefined : selectedCategory;
    const pool = QuestionGenerator.generateRecallQuestions(cat);
    setQuestions(pool);
    setCurrentIndex(0);
    setIsCompleted(false);
    setCorrectCount(0);
    setTotalXp(0);
  }, [selectedCategory]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleCompleteQuestion = (stats: { correct: number; total: number; xp: number }) => {
    if (stats.correct > 0) setCorrectCount((prev) => prev + 1);
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-900 text-xs font-bold mb-1">
            <Brain className="w-3.5 h-3.5 text-cyan-600" />
            <span>高次想起 分類セルフチェック</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">
            分類想起トレーニング
          </h1>
        </div>

        {/* 単元フィルター */}
        {!isCompleted && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as CategoryId | 'all')}
              className="text-xs font-semibold bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
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

      {/* 想起クイズ */}
      {!isCompleted ? (
        currentQ ? (
          <div className="space-y-4">
            <div className="text-xs text-gray-400 font-semibold text-right">
              第 {currentIndex + 1} 問 / 全 {questions.length} 問
            </div>
            <RecallQuiz
              question={currentQ}
              onComplete={handleCompleteQuestion}
              onBadgeUnlocked={(b) => setActiveBadge(b)}
            />
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">問題が見つかりませんでした。</p>
          </div>
        )
      ) : (
        <QuizResult
          totalQuestions={questions.length}
          correctCount={correctCount}
          xpEarned={totalXp}
          onRetry={loadQuestions}
          modeTitle="分類想起トレーニング"
        />
      )}
    </div>
  );
}

export default function RecallPracticePage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-500">読み込み中...</div>}>
      <RecallQuizContent />
    </Suspense>
  );
}

