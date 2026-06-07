import { motion } from "framer-motion";
import { STATIC } from "../anim";

type Props = {
  consumed: number;
  target: number;
  mode?: "deficit" | "goal-fill" | "band";
  min?: number;
  max?: number;
  size?: number;
};

// 状态色:绿(安全)→ 橙(接近)→ 柔珊瑚(超出),不用刺眼纯红
function deficitColor(ratio: number) {
  if (ratio < 0.85) return "#3FA17C";
  if (ratio <= 1.0) return "#E8B04B";
  return "#E08A6E";
}

function gainColor(ratio: number) {
  if (ratio < 0.85) return "#D79A32";
  if (ratio <= 1.1) return "#3FA17C";
  return "#E8B04B";
}

function bandColor(consumed: number, min: number, max: number) {
  if (consumed >= min && consumed <= max) return "#3FA17C";
  return "#D79A32";
}

export function CalorieRing({
  consumed,
  target,
  mode = "deficit",
  min,
  max,
  size = 208,
}: Props) {
  const ratio = consumed / target;
  const compact = size < 180;
  const stroke = compact ? 15 : 18;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const bandMin = min ?? target * 0.9;
  const bandMax = max ?? target * 1.1;
  const pct = Math.min(ratio, 1);
  const color =
    mode === "goal-fill"
      ? gainColor(ratio)
      : mode === "band"
        ? bandColor(consumed, bandMin, bandMax)
        : deficitColor(ratio);
  const delta = target - consumed;
  const over = consumed > target;
  const inBand = consumed >= bandMin && consumed <= bandMax;
  const bandDiff = consumed < bandMin ? bandMin - consumed : consumed - bandMax;

  const copy =
    mode === "goal-fill"
      ? {
          label: delta > 0 ? "还需摄入" : "已达标",
          value: delta > 0 ? delta : `+${Math.abs(delta)}`,
          sub: `${consumed} / ${target} kcal`,
          chip: delta > 0 ? "优先补蛋白质" : ratio > 1.1 ? "略高于目标" : "能量达标",
        }
      : mode === "band"
        ? {
            label: inBand ? "在目标区间" : consumed < bandMin ? "距区间还差" : "高于区间",
            value: inBand ? "✓" : bandDiff,
            sub: `${consumed} kcal · 区间 ${bandMin}-${bandMax}`,
            chip: inBand ? "看一周平均更稳" : consumed < bandMin ? "可适当补充" : "晚些清淡点",
          }
        : {
            label: over ? "已超出" : "还可摄入",
            value: over ? `+${consumed - target}` : Math.max(delta, 0),
            sub: `${consumed} / ${target} kcal`,
            chip: over ? "明天清淡些就好" : ratio > 0.85 ? "接近预算" : "状态不错",
          };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#ECEBE6"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={STATIC ? false : { strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - pct * c }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${compact ? "text-[12px]" : "text-[13px]"} font-medium text-ink-500`}>{copy.label}</span>
        <span className={`mt-0.5 ${compact ? "text-[34px]" : "text-[40px]"} font-bold leading-none text-ink-900`}>
          {copy.value}
        </span>
        <span className={`${compact ? "mt-0.5 text-[11px]" : "mt-1 text-[12px]"} text-ink-400`}>{copy.sub}</span>
        <span
          className={`${compact ? "mt-1.5 px-2 text-[10px]" : "mt-2 px-2.5 text-[11px]"} rounded-pill py-0.5 font-medium`}
          style={{ background: `${color}22`, color }}
        >
          {copy.chip}
        </span>
      </div>
    </div>
  );
}
