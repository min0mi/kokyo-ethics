'use client';

import React, { useState, useEffect } from 'react';
import { MatchingQuestion, Badge } from '@/types';
import { CheckCircle2, Sparkles, ChevronRight } from 'lucide-react';
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
  const [wrongFlash, setWrongFlash] = useState<boolean>(false);
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
      setWrongFlash(true);
      setTimeout(() => {
        setWrongFlash(false);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 500);
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
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* 問題ヘッダー */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-3">
          <span className="px-3 py-1 bg-violet-50 text-violet-700 text-xs font-bold rounded-lg flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            線つなぎ・ペアマッチング問題
          </span>
          <span className="text-xs text-gray-400 font-semibold">
            {matchedPairIds.length} / {question.pairs.length} ペア完成
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-relaxed">
          {question.prompt}
        </h3>
        <p className="text-xs text-gray-500 mb-6">
          左側の「人物」と、右側の「キーワード／著書」をそれぞれタップして正しいペアを完成させてください。
        </p>

        {/* マッチングエリア (2カラム) */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* 左カラム: 人物 */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-gray-400 tracking-wider uppercase text-center pb-1">
              思想家・人物
            </div>
            {question.pairs.map((pair) => {
              const isMatched = matchedPairIds.includes(pair.id);
              const isSelected = selectedLeft === pair.id;

              let style =
                'bg-slate-50 border-2 border-slate-200 text-slate-800 hover:border-violet-400 hover:bg-violet-50/50';

              if (isMatched) {
                style = 'bg-emerald-50 border-2 border-emerald-500 text-emerald-900 font-bold opacity-80';
              } else if (isSelected) {
                style =
                  'bg-violet-50 border-2 border-violet-600 text-violet-900 font-bold ring-2 ring-violet-200 shadow-md';
              }

              if (wrongFlash && isSelected) {
                style = 'bg-rose-50 border-2 border-rose-500 text-rose-900 font-bold animate-shake';
              }

              return (
                <button
                  key={pair.id}
                  disabled={isMatched}
                  onClick={() => handleLeftClick(pair.id)}
                  className={`w-full p-4 rounded-2xl text-left text-sm font-semibold transition-all flex items-center justify-between ${style}`}
                >
                  <span>{pair.left}</span>
                  {isMatched && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                </button>
              );
            })}
          </div>

          {/* 右カラム: キーワード/著書 */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-gray-400 tracking-wider uppercase text-center pb-1">
              キーワード / 著書
            </div>
            {shuffledRights.map((item) => {
              const isMatched = matchedPairIds.includes(item.id);
              const isSelected = selectedRight === item.id;

              let style =
                'bg-slate-50 border-2 border-slate-200 text-slate-800 hover:border-violet-400 hover:bg-violet-50/50';

              if (isMatched) {
                style = 'bg-emerald-50 border-2 border-emerald-500 text-emerald-900 font-bold opacity-80';
              } else if (isSelected) {
                style =
                  'bg-violet-50 border-2 border-violet-600 text-violet-900 font-bold ring-2 ring-violet-200 shadow-md';
              }

              if (wrongFlash && isSelected) {
                style = 'bg-rose-50 border-2 border-rose-500 text-rose-900 font-bold animate-shake';
              }

              return (
                <button
                  key={item.id}
                  disabled={isMatched}
                  onClick={() => handleRightClick(item.id)}
                  className={`w-full p-4 rounded-2xl text-left text-sm font-semibold transition-all flex items-center justify-between ${style}`}
                >
                  <span>{item.text}</span>
                  {isMatched && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 全ペア完成時 */}
        {isAllCleared && (
          <div className="mt-6 pt-6 border-t border-gray-100 space-y-4 animate-in fade-in">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-sm font-bold">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <div>
                <span>全ペアマッチング成功！完璧です！</span>
                <p className="text-xs text-emerald-700 font-normal mt-0.5">{question.explanation}</p>
              </div>
            </div>

            <button
              onClick={() => onComplete({ correct: 1, total: 1, xp: 25 })}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-200 transition transform active:scale-95 text-base"
            >
              <span>完了して次へ</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

