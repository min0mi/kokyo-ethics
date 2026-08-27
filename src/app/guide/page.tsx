import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: '使い方 | 公共倫理パーフェクトマスター.com',
  description: '公共倫理パーフェクトマスター.comの最短利用ガイド',
};

export default function GuidePage() {
  return (
    <div className="max-w-3xl mx-auto px-3 py-4 space-y-3 text-xs text-gray-900 leading-normal">
      {/* ヘッダー */}
      <div className="border-b border-gray-300 pb-2">
        <h1 className="text-base font-bold text-gray-900">
          使い方ガイド
        </h1>
        <p className="text-[11px] text-gray-500 mt-0.5">
          共通テスト「倫理」「公共」の人物・キーワード対応関係を最短でマスターするための3ステップ
        </p>
      </div>

      {/* 3つのステップ概要 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
        <div className="bg-white border border-gray-300 p-3 rounded-xs space-y-1">
          <div className="font-mono font-bold text-gray-500 text-[10px]">STEP 01</div>
          <strong className="block text-xs text-gray-900">対応表で確認</strong>
          <p className="text-[11px] text-gray-600">人物・キーワード・エピソードを1行で俯瞰</p>
        </div>
        <div className="bg-white border border-gray-300 p-3 rounded-xs space-y-1">
          <div className="font-mono font-bold text-gray-500 text-[10px]">STEP 02</div>
          <strong className="block text-xs text-gray-900">高速反復演習</strong>
          <p className="text-[11px] text-gray-600">4択・線つなぎで即答（Pキーでパス可）</p>
        </div>
        <div className="bg-white border border-gray-300 p-3 rounded-xs space-y-1">
          <div className="font-mono font-bold text-gray-500 text-[10px]">STEP 03</div>
          <strong className="block text-xs text-gray-900">忘却曲線で復習</strong>
          <p className="text-[11px] text-gray-600">間違えた問題を自動で再出題</p>
        </div>
      </div>

      {/* 詳細説明テーブル */}
      <div className="bg-white border border-gray-300 rounded-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 text-gray-700 text-[11px]">
              <th className="py-1.5 px-3 font-bold w-28 border-r border-gray-200">機能</th>
              <th className="py-1.5 px-3 font-bold w-36 border-r border-gray-200">操作 / 画面</th>
              <th className="py-1.5 px-3 font-bold">ポイント</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-[11px]">
            {/* 1. 対応表 */}
            <tr>
              <td className="py-2 px-3 font-bold border-r border-gray-200">
                思想・人物対応表
              </td>
              <td className="py-2 px-3 border-r border-gray-200 text-blue-700 font-semibold">
                <Link href="/dictionary" className="hover:underline">
                  /dictionary »
                </Link>
              </td>
              <td className="py-2 px-3 text-gray-700 space-y-0.5">
                <div>・1人物1行で「人物・著書・対応キーワード・エピソード」を掲載。</div>
                <div>・ひらがな検索（例:「そくらてす」）でもカタカナ人名に完全ヒット＆黄色ハイライト。</div>
              </td>
            </tr>

            {/* 2. 演習 */}
            <tr>
              <td className="py-2 px-3 font-bold border-r border-gray-200">
                反射演習
              </td>
              <td className="py-2 px-3 border-r border-gray-200 text-blue-700 font-semibold">
                <Link href="/" className="hover:underline">
                  トップページ演習 »
                </Link>
              </td>
              <td className="py-2 px-3 text-gray-700 space-y-0.5">
                <div>・出題範囲（全範囲 / 源流思想 / 日本思想 / 西洋思想）を選択可能。</div>
                <div>・<strong>キーボード操作</strong>: <code>1-4</code> で解答、<code>P</code> / <code>0</code> でパス、<code>Enter/Space</code> で次へ。</div>
                <div>・正解時は0.38秒で自動進行。間違えた時は「選んだ誤答」と「正解」の2行対比テーブルを表示。</div>
              </td>
            </tr>

            {/* 3. 学習進捗 */}
            <tr>
              <td className="py-2 px-3 font-bold border-r border-gray-200">
                進捗 ＆ 忘却曲線
              </td>
              <td className="py-2 px-3 border-r border-gray-200 text-blue-700 font-semibold">
                <Link href="/stats" className="hover:underline">
                  /stats »
                </Link>
              </td>
              <td className="py-2 px-3 text-gray-700 space-y-0.5">
                <div>・問題を解いた実時間（秒）を自動計測・記録。</div>
                <div>・SM-2アルゴリズムで、最適な復習タイミングを自動計算。</div>
              </td>
            </tr>

            {/* 4. シェア */}
            <tr>
              <td className="py-2 px-3 font-bold border-r border-gray-200">
                結果シェア
              </td>
              <td className="py-2 px-3 border-r border-gray-200 text-gray-600">
                演習リザルト / 成績
              </td>
              <td className="py-2 px-3 text-gray-700">
                <div>・𝕏（Twitter）シェアボタンまたはワンクリックコピーで、解答結果や学習時間を記録・共有可能。</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* キーボードショートカット一覧 */}
      <div className="bg-gray-50 border border-gray-300 rounded-xs p-3 space-y-1.5">
        <strong className="text-xs font-bold text-gray-800 block">
          演習中のキーボード操作
        </strong>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          <div className="bg-white border border-gray-200 p-1.5 rounded-xs">
            <span className="font-mono font-bold bg-gray-100 px-1 py-0.2 border rounded-xs mr-1">1 ~ 4</span>
            <span>選択肢を選択</span>
          </div>
          <div className="bg-white border border-gray-200 p-1.5 rounded-xs">
            <span className="font-mono font-bold bg-gray-100 px-1 py-0.2 border rounded-xs mr-1">P / 0</span>
            <span>問題をパス</span>
          </div>
          <div className="bg-white border border-gray-200 p-1.5 rounded-xs">
            <span className="font-mono font-bold bg-gray-100 px-1 py-0.2 border rounded-xs mr-1">Space / Enter</span>
            <span>次の問題へ進む</span>
          </div>
          <div className="bg-white border border-gray-200 p-1.5 rounded-xs">
            <span className="font-mono font-bold bg-gray-100 px-1 py-0.2 border rounded-xs mr-1">Esc</span>
            <span>パス / 戻る</span>
          </div>
        </div>
      </div>
    </div>
  );
}
