import { useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { Card } from "../components/Card";
import { diaryMonth, todayEntries } from "../data/mock";

export type RecordTarget = {
  title: string;
  subtitle?: string;
  empty?: boolean;
  scope?: "day" | "month";
};

export function DiaryScreen({
  target,
  onBack,
}: {
  target: RecordTarget;
  onBack: () => void;
}) {
  const isMonth = target.scope === "month";
  const [offset, setOffset] = useState(0);
  const [dir, setDir] = useState(1);
  const empty = Boolean(target.empty && offset === 0);
  const entries = empty ? [] : entriesForOffset(offset);
  const photoEntries = entries.filter((entry) => entry.photo);
  const [view, setView] = useState<"list" | "photos">("list");
  const total = entries.reduce((sum, entry) => sum + entry.kcal, 0);
  const heading = isMonth ? monthLabel(offset) : dayLabel(offset, target.title);
  const subtitle = target.subtitle ?? (empty ? "这天没有饮食记录" : `${entries.length} 项记录 · ${total} kcal`);

  const older = () => {
    setDir(1);
    setOffset((value) => value - 1);
  };
  const newer = () => {
    if (offset === 0) return;
    setDir(-1);
    setOffset((value) => Math.min(0, value + 1));
  };
  const reset = () => {
    setDir(-1);
    setOffset(0);
  };
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 60) older();
    else if (info.offset.x < -60) newer();
  };

  return (
    <motion.div
      className="no-scrollbar h-full overflow-y-auto px-4 pb-8 pt-14"
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 18 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="mb-3 mt-1 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <button
            onClick={onBack}
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-[22px] text-ink-500 shadow-card active:scale-95"
            aria-label="返回"
          >
            ‹
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-[22px] font-bold text-ink-900">{heading}</h1>
            <div className="mt-0.5 flex items-center gap-2">
              <p className="truncate text-[12px] text-ink-400">{subtitle}</p>
              {offset !== 0 && (
                <button onClick={reset} className="shrink-0 text-[11px] font-semibold text-brand-600">
                  {isMonth ? "回到本月" : "回到今天"}
                </button>
              )}
            </div>
          </div>
        </div>
        <button className="shrink-0 rounded-pill bg-brand-50 px-3 py-1.5 text-[12px] font-semibold text-brand-700">
          {empty ? "补记" : "添加"}
        </button>
      </div>

      {!empty && (
        <div className="mb-3 flex items-center justify-between">
          {isMonth ? (
            <div className="flex rounded-pill bg-black/5 p-0.5">
              <ViewTab label="列表" active={view === "list"} onClick={() => setView("list")} />
              <ViewTab label="照片" active={view === "photos"} onClick={() => setView("photos")} />
            </div>
          ) : (
            <p className="text-[11px] text-ink-400">当天记录详情</p>
          )}
          {!isMonth && photoEntries.length > 0 && (
            <button
              onClick={() => setView(view === "photos" ? "list" : "photos")}
              className={`rounded-pill px-3 py-1.5 text-[12px] font-semibold ${
                view === "photos" ? "bg-brand-500 text-white" : "bg-surface text-brand-700 shadow-card"
              }`}
            >
              照片 {photoEntries.length} ›
            </button>
          )}
        </div>
      )}

      <motion.div drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.16} onDragEnd={onDragEnd}>
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={`${isMonth ? "month" : "day"}-${offset}-${view}`}
            custom={dir}
            initial={{ x: dir > 0 ? -24 : 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: dir > 0 ? 24 : -24, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {empty ? (
              <EmptyRecord />
            ) : view === "photos" ? (
              isMonth ? <MonthPhotoWall offset={offset} /> : <DayPhotoWall entries={photoEntries} onBack={() => setView("list")} />
            ) : (
              <RecordList entries={entries} total={total} />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function EmptyRecord() {
  return (
    <Card className="px-4 py-5 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-[22px]">
        +
      </div>
      <p className="mt-3 text-[15px] font-bold text-ink-900">这天还没有记录</p>
      <p className="mx-auto mt-1 max-w-[240px] text-[12px] leading-relaxed text-ink-500">
        补上当天吃了什么,趋势页才能判断是摄入变化,还是记录缺口。
      </p>
      <button className="mt-4 rounded-2xl bg-brand-500 px-5 py-2.5 text-[13px] font-semibold text-white shadow-card">
        补记当天记录
      </button>
    </Card>
  );
}

function RecordList({ entries, total }: { entries: typeof todayEntries; total: number }) {
  return (
    <>
      <Card className="px-4 py-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <SummaryStat label="总摄入" value={String(total)} unit="kcal" />
          <SummaryStat label="已记录" value={String(mealCount(entries))} unit="餐" />
          <SummaryStat label="蛋白质" value="达标" unit="估算" />
        </div>
      </Card>

      <div className="mt-3 overflow-hidden rounded-[18px] bg-surface shadow-card">
        {entries.map((entry, index) => (
          <button
            key={entry.id}
            className={`flex w-full items-center gap-3 px-3.5 py-3 text-left active:bg-black/[0.03] ${
              index > 0 ? "border-t border-black/5" : ""
            }`}
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] text-[20px]"
              style={entry.photo ? { background: entry.photo } : { background: "#F1F0EB" }}
            >
              {!entry.photo && entry.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-ink-900">{entry.name}</p>
              <p className="mt-0.5 truncate text-[11px] text-ink-400">
                {entry.meal} · {entry.time} · 来源 {entry.source}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[14px] font-bold text-ink-900">{entry.kcal}</p>
              <p className="text-[10px] text-ink-400">kcal</p>
            </div>
          </button>
        ))}
      </div>

      <button className="mt-3 flex w-full items-center justify-between rounded-[16px] bg-brand-50 px-3.5 py-3 text-left active:scale-[0.99]">
        <div>
          <p className="text-[13px] font-semibold text-brand-800">少记了一餐?</p>
          <p className="mt-0.5 text-[11px] text-brand-700/75">补一条记录,本期趋势会更准</p>
        </div>
        <span className="text-[12px] font-semibold text-brand-700">补记 ›</span>
      </button>
    </>
  );
}

function ViewTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-pill px-3.5 py-1 text-[12px] ${
        active ? "bg-surface font-semibold text-ink-900 shadow-card" : "text-ink-500"
      }`}
    >
      {label}
    </button>
  );
}

function DayPhotoWall({
  entries,
  onBack,
}: {
  entries: typeof todayEntries;
  onBack: () => void;
}) {
  return (
    <div>
      <Card className="px-3 py-3">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[14px] font-bold text-ink-900">当天照片</p>
            <p className="mt-0.5 text-[11px] text-ink-400">只看照片,编辑仍回到记录列表</p>
          </div>
          <button onClick={onBack} className="text-[12px] font-semibold text-brand-600">
            返回列表
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {entries.map((entry) => (
            <div key={entry.id} className="overflow-hidden rounded-[16px] bg-canvas">
              <div className="aspect-[4/3] w-full" style={{ background: entry.photo }} />
              <div className="px-2.5 py-2">
                <p className="truncate text-[12px] font-semibold text-ink-900">{entry.name}</p>
                <p className="mt-0.5 text-[10px] text-ink-400">
                  {entry.meal} · {entry.kcal} kcal
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function MonthPhotoWall({ offset }: { offset: number }) {
  const monthCells = monthPhotosForOffset(offset);
  const days = monthCells.filter((day) => day.day !== null && day.photos.length > 0);
  return (
    <div>
      <Card className="px-3 py-3">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[14px] font-bold text-ink-900">本月照片墙</p>
            <p className="mt-0.5 text-[11px] text-ink-400">按天看照片,用于回忆和复盘</p>
          </div>
          <span className="rounded-pill bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
            {days.length} 天
          </span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {monthCells.map((cell, index) => {
            if (cell.day === null) return <div key={index} className="aspect-[4/5]" />;
            const extra = cell.photos.length - 1;
            return (
              <div key={index} className="relative aspect-[4/5] overflow-hidden rounded-[9px] bg-black/[0.04]">
                {cell.photos.length > 0 ? (
                  <>
                    <div className="h-full w-full" style={{ background: cell.photos[0] }} />
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black/35 to-transparent" />
                    <span className="absolute left-1 top-0.5 text-[9px] font-bold text-white">{cell.day}</span>
                    {extra > 0 && (
                      <span className="absolute bottom-1 right-1 rounded bg-black/45 px-1 text-[9px] font-semibold text-white">
                        +{extra}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="absolute left-1 top-0.5 text-[9px] font-semibold text-ink-300">{cell.day}</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>
      <p className="mt-3 px-2 text-center text-[11px] leading-relaxed text-ink-400">
        照片墙只是回看入口;具体餐次、热量和编辑仍回到记录列表。
      </p>
    </div>
  );
}

function SummaryStat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div>
      <p className="text-[10px] text-ink-400">{label}</p>
      <p className="mt-0.5 text-[15px] font-bold text-ink-900">{value}</p>
      <p className="text-[10px] text-ink-400">{unit}</p>
    </div>
  );
}

function mealCount(entries: typeof todayEntries) {
  return new Set(entries.map((entry) => entry.meal)).size;
}

function entriesForOffset(offset: number) {
  if (offset === 0) return todayEntries;
  const count = 2 + (Math.abs(offset) % Math.min(4, todayEntries.length));
  return todayEntries.slice(0, count).map((entry, index) => ({
    ...entry,
    id: `${entry.id}-${offset}`,
    kcal: Math.max(80, entry.kcal + offset * 17 + index * 9),
  }));
}

function dayLabel(offset: number, fallback: string) {
  if (offset === 0) return fallback;
  const date = new Date(2026, 5, 5);
  date.setDate(date.getDate() + offset);
  return `${date.getMonth() + 1}月${date.getDate()}日记录`;
}

function monthLabel(offset: number) {
  let month = 5 + offset;
  let year = 2026;
  while (month < 0) {
    month += 12;
    year -= 1;
  }
  return `${year}年${month + 1}月记录`;
}

function monthPhotosForOffset(offset: number) {
  if (offset === 0) return diaryMonth;
  const shift = Math.abs(offset) % 5;
  return diaryMonth.map((cell, index) => {
    if (cell.day === null) return cell;
    const keep = (index + shift) % 6 !== 0;
    if (!keep) return { ...cell, photos: [], kcal: 0 };
    const photos = cell.photos.length > 0 ? cell.photos : diaryMonth[(index + shift + 3) % diaryMonth.length]?.photos ?? [];
    return {
      ...cell,
      photos: photos.slice(0, Math.max(1, Math.min(3, photos.length || 1))),
      kcal: cell.kcal ? Math.max(700, cell.kcal + offset * 23) : 900 + ((index * 97) % 700),
    };
  });
}
