'use client';

import React, { Suspense } from 'react';
import { StatsContent } from '@/components/stats/StatsContent';

export default function ChemistryStatsPage() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-xs text-gray-500">無機化学のアナリティクスを読み込み中...</div>}>
      <StatsContent defaultSubject="chemistry" />
    </Suspense>
  );
}
