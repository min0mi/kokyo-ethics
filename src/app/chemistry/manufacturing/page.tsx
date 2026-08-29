'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { GAS_PROCESSES, GAS_RAW } from '@/data/chemistry/gasProcesses';
import { sounds } from '@/lib/sound';

export default function ManufacturingPage() {
  const params = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search);
  const requested = Number(params.get('count') || 10);
  const count = [5, 10, 14].includes(requested) ? requested : 10;
  const modeParam = params.get('mode') || 'all';
  const mode: 'raw' | 'heat' = modeParam === 'heat' ? 'heat' : 'raw';
  const setMode = (_next: 'raw' | 'heat') => {};
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [heat, setHeat] = useState<boolean | null>(null);
  const [result, setResult] = useState<boolean | null>(null);
  const gas = GAS_PROCESSES[index % count];
  const options = useMemo(() => {
    const opposite = gas.raw.find((x) => x.startsWith('希'))?.replace('希', '濃') || gas.raw.find((x) => x.startsWith('濃'))?.replace('濃', '希');
    return [...gas.raw, ...(opposite && !gas.raw.includes(opposite) ? [opposite] : []), ...GAS_RAW.filter((x) => !gas.raw.includes(x) && x !== opposite).slice(index % 5, index % 5 + (opposite ? 5 : 6))];
  }, [gas, index]);
  const judgeRaw = (selection: string[]) => { const correct = selection.length === gas.raw.length && selection.every((x) => gas.raw.includes(x)); setResult(correct); if (correct) { sounds.playCorrect(); window.setTimeout(() => { setIndex((i) => (i + 1) % count); setPicked([]); setHeat(null); setResult(null); }, 380); } else sounds.playWrong(); };
  const toggleRaw = (x: string) => { setPicked((current) => { const next = current.includes(x) ? current.filter((y) => y !== x) : [...current, x]; if (next.length === gas.raw.length) judgeRaw(next); return next; }); };
  useEffect(() => { const onKey = (e: KeyboardEvent) => { if (e.repeat || result !== null) return; const n = Number(e.key); if (mode === 'raw' && n >= 1 && n <= options.length) toggleRaw(options[n - 1]); if (mode === 'heat' && (n === 1 || n === 2)) { setHeat(n === 1); setResult((n === 1) === gas.heat); } }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, [mode, result, options, gas]);
  const next = () => { setIndex((index + 1) % count); setPicked([]); setHeat(null); setResult(null); };
  return <main className="mx-auto max-w-3xl space-y-4 px-3 py-5 text-sm"><header className="rounded border bg-white p-4"><p className="text-xs font-bold text-blue-700">集中マスター・気体の製法シリーズ</p><h1 className="mt-1 text-xl font-bold">気体の実験的製法</h1><p className="mt-2 text-gray-600">{index + 1} / {count}問　数字キーで選択できます</p></header><div className="flex gap-2"><button onClick={() => { setMode('raw'); setResult(null); }} className={`rounded border px-3 py-2 ${mode === 'raw' ? 'bg-gray-900 text-white' : ''}`}>物質→原料</button><button onClick={() => { setMode('heat'); setResult(null); }} className={`rounded border px-3 py-2 ${mode === 'heat' ? 'bg-gray-900 text-white' : ''}`}>加熱の有無</button></div><section className="rounded border bg-white p-5"><h2 className="text-lg font-bold">{mode === 'raw' ? `${gas.name}（${gas.formula}）の原料をすべて選べ。` : `${gas.raw.join(' ＋ ')} から ${gas.name}（${gas.formula}）を発生させるとき、加熱は必要か？`}</h2>{mode === 'raw' ? <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{options.map((x, i) => <label key={x} className={`rounded border p-2 ${picked.includes(x) ? 'border-blue-700 bg-blue-50' : ''}`}><input type="checkbox" checked={picked.includes(x)} onChange={() => toggleRaw(x)} /><span className="ml-1">{i + 1}. {x}</span></label>)}</div> : <div className="mt-4 flex gap-2"><button onClick={() => { setHeat(true); setResult(gas.heat); }} className={`rounded border px-4 py-2 ${heat === true ? 'bg-blue-700 text-white' : ''}`}>1. 必要</button><button onClick={() => { setHeat(false); setResult(!gas.heat); }} className={`rounded border px-4 py-2 ${heat === false ? 'bg-blue-700 text-white' : ''}`}>2. 不要</button></div>}{result !== null && <p className={`mt-4 rounded p-3 font-bold ${result ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>{result ? '正解' : `不正解　正答：${mode === 'raw' ? gas.raw.join('、') : gas.heat ? '必要' : '不要'}`}</p>}<button onClick={next} className="mt-5 rounded border px-4 py-2">次の問題</button></section><Link href="/chemistry" className="text-blue-700 underline">集中マスターへ戻る</Link></main>;
}
