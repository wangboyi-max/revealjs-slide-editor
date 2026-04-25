---
name: 架构设计
description: Reveal Editor技术架构文档
type: L1
关联模块: [Electron, React, Canvas渲染, IPC通信, 数据流]
前置依赖: 无
相关文档: [requirements.md]
---

## 覆盖范围

本文档描述 Reveal Editor 的技术架构，包括技术栈选型、核心架构设计、模块划分、数据流设计以及 IPC 通信机制。

## 不覆盖范围

- 具体业务需求（见 requirements.md）
- API 接口详细定义

---

## 1. 技术栈

核心技术栈为 Electron（跨平台桌面）、React 18（UI框架）、TypeScript（类型安全）、MUI v5（组件库）。渲染层使用 Canvas API 实现幻灯片绘制，配合 reveal.js 进行 HTML 导出。状态管理采用 Zustand 模式，文件持久化使用 JSON 格式。

---

## 2. 核心架构

编辑器采用所建即所得预览引擎架构，编辑器的每一个操作都会实时反映在预览区域。核心渲染引擎基于 Canvas API 实现，通过解析幻灯片数据模型生成可视化的幻灯片界面。主进程负责窗口管理和系统级操作，渲染进程负责 UI 交互和数据展示，两者通过 IPC 进行通信。

---

## 3. 模块设计

主要模块包括：Canvas 模块负责幻灯片的绘制和交互；SlideList 模块管理幻灯片列表和排序；Toolbox 模块提供工具栏和元素选择；PropertyPanel 模块展示和编辑元素属性；ExportModule 模块处理导出逻辑。各模块通过 Zustand Store 共享状态，通过事件系统解耦。

### 3.1 双模式编辑器

编辑器支持**可视化模式**和**代码模式**两种编辑视图：

| 模式 | 说明 |
|------|------|
| 可视化模式 | 默认模式，通过拖拽编辑幻灯片元素，所见即所得 |
| 代码模式 | 左侧代码编辑器 + 右侧实时预览，双向同步 |

**代码编辑器布局（代码模式）**：
```
┌─────────────────────────────────────────────────────────────┐
│  [可视化] [代码] ← 模式切换                                │
├───────────────────────────────┬─────────────────────────────┤
│                               │                             │
│   代码编辑器                   │   实时预览                  │
│   (Monaco Editor)             │   (reveal.js)              │
│                               │                             │
│   - HTML/CSS/JS语法高亮        │   - 代码变化实时反映        │
│   - 自动补全                   │   - 支持播放控制            │
│   - 错误提示                   │                             │
│                               │                             │
├───────────────────────────────┴─────────────────────────────┤
│  状态栏: 行 1, 列 1 │ 同步状态                            │
└─────────────────────────────────────────────────────────────┘
```

**代码编辑器组件**：
- 使用 CodeMirror 或 Monaco Editor 实现代码编辑
- 语法高亮支持 HTML/CSS/JavaScript
- 实时同步：可视化编辑 ↔ 代码编辑双向绑定
- 错误提示：代码错误时显示警告，不影响可视化预览

**同步机制**（代码和预览始终双向同步）：
```
编辑器编辑（可视化/代码） → JSON数据模型 → 预览更新
                                               ↕ (共享同一数据源，始终同步)
代码模式时：代码编辑器 ← JSON数据模型
```

**架构复用设计**：
- 可视化模式：显示画布+属性面板，隐藏代码编辑器
- 代码模式：显示代码编辑器+预览，隐藏画布编辑交互
- 底层共享同一JSON数据模型，双向同步始终生效

### 3.2 画布架构（Viewport + Stage）

画布采用 **Viewport（外层交互层） + Stage（内层固定尺寸舞台） 两层结构**，Reveal.js 在 Stage 内部初始化但**不参与缩放**，所有缩放和平移由外层 transform 控制。这样保证编辑预览与导出 HTML 像素级一致，并解决了窗口尺寸变化时画布消失、Reveal 内部 layout 与编辑器交互冲突的问题。

