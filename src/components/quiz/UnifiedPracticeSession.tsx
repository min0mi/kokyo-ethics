'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Question, CategoryId, QuizSessionConfig, Badge, ChoiceQuestion, MatchingQuestion, RecallQuestion } from '@/types';
import { QuestionGenerator, AVAILABLE_CATEGORY_IDS } from '@/lib/generator/questionGenerator';
import { CATEGORIES } from '@/data/categories';
import { ChoiceQuiz } from './ChoiceQuiz';
import { MatchingQuiz } from './MatchingQuiz';
import { RecallQuiz } from './RecallQuiz';
import { QuizResult } from './QuizResult';
import { BadgeUnlockedModal } from '@/components/gamification/BadgeUnlockedModal';
import { UserDataStore } from '@/lib/storage/userDataStore';

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
      figureToKeyword: initialConfig?.enabledTypes?.figureToKeyword ?? true,
      keywordToFigure: initialConfig?.enabledTypes?.keywordToFigure ?? true,
      oddOneOut: initialConfig?.enabledTypes?.oddOneOut ?? true,
      pairValidation: initialConfig?.enabledTypes?.pairValidation ?? true,
      matching: initialConfig?.enabledTypes?.matching ?? true,
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
  const sessionStartTimeRef = React.useRef<number>(Date.now());

  const availableCategories = CATEGORIES.filter((c) => c.isAvailable);

  const startSessionWithConfig = useCallback((cfg: QuizSessionConfig) => {
    let pool = QuestionGenerator.generateCustomSession(cfg);

    if (cfg.onlyWeak) {
      const progressMap = UserDataStore.getProgressMap();
      pool = pool.filter((q) => {
        const progress = progressMap[q.id];
        return progress && progress.totalAttempts > progress.totalCorrect;
      });
    }

    if (pool.length === 0) {
      alert(cfg.onlyWeak ? '該当する「間違えた問題」が登録されていません。' : '条件に一致する問題がありませんでした。');
      setIsStarted(false);
      return;
    }

    sessionStartTimeRef.current = Date.now();
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
        const elapsedSec = (Date.now() - sessionStartTimeRef.current) / 1000;
        const newBadges = UserDataStore.recordSessionComplete(elapsedSec, questions.length);
        if (newBadges.length > 0) {
          setActiveBadge(newBadges[0]);
        }
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
      <div className="bg-white border border-gray-300 rounded-xs p-4 sm:p-6 space-y-4 max-w-2xl mx-auto text-xs text-gray-900">
        <div className="border-b border-gray-200 pb-2">
          <h2 className="text-base font-bold text-gray-900">
            演習設定
          </h2>
          <p className="text-gray-500 text-[11px] mt-0.5">
            出題形式と単元を選択して開始してください。
          </p>
        </div>

        {/* 1. 出題形式 */}
        <div className="space-y-1.5">
          <label className="font-bold text-gray-800 block">
            出題形式:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { key: 'figureToKeyword', label: '人物 ➔ 語句' },
              { key: 'keywordToFigure', label: '語句 ➔ 人物' },
              { key: 'oddOneOut', label: '仲間はずれ' },
              { key: 'pairValidation', label: 'ペア正誤判定' },
              { key: 'matching', label: '線つなぎ（6択）' },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-1.5 p-2 bg-gray-50 border border-gray-300 rounded-xs cursor-pointer hover:bg-gray-100"
              >
                <input
                  type="checkbox"
                  checked={config.enabledTypes[key as keyof QuizSessionConfig['enabledTypes']]}
                  onChange={() => toggleType(key as keyof QuizSessionConfig['enabledTypes'])}
                  className="rounded-xs"
                />
                <span className="font-bold text-gray-800">{label}</span>
              </label>
            ))}
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
              className="text-[11px] text-gray-700 hover:underline font-bold"
            >
              [全単元を選択]
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {availableCategories.map((cat) => {
              const isChecked = config.categoryIds.includes(cat.id);
              return (
                <label
                  key={cat.id}
                  className={`flex items-center gap-1.5 p-2 border rounded-xs cursor-pointer ${
                    isChecked
                      ? 'bg-gray-100 border-gray-800 font-bold text-gray-900'
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
            問題数:
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
                  className={`px-3.5 py-1.5 border rounded-xs font-bold text-xs ${
                    isSelected
                      ? 'bg-gray-800 text-white border-gray-800'
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
        <div className="pt-2 border-t border-gray-200">
          <button
            type="button"
            onClick={() => startSessionWithConfig(config)}
            className="w-full py-2.5 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xs shadow-xs"
          >
            演習を開始する（{config.questionCount === 999 ? '全問' : `${config.questionCount}問`}）
          </button>
        </div>
      </div>
    );
  }

  // 演習実行中
  return (
    <div className="max-w-3xl mx-auto space-y-3">
      <BadgeUnlockedModal badge={activeBadge} onClose={() => setActiveBadge(null)} />

      {!isCompleted ? (
        currentQ ? (
          <div className="space-y-2">
            {/* 上部ヘッダー */}
            <div className="flex justify-between items-center text-xs pb-1 border-b border-gray-300">
              <span className="font-bold text-gray-800">
                演習 （第 {currentIndex + 1} 問 / 全 {questions.length} 問）
              </span>
              <button
                onClick={() => setIsStarted(false)}
                className="text-[11px] text-gray-500 hover:underline font-semibold"
              >
                [設定変更]
              </button>
            </div>

            {/* 問題タイプごとのレンダリング */}
            {currentQ.type === 'matching_lines' ? (
              <MatchingQuiz
                key={currentQ.id}
                question={currentQ as MatchingQuestion}
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
          elapsedSeconds={(Date.now() - sessionStartTimeRef.current) / 1000}
          onRetry={() => startSessionWithConfig(config)}
          modeTitle="演習"
        />
      )}
    </div>
  );
};
