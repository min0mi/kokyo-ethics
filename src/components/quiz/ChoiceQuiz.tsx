'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChoiceQuestion, Badge } from '@/types';
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { sounds } from '@/lib/sound';
import { UserDataStore } from '@/lib/storage/userDataStore';

interface ChoiceQuizProps {
  questions: ChoiceQuestion[];
  isSpeedMode?: boolean;
  onComplete: (stats: { correct: number; total: number; xp: number }) => void;
  onBadgeUnlocked?: (badge: Badge) => void;
}

export const ChoiceQuiz: React.FC<ChoiceQuizProps> = ({
  questions,
  isSpeedMode = false,
  onComplete,
  onBadgeUnlocked,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [earnedXp, setEarnedXp] = useState(0);

  // 連鎖スキップ・誤入力防止用Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isTransitioningRef = useRef<boolean>(false);
  const readyForInputRef = useRef<boolean>(false);

  const currentQ = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  // 問題切り替え時の入力クールダウン（250ms）
  useEffect(() => {
    readyForInputRef.current = false;
    isTransitioningRef.current = false;
    setSelectedOption(null);
    setIsAnswered(false);

    const readyTimer = setTimeout(() => {
      readyForInputRef.current = true;
    }, 250);

    return () => {
      clearTimeout(readyTimer);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentIndex]);

  const goToNext = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onComplete({
        correct: correctCount + (selectedOption === currentQ?.correctAnswer ? 1 : 0),
        total: questions.length,
        xp: earnedXp,
      });
    }
  }, [currentIndex, questions.length, correctCount, selectedOption, currentQ?.correctAnswer, earnedXp, onComplete]);

  const handleSelectOption = useCallback(
    (option: string) => {
      // 入力準備ができていない、または既に解答済み・遷移中の場合は一切無視
      if (!readyForInputRef.current || isTransitioningRef.current || isAnswered || !currentQ) {
        return;
      }

      setSelectedOption(option);
      setIsAnswered(true);

      const isCorrect = option === currentQ.correctAnswer;

      if (isCorrect) {
        sounds.playCorrect();
        setCorrectCount((prev) => prev + 1);
        setCombo((prev) => {
          const next = prev + 1;
          if (next > maxCombo) setMaxCombo(next);
          return next;
        });
        setEarnedXp((prev) => prev + 10 + (combo >= 3 ? 5 : 0));

        // 正解時は 0.45 秒後に自動送り（連鎖防止のため遷移中フラグを立てる）
        isTransitioningRef.current = true;
        const delay = isSpeedMode ? 350 : 450;
        timerRef.current = setTimeout(() => {
          goToNext();
        }, delay);
      } else {
        sounds.playWrong();
        setCombo(0);
        setEarnedXp((prev) => prev + 2);
      }

      const res = UserDataStore.recordAnswer(currentQ.id, isCorrect, isCorrect ? 4 : 1);
      if (res.newlyUnlockedBadges.length > 0 && onBadgeUnlocked) {
        res.newlyUnlockedBadges.forEach((b) => onBadgeUnlocked(b));
      }
    },
    [isAnswered, currentQ, isSpeedMode, combo, maxCombo, onBadgeUnlocked, goToNext]
  );

  // キーボード操作（長押し防止・連打防止）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // キーの長押しリピートは無視
      if (e.repeat) return;
      if (!currentQ) return;

      if (!isAnswered) {
        if (['1', '2', '3', '4'].includes(e.key)) {
          const idx = parseInt(e.key, 10) - 1;
          if (idx < currentQ.options.length) {
            handleSelectOption(currentQ.options[idx]);
          }
        }
      } else {
        // 不正解時の「次へ」進行
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
          e.preventDefault();
          if (!isTransitioningRef.current) {
            goToNext();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQ, isAnswered, handleSelectOption, goToNext]);

  if (!currentQ) {
    return <div className="text-center py-10 text-gray-500">問題がありません。</div>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-2">
      {/* 進行ステータス */}
      <div className="bg-white border border-gray-300 px-3 py-1.5 rounded-xs flex items-center justify-between text-xs">
        <span className="font-bold text-gray-700">
          第 <strong className="text-blue-700">{currentIndex + 1}</strong> 問 / {questions.length}問 ({progressPercent}%)
        </span>
        <div className="flex items-center gap-3">
          {combo >= 2 && (
            <span className="font-bold text-red-600 bg-red-50 px-1.5 py-0.2 border border-red-200 rounded-xs text-[11px]">
              {combo} 連続正解
            </span>
          )}
          <span className="text-gray-400 text-[11px] hidden sm:inline">[1-4] キー即答</span>
        </div>
      </div>

      {/* 問題エリア（短く本質的な選択肢表示） */}
      <div className="bg-white border border-gray-300 rounded-xs p-3.5 sm:p-5 space-y-3">
        <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-gray-200">
          <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 font-bold rounded-xs border border-gray-300">
            {currentQ.context || '4択選択問題'}
          </span>
          <span className="text-gray-500">
            {isAnswered && selectedOption !== currentQ.correctAnswer
              ? 'Enterキーまたは次へボタンで進行'
              : '選択肢をクリック'}
          </span>
        </div>

        {/* 問題文 */}
        <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug whitespace-pre-line">
          {currentQ.prompt}
        </h3>

        {/* 4択選択肢（短く端的なテキスト） */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === currentQ.correctAnswer;

            let style = 'bg-gray-50 border border-gray-300 text-gray-800 hover:bg-blue-50 hover:border-blue-500';

            if (isAnswered) {
              if (isCorrect) {
                style = 'bg-green-100 border-2 border-green-600 text-green-900 font-bold';
              } else if (isSelected) {
                style = 'bg-red-100 border-2 border-red-500 text-red-900 font-bold';
              } else {
                style = 'bg-gray-50 border border-gray-200 text-gray-400';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelectOption(option)}
                className={`w-full text-left p-2.5 rounded-xs transition text-xs flex items-center justify-between ${style}`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-white border border-gray-400 rounded-xs flex items-center justify-center font-bold text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <span className="line-clamp-2 leading-tight font-semibold">{option}</span>
                </div>

                {isAnswered && (
                  <div className="shrink-0 ml-1">
                    {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />}
                    {isSelected && !isCorrect && <XCircle className="w-3.5 h-3.5 text-red-600" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 不正解時の解説エリア（スクロール不要な配置） */}
        {isAnswered && selectedOption !== currentQ.correctAnswer && (
          <div className="pt-2.5 border-t border-gray-200 space-y-2 text-xs">
            <div className="bg-red-50 border border-red-300 p-2 rounded-xs text-red-900 font-bold flex items-center justify-between">
              <span>【不正解】 正解: 「{currentQ.correctAnswer}」</span>
              <span className="text-[10px] text-gray-500 font-normal">復習キューに自動保存</span>
            </div>

            <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-xs text-gray-800 text-[11px] leading-relaxed max-h-32 overflow-y-auto whitespace-pre-line">
              {currentQ.explanation}
              {currentQ.commonTestHint && (
                <div className="mt-1.5 pt-1.5 border-t border-gray-200 text-yellow-900 font-semibold">
                  [判断ポイント] {currentQ.commonTestHint}
                </div>
              )}
            </div>

            <button
              onClick={goToNext}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xs text-xs flex items-center justify-center gap-1 shadow-xs"
            >
              <span>次の問題へ進む (Space / Enter)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
