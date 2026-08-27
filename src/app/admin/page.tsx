'use client';

import React, { useState } from 'react';
import { QuestionGenerator } from '@/lib/generator/questionGenerator';
import { FIGURES } from '@/data/figures';
import { KEYWORDS } from '@/data/keywords';
import { BOOKS } from '@/data/books';
import { CATEGORIES } from '@/data/categories';
import { Question, CategoryId } from '@/types';
import { Settings, Sparkles, Download, Layers, CheckCircle2 } from 'lucide-react';

export default function AdminPage() {
  const [selectedCat, setSelectedCat] = useState<CategoryId | 'all'>('all');
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const cat = selectedCat === 'all' ? undefined : selectedCat;
      const qs = QuestionGenerator.getAllQuestions(cat);
      setGeneratedQuestions(qs);
      setIsGenerating(false);
    }, 300);
  };

  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(generatedQuestions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `questions_${selectedCat}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportSQL = () => {
    let sql = `-- 自動生成された問題プール (${generatedQuestions.length}件)\n`;
    generatedQuestions.forEach((q) => {
      const prompt = q.prompt.replace(/'/g, "''");
      const explanation = q.explanation.replace(/'/g, "''");
      const context = q.context ? `'${q.context.replace(/'/g, "''")}'` : 'NULL';
      const hint = q.commonTestHint ? `'${q.commonTestHint.replace(/'/g, "''")}'` : 'NULL';

      let optionsJson = 'NULL';
      let correctAnsJson = 'NULL';

      if ('options' in q) {
        optionsJson = `'${JSON.stringify(q.options).replace(/'/g, "''")}'::jsonb`;
        correctAnsJson = `'${JSON.stringify(q.correctAnswer).replace(/'/g, "''")}'::jsonb`;
      } else if ('pairs' in q) {
        correctAnsJson = `'${JSON.stringify(q.pairs).replace(/'/g, "''")}'::jsonb`;
      } else if ('correctAnswers' in q) {
        correctAnsJson = `'${JSON.stringify(q.correctAnswers).replace(/'/g, "''")}'::jsonb`;
      } else if ('expectedAnswers' in q) {
        correctAnsJson = `'${JSON.stringify(q.expectedAnswers).replace(/'/g, "''")}'::jsonb`;
      }

      sql += `INSERT INTO public.questions (id, type, category_id, prompt, context, options, correct_answer, explanation, common_test_hint)\nVALUES ('${q.id}', '${q.type}', '${q.categoryId}', '${prompt}', ${context}, ${optionsJson}, ${correctAnsJson}, '${explanation}', ${hint})\nON CONFLICT (id) DO UPDATE SET prompt = EXCLUDED.prompt;\n\n`;
    });

    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-900 text-white rounded-2xl">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">管理者用 問題生成・DB連携スタジオ</h1>
            <p className="text-xs text-gray-500">
              ナレッジ要素の交叉（Distractor）による問題自動編成・DB同期
            </p>
          </div>
        </div>
      </div>

      {/* ナレッジベース統計 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-400 font-bold block mb-1">登録単元数</span>
          <span className="text-2xl font-black text-gray-900">{CATEGORIES.length} 単元</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-400 font-bold block mb-1">登録思想家</span>
          <span className="text-2xl font-black text-indigo-600">{FIGURES.length} 名</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-400 font-bold block mb-1">重要キーワード</span>
          <span className="text-2xl font-black text-amber-600">{KEYWORDS.length} 語</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-400 font-bold block mb-1">古典・主著</span>
          <span className="text-2xl font-black text-violet-600">{BOOKS.length} 冊</span>
        </div>
      </div>

      {/* 生成コントロール */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-gray-900">問題自動生成設定</h3>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value as CategoryId | 'all')}
            className="w-full sm:w-auto px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">全単元一括（すべての問題テンプレート）</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.shortName}
              </option>
            ))}
          </select>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full sm:w-auto py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-200 transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? '交叉生成中...' : 'テンプレートから問題を自動生成'}</span>
          </button>

          {generatedQuestions.length > 0 && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleExportJSON}
                className="flex-1 sm:flex-initial py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-4 h-4" />
                JSON保存
              </button>
              <button
                onClick={handleExportSQL}
                className="flex-1 sm:flex-initial py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Layers className="w-4 h-4" />}
                {copied ? 'SQLコピー完了!' : 'Supabase用SQLコピー'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 生成プレビュー */}
      {generatedQuestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-gray-900">
              生成結果プレビュー ({generatedQuestions.length} 問)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedQuestions.slice(0, 10).map((q, idx) => (
              <div
                key={q.id}
                className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded-md uppercase text-[10px]">
                    {q.type}
                  </span>
                  <span className="text-gray-400 font-mono text-[10px]">#{idx + 1}</span>
                </div>

                <div className="font-bold text-gray-900 text-sm whitespace-pre-line">{q.prompt}</div>

                {'options' in q && (
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-2 rounded-lg border text-[11px] font-medium truncate ${
                          opt === q.correctAnswer
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                            : 'bg-gray-50 border-gray-200 text-gray-600'
                        }`}
                      >
                        {opt === q.correctAnswer ? '✓ ' : ''}
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

