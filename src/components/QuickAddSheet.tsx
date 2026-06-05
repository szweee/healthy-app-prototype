import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  animate,
  type PanInfo,
} from "framer-motion";
import { meals, frequentFoods, recentSearches, type MealType } from "../data/mock";
import { STATIC } from "../anim";

// + 按钮几何(morph 起点,与 TabBar 中间留空位对齐)
const BTN = { size: 46, bottom: 24, radius: 23, color: "#3FA17C" };
const SHEET_COLOR = "#F6F5F1";
const MED_H = 486;
const LRG_H = 744;

type Phase = "medium" | "large";

const variants = {
  closed: {
    width: BTN.size,
    height: BTN.size,
    bottom: BTN.bottom,
    borderRadius: BTN.radius,
    backgroundColor: BTN.color,
    // 悬浮:紧实贴身暗影 + 一层下偏中距阴影(elevation,不发散)
    boxShadow:
      "0 2px 4px rgba(31,36,33,0.24), 0 8px 16px rgba(31,36,33,0.30)",
  },
  medium: {
    width: 375,
    height: MED_H,
    bottom: 0,
    borderRadius: 28,
    backgroundColor: SHEET_COLOR,
    boxShadow: "0 -8px 40px rgba(31,36,33,0.18), 0 0px 0px rgba(47,133,104,0)",
  },
  large: {
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
  onOpen,
  onClose,
  onLogged,
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onLogged: (name: string) => void;
}) {
  const y = useMotionValue(0);
  const [phase, setPhase] = useState<Phase>("medium");
  const [meal, setMeal] = useState<MealType>("加餐");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (open) {
      setPhase("medium");
      setFocused(false);
      y.set(0);
    }
    // 关闭由 closeSheet 接管 y(带速度回弹),这里不再覆盖
  }, [open]);

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
    setFocused(true);
    goPhase("large");
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const dy = info.offset.y;
    const v = info.velocity.y;
    if (phase === "large") {
      if (dy > 220 || v > 1100) return closeSheet(v);
      if (dy > 70) return goPhase("medium");
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
        style={{ left: "50%", x: "-50%", y, position: "absolute" }}
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
            phase={phase}
            focused={focused}
            onClose={() => closeSheet(0)}
            onExpandFocus={expandFocus}
            onLogged={onLogged}
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
          <svg className="relative" width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </motion.div>
      </motion.div>
    </>
  );
}

function Content({
  meal,
  setMeal,
  phase,
  focused,
  onClose,
  onExpandFocus,
  onLogged,
}: {
  meal: MealType;
  setMeal: (m: MealType) => void;
  phase: Phase;
  focused: boolean;
  onClose: () => void;
  onExpandFocus: () => void;
  onLogged: (name: string) => void;
}) {
  return (
    <div className="relative flex h-full flex-col px-4 pt-2">
      {/* 细短把手 */}
      <div className="mx-auto mb-1 h-1 w-9 shrink-0 rounded-full bg-black/15" />

      {/* 标题 + 静态关闭× */}
      <div className="mb-2.5 flex shrink-0 items-center justify-between">
        <span className="text-[17px] font-bold text-ink-900">记一笔</span>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-ink-500 active:scale-90"
          aria-label="关闭"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* 餐次分段 */}
      <div className="no-scrollbar -mr-1 flex shrink-0 gap-2 overflow-x-auto pb-2 fade-x">
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

      {/* 搜索框 */}
      <button
        onClick={onExpandFocus}
        className="mt-1.5 flex shrink-0 items-center gap-2 rounded-2xl bg-surface px-3.5 py-3 text-left shadow-card"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="#9AA39D" strokeWidth="2" />
          <path d="M16.5 16.5L21 21" stroke="#9AA39D" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="text-[14px] text-ink-400">
          {focused ? "输入食物名,如 牛肉面…" : "搜索食物 / 品牌 / 菜名"}
        </span>
      </button>

      {/* 列表区 */}
      <div className="no-scrollbar mt-3 flex-1 overflow-y-auto pb-[96px]">
        {!focused && (
          <>
            <p className="mb-2 px-1 text-[13px] font-semibold text-ink-700">常吃 · 一键记</p>
            <div className="no-scrollbar -mr-4 flex gap-2.5 overflow-x-auto pb-1 pr-4 fade-x">
              {frequentFoods.map((f) => (
                <button
                  key={f.name}
                  onClick={() => onLogged(f.name)}
                  className="flex w-[84px] shrink-0 flex-col items-center gap-1 rounded-2xl bg-surface px-2 py-3 shadow-card active:scale-95"
                >
                  <span className="text-[26px]">{f.emoji}</span>
                  <span className="line-clamp-1 text-[12px] font-medium text-ink-900">{f.name}</span>
                  <span className="text-[11px] text-ink-400">{f.kcal} kcal</span>
                </button>
              ))}
            </div>
          </>
        )}

        <p className="mb-1.5 mt-4 px-1 text-[13px] font-semibold text-ink-700">
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

      {/* 底部常驻工具栏 */}
      <div className="absolute inset-x-0 bottom-0 border-t border-black/5 bg-canvas/95 px-4 pb-6 pt-3 backdrop-blur">
        <div className="grid grid-cols-3 gap-2.5">
          <ToolButton label="拍照" onClick={() => onLogged("拍照识别的餐")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="7" width="18" height="13" rx="3" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="13.5" r="3.2" stroke="currentColor" strokeWidth="2" />
              <path d="M8 7l1.5-2.5h5L16 7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </ToolButton>
          <ToolButton label="相册" onClick={() => onLogged("相册照片的餐")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3.5" y="4.5" width="17" height="15" rx="3" stroke="currentColor" strokeWidth="2" />
              <circle cx="9" cy="10" r="1.8" stroke="currentColor" strokeWidth="1.8" />
              <path d="M5 17l4.5-4 3 2.5L16 12l3 3.5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </ToolButton>
          <ToolButton label="扫码" onClick={() => onLogged("条码商品")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 7V5a1 1 0 011-1h2M20 7V5a1 1 0 00-1-1h-2M4 17v2a1 1 0 001 1h2M20 17v2a1 1 0 01-1 1h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M7 8v8M10 8v8M13 8v8M17 8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </ToolButton>
        </div>
      </div>
    </div>
  );
}

function ToolButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-2xl bg-surface py-2.5 text-[13px] font-medium text-ink-700 shadow-card active:scale-95"
    >
      <span className="text-brand-600">{children}</span>
      {label}
    </button>
  );
}
