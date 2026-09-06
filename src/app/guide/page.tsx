import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: '使い方 | 公共倫理パーフェクトマスター.com',
  description: '公共倫理パーフェクトマスター.comで、人物と用語の対応関係を構造的に覚える方法を紹介します。',
};

const cardClass = 'bg-white border border-gray-300 rounded-xs p-4 shadow-xs';

export default function GuidePage() {
  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 space-y-3 text-gray-900">
      <section className="bg-white border border-gray-400 rounded-xs p-4 sm:p-5 shadow-xs">
        <div className="border-b border-gray-200 pb-3">
          <span className="inline-block bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-xs text-[11px] font-bold">
            公共倫理 学習ガイド
          </span>
          <h1 className="text-xl sm:text-2xl font-black mt-1.5">
            このサイトの使い方
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
            公共・倫理の人物と用語を、単語だけでなく「誰が・何を・どのように考えたか」という対応関係から整理して覚えるための学習サイトです。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-4">
          <div className={cardClass}>
            <span className="text-[11px] font-black text-red-700">01</span>
            <h2 className="text-sm font-bold mt-1">対応表で全体像をつかむ</h2>
            <p className="text-xs text-gray-600 leading-relaxed mt-1.5">
              まずは思想・人物対応表で、人物、キーワード、著書、思想のつながりを確認します。名前と用語を別々に暗記するのではなく、関連する情報をひとまとまりで見ていくのがポイントです。
            </p>
            <Link href="/dictionary" className="inline-block mt-2 text-xs font-bold text-blue-700 hover:underline">
              思想・人物対応表を見る »
            </Link>
          </div>

          <div className={cardClass}>
            <span className="text-[11px] font-black text-red-700">02</span>
            <h2 className="text-sm font-bold mt-1">演習で思い出せるか確認する</h2>
            <p className="text-xs text-gray-600 leading-relaxed mt-1.5">
              人物から用語、用語から人物、仲間はずれ、ペア正誤判定など、複数の方向から問題を解きます。見れば分かる状態から、自力で思い出せる状態へ進めます。
            </p>
            <Link href="/practice?count=10" className="inline-block mt-2 text-xs font-bold text-blue-700 hover:underline">
              演習を始める »
            </Link>
          </div>

          <div className={cardClass}>
            <span className="text-[11px] font-black text-red-700">03</span>
            <h2 className="text-sm font-bold mt-1">忘れる前に復習する</h2>
            <p className="text-xs text-gray-600 leading-relaxed mt-1.5">
              回答結果に応じて復習のタイミングを管理します。トップページの復習キューや学習進捗を確認し、間違えた問題を中心に繰り返し取り組みます。
            </p>
            <Link href="/stats" className="inline-block mt-2 text-xs font-bold text-blue-700 hover:underline">
              学習進捗を見る »
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className={cardClass}>
          <h2 className="text-sm font-black border-b border-gray-200 pb-2">人物と用語を構造的に覚える</h2>
          <p className="text-xs text-gray-700 leading-relaxed mt-2">
            公共・倫理では、人物名と用語を一問一答で覚えるだけでは、選択肢の微妙な違いを見抜くのが難しいことがあります。このサイトでは、思想家と主要語句、著書、時代背景、関連する人物を対応づけて整理し、知識同士のつながりを意識しながら学習できます。
          </p>
          <p className="text-xs text-gray-700 leading-relaxed mt-2">
            対応表で意味を確認したあと、演習で逆方向から問い直すことで、「この用語は誰の考えか」「この人物は何を主張したか」を行き来しながら定着させます。似た用語や人物を比較して覚えることも、共通テスト対策に役立ちます。
          </p>
        </div>

        <div className={cardClass}>
          <h2 className="text-sm font-black border-b border-gray-200 pb-2">共通テスト対策としての収録範囲</h2>
          <p className="text-xs text-gray-700 leading-relaxed mt-2">
            共通テストや主要な予想問題集で扱われる人物・用語を中心に、公共・倫理の頻出語句を幅広く収録しています。思想分野だけでなく、人物、著書、概念、宗教、社会に関する用語まで、関連づけて確認できる構成です。
          </p>
          <p className="text-xs text-gray-700 leading-relaxed mt-2">
            ただし、試験範囲や出題内容を完全に保証するものではありません。教科書、資料集、過去問、学校や予備校の教材と組み合わせ、知らない語句や最新の出題傾向を補いながら使うことで、より効果的な学習になります。
          </p>
        </div>
      </section>

      <section className="bg-yellow-50 border border-yellow-400 rounded-xs p-4 shadow-xs">
        <h2 className="text-sm font-black text-gray-900 border-b border-yellow-300 pb-2">おすすめの学習サイクル</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3 text-xs">
          <div className="bg-white border border-yellow-200 rounded-xs p-3">
            <strong className="text-red-700">① 確認</strong>
            <p className="text-gray-700 leading-relaxed mt-1">対応表で、その日に学ぶ分野の人物と用語の関係を確認します。</p>
          </div>
          <div className="bg-white border border-yellow-200 rounded-xs p-3">
            <strong className="text-red-700">② 演習</strong>
            <p className="text-gray-700 leading-relaxed mt-1">10問程度から始め、間違えた問題は解説と資料集で確認します。</p>
          </div>
          <div className="bg-white border border-yellow-200 rounded-xs p-3">
            <strong className="text-red-700">③ 復習</strong>
            <p className="text-gray-700 leading-relaxed mt-1">トップページの復習キューを毎日確認し、忘れる前にもう一度解きます。</p>
          </div>
        </div>
      </section>

      <section className="bg-white border border-gray-300 rounded-xs p-4 shadow-xs">
        <h2 className="text-sm font-black border-b border-gray-200 pb-2">正確な学習のために</h2>
        <p className="text-xs text-gray-700 leading-relaxed mt-2">
          当サイトは学習を補助するためのサービスです。用語の定義や制度、出題範囲については、必ず教科書や資料集、公式資料なども確認してください。誤植や内容の誤りを見つけた場合は、お問い合わせ・誤植報告からご連絡ください。
        </p>
        <Link href="/contact" className="inline-block mt-2 text-xs font-bold text-blue-700 hover:underline">
          お問い合わせ・誤植報告 »
        </Link>
      </section>
    </div>
  );
}
