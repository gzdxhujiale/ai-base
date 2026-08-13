# AI Base 项目协作指南

## 项目定位

`ai-base` 是一个企业工作台前端原型。当前代码主要用于验证信息架构、导航、全局搜索入口和企业 AI 侧边抽屉的交互，不应把占位数据或占位页面当作已上线业务能力。

## 开发入口

- 安装依赖：`pnpm install`
- 本地开发：`pnpm dev`
- 类型检查与生产构建：`pnpm build`
- 代码检查：`pnpm lint`
- 预览构建：`pnpm preview`
- 文档站开发：`pnpm docs:dev`
- 文档站构建：`pnpm docs:build`
- 文档站预览：`pnpm docs:preview`

## 代码约定

- 使用 React + TypeScript，组件采用函数式写法。
- 页面级能力放在 `src/features/`，通用 UI 封装放在 `src/UI/`，客户端状态放在 `src/stores/`。
- 路由集中在 `src/router.tsx`；新增页面需要同时补充路由、导航项和对应的产品/设计文档。
- 样式以 Tailwind CSS 工具类为主，跨组件的基础样式放在 `src/index.css`。
- UI 组件优先使用 Arco Design；只有在产品确实需要时才添加新的视觉模式。
- 避免引入未使用的状态、参数和依赖。TypeScript 已启用 `noUnusedLocals` 与 `noUnusedParameters`。

## 工作边界

当前没有后端 API、数据库、认证、持久化或真实 AI 服务接入。新增这些能力时，应先更新 `ARCHITECTURE.md`、`docs/SECURITY.md`、`docs/RELIABILITY.md` 及对应执行计划。

## 完成标准

每次改动至少运行与风险匹配的检查。UI 改动应运行 `pnpm build` 和 `pnpm lint`；涉及路由、状态或异步数据时，应补充交互测试或明确记录当前测试缺口。

## 文档维护

AI coding 知识库入口见 `ARCHITECTURE.md` 和 `docs/PLANS.md`；VitePress 独立站配置在根目录 `.vitepress/`，站点内容在 `docs-site/`，不要把站点配置、首页或构建产物放入 `docs/`。文档中的“当前实现”必须能在代码中找到依据；规划内容使用“计划”或“待实现”标注。
