'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChoiceQuestion, Badge } from '@/types';
import { CheckCircle2, XCircle, ChevronRight, Zap, Sparkles } from 'lucide-react';
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

      // 進捗 & バッジ記録
      const res = UserDataStore.recordAnswer(currentQ.id, isCorrect, isCorrect ? 4 : 1);
      if (res.newlyUnlockedBadges.length > 0 && onBadgeUnlocked) {
        res.newlyUnlockedBadges.forEach((b) => onBadgeUnlocked(b));
      }

      // スピードモードの場合は自動で0.85秒後に次の問題へ
      if (isSpeedMode && isCorrect) {
        setTimeout(() => {
          goToNext();
        }, 850);
      }
    },
    [isAnswered, currentQ, isSpeedMode, combo, maxCombo, onBadgeUnlocked, goToNext]
  );

  // キーボードショートカット (1, 2, 3, 4, Space/Enterで次へ)
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
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* 上部ステータスバー */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-4">
        {/* 問題数進捗 */}
        <div className="flex-1">
          <div className="flex justify-between items-center text-xs text-gray-500 font-semibold mb-1">
            <span>
              第 <strong className="text-indigo-600 font-bold">{currentIndex + 1}</strong> 問 / {questions.length}問
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* コンボ表示 */}
        {combo >= 2 && (
          <div className="flex items-center gap-1 px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-black animate-pulse shadow-md shadow-amber-200">
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>{combo} COMBO!</span>
          </div>
        )}
      </div>

      {/* 問題カード */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sm:p-8 relative overflow-hidden transition-all">
        {/* 単元タグ */}
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg">
            {currentQ.context ? currentQ.context : '4択問題'}
          </span>
          <span className="text-xs text-gray-400 font-mono hidden sm:inline">
            キーボード [1-4] で即答可能
          </span>
        </div>

        {/* 問題文 */}
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-relaxed mb-6 whitespace-pre-line">
          {currentQ.prompt}
        </h3>

        {/* 4択選択肢 */}
        <div className="grid grid-cols-1 gap-3">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === currentQ.correctAnswer;

            let buttonStyle =
              'bg-gray-50 border-2 border-gray-200/80 text-gray-800 hover:border-indigo-400 hover:bg-indigo-50/40';

            if (isAnswered) {
              if (isCorrect) {
                buttonStyle =
                  'bg-emerald-50 border-2 border-emerald-500 text-emerald-900 font-bold shadow-md shadow-emerald-100';
              } else if (isSelected) {
                buttonStyle =
                  'bg-rose-50 border-2 border-rose-500 text-rose-900 font-bold shadow-md shadow-rose-100';
              } else {
                buttonStyle = 'bg-gray-50/50 border border-gray-200 text-gray-400 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelectOption(option)}
                className={`w-full text-left p-4 rounded-2xl transition-all flex items-center justify-between text-sm sm:text-base ${buttonStyle} transform active:scale-[0.99]`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                      isSelected || (isAnswered && isCorrect)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-600 border border-gray-300'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="font-semibold">{option}</span>
                </div>

                {isAnswered && (
                  <div>
                    {isCorrect && (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                    )}
                    {isSelected && !isCorrect && (
                      <XCircle className="w-6 h-6 text-rose-600 fill-rose-100" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 解答後の詳細解説エリア (過去問道場風) */}
        {isAnswered && (
          <div className="mt-6 pt-6 border-t border-gray-100 space-y-4 animate-in fade-in">
            {/* 正否バナー */}
            <div
              className={`p-3.5 rounded-xl flex items-center gap-2 text-sm font-bold ${
                selectedOption === currentQ.correctAnswer
                  ? 'bg-emerald-100/70 text-emerald-900'
                  : 'bg-rose-100/70 text-rose-900'
              }`}
            >
              {selectedOption === currentQ.correctAnswer ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>正解！ その調子で定着させましょう。</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span>不正解... 忘却曲線に基づき自動で復習キューに入ります。</span>
                </>
              )}
            </div>

            {/* 解説本文 */}
            <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {currentQ.explanation}
            </div>

            {/* 共テ判断ポイントのハイライト */}
            {currentQ.commonTestHint && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs sm:text-sm text-amber-900">
                <div className="flex items-center gap-1.5 font-bold mb-1 text-amber-800">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>共通テスト判断語句・頻出ポイント</span>
                </div>
                <p className="leading-relaxed">{currentQ.commonTestHint}</p>
              </div>
            )}

            {/* 次の問題へボタン */}
            <button
              onClick={goToNext}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition transform active:scale-95 text-base"
            >
              <span>{currentIndex < questions.length - 1 ? '次の問題へ' : '結果を見る'}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

