export type TabKey = "home" | "progress" | "diary" | "me";

const tabs: { key: TabKey; label: string; icon: (active: boolean) => JSX.Element }[] = [
  { key: "home", label: "今日", icon: (a) => <HomeIcon active={a} /> },
  { key: "progress", label: "趋势", icon: (a) => <TrendIcon active={a} /> },
  { key: "diary", label: "日记", icon: (a) => <DiaryIcon active={a} /> },
  { key: "me", label: "我的", icon: (a) => <MeIcon active={a} /> },
];

export function TabBar({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (k: TabKey) => void;
}) {
  // 2 个在左、2 个在右,中间给浮起的"+"(由 QuickAddSheet 渲染)留位
  const left = tabs.slice(0, 2);
  const right = tabs.slice(2);

  return (
    <div className="absolute inset-x-0 bottom-0 z-40">
      <div className="relative h-[84px] border-t border-black/5 bg-surface/85 backdrop-blur-xl">
        <div className="flex h-full items-start justify-between px-3 pt-2.5">
          <div className="flex flex-1 justify-around">
            {left.map((t) => (
              <TabButton key={t.key} t={t} active={active === t.key} onClick={() => onChange(t.key)} />
            ))}
          </div>
          <div className="w-[72px]" />
          <div className="flex flex-1 justify-around">
            {right.map((t) => (
              <TabButton key={t.key} t={t} active={active === t.key} onClick={() => onChange(t.key)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  t,
  active,
  onClick,
}: {
  t: { key: TabKey; label: string; icon: (active: boolean) => JSX.Element };
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="flex w-14 flex-col items-center gap-1">
      {t.icon(active)}
      <span className={`text-[10px] ${active ? "font-semibold text-brand-600" : "text-ink-400"}`}>
        {t.label}
      </span>
    </button>
  );
}

const sw = (a: boolean) => (a ? "#2F8568" : "#9AA39D");

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke={sw(active)} strokeWidth="2" />
      <circle cx="12" cy="12" r="3" fill={sw(active)} />
    </svg>
  );
}
function TrendIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M4 16l4-5 3 3 5-7" stroke={sw(active)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 20h16" stroke={sw(active)} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function DiaryIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3.5" width="16" height="17" rx="3" stroke={sw(active)} strokeWidth="2" />
      <path d="M8 3.5v3M16 3.5v3M4 9h16" stroke={sw(active)} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function MeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8.5" r="3.5" stroke={sw(active)} strokeWidth="2" />
      <path d="M5 19.5c1.5-3.4 4-5 7-5s5.5 1.6 7 5" stroke={sw(active)} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
