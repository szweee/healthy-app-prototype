# 项目交接文档（PROGRESS）

> 这份文档用于换电脑 / 换 Cursor 会话时无缝续接。新机器上让 Cursor 先读这份 + `docs/方案.md`，即可恢复上下文。
> 最后更新：2026-06-05

## 这是什么

一款 iOS 优先、面向**减肥/体重管理**人群的饮食运动热量打卡 App。

- **产品方案文档**：`docs/方案.md`（已锁定核心战略与边界，是唯一权威设计文档）。
- **当前仓库**：一个用 **React + Vite + TypeScript + Tailwind + Framer Motion** 做的**高保真交互 Web 原型**，用于可视化 UI/UX 与核心交互（不是最终 iOS 代码，最终用 SwiftUI 实现）。

## 如何运行（新电脑）

```bash
# 1. 装 Node.js（建议 18+，用官网安装包或 nvm，别用会编译源码的老 brew）
# 2. 进入 prototype 目录
cd prototype
# 3. 安装依赖
npm install
# 4. 启动开发服务器
npm run dev
# 浏览器打开 http://localhost:5173 （vite.config.ts 开了 host:true，可局域网用手机访问）
```

- `?static=1` URL 参数：关闭动画，用于无头截图（见 `src/anim.ts`）。

## 技术栈与目录

- `src/screens/`：四个主屏 — `HomeScreen`(今日) / `ProgressScreen`(趋势) / `DiaryScreen`(日记) / `MeScreen`(我的)。
- `src/components/`：`PhoneFrame`(iPhone 外框) / `Card` / `CalorieRing` / `MacroBars` / `Heatmap` / `WeightTrend` / `IntakeTrend` / `TabBar` / `QuickAddSheet`(中央 + 快速记录 sheet)。
- `src/data/mock.ts`：所有 mock 数据（range-aware：周/月/年；`daySummary(offset)` 生成历史某天数据）。
- `public/foods/`：真实食物图片（oatmeal/salad/bread/latte/avocado/salmon）。
- `tailwind.config.js`：自定义主题（canvas/surface/brand/status/macro 配色、圆角、shadow-float/shadow-card）。

## 已实现的关键交互（原型）

- **中央"+"快速记录**：圆形 + 按钮 morph 放大成 sheet（Container Transform），关闭反向收缩；medium/large 两档；拖动跟手、下滑关闭、上滑展开；底部常驻拍照/相册/扫码工具栏；+ 与 × 静态切换（无旋转）。
- **今日页**：热量环 + 三大营养素 + 活动消耗 + 步数目标进度 + 餐次占位槽；支持 ‹ › 与左右滑切换历史日期，方向性淡入淡出动画，日期可点回今天。
- **趋势页**：range-aware（周/月/年）+ 周期前后翻 ‹ ›；概览卡 + IntakeTrend(主，分段柱：绿=达标内、橙=超标，点柱看当天分餐) + WeightTrend(次，原始点+趋势线+目标线+当前值标注) + Heatmap(周=单行/月=日历网格/年=贡献图，格子可点) + 本期小结报告卡（文案随 range 变）。
- **日记页**：默认相册月历视图（aspect-[4/5] 较高格子）+ 月份前后翻 + 回到本月；点某天 origin-zoom morph 放大成详情卡，下滑关闭，照片可叠卡/散开左右翻。
- **我的页**：目标与预算（含每日步数目标）等设置项。

## 关键产品决策（详见 docs/方案.md）

- v1 主打减肥/体重管理；iOS 优先；**只做海外区不上中国区，但支持中文用户**（双语 i18n + 中式食物数据）。
- 数据诚实：AI 只识别食物+估份量，营养值查库，结果可编辑、标来源+置信度。
- 食物数据栈：USDA + Open Food Facts 自建索引 + FatSecret Premier Free + 多模态 LLM 解析 + 中式种子集。
- 健康关注层**硬性合规边界**：只做追踪+科普+免责，不诊断/不治疗/不预测医学数值。
- **goalProfile 目标驱动呈现层**：同一套卡片骨架，热量环三种模式（deficit 减重 / goal-fill 增重增肌 / band 维持改善膳食），靠配置切换不新建页面。v1 倾向收紧到减重+维持，其余轻量适配。
- 信息架构：底部 4 tab + 中央"+"（今日 / 趋势 / + / 日记 / 我的）。

## 已知问题 / 待办

- `QuickAddSheet` 关闭动画的颜色过渡、浮起阴影手感前期反复调过，若仍觉生硬可继续微调 `closeSpring` 阻尼与 `boxShadow`。
- 无头 Chrome 截图对动画元素偶发卡住/空白，用 `?static=1` 规避。
- 下一阶段（按方案）：信息架构 + 关键页面线框（Figma）→ 评审 → SwiftUI 实现。

## 方案文档里的下一步

确认战略后：先做信息架构 + 关键页面线框（Figma）→ 评审 → 再进入 SwiftUI 实现。本阶段不写正式代码。
