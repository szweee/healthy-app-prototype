import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { Card } from "../components/Card";
import { diaryMonth, todayEntries } from "../data/mock";

type DayData = { day: number; photos: string[]; kcal: number };
type Rect = { x: number; y: number; w: number; h: number };
type Selected = { data: DayData; origin: Rect };

export function DiaryScreen() {
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [selected, setSelected] = useState<Selected | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const select = (data: DayData, e: React.MouseEvent) => {
    const cont = containerRef.current?.getBoundingClientRect();
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (!cont) return;
    setSelected({
      data,
      origin: { x: r.left - cont.left, y: r.top - cont.top, w: r.width, h: r.height },
    });
  };

  return (
    <div
      ref={containerRef}
      className="no-scrollbar relative h-full overflow-y-auto px-4 pb-32 pt-14"
    >
      <div className="mb-3 mt-1 flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-ink-900">日记</h1>
        <div className="flex rounded-pill bg-black/5 p-0.5">
          <ViewTab label="相册" active={view === "calendar"} onClick={() => setView("calendar")} />
          <ViewTab label="列表" active={view === "list"} onClick={() => setView("list")} />
        </div>
      </div>

      {view === "calendar" ? <CalendarView onSelect={select} /> : <ListView />}

      <DayDetail selected={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function ViewTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-pill px-3.5 py-1 text-[13px] ${
        active ? "bg-surface font-semibold text-ink-900 shadow-card" : "text-ink-500"
      }`}
    >
      {label}
    </button>
  );
}

function CalendarView({ onSelect }: { onSelect: (d: DayData, e: React.MouseEvent) => void }) {
  const [monthOff, setMonthOff] = useState(0); // 0=本月,负=往前
  let m = 6 + monthOff;
  let y = 2026;
  while (m < 1) {
    m += 12;
    y -= 1;
  }
  return (
    <>
      {/* 月份切换 */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setMonthOff((o) => o - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-500 active:bg-black/5"
          aria-label="上个月"
        >
          ‹
        </button>
        <button onClick={() => setMonthOff(0)} className="text-[16px] font-bold text-ink-900">
          {y} 年 {m} 月
          {monthOff !== 0 && <span className="ml-1.5 text-[11px] font-normal text-brand-600">回到本月</span>}
        </button>
        <button
          onClick={() => setMonthOff((o) => Math.min(0, o + 1))}
          disabled={monthOff === 0}
          className={`flex h-8 w-8 items-center justify-center rounded-full active:bg-black/5 ${
            monthOff === 0 ? "text-ink-200" : "text-ink-500"
          }`}
          aria-label="下个月"
        >
          ›
        </button>
      </div>

      <div className="mb-1.5 grid grid-cols-7 gap-1.5 px-0.5 text-center text-[11px] text-ink-400">
        {["一", "二", "三", "四", "五", "六", "日"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {diaryMonth.map((cell, i) => (
          <DayCell
            key={i}
            day={cell.day}
            photos={cell.photos}
            onClick={
              cell.day !== null && cell.photos.length > 0
                ? (e) =>
                    onSelect(
                      { day: cell.day as number, photos: cell.photos, kcal: cell.kcal ?? 0 },
                      e
                    )
                : undefined
            }
          />
        ))}
      </div>
      <p className="mt-4 text-center text-[11px] text-ink-400">点某天查看与编辑当天记录</p>
    </>
  );
}

// 月网格:每格 = 日期 + 一张整齐缩略图(代表图),多条用右下角 +N
// (扑克牌叠卡效果留给点开某天后的放大视图)
function DayCell({
  day,
  photos,
  onClick,
}: {
  day: number | null;
  photos: string[];
  onClick?: (e: React.MouseEvent) => void;
}) {
  if (day === null) return <div className="aspect-[4/5]" />;
  const extra = photos.length - 1;
  return (
    <div className="relative aspect-[4/5]" onClick={onClick}>
      {photos.length === 0 ? (
        <div className="flex h-full w-full items-center justify-center rounded-xl bg-black/[0.04] text-[12px] text-ink-400">
          {day}
        </div>
      ) : (
        <div
          className="relative h-full w-full overflow-hidden rounded-xl border border-white/70 shadow-sm active:scale-95"
          style={{ background: photos[0] }}
        >
          {/* 顶部渐隐,保证日期清晰 */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black/30 to-transparent" />
          <span className="absolute left-1 top-0.5 z-10 text-[11px] font-semibold text-white">
            {day}
          </span>
          {extra > 0 && (
            <span className="absolute bottom-1 right-1 z-10 rounded-md bg-black/45 px-1 text-[10px] font-semibold text-white">
              +{extra}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// 点开某天:从日历格子位置放大成卡片,关闭缩回原格子;支持下滑关闭。扑克牌叠卡在此展现
const CARD = { left: 22, top: 78, width: 331, height: 476, radius: 26 };

function DayDetail({ selected, onClose }: { selected: Selected | null; onClose: () => void }) {
  const data = selected?.data;
  const origin = selected?.origin;
  const entries = data ? todayEntries.slice(0, Math.max(1, data.photos.length)) : [];
  const [spread, setSpread] = useState(false);
  useEffect(() => {
    setSpread(false);
  }, [selected]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 110 || info.velocity.y > 700) onClose();
  };

  return (
    <AnimatePresence>
      {selected && data && origin && (
        <>
          <motion.div
            className="absolute inset-0 z-40 bg-black/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* morph 容器:从格子 rect 放大 → 卡片;exit 缩回格子 */}
          <motion.div
            className="absolute z-50 overflow-hidden bg-canvas shadow-float"
            initial={{ left: origin.x, top: origin.y, width: origin.w, height: origin.h, borderRadius: 12 }}
            animate={{
              left: CARD.left,
              top: CARD.top,
              width: CARD.width,
              height: CARD.height,
              borderRadius: CARD.radius,
            }}
            exit={{ left: origin.x, top: origin.y, width: origin.w, height: origin.h, borderRadius: 12 }}
            transition={{ type: "spring", stiffness: 360, damping: 34 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.06, bottom: 0.5 }}
            dragMomentum={false}
            onDragEnd={onDragEnd}
          >
            {/* 内容淡入 */}
            <motion.div
              className="flex h-full flex-col px-4 pb-4 pt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, delay: 0.06 }}
            >
              <div className="mx-auto mb-3 h-1 w-9 shrink-0 rounded-full bg-black/15" />
              <div className="mb-4 flex shrink-0 items-center justify-between">
                <div>
                  <p className="text-[17px] font-bold text-ink-900">6 月 {data.day} 日</p>
                  <p className="text-[12px] text-ink-400">{entries.length} 项记录</p>
                </div>
                <div className="text-right">
                  <p className="text-[20px] font-bold text-ink-900">{data.kcal}</p>
                  <p className="text-[10px] text-ink-400">kcal</p>
                </div>
              </div>

              {/* 照片:默认扑克牌叠卡,点按散开 → 横向滑动逐张翻 */}
              {spread ? (
                <div className="no-scrollbar -mx-4 mb-1.5 flex h-40 shrink-0 snap-x snap-mandatory gap-3 overflow-x-auto px-[calc(50%-3.5rem)]">
                  {data.photos.map((g, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSpread(false)}
                      className="h-36 w-28 shrink-0 snap-center rounded-2xl border-2 border-white shadow-card"
                      style={{ background: g }}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className="relative mb-1.5 flex h-40 shrink-0 cursor-pointer items-center justify-center"
                  onClick={() => setSpread(true)}
                >
                  {data.photos.slice(0, 4).map((g, idx) => {
                    const n = Math.min(data.photos.length, 4);
                    const center = idx - (n - 1) / 2;
                    return (
                      <motion.div
                        key={idx}
                        className="absolute h-36 w-28 rounded-2xl border-2 border-white shadow-card"
                        style={{ background: g, zIndex: idx }}
                        animate={{ x: center * 38, rotate: center * 7, scale: 1 }}
                        transition={{ type: "spring", stiffness: 320, damping: 26 }}
                      />
                    );
                  })}
                </div>
              )}
              <p className="mb-3 shrink-0 text-center text-[11px] text-ink-400">
                {data.photos.length > 1
                  ? spread
                    ? "左右滑逐张 · 点击收拢"
                    : "点击散开看每张"
                  : ""}
              </p>

              {/* 当天记录列表 */}
              <div className="no-scrollbar flex-1 overflow-y-auto">
                <Card className="overflow-hidden">
                  {entries.map((e, i) => (
                    <div
                      key={e.id}
                      className={`flex items-center gap-3 px-3 py-2.5 ${
                        i > 0 ? "border-t border-black/5" : ""
                      }`}
                    >
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-[18px]"
                        style={e.photo ? { background: e.photo } : { background: "#F1F0EB" }}
                      >
                        {!e.photo && e.emoji}
                      </div>
                      <div className="flex-1">
                        <p className="text-[14px] font-medium text-ink-900">{e.name}</p>
                        <p className="text-[11px] text-ink-400">
                          {e.meal} · {e.time}
                        </p>
                      </div>
                      <span className="text-[13px] font-semibold text-ink-900">{e.kcal}</span>
                    </div>
                  ))}
                </Card>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ListView() {
  // 按天分组,厚分组头
  const days = [
    { date: "今天 · 6 月 5 日", kcal: 1190, entries: todayEntries },
    { date: "昨天 · 6 月 4 日", kcal: 1640, entries: todayEntries.slice(0, 3) },
  ];
  return (
    <div className="space-y-4">
      {days.map((d) => (
        <div key={d.date}>
          {/* 厚日期分组头 */}
          <div className="mb-2 flex items-center justify-between rounded-2xl bg-brand-50 px-3.5 py-2.5">
            <div>
              <p className="text-[14px] font-bold text-ink-900">{d.date}</p>
              <p className="text-[11px] text-brand-600">达标 · {d.entries.length} 项记录</p>
            </div>
            <div className="text-right">
              <p className="text-[15px] font-bold text-ink-900">{d.kcal}</p>
              <p className="text-[10px] text-ink-400">kcal</p>
            </div>
          </div>
          <Card className="overflow-hidden">
            {d.entries.map((e, i) => (
              <div
                key={e.id}
                className={`flex items-center gap-3 px-3 py-2.5 ${
                  i > 0 ? "border-t border-black/5" : ""
                }`}
              >
                {/* 统一小缩略图 */}
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-[20px]"
                  style={e.photo ? { background: e.photo } : { background: "#F1F0EB" }}
                >
                  {!e.photo && e.emoji}
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-ink-900">{e.name}</p>
                  <p className="text-[11px] text-ink-400">
                    {e.meal} · {e.time} · 来源 {e.source}
                  </p>
                </div>
                <span className="text-[13px] font-semibold text-ink-900">{e.kcal}</span>
              </div>
            ))}
          </Card>
        </div>
      ))}
    </div>
  );
}
