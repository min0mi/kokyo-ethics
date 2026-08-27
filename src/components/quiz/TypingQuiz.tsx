'use client';

import React, { useState } from 'react';
import { TypingQuestion, Badge } from '@/types';
import { Edit3, CheckCircle2, XCircle, ChevronRight, Sparkles, Lightbulb } from 'lucide-react';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswered || !inputVal.trim()) return;

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

    const res = UserDataStore.recordAnswer(question.id, matched, matched ? 5 : 1);
    if (res.newlyUnlockedBadges.length > 0 && onBadgeUnlocked) {
      res.newlyUnlockedBadges.forEach((b) => onBadgeUnlocked(b));
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg flex items-center gap-1">
            <Edit3 className="w-3.5 h-3.5" />
            キーワード記述マスター
          </span>
          {question.displayHint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 px-2 py-1 bg-amber-50/60 rounded-md border border-amber-200/60"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              {showHint ? question.displayHint : 'ヒントを見る'}
            </button>
          )}
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-3 whitespace-pre-line leading-relaxed">
          {question.prompt}
        </h3>

        {question.context && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed mb-6">
            <span className="font-bold text-slate-900 block mb-1">【定義・説明】</span>
            {question.context}
          </div>
        )}

        {/* 入力フォーム */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              disabled={isAnswered}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="ここに語句を入力してEnter..."
              className={`w-full px-5 py-4 text-base sm:text-lg font-semibold rounded-2xl border-2 outline-hidden transition ${
                isAnswered
                  ? isCorrect
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                    : 'border-rose-500 bg-rose-50 text-rose-900'
                  : 'border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 bg-white text-gray-900'
              }`}
              autoFocus
            />
          </div>

          {!isAnswered ? (
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-bold text-base shadow-lg shadow-indigo-200 transition transform active:scale-95"
            >
              解答を判定する
            </button>
          ) : null}
        </form>

        {/* 解答後のフィードバック */}
        {isAnswered && (
          <div className="mt-6 pt-6 border-t border-gray-100 space-y-4 animate-in fade-in">
            <div
              className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${
                isCorrect ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'
              }`}
            >
              {isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
              )}
              <div>
                <span>{isCorrect ? '見事正解！スペルまで完璧です！' : '惜しい！正解を確認しましょう'}</span>
                <div className="text-xs font-normal mt-1">
                  正解: <strong className="font-bold">{question.correctAnswers[0]}</strong>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {question.explanation}
            </div>

            {question.commonTestHint && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs sm:text-sm text-amber-900">
                <div className="flex items-center gap-1.5 font-bold mb-1 text-amber-800">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>共通テスト判断語句・頻出ポイント</span>
                </div>
                <p className="leading-relaxed">{question.commonTestHint}</p>
              </div>
            )}

            <button
              onClick={() => onComplete({ correct: isCorrect ? 1 : 0, total: 1, xp: isCorrect ? 15 : 2 })}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition transform active:scale-95 text-base"
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

