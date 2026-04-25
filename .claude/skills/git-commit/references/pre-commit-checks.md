# 提交前检查清单

## 核心检查（通过 code-test skill）

统一通过 `/code-test` 触发完整验证：
1. `npm run check` - 快速验证（lint + 类型）
2. `npm test -- --coverage` - 测试 + 覆盖率
3. `npm run build` - 构建验证

详见 [.claude/skills/code-test/SKILL.md](../code-test/SKILL.md)

### 1. 敏感文件检查

禁止提交的文件模式:
- `*.env` (.env, .env.local, .env.production)
- `credentials.json`
- `*.pem`, `*.key`
- `secrets.json`
- `*.sqlite`, `*.db`

检查命令:
```bash
git diff --cached --name-only | grep -E '\.(env|key|pem|sqlite|db)$'
git diff --cached --name-only | grep -i 'credential\|secret\|password'
```

### 2. 临时文件检查

禁止提交的文件模式:
- `*.tmp`, `*.temp`
- `*.log`
- `*.bak`
- `*~`
- `.DS_Store`

### 3. 构建产物检查

如果检测到以下目录或文件，确认已在 .gitignore:
- `node_modules/`
- `dist/`
- `build/`
- `*.exe`

---

## 失败处理

任一检查失败时:
1. 显示具体错误信息
2. 拒绝提交
3. 提示用户修复后重新执行

---

## 示例输出

### 检查通过
```
✅ 测试通过 (36 tests passed)
✅ Lint 通过 (0 errors)
✅ 类型检查通过
✅ 无敏感文件
✅ 无临时文件
```

### 检查失败
```
❌ Lint 检查失败:
   src/components/Canvas.tsx:45:3 - Unexpected trailing whitespace

❌ 禁止提交敏感文件:
   credentials.json

请修复以上问题后重新执行 /git-commit
```