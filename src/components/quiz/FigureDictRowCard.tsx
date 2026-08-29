'use client';

import React from 'react';
import { FIGURES } from '@/data/figures';
import { KEYWORDS } from '@/data/keywords';
import { Figure, Keyword } from '@/types';

interface FigureDictRowCardProps {
  figureId?: string;
  keywordId?: string;
  selectedWrongOption?: string | null;
  correctAnswerText?: string;
  isPassed?: boolean;
}

// 複数単語対応のハイライトヘルパー（部分一致対応）
function highlightWord(text: string, wordsToHighlight?: string | string[] | null): React.ReactNode {
  if (!wordsToHighlight || !text) return text;
  
  const words = Array.isArray(wordsToHighlight) ? wordsToHighlight : [wordsToHighlight];
  const cleanWords = words
    .map((w) => w?.trim())
    .filter((w): w is string => !!w && w !== '');
    
  if (cleanWords.length === 0) return text;

  const escapedWords = cleanWords.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escapedWords.join('|')})`, 'gi');
  const parts = text.split(regex);
  if (parts.length === 1) return text;

  const lowerCleanWords = cleanWords.map(w => w.toLowerCase());

  return parts.map((part, idx) =>
    (part.trim() !== '' && lowerCleanWords.some(w => part.toLowerCase().includes(w) || w.includes(part.toLowerCase()))) ? (
      <mark key={idx} className="bg-yellow-200 text-black px-0.5 rounded-xs font-bold">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export const FigureDictRowCard: React.FC<FigureDictRowCardProps> = ({
  figureId,
  keywordId,
  selectedWrongOption,
  correctAnswerText,
  isPassed = false,
}) => {
  // 1. 正解の思想家＆キーワードデータを取得（正答がペアの場合は2人特定する可能性がある）
  let correctFigLeft: Figure | undefined = figureId ? FIGURES.find((f) => f.id === figureId) : undefined;
  let correctFigRight: Figure | undefined = undefined;
  let correctKw: Keyword | undefined = keywordId ? KEYWORDS.find((k) => k.id === keywordId) : undefined;

  if (!correctFigLeft && correctKw) {
    correctFigLeft = FIGURES.find((f) => f.id === correctKw?.figureId);
  }
  if (correctFigLeft && !correctKw) {
    correctKw = KEYWORDS.find((k) => k.figureId === correctFigLeft?.id);
  }

  // 正解テキストが " ── " で区切られたペアの場合、左右の人物を特定
  if (correctAnswerText && correctAnswerText.includes(' ── ')) {
    const parts = correctAnswerText.split(' ── ');
    const figName = parts[0]?.trim();
    const kwName = parts[1]?.trim();

    correctFigLeft = FIGURES.find((f) => f.name.trim() === figName || f.name.includes(figName) || figName.includes(f.name));
    const foundKw = KEYWORDS.find((k) => k.name.trim() === kwName || k.name.includes(kwName) || kwName.includes(k.name));
    if (foundKw) {
      correctFigRight = FIGURES.find((f) => f.id === foundKw.figureId);
    }
  }

  // 2. 誤答として選ばれた選択肢のデータを特定（人物 or キーワード。ペアの場合は2人特定）
  let wrongFigLeft: Figure | undefined = undefined;
  let wrongFigRight: Figure | undefined = undefined;
  let wrongHighlightTarget: string | string[] | null | undefined = selectedWrongOption;

  if (selectedWrongOption && !isPassed) {
    // 誤答が " ── " で区切られたペアの場合 (ペア正誤判定など)
    if (selectedWrongOption.includes(' ── ')) {
      const parts = selectedWrongOption.split(' ── ');
      const figName = parts[0]?.trim();
      const kwName = parts[1]?.trim();

      // ハイライトターゲットを個別の単語配列にする
      wrongHighlightTarget = [figName, kwName];

      wrongFigLeft = FIGURES.find((f) => f.name.trim() === figName || f.name.includes(figName) || figName.includes(f.name));
      const foundKw = KEYWORDS.find((k) => k.name.trim() === kwName || k.name.includes(kwName) || kwName.includes(k.name));
      if (foundKw) {
        wrongFigRight = FIGURES.find((f) => f.id === foundKw.figureId);
      }
    } else {
      // 通常の判定
      const foundFig = FIGURES.find((f) => f.name.trim() === selectedWrongOption || f.name.includes(selectedWrongOption) || selectedWrongOption.includes(f.name));
      if (foundFig) {
        wrongFigLeft = foundFig;
      } else {
        const foundKw = KEYWORDS.find((k) => k.name.trim() === selectedWrongOption || k.name.includes(selectedWrongOption) || selectedWrongOption.includes(k.name));
        if (foundKw) {
          wrongFigLeft = FIGURES.find((f) => f.id === foundKw.figureId);
        } else {
          // 部分一致
          const partialKw = KEYWORDS.find((k) => selectedWrongOption.includes(k.name) || k.name.includes(selectedWrongOption));
          if (partialKw) {
            wrongFigLeft = FIGURES.find((f) => f.id === partialKw.figureId);
          }
        }
      }
    }
  }

  if (!correctFigLeft) return null;

  // ハイライト対象の特定
  let correctHighlightTarget: string | string[] | null | undefined = correctAnswerText || (correctKw ? correctKw.name : correctFigLeft.name);

  if (correctHighlightTarget && typeof correctHighlightTarget === 'string' && correctHighlightTarget.includes(' ── ')) {
    correctHighlightTarget = correctHighlightTarget.split(' ── ').map((s) => s.trim());
  }

  if (wrongHighlightTarget && typeof wrongHighlightTarget === 'string' && wrongHighlightTarget.includes(' ── ')) {
    wrongHighlightTarget = wrongHighlightTarget.split(' ── ').map((s) => s.trim());
  }

  return (
    <div className="space-y-2 text-xs text-left text-gray-900">
      {/* ヘッダーメッセージ */}
      <div
        className={`p-2 rounded-xs border font-bold flex items-center justify-between ${
          isPassed
            ? 'bg-gray-100 border-gray-300 text-gray-800'
            : 'bg-red-50 border-red-300 text-red-900'
        }`}
      >
        <span>
          {isPassed
            ? '【パス】 正解の対応行データ'
            : '【対比】 選んだ誤答肢と正答肢のデータ'}
        </span>
        <span className="text-[10px] text-gray-500 font-normal">復習キューに追加済</span>
      </div>

      {/* 2行対比テーブル（PC用） */}
      <div className="hidden sm:block border border-gray-300 rounded-xs overflow-hidden bg-white shadow-xs">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 text-gray-700">
              <th className="py-1 px-2 font-bold w-24 border-r border-gray-200">区分</th>
              <th className="py-1 px-2.5 font-bold w-40 border-r border-gray-200">人物</th>
              <th className="py-1 px-2.5 font-bold w-52 border-r border-gray-200">対応キーワード</th>
              <th className="py-1 px-2.5 font-bold">説明・エピソード</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {/* 1. 誤答肢の行（間違えた時のみ表示。左右のペアに対応して最大2行表示） */}
            {!isPassed &&
              [wrongFigLeft, wrongFigRight]
                .filter((f): f is Figure => !!f)
                .map((wFig, wIdx) => {
                  // 重複表示を防ぐ
                  if (wIdx === 1 && wrongFigLeft?.id === wrongFigRight?.id) return null;

                  const wKws = KEYWORDS.filter((k) => k.figureId === wFig.id);
                  const label = wIdx === 0 
                    ? (selectedWrongOption?.includes(' ── ') ? '選択肢の人物' : 'あなたが選んだ誤答')
                    : '選択肢の語句の本来の人物';

                  return (
                    <tr key={`wrong_${wFig.id}_${wIdx}`} className="bg-red-50/40">
                      <td className="py-2 px-2 align-top border-r border-gray-200 font-bold text-red-700 text-[10px]">
                        {label}
                      </td>

                      {/* 人物 */}
                      <td className="py-2 px-2.5 align-top border-r border-gray-200 space-y-0.5">
                        <strong className="font-bold text-gray-900 block text-xs">
                          {highlightWord(wFig.name, wrongHighlightTarget)}
                        </strong>
                        {wFig.books && wFig.books.length > 0 && (
                          <div className="text-[10px] text-gray-600 font-medium leading-snug">
                            『{wFig.books.join('』、『')}』
                          </div>
                        )}
                      </td>

                      {/* 対応キーワード */}
                      <td className="py-2 px-2.5 align-top border-r border-gray-200">
                        <div className="flex flex-wrap gap-1">
                          {wKws.map((k) => (
                            <span
                              key={k.id}
                              className="inline-block bg-white border border-gray-300 text-gray-900 font-bold px-1.5 py-0.2 rounded-xs text-[10px]"
                            >
                              {highlightWord(k.name, wrongHighlightTarget)}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* 説明・エピソード */}
                      <td className="py-2 px-2.5 align-top text-gray-700 leading-relaxed text-[11px]">
                        {highlightWord(wFig.summary, wrongHighlightTarget)}
                      </td>
                    </tr>
                  );
                })}

            {/* 2. 正答肢の行（常に表示。左右のペアに対応して最大2行表示） */}
            {[correctFigLeft, correctFigRight]
              .filter((f): f is Figure => !!f)
              .map((cFig, cIdx) => {
                // 重複表示を防ぐ
                if (cIdx === 1 && correctFigLeft?.id === correctFigRight?.id) return null;

                const cKws = KEYWORDS.filter((k) => k.figureId === cFig.id);
                const label = cIdx === 0 
                  ? (correctAnswerText?.includes(' ── ') ? '正しい正答の人物' : '正しい正答')
                  : '正答の語句の本来の人物';

                return (
                  <tr key={`correct_${cFig.id}_${cIdx}`} className="bg-green-50/50">
                    <td className="py-2 px-2 align-top border-r border-gray-200 font-bold text-green-800 text-[10px]">
                      {label}
                    </td>

                    {/* 人物 */}
                    <td className="py-2 px-2.5 align-top border-r border-gray-200 space-y-0.5">
                      <strong className="font-bold text-gray-900 block text-xs">
                        {highlightWord(cFig.name, correctHighlightTarget)}
                      </strong>
                      {cFig.books && cFig.books.length > 0 && (
                        <div className="text-[10px] text-gray-600 font-medium leading-snug">
                          『{cFig.books.join('』、『')}』
                        </div>
                      )}
                    </td>

                    {/* 対応キーワード */}
                    <td className="py-2 px-2.5 align-top border-r border-gray-200">
                      <div className="flex flex-wrap gap-1">
                        {cKws.map((k) => (
                          <span
                            key={k.id}
                            className="inline-block bg-white border border-gray-300 text-gray-900 font-bold px-1.5 py-0.2 rounded-xs text-[10px]"
                          >
                            {highlightWord(k.name, correctHighlightTarget)}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* 説明・エピソード */}
                    <td className="py-2 px-2.5 align-top text-gray-700 leading-relaxed text-[11px]">
                      {highlightWord(cFig.summary, correctHighlightTarget)}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* スマホ用カードレイアウト */}
      <div className="block sm:hidden space-y-2">
        {/* 1. 誤答肢のカード */}
        {!isPassed &&
          [wrongFigLeft, wrongFigRight]
            .filter((f): f is Figure => !!f)
            .map((wFig, wIdx) => {
              // 重複表示を防ぐ
              if (wIdx === 1 && wrongFigLeft?.id === wrongFigRight?.id) return null;

              const wKws = KEYWORDS.filter((k) => k.figureId === wFig.id);
              const label = wIdx === 0 
                ? (selectedWrongOption?.includes(' ── ') ? '選択肢の人物' : 'あなたが選んだ誤答')
                : '選択肢の語句の本来の人物';

              return (
                <div key={`wrong_card_${wFig.id}_${wIdx}`} className="bg-red-50/40 border border-red-200 p-3 rounded-xs space-y-2">
                  <div className="text-[10px] font-bold text-red-750 border-b border-red-200 pb-1">
                    {label}
                  </div>
                  <div>
                    <strong className="font-bold text-gray-900 text-xs">
                      {highlightWord(wFig.name, wrongHighlightTarget)}
                    </strong>
                    {wFig.books && wFig.books.length > 0 && (
                      <div className="text-[10px] text-gray-600 font-medium mt-0.5">
                        『{wFig.books.join('』、『')}』
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {wKws.map((k) => (
                      <span
                        key={k.id}
                        className="inline-block bg-white border border-gray-300 text-gray-900 font-bold px-1.5 py-0.2 rounded-xs text-[10px]"
                      >
                        {highlightWord(k.name, wrongHighlightTarget)}
                      </span>
                    ))}
                  </div>
                  <div className="text-[11px] text-gray-750 leading-relaxed pt-0.5 border-t border-dashed border-red-200">
                    {highlightWord(wFig.summary, wrongHighlightTarget)}
                  </div>
                </div>
              );
            })}

        {/* 2. 正答肢のカード */}
        {[correctFigLeft, correctFigRight]
          .filter((f): f is Figure => !!f)
          .map((cFig, cIdx) => {
            // 重複表示を防ぐ
            if (cIdx === 1 && correctFigLeft?.id === correctFigRight?.id) return null;

            const cKws = KEYWORDS.filter((k) => k.figureId === cFig.id);
            const label = cIdx === 0 
              ? (correctAnswerText?.includes(' ── ') ? '正しい正答の人物' : '正しい正答')
              : '正答の語句の本来の人物';

            return (
              <div key={`correct_card_${cFig.id}_${cIdx}`} className="bg-green-50/50 border border-green-200 p-3 rounded-xs space-y-2">
                <div className="text-[10px] font-bold text-green-800 border-b border-green-200 pb-1">
                  {label}
                </div>
                <div>
                  <strong className="font-bold text-gray-900 text-xs">
                    {highlightWord(cFig.name, correctHighlightTarget)}
                  </strong>
                  {cFig.books && cFig.books.length > 0 && (
                    <div className="text-[10px] text-gray-600 font-medium mt-0.5">
                      『{cFig.books.join('』、『')}』
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {cKws.map((k) => (
                    <span
                      key={k.id}
                      className="inline-block bg-white border border-gray-300 text-gray-900 font-bold px-1.5 py-0.2 rounded-xs text-[10px]"
                    >
                      {highlightWord(k.name, correctHighlightTarget)}
                    </span>
                  ))}
                </div>
                <div className="text-[11px] text-gray-750 leading-relaxed pt-0.5 border-t border-dashed border-green-200">
                  {highlightWord(cFig.summary, correctHighlightTarget)}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
