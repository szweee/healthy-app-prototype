import { useState } from "react";
import type { ReactNode } from "react";
import { heatmapByRange, type RangeKey } from "../data/mock";

const levelColor = ["#ECEBE6", "#D4ECE0", "#A9DCC3", "#6FC5A0", "#3FA17C"];
const levelText = ["未记录", "记录较少", "记录一般", "记录较多", "记录完整"];
const WD = ["一", "二", "三", "四", "五", "六", "日"];

type HeatCell = { id: string; value: number; label: string; day?: number; blank?: boolean };

export function Heatmap({
  range = "年",
  offset = 0,
  onOpenRecord,
}: {
  range?: RangeKey;
  offset?: number;
  onOpenRecord?: (title: string, subtitle?: string, empty?: boolean, scope?: "day" | "month") => void;
}) {
  const cells = buildHeatCells(range, offset);
  const [sel, setSel] = useState<HeatCell | null>(null);
  const selDetail = sel ? buildHeatDetail(sel, range, offset) : null;

  const cell = (item: HeatCell, cls: string, content?: ReactNode) => {
    if (item.blank) return <div key={item.id} className={cls} />;
    const active = sel?.id === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setSel(active ? null : item)}
        className={`relative cursor-pointer ${cls} ${
          active ? "ring-2 ring-brand-600 ring-offset-1" : ""
        }`}
        style={{ background: levelColor[item.value] }}
        aria-label={`${item.label} ${levelText[item.value]}`}
      >
        {content}
      </button>
    );
  };

  let body;
  if (range === "周") {
    // 周:单行 7 格
    body = (
      <div className="flex gap-2">
        {cells.map((item, i) => (
          <div key={item.id} className="flex flex-1 flex-col items-center gap-1">
            {cell(item, "h-9 w-full rounded-lg")}
            <span className="text-[10px] text-ink-400">{WD[i]}</span>
          </div>
        ))}
      </div>
    );
  } else if (range === "月") {
    // 月:7 列周历对齐
    body = (
      <>
        <div className="mb-1.5 grid grid-cols-7 gap-1.5 text-center text-[10px] text-ink-400">
          {WD.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((item) =>
            cell(
              item,
              "aspect-square w-full rounded-[6px] text-[9px] font-semibold text-ink-700/65",
              item.day && (item.day === 1 || item.day % 5 === 0) ? (
                <span className="absolute left-1 top-0.5">{item.day}</span>
              ) : null
            )
          )}
        </div>
      </>
    );
  } else {
    // 年:贡献图
    const weeks = heatmapByRange.年.weeks;
    const cols: HeatCell[][] = [];
    for (let w = 0; w < weeks; w++) cols.push(cells.slice(w * 7, w * 7 + 7));
    body = (
      <div className="flex gap-[3px] overflow-hidden pb-0.5">
        {cols.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-[3px]">
            {col.map((item) => cell(item, "h-[11px] w-[11px] rounded-[3px]"))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {body}
      {selDetail && (
        <div className="mt-3 rounded-2xl bg-canvas px-3 py-2.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold text-ink-800">{selDetail.title}</p>
              <p className="mt-0.5 text-[12px] text-ink-500">{selDetail.summary}</p>
            </div>
            <span
              className={`shrink-0 rounded-pill px-2 py-0.5 text-[10px] font-medium ${selDetail.badgeClass}`}
            >
              {selDetail.levelLabel}
            </span>
          </div>
          <p className="mt-2 text-[12px] font-medium leading-relaxed text-brand-700">
            {selDetail.insight}
          </p>
          <button
            onClick={() => onOpenRecord?.(selDetail.title, selDetail.summary, selDetail.isEmpty, "day")}
            className="mt-2 text-[12px] font-medium text-brand-600"
          >
            {selDetail.isEmpty ? "补记当天记录" : "查看当天记录"} ›
          </button>
        </div>
      )}
      <Legend />
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-2.5 flex items-center justify-end gap-1.5 text-[10px] text-ink-400">
      <span>少</span>
      {levelColor.map((c, i) => (
        <span key={i} className="h-[10px] w-[10px] rounded-[2px]" style={{ background: c }} />
      ))}
      <span>多</span>
    </div>
  );
}

function buildHeatCells(range: RangeKey, offset: number): HeatCell[] {
  const src = heatmapByRange[range].cells;

  if (range === "周") {
    const start = addDays(new Date(2026, 5, 1), offset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(start, i);
      return {
        id: `w-${date.toDateString()}`,
        value: shiftedValue(src[i], i, offset),
        label: `${date.getMonth() + 1}/${date.getDate()} 周${WD[i]}`,
      };
    });
  }

  if (range === "月") {
    const { year, month } = monthFromOffset(offset);
    const days = new Date(year, month + 1, 0).getDate();
    const leading = (new Date(year, month, 1).getDay() + 6) % 7;
    const total = Math.ceil((leading + days) / 7) * 7;
    return Array.from({ length: total }, (_, i) => {
      const day = i - leading + 1;
      if (day < 1 || day > days) {
        return { id: `m-blank-${i}`, value: 0, label: "", blank: true };
      }
      return {
        id: `m-${year}-${month}-${day}`,
        value: shiftedValue(src[(day - 1) % src.length], day, offset),
        label: `${year} 年 ${month + 1} 月 ${day} 日`,
        day,
      };
    });
  }

  const year = 2026 + offset;
  return Array.from({ length: heatmapByRange.年.weeks * 7 }, (_, i) => {
    const date = addDays(new Date(year, 0, 1), i);
    const inYear = date.getFullYear() === year;
    return {
      id: `y-${year}-${i}`,
      value: inYear ? shiftedValue(src[i], i, offset) : 0,
      label: inYear ? `${year} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日` : "",
      blank: !inYear,
    };
  });
}

function shiftedValue(value: number, index: number, offset: number) {
  const drift = Math.abs(offset) % 3;
  const bump = (index * 17 + Math.abs(offset) * 5) % 9 === 0 ? 1 : 0;
  return Math.max(0, Math.min(4, value - drift + bump));
}

function monthFromOffset(offset: number) {
  let month = 5 + offset;
  let year = 2026;
  while (month < 0) {
    month += 12;
    year -= 1;
  }
  while (month > 11) {
    month -= 12;
    year += 1;
  }
  return { year, month };
}

function addDays(date: Date, days: number) {
  const out = new Date(date);
  out.setDate(date.getDate() + days);
  return out;
}

function buildHeatDetail(cell: HeatCell, range: RangeKey, offset: number) {
  const level = cell.value;
  const title = `${shortDate(cell.label)} · ${levelText[level]}`;
  const badgeClass =
    level === 0 ? "bg-ink-100 text-ink-500" : "bg-brand-50 text-brand-700";

  if (level === 0) {
    return {
      title,
      badgeClass,
      levelLabel: levelText[level],
      isEmpty: true,
      summary: "这天没有饮食记录",
      insight: "补上当天记录后,趋势才更容易判断是摄入变化还是记录缺口。",
    };
  }

  const meals = Math.min(4, level);
  const kcal = mockLoggedKcal(cell, range, offset);
  const insight =
    level === 1
      ? "只记录了 1 餐,这天更适合先补全早餐/晚餐。"
      : level === 2
      ? "记录覆盖 2 餐,还缺一餐会影响热量判断。"
      : level === 3
      ? "蛋白质达标 · 晚餐略高"
      : "3 餐以上 + 热量/宏量完整";

  return {
    title,
    badgeClass,
    levelLabel: levelText[level],
    isEmpty: false,
    summary: `已记录 ${meals} 餐 · ${kcal.toLocaleString()} kcal`,
    insight,
  };
}

function shortDate(label: string) {
  const monthDay = label.match(/(\d+) 年 (\d+) 月 (\d+) 日/);
  if (monthDay) return `${monthDay[2]}月${monthDay[3]}日`;
  const compact = label.match(/(\d+)\/(\d+)/);
  if (compact) return `${compact[1]}月${compact[2]}日`;
  return label;
}

function mockLoggedKcal(cell: HeatCell, range: RangeKey, offset: number) {
  const base = range === "年" ? 1640 : 1320;
  const seed = cell.id.length + Math.abs(offset) * 29 + cell.value * 137;
  return base + ((seed * 41) % 540);
}
