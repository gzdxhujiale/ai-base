# AI Base 仓库协作指南

## 项目

`ai-base` 是单一的 Vite + React + TypeScript 企业工作台前端原型。它用于验证工作台壳、导航、全局命令搜索和企业 AI 侧边抽屉；界面展示的数据与占位页均不是已上线能力。

核心技术栈：

- React 19、TypeScript 6、Vite 8
- TanStack Router、Zustand、TanStack Query
- Arco Design、Tailwind CSS v4

当前实现和系统边界见 `ARCHITECTURE.md`。仓库没有后端 API、认证、数据库、持久化或真实 AI 服务。

## 仓库地图

- `src/main.tsx`：应用入口和全局 Provider。
- `src/router.tsx`：`/` 与 `/$pageId` 的路由树。
- `src/features/`：页面级和领域 UI；目前 `features/workspace/WorkspaceShell.tsx` 编排工作台壳。
- `src/UI/`：跨功能的 Arco 组件封装与 AI 抽屉。
- `src/stores/`：客户端共享 UI 状态。
- `src/index.css`：Tailwind 主题 token、跨组件样式和 Arco 覆盖样式。
- `docs/`：核心知识与 VitePress 文档源；站点由 `.vitepress/config.mts` 配置。
- `.agents/skills/`：仓库安装的专用工作流。

## 命令

安装依赖：

    pnpm install

开发或预览应用：

    pnpm dev
    pnpm preview

校验应用代码：

    pnpm lint
    pnpm build

`pnpm build` 会先运行 TypeScript project build（`tsc -b`），再运行 Vite 生产构建。仓库当前没有测试脚本；不要虚构测试命令。

开发或校验文档站：

    pnpm docs:dev
    pnpm docs:build
    pnpm docs:preview

## 工程约束

- 除非任务明确授权新增服务边界，否则保持应用为纯客户端原型。接入后端 API、认证、持久化、数据库访问或真实 AI 前，必须更新 `ARCHITECTURE.md`、`docs/SECURITY.md`、`docs/RELIABILITY.md` 和相关执行计划。
- 当前 UI 中的名称、企业数据、导航内容与 AI 建议均为演示数据；不得将其表述为实时数据或已接入 AI 的能力。
- 路由定义集中在 `src/router.tsx`。当前动态 `$pageId` 路由会把未知 ID 回退到工作台；调整导航时必须保留或有意替换该行为。
- 页面/领域 UI 放在 `src/features/`，跨功能复用的 UI 封装放在 `src/UI/`，仅把共享的客户端 UI 状态放在 `src/stores/`。
- 使用函数式 React 组件。TypeScript 会拒绝未使用的本地变量和参数；应删除它们，而非绕过检查。
- 优先使用 Arco Design 的组件和图标。组件布局与响应式样式使用 Tailwind 工具类；主题 token 和共享 Arco 覆盖样式集中在 `src/index.css`。
- 用户输入、URL 值、远端数据和 AI 输出都属于不可信输入。不得在 `src/` 或静态资源中硬编码密钥、令牌或真实企业数据。

## 任务工作流

### 编辑前

1. 确定受影响模块，并查看相邻代码和既有模式。
2. 判断是否有匹配的仓库 Skill；只加载相关 Skill。
3. 当任务涉及行为、设计、产品范围、安全、可靠性或计划时，阅读下方路由的文档。
4. 查找受影响行为的既有验证；当前仓库没有自动化测试套件。

### 编辑中

- 保持改动聚焦，优先扩展现有组件或状态，而不是建立并行模式。
- 对可访问页面或导航的改动，按需同时更新 `src/router.tsx` 和 `WorkspaceShell.tsx` 中的 `navItems`，并记录产品或交互变化。
- 对跨组件视觉改动，先复用现有颜色/字体 token 和项目 UI 封装，再添加新的视觉模式。
- 不要仅为替换占位内容就新增真实数据访问、认证、持久化或 AI 请求。
- 面向文档站和项目知识的内容应编辑 `docs/`；不要另建或维护并行文档镜像。

### 完成前

- 检查最终 diff，排除无关改动和过时的演示能力表述。
- 按改动风险运行验证；可行时实际操作受影响的用户界面。
- 当公共行为、架构边界或执行计划变化时更新文档。

## Skills

仓库专用工作流位于 `.agents/skills/`。

- React 界面或 Arco 组件任务：使用 `.agents/skills/arco-design/SKILL.md`。
- Tailwind v4 设计 token、响应式模式或组件系统任务：使用 `.agents/skills/tailwind-design-system/SKILL.md`。
- 优先使用匹配的 Skill，而不是临时发明工作流；只跟随其中相关的引用资料。不要在本文件复制 Skill 流程。

## 文档路由

处理以下任务时：

- 当前应用结构、Provider、路由或原型边界 → `ARCHITECTURE.md`
- 前端职责、样式、路由或构建检查 → `docs/FRONTEND.md`
- 视觉基线或组件策略 → `docs/DESIGN.md`；交互决策 → `docs/design-docs/`
- 产品行为或新用户引导 → `docs/product-specs/`
- 安全敏感代码或新的信任边界 → `docs/SECURITY.md`
- 可靠性、异步任务或可观测性 → `docs/RELIABILITY.md`
- 路线图、非目标或实施计划 → `docs/PLANS.md` 与 `docs/exec-plans/`
- VitePress 导航或站点配置 → `.vitepress/config.ts`

仓库根目录的 `DESIGN.MD` 是大型参考资料副本，而非精简的项目设计事实来源；项目规则以 `docs/DESIGN.md` 为准。

## 验证

- UI、TypeScript、状态或路由改动：运行 `pnpm lint` 与 `pnpm build`。
- 文档站改动：运行 `pnpm docs:build`。
- 新增异步行为或复杂交互：随功能添加适当的自动化覆盖，或明确记录当前测试缺口；仓库目前未配置测试运行器。
- 可行时手动检查受影响路由和交互。

## 应做 / 不应做

应做：

- 在代码和文档中明确区分当前实现与计划中的工作。
- 对实质性计划工作，在 `docs/exec-plans/active/` 新建或更新执行计划；完成后移至 `completed/`。

不应做：

- 为通过检查而禁用 ESLint 或 TypeScript 规则。
- 将静态原型内容当作生产契约。
- 为同一知识建立并行维护的文档镜像。
