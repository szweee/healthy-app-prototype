import { useEffect, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionValue,
  animate,
  type PanInfo,
} from "framer-motion";
import { meals, frequentFoods, recentSearches, type MealType } from "../data/mock";
import { STATIC } from "../anim";

// + 按钮几何(morph 起点,与右侧悬浮快捷按钮对齐)
const BTN = { size: 44, left: 273, bottom: 24, radius: 22, color: "#3FA17C" };
const SHEET_COLOR = "#F6F5F1";
const MED_H = 486;
const LRG_H = 744;

type Phase = "medium" | "large";
export type AddMode = "food" | "activity";
export type AddDateOption = "today" | "yesterday" | "beforeYesterday" | "custom";

export type AddTimeContext = {
  dateOption: AddDateOption;
  dateLabel: string;
  timeLabel: string;
};

const variants = {
  closed: {
    left: BTN.left,
    width: BTN.size,
    height: BTN.size,
    bottom: BTN.bottom,
    borderRadius: BTN.radius,
    backgroundColor: BTN.color,
    // 悬浮:紧实贴身暗影 + 一层下偏中距阴影(elevation,不发散)
    boxShadow:
      "0 2px 4px rgba(31,36,33,0.18), 0 6px 14px rgba(31,36,33,0.20)",
  },
  medium: {
    left: 0,
    width: 375,
    height: MED_H,
    bottom: 0,
    borderRadius: 28,
    backgroundColor: SHEET_COLOR,
    boxShadow: "0 -8px 40px rgba(31,36,33,0.18), 0 0px 0px rgba(47,133,104,0)",
  },
  large: {
    left: 0,
    width: 375,
    height: LRG_H,
    bottom: 0,
    borderRadius: 28,
    backgroundColor: SHEET_COLOR,
    boxShadow: "0 -8px 40px rgba(31,36,33,0.18), 0 0px 0px rgba(47,133,104,0)",
  },
};

// 展开/收起档位:利落,几乎不回弹
const openSpring = { type: "spring" as const, stiffness: 460, damping: 36 };
// 收回成加号:仅极轻微弹性
const closeSpring = { type: "spring" as const, stiffness: 460, damping: 34 };

