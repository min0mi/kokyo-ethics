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

// 単語ハイライトヘルパー
function highlightWord(text: string, wordToHighlight?: string | null): React.ReactNode {
  if (!wordToHighlight || !wordToHighlight.trim() || !text) return text;
  const cleanWord = wordToHighlight.trim();
  const escaped = cleanWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  if (parts.length === 1) return text;

  return parts.map((part, idx) =>
    part.toLowerCase() === cleanWord.toLowerCase() ? (
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
  // 1. 正解の思想家＆キーワードデータを取得
  let correctFig: Figure | undefined = figureId ? FIGURES.find((f) => f.id === figureId) : undefined;
  let correctKw: Keyword | undefined = keywordId ? KEYWORDS.find((k) => k.id === keywordId) : undefined;

  if (!correctFig && correctKw) {
    correctFig = FIGURES.find((f) => f.id === correctKw?.figureId);
  }
  if (correctFig && !correctKw) {
    correctKw = KEYWORDS.find((k) => k.figureId === correctFig?.id);
  }

  // 2. 誤答として選ばれた選択肢のデータを特定（人物 or キーワード）
  let wrongFig: Figure | undefined = undefined;

  if (selectedWrongOption && !isPassed) {
    // 誤答が人物名の場合
    const foundFig = FIGURES.find((f) => f.name === selectedWrongOption);
    if (foundFig) {
      wrongFig = foundFig;
    } else {
      // 誤答がキーワード名の場合
      const foundKw = KEYWORDS.find((k) => k.name === selectedWrongOption);
      if (foundKw) {
        wrongFig = FIGURES.find((f) => f.id === foundKw.figureId);
      } else {
        // 部分一致
        const partialKw = KEYWORDS.find((k) => selectedWrongOption.includes(k.name) || k.name.includes(selectedWrongOption));
        if (partialKw) {
          wrongFig = FIGURES.find((f) => f.id === partialKw.figureId);
        }
      }
    }
  }

  if (!correctFig) return null;

  const correctKws = KEYWORDS.filter((k) => k.figureId === correctFig?.id);
  const wrongKws = wrongFig ? KEYWORDS.filter((k) => k.figureId === wrongFig?.id) : [];

  // ハイライト対象の特定
  const correctHighlightTarget = correctAnswerText || (correctKw ? correctKw.name : correctFig.name);
  const wrongHighlightTarget = selectedWrongOption;

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

      {/* 2行対比テーブル（1人物1行: 誤答 ＋ 正答） */}
      {/* 2行対比テーブル（PC用） */}
      <div className="hidden sm:block border border-gray-300 rounded-xs overflow-hidden bg-white shadow-xs">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 text-gray-700">
              <th className="py-1 px-2 font-bold w-20 border-r border-gray-200">区分</th>
              <th className="py-1 px-2.5 font-bold w-40 border-r border-gray-200">人物</th>
              <th className="py-1 px-2.5 font-bold w-52 border-r border-gray-200">対応キーワード</th>
              <th className="py-1 px-2.5 font-bold">説明・エピソード</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {/* 1. 誤答肢の行（間違えた時のみ表示） */}
            {wrongFig && !isPassed && (
              <tr className="bg-red-50/40">
                <td className="py-2 px-2 align-top border-r border-gray-200 font-bold text-red-700 text-[10px]">
                  あなたが選択した誤答
                </td>

                {/* 人物 */}
                <td className="py-2 px-2.5 align-top border-r border-gray-200 space-y-0.5">
                  <strong className="font-bold text-gray-900 block text-xs">
                    {highlightWord(wrongFig.name, wrongHighlightTarget)}
                  </strong>
                  {wrongFig.books && wrongFig.books.length > 0 && (
                    <div className="text-[10px] text-gray-600 font-medium leading-snug">
                      『{wrongFig.books.join('』、『')}』
                    </div>
                  )}
                </td>

                {/* 対応キーワード（バッジ一覧） */}
                <td className="py-2 px-2.5 align-top border-r border-gray-200">
                  <div className="flex flex-wrap gap-1">
                    {wrongKws.map((k) => (
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
                <td className="py-2 px-2.5 align-top text-gray-700 leading-relaxed">
                  {highlightWord(wrongFig.summary, wrongHighlightTarget)}
                </td>
              </tr>
            )}

            {/* 2. 正答肢の行（常に表示） */}
            <tr className="bg-green-50/50">
              <td className="py-2 px-2 align-top border-r border-gray-200 font-bold text-green-800 text-[10px]">
                正しい正答
              </td>

              {/* 人物 */}
              <td className="py-2 px-2.5 align-top border-r border-gray-200 space-y-0.5">
                <strong className="font-bold text-gray-900 block text-xs">
                  {highlightWord(correctFig.name, correctHighlightTarget)}
                </strong>
                {correctFig.books && correctFig.books.length > 0 && (
                  <div className="text-[10px] text-gray-600 font-medium leading-snug">
                    『{correctFig.books.join('』、『')}』
                  </div>
                )}
              </td>

              {/* 対応キーワード（バッジ一覧） */}
              <td className="py-2 px-2.5 align-top border-r border-gray-200">
                <div className="flex flex-wrap gap-1">
                  {correctKws.map((k) => (
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
              <td className="py-2 px-2.5 align-top text-gray-700 leading-relaxed">
                {highlightWord(correctFig.summary, correctHighlightTarget)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* スマホ用カードレイアウト */}
      <div className="block sm:hidden space-y-2">
        {/* 1. 誤答肢のカード */}
        {wrongFig && !isPassed && (
          <div className="bg-red-50/40 border border-red-200 p-3 rounded-xs space-y-2">
            <div className="text-[10px] font-bold text-red-700 border-b border-red-200 pb-1">
              あなたが選択した誤答
            </div>
            <div>
              <strong className="font-bold text-gray-900 text-xs">
                {highlightWord(wrongFig.name, wrongHighlightTarget)}
              </strong>
              {wrongFig.books && wrongFig.books.length > 0 && (
                <div className="text-[10px] text-gray-600 font-medium mt-0.5">
                  『{wrongFig.books.join('』、『')}』
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {wrongKws.map((k) => (
                <span
                  key={k.id}
                  className="inline-block bg-white border border-gray-300 text-gray-900 font-bold px-1.5 py-0.2 rounded-xs text-[10px]"
                >
                  {highlightWord(k.name, wrongHighlightTarget)}
                </span>
              ))}
            </div>
            <div className="text-[11px] text-gray-700 leading-relaxed pt-0.5 border-t border-dashed border-red-200">
              {highlightWord(wrongFig.summary, wrongHighlightTarget)}
            </div>
          </div>
        )}

        {/* 2. 正答肢のカード */}
        <div className="bg-green-50/50 border border-green-200 p-3 rounded-xs space-y-2">
          <div className="text-[10px] font-bold text-green-800 border-b border-green-200 pb-1">
            正しい正答
          </div>
          <div>
            <strong className="font-bold text-gray-900 text-xs">
              {highlightWord(correctFig.name, correctHighlightTarget)}
            </strong>
            {correctFig.books && correctFig.books.length > 0 && (
              <div className="text-[10px] text-gray-600 font-medium mt-0.5">
                『{correctFig.books.join('』、『')}』
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {correctKws.map((k) => (
              <span
                key={k.id}
                className="inline-block bg-white border border-gray-300 text-gray-900 font-bold px-1.5 py-0.2 rounded-xs text-[10px]"
              >
                {highlightWord(k.name, correctHighlightTarget)}
              </span>
            ))}
          </div>
          <div className="text-[11px] text-gray-700 leading-relaxed pt-0.5 border-t border-dashed border-green-200">
            {highlightWord(correctFig.summary, correctHighlightTarget)}
          </div>
        </div>
      </div>
    </div>
  );
};
