'use client';

import React, { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FIGURES } from '@/data/chemistry/figures';
import { KEYWORDS } from '@/data/chemistry/keywords';
import { CATEGORIES } from '@/data/chemistry/categories';
import { ChemicalText } from '@/components/chemistry/ChemicalFormula';
import { searchCatalog } from '@/lib/chemistry/catalogSearch';

function DictionaryContent() {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [view, setView] = useState<'substance' | 'color'>('substance');
  const [phase, setPhase] = useState('');
  const availableCategoryIds = useMemo(() => new Set(CATEGORIES.filter((cat) => cat.isAvailable).map((cat) => cat.id)), []);
  const scopedKeywords = useMemo(() => KEYWORDS.filter((kw) => availableCategoryIds.has(kw.categoryId)), [availableCategoryIds]);
  const colorMap = useMemo(() => new Map(FIGURES.map((fig) => [fig.id, fig])), []);
  const filtered = useMemo(() => searchCatalog(query, '', phase).filter((kw) => availableCategoryIds.has(kw.categoryId)), [query, phase, availableCategoryIds]);
  const colors = FIGURES.map((fig) => ({ ...fig, substances: filtered.filter((kw) => kw.figureId === fig.id) }))
    .filter((fig) => fig.substances.length);
  const buttonClass = (active: boolean) => `rounded border px-3 py-2 text-sm ${active ? 'border-gray-800 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'}`;

  return (
    <div className="mx-auto max-w-6xl space-y-3 px-2 py-3 text-xs text-gray-900 sm:px-4">
      <header className="flex flex-col items-stretch justify-between gap-2 rounded border border-gray-300 bg-white p-3 shadow-xs sm:flex-row sm:items-center">
        <div>
          <h1 className="text-base font-bold">物質・色対応表 (beta)</h1>
          <p className="mt-0.5 text-[11px] text-gray-500">化学式・色（公開中 {scopedKeywords.length}項目）</p>
        </div>
        <Link href="/chemistry/practice?count=10" className={buttonClass(true)}>すべての色を演習</Link>
      </header>
      <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
        <label className="block text-sm font-medium">
          化学式・色を検索
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="例：Cl2、AgCl、黄色"
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-base" />
        </label>
        <p className="text-xs text-gray-500">色名は完全一致で絞り込みます。「褐色」と「赤褐色」は別の色です。</p>
        <label className="flex items-center gap-2 text-sm">状態・現象
          <select value={phase} onChange={(e) => setPhase(e.target.value)} className="rounded border border-gray-300 px-2 py-1">
            <option value="">すべて</option>
            {Array.from(new Set(KEYWORDS.map((kw) => kw.phase))).map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" aria-pressed={view === 'substance'} onClick={() => setView('substance')} className={buttonClass(view === 'substance')}>化学式から見る</button>
          <button type="button" aria-pressed={view === 'color'} onClick={() => setView('color')} className={buttonClass(view === 'color')}>色から見る</button>
        </div>
      </div>
      <p className="text-sm text-gray-500" role="status">{filtered.length}項目・{colors.length}色を表示</p>
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p>該当する物質がありません。</p>
          <button type="button" onClick={() => { setQuery(''); setPhase(''); }} className="mt-3 text-sm text-blue-700 underline">すべての絞り込みを解除</button>
        </div>
      ) : view === 'substance' ? (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-3 border-b border-gray-200 bg-gray-50 px-4 py-2 text-sm font-bold sm:grid-cols-[minmax(0,1fr)_9rem]">
            <span>化学式</span><span>色</span>
          </div>
          <ul className="divide-y divide-gray-100">
            {filtered.map((kw) => (
              <li key={kw.id} className="grid grid-cols-[minmax(0,1fr)_6rem] items-start gap-3 px-4 py-3 even:bg-gray-50/50 sm:grid-cols-[minmax(0,1fr)_9rem]">
                <div className="min-w-0 break-words"><strong className="text-base"><ChemicalText text={kw.name} /></strong>{kw.condition && <p className="mt-1 text-xs leading-relaxed text-gray-600"><ChemicalText text={kw.condition} /></p>}</div>
                <span className="rounded border border-gray-200 bg-white px-2 py-1 text-center text-sm font-bold">{colorMap.get(kw.figureId)?.name}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from({ length: Math.ceil(colors.length / 2) }, (_, row) => colors.slice(row * 2, row * 2 + 2)).map((pair, row) => (
            <div key={row} className="grid gap-3 lg:grid-cols-2">
            {pair.map((color) => (
            <section key={color.id} className="overflow-hidden rounded border border-gray-300 bg-white shadow-xs">
              <div className="flex items-center justify-between border-b border-gray-300 bg-gray-100 px-3 py-1.5">
                <h2 className="font-bold">{color.name}</h2>
                <span className="text-[10px] text-gray-500">（{color.substances.length}式）</span>
              </div>
              <table className="w-full border-collapse text-left">
                <thead><tr className="border-b border-gray-300 bg-gray-50 text-[11px] text-gray-700"><th className="w-48 border-r border-gray-200 px-3 py-2">化学式</th><th className="px-3 py-2">条件</th></tr></thead>
                <tbody className="divide-y divide-gray-200">
                  {color.substances.map((kw, index) => <tr key={kw.id} className={index % 2 ? 'bg-gray-50/40' : 'bg-white'}><td className="border-r border-gray-200 px-3 py-2.5 text-base font-bold"><ChemicalText text={kw.name} /></td><td className="px-3 py-2.5 text-[11px] leading-relaxed text-gray-700">{kw.condition ? <ChemicalText text={kw.condition} /> : '—'}</td></tr>)}
                </tbody>
              </table>
            </section>
            ))}
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-500">Book1の色暗記シリーズ全41項目を公開しています。</p>
    </div>
  );
}

export default function DictionaryPage() {
  return <Suspense fallback={<p className="p-6 text-center">読み込み中...</p>}><DictionaryContent /></Suspense>;
}
