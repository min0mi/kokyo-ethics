'use client';

import React from 'react';

interface DailyDataPoint {
  date: string;
  label: string;
  total: number;
  correct: number;
}

interface DailyLineChartProps {
  data: DailyDataPoint[];
}

export const DailyLineChart: React.FC<DailyLineChartProps> = ({ data }) => {
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

  // 座標計算
  const getX = (index: number) => {
    if (data.length === 1) return paddingX + width / 2;
    return paddingX + (index / (data.length - 1)) * width;
  };

  const getY = (val: number) => {
    return paddingY + height - (val / maxVal) * height;
  };

  // ポリライン用の点文字列
  const totalPoints = data.map((d, i) => `${getX(i)},${getY(d.total)}`).join(' ');
  const correctPoints = data.map((d, i) => `${getX(i)},${getY(d.correct)}`).join(' ');

  return (
    <div className="w-full bg-white border border-gray-300 rounded-xs p-3.5 space-y-2 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-1.5">
        <h3 className="font-bold text-gray-900 text-xs">
          [日別学習問題数の推移] （直近{data.length}日間）
        </h3>
        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-blue-600 inline-block" />
            <span className="font-semibold text-gray-700">総解答数</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-green-600 inline-block" />
            <span className="font-semibold text-gray-700">正解数</span>
          </div>
        </div>
      </div>

      {/* SVG グラフ */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-44 select-none"
        >
          {/* 横グリッド線 (3本) */}
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
                  fontSize="10"
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

            return (
              <g key={i}>
                {/* 日付ラベル */}
                <text
                  x={cx}
                  y={chartHeight - 6}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#6b7280"
                  fontWeight="bold"
                >
                  {d.label}
                </text>

                {/* 総解答数の点 */}
                <circle
                  cx={cx}
                  cy={cyTotal}
                  r="3.5"
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                {d.total > 0 && (
                  <text
                    x={cx}
                    y={cyTotal - 6}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="bold"
                    fill="#1d4ed8"
                  >
                    {d.total}
                  </text>
                )}

                {/* 正解数の点 */}
                <circle
                  cx={cx}
                  cy={cyCorrect}
                  r="3"
                  fill="#16a34a"
                  stroke="#ffffff"
                  strokeWidth="1"
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="text-[11px] text-gray-500 text-right pt-0.5">
        ※ 毎日の演習データは自動集計・保存されます。
      </div>
    </div>
  );
};

