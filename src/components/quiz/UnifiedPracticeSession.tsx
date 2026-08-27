'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Question, CategoryId, QuizSessionConfig, Badge, ChoiceQuestion, MatchingQuestion, TypingQuestion, RecallQuestion } from '@/types';
import { QuestionGenerator, AVAILABLE_CATEGORY_IDS } from '@/lib/generator/questionGenerator';
import { CATEGORIES } from '@/data/categories';
import { ChoiceQuiz } from './ChoiceQuiz';
import { MatchingQuiz } from './MatchingQuiz';
import { TypingQuiz } from './TypingQuiz';
import { RecallQuiz } from './RecallQuiz';
import { QuizResult } from './QuizResult';
import { BadgeUnlockedModal } from '@/components/gamification/BadgeUnlockedModal';

interface UnifiedPracticeProps {
  initialConfig?: Partial<QuizSessionConfig>;
  autoStart?: boolean;
}

export const UnifiedPracticeSession: React.FC<UnifiedPracticeProps> = ({
  initialConfig,
  autoStart = true,
}) => {
  const [config, setConfig] = useState<QuizSessionConfig>({
    categoryIds: initialConfig?.categoryIds || AVAILABLE_CATEGORY_IDS,
    enabledTypes: {
      choice: initialConfig?.enabledTypes?.choice ?? true,
      matching: initialConfig?.enabledTypes?.matching ?? true,
      typing: initialConfig?.enabledTypes?.typing ?? true,
      recall: initialConfig?.enabledTypes?.recall ?? true,
    },
    questionCount: initialConfig?.questionCount || 10,
  });

  const [isStarted, setIsStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [activeBadge, setActiveBadge] = useState<Badge | null>(null);

  const availableCategories = CATEGORIES.filter((c) => c.isAvailable);

  const startSessionWithConfig = useCallback((cfg: QuizSessionConfig) => {
    const pool = QuestionGenerator.generateCustomSession(cfg);
    if (pool.length === 0) {
      alert('条件に一致する問題がありませんでした。');
      setIsStarted(false);
      return;
    }

    setQuestions(pool);
    setCurrentIndex(0);
    setCorrectCount(0);
    setTotalXp(0);
    setIsCompleted(false);
    setIsStarted(true);
  }, []);

  useEffect(() => {
    if (autoStart) {
      startSessionWithConfig(config);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNextQuestion = useCallback(
    (stats: { correct: number; total: number; xp: number }) => {
      if (stats.correct > 0) {
        setCorrectCount((prev) => prev + stats.correct);
      }
      setTotalXp((prev) => prev + stats.xp);

      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsCompleted(true);
      }
    },
    [currentIndex, questions.length]
  );

  const currentQ = questions[currentIndex];

  const toggleCategory = (catId: CategoryId) => {
    setConfig((prev) => {
      const exists = prev.categoryIds.includes(catId);
      const next = exists
        ? prev.categoryIds.filter((id) => id !== catId)
        : [...prev.categoryIds, catId];
      return { ...prev, categoryIds: next };
    });
  };

  const selectAllCategories = () => {
    setConfig((prev) => ({ ...prev, categoryIds: AVAILABLE_CATEGORY_IDS }));
  };

  const toggleType = (key: keyof QuizSessionConfig['enabledTypes']) => {
    setConfig((prev) => ({
      ...prev,
      enabledTypes: {
        ...prev.enabledTypes,
        [key]: !prev.enabledTypes[key],
      },
    }));
  };

  // 設定画面
  if (!isStarted) {
    return (
      <div className="bg-white border border-gray-300 rounded-xs p-4 sm:p-6 space-y-4 max-w-3xl mx-auto text-xs">
        <div className="border-b border-gray-200 pb-2">
          <h2 className="text-base sm:text-lg font-bold text-gray-900">
            演習設定
          </h2>
          <p className="text-gray-500 text-[11px] mt-0.5">
            形式と単元を選択し、問題数を指定して開始してください。
          </p>
        </div>

        {/* 1. 出題形式 */}
        <div className="space-y-1.5">
          <label className="font-bold text-gray-800 block">
            出題形式:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <label className="flex items-center gap-1.5 p-2 bg-gray-50 border border-gray-300 rounded-xs cursor-pointer hover:bg-blue-50">
              <input
                type="checkbox"
                checked={config.enabledTypes.choice}
                onChange={() => toggleType('choice')}
                className="rounded-xs"
              />
              <span className="font-bold text-gray-800">4択問題</span>
            </label>

            <label className="flex items-center gap-1.5 p-2 bg-gray-50 border border-gray-300 rounded-xs cursor-pointer hover:bg-blue-50">
              <input
                type="checkbox"
                checked={config.enabledTypes.matching}
                onChange={() => toggleType('matching')}
                className="rounded-xs"
              />
              <span className="font-bold text-gray-800">線つなぎ（6択）</span>
            </label>

            <label className="flex items-center gap-1.5 p-2 bg-gray-50 border border-gray-300 rounded-xs cursor-pointer hover:bg-blue-50">
              <input
                type="checkbox"
                checked={config.enabledTypes.typing}
                onChange={() => toggleType('typing')}
                className="rounded-xs"
              />
              <span className="font-bold text-gray-800">用語記述</span>
            </label>

            <label className="flex items-center gap-1.5 p-2 bg-gray-50 border border-gray-300 rounded-xs cursor-pointer hover:bg-blue-50">
              <input
                type="checkbox"
                checked={config.enabledTypes.recall}
                onChange={() => toggleType('recall')}
                className="rounded-xs"
              />
              <span className="font-bold text-gray-800">分類想起</span>
            </label>
          </div>
        </div>

        {/* 2. 出題単元 */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="font-bold text-gray-800">
              出題単元:
            </label>
            <button
              type="button"
              onClick={selectAllCategories}
              className="text-[11px] text-blue-700 hover:underline font-bold"
            >
              [全単元を選択]
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
            {availableCategories.map((cat) => {
              const isChecked = config.categoryIds.includes(cat.id);
              return (
                <label
                  key={cat.id}
                  className={`flex items-center gap-1.5 p-2 border rounded-xs cursor-pointer ${
                    isChecked
                      ? 'bg-blue-50/70 border-blue-500 font-bold text-blue-950'
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCategory(cat.id)}
                    className="rounded-xs"
                  />
                  <span>{cat.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 3. 出題問題数 */}
        <div className="space-y-1.5">
          <label className="font-bold text-gray-800 block">
            出題問題数:
          </label>
          <div className="flex flex-wrap gap-2">
            {[5, 10, 20, 30, 999].map((count) => {
              const isSelected = config.questionCount === count;
              const label = count === 999 ? '全問' : `${count}問`;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => setConfig((prev) => ({ ...prev, questionCount: count }))}
                  className={`px-4 py-2 border rounded-xs font-bold text-xs ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* スタートボタン */}
        <div className="pt-3 border-t border-gray-200">
          <button
            type="button"
            onClick={() => startSessionWithConfig(config)}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xs shadow-xs"
          >
            演習を開始する（{config.questionCount === 999 ? '全問' : `${config.questionCount}問`}）
          </button>
        </div>
      </div>
    );
  }

  // 演習実行中
  return (
    <div className="max-w-4xl mx-auto space-y-3">
      <BadgeUnlockedModal badge={activeBadge} onClose={() => setActiveBadge(null)} />

      {!isCompleted ? (
        currentQ ? (
          <div className="space-y-2">
            {/* 上部ヘッダー */}
            <div className="flex justify-between items-center text-xs pb-1 border-b border-gray-300">
              <span className="font-bold text-gray-700">
                演習 （第 {currentIndex + 1} 問 / 全 {questions.length} 問）
              </span>
              <button
                onClick={() => setIsStarted(false)}
                className="text-[11px] text-gray-600 hover:text-blue-700 hover:underline font-semibold"
              >
                [条件変更]
              </button>
            </div>

            {/* 問題タイプごとの表示（key={currentQ.id} を指定して完全初期化） */}
            {currentQ.type === 'matching_lines' ? (
              <MatchingQuiz
                key={currentQ.id}
                question={currentQ as MatchingQuestion}
                onComplete={handleNextQuestion}
                onBadgeUnlocked={(b) => setActiveBadge(b)}
              />
            ) : currentQ.type === 'fill_in_keyword' ? (
              <TypingQuiz
                key={currentQ.id}
                question={currentQ as TypingQuestion}
                onComplete={handleNextQuestion}
                onBadgeUnlocked={(b) => setActiveBadge(b)}
              />
            ) : currentQ.type === 'recall_classification' ? (
              <RecallQuiz
                key={currentQ.id}
                question={currentQ as RecallQuestion}
                onComplete={handleNextQuestion}
                onBadgeUnlocked={(b) => setActiveBadge(b)}
              />
            ) : (
              <ChoiceQuiz
                key={currentQ.id}
                question={currentQ as ChoiceQuestion}
                onComplete={handleNextQuestion}
                onBadgeUnlocked={(b) => setActiveBadge(b)}
              />
            )}
          </div>
        ) : (
          <div className="bg-white border border-gray-300 p-8 text-center text-xs text-gray-500">
            問題の読み込みに失敗しました。
          </div>
        )
      ) : (
        <QuizResult
          totalQuestions={questions.length}
          correctCount={correctCount}
          xpEarned={totalXp}
          onRetry={() => startSessionWithConfig(config)}
          modeTitle="源流思想 演習"
        />
      )}
    </div>
  );
};
