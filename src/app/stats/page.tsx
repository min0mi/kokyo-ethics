'use client';

import React, { Suspense } from 'react';
import { StatsContent } from '@/components/stats/StatsContent';

export default function StatsPage() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-xs text-gray-500">統計データを読み込み中...</div>}>
      <StatsContent defaultSubject="ethics" />
    </Suspense>
  );
}
