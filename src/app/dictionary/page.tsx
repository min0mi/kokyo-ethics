'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FIGURES } from '@/data/figures';
import { KEYWORDS } from '@/data/keywords';
import { BOOKS } from '@/data/books';
import { EPISODES } from '@/data/episodes';
import { CATEGORIES } from '@/data/categories';
import { CategoryId } from '@/types';
import Link from 'next/link';

function MapContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [selectedFigureId, setSelectedFigureId] = useState<string>('epicurus'); // デフォルトは対比の代表であるエピクロス
  const [searchQuery, setSearchQuery] = useState<string>(queryParam);

  const availableCategories = useMemo(() => CATEGORIES.filter((c) => c.isAvailable), []);

  // 思想家フィルタリング
  const filteredFigures = useMemo(() => {
    return FIGURES.filter((fig) => {
      // 単元絞り込み
      if (selectedCategory !== 'all' && fig.categoryId !== selectedCategory) {
        return false;
      }
      // 検索ワード絞り込み
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const figKeywords = KEYWORDS.filter((k) => k.figureId === fig.id);
        const matchName = fig.name.toLowerCase().includes(q) || (fig.englishName && fig.englishName.toLowerCase().includes(q));
        const matchConcept = fig.mainConcept.toLowerCase().includes(q) || fig.summary.toLowerCase().includes(q);
        const matchKeyword = figKeywords.some((k) => k.name.toLowerCase().includes(q) || k.definition.toLowerCase().includes(q));
        return matchName || matchConcept || matchKeyword;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  // 現在選択中の思想家
  const currentFigure = useMemo(() => {
    const found = FIGURES.find((f) => f.id === selectedFigureId);
    return found || filteredFigures[0] || FIGURES[0];
  }, [selectedFigureId, filteredFigures]);

  // 関連データ
  const currentKeywords = useMemo(
    () => KEYWORDS.filter((k) => k.figureId === currentFigure?.id),
    [currentFigure]
  );
  const currentBooks = useMemo(
    () => BOOKS.filter((b) => b.figureId === currentFigure?.id),
    [currentFigure]
  );
  const currentEpisodes = useMemo(
    () => EPISODES.filter((e) => e.figureId === currentFigure?.id),
    [currentFigure]
  );

  // 対比相手の思想家たち
  const contrastFigures = useMemo(() => {
    if (!currentFigure?.contrastFigureIds) return [];
    return FIGURES.filter((f) => currentFigure.contrastFigureIds?.includes(f.id));
  }, [currentFigure]);

  const currentCategoryObj = CATEGORIES.find((c) => c.id === currentFigure?.categoryId);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 space-y-3 text-xs">
      {/* 上部ヘッダー ＆ 検索バー */}
      <div className="bg-white border border-gray-300 p-3 rounded-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold bg-blue-100 text-blue-900 px-1.5 py-0.2 rounded-xs">
              構造的暗記
            </span>
            <h1 className="text-base sm:text-lg font-bold text-gray-900">
              思想・人物有機相関マップ
            </h1>
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">
            思想家の中核概念・対立関係（VS）・系譜・主著の繋がりを視覚的に整理し、共通テストのひっかけを見抜く
          </p>
        </div>

        {/* 検索入力 */}
        <div className="w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="人物・キーワードで絞り込み..."
            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-xs text-xs focus:outline-hidden focus:border-blue-600"
          />
        </div>
      </div>

      {/* 単元タブバー */}
      <div className="flex flex-wrap gap-1 border-b border-gray-300 pb-1 text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 font-bold rounded-xs border ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
        >
          全源流思想（{FIGURES.length}名）
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
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {cat.shortName} ({count})
            </button>
          );
        })}
      </div>

      {/* 2カラム構成：左カラム（思想家リスト） / 右カラム（有機的構造相関マップ） */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* ================= 左側：思想家セレクター (4/12) ================= */}
        <div className="lg:col-span-4 bg-white border border-gray-300 rounded-xs p-2 space-y-1.5 max-h-[750px] overflow-y-auto">
          <div className="text-[11px] font-bold text-gray-500 px-1 pb-1 border-b border-gray-200 flex justify-between">
            <span>思想家一覧（クリックでマップ切替）</span>
            <span>{filteredFigures.length} 名</span>
          </div>

          {filteredFigures.length === 0 ? (
            <div className="text-gray-400 text-center py-6 text-xs">該当する思想家が見つかりません</div>
          ) : (
            filteredFigures.map((fig) => {
              const isSelected = fig.id === currentFigure?.id;
              const cat = CATEGORIES.find((c) => c.id === fig.categoryId);

              return (
                <button
                  key={fig.id}
                  onClick={() => setSelectedFigureId(fig.id)}
                  className={`w-full text-left p-2 rounded-xs border transition ${
                    isSelected
                      ? 'bg-blue-50 border-blue-600 shadow-xs'
                      : 'bg-gray-50/70 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-baseline gap-1.5">
                      <strong className={`text-xs ${isSelected ? 'text-blue-900 font-black' : 'text-gray-900'}`}>
                        {fig.name}
                      </strong>
                      <span className="text-[10px] text-gray-500">({cat?.shortName})</span>
                    </div>
                    {isSelected && (
                      <span className="text-[9px] bg-blue-600 text-white font-bold px-1 py-0.2 rounded-xs">
                        選択中
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-gray-600 line-clamp-1 mt-0.5">
                    {fig.mainConcept}
                  </p>

                  {/* 関係性バッジ */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {fig.contrastFigureIds && fig.contrastFigureIds.length > 0 && (
                      <span className="text-[9px] bg-red-100 text-red-800 font-bold px-1 py-0.2 rounded-xs border border-red-200">
                        VS {FIGURES.find((f) => f.id === fig.contrastFigureIds?.[0])?.name || '対比'}
                      </span>
                    )}
                    {fig.relations && fig.relations.length > 0 && (
                      <span className="text-[9px] bg-gray-200 text-gray-700 px-1 py-0.2 rounded-xs">
                        {fig.relations[0].label}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* ================= 右側：有機的構造相関マップ (8/12) ================= */}
        <div className="lg:col-span-8 space-y-3">
          {currentFigure ? (
            <div className="space-y-3">
              {/* 思想家ヘッダーカード */}
              <div className="bg-white border-2 border-blue-600 rounded-xs p-3.5 sm:p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2">
                  <div>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded-xs mr-1.5">
                      {currentCategoryObj?.name}
                    </span>
                    <span className="text-xs text-gray-500">{currentFigure.eraDetail}</span>
                    <h2 className="text-lg sm:text-xl font-black text-gray-900 mt-1">
                      {currentFigure.name}
                      {currentFigure.englishName && (
                        <span className="text-xs font-normal text-gray-500 ml-2">
                          ({currentFigure.englishName})
                        </span>
                      )}
                    </h2>
                  </div>

                  <Link
                    href={`/practice?category=${currentFigure.categoryId}`}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xs shadow-xs"
                  >
                    この単元の演習を解く »
                  </Link>
                </div>

                <div className="text-xs text-gray-800 bg-gray-50 p-2.5 rounded-xs border border-gray-200 space-y-1">
                  <div className="font-bold text-blue-900">
                    【中核テーゼ】 {currentFigure.mainConcept}
                  </div>
                  <p className="text-gray-700 leading-relaxed text-[11px]">
                    {currentFigure.summary}
                  </p>
                </div>
              </div>

              {/* ① 核心キーワード ＆ 共通テスト判断ポイント */}
              <div className="bg-white border border-gray-300 rounded-xs p-3.5 space-y-2.5">
                <div className="border-b border-gray-200 pb-1 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-xs">
                    [中核キーワード] 本質的定義と共テ判断語句
                  </h3>
                  <span className="text-[10px] text-gray-500">全 {currentKeywords.length} 語句</span>
                </div>

                <div className="space-y-2">
                  {currentKeywords.map((kw) => (
                    <div
                      key={kw.id}
                      className="p-2.5 bg-gray-50 border border-gray-200 rounded-xs space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-blue-900 text-xs">{kw.name}</strong>
                        <span className="text-[10px] text-gray-500 font-mono">[{kw.reading}]</span>
                      </div>

                      {/* 短く本質的な定義 */}
                      <div className="bg-white p-1.5 border border-gray-300 rounded-xs font-semibold text-gray-900 text-xs">
                        {kw.definition}
                      </div>

                      <p className="text-[11px] text-gray-700 leading-relaxed">
                        {kw.explanation}
                      </p>

                      {/* 共通テスト判断ポイント */}
                      {kw.commonTestPoint && (
                        <div className="bg-yellow-50 border border-yellow-300 p-2 rounded-xs text-[11px] text-yellow-950 font-medium">
                          {kw.commonTestPoint}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ② ⚔️ 思想的対立・比較マップ（VS 対比ペア） */}
              {contrastFigures.length > 0 && (
                <div className="bg-white border-2 border-red-300 rounded-xs p-3.5 space-y-2.5">
                  <div className="border-b border-red-200 pb-1 flex items-center justify-between">
                    <h3 className="font-bold text-red-900 text-xs">
                      [思想的対比・論争] 共通テスト最頻出のひっかけ見分けポイント
                    </h3>
                    <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.2 rounded-xs">
                      要注意
                    </span>
                  </div>

                  <div className="space-y-2">
                    {contrastFigures.map((other) => {
                      const otherKws = KEYWORDS.filter((k) => k.figureId === other.id);

                      return (
                        <div
                          key={other.id}
                          className="bg-red-50/50 border border-red-200 rounded-xs p-2.5 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900 text-xs">
                              【{currentFigure.name}】 <strong className="text-red-600">VS</strong> 【{other.name}】
                            </span>
                            <button
                              onClick={() => setSelectedFigureId(other.id)}
                              className="text-[10px] text-blue-700 hover:underline font-bold"
                            >
                              [{other.name}のマップへ切替]
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            {/* 左: 現在の思想家 */}
                            <div className="bg-white p-2 border border-blue-300 rounded-xs space-y-1">
                              <span className="font-bold text-blue-900 block border-b border-gray-200 pb-0.5">
                                {currentFigure.name} の主張:
                              </span>
                              <div className="font-semibold text-gray-800">{currentFigure.mainConcept}</div>
                              <ul className="list-disc list-inside text-[10px] text-gray-600 space-y-0.5">
                                {currentKeywords.map((k) => (
                                  <li key={k.id} className="truncate">{k.name}</li>
                                ))}
                              </ul>
                            </div>

                            {/* 右: 対比相手の思想家 */}
                            <div className="bg-white p-2 border border-red-300 rounded-xs space-y-1">
                              <span className="font-bold text-red-900 block border-b border-gray-200 pb-0.5">
                                {other.name} の主張:
                              </span>
                              <div className="font-semibold text-gray-800">{other.mainConcept}</div>
                              <ul className="list-disc list-inside text-[10px] text-gray-600 space-y-0.5">
                                {otherKws.map((k) => (
                                  <li key={k.id} className="truncate">{k.name}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ③ 🔗 思想の系譜・継承関係（師弟・批判的発展） */}
              {currentFigure.relations && currentFigure.relations.length > 0 && (
                <div className="bg-white border border-gray-300 rounded-xs p-3.5 space-y-2">
                  <h3 className="font-bold text-gray-900 text-xs border-b border-gray-200 pb-1">
                    [思想の系譜・継承と批判] 有機的つながり
                  </h3>
                  <div className="space-y-1.5">
                    {currentFigure.relations.map((rel, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-gray-50 border border-gray-200 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]"
                      >
                        <div>
                          <strong className="text-gray-900 font-bold">{rel.label}</strong>
                          <p className="text-gray-600 text-[10px] mt-0.5">{rel.description}</p>
                        </div>
                        <button
                          onClick={() => setSelectedFigureId(rel.targetFigureId)}
                          className="text-[10px] text-blue-700 hover:underline shrink-0 text-left sm:text-right font-bold"
                        >
                          [対象人物を見る »]
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ④ 代表著書 ＆ エピソード */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 著作 */}
                <div className="bg-white border border-gray-300 rounded-xs p-3 space-y-1.5">
                  <h3 className="font-bold text-gray-900 text-xs border-b border-gray-200 pb-1">
                    [代表著作・古典]
                  </h3>
                  {currentBooks.length === 0 ? (
                    <p className="text-gray-400 text-[11px]">特筆する単独著作なし（言行録・弟子伝承等）</p>
                  ) : (
                    currentBooks.map((b) => (
                      <div key={b.id} className="text-[11px] space-y-0.5">
                        <strong className="text-blue-900 font-bold">{b.title}</strong>
                        <p className="text-gray-600 text-[10px] leading-relaxed">{b.description}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* エピソード */}
                <div className="bg-white border border-gray-300 rounded-xs p-3 space-y-1.5">
                  <h3 className="font-bold text-gray-900 text-xs border-b border-gray-200 pb-1">
                    [言行録・エピソード]
                  </h3>
                  {currentEpisodes.length === 0 ? (
                    <p className="text-gray-400 text-[11px]">エピソード未登録</p>
                  ) : (
                    currentEpisodes.map((ep) => (
                      <div key={ep.id} className="text-[11px] space-y-0.5">
                        <strong className="text-gray-900 font-bold">{ep.title}</strong>
                        <p className="text-gray-600 text-[10px] leading-relaxed">{ep.description}</p>
                        <div className="text-[10px] text-red-800 font-semibold bg-red-50 p-1 rounded-xs">
                          要点: {ep.keyTakeaway}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-300 p-8 text-center text-xs text-gray-400">
              思想家を選択してください。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DictionaryPage() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-xs text-gray-500">マップ読み込み中...</div>}>
      <MapContent />
    </Suspense>
  );
}
