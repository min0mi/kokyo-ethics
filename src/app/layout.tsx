import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '公共倫理パーフェクトマスター.com | 共通テスト構造的暗記特訓',
  description:
    '大学入学共通テスト「公共、倫理」「倫理」対策に特化した、構造的知識定着Webサイト。忘却曲線(SM-2)に合わせた問題提示で最速マスター！',
  keywords: [
    '公共倫理',
    '共通テスト倫理',
    '共テ倫理',
    '公共倫理パーフェクトマスター',
    '倫理暗記',
    '忘却曲線',
    '大学受験',
  ],
  authors: [{ name: '公共倫理パーフェクトマスター.com 運営' }],
  metadataBase: new URL('https://kokyo-ethics.com'),
  openGraph: {
    title: '公共倫理パーフェクトマスター.com | 共通テスト構造的暗記特訓',
    description:
      '単なる一問一答ではなく、思想家・キーワード・著書・エピソードのつながりを脳に焼き付ける共通テスト対策Webアプリ。',
    url: 'https://kokyo-ethics.com',
    siteName: '公共倫理パーフェクトマスター.com',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 675,
        alt: '公共倫理パーフェクトマスター.com',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '公共倫理パーフェクトマスター.com',
    description: '共通テスト「公共、倫理」構造的記憶システム',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang="ja">
      <head>
        {/* Google AdSense スクリプトタグ（環境変数設定時に自動有効化） */}
        {adsenseClientId && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className={`${inter.className} min-h-screen bg-[#f0f2f5] text-gray-900 flex flex-col antialiased`}>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-MZ5VJXZXSS"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-MZ5VJXZXSS');
          `}
        </Script>

        <Header />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
