'use client';

import React from 'react';
import { KEYWORDS } from '@/data/chemistry/keywords';
import { FIGURES } from '@/data/chemistry/figures';
import { ChemicalText } from '@/components/chemistry/ChemicalFormula';

interface FigureDictRowCardProps {
  figureId?: string;
  keywordId?: string;
  selectedWrongOption?: string | null;
  correctAnswerText?: string;
  isPassed?: boolean;
}

export function FigureDictRowCard({ figureId, keywordId, selectedWrongOption, correctAnswerText, isPassed = false }: FigureDictRowCardProps) {
  // Correct answer text takes precedence over the prompt's color, notably for odd-one-out questions.
  const fallback = KEYWORDS.find((kw) => kw.id === keywordId)?.name || FIGURES.find((f) => f.id === figureId)?.name;
  const correct = correctAnswerText || fallback;
  if (!correct) return null;
  return <div className="space-y-2 text-left text-sm">
    {!isPassed && selectedWrongOption && <section className="rounded border border-red-200 bg-red-50 p-3">
      <h3 className="mb-1 text-xs font-bold text-red-700">選んだ答え</h3>
      <p className="font-bold"><ChemicalText text={selectedWrongOption} /></p>
    </section>}
    <section className="rounded border border-green-200 bg-green-50 p-3">
      <h3 className="mb-1 text-xs font-bold text-green-700">正解</h3>
      <p className="font-bold"><ChemicalText text={correct} /></p>
    </section>
  </div>;
}
