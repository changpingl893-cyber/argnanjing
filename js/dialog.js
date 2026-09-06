// 古时今日 · 复古 Win98 弹窗助手（废弃网站氛围）
// 用法：
//   v98Popup({ title, icon: 'error'|'warn'|'info', text, buttons: [{label, primary, onClick, close}], onClose, html })
// 返回 { close(), root }

(function () {
  const ICONS = { error: '✕', warn: '!', info: 'i' };

  function build(opts) {
    const overlay = document.createElement('div');
    overlay.className = 'v98-overlay';
    const win = document.createElement('div');
    win.className = 'v98-window';

    const titlebar = document.createElement('div');
    titlebar.className = 'v98-titlebar';
    const title = document.createElement('span');
    title.className = 'v98-title';
    title.textContent = opts.title || '提示';
    const closeBtn = document.createElement('span');
    closeBtn.className = 'v98-close';
    closeBtn.textContent = '✕';
    titlebar.appendChild(title);
    titlebar.appendChild(closeBtn);
    win.appendChild(titlebar);

    const body = document.createElement('div');
    body.className = 'v98-body';

    const msg = document.createElement('div');
    msg.className = 'v98-msg';

    if (opts.icon) {
      const icon = document.createElement('div');
      icon.className = 'v98-icon ' + opts.icon;
      icon.textContent = ICONS[opts.icon] || 'i';
      msg.appendChild(icon);
    }

    const text = document.createElement('div');
    text.className = 'v98-text';
    if (opts.html) text.innerHTML = opts.html;
    else text.textContent = opts.text || '';
    msg.appendChild(text);

    const btns = document.createElement('div');
    btns.className = 'v98-btns';
    (opts.buttons || [{ label: '确定', primary: true }]).forEach(b => {
      const btn = document.createElement('button');
      btn.className = 'v98-btn' + (b.primary ? ' pressed' : '');
      btn.textContent = b.label;
      btn.addEventListener('click', () => {
        if (b.onClick) b.onClick(btn, api);
        if (b.close !== false && !b.onClick) api.close();
      });
      btns.appendChild(btn);
    });

    body.appendChild(msg);
    body.appendChild(btns);
    win.appendChild(body);
    overlay.appendChild(win);
    document.body.appendChild(overlay);
    overlay.style.display = 'block';
    win.style.display = 'block';

    const api = {
      root: win,
      overlay,
      close() {
        win.remove(); overlay.remove();
        if (opts.onClose) opts.onClose();
      },
      setText(t) { text.textContent = t; },
      setHTML(h) { text.innerHTML = h; },
      addBtn(buttonEl) { btns.appendChild(buttonEl); }
    };

    overlay.addEventListener('click', (e) => { if (e.target === overlay && opts.dismissable !== false) api.close(); });
    closeBtn.addEventListener('click', () => api.close());
    return api;
  }

  window.v98Popup = build;
})();
