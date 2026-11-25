#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const { builtinAsar, collectUnpackedPaths } = require(path.join(__dirname, '..', 'asar-engine.js'));

const APP_PATH = process.env.ANTIGRAVITY_APP_PATH || '/Applications/Antigravity.app';
const RESOURCES_DIR = path.join(APP_PATH, 'Contents', 'Resources');
const ASAR_PATH = path.join(RESOURCES_DIR, 'app.asar');
const BAK_PATH = path.join(RESOURCES_DIR, 'app.asar.bak');
const THEME_CSS_PATH = path.join(__dirname, 'theme.css');

const MARKER_START = '// === AG_BUILTIN_CLAUDE_THEME_START ===';
const MARKER_END = '// === AG_BUILTIN_CLAUDE_THEME_END ===';

function buildRendererPayload(themeCss) {
  return `
${MARKER_START}
(function() {
  if (window.__AG_BUILTIN_CLAUDE_THEME_LOADED__) return;
  window.__AG_BUILTIN_CLAUDE_THEME_LOADED__ = true;

  const STYLE_ID = 'ag-claude-theme-style';
  const STYLE_ROW_ID = 'ag-claude-style-row';
  const FONT_ROW_ID = 'ag-claude-font-row';
  const SPLASH_ROW_ID = 'ag-boot-splash-row';
  const THEME_CSS = ${JSON.stringify(themeCss)};

  const LS_STYLE  = 'ag_claude_theme_style';   // 'clay' | 'classic' | 'original'
  const LS_LATIN  = 'ag_claude_latin_font';    // 'claude' | 'system'
  const LS_CJK    = 'ag_claude_cjk_font';      // 'wenkai' | 'system'
  const LS_SPLASH = 'ag_boot_splash_enabled';  // 'on' | 'off'

  function readPref(key, valid, fallback) {
    try {
      const v = localStorage.getItem(key);
      if (v && valid.includes(v)) return v;
    } catch {}
    return fallback;
  }

  function savePref(key, val) {
    try { localStorage.setItem(key, val); } catch {}
  }

  let prefs = {
    themeStyle: readPref(LS_STYLE, ['clay', 'classic', 'original'], 'clay'),
    latinFont: readPref(LS_LATIN, ['claude', 'system'], 'claude'),
    cjkFont: readPref(LS_CJK, ['wenkai', 'system'], 'wenkai'),
    bootSplash: readPref(LS_SPLASH, ['on', 'off'], 'on'),
  };

  function showBootSplash(isPreview) {
    if (!document || !document.body) return;
    if (document.getElementById('ag-boot-splash-overlay')) return;

    const isLight = document.body.classList.contains('theme-light');
    const bg = isLight
      ? 'radial-gradient(ellipse at 50% 42%, #FFFFFF 0%, #FAF9F5 55%, #EFECE3 100%)'
      : 'radial-gradient(ellipse at 50% 42%, #1E1D1B 0%, #141413 58%, #0B0B0A 100%)';
    const fg = isLight ? '#141413' : '#F4F3EE';
    const muted = isLight ? 'rgba(61,61,58,0.68)' : 'rgba(218,215,205,0.62)';
    const accent = '#D97757';
    const accent2 = isLight ? '#4F6DF5' : '#7C9CFF';
    const ringBorder = isLight ? 'rgba(217,119,87,0.30)' : 'rgba(217,119,87,0.38)';
    const trackBg = isLight ? 'rgba(20,20,19,0.08)' : 'rgba(255,255,255,0.10)';

    if (!document.getElementById('ag-boot-splash-kf')) {
      const kf = document.createElement('style');
      kf.id = 'ag-boot-splash-kf';
      kf.textContent = \`
        @keyframes agSpinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes agSpinRev  { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes agPulseGlow {
          0%, 100% { transform: scale(1); opacity: 0.85; filter: drop-shadow(0 0 14px rgba(217,119,87,0.45)); }
          50% { transform: scale(1.06); opacity: 1; filter: drop-shadow(0 0 26px rgba(217,119,87,0.75)); }
        }
        @keyframes agFloatUp {
          0% { opacity: 0; transform: translateY(14px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      \`;
      document.head.appendChild(kf);
    }

    const overlay = document.createElement('div');
    overlay.id = 'ag-boot-splash-overlay';
    overlay.style.cssText = \`
      position: fixed; inset: 0; z-index: 2147483646;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      background: \${bg}; color: \${fg};
      overflow: hidden; user-select: none;
      opacity: 1; transition: opacity 480ms cubic-bezier(0.22, 1, 0.36, 1), transform 480ms cubic-bezier(0.22, 1, 0.36, 1), filter 480ms ease;
      font-family: 'Anthropic Sans', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC', sans-serif;
    \`;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
    overlay.appendChild(canvas);

    const card = document.createElement('div');
    card.style.cssText = \`
      position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center;
      gap: 18px; animation: agFloatUp 520ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
    \`;
    card.innerHTML = \`
      <div style="position:relative;width:104px;height:104px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;inset:0;border-radius:50%;border:1.5px solid \${ringBorder};box-shadow:0 0 36px rgba(217,119,87,0.18);"></div>
        <div style="position:absolute;inset:6px;border-radius:50%;border:1.5px dashed rgba(217,119,87,0.45);animation:agSpinSlow 9s linear infinite;"></div>
        <div style="position:absolute;inset:15px;border-radius:50%;border:1px solid rgba(124,156,255,0.28);border-top-color:\${accent2};animation:agSpinRev 5.5s linear infinite;"></div>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style="animation:agPulseGlow 2.2s ease-in-out infinite;">
          <path d="M20 4L33 32H26.8L20 17.2L13.2 32H7L20 4Z" fill="url(#agBootGrad)"/>
          <circle cx="20" cy="27.5" r="3" fill="\${accent}"/>
          <defs>
            <linearGradient id="agBootGrad" x1="7" y1="4" x2="33" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="\${accent}"/>
              <stop offset="100%" stop-color="\${accent2}"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
        <div style="font-size:20px;font-weight:600;letter-spacing:0.32em;padding-left:0.32em;">ANTIGRAVITY</div>
        <div id="ag-boot-stage" style="font-size:12px;color:\${muted};letter-spacing:0.06em;min-height:18px;">Initializing zero-gravity workspace…</div>
      </div>
      <div style="width:220px;height:3px;border-radius:999px;background:\${trackBg};overflow:hidden;">
        <div id="ag-boot-bar" style="width:0%;height:100%;border-radius:999px;background:linear-gradient(90deg, \${accent}, \${accent2});transition:width 140ms linear;"></div>
      </div>
      <div style="font-size:11px;color:\${muted};opacity:0.65;">\${isPreview ? 'Preview · Click or Esc to close' : 'Click or Esc to skip'}</div>
    \`;
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    // Zero-gravity floating particle constellation
    const ctx = canvas.getContext('2d');
    let rafId = 0;
    let dismissed = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const COUNT = 64;
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.45,
      vy: -(0.35 + Math.random() * 0.85), // negative gravity: float upward
      r: 1.2 + Math.random() * 2.1,
      hue: Math.random() > 0.38 ? '217,119,87' : '124,156,255',
      a: 0.25 + Math.random() * 0.55,
    }));

    function tick() {
      if (dismissed) return;
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < COUNT; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -12) { p.y = H + 12; p.x = Math.random() * W; }
        if (p.x < -12) p.x = W + 12;
        if (p.x > W + 12) p.x = -12;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = \`rgba(\${p.hue},\${p.a})\`;
        ctx.fill();

        for (let j = i + 1; j < COUNT; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 115) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = \`rgba(\${p.hue},\${(1 - dist / 115) * 0.16})\`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    const bar = overlay.querySelector('#ag-boot-bar');
    const stage = overlay.querySelector('#ag-boot-stage');
    const stages = [
      [18, 'Initializing zero-gravity workspace…'],
      [52, 'Mounting Claude theme & telemetry…'],
      [84, 'Connecting agent runtime…'],
      [100, 'Ready'],
    ];
    const startTs = performance.now();
    const TOTAL_MS = 1650;

    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('resize', resize);
      overlay.style.opacity = '0';
      overlay.style.transform = 'scale(1.03)';
      overlay.style.filter = 'blur(6px)';
      setTimeout(() => overlay.remove(), 500);
    }

    function onKey(e) { if (e.key === 'Escape') dismiss(); }
    overlay.addEventListener('click', dismiss);
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', resize);

    const progTimer = setInterval(() => {
      if (dismissed) { clearInterval(progTimer); return; }
      const pct = Math.min(100, Math.round(((performance.now() - startTs) / TOTAL_MS) * 100));
      if (bar) bar.style.width = pct + '%';
      for (const [threshold, label] of stages) {
        if (pct >= threshold && stage) stage.textContent = label;
      }
      if (pct >= 100) {
        clearInterval(progTimer);
        setTimeout(dismiss, 160);
      }
    }, 45);
  }

  function applyTheme() {
    if (!document || !document.documentElement) return;
    const root = document.documentElement;
    let el = document.getElementById(STYLE_ID);

    if (prefs.themeStyle === 'original') {
      if (el) el.remove();
      root.removeAttribute('data-ag-style');
      root.removeAttribute('data-ag-latin');
      root.removeAttribute('data-ag-cjk');
      return;
    }

    root.setAttribute('data-ag-style', prefs.themeStyle);
    root.setAttribute('data-ag-latin', prefs.latinFont);
    root.setAttribute('data-ag-cjk', prefs.cjkFont);

    if (!document.head) return;
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    if (el.textContent !== THEME_CSS) {
      el.textContent = THEME_CSS;
    }
  }

  const BTN = 'inline-flex items-center justify-center transition-colors text-secondary-foreground outline-none cursor-pointer border-none shrink-0 select-none h-full hover:text-foreground data-[pressed]:bg-secondary data-[pressed]:text-foreground disabled:opacity-50 disabled:pointer-events-none text-sm px-2 rounded-md gap-1.5';
  const GROUP_HTML = '<div role="group" aria-orientation="horizontal" class="inline-flex items-center rounded-lg border border-border bg-secondary/20 p-0.5 gap-0.5 select-none h-8"></div>';

  function rowHtml(right) {
    return (
      '<div class="w-full"><div class="py-2 px-3 w-full bg-transparent flex justify-between gap-4 items-center">' +
      '<div class="flex-1 flex flex-col gap-0.5"><div class="flex items-center gap-1.5"><span class="text-sm" data-k="title"></span></div>' +
      '<span class="text-xs text-muted-foreground whitespace-pre-wrap" data-k="desc"></span></div>' +
      '<div class="shrink-0">' + right + '</div></div></div>'
    );
  }

  function buildLookSection(id, heading, hint, rows) {
    const sec = document.createElement('div');
    sec.id = id;
    sec.className = 'space-y-2';
    sec.innerHTML =
      '<div class="flex flex-col gap-1"><div class="flex items-center justify-between"><div class="flex items-center gap-1.5"><h3 class="m-0 text-sm font-medium"></h3></div></div>' +
      (hint ? '<div class="text-xs text-muted-foreground leading-relaxed" data-k="intro"></div>' : '') + '</div>' +
      '<div><div class="bg-transparent rounded-xl border border-border overflow-hidden divide-y divide-border">' +
      rows.map(() => rowHtml(GROUP_HTML)).join('') +
      '</div></div>';
    sec.querySelector('h3').textContent = heading;
    if (hint) sec.querySelector('[data-k=intro]').textContent = hint;

    sec.querySelectorAll('.divide-y > .w-full').forEach((row, i) => {
      const r = rows[i];
      row.querySelector('[data-k=title]').textContent = r.title;
      const desc = row.querySelector('[data-k=desc]');
      desc.hidden = true;
      const group = row.querySelector('[role=group]');
      for (const [value, label] of r.options) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = BTN;
        b.textContent = label;
        b.setAttribute('aria-pressed', String(value === prefs[r.prefKey]));
        if (value === prefs[r.prefKey]) b.setAttribute('data-pressed', '');
        b.addEventListener('click', () => {
          if (value === prefs[r.prefKey]) return;
          prefs[r.prefKey] = value;
          savePref(r.storageKey, value);
          for (const x of group.children) {
            x.setAttribute('aria-pressed', String(x === b));
            x.toggleAttribute('data-pressed', x === b);
          }
          applyTheme();
        });
        group.appendChild(b);
      }
    });
    return sec;
  }

  function panelByTitle(titles) {
    for (const h2 of document.querySelectorAll('[role="dialog"] h2')) {
      if (titles.includes(h2.textContent.trim())) return h2.closest('div.p-6') || null;
    }
    return null;
  }

  function appendSection(panel, id, buildFn) {
    if (!panel || panel.querySelector('#' + id)) return;
    const sections = [...panel.querySelectorAll('div.space-y-2')].filter((s) => !s.id.startsWith('ag-'));
    const last = sections[sections.length - 1];
    if (last && last.parentElement) last.parentElement.appendChild(buildFn());
  }

  function ensureAppearanceSettings() {
    const appearance = panelByTitle(['Appearance', '外观']);
    if (!appearance) return;
    appendSection(appearance, STYLE_ROW_ID, () =>
      buildLookSection(
        STYLE_ROW_ID,
        'Claude Theme',
        'Full Claude-style light & dark palette, following the Light/Dark theme above.',
        [
          {
            title: 'Color style',
            prefKey: 'themeStyle',
            storageKey: LS_STYLE,
            options: [
              ['clay', 'Clay'],
              ['classic', 'Classic'],
              ['original', 'Original'],
            ],
          },
        ]
      )
    );
    appendSection(appearance, FONT_ROW_ID, () =>
      buildLookSection(
        FONT_ROW_ID,
        'Claude Fonts',
        'Applies when Claude Theme (Clay or Classic) is active.',
        [
          {
            title: 'Latin font',
            prefKey: 'latinFont',
            storageKey: LS_LATIN,
            options: [
              ['claude', 'Claude'],
              ['system', 'System'],
            ],
          },
          {
            title: 'Chinese font',
            prefKey: 'cjkFont',
            storageKey: LS_CJK,
            options: [
              ['wenkai', 'LXGW WenKai'],
              ['system', 'PingFang'],
            ],
          },
        ]
      )
    );
    appendSection(appearance, SPLASH_ROW_ID, () => {
      const sec = buildLookSection(
        SPLASH_ROW_ID,
        'Boot Screen',
        'Zero-gravity constellation splash animation on startup.',
        [
          {
            title: 'Startup animation',
            prefKey: 'bootSplash',
            storageKey: LS_SPLASH,
            options: [
              ['on', 'On'],
              ['off', 'Off'],
            ],
          },
        ]
      );
      const group = sec.querySelector('[role=group]');
      if (group) {
        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = BTN;
        prevBtn.textContent = 'Preview';
        prevBtn.addEventListener('click', () => showBootSplash(true));
        group.appendChild(prevBtn);
      }
      return sec;
    });
  }

  function boot() {
    applyTheme();
    if (prefs.bootSplash === 'on') {
      showBootSplash(false);
    }
    ensureAppearanceSettings();
    let queued = false;
    const obs = new MutationObserver(() => {
      if (prefs.themeStyle !== 'original' && !document.getElementById(STYLE_ID)) {
        applyTheme();
      }
      if (queued || !document.querySelector('[role="dialog"]')) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        ensureAppearanceSettings();
      });
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
${MARKER_END}
`.trim();
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--restore')) {
    if (!fs.existsSync(BAK_PATH)) {
      throw new Error('未找到原始备份 app.asar.bak，无法还原。');
    }
    fs.copyFileSync(BAK_PATH, ASAR_PATH);
    console.log('✅ 已从 app.asar.bak 还原纯净官方原版 app.asar。');
    return;
  }

  if (!fs.existsSync(THEME_CSS_PATH)) {
    throw new Error('找不到 theme.css: ' + THEME_CSS_PATH);
  }
  const themeCss = fs.readFileSync(THEME_CSS_PATH, 'utf8');
  const payload = buildRendererPayload(themeCss);

  // Use clean original backup by default; pass --on-current to stack on top of current app.asar (e.g. after context-viewer install)
  let sourceAsar = ASAR_PATH;
  if (!args.includes('--on-current') && fs.existsSync(BAK_PATH)) {
    const bakBuf = fs.readFileSync(BAK_PATH);
    if (!bakBuf.includes('Antigravity 2.0 Chinese Localization Engine')) {
      sourceAsar = BAK_PATH;
      console.log('📦 使用纯净官方原版备份 app.asar.bak 作为底包（自动彻底移除汉化）...');
    }
  } else if (args.includes('--on-current')) {
    console.log('📦 基于当前 app.asar 叠加注入（保留已内置的监控插件）...');
  } else {
    const curBuf = fs.readFileSync(ASAR_PATH);
    if (!curBuf.includes('Antigravity 2.0 Chinese Localization Engine') && !curBuf.includes(MARKER_START)) {
      fs.copyFileSync(ASAR_PATH, BAK_PATH);
      console.log('📦 已备份纯净原版至 app.asar.bak。');
    }
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ag-claude-theme-'));
  const extractDir = path.join(tmpDir, 'extracted');
  const stageAsar = path.join(tmpDir, 'app.asar.new');

  try {
    console.log('📂 正在解包原版 app.asar...');
    builtinAsar.extractAll(sourceAsar, extractDir);

    const preloadPath = path.join(extractDir, 'dist', 'preload.js');
    if (!fs.existsSync(preloadPath)) {
      throw new Error('找不到 dist/preload.js');
    }

    let preload = fs.readFileSync(preloadPath, 'utf8');
    const startIdx = preload.indexOf(MARKER_START);
    if (startIdx !== -1) {
      const endIdx = preload.indexOf(MARKER_END, startIdx);
      if (endIdx !== -1) {
        preload = preload.slice(0, startIdx) + preload.slice(endIdx + MARKER_END.length);
      }
    }
    preload = preload.trimEnd() + '\n\n' + payload + '\n';
    fs.writeFileSync(preloadPath, preload, 'utf8');
    console.log('🎨 已写入内置全套 Claude 风格主题 + Settings → Appearance 面板控制项。');

    const unpackedPaths = collectUnpackedPaths(builtinAsar, sourceAsar);
    console.log('📦 正在重新打包 app.asar...');
    if (unpackedPaths.size > 0) {
      await builtinAsar.createPackageWithOptions(extractDir, stageAsar, { unpackedPaths });
    } else {
      await builtinAsar.createPackageWithOptions(extractDir, stageAsar, {});
    }

    if (args.includes('--dry-run')) {
      const vm = require('vm');
      const packedPreload = builtinAsar.extractFile(stageAsar, 'dist/preload.js').toString('utf8');
      new vm.Script(packedPreload);
      console.log('✅ DRY RUN 成功！app.asar 打包有效，preload.js 语法校验通过，体积:', fs.statSync(stageAsar).size, 'bytes');
      return;
    }

    fs.copyFileSync(stageAsar, ASAR_PATH);
    console.log('✅ 已成功写入 /Applications/Antigravity.app/Contents/Resources/app.asar');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error('❌ 失败:', err.message);
  process.exit(1);
});
