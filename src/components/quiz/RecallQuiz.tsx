'use client';

import React, { useState } from 'react';
import { RecallQuestion, Badge } from '@/types';
import { Brain, Eye, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { sounds } from '@/lib/sound';
import { UserDataStore } from '@/lib/storage/userDataStore';

interface RecallQuizProps {
  question: RecallQuestion;
  onComplete: (stats: { correct: number; total: number; xp: number }) => void;
  onBadgeUnlocked?: (badge: Badge) => void;
}

export const RecallQuiz: React.FC<RecallQuizProps> = ({
  question,
  onComplete,
  onBadgeUnlocked,
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selfGrade, setSelfGrade] = useState<'pass' | 'fail' | null>(null);

  const handleReveal = () => {
    sounds.playTap();
    setShowAnswer(true);
  };

  const handleSelfGrade = (isPass: boolean) => {
    setSelfGrade(isPass ? 'pass' : 'fail');
    if (isPass) {
      sounds.playCorrect();
    } else {
      sounds.playWrong();
    }

    const res = UserDataStore.recordAnswer(question.id, isPass, isPass ? 4 : 1);
    if (res.newlyUnlockedBadges.length > 0 && onBadgeUnlocked) {
      res.newlyUnlockedBadges.forEach((b) => onBadgeUnlocked(b));
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 bg-cyan-50 text-cyan-700 text-xs font-bold rounded-lg flex items-center gap-1">
            <Brain className="w-3.5 h-3.5" />
            分類想起トレーニング（自己評価）
          </span>
          <span className="text-xs text-gray-400 font-semibold">
            目標: {question.requiredCount}人
          </span>
        </div>

        {/* 問題文 */}
        <h3 className="text-xl font-black text-gray-900 mb-3 leading-relaxed">
          {question.prompt}
        </h3>
        <p className="text-xs text-gray-500 mb-6">
          ノートや手元に書くか、頭の中で {question.requiredCount} 人を思い浮かべてから下のボタンを押してください。
        </p>

        {!showAnswer ? (
          <div className="p-8 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
            <Brain className="w-12 h-12 text-indigo-500 animate-pulse" />
            <div className="text-sm font-bold text-gray-700">
              思い浮かびましたか？
            </div>
            <button
              onClick={handleReveal}
              className="py-3 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition transform active:scale-95 text-sm flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              模範解答を表示する
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in">
            {/* 模範解答一覧 */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                該当する代表的な人物とポイント
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {question.modelAnswerDetails.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-indigo-950">{item.name}</div>
                      <div className="text-xs text-indigo-800/80 mt-0.5">{item.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 自己採点ボタン */}
            {selfGrade === null ? (
              <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3 text-center">
                <div className="text-xs font-bold text-amber-900">
                  {question.requiredCount}人以上思い浮かべることができましたか？
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleSelfGrade(true)}
                    className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-200 transition active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    できた！
                  </button>
                  <button
                    onClick={() => handleSelfGrade(false)}
                    className="py-3.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-200 transition active:scale-95"
                  >
                    <XCircle className="w-4 h-4" />
                    難しかった...
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  className={`p-3.5 rounded-xl text-center text-xs font-bold ${
                    selfGrade === 'pass'
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-rose-100 text-rose-900'
                  }`}
                >
                  {selfGrade === 'pass'
                    ? '🎉 素晴らしい想起力です！忘却曲線に記録しました。'
                    : '忘却曲線に基づき、近日中に自動で復習キューに再出題されます。'}
                </div>

                <button
                  onClick={() =>
                    onComplete({
                      correct: selfGrade === 'pass' ? 1 : 0,
                      total: 1,
                      xp: selfGrade === 'pass' ? 15 : 2,
                    })
                  }
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition transform active:scale-95 text-base"
                >
                  <span>次の問題へ進む</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

