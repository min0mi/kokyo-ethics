'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { QuestionGenerator } from '@/lib/generator/questionGenerator';
import { TypingQuestion, CategoryId, Badge } from '@/types';
import { TypingQuiz } from '@/components/quiz/TypingQuiz';
import { QuizResult } from '@/components/quiz/QuizResult';
import { BadgeUnlockedModal } from '@/components/gamification/BadgeUnlockedModal';
import { CATEGORIES } from '@/data/categories';
import { Edit3, Filter } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <BadgeUnlockedModal badge={activeBadge} onClose={() => setActiveBadge(null)} />

      {/* ヘッダーエリア */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-1">
            <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
            <span>用語完全定着 キーワード記述 (8問)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">
            キーワード記述マスター
          </h1>
        </div>

        {/* 単元フィルター */}
        {!isCompleted && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as CategoryId | 'all')}
              className="text-xs font-semibold bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
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

      {/* 記述クイズ */}
      {!isCompleted ? (
        currentQ ? (
          <div className="space-y-4">
            <div className="text-xs text-gray-400 font-semibold text-right">
              第 {currentIndex + 1} 問 / 全 {questions.length} 問
            </div>
            <TypingQuiz
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
          modeTitle="キーワード記述マスター"
        />
      )}
    </div>
  );
}

export default function TypingPracticePage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-500">読み込み中...</div>}>
      <TypingQuizContent />
    </Suspense>
  );
}

