// 古时今日 · 论坛主站交互 + 章节化渲染
// 帖子列表按"章节（时间线）"分组、时间正序展示；未达等级 = 锁定行；注册后等级从 Lv.1 起步。

(function () {
  const P = window.POSTS || {};
  const S = window.Story;

  /* ===== 渲染帖子列表（章节分组） ===== */
  const body = document.getElementById('post-list-body');
  let rows = [];

  function render() {
    if (!body || !S) return;
    const level = S.level();
    let html = '';

    S.CHAPTERS.forEach(ch => {
      const posts = S.chapterPosts(ch.id); // [[id, post], ...]
      if (!posts.length) return;
      const total = posts.length;
      const done = posts.filter(([id]) => S.isRead(id)).length;

      html += `
      <div class="chapter-head">
        <span class="chapter-index">第 ${ch.level} 章</span>
        <b class="chapter-name">${ch.name} · ${ch.period}</b>
        <span class="chapter-progress">${done}/${total}</span>
        <span class="chapter-desc">${ch.desc}</span>
      </div>`;

      posts.forEach(([id, p]) => {
        const can = S.canRead(id);
        const isGuardian = ['1', '2', '3', '4', '5', '6'].includes(String(p.authorId));
        const authorHtml = isGuardian
          ? `<a class="post-author" href="guardian.html?id=${p.authorId}">${p.authorName}</a>`
          : `<span class="post-author">${p.authorName}</span>`;
        if (can) {
          html += `
          <article class="post-row" data-post="${id}" data-cat="${p.cat || ''}" style="cursor:pointer">
            <div class="post-head">
              <span class="post-badge ${p.badgeClass || ''}">${p.badge || '帖'}</span>
              <h2 class="post-title">${p.title}</h2>
            </div>
            <div class="post-foot">
              ${authorHtml}
              <span class="post-date">${p.date}</span>
              <span class="post-replies">回复 ${(p.replies || []).length}</span>
              ${p.content == null ? '<span class="broken-chip">内容缺失</span>' : ''}
            </div>
          </article>`;
        } else {
          html += `
          <article class="post-row locked" data-locked="${id}" data-cat="${p.cat || ''}" data-need="${S.needLevel(id)}">
            <div class="post-head">
              <span class="post-badge post-badge-lock">🔒 锁定</span>
              <h2 class="post-title">${p.title}</h2>
            </div>
            <div class="post-foot">
              <span class="post-author">${p.authorName}</span>
              <span class="post-date">${p.date}</span>
              <span class="post-replies">回复 ${(p.replies || []).length}</span>
              <span class="lock-chip">需 Lv.${S.needLevel(id)} 可见</span>
            </div>
          </article>`;
        }
      });
    });

    body.innerHTML = html;
    rows = Array.from(body.querySelectorAll('.post-row[data-post]'));
    bindRows();
  }

  /* ===== 行交互：可读→跳详情；锁定→弹权限框 ===== */
  function bindRows() {
    body.querySelectorAll('.post-row[data-post]').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        location.href = 'post.html?id=' + el.getAttribute('data-post');
      });
    });
    body.querySelectorAll('.post-row.locked').forEach(el => {
      el.style.cursor = 'not-allowed';
      el.addEventListener('click', () => {
        if (window.v98Popup) {
          v98Popup({
            title: '阅读权限不足',
            icon: 'warn',
            text: '该帖需要 Lv.' + el.getAttribute('data-need') + ' 可见。\n\n' +
              '权限系统仍在运行（毕竟它是这个站里唯一还活着的东西），而管理员已于 2018 年 1 月离任——' +
              '没有人有钥匙，除了把前面的帖子读完。\n\n' +
              '当前等级：Lv.' + S.level(),
            buttons: [{ label: '知道了', primary: true }]
          });
        }
      });
    });
  }

  /* ===== 搜索过滤 ===== */
  const searchInput = document.querySelector('.search-input');
  const searchBtn = document.querySelector('.search-btn');
  const emptyTip = document.getElementById('empty-tip');

  function applyFilter() {
    const kw = (searchInput.value || '').trim().toLowerCase();
    let visible = 0;
    rows.forEach(el => {
      const hay = (el.textContent || '').toLowerCase();
      const show = !kw || hay.includes(kw);
      el.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    body.querySelectorAll('.chapter-head').forEach(h => {
      const next = h.nextElementSibling;
      h.style.display = (next && next.style.display !== 'none') ? '' : 'none';
    });
    if (emptyTip) emptyTip.style.display = visible ? 'none' : '';
  }
  if (searchInput) searchInput.addEventListener('input', applyFilter);
  if (searchBtn) searchBtn.addEventListener('click', applyFilter);
  if (searchInput) searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') applyFilter(); });

  /* ===== tab 切版 ===== */
  const tabs = Array.from(document.querySelectorAll('.forum-tabs .tab'));
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.getAttribute('data-cat');
      rows.forEach(el => {
        const c = el.getAttribute('data-cat');
        const show = !cat || cat === 'all' || c === cat;
        el.style.display = show ? '' : 'none';
      });
      body.querySelectorAll('.chapter-head').forEach(h => {
        const next = h.nextElementSibling;
        h.style.display = (next && next.style.display !== 'none') ? '' : 'none';
      });
      if (emptyTip) emptyTip.style.display = 'none';
      if (searchInput) searchInput.value = '';
    });
  });

  /* ===== 注册欢迎（全站唯一仍在运行的模块） ===== */
  function askRegister() {
    const nick = document.createElement('input');
    nick.className = 'v98-input';
    nick.maxLength = 16;
    nick.placeholder = '你的网名（古早味一点，如"临江仙"）';
    const dlg = v98Popup({
      title: '注册 - 古时今日',
      icon: 'info',
      html: '本站已永久停更（最后更新于 2018-01-01）。\n\n' +
            '奇怪的是，注册模块至今仍在使用——它是这个站里<b>唯一还在运行</b>的东西。\n\n' +
            '注册后可以以游客身份阅读站内存档，阅读权限系统将从 <b>Lv.1</b> 开始计算。',
      dismissable: false,
      buttons: []
    });
    dlg.root.querySelector('.v98-text').appendChild(nick);

    const later = document.createElement('button');
    later.className = 'v98-btn';
    later.textContent = '稍后';
    later.addEventListener('click', () => { dlg.close(); showGuestTip(); });
    const okBtn = document.createElement('button');
    okBtn.className = 'v98-btn pressed';
    okBtn.textContent = '注册';
    okBtn.addEventListener('click', () => {
      const name = (nick.value || '').trim();
      if (!name) { nick.focus(); nick.placeholder = '先填个网名吧。'; return; }
      S.register(name);
      dlg.close();
      v98Popup({
        title: '注册成功',
        icon: 'info',
        text: '欢迎，「' + name + '」。\n\n' +
              '你现在的等级是 Lv.1（访客）。站长留下的顺序是：从最早的那篇帖子开始读起——《初雪 · 2016》。\n\n' +
              '每读完一整章，等级 +1。回帖权限早已关闭，但阅读权限仍然生效。',
        buttons: [{ label: '开始阅读', primary: true, onClick: () => { location.href = 'post.html?id=1'; } }]
      });
    });
    dlg.addBtn(later);
    dlg.addBtn(okBtn);
    nick.focus();
  }

  function showGuestTip() {
    if (window.v98Popup) {
      v98Popup({
        title: '提示',
        icon: 'warn',
        text: '未注册账号，阅读权限系统未激活。\n\n点击任意帖子时，可以随时补注册。',
        buttons: [{ label: '好的', primary: true }]
      });
    }
  }

  /* ===== 底部导航 ===== */
  document.querySelectorAll('.mnav').forEach(a => {
    a.addEventListener('click', (e) => {
      const action = a.getAttribute('data-action');
      if (action === '#board') {
        e.preventDefault();
        const t = document.querySelector('#board');
        if (t) t.scrollIntoView({ behavior: 'smooth' });
      }
      document.querySelectorAll('.mnav').forEach(x => x.classList.remove('active'));
      a.classList.add('active');
    });
  });

  /* ===== 关注 / 留言板 ===== */
  const followBtn = document.querySelector('#follow-btn');
  if (followBtn) {
    followBtn.addEventListener('click', () => {
      const following = followBtn.textContent.startsWith('已');
      followBtn.textContent = following ? '+ 关注' : '已关注';
      followBtn.classList.toggle('followed', !following);
    });
  }
  const board = document.querySelector('.board-section');
  if (board && window.v98Popup) {
    board.addEventListener('click', (e) => {
      if (e.target.closest('.board-leave')) {
        v98Popup({
          title: '留言板',
          icon: 'warn',
          text: '提交失败：服务器未响应。\n该留言板最后的回复停留在 2018 年 6 月，之后再也没有人来过。',
          buttons: [{ label: '知道了', primary: true }]
        });
      }
    });
  }

  /* ===== 启动 ===== */
  render();
  if (!S.isRegistered()) setTimeout(askRegister, 400);
  console.log('[古时今日] 论坛主站已加载 · 当前等级 Lv.' + S.level());
})();
