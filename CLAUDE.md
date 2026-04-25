# 代码开发规范

## Clean Code原则

### 命名规范
- **变量/函数**：使用camelCase，见名知意
  - ✅ `getUserName()`, `isLoading`, `slideElements`
  - ❌ `getUser()`, `flag`, `arr`
- **组件**：使用PascalCase
  - ✅ `SlideList`, `PropertyPanel`
  - ❌ `slide_list`, `slideListComponent`
- **常量**：使用UPPER_SNAKE_CASE
  - ✅ `MAX_FILE_SIZE`, `DEFAULT_ZOOM`
- **类型/接口**：使用PascalCase，可加前缀 `I`
  - ✅ `Slide`, `ImageElement`, `ISlideProps`

### 函数设计
- **单一职责**：每个函数只做一件事
  - ✅ `addSlide()`, `deleteSlide()`, `updateElement()`
  - ❌ `addSlideAndUpdateUIAndSave()` - 分离为多个函数
- **参数限制**：不超过3个参数，超过使用对象
  ```typescript
  // ✅ 好
  function createElement(type: string, props: { position: Position; size: Size })
  // ❌ 差
  function createElement(type, x, y, width, height, content, style)
  ```
- **早期返回**：减少嵌套层级
  ```typescript
  // ✅ 好 - 早期返回
  function processSlide(slide) {
    if (!slide) return;
    if (slide.elements.length === 0) return;
    // 主逻辑
  }
  // ❌ 差 - 嵌套过深
  function processSlide(slide) {
    if (slide) {
      if (slide.elements.length > 0) {
        // 主逻辑
      }
    }
  }
  ```

### 代码组织
- **DRY原则**：不要重复自己
  - 相同逻辑抽离为公共函数/hooks
  - 相同样式抽离为CSS变量或组件
- **YAGNI原则**：不要过度设计
  - 只实现当前需要的功能
  - 不预留"将来可能需要"的接口

## React/组件规范

### 组件设计
- **函数组件优先**：使用React Hooks
- **Props接口**：定义明确的TypeScript接口
  ```typescript
  interface SlideListProps {
    slides: Slide[];
    currentIndex: number;
    onSelect: (index: number) => void;
    onDelete: (id: string) => void;
  }
  ```
- **组件拆分**：按职责拆分，单个组件不超过200行
  - ✅ `<SlideList>`, `<SlideThumbnail>`, `<AddSlideButton>`
  - ❌ `<SlideListWithEverything>` (超过500行)

### Hooks规范
- **自定义Hooks**：复用逻辑抽离为自定义Hooks
  - ✅ `useSlides()`, `useSelection()`, `useDragDrop()`
- **Hooks命名**：必须以 `use` 开头
- **依赖管理**：useEffect/useCallback依赖要完整

### State管理
- **状态位置**：
  - 组件内部：UI状态（弹窗开关、临时输入）
  - Zustand Store：跨组件共享状态（幻灯片数据、选中元素）
- **不可变性**：更新状态使用展开运算符
  ```typescript
  // ✅ 好
  setSlides([...slides, newSlide])
  // ❌ 差 - 直接修改
  slides.push(newSlide)
  ```

## TypeScript规范

### 类型设计
- **避免any**：使用unknown + 类型守卫，或具体类型
  ```typescript
  // ✅ 好
  function processData(data: unknown) {
    if (isSlideData(data)) { /* ... */ }
  }
  // ❌ 差
  function processData(data: any) { /* ... */ }
  ```
- **接口 vs 类型别名**：
  - 接口：描述对象结构，可扩展
  - 类型别名：联合类型、交叉类型、元组
- **严格模式**：开启strict，strictNullChecks

### 类型导出
- **集中导出**：types目录统一导出公共类型
- **避免循环依赖**：A→B→C→A会导致编译问题

## Electron规范

### 主进程 vs 渲染进程
- **主进程**：窗口管理、文件系统、IPC处理、系统对话框
- **渲染进程**：UI渲染、用户交互、业务逻辑
- **禁止**：渲染进程禁止直接访问Node.js API

### IPC通信
- **通道命名**：使用命名空间 `module:action`
  - ✅ `file:save`, `file:open`, `export:html`
- **类型安全**：定义IPC接口类型
- **错误处理**：所有IPC调用必须有错误处理

## 文件结构规范

```
src/
├── main/                    # Electron主进程
│   ├── index.ts            # 入口，窗口创建
│   ├── ipc-handlers.ts     # IPC处理
│   └── menu.ts             # 菜单
├── preload/                 # 预加载脚本
│   └── index.ts            # 暴露安全API
└── renderer/               # React应用
    ├── components/         # UI组件
    │   ├── Canvas/
    │   │   ├── Canvas.tsx
    │   │   ├── Canvas.test.tsx
    │   │   └── index.ts
    │   └── common/         # 公共组件
    ├── stores/             # Zustand stores
    │   ├── presentationStore.ts
    │   └── uiStore.ts
    ├── hooks/              # 自定义Hooks
    ├── utils/              # 工具函数
    └── types/              # TypeScript类型
```

### 文件命名
- **组件文件**：PascalCase.tsx
- **工具文件**：camelCase.ts
- **测试文件**：原文件名.test.ts(x)
- **入口文件**：index.ts(x)

## 测试规范

### 单元测试
- **测试文件位置**：与被测文件同目录
- **测试命名**：`describe`描述模块，`it`描述行为
  ```typescript
  describe('presentationStore', () => {
    it('addSlide should add a new slide to slides array', () => { /* ... */ });
  });
  ```
- **覆盖率目标**：
  - stores/utils: ≥90%
  - components: ≥70%

### 测试原则
- **独立性**：每个测试不依赖其他测试
- **可重复**：测试结果稳定，不受外部影响
- **可读性**：测试名称清晰表达意图
- **快速**：单元测试应在100ms内完成

## 代码检视检查清单

### 功能检视
- [ ] 实现是否完整？对照requirements.md
- [ ] 架构是否正确？对照architecture.md
- [ ] 是否有冗余代码？

### 代码质量
- [ ] 命名是否清晰？
- [ ] 是否有重复代码？
- [ ] 函数是否过长？
- [ ] 是否有类型any？
- [ ] 注释是否必要？（代码本身应自解释）

### 技术检视
- [ ] React组件是否函数组件？
- [ ] 状态更新是否遵循不可变性？
- [ ] useEffect依赖是否完整？
- [ ] IPC调用是否有错误处理？