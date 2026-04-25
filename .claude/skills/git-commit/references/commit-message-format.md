# 提交信息格式规范

采用 [Conventional Commits](https://www.conventionalcommits.org/) 标准。

## 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Type 类型

| Type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | 修复 bug |
| `docs` | 文档更新 |
| `style` | 代码格式（不影响功能） |
| `refactor` | 重构（非新功能非修复） |
| `test` | 测试相关 |
| `chore` | 构建/工具/依赖 |

## Scope 范围（可选）

表示影响的模块:
- `store` - 状态管理
- `component` - 组件
- `canvas` - 画布
- `export` - 导出
- `ipc` - 进程通信
- `build` - 构建

## Subject 主题

- 使用祈使语气: "add" 而非 "added" / "adds"
- 首字母小写
- 不超过 50 字符
- 不使用句号结尾

## 示例

### 功能
```
feat(canvas): add drag-and-drop for slide elements
```

### 修复
```
fix(store): prevent state corruption when deleting active slide
```

### 重构
```
refactor(component): extract PropertyPanel into separate component
```

### 破坏性变更
```
feat(ipc)!: change file:save response structure

BREAKING CHANGE: file:save now returns {success: boolean, path: string}
```

### 带 body 和 footer
```
fix(canvas): correct element position calculation

The previous calculation didn't account for canvas offset.
This caused elements to appear offset when canvas wasn't at (0,0).

Closes #123
```

---

## 快速生成规则

当调用 `/git-commit` 时:
1. 如果参数已是完整格式，直接使用
2. 如果参数是简单描述，自动格式化为 `feat(scope): description`
3. 如果无参数，根据 staged changes 自动生成