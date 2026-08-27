import React from 'react';
import { Brain, Zap, Target, BookOpen } from 'lucide-react';

export const metadata = {
  title: '当サイトについて | 公共倫理パーフェクトマスター.com',
  description: '公共倫理パーフェクトマスター.comの理念、構造的暗記システム、忘却曲線アルゴリズムについての解説です。',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10 text-gray-800">
      {/* タイトル */}
      <div className="space-y-3 pb-6 border-b border-gray-200">
        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full inline-block">
          About Us
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
          「公共倫理パーフェクトマスター.com」について
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          大学入学共通テスト「公共、倫理」「倫理」を構造的にマスターするための特訓プラットフォーム
        </p>
      </div>

      {/* 根幹テーマ */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 sm:p-8 border border-indigo-100 space-y-4">
        <h2 className="text-lg sm:text-xl font-black text-indigo-950 flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-600" />
          単なる丸暗記から、思想の「構造的理解」へ
        </h2>
        <p className="text-xs sm:text-sm text-indigo-900/80 leading-relaxed">
          共通テストの公共・倫理では、単に哲学者や用語の名前を暗記しているだけでは太刀打ちできません。
          「誰が説いたのか」「どのような定義か」「どの著書に書かれているか」「なぜ他の思想家の概念と紛らわしいのか」という
          <strong>立体的・構造的な相関関係</strong>を把握していることが求められます。
        </p>
        <p className="text-xs sm:text-sm text-indigo-900/80 leading-relaxed">
          当サイトは、英単語アプリ「mikan」のような圧倒的なテンポ感と、「過去問道場」のような緻密な判断語句解説を融合させ、
          ゲーム感覚で反射的に解けるレベルまで記憶を昇華させることを目指しています。
        </p>
      </div>

      {/* 特徴3点 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Zap className="w-5 h-5 fill-amber-500" />
          </div>
          <h3 className="font-bold text-sm text-gray-900">交叉問題自動生成</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            同じ時代・流派の概念を交差させて誤選択肢を生成。本番で最も引っかかりやすい良質な選択肢を自動編成します。
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="font-bold text-sm text-gray-900">忘却曲線 (SM-2)</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            回答結果に応じて次回の復習日を動的にスケジューリング。「今日やるべき復習」で最短ルートの定着を実現。
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="font-bold text-sm text-gray-900">6種類の演習モード</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            4択スピード、深堀り道場、線つなぎマッチング、記述マスター、分類想起など、飽きずに多角的に鍛えられます。
          </p>
        </div>
      </div>
    </div>
  );
}

