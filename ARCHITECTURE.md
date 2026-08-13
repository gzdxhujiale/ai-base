# 架构总览

## 当前状态

本项目是 Vite 驱动的单页 React 前端原型，包名为 `ai-base`，版本 `0.0.0`。运行时从 `index.html` 加载 `src/main.tsx`，目前只有浏览器端状态，没有服务端或数据存储层。

## 结构

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

### 主要模块

| 模块 | 位置 | 责任 |
| --- | --- | --- |
| 应用启动 | `src/main.tsx` | 挂载 React、全局 Provider 和基础样式 |
| 路由 | `src/router.tsx` | 根路径及 `/$pageId` 动态页面路由 |
| 工作台壳 | `src/features/workspace/WorkspaceShell.tsx` | 顶部栏、导航、占位内容和弹层编排 |
| UI 封装 | `src/UI/` | Arco Button、Input、Modal 以及 AI Drawer |
| UI 状态 | `src/stores/workspace-store.ts` | 侧边栏、命令搜索、AI 抽屉的开关状态 |
| 样式 | `src/index.css` | Tailwind 主题、字体、控件和弹层覆盖样式 |

## 数据流

当前导航由 `WorkspaceShell` 内的静态 `navItems` 驱动；页面切换通过 TanStack Router 更新 URL，状态开关通过 Zustand 更新。TanStack Query 已初始化并设置 30 秒 `staleTime`、失败重试 1 次，但尚无 query 或 API 调用。

## 关键约束

- `pageId` 未匹配时回退到“我的工作台”，因此动态路由不会导致空页面。
- 桌面端侧边栏固定在顶部栏下方；小屏隐藏侧边栏，顶部搜索按钮切换为移动端入口。
- 命令搜索目前只过滤静态导航项；输入框聚焦或 `⌘/Ctrl + K` 会打开 Modal。
- AI 抽屉目前只填充提示词，发送按钮没有接入提交逻辑。

## 演进方向

后续接入真实业务时，建议保持“页面壳 / 领域页面 / 数据访问 / 全局状态”分层，避免把 API 调用和领域逻辑继续堆入 `WorkspaceShell`。详见 `docs/PLANS.md`。
