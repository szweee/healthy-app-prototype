import { ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {/* 机身 */}
      <div className="relative h-[812px] w-[375px] overflow-hidden rounded-[44px] bg-canvas shadow-[0_30px_80px_rgba(31,36,33,0.28)] ring-[10px] ring-black/90">
        {/* 状态栏 */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-50 flex h-12 items-center justify-between px-7 pt-2 text-[13px] font-semibold text-ink-900">
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <span className="text-[11px]">●●●</span>
            <span className="text-[11px]">Wi-Fi</span>
            <span className="ml-1 inline-block h-3 w-6 rounded-[3px] border border-ink-900/70">
              <span className="block h-full w-[80%] rounded-[2px] bg-ink-900" />
            </span>
          </span>
        </div>
        {/* 灵动岛 */}
        <div className="absolute left-1/2 top-2.5 z-50 h-7 w-[112px] -translate-x-1/2 rounded-full bg-black" />
        {/* 内容 */}
        <div className="absolute inset-0">{children}</div>
      </div>
    </div>
  );
}
