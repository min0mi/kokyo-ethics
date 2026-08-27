'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChoiceQuestion, Badge } from '@/types';
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { sounds } from '@/lib/sound';
import { UserDataStore } from '@/lib/storage/userDataStore';

interface ChoiceQuizProps {
  question: ChoiceQuestion;
  onComplete: (stats: { correct: number; total: number; xp: number }) => void;
  onBadgeUnlocked?: (badge: Badge) => void;
}

export const ChoiceQuiz: React.FC<ChoiceQuizProps> = ({
  question,
  onComplete,
  onBadgeUnlocked,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [canInput, setCanInput] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isTransitioningRef = useRef<boolean>(false);

  // 問題マウント時・問題ID変更時に完全初期化
  useEffect(() => {
    setSelectedOption(null);
    setIsAnswered(false);
    setCanInput(false);
    isTransitioningRef.current = false;

    // 前問のキー連打・長押し持ち越しを防ぐため 200ms クールダウン
    const initTimer = setTimeout(() => {
      setCanInput(true);
    }, 200);

    return () => {
      clearTimeout(initTimer);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [question.id]);

  const handleNext = useCallback(
    (isCorrectAnswer: boolean) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      onComplete({
        correct: isCorrectAnswer ? 1 : 0,
        total: 1,
        xp: isCorrectAnswer ? 10 : 2,
      });
    },
    [onComplete]
  );

  const handleSelectOption = useCallback(
    (option: string) => {
      if (!canInput || isAnswered || isTransitioningRef.current) return;

      setSelectedOption(option);
      setIsAnswered(true);

      const isCorrect = option === question.correctAnswer;

      if (isCorrect) {
        sounds.playCorrect();
        isTransitioningRef.current = true;
        // 正解時は 0.45 秒後に自動送り
        timerRef.current = setTimeout(() => {
          handleNext(true);
        }, 450);
      } else {
        sounds.playWrong();
      }

      const res = UserDataStore.recordAnswer(question.id, isCorrect, isCorrect ? 4 : 1);
      if (res.newlyUnlockedBadges.length > 0 && onBadgeUnlocked) {
        res.newlyUnlockedBadges.forEach((b) => onBadgeUnlocked(b));
      }
    },
    [canInput, isAnswered, question, onBadgeUnlocked, handleNext]
  );

  // キーボード操作
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return; // 長押し無視

      if (!isAnswered && canInput) {
        if (['1', '2', '3', '4'].includes(e.key)) {
          const idx = parseInt(e.key, 10) - 1;
          if (idx < question.options.length) {
            handleSelectOption(question.options[idx]);
          }
        }
      } else if (isAnswered) {
        // 不正解時の次へ進む
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
          e.preventDefault();
          if (!isTransitioningRef.current) {
            handleNext(selectedOption === question.correctAnswer);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canInput, isAnswered, question, selectedOption, handleSelectOption, handleNext]);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-2 text-xs">
      {/* 問題カード */}
      <div className="bg-white border border-gray-300 rounded-xs p-3.5 sm:p-5 space-y-3">
        <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-gray-200">
          <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 font-bold rounded-xs border border-gray-300">
            {question.context || '4択問題'}
          </span>
          <span className="text-gray-500">
            {isAnswered && selectedOption !== question.correctAnswer
              ? 'Enterキーまたは次へボタンで進行'
              : '選択肢をクリック [1-4]'}
          </span>
        </div>

        {/* 問題文 */}
        <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug whitespace-pre-line">
          {question.prompt}
        </h3>

        {/* 4択選択肢 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {question.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === question.correctAnswer;

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
                type="button"
                disabled={isAnswered || !canInput}
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
        {isAnswered && selectedOption !== question.correctAnswer && (
          <div className="pt-2.5 border-t border-gray-200 space-y-2 text-xs">
            <div className="bg-red-50 border border-red-300 p-2 rounded-xs text-red-900 font-bold flex items-center justify-between">
              <span>【不正解】 正解: 「{question.correctAnswer}」</span>
              <span className="text-[10px] text-gray-500 font-normal">復習キューに保存</span>
            </div>

            <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-xs text-gray-800 text-[11px] leading-relaxed max-h-32 overflow-y-auto whitespace-pre-line">
              {question.explanation}
              {question.commonTestHint && (
                <div className="mt-1.5 pt-1.5 border-t border-gray-200 text-yellow-900 font-semibold">
                  [判断ポイント] {question.commonTestHint}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleNext(false)}
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
