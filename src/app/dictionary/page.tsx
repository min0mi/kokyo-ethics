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

  const displayedCategories = useMemo(() => {
    if (selectedCategory === 'all') {
      return availableCategories;
    }
    return availableCategories.filter((c) => c.id === selectedCategory);
  }, [selectedCategory, availableCategories]);

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-3 space-y-3 text-xs text-gray-900">
      {/* ページヘッダー ＆ 検索バー */}
      <div className="bg-white border border-gray-300 p-3 rounded-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-gray-900">
            思想・人物対応表
          </h1>
          <p className="text-[11px] text-gray-500 mt-0.5">
            人物と対応するキーワードの一覧
          </p>
        </div>

        <div className="w-full sm:w-56">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="人物・語句で絞り込み..."
            className="w-full px-2 py-1 border border-gray-300 rounded-xs text-xs focus:outline-hidden focus:border-gray-500"
          />
        </div>
      </div>

      {/* 単元切り替えタブ（モノトーン・淡白） */}
      <div className="flex flex-wrap gap-1 border-b border-gray-300 pb-1 text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-2.5 py-1 font-bold rounded-xs border ${
            selectedCategory === 'all'
              ? 'bg-gray-800 text-white border-gray-800'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
        >
          全単元
        </button>
        {availableCategories.map((cat) => {
          const isSel = selectedCategory === cat.id;
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
              {cat.shortName}
            </button>
          );
        })}
      </div>

      {/* 単元別：淡白な2列対応表 */}
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
              <div className="bg-gray-100 px-3 py-1.5 border-b border-gray-300 flex items-center justify-between">
                <span className="font-bold text-gray-900 text-xs">
                  {cat.name} ({cat.era})
                </span>
                <Link
                  href={`/practice?category=${cat.id}&count=10`}
                  className="px-2 py-0.5 bg-gray-800 hover:bg-black text-white font-bold text-[11px] rounded-xs"
                >
                  演習
                </Link>
              </div>

              {/* テーブル */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-300 text-gray-600 text-[11px]">
                    <th className="py-1.5 px-3 font-bold w-44 border-r border-gray-200">人物</th>
                    <th className="py-1.5 px-3 font-bold">対応キーワード・定義</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {catFigures.map((fig, idx) => {
                    const figKeywords = KEYWORDS.filter((k) => k.figureId === fig.id);
                    const figBooks = BOOKS.filter((b) => b.figureId === fig.id);

                    return (
                      <tr
                        key={fig.id}
                        className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                      >
                        {/* 左列：人物名 */}
                        <td className="py-2.5 px-3 align-top border-r border-gray-200 space-y-1">
                          <strong className="text-sm font-bold text-gray-900 block">
                            {fig.name}
                          </strong>
                          {fig.englishName && (
                            <span className="text-[10px] text-gray-500 font-mono block">
                              {fig.englishName}
                            </span>
                          )}
                          <p className="text-[11px] text-gray-600">
                            {fig.mainConcept}
                          </p>
                          {figBooks.length > 0 && (
                            <div className="text-[10px] text-gray-500 pt-0.5">
                              著書: {figBooks.map((b) => b.title).join(', ')}
                            </div>
                          )}
                        </td>

                        {/* 右列：対応語句 */}
                        <td className="py-2.5 px-3 align-top space-y-1.5">
                          {figKeywords.length === 0 ? (
                            <span className="text-gray-400 text-[11px]">-</span>
                          ) : (
                            <div className="space-y-1">
                              {figKeywords.map((kw) => (
                                <div
                                  key={kw.id}
                                  className="flex flex-col sm:flex-row sm:items-baseline gap-1 py-0.5 border-b border-gray-100 last:border-0"
                                >
                                  <span className="font-bold text-gray-900 shrink-0 min-w-[140px]">
                                    {kw.name}
                                  </span>
                                  <span className="text-gray-600 text-[11px]">
                                    {kw.definition}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
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
