# 项目设计摘要

## 视觉基线

项目沿用 Arco Design 的清晰、一致、韵律、开放价值观，采用蓝色品牌色 `#165DFF`，浅蓝高亮背景 `#EFF5FF`，浅灰页面背景 `#F6F8FB`，8px 输入框圆角和 14px Modal 内容圆角。中文优先字体栈定义在 `src/index.css`。

## 组件策略

Arco Design 负责 Button、Input、Modal、Drawer、Avatar、Dropdown、Menu、Tooltip、Empty 和图标；`src/UI/` 只做轻量封装和项目 class 约定。Tailwind 负责布局、间距、颜色和响应式。

## 布局策略

顶部栏固定高度 64px；桌面端侧边栏宽 240px，收起后为 72px；内容区通过 margin 适配侧边栏状态。移动端隐藏侧边栏，保留顶部搜索入口。

## 交互原则

- 当前页面在导航和面包屑中均有清晰指示。
- 可折叠侧边栏在收起时通过 Tooltip 保持标签可发现性。
- 全局搜索支持键盘快捷键与显式按钮。
- AI 入口使用品牌浅色背景区分于普通导航，但不制造“已连接真实 AI”的误导。
- 反馈、加载、错误和空状态应在接入真实数据后补齐。

更完整的设计价值观与样式资料见同目录的原有 `DESIGN.MD` 内容，以及 `docs/design-docs/`。
