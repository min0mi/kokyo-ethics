import React from 'react';
import Link from 'next/link';
import { GraduationCap, Heart, Shield, FileText, Mail, Info } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* サイト概要 */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span>公共倫理パーフェクトマスター.com</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs max-w-md">
              大学入学共通テスト「公共、倫理」「倫理」対策に特化した、構造的知識定着Webアプリケーション。
              人物、キーワード、著書、定義、判断語句の相関を忘却曲線アルゴリズムに基づいてマスターできます。
            </p>
          </div>

          {/* 学習コンテンツ */}
          <div>
            <h4 className="text-slate-200 font-semibold text-xs uppercase tracking-wider mb-3">
              学習メニュー
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-white transition">
                  今日の復習キュー
                </Link>
              </li>
              <li>
                <Link href="/practice/speed" className="hover:text-white transition">
                  スピード暗記道場（mikan風）
                </Link>
              </li>
              <li>
                <Link href="/practice/standard" className="hover:text-white transition">
                  過去問道場風詳細演習
                </Link>
              </li>
              <li>
                <Link href="/practice/matching" className="hover:text-white transition">
                  線つなぎマッチング
                </Link>
              </li>
              <li>
                <Link href="/dictionary" className="hover:text-white transition">
                  思想・重要用語図鑑
                </Link>
              </li>
            </ul>
          </div>

          {/* 規約・法務・問い合わせ */}
          <div>
            <h4 className="text-slate-200 font-semibold text-xs uppercase tracking-wider mb-3">
              法務・サポート
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="flex items-center gap-1.5 hover:text-white transition">
                  <Info className="w-3.5 h-3.5" />
                  サイトについて・運営者
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="flex items-center gap-1.5 hover:text-white transition">
                  <Shield className="w-3.5 h-3.5" />
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="/terms" className="flex items-center gap-1.5 hover:text-white transition">
                  <FileText className="w-3.5 h-3.5" />
                  利用規約
                </Link>
              </li>
              <li>
                <Link href="/contact" className="flex items-center gap-1.5 hover:text-white transition">
                  <Mail className="w-3.5 h-3.5" />
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* コピーライト & 免責 */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} 公共倫理パーフェクトマスター.com All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for all exam candidates
          </p>
        </div>
      </div>
    </footer>
  );
};

