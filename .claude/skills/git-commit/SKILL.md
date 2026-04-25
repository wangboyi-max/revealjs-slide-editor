---
name: git-commit
description: 本地 git 提交 - 自动检查、规范化信息、提前拦截问题内容
---

# Git Commit Skill

规范化 git 提交流程，拦截有问题的提交。

## 提交流程

### 第一步：显示当前状态
- 分支: !`git branch --show-current`
- Staged 文件: !`git diff --cached --name-only`
- Unstaged 文件: !`git diff --name-only`
- Untracked 文件: !`git ls-files --others --exclude-standard`

### 第二步：预检查（调用 code-test skill）

触发 code-test skill 进行完整验证：
```
!`/code-test`
```

code-test 会执行：
1. `npm run check` - 快速验证
2. `npm test -- --coverage` - 测试和覆盖率
3. `npm run build` - 构建验证

如果 code-test 返回失败，拦截提交并显示错误。

### 第三步：判断文件

**默认提交全部文件**。在执行提交前，AI 需要自行判断：

1. **临时文件**：检测 `.tmp`、`*.log`、`*.bak`、`*~`、`.DS_Store` 等，应被拒绝提交
2. **构建缓存**：检测 `node_modules/`、`dist/`、`build/`、`*.exe` 等，应在 .gitignore 中
3. **敏感文件**：检测 `.env`、`credentials.json`、`*.pem`、`secrets.json` 等，应被拒绝提交
4. **Claude 目录**：`.claude/` 目录包含 skill 定义和记忆文件，**必须提交**，不得忽略

如果发现不应提交的文件：
- 临时文件：拒绝提交，提示用户清理
- 构建缓存未在 .gitignore：提示用户添加后再提交
- 敏感文件：拒绝提交，警告用户

### 第四步：生成提交信息

如果提供了提交信息，使用格式: `$ARGUMENTS`

否则根据 changes 生成建议:
```
!`cd /home/wangboyi/workspace/reveal_editor && git diff --cached --stat`
```

使用 Conventional Commits 格式:
- feat: 新功能
- fix: 修复 bug
- docs: 文档更新
- style: 代码格式（不影响功能）
- refactor: 重构
- test: 测试
- chore: 构建/工具

### 第五步：确认并提交

显示完整提交信息，等待确认后执行:
```
!`cd /home/wangboyi/workspace/reveal_editor && git commit -m "$ARGUMENTS" 2>&1`
```

### 第六步：显示结果

- 提交 SHA: !`git log --oneline -1`
- 状态: !`git status --short`

## 详细说明

- 预检查规则: [references/pre-commit-checks.md](references/pre-commit-checks.md)
- 提交信息格式: [references/commit-message-format.md](references/commit-message-format.md)