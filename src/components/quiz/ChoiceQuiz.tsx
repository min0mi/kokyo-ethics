'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChoiceQuestion, Badge } from '@/types';
import { CheckCircle2, XCircle, ChevronRight, SkipForward } from 'lucide-react';
import { sounds } from '@/lib/sound';
import { UserDataStore } from '@/lib/storage/userDataStore';
import { FigureDictRowCard } from './FigureDictRowCard';

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
  const [isPassed, setIsPassed] = useState(false);
  const [canInput, setCanInput] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isTransitioningRef = useRef<boolean>(false);
  const questionStartTimeRef = useRef<number>(Date.now());

  // 問題マウント時・問題ID変更時に完全初期化
  useEffect(() => {
    setSelectedOption(null);
    setIsAnswered(false);
    setIsPassed(false);
    setCanInput(false);
    isTransitioningRef.current = false;
    questionStartTimeRef.current = Date.now();

    // 前問のキー連打持ち越しを防ぐため 150ms クールダウン
    const initTimer = setTimeout(() => {
      setCanInput(true);
    }, 150);

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

  // パス（スキップ）処理
  const handlePass = useCallback(() => {
    if (!canInput || isAnswered || isTransitioningRef.current) return;

    const elapsedSec = (Date.now() - questionStartTimeRef.current) / 1000;
    setIsAnswered(true);
    setIsPassed(true);
    setSelectedOption(null);
    sounds.playWrong();

    const res = UserDataStore.recordAnswer(question.id, false, 1, elapsedSec);
    if (res.newlyUnlockedBadges.length > 0 && onBadgeUnlocked) {
      res.newlyUnlockedBadges.forEach((b) => onBadgeUnlocked(b));
    }
  }, [canInput, isAnswered, question, onBadgeUnlocked]);

  const handleSelectOption = useCallback(
    (option: string) => {
      if (!canInput || isAnswered || isTransitioningRef.current) return;

      const elapsedSec = (Date.now() - questionStartTimeRef.current) / 1000;

      setSelectedOption(option);
      setIsAnswered(true);

      const isCorrect = option === question.correctAnswer;
      const res = UserDataStore.recordAnswer(question.id, isCorrect, isCorrect ? 4 : 1, elapsedSec);

      if (isCorrect) {
        sounds.playCorrect();
        isTransitioningRef.current = true;

        // 正解時は 0.38 秒後に自動送り（サクサク快適テンポ）
        timerRef.current = setTimeout(() => {
          handleNext(true);
        }, 380);
      } else {
        sounds.playWrong();
      }

      if (res.newlyUnlockedBadges.length > 0 && onBadgeUnlocked) {
        res.newlyUnlockedBadges.forEach((b) => onBadgeUnlocked(b));
      }
    },
    [canInput, isAnswered, question, onBadgeUnlocked, handleNext]
  );

  // キーボード操作 [1-4] or [P/0: パス] or [Space/Enter: 次へ]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (!isAnswered && canInput) {
        if (['1', '2', '3', '4'].includes(e.key)) {
          const idx = parseInt(e.key, 10) - 1;
          if (idx < question.options.length) {
            handleSelectOption(question.options[idx]);
          }
        } else if (e.key === 'p' || e.key === 'P' || e.key === '0' || e.key === 'Escape') {
          e.preventDefault();
          handlePass();
        }
      } else if (isAnswered) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
          e.preventDefault();
          if (!isTransitioningRef.current) {
            handleNext(selectedOption === question.correctAnswer && !isPassed);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canInput, isAnswered, question, selectedOption, isPassed, handleSelectOption, handlePass, handleNext]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-2 text-xs">
      {/* 問題カード */}
      <div className="bg-white border border-gray-300 rounded-xs p-4 space-y-3 shadow-xs">
        {/* 問題種別ラベル ＆ パスボタン */}
        <div className="flex items-center justify-between text-[11px] pb-1 border-b border-gray-200">
          <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 font-bold rounded-xs border border-gray-300">
            {question.type === 'figure_to_keyword'
              ? '人物 ➔ 語句'
              : question.type === 'keyword_to_figure'
              ? '語句 ➔ 人物'
              : question.type === 'odd_one_out'
              ? '仲間はずれ判定'
              : question.type === 'pair_validation'
              ? 'ペア正誤判定'
              : '対応問題'}
          </span>

          <div className="flex items-center gap-2">
            {!isAnswered ? (
              <button
                type="button"
                onClick={handlePass}
                className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 font-bold rounded-xs text-[10px] flex items-center gap-1"
                title="パスして正解データを確認 (P / 0キー)"
              >
                <SkipForward className="w-3 h-3 text-gray-500" />
                <span>パス [P]</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleNext(selectedOption === question.correctAnswer && !isPassed)}
                className="px-2.5 py-0.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xs text-[10px] flex items-center gap-0.5 shadow-xs"
              >
                <span>次へ</span>
                <ChevronRight className="w-3 h-3 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* 問題文（短く本質的） */}
        <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug py-1">
          {question.prompt}
        </h3>

        {/* 4択選択肢 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {question.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === question.correctAnswer;

            let style = 'bg-gray-50 border border-gray-300 text-gray-900 hover:bg-gray-100';

            if (isAnswered) {
              if (isCorrect) {
                style = 'bg-green-100 border-2 border-green-600 text-green-950 font-bold';
              } else if (isSelected) {
                style = 'bg-red-100 border-2 border-red-500 text-red-950 font-bold';
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
                className={`w-full text-left p-3 rounded-xs transition text-xs flex items-center justify-between min-h-[46px] ${style}`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-white border border-gray-400 rounded-xs flex items-center justify-center font-bold text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <span className="leading-tight font-semibold">{option}</span>
                </div>

                {isAnswered && (
                  <div className="shrink-0 ml-1">
                    {isCorrect && <CheckCircle2 className="w-4 h-4 text-green-700" />}
                    {isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-600" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 不正解時 / パス時：思想・人物対応表の該当行をダイレクト抽出表示 */}
        {isAnswered && (selectedOption !== question.correctAnswer || isPassed) && (
          <div className="pt-2 border-t border-gray-200 space-y-2.5">
            <FigureDictRowCard
              figureId={question.figureId}
              keywordId={question.keywordId}
              selectedWrongOption={selectedOption}
              correctAnswerText={question.correctAnswer}
              isPassed={isPassed}
            />

            <button
              type="button"
              onClick={() => handleNext(false)}
              className="w-full py-2.5 bg-gray-800 hover:bg-black text-white font-bold rounded-xs text-xs flex items-center justify-center gap-1 shadow-xs"
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
