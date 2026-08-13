# 前端工程约定

## 技术栈

- React 19 + React DOM
- TypeScript 6，Vite 8
- TanStack Router 负责路由
- Zustand 负责少量跨组件 UI 状态
- TanStack Query 作为未来远程数据访问基础
- Arco Design + Tailwind CSS v4 负责 UI 和样式

## 目录约定

`src/features/` 放领域或页面模块；`src/UI/` 放跨领域控件封装；`src/stores/` 放跨组件状态；`src/assets/` 放静态资源。当前 `WorkspaceShell` 仍承担较多编排职责，随着页面实现应逐步拆分。

## 路由约定

根路径 `/` 对应工作台；`/$pageId` 承载导航页面。新增可访问页面时要在路由树中注册，并确保未知 `pageId` 有明确的回退或 404 策略。

## 样式约定

全局字体、主题 token、Arco 覆盖样式集中在 `src/index.css`。组件内部优先使用 Tailwind 类；重复出现的复杂模式再提炼为组件或 CSS 类。颜色和状态应优先复用项目 token，避免无理由新增近似色。

## 构建与检查

提交前运行 `pnpm lint` 和 `pnpm build`。当前没有测试脚本；增加异步数据或复杂交互时应同步补充测试方案。
