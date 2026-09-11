// Windows XP 风格弹窗（数据中心图标 + 虚线按钮）
// 用法：xpDialog({ text, small, yes, no, onYes, onNo })
(function () {
  const ICON_INFO = `
    <svg class="xp-icon" viewBox="0 0 68 68" aria-hidden="true">
      <defs>
        <radialGradient id="xpInfoG" cx="36%" cy="22%" r="82%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="45%" stop-color="#f2f8ff"/>
          <stop offset="78%" stop-color="#c3ddf8"/>
          <stop offset="100%" stop-color="#8fbdec"/>
        </radialGradient>
      </defs>
      <!-- 气泡底（白→浅蓝） -->
      <path d="M34 5C17.5 5 6 17.5 6 31.5c0 9 4.6 16.6 11.8 21.2l-2.6 10.6 12.3-6.3c2.1.4 4.3.6 6.5.6 16.5 0 28-12.5 28-26.5S50.5 5 34 5z"
            fill="url(#xpInfoG)" stroke="#6f9fd0" stroke-width="1.2"/>
      <!-- 蓝色的 i -->
      <circle cx="34" cy="21.5" r="3.8" fill="#1c5cab"/>
      <path d="M30.4 28.6h7.2v20.4h-7.2z" fill="#1c5cab"/>
    </svg>`;

  function xpDialog(opts) {
    const o = opts || {};
    const overlay = document.createElement('div');
    overlay.className = 'xp-overlay';
    overlay.innerHTML = `
      <div class="xp-win" role="dialog" aria-modal="true">
        <div class="xp-titlebar">
          <span class="xp-title">${o.title || 'Windows XP'}</span>
          <span class="xp-close" title="关闭">✕</span>
        </div>
        <div class="xp-body">
          ${o.icon === false ? '' : ICON_INFO}
          <div class="xp-text">${o.text || ''}${o.small ? `<small>${o.small}</small>` : ''}</div>
        </div>
        <div class="xp-btns"></div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.classList.add('show');

    const btnBox = overlay.querySelector('.xp-btns');
    const mk = (label, primary, fn, close = true) => {
      const b = document.createElement('button');
      b.className = 'xp-btn' + (primary ? ' primary' : '');
      b.textContent = label;
      b.addEventListener('click', () => { if (close) hide(); if (fn) fn(); });
      btnBox.appendChild(b);
      return b;
    };

    function hide() { overlay.classList.remove('show'); setTimeout(() => overlay.remove(), 200); }

    const api = {
      overlay,
      hide,
      btn: mk,
      // 默认两个按钮：否 / 是
      yesNo(onYes, onNo) {
        mk(o.no || '否', false, onNo);
        mk(o.yes || '是', true, onYes);
        return api;
      }
    };
    overlay.querySelector('.xp-close').addEventListener('click', () => { hide(); if (o.onNo) o.onNo(); });
    return api;
  }

  window.xpDialog = xpDialog;
})();
