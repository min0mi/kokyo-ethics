'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { UserDataStore } from '@/lib/storage/userDataStore';
import { SRSEngine, CategoryDetailedStats } from '@/lib/srs/srsEngine';
import { QuestionGenerator as ChemistryQuestionGenerator } from '@/lib/chemistry/questionGenerator';
import { CATEGORIES as CHEMISTRY_CATEGORIES } from '@/data/chemistry/categories';
import { UserProfile } from '@/types';
import { AdBanner } from '@/components/ads/AdBanner';
import dynamic from 'next/dynamic';

const DailyLineChart = dynamic(
  () => import('@/components/stats/DailyLineChart').then((mod) => mod.DailyLineChart),
  { ssr: false, loading: () => <div className="p-4 text-center text-xs text-gray-400">グラフ読み込み中...</div> }
);
import { ShareButtons } from '@/components/share/ShareButtons';

function ChemistryStatsContent() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [chemCounts, setChemCounts] = useState({ total: 0, mastered: 0, correct: 0, wrong: 0, new: 0 });
  const [chemCategoryData, setChemCategoryData] = useState<
    { name: string; era: string; groupName: string; stats: CategoryDetailedStats; isAvailable: boolean }[]
  >([]);

  useEffect(() => {
    const p = UserDataStore.getProfile();
    const progressMap = UserDataStore.getProgressMap();
    setProfile(p);

    const chemQs = ChemistryQuestionGenerator.getAllQuestions();
    let cMastered = 0, cCorrect = 0, cWrong = 0, cNew = 0;
    chemQs.forEach((q) => {
      const prog = progressMap[q.id];
      if (!prog || prog.totalAttempts === 0 || prog.state === 'new') cNew += 1;
      else if (prog.state === 'mastered') cMastered += 1;
      else if (prog.correctStreak > 0) cCorrect += 1;
      else cWrong += 1;
    });
    setChemCounts({ total: chemQs.length, mastered: cMastered, correct: cCorrect, wrong: cWrong, new: cNew });

    const chemCats = CHEMISTRY_CATEGORIES.map((cat) => {
      const catQs = chemQs.filter((q) => q.categoryId === cat.id);
      return {
        name: cat.name,
        era: cat.era,
        groupName: '色暗記シリーズ',
        stats: SRSEngine.calculateCategoryStats(catQs, progressMap),
        isAvailable: !!cat.isAvailable,
      };
    });
    setChemCategoryData(chemCats);
  }, []);

  const overallAccuracy =
    profile && profile.totalAnswered > 0
      ? Math.round((profile.totalCorrect / profile.totalAnswered) * 100)
      : 0;

  const [backupCode, setBackupCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [importError, setImportError] = useState('');

  const handleGenerateBackup = () => {
    try {
      const code = UserDataStore.exportBackupData();
      setBackupCode(code);
      setIsCopied(false);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'エラーが発生しました。';
      alert(errMsg);
    }
  };

  const handleCopyBackup = () => {
    if (!backupCode) return;
    navigator.clipboard.writeText(backupCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleImportBackup = () => {
    if (!importCode.trim()) return;
    setImportError('');
    if (confirm('データを上書きして復元しますか？\n現在保存されている学習データは上書きされ、消去されます。')) {
      const success = UserDataStore.importBackupData(importCode);
      if (success) {
        alert('データを正常に復元しました！自動的にページをリロードします。');
        window.location.reload();
      } else {
        setImportError('コードが正しくありません。貼り付けたコードを確認してください。');
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-3 py-5 space-y-4 text-xs text-gray-900">
      {/* ページヘッダー */}
      <div className="border-b border-gray-300 pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <span className="text-[11px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-xs border border-gray-300">
            無機化学 アナリティクス
          </span>
          <h1 className="text-xl font-bold text-gray-900 mt-1 flex items-center gap-2">
            <span>共テ無機化学 習熟度 ＆ 忘却曲線分析</span>
            <span className="bg-amber-400 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              beta
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            全{chemCounts.total}問の学習進捗および SuperMemo-2 (SM-2) アルゴリズムに基づく記憶定着フェーズの可視化
          </p>
        </div>

        {profile && (
          <ShareButtons
            text={`【共テ無機化学パーフェクトマスター.com】で学習中！\n連続学習: ${profile.streakDays}日 | 総解答数: ${profile.totalAnswered}問 | 定着完了: ${chemCounts.mastered}問\n#共通テスト #化学 #無機化学`}
            buttonLabel="𝕏 で進捗をシェア"
          />
        )}
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
        <div className="bg-white border border-gray-300 p-3 rounded-xs">
          <span className="text-gray-500 block mb-1">通算解答数</span>
          <strong className="text-lg text-gray-900">{profile?.totalAnswered || 0} 問</strong>
        </div>

        <div className="bg-white border border-gray-300 p-3 rounded-xs">
          <span className="text-gray-500 block mb-1">通算正答率</span>
          <strong className="text-lg text-blue-700">{overallAccuracy}%</strong>
        </div>

        <div className="bg-white border border-gray-300 p-3 rounded-xs">
          <span className="text-gray-500 block mb-1">無機化学・定着完了</span>
          <strong className="text-lg text-green-700">{chemCounts.mastered} 問</strong>
        </div>

        <div className="bg-white border border-gray-300 p-3 rounded-xs">
          <span className="text-gray-500 block mb-1">総学習時間</span>
          <strong className="text-lg text-indigo-700">
            {UserDataStore.formatStudyTime(profile?.totalStudyTimeSeconds || 0)}
          </strong>
        </div>

        <div className="bg-white border border-gray-300 p-3 rounded-xs">
          <span className="text-gray-500 block mb-1">獲得経験値</span>
          <strong className="text-lg text-yellow-700">{profile?.xp || 0} XP</strong>
        </div>
      </div>

      {/* 日別学習問題数の折れ線グラフ */}
      <DailyLineChart initialDays={7} />

      {/* 記憶定着ステータス内訳 */}
      <div className="bg-white border border-gray-300 p-4 rounded-xs space-y-3 text-xs">
        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
          <h2 className="font-bold text-gray-900 text-sm">
            無機化学 記憶定着フェーズ内訳（全{chemCounts.total}問）
          </h2>
          <span className="text-[11px] bg-blue-50 text-blue-800 font-bold px-2 py-0.5 border border-blue-200 rounded-xs">
            SM-2 アルゴリズム
          </span>
        </div>

        {/* スタックバー */}
        <div className="w-full bg-gray-200 h-3.5 rounded-xs flex overflow-hidden border border-gray-300">
          <div
            className="bg-green-600 h-full"
            style={{ width: `${(chemCounts.mastered / (chemCounts.total || 1)) * 100}%` }}
            title={`定着完了: ${chemCounts.mastered}問`}
          />
          <div
            className="bg-blue-600 h-full"
            style={{ width: `${(chemCounts.correct / (chemCounts.total || 1)) * 100}%` }}
            title={`正答中: ${chemCounts.correct}問`}
          />
          <div
            className="bg-red-500 h-full"
            style={{ width: `${(chemCounts.wrong / (chemCounts.total || 1)) * 100}%` }}
            title={`誤答/要復習: ${chemCounts.wrong}問`}
          />
          <div
            className="bg-gray-200 h-full"
            style={{ width: `${(chemCounts.new / (chemCounts.total || 1)) * 100}%` }}
            title={`未着手: ${chemCounts.new}問`}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-green-600 inline-block rounded-xs" />
            <span className="font-bold text-green-900">定着完了 (30日+): {chemCounts.mastered}問</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-blue-600 inline-block rounded-xs" />
            <span className="font-bold text-blue-900">正答中 (1〜14日): {chemCounts.correct}問</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-red-500 inline-block rounded-xs" />
            <span className="font-bold text-red-700">誤答・要復習: {chemCounts.wrong}問</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-gray-300 inline-block rounded-xs" />
            <span className="text-gray-500">未学習: {chemCounts.new}問</span>
          </div>
        </div>
      </div>

      {/* 広告枠 */}
      <AdBanner label="Stats Sponsor" />

      {/* 単元別マスター度 */}
      <div className="bg-white border border-gray-300 p-4 rounded-xs space-y-3 text-xs">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <h2 className="font-bold text-gray-900 text-sm">
            無機化学 シリーズ別 学習率 ＆ 記憶定着内訳
          </h2>
          <span className="text-[10px] text-gray-500 font-normal">
            <span className="text-green-700 font-bold">■</span>定着 <span className="text-blue-600 font-bold">■</span>正答 <span className="text-red-500 font-bold">■</span>誤答
          </span>
        </div>

        <div className="space-y-3">
          {chemCategoryData.map((cat, idx) => {
            const st = cat.stats;
            return (
              <div key={idx} className="space-y-1 bg-gray-50/50 p-2.5 rounded-xs border border-gray-200">
                <div className="flex justify-between text-xs items-center">
                  <div>
                    <span className="font-bold text-gray-900">{cat.name}</span>
                    <span className="text-gray-500 text-[11px] ml-1.5">({cat.groupName})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-900 font-bold">学習率: {st.studyRate}%</span>
                    <span className="text-[10px] text-gray-500 ml-1.5">({st.mastered + st.correct + st.wrong}/{st.total}問)</span>
                  </div>
                </div>

                {/* 3色プログレスバー */}
                <div className="w-full bg-gray-200 h-2.5 rounded-xs flex overflow-hidden border border-gray-300">
                  {st.masteredRate > 0 && (
                    <div
                      style={{ width: `${st.masteredRate}%` }}
                      className="bg-green-600 h-full"
                      title={`定着: ${st.mastered}問 (${st.masteredRate}%)`}
                    />
                  )}
                  {st.correctRate > 0 && (
                    <div
                      style={{ width: `${st.correctRate}%` }}
                      className="bg-blue-600 h-full"
                      title={`正答中: ${st.correct}問 (${st.correctRate}%)`}
                    />
                  )}
                  {st.wrongRate > 0 && (
                    <div
                      style={{ width: `${st.wrongRate}%` }}
                      className="bg-red-500 h-full"
                      title={`誤答/要復習: ${st.wrong}問 (${st.wrongRate}%)`}
                    />
                  )}
                </div>

                <div className="flex justify-between text-[10px] text-gray-500 pt-0.5">
                  <span className="text-green-800 font-semibold">定着: {st.mastered}問 ({st.masteredRate}%)</span>
                  <span className="text-blue-800 font-semibold">正答中: {st.correct}問 ({st.correctRate}%)</span>
                  <span className="text-red-600 font-semibold">誤答: {st.wrong}問 ({st.wrongRate}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 学習データのバックアップ＆復元 */}
      <div className="bg-white border border-gray-300 p-4 rounded-xs space-y-3 text-xs">
        <div className="border-b border-gray-200 pb-2">
          <h2 className="font-bold text-gray-900 text-sm">
            学習データのバックアップ・引き継ぎ
          </h2>
          <p className="text-[11px] text-gray-500 mt-0.5">
            現在の学習進捗やバッジ実績、XPをテキストデータとして保存・移行できます。機種変更時やPCへの引き継ぎにご利用ください。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 border border-gray-200 p-3 rounded-xs bg-gray-50/30">
            <h3 className="font-bold text-gray-800 text-[11px]">1. データをバックアップする</h3>
            <p className="text-gray-500 text-[10px] leading-tight">
              下のボタンを押すとバックアップコードが生成されます。コピーしてメモ帳などに保存してください。
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleGenerateBackup}
                className="px-3 py-1.5 bg-gray-800 hover:bg-black text-white font-bold rounded-xs text-[11px]"
              >
                コード生成
              </button>
            </div>
            {backupCode && (
              <div className="space-y-1.5 pt-1">
                <textarea
                  readOnly
                  value={backupCode}
                  className="w-full p-2 border border-gray-300 rounded-xs font-mono text-base sm:text-[10px] bg-white h-20 focus:outline-hidden"
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                />
                <button
                  type="button"
                  onClick={handleCopyBackup}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xs text-[11px]"
                >
                  {isCopied ? 'コピー完了！' : 'コードをクリップボードにコピー'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2 border border-gray-200 p-3 rounded-xs bg-gray-50/30">
            <h3 className="font-bold text-gray-800 text-[11px]">2. データを復元（引き継ぎ）する</h3>
            <p className="text-gray-500 text-[10px] leading-tight">
              コピーしたバックアップコードを下に貼り付け、「復元を実行」を押してください。
            </p>
            <textarea
              value={importCode}
              onChange={(e) => setImportCode(e.target.value)}
              placeholder="ここにバックアップコードを貼り付けてください..."
              className="w-full p-2 border border-gray-300 rounded-xs font-mono text-base sm:text-[10px] bg-white h-20 focus:outline-hidden focus:border-blue-600"
            />
            {importError && (
              <p className="text-red-600 font-bold text-[10px]">{importError}</p>
            )}
            <button
              type="button"
              onClick={handleImportBackup}
              disabled={!importCode.trim()}
              className="w-full py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xs text-[11px]"
            >
              復元を実行する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChemistryStatsPage() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-xs text-gray-500">無機化学のアナリティクスを読み込み中...</div>}>
      <ChemistryStatsContent />
    </Suspense>
  );
}
