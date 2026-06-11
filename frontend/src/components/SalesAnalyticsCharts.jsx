const CHART_WIDTH = 520;
const CHART_HEIGHT = 280;
const PADDING = { top: 24, right: 20, bottom: 44, left: 56 };

function getChartArea() {
  return {
    width: CHART_WIDTH - PADDING.left - PADDING.right,
    height: CHART_HEIGHT - PADDING.top - PADDING.bottom,
  };
}

function getMaxValue(points, keys) {
  const values = points.flatMap((point) => keys.map((key) => Number(point[key] ?? 0)));
  return Math.max(...values, 1);
}

function formatAxisValue(value) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return String(Math.round(value));
}

function YAxisLabels({ maxValue }) {
  const { height } = getChartArea();
  const steps = 4;

  return Array.from({ length: steps + 1 }, (_, index) => {
    const ratio = index / steps;
    const value = maxValue * (1 - ratio);
    const y = PADDING.top + height * ratio;

    return (
      <g key={index}>
        <line
          x1={PADDING.left}
          y1={y}
          x2={CHART_WIDTH - PADDING.right}
          y2={y}
          stroke="#e2e8f0"
          strokeWidth="1"
        />
        <text x={PADDING.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#64748b">
          {formatAxisValue(value)}
        </text>
      </g>
    );
  });
}

function RevenueBarChart({ points, money }) {
  const maxValue = getMaxValue(points, ["revenue"]);
  const { width, height } = getChartArea();
  const slotWidth = width / Math.max(points.length, 1);
  const barWidth = Math.min(slotWidth * 0.55, 48);

  return (
    <svg
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      className="h-full w-full"
      role="img"
      aria-label="Revenue by day chart"
    >
      <YAxisLabels maxValue={maxValue} />
      {points.map((point, index) => {
        const value = Number(point.revenue ?? 0);
        const barHeight = (value / maxValue) * height;
        const x = PADDING.left + slotWidth * index + (slotWidth - barWidth) / 2;
        const y = PADDING.top + height - barHeight;

        return (
          <g key={`${point.label}-${index}`}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx="6"
              fill="#1e293b"
            >
              <title>{`${point.label}: ${money(value)}`}</title>
            </rect>
            <text
              x={x + barWidth / 2}
              y={CHART_HEIGHT - 14}
              textAnchor="middle"
              fontSize="10"
              fill="#64748b"
            >
              {point.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ProfitLossBarChart({ points, money }) {
  const maxValue = getMaxValue(points, ["profit", "loss"]);
  const { width, height } = getChartArea();
  const slotWidth = width / Math.max(points.length, 1);
  const groupWidth = Math.min(slotWidth * 0.7, 56);
  const barWidth = groupWidth * 0.42;

  return (
    <svg
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      className="h-full w-full"
      role="img"
      aria-label="Profit and loss by day chart"
    >
      <YAxisLabels maxValue={maxValue} />
      {points.map((point, index) => {
        const profit = Number(point.profit ?? 0);
        const loss = Number(point.loss ?? 0);
        const profitHeight = (profit / maxValue) * height;
        const lossHeight = (loss / maxValue) * height;
        const groupX = PADDING.left + slotWidth * index + (slotWidth - groupWidth) / 2;
        const profitX = groupX;
        const lossX = groupX + barWidth + groupWidth * 0.12;
        const profitY = PADDING.top + height - profitHeight;
        const lossY = PADDING.top + height - lossHeight;

        return (
          <g key={`${point.label}-${index}`}>
            <rect x={profitX} y={profitY} width={barWidth} height={profitHeight} rx="4" fill="#047857">
              <title>{`${point.label} profit: ${money(profit)}`}</title>
            </rect>
            <rect x={lossX} y={lossY} width={barWidth} height={lossHeight} rx="4" fill="#be123c">
              <title>{`${point.label} loss: ${money(loss)}`}</title>
            </rect>
            <text
              x={groupX + groupWidth / 2}
              y={CHART_HEIGHT - 14}
              textAnchor="middle"
              fontSize="10"
              fill="#64748b"
            >
              {point.label}
            </text>
          </g>
        );
      })}
      <g transform={`translate(${PADDING.left}, ${PADDING.top - 8})`}>
        <rect x="0" y="0" width="10" height="10" rx="2" fill="#047857" />
        <text x="16" y="9" fontSize="10" fill="#475569">
          Profit
        </text>
        <rect x="70" y="0" width="10" height="10" rx="2" fill="#be123c" />
        <text x="86" y="9" fontSize="10" fill="#475569">
          Loss
        </text>
      </g>
    </svg>
  );
}

function SalesAnalyticsCharts({ timeSeries, money }) {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-sm font-medium uppercase tracking-[0.18em] text-slate-600">
          Revenue by day
        </h3>
        <div className="mt-4 h-72 overflow-x-auto">
          <div className="h-full min-w-[320px]">
            <RevenueBarChart points={timeSeries} money={money} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-sm font-medium uppercase tracking-[0.18em] text-slate-600">
          Profit and loss by day
        </h3>
        <div className="mt-4 h-72 overflow-x-auto">
          <div className="h-full min-w-[320px]">
            <ProfitLossBarChart points={timeSeries} money={money} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesAnalyticsCharts;
