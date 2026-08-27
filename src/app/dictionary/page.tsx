'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FIGURES } from '@/data/figures';
import { KEYWORDS } from '@/data/keywords';
import { BOOKS } from '@/data/books';
import { EPISODES } from '@/data/episodes';
import { CATEGORIES } from '@/data/categories';
import { CategoryId } from '@/types';
import { AdBanner } from '@/components/ads/AdBanner';

function DictionaryContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState<'figures' | 'keywords' | 'books' | 'episodes'>('keywords');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState(queryParam);

  useEffect(() => {
    if (queryParam) {
      setSearchTerm(queryParam);
    }
  }, [queryParam]);

  const availableCategories = CATEGORIES.filter((c) => c.isAvailable);

  // フィルタリング
  const filteredFigures = FIGURES.filter((f) => {
    if (selectedCategory !== 'all' && f.categoryId !== selectedCategory) return false;
    if (selectedCategory === 'all' && !availableCategories.some((c) => c.id === f.categoryId)) return false;
    if (!searchTerm) return true;
    return (
      f.name.includes(searchTerm) ||
      (f.englishName && f.englishName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      f.mainConcept.includes(searchTerm) ||
      f.summary.includes(searchTerm)
    );
  });

  const filteredKeywords = KEYWORDS.filter((k) => {
    if (selectedCategory !== 'all' && k.categoryId !== selectedCategory) return false;
    if (selectedCategory === 'all' && !availableCategories.some((c) => c.id === k.categoryId)) return false;
    if (!searchTerm) return true;
    return (
      k.name.includes(searchTerm) ||
      k.reading.includes(searchTerm) ||
      k.definition.includes(searchTerm) ||
      k.explanation.includes(searchTerm) ||
      k.commonTestPoint.includes(searchTerm)
    );
  });

  const filteredBooks = BOOKS.filter((b) => {
    if (selectedCategory !== 'all' && b.categoryId !== selectedCategory) return false;
    if (selectedCategory === 'all' && !availableCategories.some((c) => c.id === b.categoryId)) return false;
    if (!searchTerm) return true;
    return (
      b.title.includes(searchTerm) ||
      b.reading.includes(searchTerm) ||
      b.description.includes(searchTerm)
    );
  });

  const filteredEpisodes = EPISODES.filter((e) => {
    if (selectedCategory !== 'all' && e.categoryId !== selectedCategory) return false;
    if (selectedCategory === 'all' && !availableCategories.some((c) => c.id === e.categoryId)) return false;
    if (!searchTerm) return true;
    return (
      e.title.includes(searchTerm) ||
      e.description.includes(searchTerm) ||
      e.keyTakeaway.includes(searchTerm)
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-3 py-5 space-y-4">
      {/* ページヘッダー */}
      <div className="border-b border-gray-300 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-[11px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-xs border border-gray-300">
            源流思想 データベース
          </span>
          <h1 className="text-xl font-bold text-gray-900 mt-1">
            思想・用語図鑑
          </h1>
        </div>

        {/* 検索バー & 単元フィルター */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <input
            type="text"
            placeholder="用語・人物・定義を検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-2.5 py-1 bg-white border border-gray-300 rounded-xs text-xs focus:outline-hidden focus:border-blue-600 w-48 sm:w-60"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as CategoryId | 'all')}
            className="px-2 py-1 bg-white border border-gray-300 rounded-xs text-xs text-gray-700 focus:outline-hidden focus:border-blue-600"
          >
            <option value="all">源流思想 全単元</option>
            {availableCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.shortName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* タブ切り替え */}
      <div className="flex border-b border-gray-300 text-xs font-bold">
        <button
          onClick={() => setActiveTab('keywords')}
          className={`py-2 px-4 border-b-2 transition ${
            activeTab === 'keywords'
              ? 'border-red-600 text-red-600 bg-white font-black'
              : 'border-transparent text-gray-600 hover:text-blue-700'
          }`}
        >
          キーワード ({filteredKeywords.length})
        </button>

        <button
          onClick={() => setActiveTab('figures')}
          className={`py-2 px-4 border-b-2 transition ${
            activeTab === 'figures'
              ? 'border-red-600 text-red-600 bg-white font-black'
              : 'border-transparent text-gray-600 hover:text-blue-700'
          }`}
        >
          思想家・人物 ({filteredFigures.length})
        </button>

        <button
          onClick={() => setActiveTab('books')}
          className={`py-2 px-4 border-b-2 transition ${
            activeTab === 'books'
              ? 'border-red-600 text-red-600 bg-white font-black'
              : 'border-transparent text-gray-600 hover:text-blue-700'
          }`}
        >
          主著・古典 ({filteredBooks.length})
        </button>

        <button
          onClick={() => setActiveTab('episodes')}
          className={`py-2 px-4 border-b-2 transition ${
            activeTab === 'episodes'
              ? 'border-red-600 text-red-600 bg-white font-black'
              : 'border-transparent text-gray-600 hover:text-blue-700'
          }`}
        >
          エピソード ({filteredEpisodes.length})
        </button>
      </div>

      {/* コンテンツ一覧 */}
      <div className="space-y-3">
        {/* キーワードタブ */}
        {activeTab === 'keywords' && (
          <div className="grid grid-cols-1 gap-2.5">
            {filteredKeywords.map((kw) => {
              const fig = FIGURES.find((f) => f.id === kw.figureId);
              return (
                <div key={kw.id} className="bg-white border border-gray-300 p-3.5 rounded-xs space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1 pb-1.5 border-b border-gray-200">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-base font-bold text-gray-900">{kw.name}</h3>
                      <span className="text-xs text-gray-500 font-mono">（{kw.reading}）</span>
                    </div>
                    {fig && (
                      <span className="text-[11px] bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded-xs border border-blue-200">
                        思想家: {fig.name}
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-bold text-gray-800 leading-relaxed bg-gray-50 p-2 rounded-xs border border-gray-200">
                    {kw.definition}
                  </p>

                  <p className="text-xs text-gray-700 leading-relaxed">
                    {kw.explanation}
                  </p>

                  {kw.commonTestPoint && (
                    <div className="bg-yellow-50 border border-yellow-300 p-2 rounded-xs text-[11px] text-yellow-900">
                      <strong className="block text-yellow-800 mb-0.5">▼ 共通テスト判断ポイント:</strong>
                      {kw.commonTestPoint}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 思想家タブ */}
        {activeTab === 'figures' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredFigures.map((fig) => {
              const kws = KEYWORDS.filter((k) => k.figureId === fig.id);
              const bks = BOOKS.filter((b) => b.figureId === fig.id);

              return (
                <div key={fig.id} className="bg-white border border-gray-300 p-3.5 rounded-xs space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{fig.name}</h3>
                      <span className="text-[11px] text-gray-500">{fig.eraDetail}</span>
                    </div>
                    <span className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-xs border border-gray-300">
                      {fig.mainConcept}
                    </span>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed">
                    {fig.summary}
                  </p>

                  {kws.length > 0 && (
                    <div className="text-[11px] pt-1 border-t border-gray-200">
                      <span className="text-gray-500 font-bold">主要キーワード: </span>
                      <span className="text-blue-700">{kws.map((k) => k.name).join('、')}</span>
                    </div>
                  )}

                  {bks.length > 0 && (
                    <div className="text-[11px]">
                      <span className="text-gray-500 font-bold">主著: </span>
                      <span className="text-gray-800">{bks.map((b) => b.title).join('、')}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 著書タブ */}
        {activeTab === 'books' && (
          <div className="grid grid-cols-1 gap-2.5">
            {filteredBooks.map((bk) => {
              const fig = FIGURES.find((f) => f.id === bk.figureId);
              return (
                <div key={bk.id} className="bg-white border border-gray-300 p-3.5 rounded-xs space-y-1.5">
                  <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                    <h3 className="text-sm font-bold text-gray-900">{bk.title}</h3>
                    {fig && (
                      <span className="text-xs text-blue-700 font-bold">著者: {fig.name}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {bk.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* エピソードタブ */}
        {activeTab === 'episodes' && (
          <div className="grid grid-cols-1 gap-2.5">
            {filteredEpisodes.map((ep) => {
              const fig = FIGURES.find((f) => f.id === ep.figureId);
              return (
                <div key={ep.id} className="bg-white border border-gray-300 p-3.5 rounded-xs space-y-1.5">
                  <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                    <h3 className="text-sm font-bold text-gray-900">{ep.title}</h3>
                    {fig && (
                      <span className="text-xs text-blue-700 font-bold">人物: {fig.name}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-800 leading-relaxed bg-gray-50 p-2 rounded-xs border border-gray-200">
                    {ep.description}
                  </p>
                  <div className="text-[11px] text-gray-600">
                    <strong>[要点]: </strong>{ep.keyTakeaway}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 広告枠 */}
      <AdBanner label="Sponsor" />
    </div>
  );
}

export default function DictionaryPage() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-xs text-gray-500">読み込み中...</div>}>
      <DictionaryContent />
    </Suspense>
  );
}
