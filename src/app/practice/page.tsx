'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { UnifiedPracticeSession } from '@/components/quiz/UnifiedPracticeSession';
import { CategoryId } from '@/types';

function PracticeContent() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get('category') as CategoryId | null;
  const countParam = searchParams.get('count');

  const f2kParam = searchParams.get('f2k');
  const k2fParam = searchParams.get('k2f');
  const oddParam = searchParams.get('odd');
  const pairParam = searchParams.get('pair');
  const matchingParam = searchParams.get('matching');
  const typingParam = searchParams.get('typing');

  const questionCount = countParam ? parseInt(countParam, 10) : 10;

  const hasSpecificTypes =
    f2kParam !== null ||
    k2fParam !== null ||
    oddParam !== null ||
    pairParam !== null ||
    matchingParam !== null ||
    typingParam !== null;

  const initialConfig = {
    categoryIds: catParam ? [catParam] : undefined,
    questionCount: isNaN(questionCount) ? 10 : questionCount,
    enabledTypes: hasSpecificTypes
      ? {
          figureToKeyword: f2kParam === '1',
          keywordToFigure: k2fParam === '1',
          oddOneOut: oddParam === '1',
          pairValidation: pairParam === '1',
          matching: matchingParam === '1',
          typing: typingParam === '1',
        }
      : undefined,
  };

  return (
    <div className="max-w-4xl mx-auto px-3 py-4">
      <UnifiedPracticeSession initialConfig={initialConfig} autoStart={true} />
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-xs text-gray-500">読み込み中...</div>}>
      <PracticeContent />
    </Suspense>
  );
}
