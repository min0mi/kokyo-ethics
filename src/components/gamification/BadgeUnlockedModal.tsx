'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Sparkles, X } from 'lucide-react';
import { Badge } from '@/types';
import { sounds } from '@/lib/sound';

interface BadgeModalProps {
  badge: Badge | null;
  onClose: () => void;
}

export const BadgeUnlockedModal: React.FC<BadgeModalProps> = ({ badge, onClose }) => {
  useEffect(() => {
    if (badge) {
      sounds.playFanfare();

      // 紙吹雪エフェクト
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366F1', '#EC4899', '#F59E0B', '#10B981'],
      });
    }
  }, [badge]);

  if (!badge) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center border-2 border-amber-300 transform animate-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex p-4 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-amber-900 shadow-lg shadow-amber-200 mb-4 animate-bounce">
          <Award className="w-10 h-10" />
        </div>

        <div className="flex items-center justify-center gap-1 text-amber-600 font-bold text-xs uppercase tracking-widest mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Badge Unlocked!</span>
          <Sparkles className="w-3.5 h-3.5" />
        </div>

        <h3 className="text-xl font-black text-gray-900 mb-2">{badge.name}</h3>
        <p className="text-sm text-gray-600 mb-4">{badge.description}</p>

        <div className="bg-amber-50 rounded-xl p-2.5 text-xs text-amber-800 font-semibold mb-5 border border-amber-200">
          ボーナス獲得: <span className="font-extrabold text-indigo-600">+50 XP</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:from-indigo-700 hover:to-violet-700 transition transform active:scale-95"
        >
          獲得して続ける
        </button>
      </div>
    </div>
  );
};