export function QuickAddSheet({
  open,
  initialMeal,
  initialMode,
  initialTime,
  onOpen,
  onClose,
  onLogged,
  onAdjustMealTimes,
}: {
  open: boolean;
  initialMeal?: MealType;
  initialMode?: AddMode;
  initialTime?: AddTimeContext;
  onOpen: () => void;
  onClose: () => void;
  onLogged: (name: string) => void;
  onAdjustMealTimes?: () => void;
}) {
  const y = useMotionValue(0);
  const [phase, setPhase] = useState<Phase>("medium");
  const [meal, setMeal] = useState<MealType>("加餐");
  const [mode, setMode] = useState<AddMode>("food");
  const [time, setTime] = useState<AddTimeContext>(defaultTimeContext());
  const [focused, setFocused] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setPhase("medium");
      setMeal(initialMeal ?? inferCurrentMeal());
      setMode(initialMode ?? "food");
      setTime(initialTime ?? defaultTimeContext());
      setFocused(false);
      setTimeOpen(false);
      y.set(0);
    }
    // 关闭由 closeSheet 接管 y(带速度回弹),这里不再覆盖
  }, [open, initialMeal, initialMode, initialTime]);

  // 收回成加号:把松手时的拖拽速度灌进弹簧 → 先随惯性下坠一点再被弹回(抛物线 + 末端弹一下)
  const closeSheet = (velocity = 0) => {
    animate(y, 0, { type: "spring", stiffness: 460, damping: 33, velocity });
    onClose();
  };

  const goPhase = (p: Phase) => {
    setPhase(p);
    animate(y, 0, openSpring);
  };

  const expandFocus = () => {
    setPhase("large");
    setFocused(true);
    animate(y, 0, openSpring);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const dy = info.offset.y;
    const v = info.velocity.y;
    if (phase === "large") {
      if (dy > 220 || v > 1100) return closeSheet(v);
      if (dy > 70) {
        setFocused(false);
        return goPhase("medium");
      }
      return animate(y, 0, openSpring);
    }
    if (dy > 130 || v > 800) return closeSheet(v);
    if (dy < -70) return goPhase("large");
    return animate(y, 0, openSpring);
  };

  const target = open ? phase : "closed";

  return (
    <>
      {/* 蒙层(仅 open) */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute inset-0 z-40 bg-black/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => closeSheet(0)}
          />
        )}
      </AnimatePresence>

      {/* 持久 morph 元素:closed=+按钮,open=sheet。永不卸载,不会出现两个加号 */}
      <motion.div
        className="absolute z-50 overflow-hidden"
        style={{ y, position: "absolute" }}
        variants={variants}
        initial={STATIC ? target : "closed"}
        animate={target}
        transition={open ? openSpring : closeSpring}
        drag={open ? "y" : false}
        dragConstraints={{ top: 0, bottom: 1000 }}
        dragElastic={{ top: 0, bottom: 0.55 }}
        dragMomentum={false}
        onDragEnd={open ? onDragEnd : undefined}
        onClick={!open ? onOpen : undefined}
      >
        {/* sheet 内容(淡入) */}
        <motion.div
          className="absolute inset-0 flex flex-col"
          variants={{ closed: { opacity: 0 }, medium: { opacity: 1 }, large: { opacity: 1 } }}
          initial={STATIC ? target : "closed"}
          animate={target}
          transition={{ duration: 0.16, delay: open ? 0.08 : 0 }}
          style={{ pointerEvents: open ? "auto" : "none" }}
        >
          <Content
            meal={meal}
            setMeal={setMeal}
            mode={mode}
            setMode={setMode}
            time={time}
            setTime={setTime}
            timeOpen={timeOpen}
            setTimeOpen={setTimeOpen}
            phase={phase}
            focused={focused}
            onClose={() => closeSheet(0)}
            onExpandFocus={expandFocus}
            onLogged={onLogged}
            onAdjustMealTimes={onAdjustMealTimes}
          />
        </motion.div>

        {/* closed 态居中静态 +(淡出,不旋转)。叠一层顶部高光做出"凸起/悬浮"质感 */}
        <motion.div
          className="pointer-events-none absolute inset-0 flex items-center justify-center text-white"
          variants={{ closed: { opacity: 1 }, medium: { opacity: 0 }, large: { opacity: 0 } }}
          initial={STATIC ? target : "closed"}
          animate={target}
          transition={{ duration: 0.14, delay: open ? 0 : 0.06 }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 via-transparent to-black/10" />
          <svg className="relative" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 5.5v13M5.5 12h13" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </motion.div>
      </motion.div>
    </>
  );
}

