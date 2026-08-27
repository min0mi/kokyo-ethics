'use client';

import React, { useEffect } from 'react';

interface AdBannerProps {
  slotId?: string;
  format?: 'auto' | 'horizontal' | 'rectangle' | 'fluid';
  className?: string;
  label?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  slotId = '0000000000',
  format = 'auto',
  className = '',
  label = 'スポンサーリンク',
}) => {
  const isProd = process.env.NODE_ENV === 'production';
  const clientPublisherId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  useEffect(() => {
    if (isProd && clientPublisherId) {
      try {
        const adsbygoogle = (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || [];
        adsbygoogle.push({});
      } catch (e) {
        console.error('AdSense script error', e);
      }
    }
  }, [isProd, clientPublisherId]);

  if (!clientPublisherId) return null;

  return (
    <div className={`my-2 w-full bg-white border border-gray-300 p-2 text-center rounded-sm ${className}`}>
      <span className="text-[10px] text-gray-400 font-bold block mb-1">
        [{label}]
      </span>
      <ins
        className="adsbygoogle block w-full text-center"
        style={{ display: 'block' }}
        data-ad-client={clientPublisherId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};
