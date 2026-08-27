'use client';

import React, { useEffect } from 'react';
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
    }
  }, [badge]);

  if (!badge) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-sm bg-white border-2 border-yellow-400 rounded-sm shadow-lg p-5 text-center space-y-3">
        <span className="text-xs font-bold text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-xs">
          [実績解除]
        </span>

        <h3 className="text-lg font-bold text-gray-900">{badge.name}</h3>
        <p className="text-xs text-gray-600">{badge.description}</p>

        <div className="text-xs font-bold text-blue-700 bg-gray-50 py-1.5 border border-gray-200">
          ボーナス: +50 XP
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-sm"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};
