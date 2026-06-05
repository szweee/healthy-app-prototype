import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PhoneFrame } from "./components/PhoneFrame";
import { TabBar, type TabKey } from "./components/TabBar";
import { QuickAddSheet } from "./components/QuickAddSheet";
import { HomeScreen } from "./screens/HomeScreen";
import { ProgressScreen } from "./screens/ProgressScreen";
import { DiaryScreen } from "./screens/DiaryScreen";
import { MeScreen } from "./screens/MeScreen";
import { STATIC } from "./anim";

const params = new URLSearchParams(window.location.search);
const initialTab = (params.get("tab") as TabKey) || "home";
const initialAdd = params.get("add") === "1";

export default function App() {
  const [tab, setTab] = useState<TabKey>(initialTab);
  const [addOpen, setAddOpen] = useState(initialAdd);
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
        <p className="mt-0.5 text-[12px] text-ink-400">
          点底部 + 试快速记录:可拖动、上滑展开、下滑关闭
        </p>
      </header>

      <PhoneFrame>
        <div className="relative h-full w-full bg-canvas">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={STATIC ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="h-full"
            >
              {tab === "home" && <HomeScreen />}
              {tab === "progress" && <ProgressScreen />}
              {tab === "diary" && <DiaryScreen />}
              {tab === "me" && <MeScreen />}
            </motion.div>
          </AnimatePresence>

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

          <TabBar active={tab} onChange={setTab} />

          <QuickAddSheet
            open={addOpen}
            onOpen={() => setAddOpen(true)}
            onClose={() => setAddOpen(false)}
            onLogged={onLogged}
          />
        </div>
      </PhoneFrame>

      <p className="max-w-[420px] text-center text-[11px] leading-relaxed text-ink-400">
        原型用 mock 数据,仅演示信息架构与核心交互。配色/动效/文案可继续迭代。
      </p>
    </div>
  );
}
