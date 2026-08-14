# 架构总览

## 用途与范围

本文是当前实现的系统地图，而不是产品规格或未来服务架构。它说明浏览器端原型如何组织；交互细节见 `docs/design-docs/`，产品目标见 `docs/product-specs/`，前端工程规则见 `docs/FRONTEND.md`。

## 系统形态

```text
浏览器
  └─ Vite 单页应用
       └─ React Provider 树
            └─ TanStack Router
                 └─ WorkspaceShell 与 UI 封装
```

运行时由 `index.html` 加载 `src/main.tsx`。入口配置 Arco `ConfigProvider`、TanStack Query `QueryClientProvider` 和 `RouterProvider`。当前不存在服务端、网络请求、数据库、认证、持久化或真实 AI 服务。

## 仓库拓扑

| 位置 | 职责 |
| --- | --- |
| `src/main.tsx` | React 挂载、全局样式和 Provider。 |
| `src/router.tsx` | `/` 与 `/$pageId` 路由树。 |
| `src/features/workspace/` | 工作台壳、静态导航、占位内容和交互编排。 |
| `src/UI/` | 可跨功能复用的 Arco 轻量封装与 AI 抽屉。 |
| `src/stores/` | Zustand 共享 UI 开关状态。 |
| `src/index.css` | Tailwind v4 token、全局基础样式与 Arco 覆盖。 |
| `docs/` | 版本化的项目知识与 VitePress 文档源。 |
| `.agents/skills/` | 可重复的专用 Agent 工作流。 |

## 当前运行与数据流

1. `main.tsx` 创建单个 QueryClient（查询 `staleTime` 为 30 秒、失败重试一次）并挂载路由器。
2. `router.tsx` 为根路径和 `$pageId` 动态路径渲染同一个 `WorkspaceShell`。
3. `WorkspaceShell` 从路由参数选择静态 `navItems`；未知 ID 回退到“我的工作台”。
4. 侧边栏、命令搜索和 AI 抽屉的开关状态由 `workspace-store.ts` 保存于内存；AI 输入保存在抽屉组件本地 state。刷新后均会丢失。

TanStack Query 仅是未来远端数据访问的预置 Provider；没有 query、mutation、请求客户端或缓存失效逻辑。

## 依赖边界

当前结构按职责约定，而非由结构测试强制：

```text
features → UI / stores / router library
UI       → Arco Design / local styles
stores   → Zustand
main     → providers + router
```

- 页面和领域界面放在 `src/features/`；不可把新的页面能力继续堆入全局入口。
- `src/UI/` 只承载跨功能复用的控件封装，不承载领域页面或数据访问。
- `src/stores/` 只保存共享客户端 UI 状态；局部输入优先保留在组件内。
- 路由集中在 `src/router.tsx`，可访问页面或导航变动需同步审查路由和 `navItems`。

## 架构不变量

| 不变量 | 原因 | 当前执行方式 |
| --- | --- | --- |
| 原型内容不得被表述为真实企业数据或已接入 AI 的能力。 | 目前所有业务内容均为静态演示。 | 代码审查；`docs/design-docs/core-beliefs.md`。 |
| 未知 `pageId` 必须有明确结果。 | 避免动态路由渲染空页面。 | `WorkspaceShell` 的导航项回退。 |
| 前端不得包含密钥、令牌或真实企业数据。 | 浏览器包与静态资源是公开客户端边界。 | `docs/SECURITY.md`；尚无自动扫描。 |
| 新服务边界需要先有架构、安全、可靠性和执行计划说明。 | 当前仓库没有相应运行时契约。 | 文档与评审约束；见 `docs/PLANS.md`。 |

## 未实现的横切能力

认证、授权、租户隔离、服务端数据访问、错误边界、监控、日志和部署配置均未实现。它们不是现有架构层，接入时不得从本文档推断具体方案。

## 下一步阅读

- 前端实现与验证：`docs/FRONTEND.md`
- 设计语言和交互原则：`docs/DESIGN.md`、`docs/design-docs/`
- 产品判断与具体行为：`docs/PRODUCT_SENSE.md`、`docs/product-specs/`
- 安全与可靠性边界：`docs/SECURITY.md`、`docs/RELIABILITY.md`
- 复杂工作计划：`docs/PLANS.md`、`docs/exec-plans/`
- 当前质量缺口：`docs/QUALITY_SCORE.md`
