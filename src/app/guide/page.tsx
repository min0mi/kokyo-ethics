import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: '使い方ガイド | 公共倫理パーフェクトマスター.com',
  description: '公共倫理パーフェクトマスター.comの効率的な学習方法と機能一覧',
};

export default function GuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-4 text-xs text-gray-900 leading-relaxed">
      {/* ページヘッダー */}
      <div className="border-b border-gray-300 pb-2">
        <span className="text-[11px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-xs border border-gray-300">
          利用案内
        </span>
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 mt-1">
          使い方ガイド（最短で共通テストの点数を伸ばす学習手順）
        </h1>
        <p className="text-[11px] text-gray-500 mt-0.5">
          本サイトは、共通テスト倫理・公共で最も失点しやすい「人物とキーワードの混同・ひっかけ」を高速で解消するための特訓ツールです。
        </p>
      </div>

      {/* ステップ1 */}
      <section className="bg-white border border-gray-300 rounded-xs p-4 space-y-2 shadow-xs">
        <div className="flex items-center gap-2 border-b border-gray-200 pb-1.5">
          <span className="bg-gray-800 text-white font-bold px-2 py-0.5 rounded-xs text-[11px]">
            STEP 1
          </span>
          <h2 className="text-sm font-bold text-gray-900">
            思想・人物対応表で「人物と語句の結びつき」を確認する
          </h2>
        </div>
        <p className="text-gray-700">
          まずは上部バーの「<Link href="/dictionary" className="text-blue-700 font-bold hover:underline">思想・人物対応表</Link>」を開き、全体像を把握します。
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 pl-1">
          <li>
            <strong>左右2列のシンプル構成:</strong> 左列に人物名と時代、右列に対応キーワードと1行定義を掲載。
          </li>
          <li>
            <strong>即時ハイライト検索:</strong> 検索バーに用語（例:「アタラクシア」「仁」）を入力すると、一致する箇所が自動で黄色く強調表示されます。
          </li>
          <li>
            <strong>単元別タブ切り替え:</strong> 古代ギリシャ、ユダヤ・キリスト、イスラーム、インド仏教、中国思想、日本思想、青年期をワンクリックで絞り込めます。
          </li>
        </ul>
      </section>

      {/* ステップ2 */}
      <section className="bg-white border border-gray-300 rounded-xs p-4 space-y-2 shadow-xs">
        <div className="flex items-center gap-2 border-b border-gray-200 pb-1.5">
          <span className="bg-gray-800 text-white font-bold px-2 py-0.5 rounded-xs text-[11px]">
            STEP 2
          </span>
          <h2 className="text-sm font-bold text-gray-900">
            演習で「1問3秒の瞬間反射」を鍛える（英単語感覚）
          </h2>
        </div>
        <p className="text-gray-700">
          トップページの「演習を開始する」ボタンから、反射的に正解を選ぶトレーニングを行います。
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
          <div className="bg-gray-50 border border-gray-300 p-2.5 rounded-xs space-y-1">
            <strong className="text-gray-900 block">出題される5つの形式:</strong>
            <ul className="list-disc list-inside text-gray-600 space-y-0.5">
              <li><strong>人物 ➔ 語句:</strong> 「ソクラテス」に対応する語句はどれか？</li>
              <li><strong>語句 ➔ 人物:</strong> 「アパテイア」に対応する人物は誰か？</li>
              <li><strong>仲間はずれ:</strong> 「プラトン」に対応しない語句はどれか？</li>
              <li><strong>ペア正誤:</strong> 人物と語句の組合せで正しいものはどれか？</li>
              <li><strong>線つなぎ:</strong> 3名の人物と6択の語句（ダミー含む）を線で結ぶ</li>
            </ul>
          </div>
          <div className="bg-gray-50 border border-gray-300 p-2.5 rounded-xs space-y-1">
            <strong className="text-gray-900 block">高速操作とテンポ:</strong>
            <ul className="list-disc list-inside text-gray-600 space-y-0.5">
              <li><strong>キーボード対応:</strong> 数字キー <kbd className="bg-white border border-gray-400 px-1 rounded-2xs font-mono">1</kbd>〜<kbd className="bg-white border border-gray-400 px-1 rounded-2xs font-mono">4</kbd> で即答。</li>
              <li><strong>正解時:</strong> 0.38秒後に自動で次へ進みます。</li>
              <li><strong>不正解時:</strong> 1行の対比メモが表示されます。<kbd className="bg-white border border-gray-400 px-1 rounded-2xs font-mono">Space</kbd> または <kbd className="bg-white border border-gray-400 px-1 rounded-2xs font-mono">Enter</kbd> で即次へ。</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ステップ3 */}
      <section className="bg-white border border-gray-300 rounded-xs p-4 space-y-2 shadow-xs">
        <div className="flex items-center gap-2 border-b border-gray-200 pb-1.5">
          <span className="bg-gray-800 text-white font-bold px-2 py-0.5 rounded-xs text-[11px]">
            STEP 3
          </span>
          <h2 className="text-sm font-bold text-gray-900">
            忘却曲線（SRS）で自動復習する
          </h2>
        </div>
        <p className="text-gray-700">
          人間の脳は時間とともに記憶を忘却します。本サイトでは <strong>SuperMemo-2 (SM-2) アルゴリズム</strong> を採用しており、正解した問題は1日後、3日後、7日後、16日後、30日後と間隔を広げながら、忘れかけたベストなタイミングで自動出題されます。
        </p>
        <p className="text-gray-600">
          トップページの黄色い枠に「本日の忘却曲線 復習キュー」が表示されたら、優先して復習を解きましょう。
        </p>
      </section>

      {/* ステップ4 */}
      <section className="bg-white border border-gray-300 rounded-xs p-4 space-y-2 shadow-xs">
        <div className="flex items-center gap-2 border-b border-gray-200 pb-1.5">
          <span className="bg-gray-800 text-white font-bold px-2 py-0.5 rounded-xs text-[11px]">
            STEP 4
          </span>
          <h2 className="text-sm font-bold text-gray-900">
            学習時間と問題数の記録（グラフ確認）
          </h2>
        </div>
        <p className="text-gray-700">
          演習中に実際に問題を解いていた時間が秒単位で自動集計されます。
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 pl-1">
          <li>
            <strong>学習進捗・グラフ（<Link href="/stats" className="text-blue-700 font-bold hover:underline">/stats</Link>）:</strong> 日別の解答問題数や学習時間を [7日] [14日] [30日] [全期間] で折れ線グラフ表示。
          </li>
          <li>
            <strong>連続学習日数と経験値（XP）:</strong> 毎日の学習継続でストリーク（連続日数）がカウントされ、全国ランキング（<Link href="/ranking" className="text-blue-700 font-bold hover:underline">/ranking</Link>）にも反映されます。
          </li>
        </ul>
      </section>

      {/* トップへ戻るボタン */}
      <div className="pt-2 text-center">
        <Link
          href="/"
          className="inline-block px-6 py-2 bg-gray-900 hover:bg-black text-white font-bold rounded-xs text-xs shadow-xs"
        >
          トップページへ戻って演習を始める
        </Link>
      </div>
    </div>
  );
}

