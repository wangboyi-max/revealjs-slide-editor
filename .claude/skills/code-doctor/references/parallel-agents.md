# 并行 Agent 设计

根据文档 L1 索引的"关联模块"，并行启动多个后台 Agent：

| Agent | 检查文档 | 关联模块 |
|-------|---------|---------|
| Agent 1 | requirements.md | 编辑器布局、数据模型、拖拽系统、富媒体、导出 |
| Agent 2 | architecture.md | Electron、React、Canvas渲染、IPC通信 |

每个 Agent 独立工作，最终汇总结果。
