'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { UnifiedPracticeSession } from '@/components/quiz/UnifiedPracticeSession';
import { CategoryId } from '@/types';

function PracticeContent() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get('category') as CategoryId | null;
  const countParam = searchParams.get('count');

  const choiceParam = searchParams.get('choice');
  const matchingParam = searchParams.get('matching');
  const typingParam = searchParams.get('typing');
  const recallParam = searchParams.get('recall');

  const questionCount = countParam ? parseInt(countParam, 10) : 10;

  const hasSpecificTypes =
    choiceParam !== null ||
    matchingParam !== null ||
    typingParam !== null ||
    recallParam !== null;

  const initialConfig = {
    categoryIds: catParam ? [catParam] : undefined,
    questionCount: isNaN(questionCount) ? 10 : questionCount,
    enabledTypes: hasSpecificTypes
      ? {
          choice: choiceParam === '1',
          matching: matchingParam === '1',
          typing: typingParam === '1',
          recall: recallParam === '1',
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

