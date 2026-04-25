---
name: code-test
description: Reveal Editor 项目的自动化测试验证skill，运行测试、覆盖率检查和构建验证
---

# Reveal Editor 验证

自动化验证 Reveal Editor 项目的测试状态和构建成功。

## 触发场景
- "运行测试" / "run tests"
- "验证构建" / "verify build"
- "检查一致性" / "check consistency"
- "npm run check"
- "测试验证"
- `/code-test` - 完整验证
- `/code-test --check` - 仅 lint + typecheck
- `/code-test --test` - 仅运行测试
- `/code-test --coverage` - 测试 + 覆盖率
- `/code-test --build` - 仅构建

## 参数控制

支持精细化控制检查范围：

| 参数 | 功能 |
|------|------|
| `--check` | 只运行 lint + typecheck |
| `--test` | 只运行测试（不带覆盖率） |
| `--coverage` | 只运行测试 + 覆盖率检查 |
| `--build` | 只运行构建 |
| 无参数 | 运行全部检查 |

## Workflow

### 解析参数

根据传入参数决定执行范围：

| $ARGUMENTS | 执行内容 |
|-------------|----------|
| `--check` | `npm run lint` + `npm run typecheck` |
| `--test` | `npm test` |
| `--coverage` | `npm test -- --coverage` |
| `--build` | `npm run build` |
| 空或其他 | 完整验证（lint → test+coverage → build） |

### 执行检查

根据参数执行对应检查：
```bash
# 完整验证
npm run lint && npm run typecheck && npm test -- --coverage && npm run build

# 单项检查
npm run check    # lint + typecheck
npm test        # 测试
npm run build   # 构建
```

### 质量判定

根据测试结果判定：
| 结果 | 状态 | 操作 |
|------|------|------|
| 所有检查通过 | ✅ 绿色 | 报告完成 |
| 覆盖率不达标 | ⚠️ 警告 | 列出未达标模块 |
| 测试失败 | 🔴 失败 | 报告具体失败用例 |

## 覆盖率和用例标准

### 覆盖率阈值
- 行覆盖率: ≥80%
- 函数覆盖率: ≥90%
- 分支覆盖率: ≥70%
- stores/utils: 必须 ≥90%

### 测试有效性标准
- **独立性**: 测试之间无依赖
- **可重复性**: 相同输入 → 相同输出
- **执行速度**: 单个测试 ≤100ms
- **断言明确**: 至少 1 个 expect
- **命名**: it() 包含 "should"
- **无 any**: 禁止 any 类型