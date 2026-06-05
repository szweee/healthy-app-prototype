import { useState } from "react";
import { Card, SectionTitle } from "../components/Card";
import { Heatmap } from "../components/Heatmap";
import { WeightTrend } from "../components/WeightTrend";
import { IntakeTrend } from "../components/IntakeTrend";
import { overviewByRange, heatmapByRange, type RangeKey } from "../data/mock";

const ranges: RangeKey[] = ["周", "月", "年"];

function periodLabel(range: RangeKey, offset: number) {
  if (range === "年") return `${2026 + offset} 年`;
  if (range === "周") return offset === 0 ? "本周" : `${-offset} 周前`;
  let m = 6 + offset;
  let y = 2026;
  while (m < 1) {
    m += 12;
    y -= 1;
  }
  return `${y} 年 ${m} 月`;
}

export function ProgressScreen() {
  const [range, setRange] = useState<RangeKey>("月");
  const [offset, setOffset] = useState(0); // 0=当前期,负数=过去
  const switchRange = (r: RangeKey) => {
    setRange(r);
    setOffset(0);
  };
  const ov = overviewByRange[range];
  const heatTitle = range === "周" ? "本周打卡" : range === "月" ? "本月热力图" : "全年热力图";
  const report = {
    周: { title: "本周小结", desc: "脂肪略高 · 蛋白质达标 · 记录 6 天" },
    月: { title: "本月小结", desc: "均衡度不错 · 连续打卡 11 天 · 体重稳降" },
    年: { title: "年度小结", desc: "全年累计 -5.2 kg · 记录 268 天 · 看看回顾" },
  }[range];

  return (
    <div className="no-scrollbar h-full overflow-y-auto px-4 pb-32 pt-14">
      <div className="mb-3 mt-1 flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-ink-900">趋势</h1>
        {/* 顶部时间档 */}
        <div className="flex rounded-pill bg-black/5 p-0.5">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => switchRange(r)}
              className={`rounded-pill px-3.5 py-1 text-[13px] ${
                range === r ? "bg-surface font-semibold text-ink-900 shadow-card" : "text-ink-500"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* 期次导航:看上一周/月/年,或任意过去期 */}
      <div className="mb-3 flex items-center justify-between rounded-pill bg-surface px-2 py-1.5 shadow-card">
        <button
          onClick={() => setOffset((o) => o - 1)}
          className="flex h-7 w-7 items-center justify-center rounded-full text-ink-500 active:bg-black/5"
          aria-label="上一段"
        >
          ‹
        </button>
        <button
          onClick={() => setOffset(0)}
          className="text-[14px] font-semibold text-ink-900"
        >
          {periodLabel(range, offset)}
          {offset !== 0 && <span className="ml-1.5 text-[11px] font-normal text-brand-600">回到当前</span>}
        </button>
        <button
          onClick={() => setOffset((o) => Math.min(0, o + 1))}
          disabled={offset === 0}
          className={`flex h-7 w-7 items-center justify-center rounded-full active:bg-black/5 ${
            offset === 0 ? "text-ink-200" : "text-ink-500"
          }`}
          aria-label="下一段"
        >
          ›
        </button>
      </div>

      {/* 概览卡:随档位变化 */}
      <div className="grid grid-cols-3 gap-2.5">
        <Overview label="平均摄入" value={ov.avgIntake} unit="kcal/天" />
        <Overview label="记录天数" value={ov.loggedDays} unit={ov.loggedUnit} />
        <Overview label="连续打卡" value={ov.streak} unit="天 🔥" />
      </div>

      {/* 主图:每日热量摄入趋势 */}
      <div className="mt-4">
        <SectionTitle action={<span className="text-[12px] text-ink-400">对比目标线</span>}>
          热量摄入趋势
        </SectionTitle>
        <Card className="px-4 py-4">
          <IntakeTrend key={`${range}-${offset}`} range={range} offset={offset} />
        </Card>
      </div>

      {/* 次图:体重趋势 */}
      <div className="mt-4">
        <SectionTitle action={<span className="text-[12px] text-ink-400">EWMA 平滑</span>}>
          体重趋势
        </SectionTitle>
        <Card className="px-4 py-4">
          <WeightTrend key={`${range}-${offset}`} range={range} offset={offset} />
        </Card>
      </div>

      {/* 热力图:随档位切换维度 */}
      <div className="mt-4">
        <SectionTitle action={<span className="text-[12px] text-ink-400">记录依从度</span>}>
          {heatTitle}
        </SectionTitle>
        <Card className="px-4 py-4">
          <Heatmap range={range} />
          <p className="mt-3 text-[12px] leading-relaxed text-ink-500">
            {heatmapByRange[range].caption}
          </p>
        </Card>
      </div>

      {/* 小结入口(下钻,随档位变) */}
      <div className="mt-4">
        <Card className="flex items-center justify-between px-4 py-4" onClick={() => {}}>
          <div>
            <p className="text-[14px] font-semibold text-ink-900">{report.title}</p>
            <p className="mt-0.5 text-[12px] text-ink-400">{report.desc}</p>
          </div>
          <span className="text-ink-400">›</span>
        </Card>
      </div>
    </div>
  );
}

function Overview({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <Card className="px-3 py-3.5 text-center">
      <p className="text-[11px] text-ink-400">{label}</p>
      <p className="mt-1 text-[18px] font-bold text-ink-900">{value}</p>
      <p className="text-[10px] text-ink-400">{unit}</p>
    </Card>
  );
}
