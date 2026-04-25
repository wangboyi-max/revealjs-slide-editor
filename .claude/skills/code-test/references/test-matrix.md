# Test Matrix

记录项目中所有可测试的模块及其测试状态：

| 模块 | 测试状态 | 覆盖率目标 | 备注 |
|------|----------|------------|------|
| presentationStore | ✅ 已覆盖 | ≥90% | 幻灯片状态管理 |
| imageUtils | ✅ 已覆盖 | - | 图片验证 |
| exportReveal | ✅ 已覆盖 | - | XSS防护测试 |
| Canvas组件 | ❌ 未覆盖 | ≥70% | 需补充 |
| uiStore | ❌ 未覆盖 | - | 需补充 |

## 覆盖率标准

### 量化指标
| 指标 | 目标值 | 测量方式 |
|------|--------|----------|
| 行覆盖率 (line coverage) | ≥80% | Vitest HTML reporter |
| 函数覆盖率 (function coverage) | ≥90% | Vitest HTML reporter |
| 分支覆盖率 (branch coverage) | ≥70% | Vitest HTML reporter |
| 关键模块覆盖率 | 100% | stores/utils 必须 ≥90% |

### 关键模块定义
- **stores/**: presentationStore.ts, uiStore.ts - 必须 ≥90%
- **utils/**: imageUtils.ts, exportReveal.ts - 必须 ≥90%
- **components/**: Canvas.tsx 等 - 目标 ≥70%

## 用例有效性标准

### 测试有效性检查表
每个测试必须通过以下有效性检查：

| 检查项 | 标准 | 不达标处理 |
|--------|------|------------|
| **独立性** | 测试之间无依赖，可任意顺序执行 | 重写测试 |
| **可重复性** | 相同输入必须产生相同输出 | 移除外部依赖或 mock |
| **执行速度** | 单个测试 ≤100ms | 优化或标记为慢速测试 |
| **断言明确** | 每个测试至少 1 个 expect | 添加断言 |
| **命名清晰** | it() 描述必须包含 "should" | 重写描述 |
| **无 any** | 测试代码中禁止 any 类型 | 使用具体类型 |

### 无效测试示例 (必须避免)
```typescript
// ❌ 无断言
it('should add slide', () => {
  store.addSlide();
});

// ❌ 使用 any
it('should handle data', () => {
  const result = processData(data as any); // 禁止
});

// ❌ 断言不明确
it('test', () => {
  expect(true).toBe(true); // 无意义
});

// ❌ 依赖执行顺序
it('second test', () => {
  expect(store.slides.length).toBe(2); // 依赖上一个测试
});
```
