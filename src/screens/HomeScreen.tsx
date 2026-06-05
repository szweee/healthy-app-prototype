import { useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { CalorieRing } from "../components/CalorieRing";
import { MacroBars } from "../components/MacroBars";
import { Card, SectionTitle } from "../components/Card";
import { daySummary, meals } from "../data/mock";

const D = 28; // 横向位移幅度(一小段)

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? -D : D, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? D : -D, opacity: 0 }),
};

export function HomeScreen() {
  const [offset, setOffset] = useState(0); // 0=今天,负数=过去
  const [dir, setDir] = useState(1); // 1=看更早, -1=看更近
  const day = daySummary(offset);
  const net = day.consumed - day.burnedActive;
  const stepPct = Math.min(100, Math.round((day.steps / day.stepGoal) * 100));

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
      {/* 顶部:日期可点回今天 + 左右切天 */}
      <div className="mb-3 mt-1 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={older}
              className="flex h-6 w-6 items-center justify-center rounded-full text-ink-400 active:bg-black/5"
              aria-label="前一天"
            >
              ‹
            </button>
            <button
              onClick={() => {
                setDir(-1);
                setOffset(0);
              }}
              className="text-[13px] text-ink-400 active:text-ink-700"
            >
              {day.label} · {day.weekday}
            </button>
            <button
              onClick={newer}
              disabled={offset === 0}
              className={`flex h-6 w-6 items-center justify-center rounded-full active:bg-black/5 ${
                offset === 0 ? "text-ink-200" : "text-ink-400"
              }`}
              aria-label="后一天"
            >
              ›
            </button>
            {offset !== 0 && (
              <button
                onClick={() => {
                  setDir(-1);
                  setOffset(0);
                }}
                className="ml-1 rounded-pill bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-600"
              >
                回到今天
              </button>
            )}
          </div>
          <h1 className="mt-0.5 text-[22px] font-bold text-ink-900">{day.greeting}</h1>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-[18px]">
          🙂
        </div>
      </div>

      {/* 可左右滑切换当天 + 渐隐渐显过渡 */}
      <motion.div drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.16} onDragEnd={onDragEnd}>
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={offset}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {/* 热量环卡 */}
            <Card className="flex flex-col items-center px-5 py-6">
              <CalorieRing key={offset} consumed={day.consumed} target={day.target} />
              <div className="mt-5 grid w-full grid-cols-3 divide-x divide-black/5 text-center">
                <Stat label="已摄入" value={day.consumed} unit="kcal" />
                <Stat label="已消耗" value={day.burnedActive} unit="kcal" accent />
                <Stat label="净" value={net} unit="kcal" />
              </div>
              <div className="mt-5 w-full">
                <MacroBars />
              </div>
            </Card>

            {/* HealthKit 活动卡 */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Card className="px-4 py-3.5">
                <div className="flex items-baseline justify-between">
                  <p className="text-[12px] text-ink-400">今日步数</p>
                  <p className="text-[11px] text-ink-400">目标 {day.stepGoal.toLocaleString()}</p>
                </div>
                <p className="mt-0.5 text-[20px] font-bold text-ink-900">{day.steps.toLocaleString()}</p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${stepPct}%` }} />
                </div>
                <p className="mt-1 text-[11px] text-brand-600">来自 健康 App · {stepPct}%</p>
              </Card>
              <Card className="px-4 py-3.5">
                <p className="text-[12px] text-ink-400">活动消耗</p>
                <p className="mt-0.5 text-[20px] font-bold text-ink-900">
                  {day.burnedActive}
                  <span className="text-[12px] font-medium text-ink-400"> kcal</span>
                </p>
                <p className="text-[11px] text-ink-400">运动 / 走动 · 不自动加进预算</p>
              </Card>
            </div>

            {/* 餐次占位槽 */}
            <div className="mt-5">
              <SectionTitle action={<span className="text-[12px] text-brand-600">查看日记</span>}>
                {offset === 0 ? "今日餐次" : "当天餐次"}
              </SectionTitle>
              <div className="space-y-2.5">
                {meals.map((m) => {
                  const items = day.entries.filter((e) => e.meal === m.type);
                  const kcal = items.reduce((s, e) => s + e.kcal, 0);
                  return (
                    <Card key={m.type} className="px-3.5 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[20px]">{m.emoji}</span>
                          <div>
                            <p className="text-[14px] font-semibold text-ink-900">{m.type}</p>
                            <p className="text-[11px] text-ink-400">
                              {items.length ? `${items.length} 项` : m.hint}
                            </p>
                          </div>
                        </div>
                        {items.length ? (
                          <span className="text-[14px] font-semibold text-ink-900">{kcal} kcal</span>
                        ) : (
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                            +
                          </span>
                        )}
                      </div>
                      {items.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {items.map((e) => (
                            <span
                              key={e.id}
                              className="flex items-center gap-1 rounded-pill bg-canvas px-2 py-1 text-[12px] text-ink-700"
                            >
                              <span>{e.emoji}</span>
                              {e.name}
                              {e.flags?.[0] && (
                                <span className="ml-1 rounded-pill bg-status-warn/15 px-1.5 text-[10px] text-[#B8842B]">
                                  {e.flags[0]}
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <p className="mt-5 px-2 text-center text-[11px] leading-relaxed text-ink-400">
        数据仅供参考,不构成医疗建议
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: number;
  unit: string;
  accent?: boolean;
}) {
  return (
    <div className="px-1">
      <p className="text-[11px] text-ink-400">{label}</p>
      <p className={`mt-0.5 text-[17px] font-bold ${accent ? "text-brand-600" : "text-ink-900"}`}>
        {value}
      </p>
      <p className="text-[10px] text-ink-400">{unit}</p>
    </div>
  );
}
