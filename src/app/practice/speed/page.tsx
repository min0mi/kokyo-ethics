'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cat = searchParams.get('category');

  useEffect(() => {
    const query = cat ? `?category=${cat}&choice=1&count=10` : `?choice=1&count=10`;
    router.replace(`/practice${query}`);
  }, [router, cat]);

  return <div className="text-center py-10 text-xs text-gray-500">演習へ移動中...</div>;
}

export default function SpeedPracticePage() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-xs text-gray-500">移動中...</div>}>
      <RedirectContent />
    </Suspense>
  );
}
