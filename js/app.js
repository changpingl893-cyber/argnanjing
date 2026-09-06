// 公众号主页：头卡 + 菜单 + 历史推送列表 + 往期留言墙
(function () {
  const P = window.POSTS || {};
  const S = window.Story;

  const pinnedId = Object.keys(P).find(id => P[id].pinned);

  function renderList() {
    const body = document.getElementById('article-list');
    if (!body) return;
    let html = '';
    // 置顶目录文
    if (pinnedId && P[pinnedId]) {
      const a = P[pinnedId];
      html += `
      <a class="art-item art-pinned" href="post.html?id=${pinnedId}">
        <div class="art-head">
          <span class="art-tag art-tag-pin">置顶</span>
          <span class="art-title">${a.title}</span>
        </div>
        <div class="art-meta">${a.date} · 阅读 ${S.fmtReads(a.reads)} · 赞 ${a.likes} · 在看 ${a.wawas}</div>
        <div class="art-desc">这个号的完整目录。不知道从哪看起，就照这份看。</div>
      </a>`;
    }
    // 历史文章（时间倒序；已删除的灰显）
    S.allArticles().forEach(([id, a]) => {
      if (String(id) === pinnedId) return;
      const dead = a.deleted ? ' art-dead' : '';
      html += `
      <a class="art-item${dead}" href="post.html?id=${id}">
        <div class="art-head">
          ${a.submitter ? `<span class="art-tag art-tag-sub">投稿</span>` : ''}
          <span class="art-title">${a.title}</span>
        </div>
        <div class="art-meta">${a.date} · 阅读 ${S.fmtReads(a.reads)} · 赞 ${a.likes} · 在看 ${a.wawas}</div>
        ${a.deleted ? '<div class="art-desc">该内容已被发布者删除</div>' : ''}
      </a>`;
    });
    body.innerHTML = html;
  }

  /* 菜单（模拟公众号自定义菜单：点击分别滚动定位/弹提示） */
  const menus = document.querySelectorAll('.wechat-menu a');
  menus.forEach(m => {
    m.addEventListener('click', (e) => {
      const act = m.getAttribute('data-act');
      if (act === 'history') { e.preventDefault(); const t = document.getElementById('article-list'); if (t) t.scrollIntoView({ behavior: 'smooth' }); }
      else if (act === 'toc') { e.preventDefault(); if (pinnedId) location.href = 'post.html?id=' + pinnedId; }
      else if (act === 'msg') {
        e.preventDefault(); const t = document.getElementById('msgwall'); if (t) t.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* 关注按钮 */
  const follow = document.getElementById('follow-btn');
  if (follow) {
    follow.addEventListener('click', () => {
      const on = follow.textContent.startsWith('已');
      follow.textContent = on ? '+ 关注' : '已关注 ✓';
    });
  }

  /* 留言墙发送（已停用） */
  const sendBtn = document.getElementById('msgwall-send');
  if (sendBtn && window.v98Popup) {
    sendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      v98Popup({
        title: '留言失败',
        icon: 'warn',
        text: '留言失败：该公众号已很久没有登录。\n\n最后一条留言停留在 2018 年 6 月，之后再没有人回复。',
        buttons: [{ label: '知道了', primary: true }]
      });
    });
  }

  renderList();
  console.log('[公众号] 历史推送已加载');
})();
