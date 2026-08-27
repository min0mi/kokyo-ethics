'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MatchingQuestion, Badge } from '@/types';
import { KEYWORDS } from '@/data/keywords';
import { BOOKS } from '@/data/books';
import { CheckCircle2, ChevronRight, SkipForward } from 'lucide-react';
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
  const [isPassed, setIsPassed] = useState<boolean>(false);
  const [rightOptions, setRightOptions] = useState<{ id: string; text: string; isDummy: boolean }[]>([]);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
    setIsPassed(false);

    // 正解の右側選択肢
    const correctRights = question.pairs.map((p) => ({
      id: p.id,
      text: p.right,
      isDummy: false,
    }));

    // ダミー選択肢（余る選択肢）をプールから集めて合計6個にする
    const dummyNeeded = Math.max(0, 6 - correctRights.length);
    const shuffledDummies = [...KEYWORDS.map((k) => k.name), ...BOOKS.map((b) => b.title)]
      .filter((text) => !correctRights.some((c) => c.text === text))
      .sort(() => Math.random() - 0.5)
      .slice(0, dummyNeeded)
      .map((text, idx) => ({
        id: `dummy_${idx}_${Date.now()}`,
        text,
        isDummy: true,
      }));

    const total6 = [...correctRights, ...shuffledDummies].sort(() => Math.random() - 0.5);
    setRightOptions(total6);
    setMatchedPairIds([]);
    setSelectedLeft(null);
    setSelectedRight(null);
    setAttempts(0);
  }, [question]);

  const handlePass = useCallback(() => {
    if (isPassed) return;
    const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
    setIsPassed(true);
    sounds.playWrong();

    const res = UserDataStore.recordAnswer(question.id, false, 1, elapsedSec);
    if (res.newlyUnlockedBadges.length > 0 && onBadgeUnlocked) {
      res.newlyUnlockedBadges.forEach((b) => onBadgeUnlocked(b));
    }
  }, [isPassed, question, onBadgeUnlocked]);

  const checkMatch = (leftId: string, rightOptId: string) => {
    setAttempts((prev) => prev + 1);

    if (leftId === rightOptId) {
      // 正解ペア
      sounds.playCorrect();
      const nextMatched = [...matchedPairIds, leftId];
      setMatchedPairIds(nextMatched);
      setSelectedLeft(null);
      setSelectedRight(null);

      if (nextMatched.length === question.pairs.length) {
        const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
        const isClean = attempts + 1 === question.pairs.length;
        const res = UserDataStore.recordAnswer(question.id, isClean, isClean ? 5 : 3, elapsedSec);
        if (res.newlyUnlockedBadges.length > 0 && onBadgeUnlocked) {
          res.newlyUnlockedBadges.forEach((b) => onBadgeUnlocked(b));
        }
      }
    } else {
      // 不一致・ダミー選択肢
      sounds.playWrong();
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 400);
    }
  };

  const handleLeftClick = (id: string) => {
    if (matchedPairIds.includes(id) || isPassed) return;
    sounds.playTap();
    setSelectedLeft(id);
    if (selectedRight) {
      checkMatch(id, selectedRight);
    }
  };

  const handleRightClick = (id: string) => {
    if (matchedPairIds.includes(id) || isPassed) return;
    sounds.playTap();
    setSelectedRight(id);
    if (selectedLeft) {
      checkMatch(selectedLeft, id);
    }
  };

  const isAllCleared = matchedPairIds.length === question.pairs.length;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-2 text-xs">
      <div className="bg-white border border-gray-300 p-4 rounded-xs space-y-3 shadow-xs">
        {/* ヘッダー */}
        <div className="flex items-center justify-between text-[11px] pb-1 border-b border-gray-200">
          <span className="bg-gray-100 text-gray-700 font-bold px-1.5 py-0.5 rounded-xs border border-gray-300">
            線つなぎ（6択・余り選択肢あり）
          </span>

          <div className="flex items-center gap-2">
            {!isAllCleared && !isPassed && (
              <button
                type="button"
                onClick={handlePass}
                className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 font-bold rounded-xs text-[10px] flex items-center gap-1"
                title="パスして正解を確認"
              >
                <SkipForward className="w-3 h-3 text-gray-500" />
                <span>パス [P]</span>
              </button>
            )}
            <span className="text-gray-600 font-bold">
              正解: {matchedPairIds.length} / {question.pairs.length} 組
            </span>
          </div>
        </div>

        <h3 className="text-base font-bold text-gray-900 leading-snug">
          {question.prompt}
        </h3>
        <p className="text-[11px] text-gray-500">
          左の思想家と、右の対応する語句（全6選択肢中3つが正解）をクリックしてつないでください。
        </p>

        {/* 2カラム表示 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* 左側: 人物 (3人) */}
          <div className="space-y-1.5">
            <div className="bg-gray-100 p-1 font-bold text-gray-700 text-center border border-gray-200 rounded-xs text-[11px]">
              思想家・人物（{question.pairs.length}名）
            </div>
            {question.pairs.map((pair) => {
              const isMatched = matchedPairIds.includes(pair.id);
              const isSelected = selectedLeft === pair.id;

              let style = 'bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-900';
              if (isMatched) style = 'bg-green-100 border-2 border-green-600 text-green-950 font-bold';
              else if (isSelected) style = 'bg-blue-100 border-2 border-blue-600 text-blue-950 font-bold';

              return (
                <button
                  key={pair.id}
                  disabled={isMatched || isPassed}
                  onClick={() => handleLeftClick(pair.id)}
                  className={`w-full p-2.5 text-left rounded-xs transition flex items-center justify-between ${style}`}
                >
                  <span className="font-semibold">{pair.left}</span>
                  {isMatched && <CheckCircle2 className="w-4 h-4 text-green-700" />}
                </button>
              );
            })}
          </div>

          {/* 右側: 選択肢 (6個: 正解3個 + ダミー3個) */}
          <div className="space-y-1.5">
            <div className="bg-gray-100 p-1 font-bold text-gray-700 text-center border border-gray-200 rounded-xs text-[11px] flex items-center justify-between px-2">
              <span>語句・概念（全6候補）</span>
              <span className="text-[10px] text-gray-500 font-normal">※3つ余る</span>
            </div>
            {rightOptions.map((opt) => {
              const isMatched = matchedPairIds.includes(opt.id);
              const isSelected = selectedRight === opt.id;

              let style = 'bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-900';
              if (isMatched) style = 'bg-green-100 border-2 border-green-600 text-green-950 font-bold';
              else if (isSelected) style = 'bg-blue-100 border-2 border-blue-600 text-blue-950 font-bold';

              return (
                <button
                  key={opt.id}
                  disabled={isMatched || isPassed}
                  onClick={() => handleRightClick(opt.id)}
                  className={`w-full p-2.5 text-left rounded-xs transition flex items-center justify-between ${style}`}
                >
                  <span>{opt.text}</span>
                  {isMatched && <CheckCircle2 className="w-4 h-4 text-green-700" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* パス時：正解の対応表データを表示 */}
        {isPassed && (
          <div className="pt-2 border-t border-gray-200 space-y-2 text-xs">
            <div className="p-2 bg-gray-100 border border-gray-300 font-bold rounded-xs text-gray-800">
              【パス】 正解の人物・語句の組み合わせ:
            </div>
            <table className="w-full text-left text-[11px] border border-gray-300 bg-white">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                  <th className="py-1 px-2.5 font-bold w-32 border-r border-gray-200">人物</th>
                  <th className="py-1 px-2.5 font-bold">対応キーワード</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {question.pairs.map((p) => (
                  <tr key={p.id} className="bg-green-50/30">
                    <td className="py-1.5 px-2.5 font-bold border-r border-gray-200">{p.left}</td>
                    <td className="py-1.5 px-2.5 font-bold text-gray-900">{p.right}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              type="button"
              onClick={() => onComplete({ correct: 0, total: 1, xp: 2 })}
              className="w-full py-2.5 bg-gray-800 hover:bg-black text-white font-bold rounded-xs text-xs flex items-center justify-center gap-1 shadow-xs"
            >
              <span>次の問題へ進む (Space / Enter)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 全ペア完成時 */}
        {isAllCleared && !isPassed && (
          <div className="pt-3 border-t border-gray-200 space-y-2 text-xs">
            <div className="p-2 bg-green-100 text-green-950 font-bold rounded-xs border border-green-300">
              全ペアの対応付けに成功しました！
            </div>

            <button
              onClick={() => onComplete({ correct: 1, total: 1, xp: 25 })}
              className="w-full py-2.5 bg-gray-800 hover:bg-black text-white font-bold text-xs rounded-xs flex items-center justify-center gap-1 shadow-xs"
            >
              <span>完了して次の問題へ</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
