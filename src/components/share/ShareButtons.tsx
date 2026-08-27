'use client';

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface ShareButtonsProps {
  text: string;
  url?: string;
  buttonLabel?: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({
  text,
  url = typeof window !== 'undefined' ? window.location.origin : 'https://kokyo-ethics.com',
  buttonLabel = 'X (Twitter) でシェア',
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const shareOnX = () => {
    const fullText = `${text}\n${url}`;
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}`;
    window.open(intentUrl, '_blank', 'noopener,noreferrer');
  };

  const copyToClipboard = async () => {
    try {
      const fullText = `${text}\n${url}`;
      await navigator.clipboard.writeText(fullText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      {/* X シェアボタン */}
      <button
        type="button"
        onClick={shareOnX}
        className="px-3 py-1.5 bg-black hover:bg-gray-800 text-white font-bold rounded-xs flex items-center gap-1.5 shadow-xs transition"
      >
        <span className="font-mono font-black text-xs">𝕏</span>
        <span>{buttonLabel}</span>
      </button>

      {/* テキストコピーボタン */}
      <button
        type="button"
        onClick={copyToClipboard}
        className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-800 font-bold rounded-xs flex items-center gap-1 shadow-xs transition"
        title="結果をクリップボードにコピー"
      >
        {isCopied ? (
          <>
            <Check className="w-3.5 h-3.5 text-green-700" />
            <span className="text-green-800">コピー完了</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-gray-600" />
            <span>コピー</span>
          </>
        )}
      </button>
    </div>
  );
};

