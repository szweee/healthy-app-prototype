import { useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { Card, SectionTitle } from "../components/Card";
import { Heatmap } from "../components/Heatmap";
import { WeightTrend } from "../components/WeightTrend";
import { IntakeTrend } from "../components/IntakeTrend";
import { intakeByRange, overviewByRange, heatmapByRange, type RangeKey } from "../data/mock";

const ranges: RangeKey[] = ["周", "月", "年"];
const D = 28;

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? -D : D, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? D : -D, opacity: 0 }),
};

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

export function ProgressScreen({
  onOpenRecords,
}: {
  onOpenRecords?: (title: string, subtitle?: string, empty?: boolean, scope?: "day" | "month") => void;
}) {
  const [range, setRange] = useState<RangeKey>("月");
  const [offset, setOffset] = useState(0); // 0=当前期,负数=过去
  const [dir, setDir] = useState(1);
  const [weightEntryOpen, setWeightEntryOpen] = useState(false);
  const switchRange = (r: RangeKey) => {
    setRange(r);
    setOffset(0);
    setDir(-1);
  };
  const ov = overviewByRange[range];
  const intake = intakeStats(range, offset);
  const heatTitle = range === "周" ? "本周记录完整度" : range === "月" ? "本月记录完整度" : "全年记录完整度";
  const report = {
    周: {
      title: "本周体重继续向目标靠近",
      desc: "记录 6 天 · 2 天略高于目标 · 晚餐少油会更稳",
      action: "下周优先守住晚餐和蛋白质",
    },
    月: {
      title: "本月记录稳定,但体重趋势略有回升",
      desc: "记录 24 天 · 连续打卡 11 天 · 有 5 天未记录体重",
      action: "先检查晚餐和加餐,不要因为单日上升大幅少吃",
    },
    年: {
      title: "今年累计下降 5.2 kg",
      desc: "记录 268 天 · 趋势稳定 · 下半年继续保肌肉",
      action: "重点关注蛋白质达标天数",
    },
  }[range];
  const activity = {
    周: { steps: "7,120", workouts: "2", active: "335" },
    月: { steps: "6,840", workouts: "8", active: "310" },
    年: { steps: "6,420", workouts: "86", active: "296" },
  }[range];
  const older = () => {
    setDir(1);
    setOffset((o) => o - 1);
  };
  const newer = () => {
    if (offset === 0) return;
    setDir(-1);
    setOffset((o) => Math.min(0, o + 1));
  };
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 60) older();
    else if (info.offset.x < -60) newer();
  };

  return (
    <div className="no-scrollbar h-full overflow-y-auto px-4 pb-32 pt-14">
      <div className="mb-3 mt-1 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-ink-900">趋势</h1>
          <div className="mt-0.5 flex items-center gap-2">
            <p className="text-[12px] font-medium text-ink-400">
              {periodLabel(range, offset)}
            </p>
            {offset !== 0 && (
              <button
                onClick={() => {
                  setDir(-1);
                  setOffset(0);
                }}
                className="text-[11px] font-medium text-brand-600"
              >
                回到当前
              </button>
            )}
          </div>
        </div>
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

      <motion.div drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.16} onDragEnd={onDragEnd}>
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={`${range}-${offset}`}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
      <Card className="px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[16px] font-bold leading-snug text-ink-900">{report.title}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-500">{report.desc}</p>
          </div>
          <span className="shrink-0 rounded-pill bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-700">
            小结
          </span>
        </div>
        <p className="mt-3 rounded-2xl bg-canvas px-3 py-2 text-[12px] font-medium leading-relaxed text-brand-700">
          {report.action}
        </p>
      </Card>

      {/* 概览卡:随档位变化 */}
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        <Overview label="趋势体重" value={range === "年" ? "-5.2" : range === "月" ? "+0.9" : "-0.4"} unit={range === "年" ? "kg · 今年" : "kg · 本期"} />
        <Overview label="记录天数" value={ov.loggedDays} unit={ov.loggedUnit} />
        <Overview label="连续打卡" value={ov.streak} unit="天" />
      </div>

      {/* 体重趋势:目标进展优先 */}
      <div className="mt-4">
        <SectionTitle
          action={
            <button
              onClick={() => setWeightEntryOpen(true)}
              className="text-[12px] font-medium text-brand-600"
            >
              + 记录体重
            </button>
          }
        >
          体重趋势
        </SectionTitle>
        <Card className="px-4 py-4">
          <WeightTrend key={`${range}-${offset}`} range={range} offset={offset} scenario="deficit-up" />
        </Card>
      </div>

      {/* 热量摄入趋势 */}
      <div className="mt-4">
        <SectionTitle action={<span className="text-[12px] text-ink-400">对比目标线</span>}>
          热量摄入趋势
        </SectionTitle>
        <Card className="px-4 py-4">
          <div className="mb-3 grid grid-cols-3 gap-2 text-center">
            <Mini label="平均摄入" value={intake.avg.toLocaleString()} unit="kcal/天" />
            <Mini label="高于目标" value={intake.diff > 0 ? `+${intake.diff}` : `${intake.diff}`} unit="kcal/天" />
            <Mini label="超出天数" value={String(intake.overDays)} unit={range === "年" ? "个月" : "天"} />
          </div>
          <IntakeTrend
            key={`${range}-${offset}`}
            range={range}
            offset={offset}
            onOpenRecord={onOpenRecords}
          />
        </Card>
      </div>

      {/* 热力图:随档位切换维度 */}
      <div className="mt-4">
        <SectionTitle action={<span className="text-[12px] text-ink-400">点开当天记录</span>}>
          {heatTitle}
        </SectionTitle>
        <Card className="px-4 py-4">
          <Heatmap
            key={`${range}-${offset}`}
            range={range}
            offset={offset}
            onOpenRecord={onOpenRecords}
          />
          <p className="mt-3 text-[12px] leading-relaxed text-ink-500">
            {heatmapByRange[range].caption} 点格子可进入当天记录详情。
          </p>
        </Card>
      </div>

      {/* 活动概览 */}
      <div className="mt-4">
        <SectionTitle action={<span className="text-[12px] text-ink-400">来自健康 App</span>}>
          活动概览
        </SectionTitle>
        <Card className="px-4 py-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <Mini label="平均步数" value={activity.steps} unit="步/天" />
            <Mini label="训练次数" value={activity.workouts} unit={range === "周" ? "次 · 本周" : range === "月" ? "次 · 本月" : "次 · 今年"} />
            <Mini label="活动消耗" value={activity.active} unit="kcal/天" />
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-ink-500">
            活动数据用于解释趋势,不默认把运动消耗加回饮食预算。
          </p>
        </Card>
      </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {weightEntryOpen && <WeightEntrySheet onClose={() => setWeightEntryOpen(false)} />}
    </div>
  );
}

