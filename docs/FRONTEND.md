# 前端工程模型

## 概览

应用是 Vite 驱动的 React 19 单页客户端，使用 TypeScript 6。`src/main.tsx` 挂载 React，并提供 Arco、TanStack Query 和 TanStack Router。没有服务端渲染、API 客户端、远端数据查询或测试运行器。

## 目录与组件边界

| 位置 | 放置内容 |
| --- | --- |
| `src/features/` | 页面级或领域 UI 与编排。 |
| `src/UI/` | 可跨功能复用的 Arco 轻量封装。 |
| `src/stores/` | 跨组件共享的客户端 UI 状态。 |
| `src/assets/` | 静态资源。 |
| `src/index.css` | Tailwind token、基础样式和跨组件覆盖。 |

组件应为函数式组件。将新的领域页面放入 `features/`，不要继续膨胀 `WorkspaceShell`；只有确实跨领域复用时才新建 `UI/` 封装。

## 路由与导航

`src/router.tsx` 定义 `/` 和 `/$pageId`，两者当前均渲染 `WorkspaceShell`。`WorkspaceShell` 内的 `navItems` 是当前导航和命令搜索的单一静态索引。新增可访问导航时：

1. 在路由树中明确需要的路径；
2. 更新 `navItems`（若该页面需要在主导航或命令搜索出现）；
3. 保持未知路径的回退或明确引入 404 策略；
4. 更新相应产品或设计文档。

## 状态模型

- **组件局部状态：** 表单/输入等仅由一个组件消费的状态；当前 AI prompt 使用 `useState`。
- **共享 UI 状态：** 侧边栏折叠、命令搜索和 AI 抽屉开关使用 `workspace-store.ts` 的 Zustand store。
- **URL 状态：** 当前页面由 `$pageId` 决定。
- **远端缓存：** QueryClient 已配置 `staleTime: 30_000` 与 `retry: 1`，但没有实际 query 或 mutation；不得从该配置推断数据访问约定。

所有 Zustand 状态是内存状态，刷新丢失。新增持久化或服务端状态前，先按 `ARCHITECTURE.md`、`SECURITY.md` 和 `RELIABILITY.md` 定义边界。

## 样式与组件

优先从 `@arco-design/web-react` 根入口导入组件、从 `@arco-design/web-react/icon` 导入图标。布局、间距、色彩和响应式优先使用 Tailwind v4；主题 token、全局字体和 Arco 覆盖集中在 `src/index.css`。视觉规则见 `DESIGN.md`。

处理 React/Arco 界面时使用 `.agents/skills/arco-design/SKILL.md`；设计 token、响应式或组件系统工作时使用 `.agents/skills/tailwind-design-system/SKILL.md`。Skill 是执行流程，本文不复制其步骤。

## 错误、异步与可访问性

当前没有错误边界、网络错误处理、加载组件或自动化可访问性检查。新增异步 UI 时必须设计可见的加载、空、失败与重试状态，并将行为与失败策略记录到相关设计文档和 `RELIABILITY.md`。

已有图标按钮使用部分 `aria-label`。新增交互应使用语义元素、可访问名称、键盘可达的焦点顺序，且不只依赖颜色传达状态。

## 验证与执行

| 检查 | 命令 | 依据 |
| --- | --- | --- |
| lint | `pnpm lint` | `eslint.config.js` |
| 类型检查与生产构建 | `pnpm build` | `package.json`；包含 `tsc -b` |
| 本地运行 | `pnpm dev` | `package.json` |

当前没有 `test` 脚本、组件测试、路由测试或 E2E。涉及路由、状态或异步行为的改动应补充合适测试，或明确记录测试缺口。ESLint 目前会扫描已跟踪的 `.vitepress/cache` 生成文件并失败，见 `QUALITY_SCORE.md`；不要通过关闭规则掩盖该问题。

## 工程不变量

- TypeScript 已启用 `noUnusedLocals` 与 `noUnusedParameters`；删除无用代码而非绕过检查。
- 用 `features`、`UI` 与 `stores` 的职责分界组织新增代码。
- 真实企业数据、密钥和令牌不得进入客户端代码或静态资源。
