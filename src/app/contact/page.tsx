import React from 'react';
import { Mail, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'お問い合わせ | 公共倫理パーフェクトマスター.com',
  description: '問題の誤植報告、機能追加のご要望、ご意見等を受け付けております。',
};

const GOOGLE_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSc9x1WLxBCj3ApwwZr4FddIqi5bP_BavWeiwUQA1QN738wRUg/viewform?usp=header';

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
          <Mail className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">お問い合わせ・フィードバック</h1>
          <p className="text-xs text-gray-500">
            問題の誤植報告、機能追加のご要望、ご意見等を受け付けております。
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-8 border border-gray-200 space-y-6">
        <div className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <p>以下のGoogleフォームよりお問い合わせください。</p>
        </div>

        <a
          href={GOOGLE_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition"
        >
          <ExternalLink className="w-4 h-4" />
          お問い合わせフォームを開く
        </a>
      </div>
    </div>
  );
}
