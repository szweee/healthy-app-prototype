import { Card, SectionTitle } from "../components/Card";
import { goalProfiles, type GoalKey } from "../data/mock";

export function MeScreen({
  goal,
  onAdjustMealTimes,
}: {
  goal: GoalKey;
  onAdjustMealTimes?: () => void;
}) {
  const profile = goalProfiles[goal];
  const budget = goal === "maintain" ? `${profile.min}-${profile.max} kcal` : `${profile.target.toLocaleString()} kcal`;
  const goalRows = {
    deficit: [
      ["每日热量预算", budget],
      ["减重节奏", "稳定 · -0.5 kg/周"],
      ["目标体重", "66.0 kg"],
      ["每日步数目标", "8,000 步 · 软目标"],
    ],
    maintain: [
      ["每日热量区间", budget],
      ["目标策略", "维持区间 · 看一周平均"],
      ["体重范围", "当前 ±1.0 kg"],
      ["每日步数目标", "8,000 步 · 软目标"],
    ],
    gain: [
      ["每日热量目标", budget],
      ["增肌节奏", "稳定 · +0.25 kg/周"],
      ["目标体重", "70.0 kg"],
      ["蛋白质目标", "140 g · 优先保证"],
    ],
  }[goal];
  return (
    <div className="no-scrollbar h-full overflow-y-auto px-4 pb-32 pt-14">
      <div className="mb-4 mt-1 flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-[26px]">
          🙂
        </div>
        <div>
          <h1 className="text-[20px] font-bold text-ink-900">Alex</h1>
          <p className="text-[12px] text-ink-400">{profile.badge}</p>
        </div>
      </div>

      {/* 订阅卡 */}
      <Card className="mb-4 flex items-center justify-between bg-gradient-to-br from-brand-500 to-brand-600 px-4 py-4">
        <div>
          <p className="text-[15px] font-bold text-white">升级 Pro</p>
          <p className="mt-0.5 text-[12px] text-white/85">无限 AI 识别 · 深度分析 · 自定义 Widget</p>
        </div>
        <span className="rounded-pill bg-white px-3 py-1.5 text-[13px] font-semibold text-brand-600">
          解锁
        </span>
      </Card>

      <SectionTitle>目标与预算</SectionTitle>
      <Card className="mb-4 overflow-hidden">
        {goalRows.map(([label, value], index) => (
          <Row key={label} label={label} value={value} last={index === goalRows.length - 1} />
        ))}
      </Card>

      <SectionTitle>健康关注</SectionTitle>
      <Card className="mb-4 overflow-hidden">
        <Row label="关注指标" value={goal === "gain" ? "蛋白质 · 训练日" : goal === "maintain" ? "区间 · 蛋白质" : "碳水 · 钠"} />
        <Row label="科普提醒" value="开" />
        <Row label="免责声明" value="仅供参考,非医疗建议" last muted />
      </Card>

      <SectionTitle>同步</SectionTitle>
      <Card className="mb-4 overflow-hidden">
        <Row label="HealthKit" value="已连接 ✓" />
        <Row label="Widget" value="能量环 · 热力图" last />
      </Card>

      <SectionTitle>记录偏好</SectionTitle>
      <Card className="mb-4 overflow-hidden">
        <Row label="作息类型" value="常规作息" />
        <Row
          label="餐次时间与提醒"
          value="早 8:00 · 午 12:30 · 晚 18:30"
          onClick={onAdjustMealTimes}
        />
        <Row label="默认加餐" value="有吃再记" last muted />
      </Card>

      <SectionTitle>其他</SectionTitle>
      <Card className="mb-4 overflow-hidden">
        <Row label="数据来源" value="FatSecret · USDA · OFF" />
        <Row label="语言" value="简体中文" />
        <Row label="设置" value="" last />
      </Card>

      <p className="px-2 pb-2 text-center text-[11px] leading-relaxed text-ink-400">
        本 App 不提供医疗诊断或治疗建议,如有健康问题请遵医嘱。
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  last,
  muted,
  onClick,
}: {
  label: string;
  value: string;
  last?: boolean;
  muted?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`flex items-center justify-between px-4 py-3.5 ${
        last ? "" : "border-b border-black/5"
      } ${onClick ? "w-full text-left active:bg-black/[0.03]" : "w-full cursor-default text-left"}`}
    >
      <span className="text-[14px] text-ink-700">{label}</span>
      <span className={`flex items-center gap-1 text-[13px] ${muted ? "text-ink-400" : "text-ink-500"}`}>
        {value}
        <span className="text-ink-400">›</span>
      </span>
    </button>
  );
}