**两层结构**：
| 层 | 职责 |
|----|------|
| Viewport | 占满 flex 区域，`overflow:hidden`，监听 pointer/wheel/键盘事件，使用 ResizeObserver 监听自身尺寸变化 |
| Stage | 固定逻辑分辨率 **1280×720**（标准 16:9），`position:absolute` 居中，通过 `transform: translate(panX,panY) scale(zoom/100)` 控制平移与缩放 |

**Reveal.js 配置**：在 Stage 内部初始化，使用 `embedded:true, width:1280, height:720, margin:0, minScale:1, maxScale:1`。`minScale=maxScale=1` 显式禁用 Reveal 自身的缩放计算，让外层 transform 成为唯一缩放源。

**状态绑定**：所有画布交互状态集中在 `uiStore`：`zoom`（25/50/75/100/125/150/200/300/400 档位，clamp 到 [25,400]）、`panX`/`panY`、`isPanning`、`spaceDown`，配套 actions：`setZoom`/`zoomIn`/`zoomOut`/`setPan`/`resetView`/`setIsPanning`/`setSpaceDown`。

**编辑/导出一致性**：Stage 尺寸 1280×720 必须与 `exportReveal.ts` 中 Reveal.initialize 的 `width:1280, height:720, margin:0` 严格保持一致 — 这是「编辑预览 = 导出效果」硬约束的实现基础。**修改画布尺寸时，两处必须同步修改**。

**Wheel 事件特殊处理**：Ctrl+滚轮缩放必须使用原生 `addEventListener('wheel', fn, { passive: false })`，**不能**使用 React 合成事件 `onWheel`。原因：React 合成 wheel 事件默认 passive，调用 `preventDefault()` 会抛出 `Unable to preventDefault inside passive event listener invocation` 错误。

**交互方式**：
- 平移：中键拖动 / Space+左键拖动 / 空白处左键拖动（通过 `data-element-id` + `closest()` 检测点击是否落在元素上）
- 缩放：Ctrl+滚轮 / Ctrl+= / Ctrl+- / Ctrl+0（resetView）
- 工具栏：缩小/百分比按钮（点击重置）/放大

**HMR 友好**：Reveal 实例使用本地 ref 管理，cleanup 时调用 `destroy()`；不使用模块级全局标志，避免热更新产生双实例。

---

## 4. 数据流

数据模型采用 JSON 结构存储幻灯片信息，包含 slides（幻灯片数组）、metadata（元数据）、settings（配置）三个顶层字段。每张幻灯片包含 id、background、elements（元素数组）等属性。数据流遵循「用户操作 → Store Action → State 更新 → 视图重绘」的单向数据流模式，最终导出时将 JSON 模型转换为 reveal.js HTML 结构。

---

## 5. IPC通信

主进程与渲染进程通过 Electron IPC 进行通信，主进程负责文件系统访问、系统对话框、窗口管理等功能，渲染进程通过 ipcRenderer.invoke 调用主进程方法。文件保存、文件打开、导出操作均通过 IPC 触发主进程相应。IPC 通道采用命名空间区分，如 `file:save`、`file:open`、`export:html`。

---

## 6. 代码检视流程

每个开发阶段完成后，必须进行代码检视，确保实现遵从架构设计：

### 检视步骤
1. **对照本文档**：检查架构实现是否遵从设计
2. **对照requirements.md**：检查功能实现是否完整
3. **发现问题**：记录不一致之处
4. **修改**：如架构不符，修改代码；如文档有误，修改文档

### 检视清单
| 检视项 | 检查点 |
|--------|--------|
| 模块划分 | 各模块职责是否清晰，接口是否合理 |
| 数据流 | 单向数据流是否遵循，状态管理是否正确 |
| IPC通信 | 主/渲染进程职责是否分离，通道命名是否规范 |
| 双模式 | 可视化/代码模式切换是否正确，代码编辑器是否始终同步 |
| 组件结构 | 组件划分是否合理，层级是否清晰 |

### 检视原则
- 实现必须遵从架构设计文档
- 检视结果记录在PR/Commit中
- 不达标必须修改直到符合文档