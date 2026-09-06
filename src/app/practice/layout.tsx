import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '演習 | 公共倫理パーフェクトマスター.com',
  description: '人物と語句の対応関係を確認しながら取り組む公共・倫理の演習ページです。',
  alternates: {
    canonical: '/practice/',
  },
};

export default function PracticeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
