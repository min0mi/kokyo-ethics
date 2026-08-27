'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { UnifiedPracticeSession } from '@/components/quiz/UnifiedPracticeSession';
import { CategoryId } from '@/types';

function PracticeContent() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get('category') as CategoryId | null;
  const modeParam = searchParams.get('mode');

  const initialConfig = {
    categoryIds: catParam ? [catParam] : undefined,
    questionCount: modeParam === 'short' ? 5 : 10,
  };

  return (
    <div className="max-w-4xl mx-auto px-3 py-5">
      <UnifiedPracticeSession initialConfig={initialConfig} />
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

