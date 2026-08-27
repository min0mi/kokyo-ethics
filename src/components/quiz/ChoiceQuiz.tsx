'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

  const currentQ = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  const goToNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
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
      if (isAnswered || !currentQ) return;

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
      } else {
        sounds.playWrong();
        setCombo(0);
        setEarnedXp((prev) => prev + 2);
      }

      const res = UserDataStore.recordAnswer(currentQ.id, isCorrect, isCorrect ? 4 : 1);
      if (res.newlyUnlockedBadges.length > 0 && onBadgeUnlocked) {
        res.newlyUnlockedBadges.forEach((b) => onBadgeUnlocked(b));
      }

      if (isSpeedMode && isCorrect) {
        setTimeout(() => {
          goToNext();
        }, 750);
      }
    },
    [isAnswered, currentQ, isSpeedMode, combo, maxCombo, onBadgeUnlocked, goToNext]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentQ) return;
      if (!isAnswered) {
        if (['1', '2', '3', '4'].includes(e.key)) {
          const idx = parseInt(e.key, 10) - 1;
          if (idx < currentQ.options.length) {
            handleSelectOption(currentQ.options[idx]);
          }
        }
      } else {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
          e.preventDefault();
          goToNext();
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
    <div className="w-full max-w-3xl mx-auto space-y-3">
      {/* 進行バー */}
      <div className="bg-white border border-gray-300 p-2.5 rounded-sm flex items-center justify-between text-xs">
        <span className="font-bold text-gray-700">
          第 <strong className="text-blue-700">{currentIndex + 1}</strong> 問 / {questions.length}問 ({progressPercent}%)
        </span>
        {combo >= 2 && (
          <span className="font-black text-red-600 bg-red-50 px-2 py-0.5 border border-red-200 rounded-xs">
            🔥 {combo} 連続正解!
          </span>
        )}
      </div>

      {/* 問題エリア (淡白な道場風スタイル) */}
      <div className="bg-white border border-gray-300 rounded-sm p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-gray-200">
          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 font-bold rounded-xs border border-gray-300">
            {currentQ.context || '4択選択問題'}
          </span>
          <span className="text-gray-400">キーボード [1-4] で選択</span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-relaxed whitespace-pre-line">
          {currentQ.prompt}
        </h3>

        {/* 選択肢リスト */}
        <div className="space-y-2">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === currentQ.correctAnswer;

            let style = 'bg-gray-50 border border-gray-300 text-gray-800 hover:bg-blue-50 hover:border-blue-500';

            if (isAnswered) {
              if (isCorrect) {
                style = 'bg-green-50 border-2 border-green-600 text-green-900 font-bold';
              } else if (isSelected) {
                style = 'bg-red-50 border-2 border-red-500 text-red-900 font-bold';
              } else {
                style = 'bg-gray-50 border border-gray-200 text-gray-400';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelectOption(option)}
                className={`w-full text-left p-3 rounded-sm transition text-xs sm:text-sm flex items-center justify-between ${style}`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-white border border-gray-400 rounded-xs flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </span>
                  <span>{option}</span>
                </div>

                {isAnswered && (
                  <div>
                    {isCorrect && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                    {isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-600" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 解答後解説 */}
        {isAnswered && (
          <div className="pt-4 border-t border-gray-200 space-y-3 text-xs">
            <div className={`p-2.5 rounded-sm font-bold ${selectedOption === currentQ.correctAnswer ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}>
              {selectedOption === currentQ.correctAnswer ? '【正解】 正解です！' : '【不正解】 残念... 復習キューに保存されました。'}
            </div>

            <div className="bg-gray-50 border border-gray-200 p-3 rounded-sm text-gray-800 leading-relaxed whitespace-pre-line">
              {currentQ.explanation}
            </div>

            {currentQ.commonTestHint && (
              <div className="bg-yellow-50 border border-yellow-300 p-3 rounded-sm text-yellow-900">
                <strong className="block text-yellow-800 mb-0.5">▼ 共通テスト判断ポイント:</strong>
                {currentQ.commonTestHint}
              </div>
            )}

            <button
              onClick={goToNext}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-sm text-sm flex items-center justify-center gap-1"
            >
              <span>{currentIndex < questions.length - 1 ? '次の問題へ (Enter/Space)' : '結果を見る'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
