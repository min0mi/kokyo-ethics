'use client';

import React, { useEffect, useState } from 'react';
import { AdBanner } from '@/components/ads/AdBanner';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';
import { FIGURES } from '@/data/figures';

const figureNames = new Map(FIGURES.map((figure) => [figure.id, figure.name]));

type LeaderboardRow = {
  id: string;
  username: string;
  xp: number;
  level: number;
  total_correct: number;
  accuracy: number | null;
  epithet_prefix: string | null;
  epithet_figure_id: string | null;
};

export default function RankingPage() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const client = supabase;

    let mounted = true;
    const loadRanking = async () => {
      const [{ data: ranking, error: rankingError }, { data: userData }] = await Promise.all([
        client
          .from('leaderboard')
          .select('id, username, xp, level, total_correct, accuracy, epithet_prefix, epithet_figure_id')
          .order('xp', { ascending: false })
          .limit(100),
        client.auth.getUser(),
      ]);

      if (!mounted) return;
      if (rankingError) {
        setError('ランキングを読み込めませんでした。時間をおいて再度お試しください。');
      } else {
        setRows((ranking || []) as LeaderboardRow[]);
        setCurrentUserId(userData.user?.id || null);
      }
      setLoading(false);
    };

    void loadRanking();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-3 py-5 space-y-4 text-xs text-gray-900">
      {/* ページヘッダー */}
      <div className="border-b border-gray-300 pb-2">
        <span className="text-[11px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-xs border border-gray-300">
          全国ランキング
        </span>
        <h1 className="text-xl font-bold text-gray-900 mt-1">
          全国 思想マスターランキング
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          累計獲得XPによる全国学習者の順位表です。
        </p>
      </div>

      {!isSupabaseConfigured ? (
        <div className="bg-amber-50 border border-amber-300 p-6 rounded-xs text-center space-y-2">
          <p className="font-bold text-gray-700 text-sm">ランキングは現在準備中です。</p>
          <p className="text-gray-500 text-[11px]">会員登録とデータベースの設定後に利用できます。</p>
        </div>
      ) : loading ? (
        <div className="bg-white border border-gray-300 p-6 rounded-xs text-center text-gray-500">
          ランキングを読み込んでいます…
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-300 p-6 rounded-xs text-center text-red-700">
          {error}
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white border border-gray-300 p-6 rounded-xs text-center space-y-2">
          <p className="font-bold text-gray-700 text-sm">まだランキング参加者はいません。</p>
          <p className="text-gray-500 text-[11px]">会員登録して問題を解くと、ここに表示されます。</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-300 rounded-xs overflow-hidden">
          <div className="grid grid-cols-[3rem_1fr_5rem_4rem_5rem] gap-2 px-3 py-2 bg-gray-100 border-b border-gray-300 text-[11px] font-bold text-gray-600">
            <span>順位</span>
            <span>ニックネーム</span>
            <span className="text-right">XP</span>
            <span className="text-right">レベル</span>
            <span className="text-right">正答数</span>
          </div>
          <div>
            {rows.map((row, index) => {
              const isMe = row.id === currentUserId;
              const epithetFigureName = row.epithet_figure_id
                ? figureNames.get(row.epithet_figure_id)
                : null;
              return (
                <div
                  key={row.id}
                  className={`grid grid-cols-[3rem_1fr_5rem_4rem_5rem] gap-2 items-center px-3 py-3 border-b last:border-b-0 border-gray-200 ${isMe ? 'bg-red-50' : ''}`}
                >
                  <span className={`font-black ${index < 3 ? 'text-red-600' : 'text-gray-500'}`}>
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold truncate">
                      {row.username || '探求者'}
                      {isMe && <span className="ml-1 text-[10px] text-red-600">あなた</span>}
                    </span>
                    {epithetFigureName && row.epithet_prefix && (
                      <span className="block mt-0.5 text-[10px] font-normal text-gray-500 truncate">
                        {row.epithet_prefix}{epithetFigureName}
                      </span>
                    )}
                  </span>
                  <span className="text-right font-bold text-blue-700">{row.xp.toLocaleString()}</span>
                  <span className="text-right text-gray-700">Lv.{row.level}</span>
                  <span className="text-right text-gray-700">{row.total_correct.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AdBanner label="Ranking Sponsor" />
    </div>
  );
}
