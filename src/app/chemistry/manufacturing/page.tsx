'use client';
import { useEffect,useMemo,useState } from 'react';
import Link from 'next/link';
import { GAS_PROCESSES,GAS_RAW } from '@/data/chemistry/gasProcesses';
import { GAS_DRYING_AGENTS,GAS_PROPERTIES } from '@/data/chemistry/gasProperties';
import { UserDataStore } from '@/lib/storage/userDataStore';
import { sounds } from '@/lib/sound';
import { QuizResult } from '@/components/chemistry/quiz/QuizResult';
import { PracticeQuestionCard } from '@/components/chemistry/quiz/PracticeQuestionCard';
type Mode='all'|'gas_to_raw'|'raw_to_gas'|'heat'|'gas_to_collection'|'collection_to_gas'|'gas_to_drying'|'drying_to_gas';
type Q={id:string;prompt:string;options:string[];answer:string;multi?:string[]};
const C=['上方置換','下方置換','水上置換'];
const labels:Record<Mode,string>={all:'全範囲',gas_to_raw:'物質→原料',raw_to_gas:'原料→物質',heat:'加熱の有無',gas_to_collection:'物質→捕集法',collection_to_gas:'捕集法→物質',gas_to_drying:'物質→乾燥剤',drying_to_gas:'乾燥剤→物質'};
const gasText=(x:{name:string;formula:string})=>`${x.name}（${x.formula}）`;
function makeQ(m:Mode,i:number):Q { const dryingOnly=m==='gas_to_drying'; const base=GAS_PROCESSES.filter(x=>!dryingOnly||DRYING_FORMULAS.includes(x.formula)); const p=base[i%base.length], g=GAS_PROPERTIES.find(x=>x.formula===p.formula)!;
 if(m==='gas_to_raw')return{id:`gas-raw-${p.formula}`,prompt:`${gasText(p)}の原料をすべて選べ。`,options:[...p.raw,...GAS_RAW.filter(x=>!p.raw.includes(x)).slice(i%5,i%5+6)],answer:p.raw[0],multi:p.raw};
 if(m==='raw_to_gas'){const r=p.raw[0],ok=GAS_PROCESSES.filter(x=>x.raw.includes(r)).map(gasText),bad=GAS_PROCESSES.filter(x=>!x.raw.includes(r)).map(gasText);return{id:`raw-gas-${p.formula}`,prompt:`${r}を原料として発生する気体はどれか。`,options:[...ok,...bad].slice(0,4),answer:gasText(p)};}
 if(m==='heat')return{id:`gas-heat-${p.formula}`,prompt:`${p.raw.join(' ＋ ')}から${gasText(p)}を発生させるとき、加熱は必要か？`,options:['必要','不要'],answer:p.heat?'必要':'不要'};
 if(m==='gas_to_collection')return{id:`gas-col-${p.formula}`,prompt:`${gasText(p)}の捕集法はどれか。`,options:C,answer:g.collection};
 if(m==='collection_to_gas'){const a=g.collection,cs=GAS_PROPERTIES.filter(x=>x.collection===a),t=cs[i%cs.length];return{id:`col-gas-${t.formula}`,prompt:`${a}で捕集する気体はどれか。`,options:[gasText(t),...GAS_PROPERTIES.filter(x=>x.collection!==a).slice(i%5,i%5+3).map(gasText)],answer:gasText(t)};}
 if(m==='gas_to_drying'){const a=g.drying[0];return{id:`gas-dry-${p.formula}`,prompt:`${p.formula}の乾燥に使用できる乾燥剤はどれか。`,options:[a,...GAS_DRYING_AGENTS.filter(x=>!g.drying.includes(x))].slice(0,4),answer:a};}
 const a=GAS_DRYING_AGENTS[i%GAS_DRYING_AGENTS.length],cs=GAS_PROPERTIES.filter(x=>DRYING_FORMULAS.includes(x.formula)&&x.drying.includes(a)),t=cs[i%cs.length];return{id:`dry-gas-${a}-${t.formula}`,prompt:`${a}で乾燥できる気体はどれか。`,options:[gasText(t),...GAS_PROPERTIES.filter(x=>!x.drying.includes(a)).slice(i%5,i%5+3).map(gasText)],answer:gasText(t)};
}
const DRYING_FORMULAS=['NH₃','HCl','Cl₂','SO₂','H₂S','CO₂','NO₂','HF'];
const ALL_MODES:Mode[]=['gas_to_raw','raw_to_gas','heat','gas_to_collection','collection_to_gas','gas_to_drying','drying_to_gas'];
const shuffle=<T,>(items:T[])=>items.slice().sort(()=>Math.random()-0.5);
export default function ManufacturingPage(){const qsp=new URLSearchParams(typeof window==='undefined'?'':window.location.search),n=Number(qsp.get('count')||10),count=n===999?14:([5,10,14].includes(n)?n:10);const initial=(qsp.get('mode')||'all') as Mode;const [mode,setMode]=useState<Mode>('all');useEffect(()=>{const value=(new URLSearchParams(window.location.search).get('mode')||'all') as Mode;setMode(labels[value]?value:'all')},[]);const questions=useMemo(()=>{const source=mode==='all'?ALL_MODES.flatMap(m=>GAS_PROCESSES.map((_,j)=>makeQ(m,j))):GAS_PROCESSES.map((_,j)=>makeQ(mode,j));return shuffle(source).slice(0,count).map(q=>({...q,options:shuffle(q.options)}));},[mode,count]);const [i,setI]=useState(0),[picked,setPicked]=useState<string[]>([]),[sel,setSel]=useState<string|null>(null),[result,setResult]=useState<boolean|null>(null),[completed,setCompleted]=useState(false),[correctCount,setCorrectCount]=useState(0),[totalXp,setTotalXp]=useState(0),[startTime]=useState(Date.now());const q=questions[i]||questions[0];const next=()=>{if(i>=questions.length-1){setCompleted(true);return}setI(x=>x+1);setPicked([]);setSel(null);setResult(null)};const submit=(v:string[])=>{if(result!==null)return;const ok=q.multi?v.length===q.multi.length&&v.every(x=>q.multi!.includes(x)):v[0]===q.answer;setResult(ok);if(ok)setCorrectCount(x=>x+1);setTotalXp(x=>x+(ok?10:2));UserDataStore.recordAnswer(q.id,ok,ok?4:1,2);ok?sounds.playCorrect():sounds.playWrong();if(ok)window.setTimeout(next,380)};useEffect(()=>{if(!q||completed)return;const h=(e:KeyboardEvent)=>{if(e.repeat||result!==null)return;const k=Number(e.key);if(k<1||k>q.options.length)return;const v=q.options[k-1];if(q.multi)setPicked(c=>{const z=c.includes(v)?c.filter(x=>x!==v):[...c,v];if(z.length===q.multi!.length)setTimeout(()=>submit(z),0);return z}); else {setSel(v);submit([v])}};addEventListener('keydown',h);return()=>removeEventListener('keydown',h)},[q,result,completed]);if(completed)return <QuizResult totalQuestions={questions.length} correctCount={correctCount} xpEarned={totalXp} elapsedSeconds={(Date.now()-startTime)/1000} onRetry={()=>window.location.reload()} modeTitle="気体の製法シリーズ" />;return <main className="mx-auto max-w-4xl space-y-3"><div className="flex items-center justify-between rounded-xs border border-gray-400 bg-white px-3.5 py-2 text-xs shadow-xs"><span className="font-bold">演習 （第 {i+1} 問 / 全 {questions.length} 問）</span><Link href="/chemistry" className="text-[11px] text-gray-500 hover:underline">[設定変更]</Link></div><PracticeQuestionCard prompt={q.prompt} options={q.options} selected={q.multi?picked[picked.length-1]||null:sel} answered={result!==null} correct={q.answer} onSelect={(x)=>q.multi?setPicked(c=>{const z=c.includes(x)?c.filter(y=>y!==x):[...c,x];if(z.length===q.multi!.length)submit(z);return z}):(setSel(x),submit([x]))} onNext={next}/></main>}



