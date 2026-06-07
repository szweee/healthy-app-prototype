import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PhoneFrame } from "./components/PhoneFrame";
import { TabBar, type TabKey } from "./components/TabBar";
import { QuickAddSheet, type AddMode, type AddTimeContext } from "./components/QuickAddSheet";
import { HomeScreen } from "./screens/HomeScreen";
import { ProgressScreen } from "./screens/ProgressScreen";
import { DiaryScreen, type RecordTarget } from "./screens/DiaryScreen";
import { MeScreen } from "./screens/MeScreen";
import { STATIC } from "./anim";
import type { GoalKey, MealType } from "./data/mock";

const params = new URLSearchParams(window.location.search);
const requestedTab = params.get("tab") as TabKey | null;
const initialTab: TabKey = requestedTab === "progress" || requestedTab === "me" ? requestedTab : "home";
const initialAdd = params.get("add") === "1";

export default function App() {
  const [tab, setTab] = useState<TabKey>(initialTab);
  const selectedGoal: GoalKey = "deficit";
  const [addOpen, setAddOpen] = useState(initialAdd);
  const [addMeal, setAddMeal] = useState<MealType | undefined>(undefined);
  const [addMode, setAddMode] = useState<AddMode | undefined>(undefined);
  const [addTime, setAddTime] = useState<AddTimeContext | undefined>(undefined);
  const [recordTarget, setRecordTarget] = useState<RecordTarget | null>(null);
  const [mealTimeOpen, setMealTimeOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const onLogged = (name: string) => {
    setAddOpen(false);
    setToast(`已记录:${name}`);
    setTimeout(() => setToast(null), 1800);
  };

  return (
    <div className="flex min-h-full flex-col items-center gap-6 py-10">
      <header className="text-center">
        <h1 className="text-[15px] font-semibold text-ink-700">饮食运动打卡 · 高保真原型</h1>
        <p className="mt-0.5 text-[12px] text-ink-400">点底部 + 试快速记录:可拖动、上滑展开、下滑关闭</p>
      </header>

      <PhoneFrame>
        <div className="relative h-full w-full bg-canvas">
          <div className="relative h-full overflow-hidden">
            <AnimatePresence initial={false}>
              <motion.div
                key={recordTarget ? "records" : tab}
                initial={STATIC ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute inset-0"
              >
                {recordTarget ? (
                  <DiaryScreen target={recordTarget} onBack={() => setRecordTarget(null)} />
                ) : tab === "home" ? (
                  <HomeScreen
                    goal={selectedGoal}
                    onAddMeal={(meal, time) => {
                      setAddMeal(meal);
                      setAddMode("food");
                      setAddTime(time);
                      setAddOpen(true);
                    }}
                onAddActivity={(time) => {
                  setAddMeal(undefined);
                  setAddMode("activity");
                  setAddTime(time);
                  setAddOpen(true);
                }}
                onOpenRecords={(title, subtitle, empty, scope) => setRecordTarget({ title, subtitle, empty, scope })}
                onAdjustMealTimes={() => setMealTimeOpen(true)}
              />
            ) : tab === "progress" ? (
              <ProgressScreen
                onOpenRecords={(title, subtitle, empty, scope) => setRecordTarget({ title, subtitle, empty, scope })}
              />
            ) : (
              <MeScreen
                goal={selectedGoal}
                onAdjustMealTimes={() => setMealTimeOpen(true)}
              />
            )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Toast */}
          <AnimatePresence>
            {toast && (
              <motion.div
                style={{ x: "-50%" }}
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-28 left-1/2 z-[60] rounded-pill bg-ink-900 px-4 py-2.5 text-[13px] font-medium text-white shadow-float"
              >
                {toast}
              </motion.div>
            )}
          </AnimatePresence>

          {!recordTarget && <TabBar active={tab} onChange={setTab} />}

          {!recordTarget && (
            <QuickAddSheet
              open={addOpen}
              initialMeal={addMeal}
              initialMode={addMode}
              initialTime={addTime}
              onOpen={() => {
                setAddMeal(undefined);
                setAddMode(undefined);
                setAddTime(undefined);
                setAddOpen(true);
              }}
              onClose={() => setAddOpen(false)}
              onLogged={onLogged}
              onAdjustMealTimes={() => setMealTimeOpen(true)}
            />
          )}

          <MealTimeSettings open={mealTimeOpen} onClose={() => setMealTimeOpen(false)} />
        </div>
      </PhoneFrame>

      <p className="max-w-[420px] text-center text-[11px] leading-relaxed text-ink-400">
        原型用 mock 数据,仅演示信息架构与核心交互。配色/动效/文案可继续迭代。
      </p>
    </div>
  );
}

type MealTemplateKey = "regular" | "late" | "shift";

const mealTemplates: Record<
  MealTemplateKey,
  {
    label: string;
    desc: string;
    reminderOn: boolean;
    meals: Array<{ label: string; time: string; note: string; reminder: string }>;
  }
> = {
  regular: {
    label: "常规",
    desc: "适合正常早起、午间用餐、傍晚晚餐的作息。",
    reminderOn: true,
    meals: [
      { label: "早餐", time: "05:00–10:30", note: "提醒落在早餐时间窗内", reminder: "08:00" },
      { label: "午餐", time: "11:00–14:00", note: "距早餐至少 3 小时", reminder: "12:30" },
      { label: "晚餐", time: "17:00–20:30", note: "距午餐至少 3 小时", reminder: "18:30" },
    ],
  },
  late: {
    label: "晚起",
    desc: "适合晚起晚睡。早餐会按早餐/早午餐处理,数据仍归到早餐。",
    reminderOn: true,
    meals: [
      { label: "早餐/早午餐", time: "08:30–12:00", note: "晚起时默认归到早餐", reminder: "10:00" },
      { label: "午餐", time: "12:30–15:30", note: "比常规作息略后", reminder: "13:30" },
      { label: "晚餐", time: "18:30–22:00", note: "晚餐窗口同步后移", reminder: "20:00" },
    ],
  },
  shift: {
    label: "轮班",
    desc: "适合不固定作息。原型先用固定窗口,正式版可按起床后 X 小时生成。",
    reminderOn: false,
    meals: [
      { label: "第一餐", time: "09:00–13:00", note: "可理解为醒后第一餐", reminder: "关闭" },
      { label: "第二餐", time: "14:00–18:00", note: "提醒默认关闭避免打扰", reminder: "关闭" },
      { label: "第三餐", time: "19:00–23:30", note: "夜间作息也可覆盖", reminder: "关闭" },
    ],
  },
};

function MealTimeSettings({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [templateKey, setTemplateKey] = useState<MealTemplateKey>("regular");
  const template = mealTemplates[templateKey];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="absolute inset-0 z-[70] bg-ink-900/25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="absolute inset-x-4 bottom-5 z-[80] rounded-[26px] bg-canvas p-4 shadow-float"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-[17px] font-bold text-ink-900">餐次时间与提醒</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-ink-500">
                  时间窗用于判断该记哪一餐,提醒用于到点本地通知。
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/5 text-ink-500"
                aria-label="关闭餐次时间与提醒设置"
              >
                ×
              </button>
            </div>

            <div className="mb-2 grid grid-cols-3 gap-1.5 rounded-2xl bg-surface p-1.5 shadow-card">
              {(Object.keys(mealTemplates) as MealTemplateKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setTemplateKey(key)}
                  className={`rounded-[13px] py-2 text-[12px] font-semibold ${
                    templateKey === key ? "bg-brand-500 text-white" : "bg-canvas text-ink-500"
                  }`}
                >
                  {mealTemplates[key].label}
                </button>
              ))}
            </div>
            <p className="mb-3 px-1 text-[11px] leading-relaxed text-ink-500">
              {template.desc} 切换模板会同步调整三餐时间窗和提醒时间。
            </p>

            <div className="space-y-2">
              {template.meals.map((meal, index) => (
                <MealWindow
                  key={meal.label}
                  label={meal.label}
                  time={meal.time}
                  note={meal.note}
                  active={index === 0}
                />
              ))}
            </div>

            <div className="mt-3 rounded-[20px] bg-surface px-3.5 py-3 shadow-card">
              <div className="mb-2.5 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-ink-900">用餐本地提醒</p>
                  <p className="mt-0.5 text-[11px] text-ink-400">到点推送,可单独关闭</p>
                </div>
                <span
                  className={`relative h-6 w-11 rounded-full ${
                    template.reminderOn ? "bg-brand-500" : "bg-ink-200"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-card ${
                      template.reminderOn ? "right-0.5" : "left-0.5"
                    }`}
                  />
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {template.meals.map((meal) => (
                  <ReminderChip key={meal.label} label={meal.label.replace("/早午餐", "")} time={meal.reminder} />
                ))}
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-ink-400">
                {template.reminderOn
                  ? "提醒时间会落在对应餐次时间窗内,但不改变餐次归类;如果提醒超出时间窗,保存时会提示调整。"
                  : "轮班模式默认关闭提醒,避免在休息时打扰;你可以手动开启。"}
              </p>
            </div>

            <div className="mt-3 rounded-2xl bg-brand-50 px-3 py-2.5">
              <p className="text-[12px] font-semibold text-brand-800">保存前会自动校验</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-brand-700/80">
                早餐必须早于午餐,午餐必须早于晚餐;相邻正餐至少间隔 3 小时。保存后会影响首页推荐餐次、QuickAdd 默认餐次和本地提醒。
              </p>
            </div>

            <button
              onClick={onClose}
              className="mt-3 w-full rounded-2xl bg-brand-500 py-3 text-[14px] font-semibold text-white shadow-card"
            >
              保存设置
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MealWindow({
  label,
  time,
  note,
  active,
}: {
  label: string;
  time: string;
  note: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-surface px-3.5 py-3 shadow-card">
      <div>
        <p className="text-[13px] font-semibold text-ink-900">{label}</p>
        <p className="mt-0.5 text-[11px] text-ink-400">{note}</p>
      </div>
      <span className={`rounded-pill px-3 py-1 text-[12px] font-semibold ${
        active ? "bg-brand-50 text-brand-700" : "bg-canvas text-ink-600"
      }`}>
        {time}
      </span>
    </div>
  );
}

function ReminderChip({ label, time }: { label: string; time: string }) {
  return (
    <button className="rounded-[13px] bg-canvas px-2 py-2 text-left">
      <p className="text-[10px] font-semibold text-ink-500">{label}</p>
      <p className="mt-0.5 text-[13px] font-bold text-ink-900">{time}</p>
    </button>
  );
}
