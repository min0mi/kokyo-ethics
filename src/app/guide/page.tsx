import React from 'react';

export const metadata = {
  title: 'ページが見つかりません | 公共倫理パーフェクトマスター.com',
};

export default function GuidePage() {
  return (
    <div className="max-w-3xl mx-auto px-3 py-10 text-center text-xs text-gray-900 leading-normal space-y-2">
      <p className="font-bold text-gray-700 text-sm">指定されたページは現在公開されていないか、準備中です。</p>
      <p className="text-gray-500 text-[11px]">お手数ですが、トップページから他の機能をご利用ください。</p>
    </div>
  );
}
