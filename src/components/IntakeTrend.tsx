import { useState } from "react";
import { motion } from "framer-motion";
import { intakeByRange, type RangeKey } from "../data/mock";
import { STATIC } from "../anim";

const TRACK = 128; // 柱区像素高度

export function IntakeTrend({ range, offset = 0 }: { range: RangeKey; offset?: number }) {
  const src = intakeByRange[range];
  const labels = src.labels;
  const target = src.target;
  // 过去期数据按 offset 做确定性扰动(原型示意,真机取真实数据)
  const factor = 1 - offset * 0.035;
  const values = src.values.map((v, i) => Math.round(v * factor + ((i * offset * 17) % 90)));
  const avg = Math.round(values.reduce((s, v) => s + v, 0) / values.length);
  const max = Math.max(...values, target) * 1.12;
  const showLabels = values.length <= 12; // 周/年 标数字,月太密则不标
  const [sel, setSel] = useState<number | null>(null);

  const selInfo =
    sel !== null
      ? {
          v: values[sel],
          label: labels[sel] || `第 ${sel + 1} ${range === "年" ? "月" : "天"}`,
          diff: values[sel] - target,
        }
      : null;

  return (
    <div>
      <div className="mb-3 flex items-end justify-between">
        <div>
          {selInfo ? (
            <>
              <div className="text-[28px] font-bold leading-none text-ink-900">
                {selInfo.v.toLocaleString()}
                <span className="ml-1 text-[14px] font-medium text-ink-400">kcal</span>
              </div>
              <div className="mt-1 text-[12px]">
                <span className="text-ink-400">
                  {range === "年" ? `${selInfo.label} 月` : selInfo.label}
                </span>
                <span className={selInfo.diff > 0 ? "ml-2 text-[#C77A1E]" : "ml-2 text-brand-600"}>
                  {selInfo.diff > 0 ? `超目标 +${selInfo.diff}` : `距目标 ${selInfo.diff}`}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="text-[28px] font-bold leading-none text-ink-900">
                {avg.toLocaleString()}
                <span className="ml-1 text-[14px] font-medium text-ink-400">kcal/天</span>
              </div>
              <div className="mt-1 text-[12px] text-ink-400">
                {range === "周" ? "本周" : range === "月" ? "本月" : "今年"}平均摄入 · 点柱看当天
              </div>
            </>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 text-[11px] text-ink-400">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-[2px] bg-[#6FC5A0]" />正常
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-[2px] bg-[#E7A23B]" />超出目标
          </span>
        </div>
      </div>

      {/* 分段堆叠柱:绿=目标内,橙=探出目标虚线的超出部分。点柱看明细 */}
      <div className="relative flex items-end gap-[3px]" style={{ height: TRACK }}>
        <div
          className="pointer-events-none absolute left-0 right-0 z-10 border-t border-dashed border-ink-400/70"
          style={{ bottom: (target / max) * TRACK }}
        >
          <span className="absolute -top-4 right-0 text-[10px] text-ink-400">
            目标 {target.toLocaleString()}
          </span>
        </div>
        {values.map((v, i) => {
          const greenPx = (Math.min(v, target) / max) * TRACK;
          const orangePx = (Math.max(0, v - target) / max) * TRACK;
          const active = sel === i;
          return (
            <div
              key={i}
              onClick={() => setSel(active ? null : i)}
              className="flex h-full flex-1 cursor-pointer flex-col justify-end"
            >
              {showLabels && (
                <span
                  className={`mb-0.5 text-center text-[9px] font-medium ${
                    active ? "text-ink-900" : "text-ink-400"
                  }`}
                >
                  {v >= 1000 ? (v / 1000).toFixed(1) + "k" : v}
                </span>
              )}
              {orangePx > 0 && (
                <motion.div
                  className="rounded-t-[4px] bg-[#E7A23B]"
                  style={{ opacity: sel === null || active ? 1 : 0.4 }}
                  initial={STATIC ? false : { height: 0 }}
                  animate={{ height: orangePx }}
                  transition={{ duration: 0.5, delay: i * 0.012, ease: "easeOut" }}
                />
              )}
              <motion.div
                className={orangePx > 0 ? "bg-[#6FC5A0]" : "rounded-t-[4px] bg-[#6FC5A0]"}
                style={{ opacity: sel === null || active ? 1 : 0.4 }}
                initial={STATIC ? false : { height: 0 }}
                animate={{ height: greenPx }}
                transition={{ duration: 0.5, delay: i * 0.012, ease: "easeOut" }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-1.5 flex gap-[3px] text-[10px] text-ink-400">
        {labels.map((l, i) => (
          <span key={i} className="flex-1 text-center">
            {l}
          </span>
        ))}
      </div>
      {selInfo ? (
        <div className="mt-3 rounded-2xl bg-canvas px-3 py-2.5">
          <p className="mb-2 text-[12px] font-semibold text-ink-700">当天餐次明细</p>
          <div className="grid grid-cols-4 gap-2">
            {mealSplit(selInfo.v).map((m) => (
              <div key={m.name} className="text-center">
                <div className="text-[18px]">{m.emoji}</div>
                <div className="text-[13px] font-bold text-ink-900">{m.kcal}</div>
                <div className="text-[10px] text-ink-400">{m.name}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-2 text-[11px] leading-relaxed text-ink-400">
          每根柱子是当天总摄入,探出虚线变橙的部分即超过当天目标的量。
        </p>
      )}
    </div>
  );
}

// 把当天总摄入按典型比例拆到四餐(原型示意)
function mealSplit(total: number) {
  const parts = [
    { name: "早餐", emoji: "🌅", r: 0.26 },
    { name: "午餐", emoji: "🌤", r: 0.36 },
    { name: "晚餐", emoji: "🌙", r: 0.28 },
    { name: "加餐", emoji: "🍎", r: 0.1 },
  ];
  return parts.map((p) => ({ ...p, kcal: Math.round(total * p.r) }));
}
