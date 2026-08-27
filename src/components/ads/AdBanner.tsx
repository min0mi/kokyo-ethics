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

  return (
    <div className={`my-4 flex flex-col items-center justify-center overflow-hidden ${className}`}>
      <span className="text-[10px] text-gray-400 font-medium tracking-wider mb-1 uppercase">
        {label}
      </span>

      {isProd && clientPublisherId ? (
        <ins
          className="adsbygoogle block w-full text-center"
          style={{ display: 'block' }}
          data-ad-client={clientPublisherId}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      ) : (
        <div className="w-full max-w-2xl min-h-[90px] border border-dashed border-indigo-200 bg-gradient-to-r from-indigo-50/60 via-purple-50/40 to-indigo-50/60 rounded-xl flex flex-col items-center justify-center p-3 text-center transition-all hover:border-indigo-300">
          <div className="flex items-center gap-2 text-indigo-600 font-medium text-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            広告掲載スペース（Google AdSense 枠）
          </div>
          <p className="text-[11px] text-gray-500 mt-1 max-w-md">
            本番環境ではここにGoogle AdSense広告が表示されます。審査用コード・ads.txt対応済み。
          </p>
        </div>
      )}
    </div>
  );
};

