> 所有发现的问题都记录在债务清单里，只保留这一个表格，本文档需要保持简洁，更新时，请在## 更新记录章节里增加记录

---

## 债务清单

| # | 等级 | 问题 | 文档描述 | 实际情况 | 修复方案 | 状态 |
|---|------|------|---------|---------|----------|------|
| TD-001 | 🔴严重 | 双模式编辑器缺失 | requirements.md + architecture.md 描述可视化/代码双模式，需要 Monaco/CodeMirror | 无模式切换机制，无代码编辑器组件 | 需确认：实现代码编辑器 或 删除文档描述 | [ ] |
| TD-002 | 🔴严重 | 状态管理方案不符 | architecture.md: React Context + useReducer | 实际使用 Zustand | 需确认：保留 Zustand 更新文档 或 重构 | [ ] |
| TD-003 | 🟡中等 | PropertiesPanel 未连接数据 | requirements.md: "元素选中后直接显示属性面板" | 硬编码静态UI，不显示/修改选中元素属性 | 连接 presentationStore，按元素类型显示属性 | [ ] |
| TD-004 | 🟡中等 | StatusBar 显示硬编码值 | 应显示当前幻灯片状态和缩放 | "Slide 1/3" "100%" 固定值 | 从 store 读取 currentSlideIndex + zoom | [ ] |
| TD-005 | 🟢轻微 | 文件结构与 CLAUDE.md 不符 | 期望 `components/Canvas/Canvas.tsx` 嵌套结构 | 扁平结构 `components/Canvas.tsx` | 需确认：调整代码结构 或 更新 CLAUDE.md | [ ] |
| TD-006 | 🟢轻微 | 缺少复制/粘贴功能 | requirements.md: Ctrl+C/V | 仅 Ctrl+Z/Y 撤销/重做 | 实现 clipboard 快捷键 | [ ] |
| CR-001 | 🔴严重 | XSS 风险 | 无 | Canvas.tsx:87 dangerouslySetInnerHTML 直接渲染用户输入的 HTML | 使用 DOMPurify 库对 HTML 进行消毒处理 | [ ] |
| CR-002 | 🔴严重 | IPC 类型安全 | 无 | Toolbar.tsx:32,52 使用 window.postMessage 而非类型安全的 IPC | 使用 preload 暴露的 typed IPC API 替代 | [ ] |
| CR-003 | 🟡中等 | useEffect 内存泄漏 | 无 | App.tsx:16-51 依赖数组为空，组件卸载后 timer 可能仍在运行 | 在 cleanup 函数中清除 timer | [ ] |
| CR-004 | 🟡中等 | 依赖引用频繁变化 | 无 | useKeyboardShortcuts.ts:27 依赖数组中函数引用变化导致 listener 频繁重新注册 | 使用 useCallback 包裹依赖函数，或使用 ref 存储 | [ ] |
| CR-005 | 🟡中等 | generateId() 重复 ID 风险 | 无 | presentationStore.ts:71-74 Date.now() + idCounter，同一毫秒内多次调用产生重复 ID | 使用 UUID 或递增原子计数器 | [ ] |
| CR-006 | 🟡中等 | PropertiesPanel 无实际功能 | 无 | PropertiesPanel.tsx:39-82 仅渲染 UI 控件，与 store 没有连接，无 onChange/value 绑定 | 连接 Zustand store 实现属性编辑功能 | [ ] |
| CR-007 | 🟡中等 | StatusBar 硬编码内容 | 无 | StatusBar.tsx:17-25 "就绪"、"Slide 1 / 3"、"100%" 硬编码 | 从 store 动态获取状态数据 | [ ] |
| CR-008 | 🟢轻微 | SlideList 删除无确认 | 无 | SlideList.tsx:77 删除 slide 前没有确认对话框 | 添加 window.confirm() 确认 | [ ] |
| CR-009 | 🟢轻微 | off 方法无法取消订阅 | 无 | preload/index.ts:52-55 removeListener 传入的 callback 与注册时的不是同一引用 | 返回 unsubscribe 函数，内部调用 removeEventListener | [ ] |
| CR-010 | 🟢轻微 | 错误信息缺少上下文 | 无 | ipc-handlers.ts:11,20 错误信息仅包含异常消息，缺少操作名称、文件路径等上下文 | 添加操作名称、文件路径等上下文信息 | [ ] |
| CR-011 | 🟢轻微 | Audio/Video 非受控组件 | 无 | AudioElement.tsx, VideoElement.tsx:21-25 使用 ref 赋值 src 属性，非 React 受控组件模式 | 改为受控组件模式，属性通过 props 传递 | [ ] |

## 更新记录

- 2026/04/25: 初始化技术债务看板
- 2026/04/25: 添加代码检视问题 (CR-001 ~ CR-011)，合并为单一债务清单