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
    <div className="mx-auto max-w-7xl space-y-3 px-2 py-3 text-xs text-gray-900 sm:px-4">
      <div className="flex items-center gap-3 rounded-xs border border-gray-300 bg-white p-3 shadow-xs">
        <div className="rounded-xs border border-gray-300 bg-gray-100 p-2 text-gray-700">
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-900">お問い合わせ・フィードバック</h1>
          <p className="text-[11px] text-gray-500">
            問題の誤植報告、機能追加のご要望、ご意見等を受け付けております。
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-xs border border-gray-300 bg-white p-4 shadow-xs">
        <div className="space-y-2 text-xs leading-relaxed text-gray-700">
          <p>以下のGoogleフォームよりお問い合わせください。</p>
        </div>

        <a
          href={GOOGLE_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xs bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700"
        >
          <ExternalLink className="w-4 h-4" />
          お問い合わせフォームを開く
        </a>
      </div>
    </div>
  );
}
