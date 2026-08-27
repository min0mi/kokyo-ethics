'use client';

import React, { useState } from 'react';
import { FIGURES } from '@/data/figures';
import { KEYWORDS } from '@/data/keywords';
import { BOOKS } from '@/data/books';
import { EPISODES } from '@/data/episodes';
import { CATEGORIES } from '@/data/categories';
import { CategoryId } from '@/types';
import { Search, BookOpen, Users, Lightbulb, Sparkles, Filter } from 'lucide-react';
import { AdBanner } from '@/components/ads/AdBanner';

export default function DictionaryPage() {
  const [activeTab, setActiveTab] = useState<'keywords' | 'figures' | 'books' | 'episodes'>('keywords');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');

  const filteredKeywords = KEYWORDS.filter((k) => {
    const matchCat = selectedCategory === 'all' || k.categoryId === selectedCategory;
    const matchQuery =
      !searchQuery ||
      k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.reading.includes(searchQuery) ||
      k.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.explanation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const filteredFigures = FIGURES.filter((f) => {
    const matchCat = selectedCategory === 'all' || f.categoryId === selectedCategory;
    const matchQuery =
      !searchQuery ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.englishName && f.englishName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      f.mainConcept.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const filteredBooks = BOOKS.filter((b) => {
    const matchCat = selectedCategory === 'all' || b.categoryId === selectedCategory;
    const matchQuery =
      !searchQuery ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const filteredEpisodes = EPISODES.filter((e) => {
    const matchCat = selectedCategory === 'all' || e.categoryId === selectedCategory;
    const matchQuery =
      !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* ページタイトル */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full inline-block">
          構造的ナレッジベース
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
          公共・倫理 思想・用語図鑑
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          共通テスト頻出の思想家、中心概念、判断語句、主著、エピソードを網羅検索
        </p>
      </div>

      {/* 検索バー & 単元フィルター */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-md border border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="用語名、思想家、定義などをキーワード検索..."
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as CategoryId | 'all')}
              className="w-full sm:w-auto bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">すべての単元（全時代）</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.shortName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* タブ切り替え */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
          {[
            { id: 'keywords', label: `重要キーワード (${filteredKeywords.length})`, icon: Lightbulb },
            { id: 'figures', label: `思想家・人物 (${filteredFigures.length})`, icon: Users },
            { id: 'books', label: `著書・古典 (${filteredBooks.length})`, icon: BookOpen },
            { id: 'episodes', label: `エピソード・背景 (${filteredEpisodes.length})`, icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 広告バナー */}
      <AdBanner label="Sponsor Link" />

      {/* コンテンツ一覧 */}
      <div className="space-y-4">
        {/* キーワードタブ */}
        {activeTab === 'keywords' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredKeywords.map((kw) => {
              const fig = FIGURES.find((f) => f.id === kw.figureId);
              return (
                <div
                  key={kw.id}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-md transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-black text-gray-900">{kw.name}</h3>
                      <span className="text-[11px] text-gray-400 font-mono">（{kw.reading}）</span>
                    </div>
                    {fig && (
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg shrink-0">
                        {fig.name}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-700 font-semibold bg-gray-50 p-3 rounded-xl">
                    {kw.definition}
                  </p>

                  <p className="text-xs text-gray-600 leading-relaxed">{kw.explanation}</p>

                  {kw.commonTestPoint && (
                    <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900">
                      <div className="font-bold flex items-center gap-1 mb-0.5 text-amber-800">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        共テ判断ポイント
                      </div>
                      <p>{kw.commonTestPoint}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 思想家タブ */}
        {activeTab === 'figures' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFigures.map((fig) => {
              const cat = CATEGORIES.find((c) => c.id === fig.categoryId);
              const relatedKeywords = KEYWORDS.filter((k) => k.figureId === fig.id);
              const relatedBooks = BOOKS.filter((b) => b.figureId === fig.id);

              return (
                <div
                  key={fig.id}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-md transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        <span>{fig.name}</span>
                        {fig.englishName && (
                          <span className="text-xs text-gray-400 font-normal">{fig.englishName}</span>
                        )}
                      </h3>
                      <span className="text-[11px] text-indigo-600 font-bold">{fig.eraDetail}</span>
                    </div>
                    {cat && (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg">
                        {cat.shortName}
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-bold text-gray-800 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/50">
                    {fig.mainConcept}
                  </p>

                  <p className="text-xs text-gray-600 leading-relaxed">{fig.summary}</p>

                  {/* 関連キーワード & 著書タグ */}
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {relatedKeywords.map((k) => (
                      <span
                        key={k.id}
                        className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold rounded-md"
                      >
                        {k.name}
                      </span>
                    ))}
                    {relatedBooks.map((b) => (
                      <span
                        key={b.id}
                        className="px-2 py-0.5 bg-violet-50 text-violet-800 border border-violet-200 text-[10px] font-bold rounded-md"
                      >
                        {b.title}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 著書タブ */}
        {activeTab === 'books' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBooks.map((book) => {
              const fig = FIGURES.find((f) => f.id === book.figureId);
              return (
                <div
                  key={book.id}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-md transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-gray-900">{book.title}</h3>
                    {fig && (
                      <span className="px-2.5 py-1 bg-violet-50 text-violet-700 text-xs font-bold rounded-lg">
                        著：{fig.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{book.description}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* エピソードタブ */}
        {activeTab === 'episodes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEpisodes.map((ep) => {
              const fig = FIGURES.find((f) => f.id === ep.figureId);
              return (
                <div
                  key={ep.id}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-md transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-black text-gray-900">{ep.title}</h3>
                    {fig && (
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg shrink-0">
                        {fig.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed bg-slate-50 p-3 rounded-xl">
                    {ep.description}
                  </p>
                  <div className="text-[11px] font-bold text-indigo-800">
                    💡 ポイント: {ep.keyTakeaway}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

