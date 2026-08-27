'use client';

import React, { useState, useEffect } from 'react';
import { UserDataStore } from '@/lib/storage/userDataStore';

interface DailyLineChartProps {
  initialDays?: number;
}

export const DailyLineChart: React.FC<DailyLineChartProps> = ({ initialDays = 7 }) => {
  const [selectedDays, setSelectedDays] = useState<number>(initialDays);
  const [data, setData] = useState<{ date: string; label: string; total: number; correct: number }[]>([]);

  useEffect(() => {
    const history = UserDataStore.getDailyHistory(selectedDays);
    setData(history);
  }, [selectedDays]);

  if (!data || data.length === 0) {
    return <div className="text-xs text-gray-400 p-4 text-center">データがありません</div>;
  }

  const maxVal = Math.max(...data.map((d) => d.total), 10);
  const chartHeight = 160;
  const chartWidth = 500;
  const paddingX = 40;
  const paddingY = 25;

  const width = chartWidth - paddingX * 2;
  const height = chartHeight - paddingY * 2;

  const getX = (index: number) => {
    if (data.length === 1) return paddingX + width / 2;
    return paddingX + (index / (data.length - 1)) * width;
  };

  const getY = (val: number) => {
    return paddingY + height - (val / maxVal) * height;
  };

  const totalPoints = data.map((d, i) => `${getX(i)},${getY(d.total)}`).join(' ');
  const correctPoints = data.map((d, i) => `${getX(i)},${getY(d.correct)}`).join(' ');

  // ラベル間引き判定（データ点が多い場合）
  const step = data.length > 20 ? 5 : data.length > 10 ? 2 : 1;

  return (
    <div className="w-full bg-white border border-gray-300 rounded-xs p-3 space-y-2 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-gray-200 pb-1.5">
        <h3 className="font-bold text-gray-900 text-xs">
          [日別学習問題数の推移]
        </h3>

        {/* 期間切り替えタブ */}
        <div className="flex items-center gap-1 text-[10px]">
          {[
            { label: '7日', val: 7 },
            { label: '14日', val: 14 },
            { label: '30日', val: 30 },
            { label: '全期間', val: 999 },
          ].map((item) => (
            <button
              key={item.val}
              type="button"
              onClick={() => setSelectedDays(item.val)}
              className={`px-1.5 py-0.5 border rounded-xs font-bold ${
                selectedDays === item.val
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 text-[10px] text-gray-600">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-0.5 bg-blue-600 inline-block" />
          <span>総解答数</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-0.5 bg-green-600 inline-block" />
          <span>正解数</span>
        </div>
      </div>

      {/* SVG グラフ */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-36 select-none"
        >
          {/* 横グリッド線 */}
          {[0, 0.5, 1].map((ratio, idx) => {
            const y = paddingY + height * (1 - ratio);
            const val = Math.round(maxVal * ratio);
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeDasharray="2 2"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="#9ca3af"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* 総解答数（青ライン） */}
          <polyline
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            points={totalPoints}
          />

          {/* 正解数（緑ライン） */}
          <polyline
            fill="none"
            stroke="#16a34a"
            strokeWidth="2"
            points={correctPoints}
          />

          {/* 各プロット点 */}
          {data.map((d, i) => {
            const cx = getX(i);
            const cyTotal = getY(d.total);
            const cyCorrect = getY(d.correct);
            const showLabel = i % step === 0 || i === data.length - 1;

            return (
              <g key={i}>
                {showLabel && (
                  <text
                    x={cx}
                    y={chartHeight - 4}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#6b7280"
                    fontWeight="bold"
                  >
                    {d.label}
                  </text>
                )}

                <circle
                  cx={cx}
                  cy={cyTotal}
                  r={data.length > 20 ? 2 : 3}
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth="1"
                />
                {d.total > 0 && data.length <= 14 && (
                  <text
                    x={cx}
                    y={cyTotal - 5}
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="bold"
                    fill="#1d4ed8"
                  >
                    {d.total}
                  </text>
                )}

                <circle
                  cx={cx}
                  cy={cyCorrect}
                  r={data.length > 20 ? 1.5 : 2.5}
                  fill="#16a34a"
                  stroke="#ffffff"
                  strokeWidth="1"
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
