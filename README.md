# 饮食运动打卡 · 高保真网页原型

React + Vite + TypeScript + Tailwind + framer-motion 实现的可交互原型,演示信息架构与核心交互(全部 mock 数据)。

## 包含

- 4 个 tab 主页:今日 / 趋势 / 日记 / 我的
- 中置 Z 轴浮起的 + 快速记录按钮 → 可拖动 sheet(半屏 ⇄ 全屏,上滑展开、下滑关闭)
- 今日:中央热量环(状态色)、三大营养素、HealthKit 步数/消耗卡、餐次占位槽
- 趋势:时间档、概览卡、体重趋势线(EWMA 平滑 + 原始点 + 目标线)、GitHub 式热力图
- 日记:默认相册月历(多条记录叠卡效果 + N 角标)+ 列表视图切换
- 我的:订阅、目标/预算、健康关注(含免责)、提醒/HealthKit、数据来源

## 运行

需要 Node 18+(含 npm)。本机若无,可从 https://nodejs.org 下载 macOS 版,或 `brew install node`。

```bash
npm install
npm run dev
# 打开 http://localhost:5173
```

## 调试参数(仅用于截图)

- `?tab=home|progress|diary|me` 直接打开某 tab
- `?add=1` 打开快速记录 sheet
- `?static=1` 让入场动画直接落到终态(无头截图用,真机不要带)

## 截图

`shots/` 目录下有各屏静态截图。