function Mini({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-[8px] bg-canvas px-2 py-2">
      <p className="text-[10px] text-ink-400">{label}</p>
      <p className="mt-0.5 text-[15px] font-bold text-ink-900">{value}</p>
      <p className="text-[10px] text-ink-400">{unit}</p>
    </div>
  );
}

function intakeStats(range: RangeKey, offset: number) {
  const src = intakeByRange[range];
  const factor = 1 - offset * 0.035;
  const values = src.values.map((v, i) => Math.round(v * factor + ((i * offset * 17) % 90)));
  const avg = Math.round(values.reduce((s, v) => s + v, 0) / values.length);
  return {
    avg,
    diff: avg - src.target,
    overDays: values.filter((v) => v > src.target).length,
  };
}

function WeightEntrySheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center bg-ink-900/25 px-6">
      <div className="w-full rounded-[24px] bg-white p-5 shadow-float">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[17px] font-bold text-ink-900">记录体重</p>
            <p className="mt-1 text-[12px] text-ink-400">建议固定时间称重,看趋势不看单日。</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canvas text-[18px] text-ink-400"
            aria-label="关闭记录体重"
          >
            ×
          </button>
        </div>

        <div className="mt-5 rounded-2xl bg-canvas px-4 py-4 text-center">
          <p className="text-[11px] text-ink-400">今天 08:30</p>
          <p className="mt-1 text-[42px] font-bold leading-none text-ink-900">
            70.0
            <span className="ml-1 text-[15px] font-medium text-ink-400">kg</span>
          </p>
          <p className="mt-2 text-[12px] text-ink-400">来源:手动输入</p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Mini label="提醒频率" value="每周 2 次" unit="可在我的页修改" />
          <Mini label="最近缺测" value="5" unit="天 · 本月" />
          <Mini label="可信度" value="中" unit="连续记录会提高" />
        </div>

        <p className="mt-4 text-[12px] leading-relaxed text-ink-500">
          少输入几天时,趋势线会用已有数据平滑显示;连续缺测会降低趋势可信度,但不会打断饮食记录。
        </p>

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-2xl bg-brand-500 py-3 text-[14px] font-semibold text-white"
        >
          保存
        </button>
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
