import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-300 text-xs text-gray-600 mt-10 py-5">
      <div className="max-w-7xl mx-auto px-4 text-center space-y-2.5">
        <div className="flex flex-wrap justify-center items-center gap-x-3.5 gap-y-1 text-gray-700 text-xs">
          <Link href="/" className="hover:underline hover:text-blue-700">トップ</Link>
          <span>|</span>
          <Link href="/dictionary" className="hover:underline hover:text-blue-700">思想・人物対応表</Link>
          <span>|</span>
          <Link href="/guide" className="hover:underline hover:text-blue-700">使い方</Link>
          <span>|</span>
          <Link href="/ranking" className="hover:underline hover:text-blue-700">全国ランキング</Link>
          <span>|</span>
          <Link href="/badges" className="hover:underline hover:text-blue-700">バッジ実績</Link>
          <span>|</span>
          <Link href="/stats" className="hover:underline hover:text-blue-700">学習進捗・グラフ</Link>
          <span>|</span>
          <Link href="/about" className="hover:underline hover:text-blue-700">サイトについて</Link>
          <span>|</span>
          <Link href="/privacy" className="hover:underline hover:text-blue-700">プライバシーポリシー</Link>
          <span>|</span>
          <Link href="/terms" className="hover:underline hover:text-blue-700">利用規約</Link>
          <span>|</span>
          <Link href="/contact" className="hover:underline hover:text-blue-700">お問い合わせ・誤植報告</Link>
        </div>

        <p className="text-[11px] text-gray-500">
          大学入学共通テスト「公共、倫理」「倫理」構造的記憶・忘却曲線演習サイト
        </p>

        <p className="text-[11px] text-gray-400">
          Copyright © {new Date().getFullYear()} 公共倫理パーフェクトマスター.com All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};
