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

需要 Node 18+(含 npm)。本机若无,可从 https://nodejs.org 下载 LTS 安装包(自带 npm,别用会编译源码的老 brew)。

```bash
npm install
npm run dev
# 打开 http://localhost:5173 (已开 host:true,可用同一局域网的手机访问)
```

## 换电脑 / 在新机器上接着开发

仓库根目录就是原型本身(`package.json` 在根目录,没有嵌套子文件夹)。

1. 先装好 **Cursor**、**Node.js LTS**、**Git**。
2. 克隆并运行:

```bash
git clone https://github.com/szweee/healthy-app-prototype.git
cd healthy-app-prototype
npm install
npm run dev
```

> `node_modules` 不在仓库里,必须 `npm install` 重新装一次,这是正常的。

3. **在 Cursor 里恢复上下文**:聊天记录不随账号同步,新机器上看不到旧对话。打开本文件夹后,新建对话并让它先读 `PROGRESS.md`(交接文档)和 `docs/方案.md`(产品方案),即可无缝接上当前进度与已锁定的决策。

## 日常多机同步

```bash
# 改完后
git add -A && git commit -m "说明" && git push
# 换到另一台前
git pull
```

有大进展时顺手更新 `PROGRESS.md`,让交接文档始终最新。

## 文档

- `docs/方案.md` — 产品方案(已锁定的战略、边界、信息架构、goalProfile 等),唯一权威设计文档。
- `PROGRESS.md` — 换机/换会话交接文档(项目现状、运行方式、已实现交互、下一步)。

## 调试参数(仅用于截图)

- `?tab=home|progress|diary|me` 直接打开某 tab
- `?add=1` 打开快速记录 sheet
- `?static=1` 让入场动画直接落到终态(无头截图用,真机不要带)

## 截图

`shots/` 目录下有各屏静态截图。
