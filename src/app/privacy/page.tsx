import React from 'react';
import { Shield } from 'lucide-react';

export const metadata = {
  title: 'プライバシーポリシー | 公共倫理パーフェクトマスター.com',
  description: '公共倫理パーフェクトマスター.comのプライバシーポリシーおよび広告配信・Cookieに関する方針です。',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 text-gray-800">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">プライバシーポリシー</h1>
          <p className="text-xs text-gray-500">最終改定日: 2026年8月27日</p>
        </div>
      </div>

      <div className="prose prose-sm max-w-none space-y-6 text-xs sm:text-sm leading-relaxed text-gray-700">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">1. 個人情報の収集・利用目的について</h2>
          <p>
            「公共倫理パーフェクトマスター.com」（以下、「当サイト」）では、ユーザーの学習進捗の保存、ランキング機能の提供、お問い合わせへの対応等のために、必要最小限の利用データ（ニックネーム、学習履歴データ、IPアドレス、Cookie等）を取得・利用する場合があります。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">2. 広告配信について（Google AdSense等）</h2>
          <p>
            当サイトでは、第三者配信の広告サービス「Google AdSense」を利用しています。
            広告配信事業者は、ユーザーの興味に応じた商品やサービスの広告を表示するため、当サイトや他サイトへのアクセスに関する情報「Cookie」（氏名、住所、メール アドレス、電話番号は含まれません）を使用することがあります。
          </p>
          <p>
            Cookieを無効にする設定およびGoogleアドセンスに関する詳細は、
            <a
              href="https://policies.google.com/technologies/ads?hl=ja"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 underline font-semibold ml-1"
            >
              Googleポリシーと規約（広告）
            </a>
            をご確認ください。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">3. アクセス解析ツールについて</h2>
          <p>
            当サイトでは、サイトの利用状況を把握し、学習体験の向上に役立てるためにGoogle Analytics等のアクセス解析ツールを利用する場合があります。これらはトラフィックデータの収集のためにCookieを使用しています。このトラフィックデータは匿名で収集されており、個人を特定するものではありません。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">4. 免責事項</h2>
          <p>
            当サイトに掲載されている情報・解説・問題内容については、可能な限り正確を期しておりますが、共通テスト等の試験での得点や合否を保証するものではありません。当サイトの利用によって生じた損害等について、運営者は一切の責任を負いかねます。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">5. お問い合わせ窓口</h2>
          <p>
            プライバシーポリシーに関するご質問やお問い合わせは、
            <a href="/contact" className="text-indigo-600 underline font-semibold">
              お問い合わせフォーム
            </a>
            よりご連絡ください。
          </p>
        </section>
      </div>
    </div>
  );
}

