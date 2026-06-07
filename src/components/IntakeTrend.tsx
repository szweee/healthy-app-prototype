import { useState } from "react";
import { intakeByRange, type RangeKey } from "../data/mock";

const TRACK = 128; // 柱区像素高度

export function IntakeTrend({
  range,
  offset = 0,
  onOpenRecord,
}: {
  range: RangeKey;
  offset?: number;
  onOpenRecord?: (title: string, subtitle?: string, empty?: boolean, scope?: "day" | "month") => void;
}) {
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
          label: selectedLabel(range, labels[sel], sel),
          diff: values[sel] - target,
          detail: buildDeviationDetail(values[sel], target, sel, range, offset),
        }
      : null;
  const overDays = values.filter((v) => v > target).length;

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
                <span className="text-ink-400">{selInfo.label}</span>
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
                {range === "周" ? "本周" : range === "月" ? "本月" : "今年"}平均摄入 ·
                {range === "年" ? " 点月份看摘要" : " 点柱看当天"}
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
            <button
              type="button"
              key={i}
              onClick={() => setSel(active ? null : i)}
              className="group relative h-full min-w-0 flex-1 cursor-pointer appearance-none border-0 bg-transparent p-0"
              style={{ opacity: sel === null || active ? 1 : 0.4 }}
              aria-label={`${selectedLabel(range, labels[i], i)} ${v} kcal`}
            >
              {showLabels && (
                <span
                  className={`absolute left-0 right-0 top-0 z-20 text-center text-[9px] font-medium ${
                    active ? "text-ink-900" : "text-ink-400"
                  }`}
                >
                  {v >= 1000 ? (v / 1000).toFixed(1) + "k" : v}
                </span>
              )}
              <svg
                className="absolute inset-x-0 bottom-0 h-full w-full overflow-visible"
                viewBox={`0 0 24 ${TRACK}`}
                preserveAspectRatio="none"
                aria-hidden="true"
                focusable="false"
              >
                <BarSegment
                  x={5}
                  y={TRACK - greenPx}
                  width={14}
                  height={greenPx}
                  radius={4}
                  fill="#6FC5A0"
                  topRounded={orangePx <= 0}
                />
                {orangePx > 0 && (
                  <BarSegment
                    x={5}
                    y={TRACK - greenPx - orangePx}
                    width={14}
                    height={orangePx}
                    radius={4}
                    fill="#E7A23B"
                    topRounded
                  />
                )}
                {active && (
                  <rect
                    x="4.5"
                    y={TRACK - greenPx - orangePx - 0.5}
                    width="15"
                    height={greenPx + orangePx + 1}
                    rx="4.5"
                    fill="none"
                    stroke={orangePx > 0 ? "#B96F1A" : "#2F8568"}
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                )}
              </svg>
            </button>
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
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[12px] font-semibold text-ink-700">
              {range === "年" ? "月度偏差解释" : "当天偏差解释"}
            </p>
            <button
              onClick={() =>
                onOpenRecord?.(
                  range === "年" ? `${selInfo.label}记录` : `${selInfo.label}记录`,
                  range === "年"
                    ? `月均 ${selInfo.v.toLocaleString()} kcal/天`
                    : `${selInfo.v.toLocaleString()} kcal · ${selInfo.diff > 0 ? `超目标 ${selInfo.diff}` : `低于目标 ${Math.abs(selInfo.diff)}`}`,
                  false,
                  range === "年" ? "month" : "day"
                )
              }
              className="shrink-0 text-[12px] font-medium text-brand-600"
            >
              {range === "年" ? "查看月度记录" : "查看当天记录"} ›
            </button>
          </div>
          <p className={`mb-2 text-[12px] font-medium leading-relaxed ${selInfo.detail.color}`}>
            {selInfo.detail.message}
          </p>
          {range === "年" ? (
            <div className="grid grid-cols-3 gap-2 text-center">
              <DetailStat label="月均摄入" value={selInfo.v.toLocaleString()} unit="kcal/天" />
              <DetailStat
                label={selInfo.diff > 0 ? "高于目标" : "低于目标"}
                value={selInfo.diff > 0 ? `+${selInfo.diff}` : `${selInfo.diff}`}
                unit="kcal/天"
              />
              <DetailStat label="记录天数" value={String(monthLoggedDays(sel ?? 0, offset))} unit="天" />
            </div>
          ) : (
            <div className="space-y-1.5">
              {selInfo.detail.meals.map((m) => (
                <div key={m.name} className="flex items-start justify-between gap-2 text-[12px]">
                  <div className="min-w-0">
                    <span className="font-semibold text-ink-800">{m.name}</span>
                    <span className="ml-1 text-ink-500">{m.kcal} kcal · {m.foods}</span>
                  </div>
                  {m.flag && (
                    <span className="shrink-0 rounded-pill bg-status-warn/15 px-2 py-0.5 text-[10px] font-medium text-[#9A681A]">
                      {m.flag}
                    </span>
                  )}
                </div>
              ))}
              <p className="pt-1 text-[10px] leading-relaxed text-ink-400">
                原型用 mock 餐次演示;真实开发应从当天 MealLog 聚合。
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-2 text-[11px] leading-relaxed text-ink-400">
          {range === "年"
            ? `每根柱子是月均摄入,今年有 ${overDays} 个月高于目标线。`
            : `每根柱子是当天总摄入,本期有 ${overDays} 天高于目标线。`}
        </p>
      )}
    </div>
  );
}

