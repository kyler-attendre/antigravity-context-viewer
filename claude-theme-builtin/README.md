# Built-in Claude Theme & Zero-Gravity Boot Screen (macOS)

本目录为 `antigravity-context-viewer` 的 macOS 一体化扩展脚本，将以下能力直接内置进 `/Applications/Antigravity.app/Contents/Resources/app.asar`（无需后台 CDP 守护进程，每次正常打开 Antigravity 自动生效）：

1. **持久化上下文与 Token 监控**：基于 `elviscjn-cjn/antigravity-context-viewer`，并修复了宿主设置弹窗（`[role="dialog"]`）与右上角浮层（账号共享池 / 模型额度 / Token 用量）重叠导致点击失效的问题。
2. **全套 Claude 风格主题**：基于 `AlexByoung/Claudized-Antigravity` 的 `theme.css`，直接注入原生 `Settings → Appearance` 面板，支持即时切换 `Clay` / `Classic` / `Original` 与中英文字体（`Claude` / `System`，`LXGW WenKai` / `PingFang`）。
3. **反重力星轨启动动画**：60fps HTML5 Canvas 零重力粒子星空 + 双轨 HUD 启动页，可在 `Settings → Appearance → Boot Screen` 中随时开关或点击 `Preview` 预览。

## 使用方法

先按 **`Cmd + Q`** 完全退出 Antigravity，然后在终端执行：

```bash
./claude-theme-builtin/apply-claude-theme.sh
```

可选：安装霞鹜文楷以获得更佳中文阅读排版：

```bash
brew install --cask font-lxgw-wenkai
```

如需还原纯净原版 `app.asar`：

```bash
node ./claude-theme-builtin/patch-claude-theme.js --restore
```

## 致谢

- 上下文与用量看板：[elviscjn-cjn/antigravity-context-viewer](https://github.com/elviscjn-cjn/antigravity-context-viewer)
- Claude 风格主题样式：[AlexByoung/Claudized-Antigravity](https://github.com/AlexByoung/Claudized-Antigravity)
