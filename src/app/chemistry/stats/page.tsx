'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChemistryStatsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/stats?subject=chemistry');
  }, [router]);

  return <div className="text-center py-10 text-xs text-gray-500">無機化学のアナリティクスへ移動中...</div>;
}
