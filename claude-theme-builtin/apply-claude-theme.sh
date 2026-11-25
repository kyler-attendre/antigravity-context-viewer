#!/usr/bin/env bash
set -euo pipefail

THEME_DIR="$(cd "$(dirname "$0")" && pwd)"
ACV_DIR="$(cd "$THEME_DIR/.." && pwd)"
APP_PATH="${ANTIGRAVITY_APP_PATH:-/Applications/Antigravity.app}"

echo "1/5 停用旧的外部 watch 守护进程与自启项..."
cd "$ACV_DIR"
node cli.js stop-watch >/dev/null 2>&1 || true
node cli.js autostart:disable >/dev/null 2>&1 || true

echo "2/5 从纯净备份还原原版 app.asar（若存在备份）..."
if [ -f "$APP_PATH/Contents/Resources/app.asar.bak" ]; then
  node "$THEME_DIR/patch-claude-theme.js" --restore
fi

echo "3/5 将上下文监控插件持久化内置进 app.asar（无需调试端口、每次打开自动加载）..."
cd "$ACV_DIR"
node cli.js install --force-mac-asar --disk-only

echo "4/5 在同一个 app.asar 上叠加内置全套 Claude 风格 + 启动加载动画（含 Settings → Appearance 原生选项）..."
node "$THEME_DIR/patch-claude-theme.js" --on-current

echo "5/5 执行 macOS 本地自签名并正常打开 Antigravity..."
xattr -cr "$APP_PATH"
codesign --force --deep --sign - "$APP_PATH"
open -a "$APP_PATH"

echo "✅ 全部完成！监控插件 + 全套 Claude 风格 + 启动动画均已持久化内置到 Antigravity 内部。"
echo "   以后直接 Cmd+Q 退出再正常打开，全部功能都会自动生效。"
