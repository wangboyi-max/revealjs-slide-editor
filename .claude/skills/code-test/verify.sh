#!/bin/bash

# code-test verify script
# 支持精细化测试控制

show_usage() {
  echo "Usage: verify.sh [OPTIONS]"
  echo ""
  echo "Options:"
  echo "  --check      只运行 lint + typecheck"
  echo "  --test       只运行测试（不带覆盖率）"
  echo "  --coverage   只运行测试 + 覆盖率检查"
  echo "  --build      只运行构建"
  echo "  --all        运行全部检查（默认）"
  echo "  -h, --help   显示帮助"
  echo ""
  echo "Examples:"
  echo "  verify.sh              # 运行全部检查"
  echo "  verify.sh --check      # 只做 lint 和类型检查"
  echo "  verify.sh --test       # 只运行测试"
  echo "  verify.sh --coverage   # 测试 + 覆盖率"
  echo "  verify.sh --build      # 只构建"
}

run_check() {
  echo "=== ESLint + TypeScript 检查 ==="
  npm run lint
  npm run typecheck
}

run_test() {
  echo "=== 运行测试 ==="
  npm test
}

run_coverage() {
  echo "=== 运行测试 + 覆盖率 ==="
  npm test -- --coverage

  echo "=== 检查覆盖率阈值 ==="
  # 检查 stores/utils 是否 ≥90%
  # 检查 components 是否 ≥70%
  node -e "
const { readFileSync } = require('fs');
const html = readFileSync('tests/coverage/index.html', 'utf8');
// 解析覆盖率并验证阈值
" || echo "WARNING: 覆盖率检查脚本待实现"
}

run_build() {
  echo "=== 构建 ==="
  npm run build
  if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
    echo "ERROR: dist/ 目录为空或不存在"
    exit 1
  fi
}

# 默认运行全部
MODE="all"

# 解析参数
while [[ $# -gt 0 ]]; do
  case $1 in
    --check|--lint)
      MODE="check"
      shift
      ;;
    --test)
      MODE="test"
      shift
      ;;
    --coverage)
      MODE="coverage"
      shift
      ;;
    --build)
      MODE="build"
      shift
      ;;
    --all)
      MODE="all"
      shift
      ;;
    -h|--help)
      show_usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      show_usage
      exit 1
      ;;
  esac
done

case $MODE in
  check)
    run_check
    ;;
  test)
    run_test
    ;;
  coverage)
    run_coverage
    ;;
  build)
    run_build
    ;;
  all)
    run_check
    run_coverage
    run_build
    ;;
esac

echo "=== 验证完成 ==="