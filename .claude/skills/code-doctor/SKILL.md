---
name: code-doctor
description: 让AI直接读文档+读代码，语义对比检查Gap
---

# Code Doctor

让 AI 直接阅读文档和代码实现，进行语义对比，发现并记录文档与代码的不一致。

## 核心流程

1. 读取 docs/index.md → 获取文档索引
2. 读取所有关联文档 → 按 L1 摘要层解析
3. 并行启动后台 Agent → 各 Agent 检查对应模块
4. 汇总结果 → 合并 Gap 报告

并行 Agent 设计见 [references/parallel-agents.md](references/parallel-agents.md)

## 触发方式

```
/code-doctor
```

## 严重级别

| 级别 | 判断依据 |
|------|---------|
| 🔴 严重 | 功能完全缺失 或 核心架构不符 |
| 🟡 中等 | 功能部分实现 或 实现与文档不符 |
| 🟢 轻微 | 代码质量问题 |

详细标准见 [references/severity-levels.md](references/severity-levels.md)

## 输出格式

按 `docs/tech-debt-todo.md` 格式输出表格，新 Gap 自动追加。

格式说明见 [references/tech-debt-format.md](references/tech-debt-format.md)

## 验证方式

1. 运行 `/code-doctor`
2. 并行 Agent 输出 Gap 报告
3. 确认 Gap 判断符合预期
4. 检查 `docs/tech-debt-todo.md` 是否正确更新