function Content({
  meal,
  setMeal,
  mode,
  setMode,
  time,
  setTime,
  timeOpen,
  setTimeOpen,
  phase,
  focused,
  onClose,
  onExpandFocus,
  onLogged,
  onAdjustMealTimes,
}: {
  meal: MealType;
  setMeal: (m: MealType) => void;
  mode: AddMode;
  setMode: (m: AddMode) => void;
  time: AddTimeContext;
  setTime: (t: AddTimeContext) => void;
  timeOpen: boolean;
  setTimeOpen: (open: boolean) => void;
  phase: Phase;
  focused: boolean;
  onClose: () => void;
  onExpandFocus: () => void;
  onLogged: (name: string) => void;
  onAdjustMealTimes?: () => void;
}) {
  return (
    <LayoutGroup id="quick-add-layout">
      <motion.div layout className="relative flex h-full flex-col px-4 pt-2">
        {/* 细短把手 */}
        <div className="mx-auto mb-1 h-1 w-9 shrink-0 rounded-full bg-black/15" />

        {/* 顶部工具栏:关闭、日期上下文、饮食/运动切换 */}
        <motion.div layout className="mb-2 grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2">
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-ink-500 active:scale-90"
            aria-label="关闭"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
          <button
            onClick={() => setTimeOpen(!timeOpen)}
            className="rounded-pill bg-surface px-3 py-1.5 text-[12px] font-medium text-brand-600 shadow-card"
          >
            {time.dateLabel} · {time.timeLabel} <span>▾</span>
          </button>
          <div className="ml-auto flex rounded-pill bg-black/5 p-0.5">
            {(["food", "activity"] as AddMode[]).map((item) => (
              <button
                key={item}
                onClick={() => setMode(item)}
                className={`rounded-pill px-2.5 py-1 text-[12px] ${
                  mode === item ? "bg-surface font-semibold text-ink-900 shadow-card" : "text-ink-500"
                }`}
              >
                {item === "food" ? "饮食" : "运动"}
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence initial={false}>
          {timeOpen && (
            <motion.div
              layout
              key="time-options"
              initial={STATIC ? false : { opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mb-2 overflow-hidden"
            >
              <div className="grid grid-cols-4 gap-1.5 rounded-2xl bg-surface p-1.5 shadow-card">
                {timeOptions().map((option) => (
                  <motion.button
                    layout
                    key={option.dateOption}
                    onClick={() => {
                      setTime(option);
                      setTimeOpen(false);
                    }}
                    className={`rounded-[12px] px-1.5 py-2 text-[11px] font-semibold ${
                      time.dateOption === option.dateOption
                        ? "bg-brand-500 text-white"
                        : "bg-canvas text-ink-600"
                    }`}
                  >
                    {option.dateLabel}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {mode === "activity" ? (
          <ActivityAddContent phase={phase} time={time} onLogged={onLogged} />
        ) : (
          <>
        {/* 餐次分段 */}
        <div className="no-scrollbar -mr-1 flex shrink-0 gap-2 overflow-x-auto pb-1.5 fade-x">
          {meals.map((m) => (
            <button
              key={m.type}
              onClick={() => setMeal(m.type)}
              className={`flex shrink-0 items-center gap-1.5 rounded-pill px-3 py-1.5 text-[13px] ${
                meal === m.type ? "bg-brand-500 text-white" : "bg-surface text-ink-700 shadow-card"
              }`}
            >
              <span>{m.emoji}</span>
              {m.type}
            </button>
          ))}
        </div>

      {time.dateOption === "today" && (
        <MealSuggestion meal={meal} time={time} onAdjustMealTimes={onAdjustMealTimes} />
      )}

      <PrimaryFoodTools searching={focused} onLogged={onLogged} onSearch={onExpandFocus} />

      {/* 列表区 */}
      <div className="no-scrollbar mt-2.5 flex-1 overflow-y-auto pb-5">
        {!focused && (
          <>
            <p className="mb-1.5 px-1 text-[12px] font-semibold text-ink-700">常吃</p>
            <div className="no-scrollbar -mr-4 flex gap-1.5 overflow-x-auto pb-1 pr-4 fade-x">
              {frequentFoods.map((f) => (
                <button
                  key={f.name}
                  onClick={() => onLogged(f.name)}
                  className="flex h-9 shrink-0 items-center gap-1.5 rounded-pill bg-surface px-2.5 text-left shadow-card active:scale-95"
                >
                  <span className="text-[15px]">{f.emoji}</span>
                  <span className="max-w-[54px] truncate text-[12px] font-medium text-ink-900">{f.name}</span>
                  <span className="text-[10px] text-ink-400">{f.kcal}</span>
                </button>
              ))}
            </div>
          </>
        )}

        <p className={`mb-1.5 px-1 text-[13px] font-semibold text-ink-700 ${focused ? "mt-3" : "mt-2.5"}`}>
          {focused ? "搜索结果" : "最近记录"}
        </p>
        <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
          {recentSearches.map((r, i) => (
            <button
              key={r.name}
              onClick={() => onLogged(r.name)}
              className={`flex w-full items-center gap-3 px-3.5 py-3 text-left active:bg-black/[0.03] ${
                i > 0 ? "border-t border-black/5" : ""
              }`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-canvas text-[18px]">
                {r.emoji}
              </span>
              <div className="flex-1">
                <div className="text-[14px] font-medium text-ink-900">{r.name}</div>
                <div className="text-[12px] text-ink-400">
                  {r.kcal} kcal · 来源 {r.source}
                </div>
              </div>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </span>
            </button>
          ))}
        </div>
        {phase === "medium" && (
          <p className="mt-3 text-center text-[12px] text-ink-400">点搜索框展开 · 下滑收起</p>
        )}
      </div>
        </>
      )}
      </motion.div>
    </LayoutGroup>
  );
}

function PrimaryFoodTools({
  searching,
  onLogged,
  onSearch,
}: {
  searching: boolean;
  onLogged: (name: string) => void;
  onSearch: () => void;
}) {
  return (
    <motion.div layout className={searching ? "shrink-0" : "grid shrink-0 grid-cols-4 gap-1.5"}>
      <AnimatePresence mode="popLayout" initial={false}>
        {searching ? (
          <motion.button
            key="search-input"
            layout
            layoutId="quick-add-search"
            initial={STATIC ? false : { opacity: 0.88 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex h-[46px] w-full items-center gap-2 rounded-[14px] bg-surface px-3.5 text-left text-[14px] text-ink-400 shadow-card"
          >
            <SearchIcon />
            <span>输入食物名,如 牛肉面…</span>
          </motion.button>
        ) : (
          <>
            <ToolButton key="camera" label="拍照识别" primary onClick={() => onLogged("拍照识别的餐")}>
              <CameraIcon />
            </ToolButton>
            <ToolButton key="gallery" label="相册" onClick={() => onLogged("相册照片的餐")}>
              <GalleryIcon />
            </ToolButton>
            <ToolButton key="barcode" label="扫码" onClick={() => onLogged("条码商品")}>
              <BarcodeIcon />
            </ToolButton>
            <ToolButton key="search" label="搜索" layoutId="quick-add-search" onClick={onSearch}>
              <SearchIcon />
            </ToolButton>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ActivityAddContent({
  phase,
  time,
  onLogged,
}: {
  phase: Phase;
  time: AddTimeContext;
  onLogged: (name: string) => void;
}) {
  const types = ["步行", "跑步", "骑行", "游泳", "力量", "瑜伽", "球类", "其他"];
  return (
    <>
      <div className="no-scrollbar mt-1 flex-1 overflow-y-auto pb-[96px]">
        <p className="mb-2 px-1 text-[13px] font-semibold text-ink-700">运动类型</p>
        <div className="grid grid-cols-4 gap-2">
          {types.map((type, i) => (
            <button
              key={type}
              className={`rounded-2xl px-2 py-3 text-[12px] font-semibold shadow-card ${
                i === 4 ? "bg-brand-500 text-white" : "bg-surface text-ink-700"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl bg-surface px-3.5 py-3 shadow-card">
            <p className="text-[11px] text-ink-400">时长</p>
            <div className="mt-2 flex items-center justify-between">
              <button className="flex h-7 w-7 items-center justify-center rounded-full bg-canvas text-ink-500">−</button>
              <p className="text-[18px] font-bold text-ink-900">30</p>
              <button className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-brand-600">+</button>
            </div>
            <p className="mt-1 text-center text-[11px] text-ink-400">分钟</p>
          </div>
          <div className="rounded-2xl bg-surface px-3.5 py-3 shadow-card">
            <p className="text-[11px] text-ink-400">强度</p>
            <div className="mt-2 space-y-1">
              {["轻松", "中等", "较强"].map((level, i) => (
                <div
                  key={level}
                  className={`rounded-pill px-2 py-1 text-center text-[12px] font-medium ${
                    i === 1 ? "bg-brand-500 text-white" : "bg-canvas text-ink-500"
                  }`}
                >
                  {level}
                </div>
              ))}
            </div>
          </div>
        </div>

        {phase === "medium" && (
          <p className="mt-3 text-center text-[12px] text-ink-400">上滑查看更多类型 · 下滑收起</p>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 border-t border-black/5 bg-canvas/95 px-4 pb-6 pt-3 backdrop-blur">
        <div className="mb-2 rounded-2xl bg-brand-50 px-3 py-2">
          <p className="text-[13px] font-semibold text-brand-700">估算消耗约 120 kcal</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-brand-700/75">
            保存到{time.dateLabel} · {time.timeLabel}。基于体重、运动类型、时长和强度估算,保存前会检查是否和健康 App 记录重复。
          </p>
        </div>
        <button
          onClick={() => onLogged("力量训练 30 分钟")}
          className="flex w-full items-center justify-center rounded-2xl bg-brand-500 py-3 text-[14px] font-semibold text-white shadow-card active:scale-95"
        >
          保存运动记录
        </button>
      </div>
    </>
  );
}

function MealSuggestion({
  meal,
  time,
  onAdjustMealTimes,
}: {
  meal: MealType;
  time: AddTimeContext;
  onAdjustMealTimes?: () => void;
}) {
  const suggestion = mealSuggestion(meal, time);
  return (
    <div className="mb-2 flex shrink-0 items-center justify-between gap-2 rounded-[12px] bg-brand-50 px-2.5 py-1.5">
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold text-brand-700">{suggestion.title}</p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <p className="truncate text-[10px] text-brand-700/70">{suggestion.subtitle}</p>
          {onAdjustMealTimes && (
            <button
              onClick={onAdjustMealTimes}
              className="shrink-0 text-[10px] font-semibold text-brand-700 underline decoration-brand-300 underline-offset-2"
            >
              调整餐次时间
            </button>
          )}
        </div>
      </div>
      <div className="flex shrink-0 gap-1">
        {suggestion.chips.slice(0, 2).map((chip) => (
          <button
            key={chip}
            className="rounded-pill bg-white/70 px-1.5 py-0.5 text-[9px] font-medium text-brand-700"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}

function mealSuggestion(meal: MealType, time: AddTimeContext) {
  if (time.dateOption !== "today") {
    return {
      title: `补记${time.dateLabel}${meal}`,
      subtitle: "按实际吃的记录即可",
      chips: meal === "早餐" ? ["鸡蛋", "酸奶", "燕麦", "豆浆"] : ["常吃", "拍照", "搜索", "扫码"],
    };
  }

  if (meal === "早餐") {
    return {
      title: "早餐建议 300-420 kcal",
      subtitle: "优先吃够一份蛋白质",
      chips: ["鸡蛋", "酸奶", "燕麦", "豆浆"],
    };
  }
  if (meal === "午餐") {
    return {
      title: "午餐建议 450-600 kcal",
      subtitle: "蛋白质和蔬菜优先",
      chips: ["沙拉碗", "鸡胸肉", "米饭", "豆腐"],
    };
  }
  if (meal === "晚餐") {
    return {
      title: "晚餐建议 350-500 kcal",
      subtitle: "余量不多时先选蛋白质和蔬菜",
      chips: ["鱼", "鸡蛋", "豆腐", "蔬菜"],
    };
  }
  return {
    title: "加餐随时可记",
    subtitle: "轻量加餐 120-220 kcal",
    chips: ["酸奶", "鸡蛋", "牛奶", "水果"],
  };
}

function inferCurrentMeal(): MealType {
  const hour = new Date().getHours();
  if (hour < 10) return "早餐";
  if (hour < 14) return "午餐";
  if (hour < 17) return "加餐";
  if (hour < 21) return "晚餐";
  return "加餐";
}

function defaultTimeContext(): AddTimeContext {
  return {
    dateOption: "today",
    dateLabel: "今天",
    timeLabel: currentTimeLabel(),
  };
}

function timeOptions(): AddTimeContext[] {
  return [
    { dateOption: "today", dateLabel: "今天", timeLabel: currentTimeLabel() },
    { dateOption: "yesterday", dateLabel: "昨天", timeLabel: "补记" },
    { dateOption: "beforeYesterday", dateLabel: "前天", timeLabel: "补记" },
    { dateOption: "custom", dateLabel: "选日期", timeLabel: "补记" },
  ];
}

function currentTimeLabel() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function ToolButton({
  label,
  onClick,
  children,
  primary,
  layoutId,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  primary?: boolean;
  layoutId?: string;
}) {
  return (
    <motion.button
      layout
      layoutId={layoutId}
      exit={STATIC ? undefined : { opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      onClick={onClick}
      className={`flex min-h-[46px] flex-col items-center justify-center gap-0.5 rounded-[14px] px-1 py-1.5 text-[11px] font-semibold shadow-card active:scale-95 ${
        primary ? "bg-brand-500 text-white" : "bg-surface text-ink-700"
      }`}
    >
      <span className={primary ? "text-white" : "text-brand-600"}>{children}</span>
      {label}
    </motion.button>
  );
}

function CameraIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="7" width="18" height="13" rx="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="13.5" r="3.2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 7l1.5-2.5h5L16 7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="4.5" width="17" height="15" rx="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="9" cy="10" r="1.8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 17l4.5-4 3 2.5L16 12l3 3.5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function BarcodeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 7V5a1 1 0 011-1h2M20 7V5a1 1 0 00-1-1h-2M4 17v2a1 1 0 001 1h2M20 17v2a1 1 0 01-1 1h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 8v8M10 8v8M13 8v8M17 8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
