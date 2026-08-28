'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { UnifiedPracticeSession } from '@/components/quiz/UnifiedPracticeSession';
import { CategoryId } from '@/types';
import { CATEGORIES } from '@/data/categories';

function PracticeContent() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get('category') as CategoryId | null;
  const groupParam = searchParams.get('group'); // 'all' | '源流思想' | '日本思想' | '西洋思想'
  const countParam = searchParams.get('count');
  const weakParam = searchParams.get('weak');

  const f2kParam = searchParams.get('f2k');
  const k2fParam = searchParams.get('k2f');
  const oddParam = searchParams.get('odd');
  const pairParam = searchParams.get('pair');
  const matchingParam = searchParams.get('matching');

  const questionCount = countParam ? parseInt(countParam, 10) : 10;

  const hasSpecificTypes =
    f2kParam !== null ||
    k2fParam !== null ||
    oddParam !== null ||
    pairParam !== null ||
    matchingParam !== null;

  // 出題対象カテゴリの決定
  let targetCategoryIds: CategoryId[] | undefined = undefined;
  if (catParam) {
    targetCategoryIds = [catParam];
  } else if (groupParam && groupParam !== 'all') {
    targetCategoryIds = CATEGORIES.filter((c) => c.groupName === groupParam).map((c) => c.id);
  }

  const initialConfig = {
    categoryIds: targetCategoryIds,
    questionCount: isNaN(questionCount) ? 10 : questionCount,
    onlyWeak: weakParam === '1',
    enabledTypes: hasSpecificTypes
      ? {
          figureToKeyword: f2kParam === '1',
          keywordToFigure: k2fParam === '1',
          oddOneOut: oddParam === '1',
          pairValidation: pairParam === '1',
          matching: matchingParam === '1',
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
