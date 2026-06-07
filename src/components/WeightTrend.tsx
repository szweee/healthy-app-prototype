import { motion } from "framer-motion";
import { activeGoal, weightSeries, weightByRange, type GoalKey, type RangeKey } from "../data/mock";
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

type Scenario = "normal" | "deficit-up";

export function WeightTrend({
  range = "月",
  offset = 0,
  scenario = "normal",
}: {
  range?: RangeKey;
  offset?: number;
  scenario?: Scenario;
}) {
  const { goal } = weightSeries;
  const base = weightByRange[range];
  // 过去期整体更重(示意),offset 越往前(负)整体上移
  const shift = -offset * 0.7;
  const rawBase = scenario === "deficit-up" && range === "月" ? buildRisingWeight() : base.raw;
  const trendBase = scenario === "deficit-up" && range === "月" ? ewmaLocal(rawBase) : base.trend;
  const raw = rawBase.map((v) => +(v + shift).toFixed(1));
  const trend = trendBase.map((v) => +(v + shift).toFixed(1));
  const missing = scenario === "deficit-up" && range === "月" ? new Set([5, 6, 13, 21, 22]) : new Set<number>();
  const current = +(trend[trend.length - 1]).toFixed(1);
  const min = Math.min(...raw, goal) - 0.5;
  const max = Math.max(...raw) + 0.5;
  const trendPath = buildPath(trend, min, max);
  const goalY = PAD + (1 - (goal - min) / (max - min)) * (H - PAD * 2);
  const delta = +(trend[trend.length - 1] - trend[0]).toFixed(1);
  const lastY = PAD + (1 - (trend[trend.length - 1] - min) / (max - min)) * (H - PAD * 2);
  const status = weightStatus(activeGoal, delta, scenario);

  return (
    <div>
      <div className="mb-1 flex items-end justify-between">
        <div>
          <div className="text-[28px] font-bold leading-none text-ink-900">
            {current}
            <span className="ml-1 text-[14px] font-medium text-ink-400">kg</span>
          </div>
          <div className={`mt-1 text-[12px] ${status.color}`}>
            {rangeLabel[range]}变化 {delta > 0 ? "+" : ""}
            {delta} kg · {status.short}
          </div>
        </div>
        <div className="text-right text-[12px] text-ink-400">目标 {goal} kg</div>
      </div>

      <p className={`mb-2 rounded-2xl px-3 py-2 text-[12px] font-medium leading-relaxed ${status.box}`}>
        {status.message}
      </p>

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
          return missing.has(i) ? (
            <circle key={i} cx={x} cy={y} r="2.4" fill="none" stroke="#C7CDC8" strokeWidth="1.3" />
          ) : (
            <circle key={i} cx={x} cy={y} r="2" fill="#C7CDC8" />
          );
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
        {missing.size > 0 && (
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full border border-[#C7CDC8]" />缺测
          </span>
        )}
        <span className="flex items-center gap-1">
          <span className="h-0.5 w-3 rounded-full bg-brand-500" />去波动趋势
        </span>
        <span className="flex items-center gap-1">
          <span className="h-0 w-3 border-t border-dashed border-ink-400" />目标
        </span>
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-ink-400">
        灰点是单次称重,空心点是缺测日期;绿线按已有数据平滑,少输几天也能看趋势,但连续缺测会降低可信度。
      </p>
    </div>
  );
}

function buildRisingWeight() {
  return [
    68.7, 68.9, 68.6, 68.8, 69.0, 69.0, 69.1, 68.8, 69.2, 69.0,
    69.3, 69.1, 69.4, 69.4, 69.2, 69.5, 69.3, 69.6, 69.4, 69.7,
    69.6, 69.6, 69.8, 69.7, 69.9, 69.8, 70.0, 69.9, 70.1, 70.0,
  ];
}

function ewmaLocal(data: number[], alpha = 0.18) {
  const out: number[] = [];
  let prev = data[0];
  for (const v of data) {
    prev = alpha * v + (1 - alpha) * prev;
    out.push(prev);
  }
  return out;
}

function weightStatus(goal: GoalKey, delta: number, scenario: Scenario) {
  if (goal === "gain") {
    if (delta < -0.2) {
      return {
        short: "低于增肌方向",
        color: "text-[#C77A1E]",
        box: "bg-status-warn/15 text-[#9A681A]",
        message: "如果目标是增肌,近 2 周体重略降时先检查训练日摄入和蛋白质。体重不是唯一指标,也要看训练和围度。",
      };
    }
    return {
      short: delta > 0 ? "缓慢向上" : "基本持平",
      color: "text-brand-600",
      box: "bg-brand-50 text-brand-700",
      message: "增肌更看重体重缓慢变化、蛋白质达标和训练稳定,不只看单日体重。",
    };
  }

  if (goal === "maintain") {
    return {
      short: Math.abs(delta) < 0.5 ? "维持稳定" : "波动略大",
      color: Math.abs(delta) < 0.5 ? "text-brand-600" : "text-[#C77A1E]",
      box: Math.abs(delta) < 0.5 ? "bg-brand-50 text-brand-700" : "bg-status-warn/15 text-[#9A681A]",
      message: "维持目标看区间和周平均,不用因为单日体重变化立刻调整。",
    };
  }

  if (delta > 0 || scenario === "deficit-up") {
    return {
      short: "趋势略上升",
      color: "text-[#C77A1E]",
      box: "bg-status-warn/15 text-[#9A681A]",
      message: "近 30 天趋势略上升。先看记录完整度、晚餐和加餐,不要因为单日上升马上大幅减少饮食。",
    };
  }

  return {
    short: delta < 0 ? "向目标靠近" : "基本持平",
    color: "text-brand-600",
    box: "bg-brand-50 text-brand-700",
    message: "体重趋势正在向目标靠近。继续看趋势线,不用被单日波动影响。",
  };
}
