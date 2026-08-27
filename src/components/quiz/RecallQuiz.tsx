'use client';

import React, { useState } from 'react';
import { RecallQuestion, Badge } from '@/types';
import { ChevronRight } from 'lucide-react';
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
    <div className="w-full max-w-3xl mx-auto space-y-3">
      <div className="bg-white border border-gray-300 p-4 sm:p-6 rounded-sm space-y-4">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-gray-200">
          <span className="bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded-xs">
            分類想起トレーニング（自己評価）
          </span>
          <div className="flex items-center gap-2">
            {selfGrade !== null ? (
              <button
                type="button"
                onClick={() =>
                  onComplete({
                    correct: selfGrade === 'pass' ? 1 : 0,
                    total: 1,
                    xp: selfGrade === 'pass' ? 15 : 2,
                  })
                }
                className="px-2.5 py-0.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xs text-[10px] flex items-center gap-0.5 shadow-xs"
              >
                <span>次へ</span>
                <ChevronRight className="w-3 h-3 text-white" />
              </button>
            ) : (
              <span className="text-gray-500 font-bold">目標: {question.requiredCount}人</span>
            )}
          </div>
        </div>

        <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-relaxed">
          {question.prompt}
        </h3>
        <p className="text-[11px] text-gray-500">
          頭の中で {question.requiredCount} 人を思い浮かべてから「解答を確認」を押してください。
        </p>

        {!showAnswer ? (
          <div className="p-6 bg-gray-50 border border-gray-200 text-center space-y-3">
            <div className="text-xs font-bold text-gray-700">思い浮かびましたか？</div>
            <button
              onClick={handleReveal}
              className="py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-sm shadow-xs"
            >
              模範解答を表示する
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="bg-gray-50 border border-gray-200 p-3 rounded-sm space-y-2">
              <strong className="block text-gray-800 border-b border-gray-200 pb-1">
                ▼ 想定される主な人物とポイント:
              </strong>
              <div className="space-y-1.5 pt-1">
                {question.modelAnswerDetails.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-blue-700 w-4">{idx + 1}.</span>
                    <div>
                      <strong className="text-gray-900">{item.name}</strong>
                      <span className="text-gray-600 ml-2">({item.note})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selfGrade === null ? (
              <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-sm text-center space-y-2">
                <div className="font-bold text-yellow-900">
                  {question.requiredCount}人以上思い浮かべることができましたか？
                </div>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => handleSelfGrade(true)}
                    className="py-2 px-6 bg-green-600 hover:bg-green-700 text-white font-bold rounded-sm text-xs"
                  >
                    できた
                  </button>
                  <button
                    onClick={() => handleSelfGrade(false)}
                    className="py-2 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-sm text-xs"
                  >
                    難しかった
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className={`p-2 rounded-sm text-center font-bold ${selfGrade === 'pass' ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}>
                  {selfGrade === 'pass' ? '良好！忘却曲線に記録しました。' : '復習キューに保存されました。'}
                </div>

                <button
                  onClick={() =>
                    onComplete({
                      correct: selfGrade === 'pass' ? 1 : 0,
                      total: 1,
                      xp: selfGrade === 'pass' ? 15 : 2,
                    })
                  }
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-sm flex items-center justify-center gap-1"
                >
                  <span>次へ (Enter)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
