import Link from 'next/link';

export const metadata = {
  title: '当サイトについて・運営者情報 | 公共倫理パーフェクトマスター.com',
  description: '公共倫理パーフェクトマスター.comの目的、独自性、使い方、運営者情報について説明します。',
};

const cardClass = 'bg-white border border-gray-300 rounded-xs p-4 shadow-xs';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-5 space-y-4 text-gray-900">
      <section className="bg-white border border-gray-400 rounded-xs p-4 sm:p-5 shadow-xs">
        <div className="border-b border-gray-200 pb-3">
          <span className="inline-block bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-xs text-[11px] font-bold">
            ABOUT THIS SITE
          </span>
          <h1 className="text-xl sm:text-2xl font-black mt-1.5">
            当サイトについて・運営者情報
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
            公共・倫理の人物名と関連語句の対応関係を、見て確認し、問題で思い出しながら覚えるための学習サイトです。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-4">
          <div className={cardClass}>
            <h2 className="text-sm font-bold">人物 ⇄ 語句の対応に特化</h2>
            <p className="text-xs text-gray-600 leading-relaxed mt-1.5">
              人物から語句、語句から人物へ行き来しながら、名前と用語の組み合わせをシンプルに定着させます。
            </p>
          </div>
          <div className={cardClass}>
            <h2 className="text-sm font-bold">頻出語句を幅広く収録</h2>
            <p className="text-xs text-gray-600 leading-relaxed mt-1.5">
              共通テストや主要な予想問題集で扱われる人物・語句を中心に、公共・倫理の学習範囲を幅広く整理しています。
            </p>
          </div>
          <div className={cardClass}>
            <h2 className="text-sm font-bold">短時間で繰り返し学習</h2>
            <p className="text-xs text-gray-600 leading-relaxed mt-1.5">
              対応表で確認したあと、演習と復習を繰り返します。毎日の学習に取り入れやすい構成を目指しています。
            </p>
          </div>
        </div>
      </section>

      <section id="how-to-use" className="bg-white border border-gray-300 rounded-xs p-4 shadow-xs scroll-mt-4">
        <h2 className="text-sm font-black border-b border-gray-200 pb-2">使い方</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3 text-xs">
          <div className="border border-gray-200 bg-gray-50 rounded-xs p-3">
            <strong className="text-red-700">1. 対応表で確認</strong>
            <p className="text-gray-700 leading-relaxed mt-1">思想・人物対応表で、人物名と関連する語句を確認します。</p>
          </div>
          <div className="border border-gray-200 bg-gray-50 rounded-xs p-3">
            <strong className="text-red-700">2. 問題で思い出す</strong>
            <p className="text-gray-700 leading-relaxed mt-1">人物→語句、語句→人物などの問題を解いて、覚えているか確かめます。</p>
          </div>
          <div className="border border-gray-200 bg-gray-50 rounded-xs p-3">
            <strong className="text-red-700">3. 間違いを復習</strong>
            <p className="text-gray-700 leading-relaxed mt-1">間違えた問題や復習キューを、時間を置いてもう一度解きます。</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Link href="/dictionary" className="px-3 py-1.5 bg-gray-800 hover:bg-black text-white rounded-xs text-xs font-bold">対応表を見る</Link>
          <Link href="/practice?count=10" className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xs text-xs font-bold">演習を始める</Link>
          <Link href="/stats" className="px-3 py-1.5 border border-gray-300 hover:bg-gray-100 rounded-xs text-xs font-bold">学習進捗を見る</Link>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className={cardClass}>
          <h2 className="text-sm font-black border-b border-gray-200 pb-2">教材との組み合わせ</h2>
          <p className="text-xs text-gray-700 leading-relaxed mt-2">
            当サイトは、人物と語句の対応関係を覚えるための補助教材です。教科書、資料集、過去問、予想問題集などと組み合わせ、詳しい背景や制度、出題の流れを確認しながら使うことで、より効果的に学習できます。
          </p>
          <p className="text-xs text-gray-700 leading-relaxed mt-2">
            収録内容は共通テストや主要な予想問題集の頻出語句を中心に整理していますが、試験範囲や出題内容を完全に保証するものではありません。分からない内容は必ず教材や公式資料で確認してください。
          </p>
        </div>

        <div className={cardClass}>
          <h2 className="text-sm font-black border-b border-gray-200 pb-2">コンテンツ作成・著作権方針</h2>
          <p className="text-xs text-gray-700 leading-relaxed mt-2">
            問題文、解説、人物・用語の対応整理、デザインおよびプログラムは、運営者が学習目的に合わせて作成・編集しています。教科書、参考書、過去問題集など第三者の文章をそのまま転載しないよう努めています。
          </p>
          <p className="text-xs text-gray-700 leading-relaxed mt-2">
            掲載内容について著作権上の問題や誤りがある場合は、<Link href="/contact" className="text-blue-700 hover:underline">お問い合わせ・誤植報告</Link>からご連絡ください。
          </p>
        </div>
      </section>

      <section className="bg-white border border-gray-300 rounded-xs p-4 shadow-xs">
        <h2 className="text-sm font-black border-b border-gray-200 pb-2">更新履歴</h2>
        <ol className="mt-3 space-y-3 text-xs text-gray-700">
          <li className="grid grid-cols-[5.5rem_1fr] gap-2">
            <time dateTime="2026-09-07" className="font-bold text-gray-500">2026.09.07</time>
            <span>プロフィールの二つ名設定とランキング表示、更新履歴を追加しました。</span>
          </li>
          <li className="grid grid-cols-[5.5rem_1fr] gap-2">
            <time dateTime="2026-09-07" className="font-bold text-gray-500">2026.09.07</time>
            <span>サイトマップと演習ページの検索向け設定を改善しました。</span>
          </li>
          <li className="grid grid-cols-[5.5rem_1fr] gap-2">
            <time dateTime="2026-09-06" className="font-bold text-gray-500">2026.09.06</time>
            <span>会員登録・全国ランキングを追加し、復習欄を演習設定内に整理しました。</span>
          </li>
        </ol>
      </section>

      <section className="bg-white border border-gray-300 rounded-xs p-4 shadow-xs">
        <h2 className="text-sm font-black border-b border-gray-200 pb-2">運営者情報</h2>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs border-collapse border border-gray-300">
            <tbody>
              <tr className="border-b border-gray-300">
                <th className="p-3 bg-gray-50 font-bold border-r border-gray-300 w-1/4">運営者</th>
                <td className="p-3">minor</td>
              </tr>
              <tr className="border-b border-gray-300">
                <th className="p-3 bg-gray-50 font-bold border-r border-gray-300">メールアドレス</th>
                <td className="p-3">minomi@ymail.ne.jp</td>
              </tr>
              <tr className="border-b border-gray-300">
                <th className="p-3 bg-gray-50 font-bold border-r border-gray-300">サイトURL</th>
                <td className="p-3"><a href="https://kokyo-ethics.com" className="text-blue-700 hover:underline">https://kokyo-ethics.com</a></td>
              </tr>
              <tr>
                <th className="p-3 bg-gray-50 font-bold border-r border-gray-300">お問い合わせ</th>
                <td className="p-3"><Link href="/contact" className="text-blue-700 hover:underline">お問い合わせ・誤植報告フォーム</Link>をご利用ください。</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
