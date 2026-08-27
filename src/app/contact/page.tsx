'use client';

import React, { useState } from 'react';
import { Mail, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('feedback');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSubmitted(true);
  };

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

      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">お名前（またはニックネーム）</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 受験生A"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base sm:text-sm font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">返信用メールアドレス (任意)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@example.com"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base sm:text-sm font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">お問い合わせ種別</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base sm:text-sm font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="feedback">サイトへのご意見・ご要望</option>
              <option value="typo">問題文・解説の誤植や修正依頼</option>
              <option value="bug">不具合・バグの報告</option>
              <option value="other">その他</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">内容詳細 *</label>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="ご意見や気になる点をご記入ください..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base sm:text-sm font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition transform active:scale-95 text-sm"
          >
            <Send className="w-4 h-4" />
            送信する
          </button>
        </form>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-gray-900">送信が完了いたしました</h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
            貴重なご意見・ご報告をいただき誠にありがとうございます。今後のサイト改善に活用させていただきます。
          </p>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setMessage('');
            }}
            className="py-2.5 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition"
          >
            新しくメッセージを送信
          </button>
        </div>
      )}
    </div>
  );
}

