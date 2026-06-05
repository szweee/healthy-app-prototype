import { Card, SectionTitle } from "../components/Card";

export function MeScreen() {
  return (
    <div className="no-scrollbar h-full overflow-y-auto px-4 pb-32 pt-14">
      <div className="mb-4 mt-1 flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-[26px]">
          🙂
        </div>
        <div>
          <h1 className="text-[20px] font-bold text-ink-900">Alex</h1>
          <p className="text-[12px] text-ink-400">减重中 · 目标 66 kg</p>
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
        <Row label="每日热量预算" value="1,800 kcal" />
        <Row label="减重节奏" value="稳重 · -0.4 kg/周" />
        <Row label="目标体重" value="66.0 kg" />
        <Row label="每日步数目标" value="8,000 步 · 软目标" last />
      </Card>

      <SectionTitle>健康关注</SectionTitle>
      <Card className="mb-4 overflow-hidden">
        <Row label="关注指标" value="碳水 · 钠" />
        <Row label="科普提醒" value="开" />
        <Row label="免责声明" value="仅供参考,非医疗建议" last muted />
      </Card>

      <SectionTitle>提醒与同步</SectionTitle>
      <Card className="mb-4 overflow-hidden">
        <Row label="用餐提醒" value="早 8:00 · 午 12:30 · 晚 18:30" />
        <Row label="HealthKit" value="已连接 ✓" />
        <Row label="Widget" value="能量环 · 热力图" last />
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
}: {
  label: string;
  value: string;
  last?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3.5 ${
        last ? "" : "border-b border-black/5"
      }`}
    >
      <span className="text-[14px] text-ink-700">{label}</span>
      <span className={`flex items-center gap-1 text-[13px] ${muted ? "text-ink-400" : "text-ink-500"}`}>
        {value}
        <span className="text-ink-400">›</span>
      </span>
    </div>
  );
}
