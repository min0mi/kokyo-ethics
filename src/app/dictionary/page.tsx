'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FIGURES } from '@/data/figures';
import { KEYWORDS } from '@/data/keywords';
import { CATEGORIES } from '@/data/categories';
import Link from 'next/link';

// ひらがな ➔ カタカナ
function hiraToKana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60)
  );
}

// カタカナ ➔ ひらがな
function kanaToHira(str: string): string {
  return str.replace(/[\u30a1-\u30f6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

// ひらがな・カタカナ両対応マッチ判定
function isMatch(text: string, query: string): boolean {
  if (!query || !query.trim()) return true;
  if (!text) return false;

  const qLower = query.toLowerCase().trim();
  const tLower = text.toLowerCase();

  const qKana = hiraToKana(qLower);
  const qHira = kanaToHira(qLower);
  const tKana = hiraToKana(tLower);

  return (
    tLower.includes(qLower) ||
    tKana.includes(qKana) ||
    tLower.includes(qHira) ||
    tKana.includes(qLower)
  );
}

// 検索ワード一致部分のハイライトヘルパー
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query || !query.trim() || !text) return text;

  const q = query.trim();
  const qHira = kanaToHira(q);
  const qKana = hiraToKana(q);

  const patterns = Array.from(new Set([q, qHira, qKana])).filter(Boolean);
  const escaped = patterns.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  if (parts.length === 1) return text;

  return parts.map((part, idx) => {
    const isMatched = patterns.some((p) => p.toLowerCase() === part.toLowerCase());
    return isMatched ? (
      <mark key={idx} className="bg-yellow-200 text-black px-0.5 rounded-xs font-bold">
        {part}
      </mark>
    ) : (
      part
    );
  });
}

type MainGroup = 'all' | '源流思想' | '日本思想' | '西洋思想';

function MapContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [selectedGroup, setSelectedGroup] = useState<MainGroup>('all');
  const [searchQuery, setSearchQuery] = useState<string>(queryParam);

  const availableCategories = useMemo(() => CATEGORIES.filter((c) => c.isAvailable), []);

  // 3大区分（源流思想・日本思想・西洋思想）ごとの件数
  const groupCounts = useMemo(() => {
    const counts = {
      all: FIGURES.length,
      '源流思想': 0,
      '日本思想': 0,
      '西洋思想': 0,
    };
    FIGURES.forEach((fig) => {
      const cat = CATEGORIES.find((c) => c.id === fig.categoryId);
      if (cat && cat.groupName in counts) {
        counts[cat.groupName as '源流思想' | '日本思想' | '西洋思想'] += 1;
      }
    });
    return counts;
  }, []);

  // 表示するカテゴリ一覧
  const displayedCategories = useMemo(() => {
    if (selectedGroup === 'all') {
      return availableCategories;
    }
    return availableCategories.filter((c) => c.groupName === selectedGroup);
  }, [selectedGroup, availableCategories]);

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-3 space-y-3 text-xs text-gray-900">
      {/* ページヘッダー ＆ 検索バー */}
      <div className="bg-white border border-gray-300 p-3 rounded-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-gray-900">
            思想・人物対応表
          </h1>
          <p className="text-[11px] text-gray-500 mt-0.5">
            人物・著書・対応キーワード・説明（全{FIGURES.length}名・{KEYWORDS.length}語句）
          </p>
        </div>

        <div className="w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ひらがな・カタカナ・人物・語句で検索..."
            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-xs text-base sm:text-xs focus:outline-hidden focus:border-gray-500 shadow-inner"
          />
        </div>
      </div>

      {/* 大分類切り替えタブ（源流思想・日本思想・西洋思想） */}
      <div className="flex flex-wrap gap-1.5 border-b border-gray-300 pb-1.5 text-xs">
        <button
          onClick={() => setSelectedGroup('all')}
          className={`px-3 py-1 font-bold rounded-xs border ${
            selectedGroup === 'all'
              ? 'bg-gray-800 text-white border-gray-800 shadow-xs'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
        >
          全思想 ({groupCounts.all}名)
        </button>
        <button
          onClick={() => setSelectedGroup('源流思想')}
          className={`px-3 py-1 font-bold rounded-xs border ${
            selectedGroup === '源流思想'
              ? 'bg-gray-800 text-white border-gray-800 shadow-xs'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
        >
          源流思想 ({groupCounts['源流思想']}名)
        </button>
        <button
          onClick={() => setSelectedGroup('日本思想')}
          className={`px-3 py-1 font-bold rounded-xs border ${
            selectedGroup === '日本思想'
              ? 'bg-gray-800 text-white border-gray-800 shadow-xs'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
        >
          日本思想 ({groupCounts['日本思想']}名)
        </button>
        <button
          onClick={() => setSelectedGroup('西洋思想')}
          className={`px-3 py-1 font-bold rounded-xs border ${
            selectedGroup === '西洋思想'
              ? 'bg-gray-800 text-white border-gray-800 shadow-xs'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
        >
          西洋思想 ({groupCounts['西洋思想']}名)
        </button>
      </div>

      {/* 3列構成テーブル: 1人物 1行 (人物 | 対応キーワード | 説明・エピソード) */}
      <div className="space-y-4">
        {displayedCategories.map((cat) => {
          const catFigures = FIGURES.filter((fig) => {
            if (fig.categoryId !== cat.id) return false;
            if (searchQuery.trim()) {
              const figKws = KEYWORDS.filter((k) => k.figureId === fig.id);
              const matchName = isMatch(fig.name, searchQuery) || (fig.englishName && isMatch(fig.englishName, searchQuery));
              const matchConcept = isMatch(fig.mainConcept, searchQuery);
              const matchSummary = fig.summary && isMatch(fig.summary, searchQuery);
              const matchBooks = fig.books && fig.books.some((b) => isMatch(b, searchQuery));
              const matchKw = figKws.some((k) => isMatch(k.name, searchQuery) || isMatch(k.definition, searchQuery));
              return matchName || matchConcept || matchSummary || matchBooks || matchKw;
            }
            return true;
          });

          if (catFigures.length === 0) return null;

          return (
            <div key={cat.id} className="bg-white border border-gray-300 rounded-xs overflow-hidden shadow-xs">
              {/* 単元ヘッダー */}
              <div className="bg-gray-100 px-3 py-1.5 border-b border-gray-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-xs">
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    （{catFigures.length} 名）
                  </span>
                </div>
                <Link
                  href={`/practice?category=${cat.id}&count=10`}
                  className="px-2.5 py-0.5 bg-gray-800 hover:bg-black text-white font-bold text-[11px] rounded-xs shadow-xs"
                >
                  この単元を演習
                </Link>
              </div>

              {/* PC用: 1人物1行 3列テーブル */}
              <table className="hidden sm:table w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-300 text-gray-700 text-[11px]">
                    <th className="py-2 px-3 font-bold w-48 border-r border-gray-200">人物</th>
                    <th className="py-2 px-3 font-bold w-72 border-r border-gray-200">対応キーワード</th>
                    <th className="py-2 px-3 font-bold">説明・エピソード</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {catFigures.map((fig, figIdx) => {
                    const figKeywords = KEYWORDS.filter((k) => k.figureId === fig.id);
                    const isEven = figIdx % 2 === 0;

                    return (
                      <tr
                        key={fig.id}
                        className={isEven ? 'bg-white hover:bg-gray-50/60' : 'bg-gray-50/40 hover:bg-gray-100/60'}
                      >
                        {/* 1. 人物列 */}
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

                        {/* 2. 対応キーワード列（1セル内に箇条書きで一覧表示） */}
                        <td className="py-2.5 px-3 align-top border-r border-gray-200">
                          {figKeywords.length === 0 ? (
                            <span className="text-gray-400 text-[11px]">-</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {figKeywords.map((kw) => (
                                <span
                                  key={kw.id}
                                  className="inline-block bg-gray-100 border border-gray-300 text-gray-900 font-bold px-1.5 py-0.5 rounded-xs text-[11px]"
                                >
                                  {highlightMatch(kw.name, searchQuery)}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* 3. 説明・エピソード列（人物自体の説明・有名エピソード） */}
                        <td className="py-2.5 px-3 align-top text-gray-700 text-[11px] leading-relaxed">
                          {highlightMatch(fig.summary, searchQuery)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* スマホ用: カードリスト形式 */}
              <div className="block sm:hidden divide-y divide-gray-200">
                {catFigures.map((fig, figIdx) => {
                  const figKeywords = KEYWORDS.filter((k) => k.figureId === fig.id);
                  const isEven = figIdx % 2 === 0;

                  return (
                    <div
                      key={fig.id}
                      className={`p-3 space-y-2 text-xs ${
                        isEven ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-baseline justify-between">
                        <strong className="text-sm font-bold text-gray-900">
                          {highlightMatch(fig.name, searchQuery)}
                        </strong>
                        {fig.eraDetail && (
                          <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-xs border border-gray-200">
                            {fig.eraDetail}
                          </span>
                        )}
                      </div>

                      {fig.books && fig.books.length > 0 && (
                        <div className="text-[11px] text-gray-600 font-medium">
                          {highlightMatch(`『${fig.books.join('』、『')}』`, searchQuery)}
                        </div>
                      )}

                      {figKeywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {figKeywords.map((kw) => (
                            <span
                              key={kw.id}
                              className="inline-block bg-gray-100 border border-gray-300 text-gray-900 font-bold px-1.5 py-0.5 rounded-xs text-[10px]"
                            >
                              {highlightMatch(kw.name, searchQuery)}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="text-[11px] text-gray-700 leading-relaxed pt-0.5">
                        {highlightMatch(fig.summary, searchQuery)}
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
    <Suspense fallback={<div className="text-center py-10 text-xs text-gray-500">読み込み中...</div>}>
      <MapContent />
    </Suspense>
  );
}
