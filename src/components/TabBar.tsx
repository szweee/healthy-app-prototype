export type TabKey = "home" | "progress" | "me";

const tabs: { key: TabKey; label: string; icon: (active: boolean) => JSX.Element }[] = [
  { key: "home", label: "今日", icon: (a) => <HomeIcon active={a} /> },
  { key: "progress", label: "趋势", icon: (a) => <TrendIcon active={a} /> },
  { key: "me", label: "我的", icon: (a) => <MeIcon active={a} /> },
];

export function TabBar({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (k: TabKey) => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40">
      <div className="relative h-[76px]">
        <div className="pointer-events-auto flex h-full items-start justify-center gap-2.5 pt-2">
          <div className="flex h-[44px] w-[204px] items-center gap-1 rounded-[22px] bg-surface/95 p-1 shadow-float backdrop-blur-xl">
            {tabs.map((t) => (
              <TabButton key={t.key} t={t} active={active === t.key} onClick={() => onChange(t.key)} />
            ))}
          </div>
          <div className="h-[44px] w-[44px]" />
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
    <button
      onClick={onClick}
      className={`flex h-9 flex-1 flex-col items-center justify-center rounded-[18px] transition-colors ${
        active ? "bg-brand-50 text-brand-700" : "text-ink-400"
      }`}
    >
      {t.icon(active)}
      <span className={`text-[9px] leading-none ${active ? "font-semibold" : ""}`}>
        {t.label}
      </span>
    </button>
  );
}

const sw = (a: boolean) => (a ? "#2F8568" : "#9AA39D");

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke={sw(active)} strokeWidth="2" />
      <circle cx="12" cy="12" r="3" fill={sw(active)} />
    </svg>
  );
}
function TrendIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 16l4-5 3 3 5-7" stroke={sw(active)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 20h16" stroke={sw(active)} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function MeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8.5" r="3.5" stroke={sw(active)} strokeWidth="2" />
      <path d="M5 19.5c1.5-3.4 4-5 7-5s5.5 1.6 7 5" stroke={sw(active)} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
