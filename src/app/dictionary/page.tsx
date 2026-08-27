'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FIGURES } from '@/data/figures';
import { KEYWORDS } from '@/data/keywords';
import { CATEGORIES } from '@/data/categories';
import { CategoryId } from '@/types';
import Link from 'next/link';

// 検索ワード一致部分のハイライトヘルパー
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query || !query.trim() || !text) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  if (parts.length === 1) return text;

  return parts.map((part, idx) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={idx} className="bg-yellow-200 text-black px-0.5 rounded-xs font-bold">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function MapContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>(queryParam);

  const availableCategories = useMemo(() => CATEGORIES.filter((c) => c.isAvailable), []);

  const displayedCategories = useMemo(() => {
    if (selectedCategory === 'all') {
      return availableCategories;
    }
    return availableCategories.filter((c) => c.id === selectedCategory);
  }, [selectedCategory, availableCategories]);

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-3 space-y-3 text-xs text-gray-900">
      {/* ページヘッダー ＆ 検索バー */}
      <div className="bg-white border border-gray-300 p-3 rounded-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-gray-900">
            思想・人物対応表
          </h1>
          <p className="text-[11px] text-gray-500 mt-0.5">
            人物・対応キーワード・説明の一覧（全{FIGURES.length}名・{KEYWORDS.length}語句）
          </p>
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="人物・キーワード・説明で検索..."
            className="w-full px-2.5 py-1 border border-gray-300 rounded-xs text-xs focus:outline-hidden focus:border-gray-500"
          />
        </div>
      </div>

      {/* 単元切り替えタブ */}
      <div className="flex flex-wrap gap-1 border-b border-gray-300 pb-1 text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-2.5 py-1 font-bold rounded-xs border ${
            selectedCategory === 'all'
              ? 'bg-gray-800 text-white border-gray-800'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
        >
          全単元 ({FIGURES.length}名)
        </button>
        {availableCategories.map((cat) => {
          const isSel = selectedCategory === cat.id;
          const count = FIGURES.filter((f) => f.categoryId === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 font-bold rounded-xs border ${
                isSel
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {cat.shortName} ({count})
            </button>
          );
        })}
      </div>

      {/* 3列構成テーブル: 人物 | 対応キーワード | 説明 */}
      <div className="space-y-4">
        {displayedCategories.map((cat) => {
          const catFigures = FIGURES.filter((fig) => {
            if (fig.categoryId !== cat.id) return false;
            if (searchQuery.trim()) {
              const q = searchQuery.toLowerCase();
              const figKws = KEYWORDS.filter((k) => k.figureId === fig.id);
              const matchName = fig.name.toLowerCase().includes(q) || (fig.englishName && fig.englishName.toLowerCase().includes(q));
              const matchConcept = fig.mainConcept.toLowerCase().includes(q);
              const matchSummary = fig.summary && fig.summary.toLowerCase().includes(q);
              const matchKw = figKws.some((k) => k.name.toLowerCase().includes(q) || k.definition.toLowerCase().includes(q));
              return matchName || matchConcept || matchSummary || matchKw;
            }
            return true;
          });

          if (catFigures.length === 0) return null;

          return (
            <div key={cat.id} className="bg-white border border-gray-300 rounded-xs overflow-hidden shadow-xs">
              {/* 単元ヘッダー */}
              <div className="bg-gray-100 px-3 py-1.5 border-b border-gray-300 flex items-center justify-between">
                <span className="font-bold text-gray-900 text-xs">
                  {cat.name} ── 全 {catFigures.length} 名
                </span>
                <Link
                  href={`/practice?category=${cat.id}&count=10`}
                  className="px-2.5 py-0.5 bg-gray-800 hover:bg-black text-white font-bold text-[11px] rounded-xs"
                >
                  演習
                </Link>
              </div>

              {/* 3列テーブル */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-300 text-gray-700 text-[11px]">
                    <th className="py-1.5 px-3 font-bold w-44 border-r border-gray-200">人物</th>
                    <th className="py-1.5 px-3 font-bold w-64 border-r border-gray-200">対応キーワード</th>
                    <th className="py-1.5 px-3 font-bold">説明</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {catFigures.map((fig, figIdx) => {
                    const figKeywords = KEYWORDS.filter((k) => k.figureId === fig.id);
                    const rowCount = figKeywords.length > 0 ? figKeywords.length : 1;
                    const isEven = figIdx % 2 === 0;

                    if (figKeywords.length === 0) {
                      return (
                        <tr key={fig.id} className={isEven ? 'bg-white' : 'bg-gray-50/40'}>
                          <td className="py-2.5 px-3 align-top border-r border-gray-200 space-y-1">
                            <strong className="text-sm font-bold text-gray-900 block">
                              {highlightMatch(fig.name, searchQuery)}
                            </strong>
                            {fig.books && fig.books.length > 0 && (
                              <div className="text-[11px] text-gray-600 font-medium leading-snug">
                                {highlightMatch(`『${fig.books.join('』、『')}』`, searchQuery)}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 align-top border-r border-gray-200 text-gray-400 text-[11px]">-</td>
                          <td className="py-2.5 px-3 align-top text-gray-600 text-[11px]">{fig.summary}</td>
                        </tr>
                      );
                    }

                    return figKeywords.map((kw, kwIdx) => (
                      <tr
                        key={kw.id}
                        className={`${isEven ? 'bg-white' : 'bg-gray-50/40'} ${
                          kwIdx > 0 ? 'border-t border-gray-100' : ''
                        }`}
                      >
                        {/* 1. 人物セル (最初の行のみ rowSpan で描画) */}
                        {kwIdx === 0 && (
                          <td
                            rowSpan={rowCount}
                            className="py-2.5 px-3 align-top border-r border-gray-200 space-y-1 bg-inherit"
                          >
                            <strong className="text-sm font-bold text-gray-900 block">
                              {highlightMatch(fig.name, searchQuery)}
                            </strong>
                            {fig.books && fig.books.length > 0 && (
                              <div className="text-[11px] text-gray-600 font-medium leading-snug">
                                {highlightMatch(`『${fig.books.join('』、『')}』`, searchQuery)}
                              </div>
                            )}
                          </td>
                        )}

                        {/* 2. 対応キーワード */}
                        <td className="py-1.5 px-3 align-top border-r border-gray-200 font-bold text-gray-900 leading-snug">
                          ・{highlightMatch(kw.name, searchQuery)}
                        </td>

                        {/* 3. 説明 */}
                        <td className="py-1.5 px-3 align-top text-gray-700 text-[11px] leading-relaxed">
                          {highlightMatch(kw.definition, searchQuery)}
                        </td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DictionaryPage() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-xs text-gray-500">読み込み中...</div>}>
      <MapContent />
    </Suspense>
  );
}
