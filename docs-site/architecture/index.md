# 架构总览

本项目是 Vite 驱动的单页 React 前端原型，运行时从 `index.html` 加载 `src/main.tsx`。

```text
index.html
└── src/main.tsx
    ├── Arco ConfigProvider
    ├── TanStack QueryClientProvider
    └── TanStack RouterProvider
        └── WorkspaceShell
            ├── 顶部栏与企业切换入口
            ├── 可折叠侧边导航
            ├── 全局命令搜索 Modal
            └── 企业 AI Drawer
```

主要模块：

- `src/router.tsx`：根路径及 `/$pageId` 动态页面路由。
- `src/features/workspace/WorkspaceShell.tsx`：工作台壳、导航、占位内容和弹层编排。
- `src/UI/`：Arco Button、Input、Modal 以及 AI Drawer 封装。
- `src/stores/workspace-store.ts`：侧边栏、命令搜索和 AI 抽屉的 UI 状态。

当前没有后端 API、数据库、认证、持久化或真实 AI 服务。完整说明见根目录的 `ARCHITECTURE.md`。
