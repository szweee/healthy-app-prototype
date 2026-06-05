// 全部为原型用 mock 数据

export type MealType = "早餐" | "午餐" | "晚餐" | "加餐";

export type Confidence = "high" | "mid" | "low";

export type FoodEntry = {
  id: string;
  name: string;
  emoji: string;
  meal: MealType;
  kcal: number;
  carb: number;
  protein: number;
  fat: number;
  time: string;
  photo?: string; // 渐变占位代表"真实照片"
  source: "库" | "条码" | "AI" | "自定义";
  confidence: Confidence;
  flags?: string[]; // 如 "碳水较高"
};

export const todayBudget = {
  target: 1800,
  consumed: 1190,
  burnedActive: 320, // HealthKit 活动消耗
  steps: 6840,
  stepGoal: 8000, // 软目标,可在"我的"里改/关
};

export type RangeKey = "周" | "月" | "年";

export const macros = {
  carb: { value: 142, target: 200, color: "carb" as const },
  protein: { value: 68, target: 110, color: "protein" as const },
  fat: { value: 41, target: 60, color: "fat" as const },
};

// 真实食物照片(放在 public/foods/),用作缩略图背景
const img = (f: string) => `url('/foods/${f}') center/cover no-repeat`;
export const foodPhotos = [
  img("food-oatmeal.png"),
  img("food-salad.png"),
  img("food-bread.png"),
  img("food-latte.png"),
  img("food-avocado.png"),
  img("food-salmon.png"),
];

export const photoGradients = [
  "linear-gradient(135deg,#F6C99B,#E89B6E)",
  "linear-gradient(135deg,#B9D7C2,#6FA88A)",
  "linear-gradient(135deg,#CBB8E0,#9B7FC0)",
  "linear-gradient(135deg,#F2D49B,#E0B45C)",
  "linear-gradient(135deg,#A9CBE0,#6F9FC2)",
  "linear-gradient(135deg,#E6B3B0,#CE8A86)",
];

export const todayEntries: FoodEntry[] = [
  {
    id: "e1",
    name: "燕麦牛奶 + 蓝莓",
    emoji: "🥣",
    meal: "早餐",
    kcal: 320,
    carb: 48,
    protein: 14,
    fat: 8,
    time: "08:12",
    photo: foodPhotos[0],
    source: "库",
    confidence: "high",
  },
  {
    id: "e2",
    name: "美式咖啡",
    emoji: "☕",
    meal: "早餐",
    kcal: 10,
    carb: 2,
    protein: 0,
    fat: 0,
    time: "08:20",
    source: "库",
    confidence: "high",
  },
  {
    id: "e3",
    name: "鸡胸肉沙拉碗",
    emoji: "🥗",
    meal: "午餐",
    kcal: 460,
    carb: 38,
    protein: 42,
    fat: 16,
    time: "12:40",
    photo: foodPhotos[1],
    source: "AI",
    confidence: "mid",
    flags: ["蛋白质充足"],
  },
  {
    id: "e4",
    name: "全麦面包",
    emoji: "🍞",
    meal: "午餐",
    kcal: 140,
    carb: 26,
    protein: 6,
    fat: 2,
    time: "12:45",
    photo: foodPhotos[2],
    source: "条码",
    confidence: "high",
  },
  {
    id: "e5",
    name: "拿铁 + 司康",
    emoji: "🧋",
    meal: "加餐",
    kcal: 260,
    carb: 34,
    protein: 7,
    fat: 11,
    time: "15:30",
    photo: foodPhotos[3],
    source: "AI",
    confidence: "low",
    flags: ["碳水较高"],
  },
];

export const meals: { type: MealType; emoji: string; hint: string }[] = [
  { type: "早餐", emoji: "🌅", hint: "07:00–10:00" },
  { type: "午餐", emoji: "🌤", hint: "11:30–14:00" },
  { type: "晚餐", emoji: "🌙", hint: "17:30–20:30" },
  { type: "加餐", emoji: "🍎", hint: "随时" },
];

export const frequentFoods = [
  { name: "燕麦牛奶", emoji: "🥣", kcal: 320 },
  { name: "美式咖啡", emoji: "☕", kcal: 10 },
  { name: "鸡胸肉", emoji: "🍗", kcal: 165 },
  { name: "苹果", emoji: "🍎", kcal: 95 },
  { name: "全麦面包", emoji: "🍞", kcal: 140 },
  { name: "希腊酸奶", emoji: "🥛", kcal: 130 },
  { name: "拿铁", emoji: "🧋", kcal: 190 },
];

export const recentSearches = [
  { name: "牛油果吐司", emoji: "🥑", kcal: 290, source: "库" as const },
  { name: "三文鱼", emoji: "🐟", kcal: 208, source: "库" as const },
  { name: "番茄炒蛋", emoji: "🍅", kcal: 180, source: "AI" as const },
  { name: "白米饭 一碗", emoji: "🍚", kcal: 230, source: "库" as const },
  { name: "香蕉", emoji: "🍌", kcal: 105, source: "库" as const },
  { name: "黑咖啡", emoji: "☕", kcal: 5, source: "库" as const },
];

// 热力图:最近 ~17 周,值 0..4(依从度 / 净状态)
export const heatmap: number[] = Array.from({ length: 17 * 7 }, (_, i) => {
  const seed = (i * 37) % 11;
  if (seed < 2) return 0;
  if (seed < 4) return 1;
  if (seed < 7) return 2;
  if (seed < 9) return 3;
  return 4;
});

