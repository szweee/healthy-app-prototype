import { motion } from "framer-motion";
import { macros } from "../data/mock";
import { STATIC } from "../anim";

const items = [
  { key: "碳水", data: macros.carb, color: "#E8B04B" },
  { key: "蛋白质", data: macros.protein, color: "#6FA8C7" },
  { key: "脂肪", data: macros.fat, color: "#C99BD1" },
];

export function MacroBars() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((it) => {
        const pct = Math.min(it.data.value / it.data.target, 1);
        return (
          <div key={it.key} className="flex flex-col items-center">
            <span className="text-[12px] text-ink-500">{it.key}</span>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-pill bg-black/5">
              <motion.div
                className="h-full rounded-pill"
                style={{ background: it.color }}
                initial={STATIC ? false : { width: 0 }}
                animate={{ width: `${pct * 100}%` }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            </div>
            <span className="mt-1 text-[12px] font-medium text-ink-900">
              {it.data.value}
              <span className="text-ink-400">/{it.data.target}g</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
