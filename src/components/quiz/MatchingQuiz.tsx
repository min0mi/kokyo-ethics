'use client';

import React, { useState, useEffect } from 'react';
import { MatchingQuestion, Badge } from '@/types';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { sounds } from '@/lib/sound';
import { UserDataStore } from '@/lib/storage/userDataStore';

interface MatchingQuizProps {
  question: MatchingQuestion;
  onComplete: (stats: { correct: number; total: number; xp: number }) => void;
  onBadgeUnlocked?: (badge: Badge) => void;
}

export const MatchingQuiz: React.FC<MatchingQuizProps> = ({
  question,
  onComplete,
  onBadgeUnlocked,
}) => {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [attempts, setAttempts] = useState<number>(0);
  const [shuffledRights, setShuffledRights] = useState<{ id: string; text: string }[]>([]);

  useEffect(() => {
    const rights = question.pairs.map((p) => ({ id: p.id, text: p.right }));
    const shuffled = [...rights].sort(() => Math.random() - 0.5);
    setShuffledRights(shuffled);
    setMatchedPairIds([]);
    setSelectedLeft(null);
    setSelectedRight(null);
    setAttempts(0);
  }, [question]);

  const checkMatch = (leftId: string, rightId: string) => {
    setAttempts((prev) => prev + 1);

    if (leftId === rightId) {
      sounds.playCorrect();
      const nextMatched = [...matchedPairIds, leftId];
      setMatchedPairIds(nextMatched);
      setSelectedLeft(null);
      setSelectedRight(null);

      if (nextMatched.length === question.pairs.length) {
        const isClean = attempts + 1 === question.pairs.length;
        const res = UserDataStore.recordAnswer(question.id, isClean, isClean ? 5 : 3);
        if (res.newlyUnlockedBadges.length > 0 && onBadgeUnlocked) {
          res.newlyUnlockedBadges.forEach((b) => onBadgeUnlocked(b));
        }
      }
    } else {
      sounds.playWrong();
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 400);
    }
  };

  const handleLeftClick = (id: string) => {
    if (matchedPairIds.includes(id)) return;
    sounds.playTap();
    setSelectedLeft(id);
    if (selectedRight) {
      checkMatch(id, selectedRight);
    }
  };

  const handleRightClick = (id: string) => {
    if (matchedPairIds.includes(id)) return;
    sounds.playTap();
    setSelectedRight(id);
    if (selectedLeft) {
      checkMatch(selectedLeft, id);
    }
  };

  const isAllCleared = matchedPairIds.length === question.pairs.length;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      <div className="bg-white border border-gray-300 p-4 sm:p-6 rounded-sm space-y-4">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-gray-200">
          <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-xs">
            線つなぎ・ペアマッチング
          </span>
          <span className="text-gray-500 font-bold">
            {matchedPairIds.length} / {question.pairs.length} ペア完成
          </span>
        </div>

        <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-relaxed">
          {question.prompt}
        </h3>
        <p className="text-[11px] text-gray-500">
          左の人物をクリックしたあと、右の対応する語句/著書をクリックしてください。
        </p>

        {/* 2カラムリスト */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* 左: 人物 */}
          <div className="space-y-1.5">
            <div className="bg-gray-100 p-1.5 font-bold text-gray-700 text-center border border-gray-200">
              思想家・人物
            </div>
            {question.pairs.map((pair) => {
              const isMatched = matchedPairIds.includes(pair.id);
              const isSelected = selectedLeft === pair.id;

              let style = 'bg-gray-50 border border-gray-300 hover:bg-purple-50 text-gray-800';
              if (isMatched) style = 'bg-green-50 border-green-500 text-green-900 font-bold';
              else if (isSelected) style = 'bg-purple-100 border-2 border-purple-600 text-purple-900 font-bold';

              return (
                <button
                  key={pair.id}
                  disabled={isMatched}
                  onClick={() => handleLeftClick(pair.id)}
                  className={`w-full p-2.5 text-left rounded-xs transition flex items-center justify-between ${style}`}
                >
                  <span>{pair.left}</span>
                  {isMatched && <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />}
                </button>
              );
            })}
          </div>

          {/* 右: キーワード/著書 */}
          <div className="space-y-1.5">
            <div className="bg-gray-100 p-1.5 font-bold text-gray-700 text-center border border-gray-200">
              キーワード / 著書
            </div>
            {shuffledRights.map((item) => {
              const isMatched = matchedPairIds.includes(item.id);
              const isSelected = selectedRight === item.id;

              let style = 'bg-gray-50 border border-gray-300 hover:bg-purple-50 text-gray-800';
              if (isMatched) style = 'bg-green-50 border-green-500 text-green-900 font-bold';
              else if (isSelected) style = 'bg-purple-100 border-2 border-purple-600 text-purple-900 font-bold';

              return (
                <button
                  key={item.id}
                  disabled={isMatched}
                  onClick={() => handleRightClick(item.id)}
                  className={`w-full p-2.5 text-left rounded-xs transition flex items-center justify-between ${style}`}
                >
                  <span>{item.text}</span>
                  {isMatched && <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 完了時 */}
        {isAllCleared && (
          <div className="pt-4 border-t border-gray-200 space-y-3 text-xs">
            <div className="p-2.5 bg-green-100 text-green-900 font-bold rounded-sm">
              全ペア完了！相関関係をしっかり定着させましょう。
            </div>

            <button
              onClick={() => onComplete({ correct: 1, total: 1, xp: 25 })}
              className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm rounded-sm flex items-center justify-center gap-1"
            >
              <span>完了して次へ</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