// 体重趋势:原始点 + EWMA 平滑
const rawWeights = [
  72.4, 72.9, 72.1, 72.6, 71.8, 72.2, 71.5, 71.9, 71.2, 71.6, 70.9, 71.3, 70.7,
  71.0, 70.4, 70.8, 70.1, 70.5, 69.8, 70.1, 69.6, 69.9, 69.3, 69.6, 69.1, 69.4,
  68.9, 69.1, 68.6, 68.9,
];
function ewma(data: number[], alpha = 0.18): number[] {
  const out: number[] = [];
  let prev = data[0];
  for (const v of data) {
    prev = alpha * v + (1 - alpha) * prev;
    out.push(prev);
  }
  return out;
}
export const weightSeries = {
  raw: rawWeights,
  trend: ewma(rawWeights),
  start: 72.4,
  current: 68.9,
  goal: 66.0,
  ratePerWeek: -0.4,
};

// ===== 趋势页:随 周/月/年 档位变化的数据 =====

const TARGET = todayBudget.target;

// 每日热量摄入趋势(主图):值 + 标签 + 均值
function buildIntake(values: number[], labels: string[]) {
  const avg = Math.round(values.reduce((s, v) => s + v, 0) / values.length);
  return { values, labels, avg, target: TARGET };
}

export const intakeByRange: Record<RangeKey, ReturnType<typeof buildIntake>> = {
  周: buildIntake(
    [1720, 1980, 1650, 2100, 1540, 1890, 1190],
    ["一", "二", "三", "四", "五", "六", "日"]
  ),
  月: buildIntake(
    Array.from({ length: 30 }, (_, i) => 1500 + ((i * 137 + 53) % 700)),
    Array.from({ length: 30 }, (_, i) => (i % 5 === 0 ? String(i + 1) : ""))
  ),
  年: buildIntake(
    [1880, 1840, 1810, 1790, 1830, 1760, 1720, 1700, 1740, 1690, 1660, 1640],
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
  ),
};

// 概览三指标随档位
export const overviewByRange: Record<
  RangeKey,
  { avgIntake: string; loggedDays: string; loggedUnit: string; streak: string }
> = {
  周: { avgIntake: "1,724", loggedDays: "6", loggedUnit: "天 · 本周", streak: "11" },
  月: { avgIntake: "1,720", loggedDays: "24", loggedUnit: "天 · 本月", streak: "11" },
  年: { avgIntake: "1,758", loggedDays: "268", loggedUnit: "天 · 今年", streak: "11" },
};

// 热力图分档:周=单行 7 格;月=月历(5 周);年=贡献图(53 周)
function genCells(n: number): number[] {
  return Array.from({ length: n }, (_, i) => {
    const seed = (i * 37) % 11;
    if (seed < 2) return 0;
    if (seed < 4) return 1;
    if (seed < 7) return 2;
    if (seed < 9) return 3;
    return 4;
  });
}
export const heatmapByRange: Record<
  RangeKey,
  { cells: number[]; weeks: number; row?: boolean; caption: string }
> = {
  周: { cells: genCells(7), weeks: 1, row: true, caption: "本周每天的记录完整度" },
  月: { cells: genCells(35), weeks: 5, caption: "本月每天的记录完整度(按周排列)" },
  年: { cells: genCells(53 * 7), weeks: 53, caption: "越绿表示当天记录越完整,深色串联说明很稳定 👍" },
};

// 体重趋势分档:周=近 7 天;月=近 30 天;年=按月聚合 12 点
export const weightByRange: Record<RangeKey, { raw: number[]; trend: number[] }> = {
  周: { raw: rawWeights.slice(-7), trend: weightSeries.trend.slice(-7) },
  月: { raw: rawWeights, trend: weightSeries.trend },
  年: (() => {
    const monthly = [73.8, 73.1, 72.4, 71.6, 70.9, 70.1, 69.4, 68.9, 68.5, 68.1, 67.6, 67.2];
    return { raw: monthly, trend: ewma(monthly, 0.4) };
  })(),
};

// ===== 首页:按天回看(offset 0=今天,负数=过去) =====
const WD = ["日", "一", "二", "三", "四", "五", "六"];
const greetings = ["早上好,继续保持", "记得补一下水 💧", "稳住,今天也不错", "回顾一下这天"];

export function daySummary(offset: number) {
  const base = new Date(2026, 5, 5); // 6 月 5 日
  const d = new Date(base);
  d.setDate(base.getDate() + offset);
  const isToday = offset === 0;
  const seed = Math.abs(offset);
  const consumed = isToday ? todayBudget.consumed : 1300 + ((seed * 233) % 800);
  const burnedActive = isToday ? todayBudget.burnedActive : 180 + ((seed * 91) % 360);
  const steps = isToday ? todayBudget.steps : 3200 + ((seed * 617) % 7000);
  const count = isToday ? todayEntries.length : 2 + (seed % 4);
  const entries = isToday ? todayEntries : todayEntries.slice(0, Math.min(count, todayEntries.length));
  return {
    offset,
    isToday,
    label: `${d.getMonth() + 1} 月 ${d.getDate()} 日`,
    weekday: `周${WD[d.getDay()]}`,
    greeting: isToday ? greetings[0] : `${d.getMonth() + 1} 月 ${d.getDate()} 日的记录`,
    target: todayBudget.target,
    consumed,
    burnedActive,
    steps,
    stepGoal: todayBudget.stepGoal,
    entries,
  };
}

// 日记月历:某些天有记录(用渐变缩略图条数表示)
export const diaryMonth = Array.from({ length: 35 }, (_, i) => {
  const day = i - 2; // 前面空几格
  if (day < 1 || day > 30) return { day: null, photos: [] as string[] };
  const n = [0, 1, 2, 3, 4][(i * 13) % 5];
  const photos = Array.from(
    { length: n },
    (_, j) => foodPhotos[(i + j) % foodPhotos.length]
  );
  return { day, photos, kcal: n === 0 ? 0 : 900 + ((i * 137) % 900) };
});
