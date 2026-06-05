import { motion } from "framer-motion";
import { STATIC } from "../anim";

type Props = {
  consumed: number;
  target: number;
  size?: number;
};

// 状态色:绿(安全)→ 橙(接近)→ 柔珊瑚(超出),不用刺眼纯红
function statusColor(ratio: number) {
  if (ratio < 0.85) return "#3FA17C";
  if (ratio <= 1.0) return "#E8B04B";
  return "#E08A6E";
}

export function CalorieRing({ consumed, target, size = 208 }: Props) {
  const ratio = consumed / target;
  const stroke = 18;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(ratio, 1);
  const color = statusColor(ratio);
  const remaining = Math.max(target - consumed, 0);
  const over = consumed > target;

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
        <span className="text-[13px] font-medium text-ink-500">
          {over ? "已超出" : "还可以吃"}
        </span>
        <span className="mt-0.5 text-[40px] font-bold leading-none text-ink-900">
          {over ? `+${consumed - target}` : remaining}
        </span>
        <span className="mt-1 text-[12px] text-ink-400">
          {consumed} / {target} kcal
        </span>
        <span
          className="mt-2 rounded-pill px-2.5 py-0.5 text-[11px] font-medium"
          style={{ background: `${color}22`, color }}
        >
          {over ? "明天清淡些就好" : ratio > 0.85 ? "接近预算" : "状态不错"}
        </span>
      </div>
    </div>
  );
}
