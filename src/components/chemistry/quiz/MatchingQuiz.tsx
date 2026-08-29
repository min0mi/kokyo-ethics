'use client';
import { ChemicalText } from '@/components/chemistry/ChemicalFormula';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MatchingQuestion, Badge } from '@/types';
import { buildMatchingOptions } from '@/lib/chemistry/matchingOptions';
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
  // 不正解で即終了したかどうか
  const [isFailed, setIsFailed] = useState<boolean>(false);
  // 不正解時に選んだ誤ペア
  const [failedPair, setFailedPair] = useState<{ leftId: string; rightOptId: string } | null>(null);
  const [rightOptions, setRightOptions] = useState<{ id: string; text: string; isDummy: boolean }[]>([]);
  const startTimeRef = useRef<number>(Date.now());

  const isAllCleared = matchedPairIds.length === question.pairs.length;
  const isFinished = isPassed || isFailed || isAllCleared;

  // 左側の未マッチ先頭を自動選択するエフェクト
  useEffect(() => {
    if (isFinished) {
      setSelectedLeft(null);
      return;
    }
    const remains = question.pairs.filter((p) => !matchedPairIds.includes(p.id));
    if (remains.length > 0) {
      setSelectedLeft(remains[0].id);
    } else {
      setSelectedLeft(null);
    }
  }, [matchedPairIds, question.pairs, isFinished]);

  useEffect(() => {
    startTimeRef.current = Date.now();
    setIsPassed(false);
    setIsFailed(false);
    setFailedPair(null);

    setRightOptions(buildMatchingOptions(question));
    setMatchedPairIds([]);
    setSelectedLeft(null);
    setSelectedRight(null);
    setAttempts(0);
  }, [question]);

  const handlePass = useCallback(() => {
    if (isPassed || isFailed) return;
    const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
    setIsPassed(true);
    sounds.playWrong();

    const res = UserDataStore.recordAnswer(question.id, false, 1, elapsedSec);
    if (res.newlyUnlockedBadges.length > 0 && onBadgeUnlocked) {
      res.newlyUnlockedBadges.forEach((b) => onBadgeUnlocked(b));
    }
  }, [isPassed, isFailed, question, onBadgeUnlocked]);

  // ミスしたら即不正解終了
  const handleFail = useCallback((leftId: string, rightOptId: string) => {
    const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
    sounds.playWrong();
    setIsFailed(true);
    setFailedPair({ leftId, rightOptId });
    setSelectedLeft(null);
    setSelectedRight(null);

    const res = UserDataStore.recordAnswer(question.id, false, 1, elapsedSec);
    if (res.newlyUnlockedBadges.length > 0 && onBadgeUnlocked) {
      res.newlyUnlockedBadges.forEach((b) => onBadgeUnlocked(b));
    }
  }, [question, onBadgeUnlocked]);

  const checkMatch = useCallback((leftId: string, rightOptId: string) => {
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
      // 不一致 → 即不正解終了
      handleFail(leftId, rightOptId);
    }
  }, [matchedPairIds, question, attempts, onBadgeUnlocked, handleFail]);

  const handleLeftClick = (id: string) => {
    if (matchedPairIds.includes(id) || isPassed || isFailed) return;
    sounds.playTap();
    setSelectedLeft(id);
    if (selectedRight) {
      checkMatch(id, selectedRight);
    }
  };

  const handleRightClick = (id: string) => {
    if (matchedPairIds.includes(id) || isPassed || isFailed) return;
    sounds.playTap();
    setSelectedRight(id);
    if (selectedLeft) {
      checkMatch(selectedLeft, id);
    }
  };

  // キーボードイベントの登録
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (isFinished) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (isFailed) {
            onComplete({ correct: 0, total: 1, xp: 1 });
          } else if (isPassed) {
            onComplete({ correct: 0, total: 1, xp: 2 });
          } else if (isAllCleared) {
            onComplete({ correct: 1, total: 1, xp: 25 });
          }
        }
        return;
      }

      // パスキー（P or 0）
      if (e.key.toLowerCase() === 'p' || e.key === '0') {
        handlePass();
        return;
      }

      // 数字キー 1〜6 で右側の項目を選択してマッチング
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= rightOptions.length) {
        const targetOpt = rightOptions[num - 1];
        if (targetOpt && !matchedPairIds.includes(targetOpt.id)) {
          setSelectedRight(targetOpt.id);
          if (selectedLeft) {
            checkMatch(selectedLeft, targetOpt.id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rightOptions, matchedPairIds, selectedLeft, isFinished, handlePass, checkMatch, isFailed, isPassed, isAllCleared, onComplete]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-2 text-xs">
      <div className="bg-white border border-gray-300 p-4 rounded-xs space-y-3 shadow-xs">
        {/* ヘッダー */}
        <div className="flex items-center justify-between text-[11px] pb-1 border-b border-gray-200">
          <span className="bg-gray-100 text-gray-700 font-bold px-1.5 py-0.5 rounded-xs border border-gray-300">
            線つなぎ（6択・余り選択肢あり）
          </span>

          <div className="flex items-center gap-2">
            {!isFinished ? (
              <button
                type="button"
                onClick={handlePass}
                className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 font-bold rounded-xs text-[10px] flex items-center gap-1"
                title="パスして正解を確認"
              >
                <SkipForward className="w-3 h-3 text-gray-500" />
                <span>パス [P]</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (isFailed) {
                    onComplete({ correct: 0, total: 1, xp: 1 });
                  } else if (isPassed) {
                    onComplete({ correct: 0, total: 1, xp: 2 });
                  } else if (isAllCleared) {
                    onComplete({ correct: 1, total: 1, xp: 25 });
                  }
                }}
                className="px-2.5 py-0.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xs text-[10px] flex items-center gap-0.5 shadow-xs"
              >
                <span>次へ</span>
                <ChevronRight className="w-3 h-3 text-white" />
              </button>
            )}
            <span className="text-gray-600 font-bold">
              正解: {matchedPairIds.length} / {question.pairs.length} 組
            </span>
          </div>
        </div>

        <h3 className="text-base font-bold text-gray-900 leading-snug">
          <ChemicalText text={question.prompt} />
        </h3>
        <p className="text-[11px] text-gray-500">
          クリックまたは「左番号 右番号」で入力してつなぐ。不正解で即終了。
        </p>

        {/* 2カラム表示 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* 左側: 人物 */}
          <div className="space-y-1.5">
            <div className="bg-gray-100 p-1 font-bold text-gray-700 text-center border border-gray-200 rounded-xs text-[11px]">
              色（{question.pairs.length}種類）
            </div>
            {question.pairs.map((pair, idx) => {
              const isMatched = matchedPairIds.includes(pair.id);
              const isSelected = selectedLeft === pair.id;
              const isFailLeft = isFailed && failedPair?.leftId === pair.id;

              let style = 'bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-900';
              if (isMatched) style = 'bg-green-100 border-2 border-green-600 text-green-950 font-bold';
              else if (isFailLeft) style = 'bg-red-100 border-2 border-red-600 text-red-950 font-bold';
              else if (isSelected) style = 'bg-blue-100 border-2 border-blue-600 text-blue-950 font-bold ring-2 ring-blue-400';

              return (
                <button
                  key={pair.id}
                  disabled={isMatched || isFinished}
                  onClick={() => handleLeftClick(pair.id)}
                  className={`w-full p-2.5 text-left rounded-xs transition flex items-center justify-between ${style}`}
                >
                  <span className="font-semibold">
                    {!isMatched && !isFinished && (
                      <span className="text-gray-400 mr-1.5 font-bold">{idx + 1}.</span>
                    )}
                    {pair.left}
                  </span>
                  {isSelected && <span className="text-blue-700 font-bold animate-pulse text-[10px]">選択中</span>}
                  {isMatched && <CheckCircle2 className="w-4 h-4 text-green-700" />}
                </button>
              );
            })}
          </div>

          {/* 右側: 選択肢 */}
          <div className="space-y-1.5">
            <div className="bg-gray-100 p-1 font-bold text-gray-700 text-center border border-gray-200 rounded-xs text-[11px] flex items-center justify-between px-2">
              <span>物質・条件（全6候補）</span>
              <span className="text-[10px] text-gray-500 font-normal">※3つ余る</span>
            </div>
            {rightOptions.map((opt, optIdx) => {
              const isMatched = matchedPairIds.includes(opt.id);
              const isSelected = selectedRight === opt.id;
              const isFailRight = isFailed && failedPair?.rightOptId === opt.id;

              let style = 'bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-900';
              if (isMatched) style = 'bg-green-100 border-2 border-green-600 text-green-950 font-bold';
              else if (isFailRight) style = 'bg-red-100 border-2 border-red-600 text-red-950 font-bold';
              else if (isSelected) style = 'bg-blue-100 border-2 border-blue-600 text-blue-950 font-bold';

              return (
                <button
                  key={opt.id}
                  disabled={isMatched || isFinished}
                  onClick={() => handleRightClick(opt.id)}
                  className={`w-full p-2.5 text-left rounded-xs transition flex items-center justify-between ${style}`}
                >
                  <span>
                    {!isMatched && !isFinished && (
                      <span className="text-gray-400 mr-1.5 font-bold">{optIdx + 1}.</span>
                    )}
                    <ChemicalText text={opt.text} />
                  </span>
                  {isMatched && <CheckCircle2 className="w-4 h-4 text-green-700" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 不正解で終了 */}
        {isFailed && (
          <div className="pt-2 border-t border-gray-200 space-y-2 text-xs">
            <div className="p-2 bg-red-50 border border-red-300 font-bold rounded-xs text-red-800">
              不正解 — 対応が間違っています。正解の組み合わせ:
            </div>
            <div className="hidden sm:block">
              <table className="w-full text-left text-[11px] border border-gray-300 bg-white">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                    <th className="py-1 px-2.5 font-bold w-32 border-r border-gray-200">色</th>
                    <th className="py-1 px-2.5 font-bold">対応キーワード</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {question.pairs.map((p) => (
                    <tr key={p.id}>
                      <td className="py-1.5 px-2.5 font-bold border-r border-gray-200">{p.left}</td>
                      <td className="py-1.5 px-2.5 text-gray-900"><ChemicalText text={p.right} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="block sm:hidden space-y-1.5 border border-gray-300 bg-white p-2.5 rounded-xs">
              {question.pairs.map((p) => (
                <div key={p.id} className="flex flex-col gap-0.5 border-b border-gray-100 pb-1.5 last:border-0 last:pb-0">
                  <div className="font-bold text-gray-900 text-xs">{p.left}</div>
                  <div className="text-blue-700 font-bold text-[11px]">➔ <ChemicalText text={p.right} /></div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onComplete({ correct: 0, total: 1, xp: 1 })}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xs text-xs flex items-center justify-center gap-1 shadow-xs"
            >
              <span>次へ (Space / Enter)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* パス時 */}
        {isPassed && (
          <div className="pt-2 border-t border-gray-200 space-y-2 text-xs">
            <div className="p-2 bg-gray-100 border border-gray-300 font-bold rounded-xs text-gray-800">
              【パス】 正解の色・物質の組み合わせ:
            </div>
            <div className="hidden sm:block">
              <table className="w-full text-left text-[11px] border border-gray-300 bg-white">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                    <th className="py-1 px-2.5 font-bold w-32 border-r border-gray-200">色</th>
                    <th className="py-1 px-2.5 font-bold">対応キーワード</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {question.pairs.map((p) => (
                    <tr key={p.id} className="bg-green-50/30">
                      <td className="py-1.5 px-2.5 font-bold border-r border-gray-200">{p.left}</td>
                      <td className="py-1.5 px-2.5 font-bold text-gray-900"><ChemicalText text={p.right} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="block sm:hidden space-y-1.5 border border-gray-300 bg-white p-2.5 rounded-xs">
              {question.pairs.map((p) => (
                <div key={p.id} className="flex flex-col gap-0.5 border-b border-gray-100 pb-1.5 last:border-0 last:pb-0">
                  <div className="font-bold text-gray-900 text-xs">{p.left}</div>
                  <div className="text-blue-700 font-bold text-[11px]">➔ <ChemicalText text={p.right} /></div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onComplete({ correct: 0, total: 1, xp: 2 })}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xs text-xs flex items-center justify-center gap-1 shadow-xs"
            >
              <span>次へ (Space / Enter)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 全ペア完成時 */}
        {isAllCleared && !isPassed && !isFailed && (
          <div className="pt-3 border-t border-gray-200 space-y-2 text-xs">
            <div className="p-2 bg-green-100 text-green-950 font-bold rounded-xs border border-green-300">
              全ペアの対応付けに成功しました！
            </div>

            <button
              onClick={() => onComplete({ correct: 1, total: 1, xp: 25 })}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xs flex items-center justify-center gap-1 shadow-xs"
            >
              <span>次へ</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