function BarSegment({
  x,
  y,
  width,
  height,
  radius,
  fill,
  topRounded,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  fill: string;
  topRounded: boolean;
}) {
  if (height <= 0) return null;
  const r = topRounded ? Math.min(radius, height, width / 2) : 0;
  const bottom = y + height;
  const d = topRounded
    ? `M ${x} ${bottom} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} L ${x + width - r} ${y} Q ${x + width} ${y} ${x + width} ${y + r} L ${x + width} ${bottom} Z`
    : `M ${x} ${y} H ${x + width} V ${bottom} H ${x} Z`;

  return <path d={d} fill={fill} />;
}

function DetailStat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div>
      <p className="text-[10px] text-ink-400">{label}</p>
      <p className="mt-0.5 text-[13px] font-bold text-ink-900">{value}</p>
      <p className="text-[10px] text-ink-400">{unit}</p>
    </div>
  );
}

function selectedLabel(range: RangeKey, label: string | undefined, index: number) {
  if (range === "年") return `${label || index + 1} 月`;
  if (range === "周") return `周${label || index + 1}`;
  return `${index + 1} 日`;
}

function monthLoggedDays(index: number, offset: number) {
  const seed = Math.abs(offset) + index * 3;
  return Math.max(22, Math.min(31, 26 + ((seed * 7) % 6) - (index % 3)));
}

type MealExplanation = {
  name: string;
  kcal: number;
  foods: string;
  flag?: string;
};

function buildDeviationDetail(
  total: number,
  target: number,
  index: number,
  range: RangeKey,
  offset: number
) {
  const diff = total - target;
  const over = diff > 0;
  const meals = buildMockMeals(total, index, offset);
  const highMeals = meals.filter((m) => m.flag === "偏高").map((m) => m.name);
  const mainCause = highMeals.length > 0 ? highMeals.join("或") : "整体份量";

  if (range === "年") {
    return {
      color: over ? "text-[#9A681A]" : "text-brand-700",
      meals: [] as MealExplanation[],
      message: over
        ? `高于目标 ${diff} kcal/天,主要来自${mainCause}偏高的月份。下次可先看晚餐和加餐结构。`
        : `低于目标 ${Math.abs(diff)} kcal/天,这个月整体控制较稳。继续看蛋白质和记录完整度。`,
    };
  }

  return {
    color: over ? "text-[#9A681A]" : "text-brand-700",
    meals,
    message: over
      ? `高于目标 ${diff} kcal,主要来自${mainCause}。下次可先调整这两餐。`
      : `低于目标 ${Math.abs(diff)} kcal,这天整体控制较稳。`,
  };
}

function buildMockMeals(total: number, index: number, offset: number): MealExplanation[] {
  const seed = Math.abs(offset) + index;
  const templates = [
    {
      breakfast: "燕麦牛奶、咖啡",
      lunch: "沙拉碗、全麦面包",
      dinner: "炒菜 + 主食",
      snack: "甜饮/点心",
    },
    {
      breakfast: "鸡蛋、酸奶",
      lunch: "鸡胸肉饭、蔬菜",
      dinner: "番茄炒蛋、米饭",
      snack: "拿铁、司康",
    },
    {
      breakfast: "贝果、黑咖啡",
      lunch: "三文鱼碗、牛油果",
      dinner: "外卖盖饭",
      snack: "水果、坚果",
    },
  ];
  const t = templates[seed % templates.length];
  const over = total > 1800;
  const snackHigh = over && seed % 2 === 0;
  let breakfast = (over ? 320 : 270) + ((seed * 23) % 55);
  let lunch = (over ? 540 : 430) + ((seed * 31) % 70);
  let snack = snackHigh ? 300 + ((seed * 17) % 70) : (over ? 170 : 70) + ((seed * 19) % 70);
  let dinner = total - breakfast - lunch - snack;

  if (dinner < 360) {
    const gap = 360 - dinner;
    lunch = Math.max(360, lunch - Math.ceil(gap * 0.55));
    snack = Math.max(50, snack - Math.floor(gap * 0.45));
    dinner = total - breakfast - lunch - snack;
  }

  return [
    { name: "早餐", kcal: breakfast, foods: t.breakfast },
    { name: "午餐", kcal: lunch, foods: t.lunch },
    { name: "晚餐", kcal: dinner, foods: t.dinner, flag: dinner >= 700 ? "偏高" : undefined },
    { name: "加餐", kcal: snack, foods: t.snack, flag: snackHigh ? "偏高" : undefined },
  ];
}
