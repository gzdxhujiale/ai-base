# Skills 治理

## 职责边界

`AGENTS.md` 负责将任务路由到代码、文档或 Skill；`docs/` 记录可长期维护的项目知识；`.agents/skills/` 保存可重复执行的专用工作流。不要在多个位置复制同一套操作步骤。

## 当前 Skills

| Skill | 适用任务 | 事实来源 |
| --- | --- | --- |
| `arco-design` | React 界面、Arco 组件、布局、表单与交互实现。 | `.agents/skills/arco-design/SKILL.md` |
| `tailwind-design-system` | Tailwind v4 token、响应式模式和组件系统工作。 | `.agents/skills/tailwind-design-system/SKILL.md` |

安装来源和内容哈希记录在 `skills-lock.json`。实际 Skill 流程及其参考资料以各自的 `SKILL.md` 为准。

## 使用规则

1. 先判断任务是否匹配 Skill 的 description。
2. 只读取并执行匹配 Skill 及其必要引用；不批量加载无关 Skills。
3. Skill 解决“如何重复执行某类工作”；架构、产品、安全和可靠性规则仍以对应 `docs/*.md` 为准。
4. 当一个 Skill 与代码、配置或长期文档冲突时，优先相信可执行配置与当前代码，并修正过时知识。

## 不应使用 Skill 的情形

- 仅需要理解系统、产品或安全边界时，先读相应知识文档。
- 一次性实现细节、临时调试记录或团队全局约束不应被包装为 Skill。
- 可以由 TypeScript、ESLint、测试或 CI 机械执行的规则，不应只依赖 Skill 文字提醒。

创建或评审 Skill 时阅读 [Skill 编写](./skill-authoring.md)。
