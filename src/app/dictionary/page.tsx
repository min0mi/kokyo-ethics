'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FIGURES } from '@/data/figures';
import { KEYWORDS } from '@/data/keywords';
import { BOOKS } from '@/data/books';
import { CATEGORIES } from '@/data/categories';
import { CategoryId } from '@/types';
import Link from 'next/link';

function MapContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>(queryParam);

  const availableCategories = useMemo(() => CATEGORIES.filter((c) => c.isAvailable), []);

  // 絞り込み
  const displayedCategories = useMemo(() => {
    if (selectedCategory === 'all') {
      return availableCategories;
    }
    return availableCategories.filter((c) => c.id === selectedCategory);
  }, [selectedCategory, availableCategories]);

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-3 space-y-3 text-xs">
      {/* ページヘッダー ＆ 検索バー */}
      <div className="bg-white border border-gray-300 p-3 rounded-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        <div>
          <h1 className="text-base sm:text-lg font-black text-gray-900">
            思想・人物対応マップ
          </h1>
          <p className="text-[11px] text-gray-500 mt-0.5">
            左列の「人物」と右列の「対応する語句・キーワード」の構造的対照表
          </p>
        </div>

        {/* 検索入力 */}
        <div className="w-full md:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="人物・語句で絞り込み..."
            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-xs text-xs focus:outline-hidden focus:border-blue-600"
          />
        </div>
      </div>

      {/* 単元切り替えタブ */}
      <div className="flex flex-wrap gap-1 border-b border-gray-300 pb-1 text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 font-bold rounded-xs border ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
        >
          全単元を表示
        </button>
        {availableCategories.map((cat) => {
          const isSel = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 font-bold rounded-xs border ${
                isSel
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {cat.shortName}
            </button>
          );
        })}
      </div>

      {/* 単元別：左列に人物 ⇄ 右列に対応語句 */}
      <div className="space-y-4">
        {displayedCategories.map((cat) => {
          const catFigures = FIGURES.filter((fig) => {
            if (fig.categoryId !== cat.id) return false;
            if (searchQuery.trim()) {
              const q = searchQuery.toLowerCase();
              const figKws = KEYWORDS.filter((k) => k.figureId === fig.id);
              const matchName = fig.name.toLowerCase().includes(q) || (fig.englishName && fig.englishName.toLowerCase().includes(q));
              const matchConcept = fig.mainConcept.toLowerCase().includes(q);
              const matchKw = figKws.some((k) => k.name.toLowerCase().includes(q) || k.definition.toLowerCase().includes(q));
              return matchName || matchConcept || matchKw;
            }
            return true;
          });

          if (catFigures.length === 0) return null;

          return (
            <div key={cat.id} className="bg-white border border-gray-300 rounded-xs overflow-hidden">
              {/* 単元ヘッダー */}
              <div className="bg-gray-100 px-3.5 py-2 border-b border-gray-300 flex items-center justify-between">
                <div>
                  <strong className="text-sm text-gray-900">{cat.name}</strong>
                  <span className="text-[11px] text-gray-500 ml-2">({cat.era})</span>
                </div>
                <Link
                  href={`/practice?category=${cat.id}&count=10`}
                  className="px-2.5 py-0.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-xs"
                >
                  この単元を演習 »
                </Link>
              </div>

              {/* 人物 ⇄ 対応語句 対照テーブル */}
              <div className="divide-y divide-gray-200">
                {catFigures.map((fig, idx) => {
                  const figKeywords = KEYWORDS.filter((k) => k.figureId === fig.id);
                  const figBooks = BOOKS.filter((b) => b.figureId === fig.id);
                  const contrastFig = fig.contrastFigureIds && fig.contrastFigureIds.length > 0
                    ? FIGURES.find((f) => f.id === fig.contrastFigureIds?.[0])
                    : null;

                  return (
                    <div
                      key={fig.id}
                      className={`grid grid-cols-1 md:grid-cols-12 p-3 gap-3 ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                      }`}
                    >
                      {/* ===== 左列：人物情報 (4/12) ===== */}
                      <div className="md:col-span-4 space-y-1.5 border-b md:border-b-0 md:border-r border-gray-200 pb-2 md:pb-0 md:pr-3">
                        <div className="flex items-baseline justify-between">
                          <strong className="text-sm sm:text-base font-black text-gray-900">
                            {fig.name}
                          </strong>
                          {fig.englishName && (
                            <span className="text-[10px] text-gray-400 font-mono">
                              {fig.englishName}
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] font-bold text-blue-900 bg-blue-50/60 p-1.5 border border-blue-200 rounded-xs">
                          {fig.mainConcept}
                        </div>

                        <p className="text-[10px] text-gray-600 leading-relaxed">
                          {fig.summary}
                        </p>

                        {/* 対比相手バッジ */}
                        {contrastFig && (
                          <div className="text-[10px] text-red-900 bg-red-50 p-1 rounded-xs border border-red-200">
                            <span className="font-bold">VS 対比:</span> {contrastFig.name} （{contrastFig.mainConcept.slice(0, 14)}...）
                          </div>
                        )}

                        {/* 主著 */}
                        {figBooks.length > 0 && (
                          <div className="text-[10px] text-gray-500">
                            <span className="font-semibold">著書:</span> {figBooks.map((b) => b.title).join(' / ')}
                          </div>
                        )}
                      </div>

                      {/* ===== 右列：対応する語句・キーワード (8/12) ===== */}
                      <div className="md:col-span-8 space-y-2">
                        {figKeywords.length === 0 ? (
                          <span className="text-gray-400 text-[11px]">語句未登録</span>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {figKeywords.map((kw) => (
                              <div
                                key={kw.id}
                                className="bg-white border border-gray-300 p-2 rounded-xs space-y-1 shadow-2xs"
                              >
                                <div className="flex items-center justify-between">
                                  <strong className="text-xs font-bold text-gray-900">
                                    {kw.name}
                                  </strong>
                                  <span className="text-[9px] text-gray-400 font-mono">
                                    {kw.reading}
                                  </span>
                                </div>

                                <div className="text-[11px] text-gray-800 font-semibold bg-gray-50 p-1 rounded-xs border border-gray-200">
                                  {kw.definition}
                                </div>

                                {kw.commonTestPoint && (
                                  <div className="text-[10px] text-yellow-900 font-medium pt-0.5">
                                    {kw.commonTestPoint}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DictionaryPage() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-xs text-gray-500">対応マップ読み込み中...</div>}>
      <MapContent />
    </Suspense>
  );
}
