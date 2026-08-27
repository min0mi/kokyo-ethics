'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TypingQuestion, Badge } from '@/types';
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { sounds } from '@/lib/sound';
import { UserDataStore } from '@/lib/storage/userDataStore';

interface TypingQuizProps {
  question: TypingQuestion;
  onComplete: (stats: { correct: number; total: number; xp: number }) => void;
  onBadgeUnlocked?: (badge: Badge) => void;
}

export const TypingQuiz: React.FC<TypingQuizProps> = ({
  question,
  onComplete,
  onBadgeUnlocked,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [speedFeedback, setSpeedFeedback] = useState<'Excellent!' | 'Great!' | 'Good!' | null>(null);

  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    setInputVal('');
    setIsAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
    setSpeedFeedback(null);
    startTimeRef.current = Date.now();
  }, [question.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswered || !inputVal.trim()) return;

    const elapsedSec = (Date.now() - startTimeRef.current) / 1000;

    const cleanInput = inputVal.trim().toLowerCase().replace(/\s+/g, '');
    const matched = question.correctAnswers.some((ans) => {
      const cleanAns = ans.trim().toLowerCase().replace(/\s+/g, '');
      return cleanInput === cleanAns;
    });

    setIsAnswered(true);
    setIsCorrect(matched);

    if (matched) {
      sounds.playCorrect();
    } else {
      sounds.playWrong();
    }

    const res = UserDataStore.recordAnswer(question.id, matched, matched ? 5 : 1, elapsedSec);

    if (matched) {
      if (res.speedRating === 'excellent') setSpeedFeedback('Excellent!');
      else if (res.speedRating === 'great') setSpeedFeedback('Great!');
      else if (res.speedRating === 'good') setSpeedFeedback('Good!');
    }

    if (res.newlyUnlockedBadges.length > 0 && onBadgeUnlocked) {
      res.newlyUnlockedBadges.forEach((b) => onBadgeUnlocked(b));
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3 relative">
      {speedFeedback && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-yellow-400 text-yellow-950 font-black text-2xl px-6 py-3 rounded-xs border-2 border-yellow-600 shadow-xl animate-bounce">
            {speedFeedback}
          </div>
        </div>
      )}
      <div className="bg-white border border-gray-300 p-4 sm:p-6 rounded-sm space-y-4">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-gray-200">
          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-xs">
            キーワード記述マスター
          </span>
          <div className="flex items-center gap-2">
            {question.displayHint && !isAnswered && (
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="text-[11px] text-blue-700 hover:underline font-bold"
              >
                {showHint ? `[${question.displayHint}]` : 'ヒントを表示'}
              </button>
            )}
            {isAnswered && (
              <button
                type="button"
                onClick={() => onComplete({ correct: isCorrect ? 1 : 0, total: 1, xp: isCorrect ? 15 : 2 })}
                className="px-2.5 py-0.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xs text-[10px] flex items-center gap-0.5 shadow-xs"
              >
                <span>次へ</span>
                <ChevronRight className="w-3 h-3 text-white" />
              </button>
            )}
          </div>
        </div>

        <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-relaxed whitespace-pre-line">
          {question.prompt}
        </h3>

        {question.context && (
          <div className="bg-gray-50 border border-gray-200 p-3 rounded-sm text-xs text-gray-700 leading-relaxed">
            <strong className="block text-gray-800 mb-0.5">【定義・意味】</strong>
            {question.context}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            disabled={isAnswered}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="用語を入力してEnter..."
            className="w-full p-2.5 text-sm font-bold border border-gray-300 rounded-sm focus:outline-hidden focus:border-blue-600"
            autoFocus
          />

          {!isAnswered && (
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-sm"
            >
              判定する
            </button>
          )}
        </form>

        {isAnswered && (
          <div className="pt-4 border-t border-gray-200 space-y-3 text-xs">
            <div className={`p-2.5 rounded-sm font-bold flex items-center gap-2 ${isCorrect ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}>
              {isCorrect ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> : <XCircle className="w-4 h-4 text-red-600 shrink-0" />}
              <span>
                {isCorrect ? '正解です！' : `不正解... 正解: 「${question.correctAnswers[0]}」`}
              </span>
            </div>

            <div className="bg-gray-50 border border-gray-200 p-3 rounded-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {question.explanation}
            </div>

            {question.commonTestHint && (
              <div className="bg-yellow-50 border border-yellow-300 p-3 rounded-sm text-yellow-900">
                <strong className="block text-yellow-800 mb-0.5">▼ 共テ判断ポイント:</strong>
                {question.commonTestHint}
              </div>
            )}

            <button
              onClick={() => onComplete({ correct: isCorrect ? 1 : 0, total: 1, xp: isCorrect ? 15 : 2 })}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-sm flex items-center justify-center gap-1"
            >
              <span>次の問題へ</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
