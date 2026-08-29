'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';

type Gas = { formula: string; name: string; raw: string[]; heat: boolean };
const GASES: Gas[] = [
  { formula:'H₂', name:'水素', raw:['亜鉛','希硫酸'], heat:false },
  { formula:'O₂', name:'酸素', raw:['過酸化水素','酸化マンガン(IV)'], heat:false },
  { formula:'O₃', name:'オゾン', raw:['酸素','無声放電'], heat:false },
  { formula:'N₂', name:'窒素', raw:['亜硝酸アンモニウム'], heat:true },
  { formula:'Cl₂', name:'塩素', raw:['酸化マンガン(IV)','濃塩酸'], heat:true },
  { formula:'HF', name:'フッ化水素', raw:['フッ化カルシウム','濃硫酸'], heat:true },
  { formula:'HCl', name:'塩酸', raw:['塩化ナトリウム','濃硫酸'], heat:true },
  { formula:'CO', name:'一酸化炭素', raw:['ギ酸','濃硫酸'], heat:true },
  { formula:'CO₂', name:'二酸化炭素', raw:['炭酸カルシウム','希塩酸'], heat:false },
  { formula:'NH₃', name:'アンモニア', raw:['塩化アンモニウム','水酸化カルシウム'], heat:true },
  { formula:'NO', name:'一酸化窒素', raw:['銅','希硝酸'], heat:false },
  { formula:'NO₂', name:'二酸化窒素', raw:['銅','濃硝酸'], heat:false },
  { formula:'H₂S', name:'硫化水素', raw:['硫化鉄(II)','希硫酸'], heat:false },
  { formula:'SO₂', name:'二酸化硫黄', raw:['銅','濃硫酸'], heat:true },
];
const ALL_RAW = ['亜鉛','希硫酸','濃硫酸','過酸化水素','酸化マンガン(IV)','酸素','無声放電','亜硝酸アンモニウム','濃塩酸','フッ化カルシウム','塩化ナトリウム','ギ酸','炭酸カルシウム','希塩酸','塩化アンモニウム','水酸化カルシウム','銅','希硝酸','濃硝酸','硫化鉄(II)'];

export default function ManufacturingPage() {
  const [index, setIndex] = useState(0); const [picked, setPicked] = useState<string[]>([]); const [heatChoice, setHeatChoice] = useState<boolean|null>(null); const [answer, setAnswer] = useState<boolean|null>(null); const [mode, setMode] = useState<'raw'|'heat'>('raw');
  const gas = GASES[index];
  const counterpart = gas.raw.some((x) => x.startsWith('希')) ? gas.raw.find((x) => x.startsWith('希'))!.replace('希', '濃') : gas.raw.find((x) => x.startsWith('濃'))?.replace('濃', '希');
  const options = useMemo(() => [...gas.raw, ...(counterpart && !gas.raw.includes(counterpart) ? [counterpart] : []), ...ALL_RAW.filter((x) => !gas.raw.includes(x) && x !== counterpart).slice(index % 5, index % 5 + (counterpart ? 5 : 6))], [gas, index, counterpart]);
  const submit = () => { setAnswer(mode === 'raw' ? picked.length === gas.raw.length && picked.every((x)=>gas.raw.includes(x)) : heatChoice === gas.heat); };
  const next = () => { setIndex((index + 1) % GASES.length); setPicked([]); setHeatChoice(null); setAnswer(null); };
  return <main className="mx-auto max-w-3xl space-y-4 px-3 py-5 text-sm"><header className="rounded border bg-white p-4"><p className="text-xs font-bold text-blue-700">集中マスター・製法暗記</p><h1 className="mt-1 text-xl font-bold">気体の実験的製法</h1><p className="mt-2 text-gray-600">原料（希・濃を含む）と加熱の有無を確認します。</p></header>
    <div className="flex gap-2"><button onClick={()=>{setMode('raw');setAnswer(null);}} className={`rounded border px-3 py-2 ${mode==='raw'?'bg-gray-900 text-white':'bg-white'}`}>原料を選ぶ</button><button onClick={()=>{setMode('heat');setAnswer(null);}} className={`rounded border px-3 py-2 ${mode==='heat'?'bg-gray-900 text-white':'bg-white'}`}>加熱の有無</button></div>
    <section className="rounded border bg-white p-5"><h2 className="text-lg font-bold">{mode==='raw' ? `${gas.name}（${gas.formula}）の原料をすべて選べ。` : `${gas.raw.join(' ＋ ')} から ${gas.name}（${gas.formula}）を発生させるとき、加熱は必要か？`}</h2>{mode==='raw' ? <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{options.map((x)=><label key={x} className={`rounded border p-2 ${picked.includes(x)?'border-blue-700 bg-blue-50':''}`}><input type="checkbox" checked={picked.includes(x)} onChange={()=>setPicked(picked.includes(x)?picked.filter(y=>y!==x):[...picked,x])} /> <span className="ml-1">{x}</span></label>)}</div> : <div className="mt-4 flex gap-2"><button onClick={()=>setHeatChoice(true)} className={`rounded border px-4 py-2 ${heatChoice===true?'bg-blue-700 text-white':''}`}>必要</button><button onClick={()=>setHeatChoice(false)} className={`rounded border px-4 py-2 ${heatChoice===false?'bg-blue-700 text-white':''}`}>不要</button></div>}{answer!==null && <p className={`mt-4 rounded p-3 font-bold ${answer?'bg-green-50 text-green-800':'bg-red-50 text-red-800'}`}>{answer?'正解':'不正解'}{!answer && mode==='raw' && `　正答：${gas.raw.join('、')}`}{mode==='heat' && `　正答：${gas.heat?'必要':'不要'}`}</p>}<div className="mt-5 flex gap-2"><button onClick={submit} className="rounded bg-blue-700 px-4 py-2 font-bold text-white">判定</button><button onClick={next} className="rounded border px-4 py-2">次の問題</button></div></section><Link href="/chemistry" className="text-blue-700 underline">集中マスターへ戻る</Link></main>;
}
