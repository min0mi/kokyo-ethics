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
  const [selectedFigureId, setSelectedFigureId] = useState<string>('epicurus');
  const [searchQuery, setSearchQuery] = useState<string>(queryParam);

  const availableCategories = useMemo(() => CATEGORIES.filter((c) => c.isAvailable), []);

  // 思想家フィルタリング
  const filteredFigures = useMemo(() => {
    return FIGURES.filter((fig) => {
      if (selectedCategory !== 'all' && fig.categoryId !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const figKeywords = KEYWORDS.filter((k) => k.figureId === fig.id);
        const matchName = fig.name.toLowerCase().includes(q) || (fig.englishName && fig.englishName.toLowerCase().includes(q));
        const matchConcept = fig.mainConcept.toLowerCase().includes(q);
        const matchKeyword = figKeywords.some((k) => k.name.toLowerCase().includes(q) || k.definition.toLowerCase().includes(q));
        return matchName || matchConcept || matchKeyword;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  const currentFigure = useMemo(() => {
    const found = FIGURES.find((f) => f.id === selectedFigureId);
    return found || filteredFigures[0] || FIGURES[0];
  }, [selectedFigureId, filteredFigures]);

  const currentKeywords = useMemo(
    () => KEYWORDS.filter((k) => k.figureId === currentFigure?.id),
    [currentFigure]
  );
  const currentBooks = useMemo(
    () => BOOKS.filter((b) => b.figureId === currentFigure?.id),
    [currentFigure]
  );

  // 近傍（同一単元・同分野）の思想家たち
  const neighborFigures = useMemo(() => {
    if (!currentFigure) return [];
    return FIGURES.filter((f) => f.categoryId === currentFigure.categoryId && f.id !== currentFigure.id);
  }, [currentFigure]);

  // 対比相手の思想家たち
  const contrastFigures = useMemo(() => {
    if (!currentFigure?.contrastFigureIds) return [];
    return FIGURES.filter((f) => currentFigure.contrastFigureIds?.includes(f.id));
  }, [currentFigure]);

  const currentCategoryObj = CATEGORIES.find((c) => c.id === currentFigure?.categoryId);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 space-y-3 text-xs">
      {/* 検索 ＆ 単元タブ */}
      <div className="bg-white border border-gray-300 p-2.5 rounded-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 font-bold rounded-xs border text-xs ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
          >
            全源流思想
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 font-bold rounded-xs border text-xs ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {cat.shortName}
            </button>
          ))}
        </div>

        <div className="w-full md:w-60">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="人物・用語検索..."
            className="w-full px-2 py-1 border border-gray-300 rounded-xs text-xs focus:outline-hidden focus:border-blue-600"
          />
        </div>
      </div>

      {/* 人物クイック選択バー（横スクロールで一覧） */}
      <div className="bg-gray-100 border border-gray-300 p-1.5 rounded-xs flex items-center gap-1.5 overflow-x-auto">
        <span className="text-[10px] font-bold text-gray-500 shrink-0 px-1">人物選択:</span>
        {filteredFigures.map((fig) => {
          const isSelected = fig.id === currentFigure?.id;
          return (
            <button
              key={fig.id}
              onClick={() => setSelectedFigureId(fig.id)}
              className={`px-2.5 py-1 rounded-xs border font-bold text-xs shrink-0 transition ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-200'
              }`}
            >
              {fig.name}
            </button>
          );
        })}
      </div>

      {/* ★ マインドマップ構造メインエリア ★ */}
      {currentFigure && (
        <div className="bg-white border-2 border-gray-300 rounded-xs p-4 sm:p-6 space-y-4">
          {/* 上段：中心人物ノード ＆ 単元演習ボタン */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b-2 border-gray-200 pb-3">
            <div className="text-center sm:text-left">
              <span className="text-[10px] bg-blue-100 text-blue-900 font-bold px-1.5 py-0.5 rounded-xs">
                {currentCategoryObj?.name} （{currentFigure.eraDetail}）
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
                {currentFigure.name}
              </h2>
              <p className="text-xs font-bold text-blue-900 mt-0.5">
                テーゼ: {currentFigure.mainConcept}
              </p>
            </div>

            <Link
              href={`/practice?category=${currentFigure.categoryId}&count=10`}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xs shadow-xs shrink-0"
            >
              この単元の演習を解く »
            </Link>
          </div>

          {/* 中段：マインドマップ（キーワード・対比・主著の展開ツリー） */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1. キーワード群（マインドマップ枝①） */}
            <div className="bg-blue-50/50 border border-blue-200 p-3 rounded-xs space-y-2 md:col-span-2">
              <div className="flex items-center gap-1.5 border-b border-blue-200 pb-1">
                <span className="w-2 h-2 bg-blue-600 rounded-full" />
                <strong className="text-blue-950 font-bold text-xs">
                  対応キーワード・中核概念（{currentKeywords.length}）
                </strong>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentKeywords.map((kw) => (
                  <div
                    key={kw.id}
                    className="bg-white border border-blue-300 p-2.5 rounded-xs space-y-1 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-blue-900 font-bold text-xs">{kw.name}</strong>
                      <span className="text-[9px] text-gray-400">[{kw.reading}]</span>
                    </div>

                    <div className="text-[11px] font-semibold text-gray-800 bg-gray-50 p-1 border border-gray-200 rounded-xs">
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
            </div>

            {/* 2. 対比・論争（VS） ＆ 主著 */}
            <div className="space-y-3">
              {/* VS 対比ノード */}
              {contrastFigures.length > 0 && (
                <div className="bg-red-50/60 border border-red-200 p-3 rounded-xs space-y-2">
                  <div className="flex items-center gap-1.5 border-b border-red-200 pb-1">
                    <span className="w-2 h-2 bg-red-600 rounded-full" />
                    <strong className="text-red-950 font-bold text-xs">
                      思想対比・VS（ひっかけ対象）
                    </strong>
                  </div>

                  <div className="space-y-1.5">
                    {contrastFigures.map((other) => (
                      <button
                        key={other.id}
                        onClick={() => setSelectedFigureId(other.id)}
                        className="w-full text-left p-2 bg-white border border-red-300 rounded-xs hover:bg-red-100 transition"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-red-800 text-xs">VS {other.name}</strong>
                          <span className="text-[9px] text-blue-700 underline font-bold">切替 »</span>
                        </div>
                        <p className="text-[10px] text-gray-600 mt-0.5 line-clamp-2">
                          {other.mainConcept}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 代表著作 */}
              <div className="bg-gray-50 border border-gray-300 p-3 rounded-xs space-y-1.5">
                <strong className="text-gray-900 font-bold text-xs block border-b border-gray-200 pb-1">
                  代表著作・古典
                </strong>
                {currentBooks.length === 0 ? (
                  <span className="text-[10px] text-gray-400">言行録・弟子伝承</span>
                ) : (
                  currentBooks.map((b) => (
                    <div key={b.id} className="text-[11px]">
                      <span className="font-bold text-gray-900">{b.title}</span>
                      <p className="text-[10px] text-gray-600 line-clamp-2">{b.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 下段：近傍（同単元・同分野）の思想家一覧 */}
          <div className="bg-gray-50 border border-gray-200 p-3 rounded-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <strong className="text-xs text-gray-700">
                近傍（同単元・同分野）の思想家:
              </strong>
              <span className="text-[10px] text-gray-500">クリックで中心に配置</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {neighborFigures.map((nf) => (
                <button
                  key={nf.id}
                  onClick={() => setSelectedFigureId(nf.id)}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-gray-300 hover:border-blue-500 rounded-xs text-xs font-semibold text-gray-800 transition"
                >
                  {nf.name} <span className="text-[10px] text-gray-500">({nf.mainConcept.slice(0, 10)}...)</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
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
