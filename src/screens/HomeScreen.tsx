import { useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { CalorieRing } from "../components/CalorieRing";
import { MacroBars } from "../components/MacroBars";
import { Card, SectionTitle } from "../components/Card";
import type { AddTimeContext } from "../components/QuickAddSheet";
import {
  daySummary,
  goalProfiles,
  macros,
  meals,
  todayBudget,
  type GoalKey,
  type MealType,
} from "../data/mock";

const D = 28; // 横向位移幅度(一小段)

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? -D : D, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? D : -D, opacity: 0 }),
};

export function HomeScreen({
  goal,
  onAddMeal,
  onAddActivity,
  onOpenRecords,
  onAdjustMealTimes,
}: {
  goal: GoalKey;
  onAddMeal?: (meal: MealType, time?: AddTimeContext) => void;
  onAddActivity?: (time?: AddTimeContext) => void;
  onOpenRecords?: (title: string, subtitle?: string, empty?: boolean, scope?: "day" | "month") => void;
  onAdjustMealTimes?: () => void;
}) {
  const [offset, setOffset] = useState(0); // 0=今天,负数=过去
  const [dir, setDir] = useState(1); // 1=看更早, -1=看更近
  const [showGoalInfo, setShowGoalInfo] = useState(false);
  const [showActivityDetail, setShowActivityDetail] = useState(false);
  const day = daySummary(offset);
  const addTime = addTimeContext(day.label, offset);
  const profile = goalProfiles[goal];
  const proteinRemaining = Math.max(macros.protein.target - macros.protein.value, 0);
  const nextMeal = getNextMeal(day.entries);
  const stepPct = Math.min(100, Math.round((day.steps / day.stepGoal) * 100));
  const nextStep = getNextStepTip({
    goal,
    nextMeal,
    consumed: day.consumed,
    target: profile.target,
    proteinRemaining,
    min: profile.min,
    max: profile.max,
  });
  const recordSummary = getRecordSummary(day.entries);

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
      {/* 顶部:今日页不放日期导航,左右滑用于轻量回看 */}
      <div className="mb-2 mt-0.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[21px] font-bold text-ink-900">{day.greeting}</h1>
            <div className="mt-0.5 flex items-center gap-2">
              <p className="text-[11px] text-ink-400">
                {offset === 0 ? "左右滑动可回看最近记录" : "正在回看历史记录"}
              </p>
              {offset !== 0 && (
                <button
                  onClick={() => {
                    setDir(-1);
                    setOffset(0);
                  }}
                  className="text-[11px] font-medium text-brand-600"
                >
                  回到今天
                </button>
              )}
            </div>
          </div>
          <div className="shrink-0 whitespace-nowrap rounded-pill bg-brand-50 px-3 py-1 text-[12px] font-medium text-brand-700">
            {profile.badge}
          </div>
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
            <Card className="mt-2.5 flex flex-col items-center px-4 py-3">
              <div className="mb-2 flex w-full items-center justify-between">
                <div>
                  <p className="text-[12px] text-ink-400">今日目标</p>
                  <p className="text-[15px] font-semibold text-ink-900">
                    {goal === "maintain" ? `${profile.min}-${profile.max}` : profile.target} kcal
                  </p>
                </div>
                <button
                  onClick={() => setShowGoalInfo(true)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-canvas text-[14px] font-semibold text-ink-400 active:bg-black/5"
                  aria-label="查看今日目标说明"
                >
                  i
                </button>
              </div>
              <CalorieRing
                key={offset}
                consumed={day.consumed}
                target={profile.target}
                mode={profile.ringMode}
                min={profile.min}
                max={profile.max}
                size={156}
              />
              <p className="mt-2 max-w-[260px] text-center text-[12px] leading-snug text-ink-500">
                {nextStep}
              </p>
              <div className="mt-2.5 grid w-full grid-cols-3 divide-x divide-black/5 text-center">
                <Stat label="已摄入" value={day.consumed} unit="kcal" />
                <Stat label="蛋白质还差" value={proteinRemaining} unit="g" accent />
                <Stat label="今日活动" value={day.burnedActive} unit="kcal" />
              </div>
              <div className="mt-2.5 w-full">
                <MacroBars compact />
              </div>
            </Card>

            {/* HealthKit 活动卡 */}
            <div className="mt-2.5 grid grid-cols-2 gap-2.5">
              <Card className="px-3.5 py-3">
                <div className="flex items-baseline justify-between">
                  <p className="text-[12px] text-ink-400">今日步数</p>
                  <p className="text-[11px] text-ink-400">目标 {day.stepGoal.toLocaleString()}</p>
                </div>
                <p className="mt-0.5 text-[18px] font-bold text-ink-900">{day.steps.toLocaleString()}</p>
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-black/[0.06]">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${stepPct}%` }} />
                </div>
                <p className="mt-1 text-[11px] text-brand-600">来自 健康 App · {stepPct}%</p>
              </Card>
              <Card className="px-3.5 py-3" onClick={() => setShowActivityDetail(true)}>
                <div className="flex items-baseline justify-between">
                  <p className="text-[12px] text-ink-400">今日活动</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddActivity?.(addTime);
                    }}
                    className="text-[11px] font-medium text-brand-600"
                  >
                    + 补录
                  </button>
                </div>
                <p className="mt-0.5 text-[18px] font-bold text-ink-900">
                  {day.burnedActive}
                  <span className="text-[12px] font-medium text-ink-400"> kcal</span>
                </p>
                <p className="text-[11px] leading-snug text-ink-400">步行 210 · 训练 110</p>
              </Card>
            </div>

            {offset === 0 && (
              <div className="mt-2.5">
                <QuickRecordStrip
                  goal={goal}
                  consumed={day.consumed}
                  target={profile.target}
                  onAddMeal={onAddMeal}
                  onAddActivity={onAddActivity}
                  onAdjustMealTimes={onAdjustMealTimes}
                  time={addTime}
                  entries={day.entries}
                />
              </div>
            )}

            <button
              onClick={() =>
                onOpenRecords?.(
                  offset === 0 ? "今日记录" : `${day.label}记录`,
                  recordSummary.count > 0
                    ? `${recordSummary.meals} · ${recordSummary.kcal} kcal`
                    : "这天还没有饮食记录",
                  recordSummary.count === 0,
                  "day"
                )
              }
              className="mt-3 flex w-full items-center justify-between gap-3 rounded-[14px] bg-surface px-3.5 py-3 text-left shadow-card active:scale-[0.99]"
            >
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-ink-900">
                  {recordSummary.count > 0
                    ? `${offset === 0 ? "今日" : "当天"}已记录 ${recordSummary.mealCount} 餐`
                    : `${offset === 0 ? "今日" : "当天"}还没有饮食记录`}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-ink-400">
                  {recordSummary.count > 0
                    ? `${recordSummary.meals} · ${recordSummary.kcal} kcal`
                    : offset === 0
                      ? "从上方快捷入口开始记录"
                      : "可从当天记录详情补记"}
                </p>
              </div>
              <span className="shrink-0 rounded-pill bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-700">
                {recordSummary.count > 0 ? "查看全部" : "去记录"} ›
              </span>
            </button>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <p className="mt-5 px-2 text-center text-[11px] leading-relaxed text-ink-400">
        数据仅供参考,不构成医疗建议
      </p>

      <AnimatePresence>
        {showGoalInfo && (
          <motion.div
            className="absolute inset-0 z-[70] flex items-center justify-center bg-ink-900/25 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowGoalInfo(false)}
          >
            <motion.div
              className="w-full rounded-[24px] bg-white p-5 shadow-float"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[17px] font-bold text-ink-900">今日目标说明</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-500">
                    {profile.formula}
                  </p>
                </div>
                <button
                  onClick={() => setShowGoalInfo(false)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canvas text-[18px] text-ink-400"
                  aria-label="关闭目标说明"
                >
                  ×
                </button>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <MiniMetric label="基础代谢" value={todayBudget.bmr} />
                <MiniMetric label="日常总消耗" value={todayBudget.tdee} />
                <MiniMetric
                  label={goal === "gain" ? "热量盈余" : goal === "maintain" ? "目标区间" : "热量缺口"}
                  value={
                    goal === "gain"
                      ? todayBudget.surplus
                      : goal === "maintain"
                        ? `${profile.min}-${profile.max}`
                        : todayBudget.deficit
                  }
                />
              </div>
              <p className="mt-4 text-[12px] leading-relaxed text-ink-400">
                这是基于年龄、性别、身高、体重和活动水平的估算值,后续可根据体重趋势和记录情况调整。
                活动消耗会单独展示,默认不直接加回今日预算。
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showActivityDetail && (
          <motion.div
            className="absolute inset-0 z-[70] overflow-y-auto bg-canvas px-4 pb-28 pt-14"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setShowActivityDetail(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[22px] text-ink-600 shadow-card"
                aria-label="返回首页"
              >
                ‹
              </button>
              <p className="text-[15px] font-semibold text-ink-900">今日活动详情</p>
              <div className="h-9 w-9" />
            </div>

            <Card className="px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[12px] text-ink-400">今日总活动消耗</p>
                  <p className="mt-1 text-[34px] font-bold leading-none text-ink-900">
                    {day.burnedActive}
                    <span className="ml-1 text-[13px] font-medium text-ink-400">kcal</span>
                  </p>
                </div>
                <span className="rounded-pill bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-700">
                  健康同步 + 手动记录
                </span>
              </div>
              <p className="mt-3 text-[12px] leading-relaxed text-ink-500">
                健康同步为主,手动记录单独列出,避免重复计算。
              </p>
            </Card>

            <div className="mt-4">
              <SectionTitle>来源明细</SectionTitle>
              <div className="space-y-2.5">
                <ActivityRow title="步行与日常活动" meta={`${day.steps.toLocaleString()} 步 · 约 4.8 km`} kcal={210} source="健康同步" />
                <ActivityRow title="力量训练" meta="28 分钟 · 中等强度" kcal={110} source="手动记录" />
              </div>
            </div>

            <Card className="mt-4 px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] font-semibold text-ink-900">没有同步到运动？</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-500">
                    可补记训练或日常活动,保存前会检查是否与健康数据重复。
                  </p>
                </div>
                <button className="shrink-0 rounded-pill bg-brand-50 px-3 py-1.5 text-[12px] font-semibold text-brand-700">
                  补录一项 ›
                </button>
              </div>
            </Card>

            <div className="mt-4">
              <SectionTitle>未同步时</SectionTitle>
              <Card className="mb-2.5 px-4 py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-semibold text-ink-900">健康数据未同步</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-ink-500">
                      步数和活动消耗会暂时隐藏,首页仍保留饮食记录、今日目标和蛋白质建议。
                    </p>
                  </div>
                  <span className="shrink-0 rounded-pill bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-700">
                    连接
                  </span>
                </div>
              </Card>
              <Card className="px-4 py-3.5">
                <p className="text-[13px] font-semibold text-ink-900">连接健康 App 或手动记录</p>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-500">
                  没有权限时,饮食记录和今日预算照常可用。活动消耗会显示为未同步,也可以用常见类型 + 时长 + 强度粗略补录。
                </p>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActivityRow({
  title,
  meta,
  kcal,
  source,
}: {
  title: string;
  meta: string;
  kcal: number;
  source: string;
}) {
  return (
    <Card className="px-3.5 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[14px] font-semibold text-ink-900">{title}</p>
          <p className="mt-0.5 text-[11px] text-ink-400">{meta}</p>
        </div>
        <div className="text-right">
          <p className="text-[14px] font-bold text-ink-900">{kcal} kcal</p>
          <p className="mt-0.5 text-[10px] text-brand-600">{source}</p>
        </div>
      </div>
    </Card>
  );
}

function getRecordSummary(entries: { meal: MealType; kcal: number }[]) {
  const mealOrder: MealType[] = ["早餐", "午餐", "晚餐", "加餐"];
  const recordedMeals = mealOrder.filter((meal) => entries.some((entry) => entry.meal === meal));
  return {
    count: entries.length,
    mealCount: recordedMeals.length,
    meals: recordedMeals.join("、"),
    kcal: entries.reduce((sum, entry) => sum + entry.kcal, 0),
  };
}

function QuickRecordStrip({
  goal,
  consumed,
  target,
  onAddMeal,
  onAddActivity,
  onAdjustMealTimes,
  time,
  entries,
}: {
  goal: GoalKey;
  consumed: number;
  target: number;
  onAddMeal?: (meal: MealType, time?: AddTimeContext) => void;
  onAddActivity?: (time?: AddTimeContext) => void;
  onAdjustMealTimes?: () => void;
  time: AddTimeContext;
  entries: { meal: MealType }[];
}) {
  const suggestion = inferQuickRecordMeal(entries);
  const [suggestionLow, suggestionHigh] = mealKcalRange(goal, suggestion.meal, target - consumed);
  const suggestionBadge = suggestion.missedMeal
    ? `补${suggestion.missedMeal} · 记${suggestion.meal}`
    : suggestion.meal === "加餐"
      ? "有吃再记"
      : `${suggestion.badge} ${suggestionLow}-${suggestionHigh} kcal`;
  return (
    <div className="rounded-[14px] bg-surface px-2.5 py-2.5 shadow-card">
      <div className="mb-2 flex items-start justify-between gap-2 px-0.5">
        <div>
          <p className="text-[12px] font-semibold text-ink-800">{suggestion.title}</p>
          {onAdjustMealTimes && (
            <button
              onClick={onAdjustMealTimes}
              className="mt-0.5 text-[10px] font-semibold text-brand-600"
            >
              调整餐次时间
            </button>
          )}
        </div>
        <span className="rounded-pill bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700">
          {suggestionBadge}
        </span>
      </div>
      <div className="grid grid-cols-5 gap-1">
        {meals.map((m) => {
          const [low, high] = mealKcalRange(goal, m.type, target - consumed);
          const recorded = entries.some((entry) => entry.meal === m.type);
          const recommended = m.type === suggestion.meal && suggestion.meal !== "加餐";
          const snackCandidate = m.type === "加餐" && suggestion.meal === "加餐";
          const missed = m.type === suggestion.missedMeal;
          const status = quickRecordStatus(m.type, recorded, recommended, missed, snackCandidate, low, high);
          return (
            <button
              key={m.type}
              onClick={() => onAddMeal?.(m.type, time)}
              className={`relative min-h-[48px] rounded-[11px] px-1 py-1 text-center ring-1 ${
                recommended
                  ? "bg-brand-50 text-brand-700 ring-brand-500/30"
                  : missed
                    ? "bg-[#FFF7E8] text-[#9A6A19] ring-[#E8B04B]/30"
                    : snackCandidate
                      ? "bg-canvas text-ink-700 ring-black/5"
                    : recorded
                      ? "bg-white/55 text-ink-400 ring-black/5"
                      : "bg-canvas text-ink-700 ring-transparent"
              }`}
            >
              {recorded && (
                <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-ink-300 text-[9px] font-bold leading-none text-white">
                  ✓
                </span>
              )}
              {recommended && !recorded && (
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-brand-500" />
              )}
              {missed && !recommended && (
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#E8B04B]" />
              )}
              <div className={`text-[14px] leading-none ${recorded ? "opacity-55" : ""}`}>{m.emoji}</div>
              <div className="mt-0.5 text-[10px] font-semibold">{m.type}</div>
              <p className={`mt-0.5 text-[9px] ${recommended ? "text-brand-600" : missed ? "text-[#9A6A19]" : "text-ink-400"}`}>
                {status}
              </p>
            </button>
          );
        })}
        <button
          onClick={() => onAddActivity?.(time)}
          className="min-h-[44px] rounded-[11px] bg-canvas px-1 py-1 text-center text-ink-700"
        >
          <div className="text-[14px] leading-none">🏃</div>
          <div className="mt-0.5 text-[10px] font-semibold">运动</div>
          <p className="mt-0.5 text-[9px] text-ink-400">补录</p>
        </button>
      </div>
    </div>
  );
}

function inferQuickRecordMeal(entries: { meal: MealType }[]) {
  const recorded = new Set(entries.map((entry) => entry.meal));
  const hour = new Date().getHours() + new Date().getMinutes() / 60;
  const hasAllMeals = ["早餐", "午餐", "晚餐"].every((meal) => recorded.has(meal as MealType));

  if (hasAllMeals) {
    return { meal: "加餐" as MealType, title: "三餐已记", badge: "有吃再记", reason: "三餐已记" };
  }
  if (!recorded.has("早餐") && hour < 10.5) {
    return { meal: "早餐" as MealType, title: "接下来可以记", badge: "推荐早餐", reason: "现在适合早餐" };
  }
  if (recorded.has("早餐") && hour < 10.5 && !recorded.has("午餐")) {
    return { meal: "加餐" as MealType, title: "早餐已记", badge: "午餐还早 · 有吃再记", reason: "早餐已记" };
  }
  if (!recorded.has("午餐") && hour >= 10.5 && hour < 14) {
    return { meal: "午餐" as MealType, title: "接下来可以记", badge: "推荐午餐", reason: "快到午餐" };
  }
  if (recorded.has("午餐") && hour < 16.5 && !recorded.has("晚餐")) {
    return { meal: "加餐" as MealType, title: "午餐已记", badge: "晚餐还早 · 有吃再记", reason: "午餐已记" };
  }
  if (!recorded.has("午餐") && hour >= 14 && hour < 16.5) {
    return {
      meal: "加餐" as MealType,
      missedMeal: "午餐" as MealType,
      title: "午餐还没记录",
      badge: "先补午餐 · 有吃再记",
      reason: "午餐缺口",
    };
  }
  if (!recorded.has("晚餐") && hour >= 16.5 && hour < 21) {
    return { meal: "晚餐" as MealType, title: "接下来可以记", badge: "推荐晚餐", reason: "快到晚餐" };
  }
  if (!recorded.has("晚餐") && hour >= 21) {
    return {
      meal: "加餐" as MealType,
      missedMeal: "晚餐" as MealType,
      title: "晚餐还没记录",
      badge: "先补晚餐 · 有吃再记",
      reason: "晚餐缺口",
    };
  }
  return { meal: "加餐" as MealType, title: "现在没有必须补的正餐", badge: "有吃再记", reason: "随时可记" };
}

function quickRecordStatus(
  meal: MealType,
  recorded: boolean,
  recommended: boolean,
  missed: boolean,
  snackCandidate: boolean,
  low: number,
  high: number,
) {
  if (recommended) return "推荐";
  if (missed) return "补记";
  if (recorded) return "已记";
  if (snackCandidate) return "有吃再记";
  if (meal === "加餐") return "随时";
  return `${low}-${high}`;
}

function getNextStepTip({
  goal,
  nextMeal,
  consumed,
  target,
  proteinRemaining,
  min,
  max,
}: {
  goal: GoalKey;
  nextMeal: MealType;
  consumed: number;
  target: number;
  proteinRemaining: number;
  min?: number;
  max?: number;
}) {
  const remaining = target - consumed;
  const [low, high] = mealKcalRange(goal, nextMeal, remaining);
  const options = foodOptions(goal, nextMeal);
  const proteinCopy =
    nextMeal === "早餐"
      ? "本餐带一份蛋白质"
      : proteinRemaining > 8
        ? `蛋白质还差 ${proteinRemaining}g`
        : "蛋白质基本达标";

  if (goal === "gain") {
    if (remaining > 250) {
      return `${nextMeal}建议 ${low}-${high} kcal,${proteinCopy}。可选${options},训练日加一份主食。`;
    }
    return "今天能量基本达标,若训练后饿,可选酸奶、鸡蛋或牛奶。";
  }

  if (goal === "maintain") {
    const bandLow = min ?? target * 0.9;
    const bandHigh = max ?? target * 1.1;
    if (consumed < bandLow) {
      return `${nextMeal}建议 ${low}-${high} kcal,正常吃就好。可选${options}。`;
    }
    if (consumed <= bandHigh) return "今天在维持区间内,下一餐正常吃,留意蔬菜和蛋白质。";
    return "今天略高于维持区间,下一餐清淡些即可,不用刻意补偿。";
  }

  if (remaining > 150) {
    const prefix = nextMeal === "加餐" ? "若晚些饿,加餐" : nextMeal;
    return `${prefix}建议 ${low}-${high} kcal,${proteinCopy}。可选${options}。`;
  }
  if (remaining >= 0) return "今天余量不多,下一餐以蛋白质和蔬菜为主。";
  return "今天已经略超,不用补偿运动,明天回到节奏就好。";
}

function mealPrompt(meal: MealType, low: number, high: number) {
  if (meal === "早餐") return `建议 ${low}-${high} kcal · 带一份蛋白质`;
  if (meal === "加餐") return "随时可记 · 轻量补充";
  return `建议 ${low}-${high} kcal`;
}

function foodOptions(goal: GoalKey, meal: MealType) {
  if (meal === "早餐") return "鸡蛋、酸奶、豆浆或燕麦";
  if (meal === "加餐") return goal === "gain" ? "酸奶、牛奶、香蕉或三明治" : "无糖酸奶、鸡蛋、牛奶或豆腐";
  if (goal === "gain") return "牛肉、鱼、鸡蛋、豆腐或米饭";
  if (goal === "maintain") return "鱼、鸡蛋、豆腐、瘦肉和蔬菜";
  return "鱼、鸡蛋、豆腐或鸡胸肉";
}

function getNextMeal(entries: { meal: MealType }[]): MealType {
  const order: MealType[] = ["早餐", "午餐", "晚餐", "加餐"];
  return order.find((meal) => !entries.some((entry) => entry.meal === meal)) ?? "加餐";
}

function mealKcalRange(goal: GoalKey, meal: MealType, remaining: number): [number, number] {
  const base: Record<GoalKey, Record<MealType, [number, number]>> = {
    deficit: {
      早餐: [300, 420],
      午餐: [450, 600],
      晚餐: [350, 500],
      加餐: [120, 220],
    },
    maintain: {
      早餐: [350, 500],
      午餐: [550, 750],
      晚餐: [500, 700],
      加餐: [150, 280],
    },
    gain: {
      早餐: [450, 650],
      午餐: [700, 900],
      晚餐: [650, 850],
      加餐: [250, 400],
    },
  };
  const [low, high] = base[goal][meal];
  if (goal !== "deficit" || remaining > high) return [low, high];
  if (remaining <= 0) return [low, high];
  return [Math.min(low, remaining), Math.max(Math.min(high, remaining), Math.min(low, remaining))];
}

function addTimeContext(label: string, offset: number): AddTimeContext {
  if (offset === 0) {
    const now = new Date();
    return {
      dateOption: "today",
      dateLabel: "今天",
      timeLabel: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
    };
  }
  if (offset === -1) return { dateOption: "yesterday", dateLabel: "昨天", timeLabel: "补记" };
  if (offset === -2) return { dateOption: "beforeYesterday", dateLabel: "前天", timeLabel: "补记" };
  return { dateOption: "custom", dateLabel: label, timeLabel: "补记" };
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
      <p className="text-[10px] text-ink-400">{label}</p>
      <p className={`mt-0.5 text-[16px] font-bold ${accent ? "text-brand-600" : "text-ink-900"}`}>
        {value}
      </p>
      <p className="text-[10px] text-ink-400">{unit}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-[8px] bg-canvas px-2 py-2">
      <p className="text-[10px] text-ink-400">{label}</p>
      <p className="mt-0.5 text-[13px] font-bold text-ink-900">
        {value}
        <span className="text-[10px] font-medium text-ink-400"> kcal</span>
      </p>
    </div>
  );
}
