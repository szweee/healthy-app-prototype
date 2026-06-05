import { motion } from "framer-motion";
import { weightSeries, weightByRange, type RangeKey } from "../data/mock";
import { STATIC } from "../anim";

const W = 300;
const H = 130;
const PAD = 8;

function buildPath(values: number[], min: number, max: number) {
  const n = values.length;
  return values
    .map((v, i) => {
      const x = PAD + (i / (n - 1)) * (W - PAD * 2);
      const y = PAD + (1 - (v - min) / (max - min)) * (H - PAD * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

const rangeLabel: Record<RangeKey, string> = {
  周: "近 7 天",
  月: "近 30 天",
  年: "近 12 个月",
};

export function WeightTrend({ range = "月", offset = 0 }: { range?: RangeKey; offset?: number }) {
  const { goal } = weightSeries;
  const base = weightByRange[range];
  // 过去期整体更重(示意),offset 越往前(负)整体上移
  const shift = -offset * 0.7;
  const raw = base.raw.map((v) => +(v + shift).toFixed(1));
  const trend = base.trend.map((v) => +(v + shift).toFixed(1));
  const current = +(trend[trend.length - 1]).toFixed(1);
  const min = Math.min(...raw, goal) - 0.5;
  const max = Math.max(...raw) + 0.5;
  const trendPath = buildPath(trend, min, max);
  const goalY = PAD + (1 - (goal - min) / (max - min)) * (H - PAD * 2);
  const delta = +(trend[trend.length - 1] - trend[0]).toFixed(1);
  const lastY = PAD + (1 - (trend[trend.length - 1] - min) / (max - min)) * (H - PAD * 2);

  return (
    <div>
      <div className="mb-1 flex items-end justify-between">
        <div>
          <div className="text-[28px] font-bold leading-none text-ink-900">
            {current}
            <span className="ml-1 text-[14px] font-medium text-ink-400">kg</span>
          </div>
          <div className="mt-1 text-[12px] text-brand-600">
            {rangeLabel[range]}变化 {delta > 0 ? "+" : ""}
            {delta} kg {delta < 0 ? "· 向下 ↓" : delta > 0 ? "· 向上 ↑" : "· 持平"}
          </div>
        </div>
        <div className="text-right text-[12px] text-ink-400">目标 {goal} kg</div>
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
        {/* 目标线 */}
        <line
          x1={PAD}
          y1={goalY}
          x2={W - PAD}
          y2={goalY}
          stroke="#9AA39D"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <text x={W - PAD} y={goalY - 4} textAnchor="end" fontSize="9" fill="#9AA39D">
          目标 {goal}
        </text>
        {/* 原始点(淡) */}
        {raw.map((v, i) => {
          const x = PAD + (i / (raw.length - 1)) * (W - PAD * 2);
          const y = PAD + (1 - (v - min) / (max - min)) * (H - PAD * 2);
          return <circle key={i} cx={x} cy={y} r="2" fill="#C7CDC8" />;
        })}
        {/* 趋势线(粗) */}
        <motion.path
          d={trendPath}
          fill="none"
          stroke="#3FA17C"
          strokeWidth="3"
          strokeLinecap="round"
          initial={STATIC ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        />
        {/* 当前值端点 */}
        <circle cx={W - PAD} cy={lastY} r="3.5" fill="#3FA17C" />
        <text x={W - PAD} y={lastY - 7} textAnchor="end" fontSize="10" fontWeight="700" fill="#2E7D5B">
          {trend[trend.length - 1].toFixed(1)}
        </text>
      </svg>

      {/* 图例 */}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-400">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#C7CDC8]" />每天称重
        </span>
        <span className="flex items-center gap-1">
          <span className="h-0.5 w-3 rounded-full bg-brand-500" />去波动趋势
        </span>
        <span className="flex items-center gap-1">
          <span className="h-0 w-3 border-t border-dashed border-ink-400" />目标
        </span>
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-ink-400">
        灰点是每天上下波动,绿线是去掉波动后的真实走向;绿线靠近虚线即接近目标。
      </p>
    </div>
  );
}
