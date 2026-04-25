---
name: run-gui
description: 构建并启动 Reveal Editor Electron GUI 界面
---

# 运行 GUI 流程

## 步骤

1. **检查 electron 依赖**
   - 验证 `node_modules/electron/dist/electron.exe` 是否存在
   - 若不存在，执行 `node node_modules/electron/install.js` 下载二进制

2. **使用国内镜像（可选）**
   - 若下载慢，执行：`ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ node node_modules/electron/install.js`

3. **构建 main 进程**
   - 执行 `npm run build:main` 编译 TypeScript

4. **启动 GUI**
   - 开发模式：`npm run start`
   - 或直接运行：`./node_modules/electron/dist/electron.exe .`

## 快速启动命令

```bash
# 一行命令启动（开发模式）
npm run start

# 或直接运行 electron
./node_modules/electron/dist/electron.exe .
```

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| electron 二进制损坏 | 删除 `node_modules/electron`，重新 `npm install electron@30.0.8` |
| EBUSY 资源锁定 | 重启 Windows 或关闭占用 node_modules 的程序 |
| 下载缓慢 | 使用 `ELECTRON_MIRROR` 环境变量切换镜像 |