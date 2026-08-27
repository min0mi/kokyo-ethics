'use client';

import React from 'react';
import { FIGURES } from '@/data/figures';
import { KEYWORDS } from '@/data/keywords';
import { Figure, Keyword } from '@/types';

interface FigureDictRowCardProps {
  figureId?: string;
  keywordId?: string;
  selectedWrongOption?: string | null;
  isPassed?: boolean;
}

export const FigureDictRowCard: React.FC<FigureDictRowCardProps> = ({
  figureId,
  keywordId,
  selectedWrongOption,
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

  // 2. 誤答として選ばれた語句・人物のデータを特定（もしあれば）
  let wrongFig: Figure | undefined = undefined;
  let wrongKw: Keyword | undefined = undefined;
  if (selectedWrongOption && !isPassed) {
    // 誤答が人物名の場合
    const foundFig = FIGURES.find((f) => f.name === selectedWrongOption);
    if (foundFig) {
      wrongFig = foundFig;
      wrongKw = KEYWORDS.find((k) => k.figureId === foundFig.id);
    } else {
      // 誤答がキーワード名の場合
      const foundKw = KEYWORDS.find((k) => k.name === selectedWrongOption);
      if (foundKw) {
        wrongKw = foundKw;
        wrongFig = FIGURES.find((f) => f.id === foundKw.figureId);
      }
    }
  }

  if (!correctFig) return null;

  const correctKws = KEYWORDS.filter((k) => k.figureId === correctFig?.id);

  return (
    <div className="space-y-2 text-xs text-left text-gray-900">
      {/* ヘッダーメッセージ */}
      <div className={`p-2 rounded-xs border font-bold flex items-center justify-between ${
        isPassed
          ? 'bg-gray-100 border-gray-300 text-gray-800'
          : 'bg-red-50 border-red-300 text-red-900'
      }`}>
        <span>{isPassed ? '【パス】 正解の対応行を確認' : '【不正解】 思想・人物対応表の該当行'}</span>
        <span className="text-[10px] text-gray-500 font-normal">復習キューに追加済</span>
      </div>

      {/* 正解の対応表ミニテーブル */}
      <div className="border border-gray-300 rounded-xs overflow-hidden bg-white shadow-xs">
        <div className="bg-gray-100 px-2.5 py-1 border-b border-gray-300 font-bold text-gray-800 text-[11px]">
          [正解] {correctFig.name} の登録データ
        </div>

        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <th className="py-1 px-2.5 font-bold w-32 border-r border-gray-200">人物</th>
              <th className="py-1 px-2.5 font-bold w-40 border-r border-gray-200">対応キーワード</th>
              <th className="py-1 px-2.5 font-bold">説明</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-green-50/40">
              {/* 人物 */}
              <td className="py-2 px-2.5 align-top border-r border-gray-200 space-y-0.5">
                <strong className="font-bold text-gray-900 block text-xs">
                  {correctFig.name}
                </strong>
                {correctFig.books && correctFig.books.length > 0 && (
                  <div className="text-[10px] text-gray-600 font-medium">
                    『{correctFig.books.join('』、『')}』
                  </div>
                )}
              </td>

              {/* 対応キーワード */}
              <td className="py-2 px-2.5 align-top border-r border-gray-200 space-y-1">
                {correctKws.map((k) => (
                  <div key={k.id} className="font-bold text-gray-900">
                    ・{k.name}
                  </div>
                ))}
              </td>

              {/* 説明 */}
              <td className="py-2 px-2.5 align-top space-y-1">
                {correctKws.map((k) => (
                  <div key={k.id} className="text-gray-700 leading-relaxed">
                    {k.definition}
                  </div>
                ))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 誤って選んだ選択肢の対応表行（対比用） */}
      {wrongFig && wrongFig.id !== correctFig.id && (
        <div className="border border-gray-300 rounded-xs overflow-hidden bg-white shadow-xs">
          <div className="bg-gray-100 px-2.5 py-1 border-b border-gray-300 font-bold text-red-900 text-[11px]">
            [注意] 誤答「{selectedWrongOption}」の本来のデータ
          </div>

          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                <th className="py-1 px-2.5 font-bold w-32 border-r border-gray-200">人物</th>
                <th className="py-1 px-2.5 font-bold w-40 border-r border-gray-200">対応キーワード</th>
                <th className="py-1 px-2.5 font-bold">説明</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-red-50/20">
                {/* 人物 */}
                <td className="py-2 px-2.5 align-top border-r border-gray-200 space-y-0.5">
                  <strong className="font-bold text-gray-900 block text-xs">
                    {wrongFig.name}
                  </strong>
                  {wrongFig.books && wrongFig.books.length > 0 && (
                    <div className="text-[10px] text-gray-600 font-medium">
                      『{wrongFig.books.join('』、『')}』
                    </div>
                  )}
                </td>

                {/* キーワード */}
                <td className="py-2 px-2.5 align-top border-r border-gray-200">
                  <div className="font-bold text-gray-900">
                    ・{wrongKw ? wrongKw.name : wrongFig.name}
                  </div>
                </td>

                {/* 説明 */}
                <td className="py-2 px-2.5 align-top text-gray-700 leading-relaxed">
                  {wrongKw ? wrongKw.definition : wrongFig.summary}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

