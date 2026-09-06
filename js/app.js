// 古时今日 · 论坛主站交互 + 归档渲染
// 帖子列表按时间正序；损坏索引用"〔数据未能恢复〕"残迹占位，点击无内容；
// 未恢复的隐藏帖不出现在列表里，只能通过旧帖中的"相关帖"链接找到（读到即恢复）。

(function () {
  const P = window.POSTS || {};
  const S = window.Story;

  /* ===== 渲染帖子列表（章节分组 + 残迹占位） ===== */
  const body = document.getElementById('post-list-body');
  let rows = [];

  function render() {
    if (!body || !S) return;
    let html = '';

    S.CHAPTERS.forEach(ch => {
      const posts = S.chapterPosts(ch.id); // [[id, post], ...]
      if (!posts.length) return;
      const total = posts.length;
      const restored = posts.filter(([id]) => S.isRestored(id)).length;

      html += `
      <div class="chapter-head">
        <span class="chapter-index">第 ${['c1','c2','c3','c4','c5'].indexOf(ch.id) + 1} 章</span>
        <b class="chapter-name">${ch.name} · ${ch.period}</b>
        <span class="chapter-progress">已恢复 ${restored}/${total}</span>
        <span class="chapter-desc">${ch.desc}</span>
      </div>`;

      posts.forEach(([id, p]) => {
        if (S.isRestored(id)) {
          html += `
          <article class="post-row" data-post="${id}" data-cat="${p.cat || ''}" style="cursor:pointer">
            <div class="post-head">
              <span class="post-badge ${p.badgeClass || ''}">${p.badge || '帖'}</span>
              <h2 class="post-title">${p.title}</h2>
            </div>
            <div class="post-foot">
              <span class="post-author">${p.authorName}</span>
              <span class="post-date">${p.date}</span>
              <span class="post-replies">回复 ${(p.replies || []).length}</span>
              ${S.isHidden(id) ? '<span class="recovered-chip">已恢复</span>' : ''}
            </div>
          </article>`;
        } else {
          // 损坏索引残迹：点不开，提示去帖子里找线索
          html += `
          <article class="post-row post-row-lost" data-cat="${p.cat || ''}">
            <div class="post-head">
              <span class="post-badge post-badge-lock">◆</span>
              <h2 class="post-title post-title-lost">〔数据未能恢复 · 索引损坏〕</h2>
            </div>
            <div class="post-foot">
              <span class="post-date">${p.date}</span>
              <span class="post-replies">归档登记号 #${id}</span>
              <span class="lost-hint">旧帖里也许还有它的痕迹</span>
            </div>
          </article>`;
        }
      });
    });

    body.innerHTML = html;
    rows = Array.from(body.querySelectorAll('.post-row[data-post]'));
    bindRows();
  }

  /* ===== 行交互 ===== */
  function bindRows() {
    body.querySelectorAll('.post-row[data-post]').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        location.href = 'post.html?id=' + el.getAttribute('data-post');
      });
    });
    // 残迹行：点击给个破旧感提示（引导去帖里找）
    body.querySelectorAll('.post-row-lost').forEach(el => {
      el.style.cursor = 'not-allowed';
      el.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.v98Popup) {
          v98Popup({
            title: '数据未能恢复 (0x80004005)',
            icon: 'warn',
            text: '该帖的索引已损坏，无法从归档中直接打开。\n\n' +
                  '这个站从 2018 年起就没有人维护了——损坏的帖子只剩下登记号。\n' +
                  '也许，某个仍然完好的旧帖里还留着它的痕迹（相关帖链接）。\n\n' +
                  '当前已恢复：' + recoveredNow() + ' / ' + S.totalCount(),
            buttons: [{ label: '去翻帖', primary: true, onClick: (btn, api) => { api.close(); const t = document.querySelector('.board-section'); if (t) t.scrollIntoView({ behavior: 'smooth' }); } },
                      { label: '知道了', onClick: null }]
          });
        }
      });
    });
  }

  function recoveredNow() {
    return Object.keys(P).filter(id => S.isRestored(id)).length;
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
      if (emptyTip) emptyTip.style.display = 'none';
      if (searchInput) searchInput.value = '';
    });
  });

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
  console.log('[古时今日] 论坛主站已加载 · 已恢复 ' + recoveredNow() + '/' + S.totalCount());
})();
