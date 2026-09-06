import Link from 'next/link';

export const metadata = {
  title: '使い方 | 公共倫理パーフェクトマスター.com',
  description: '使い方は「当サイトについて・運営者情報」に統合しました。',
  robots: {
    index: false,
    follow: true,
  },
};

export default function GuidePage() {
  return (
    <main className="max-w-3xl mx-auto px-3 py-10 text-center text-xs text-gray-900 space-y-2">
      <meta httpEquiv="refresh" content="0;url=/about#how-to-use" />
      <p className="font-bold text-gray-700 text-sm">使い方は「当サイトについて・運営者情報」に統合しました。</p>
      <p className="text-gray-500 text-[11px]">
        <Link href="/about#how-to-use" className="text-blue-700 hover:underline">使い方を見る »</Link>
      </p>
    </main>
  );
}
