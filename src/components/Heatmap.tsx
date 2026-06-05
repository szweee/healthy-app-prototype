import { useState } from "react";
import { heatmapByRange, type RangeKey } from "../data/mock";

const levelColor = ["#ECEBE6", "#D4ECE0", "#A9DCC3", "#6FC5A0", "#3FA17C"];
const levelText = ["未记录", "记录较少", "记录一般", "记录较多", "记录完整"];
const WD = ["一", "二", "三", "四", "五", "六", "日"];

export function Heatmap({ range = "年" }: { range?: RangeKey }) {
  const { cells, weeks, row } = heatmapByRange[range];
  const [sel, setSel] = useState<{ i: number; v: number } | null>(null);

  // 选中某格的说明(周给星期,月给“第 N 天”,年给“第 N 天”)
  const selText = sel
    ? range === "周"
      ? `周${WD[sel.i]} · ${levelText[sel.v]}`
      : range === "月"
      ? `本月第 ${sel.i + 1} 格 · ${levelText[sel.v]}`
      : `第 ${sel.i + 1} 天 · ${levelText[sel.v]}`
    : null;

  const cell = (v: number, i: number, cls: string) => (
    <div
      key={i}
      onClick={() => setSel(sel?.i === i ? null : { i, v })}
      className={`cursor-pointer ${cls} ${
        sel?.i === i ? "ring-2 ring-brand-600 ring-offset-1" : ""
      }`}
      style={{ background: levelColor[v] }}
    />
  );

  let body;
  if (row) {
    // 周:单行 7 格
    body = (
      <div className="flex gap-2">
        {cells.map((v, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            {cell(v, i, "h-9 w-full rounded-lg")}
            <span className="text-[10px] text-ink-400">{WD[i]}</span>
          </div>
        ))}
      </div>
    );
  } else if (range === "月") {
    // 月:7 列周历对齐
    body = (
      <>
        <div className="mb-1.5 grid grid-cols-7 gap-1.5 text-center text-[10px] text-ink-400">
          {WD.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((v, i) => cell(v, i, "aspect-square w-full rounded-[6px]"))}
        </div>
      </>
    );
  } else {
    // 年:贡献图
    const cols: number[][] = [];
    for (let w = 0; w < weeks; w++) cols.push(cells.slice(w * 7, w * 7 + 7));
    body = (
      <div className="flex gap-[3px] overflow-hidden">
        {cols.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-[3px]">
            {col.map((v, ri) => cell(v, ci * 7 + ri, "h-[11px] w-[11px] rounded-[3px]"))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {body}
      {selText && (
        <p className="mt-2.5 rounded-pill bg-brand-50 px-3 py-1 text-center text-[12px] font-medium text-brand-600">
          {selText}
        </p>
      )}
      <Legend />
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-2.5 flex items-center justify-end gap-1.5 text-[10px] text-ink-400">
      <span>少</span>
      {levelColor.map((c, i) => (
        <span key={i} className="h-[10px] w-[10px] rounded-[2px]" style={{ background: c }} />
      ))}
      <span>多</span>
    </div>
  );
}
