import React from 'react';
import { FileText } from 'lucide-react';

export const metadata = {
  title: '利用規約 | 公共倫理パーフェクトマスター.com',
  description: '公共倫理パーフェクトマスター.comの利用規約です。',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 text-gray-800">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">利用規約</h1>
          <p className="text-xs text-gray-500">制定日: 2026年8月27日</p>
        </div>
      </div>

      <div className="prose prose-sm max-w-none space-y-6 text-xs sm:text-sm leading-relaxed text-gray-700">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">第1条（適用）</h2>
          <p>
            本規約は、当サイト「公共倫理パーフェクトマスター.com」（以下「当サイト」）が提供するすべてのサービスの利用条件を定めるものです。利用者は、本規約に同意の上で当サービスを利用するものとします。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">第2条（禁止事項）</h2>
          <p>利用者は、当サービスの利用にあたり、以下の行為をしてはなりません。</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>法令または公序良俗に違反する行為</li>
            <li>不正アクセスやサーバーに過度な負荷をかける行為、自動スクレイピング</li>
            <li>他の利用者の学習体験を妨害する行為、不適切なニックネームの登録</li>
            <li>当サイトのコンテンツの無断転載・商業目的での再配布</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">第3条（サービスの提供・変更・中断）</h2>
          <p>
            当サイトは、利用者に事前通知することなく、当サービスの内容を変更、または提供を一時停止・終了することができるものとします。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">第4条（著作権）</h2>
          <p>
            当サイトに掲載されている問題文、解説、デザイン、プログラム等の著作権は当サイト運営者または正当な権利者に帰属します。
          </p>
        </section>
      </div>
    </div>
  );
}

