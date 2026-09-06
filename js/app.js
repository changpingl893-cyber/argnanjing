// 古时今日 · 论坛主站交互 + 归档渲染
// 全部帖子直接可见可读（无锁定、无门槛）；只有两类特殊帖子：
//   - 已删除：列表可见（灰色徽章），点进去是"该帖已被删除"
//   - 私密：列表可见（粉紫徽章），点进去是"内容已转移至未公开区"
// 帖子正文中的"相关帖"链接为纯跳转（无访问控制）。

(function () {
  const P = window.POSTS || {};
  const S = window.Story;

  const body = document.getElementById('post-list-body');
  let rows = [];

  function render() {
    if (!body || !S) return;
    let html = '';

    S.CHAPTERS.forEach(ch => {
      const posts = S.chapterPosts(ch.id); // [[id, post], ...]
      if (!posts.length) return;
      const total = posts.length;
      const done = posts.filter(([id]) => S.isRead(id)).length;

      html += `
      <div class="chapter-head">
        <span class="chapter-index">第 ${['c1','c2','c3','c4','c5'].indexOf(ch.id) + 1} 章</span>
        <b class="chapter-name">${ch.name} · ${ch.period}</b>
        <span class="chapter-progress">${done}/${total}</span>
        <span class="chapter-desc">${ch.desc}</span>
      </div>`;

      posts.forEach(([id, p]) => {
        const badgeCls = p.deleted ? 'badge-dead' : (p.private ? 'badge-private' : (p.badgeClass || ''));
        html += `
        <article class="post-row ${p.deleted ? 'post-row-dead' : ''}" data-post="${id}" data-cat="${p.cat || ''}" style="cursor:pointer">
          <div class="post-head">
            <span class="post-badge ${badgeCls}">${p.badge || '帖'}</span>
            <h2 class="post-title ${p.deleted ? 'post-title-deleted' : ''}">${p.title}</h2>
          </div>
          <div class="post-foot">
            <span class="post-author">${p.authorName}</span>
            <span class="post-date">${p.date}</span>
            <span class="post-replies">回复 ${(p.replies || []).length}</span>
            ${p.deleted ? '<span class="dead-chip">此帖已被删除</span>' : ''}
            ${p.private ? '<span class="private-chip">内容已转移</span>' : ''}
          </div>
        </article>`;
      });
    });

    body.innerHTML = html;
    rows = Array.from(body.querySelectorAll('.post-row[data-post]'));
    bindRows();
  }

  function bindRows() {
    body.querySelectorAll('.post-row[data-post]').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        location.href = 'post.html?id=' + el.getAttribute('data-post');
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
  console.log('[古时今日] 论坛主站已加载 · 共 ' + S.totalCount() + ' 帖');
})();
