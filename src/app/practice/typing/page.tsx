'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { QuestionGenerator } from '@/lib/generator/questionGenerator';
import { TypingQuestion, CategoryId, Badge } from '@/types';
import { TypingQuiz } from '@/components/quiz/TypingQuiz';
import { QuizResult } from '@/components/quiz/QuizResult';
import { BadgeUnlockedModal } from '@/components/gamification/BadgeUnlockedModal';
import { CATEGORIES } from '@/data/categories';

function TypingQuizContent() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get('category') as CategoryId | null;

  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>(
    catParam || 'all'
  );
  const [questions, setQuestions] = useState<TypingQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [activeBadge, setActiveBadge] = useState<Badge | null>(null);

  const availableCategories = CATEGORIES.filter((c) => c.isAvailable);

  const loadQuestions = useCallback(() => {
    const cat = selectedCategory === 'all' ? undefined : selectedCategory;
    const pool = QuestionGenerator.generateTypingQuestions(cat);
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 8);
    setQuestions(shuffled);
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
    <div className="max-w-4xl mx-auto px-3 py-5 space-y-4">
      <BadgeUnlockedModal badge={activeBadge} onClose={() => setActiveBadge(null)} />

      {/* ヘッダーエリア */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-300">
        <div>
          <span className="text-[11px] font-bold text-green-900 bg-green-100 px-2 py-0.5 rounded-xs">
            用語完全定着 キーワード記述（8問）
          </span>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 mt-1">
            源流思想 キーワード記述
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
              <option value="all">源流思想 全単元</option>
              {availableCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.shortName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 記述クイズ */}
      {!isCompleted ? (
        currentQ ? (
          <div className="space-y-2">
            <div className="text-[11px] text-gray-500 font-semibold text-right">
              第 {currentIndex + 1} 問 / 全 {questions.length} 問
            </div>
            <TypingQuiz
              question={currentQ}
              onComplete={handleCompleteQuestion}
              onBadgeUnlocked={(b) => setActiveBadge(b)}
            />
          </div>
        ) : (
          <div className="bg-white border border-gray-300 rounded-xs p-8 text-center">
            <p className="text-xs text-gray-500">問題が見つかりませんでした。</p>
          </div>
        )
      ) : (
        <QuizResult
          totalQuestions={questions.length}
          correctCount={correctCount}
          xpEarned={totalXp}
          onRetry={loadQuestions}
          modeTitle="キーワード記述演習"
        />
      )}
    </div>
  );
}

export default function TypingPracticePage() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-xs text-gray-500">読み込み中...</div>}>
      <TypingQuizContent />
    </Suspense>
  );
}
