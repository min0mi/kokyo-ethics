'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PRECIPITATES, SOURCES } from '@/data/chemistry/chemistryReference';
import { ChemicalEquation, ChemicalFormula } from '@/components/chemistry/ChemicalFormula';
import { KEYWORDS } from '@/data/chemistry/keywords';
import { FIGURES } from '@/data/chemistry/figures';

export default function PrecipitatesPage() {
  const [group, setGroup] = useState('すべて');
  const [query, setQuery] = useState('');
  const [hideAnswers, setHideAnswers] = useState(false);
  const [revealed, setRevealed] = useState<string[]>([]);
  const [showTags, setShowTags] = useState(true);
  const rows = PRECIPITATES.map((row) => {
    const keyword = KEYWORDS.find((kw) => kw.id === row.keywordId);
    return { ...row, color: FIGURES.find((f) => f.id === keyword?.figureId)?.name || row.color };
  }).filter((row) => (group === 'すべて' || row.group === group) &&
    `${row.name} ${row.formula} ${row.color} ${row.condition}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 text-gray-900">
    <header><p className="text-xs font-bold text-blue-700">PRECIPITATION</p><h1 className="mt-1 text-2xl font-bold">沈殿を、色と条件で覚える (beta)</h1><p className="mt-2 text-sm text-gray-600">生成条件 → 固体の色 → 過剰な試薬で溶けるか。代表{PRECIPITATES.length}例を同じ順序で比較します。</p></header>
    <div className="grid gap-3 sm:grid-cols-3">{[
      ['1. 沈殿ができる', '水に溶けにくい固体が生じる現象。「無色の溶液」と「白い固体」は別の観察です。'],
      ['2. 色を確かめる', '同じ白色でも物質は違います。陽イオン・陰イオン・化学式をセットで確認します。'],
      ['3. 再溶解で区別する', '少量で沈殿しても、試薬を過剰に加えると溶ける場合があります。NaOHとNH₃は分けて覚えます。'],
    ].map(([title, text]) => <section key={title} className="rounded-lg border border-blue-100 bg-blue-50 p-4"><h2 className="font-bold">{title}</h2><p className="mt-2 text-sm leading-relaxed">{text}</p></section>)}</div>
    <p className="text-sm text-gray-600">以下は学習用の代表条件です。実際の生成は濃度・pH・温度・共存イオンに依存し、イオン積が溶解度積を超えると沈殿します。↓は沈殿。家庭での実験手順ではありません。</p>
    <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
      <label className="block text-sm font-bold">沈殿を検索<input type="search" value={query} onChange={(e) => setQuery(e.target.value)} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-base font-normal" placeholder="例：白色、AgCl、水酸化銅" /></label>
      <div className="flex flex-wrap gap-2">{['すべて', ...Array.from(new Set(PRECIPITATES.map((row) => row.group)))].map((value) => <button type="button" key={value} aria-pressed={group === value} onClick={() => setGroup(value)} className={`rounded-full border px-3 py-1.5 text-sm ${group === value ? 'border-gray-800 bg-gray-800 text-white' : 'border-gray-300'}`}>{value}</button>)}</div>
      <div className="flex flex-wrap gap-5 text-sm"><label><input type="checkbox" checked={showTags} onChange={(e) => setShowTags(e.target.checked)} /> 補助タグを表示</label><label><input type="checkbox" checked={hideAnswers} onChange={(e) => { setHideAnswers(e.target.checked); setRevealed([]); }} /> 色と再溶解を隠して確認</label></div>
    </section>
    <p role="status" className="text-sm text-gray-500">{rows.length}件を表示</p>
    {!rows.length && <p className="rounded border p-5">該当する沈殿がありません。検索語や分類を変えてください。</p>}
    <div className="grid items-start gap-4 md:grid-cols-2">{rows.map((row) => {
      const visible = !hideAnswers || revealed.includes(row.id);
      return <article id={row.id} key={row.id} className="scroll-mt-4 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
        <div><h2 className="text-lg font-bold">{row.name} <ChemicalFormula formula={row.formula} /></h2>{showTags && <span className="text-xs text-gray-500">#{row.group}</span>}</div>
        <p className="text-sm"><strong>生成条件：</strong>{row.condition}</p>
        <div className="overflow-x-auto rounded bg-gray-50 px-3 py-2 text-base"><ChemicalEquation equation={row.equation} /></div>
        {visible ? <div className="space-y-2 border-t border-gray-100 pt-3"><p className="font-bold">沈殿の色：{row.color}</p><p className="text-sm leading-relaxed"><strong>見分け方：</strong>{row.after}</p></div> : <button type="button" onClick={() => setRevealed((previous) => [...previous, row.id])} className="rounded bg-blue-700 px-3 py-2 text-sm text-white">{row.name}の答えを見る</button>}
        {visible && <div className="flex flex-wrap gap-3 text-xs">{row.sources.map((id) => <a key={id} href={SOURCES[id].url} target="_blank" rel="noreferrer" className="text-blue-700 underline">出典：{SOURCES[id].title}</a>)}</div>}
      </article>;
    })}</div>
    <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-4"><h2 className="text-lg font-bold">硫化物は「酸性かどうか」もセット</h2><p className="text-sm leading-relaxed">硫化水素の電離は液性で変わります。酸性では硫化物イオンが少なく、ごく難溶なCuSなどが沈殿します。ZnSなどは中性〜塩基性で沈殿しやすくなります。「Sを加えれば全金属が同じように沈殿する」とは覚えません。</p>
      <p><ChemicalEquation equation="H2S ⇄ 2H^+ + S^2-" /></p><p className="text-xs text-gray-500">上式は二段階の電離をまとめた表示です。実際にはHS⁻も存在します。</p>
      <p className="text-sm">Book1の「Sn〜」「非酸性S：Al・Sn…」は略記の意図が未確認のため、自動で暗記問題にしません。Alは水溶液中では水酸化物の扱いに注意します。</p><a href={SOURCES.sulfide.url} target="_blank" rel="noreferrer" className="inline-block text-xs text-blue-700 underline">出典：{SOURCES.sulfide.title}</a>
    </section>
    <section className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-4"><h2 className="font-bold">誤記と未特定の略記は自動で問題にしません</h2><p className="text-sm">SO₄²⁻・CO₃²⁻へ整理し、確定した沈殿だけ収録しました。「塩素のCl沈殿」などの略記は変更履歴に保存。CaSO₄は濃度にも注意が必要です。</p><Link href="/chemistry/review" className="inline-block text-sm text-blue-700 underline">変更履歴・保留項目を見る →</Link></section>
    <Link href="/chemistry/dictionary" className="inline-block text-sm text-blue-700 underline">物質・色対応表に戻る</Link>
  </div>;
}
