// 我的阅读档案（账号页）
// 展示：等级 / 章节进度 / 阅读记录 / （全读完后的）彩蛋指引

(function () {
  const S = window.Story;
  const P = window.POSTS || {};

  function setText(id, val) { const e = document.getElementById(id); e && (e.textContent = val); }

  /* ===== 角色等级称呼 ===== */
  function roleName(level) {
    return ['—', '访客', '吧友', '老友', '守护', '守夜人'][level] || '访客';
  }

  function render() {
    const acct = S.account();
    const level = acct.level;

    /* 账号卡 */
    if (!S.isRegistered()) {
      setText('acct-avatar', '访');
      setText('acct-name', '尚未注册');
      setText('acct-lv', 'Lv.—');
      setText('acct-role', '访客');
      setText('acct-progress-text', '注册后即可从最早的一篇帖子开始读起（注册模块是这站里唯一还在运行的东西）。');
      document.getElementById('acct-bar-fill').style.width = '0%';
    } else {
      setText('acct-avatar', acct.nick.charAt(0));
      setText('acct-name', acct.nick);
      setText('acct-lv', 'Lv.' + level);
      setText('acct-role', roleName(level));
      const doneChapters = S.finishedChapters().length;
      const totalChapters = S.CHAPTERS.length;
      document.getElementById('acct-bar-fill').style.width = (doneChapters / totalChapters * 100) + '%';
      setText('acct-progress-text',
        '已读完 ' + doneChapters + ' / ' + totalChapters + ' 章 · ' +
        (S.completed() ? '全部读完，感谢你来过。' : '继续读帖，每读完一章等级 +1'));
    }

    /* 章节进度 */
    const chEl = document.getElementById('acct-chapters');
    let chHtml = '';
    S.CHAPTERS.forEach(ch => {
      const posts = S.chapterPosts(ch.id);
      const total = posts.length;
      const done = posts.filter(([id]) => S.isRead(id)).length;
      const finished = done >= total && total > 0;
      const unlocked = level >= ch.level;
      const status = finished ? '✅ 已读完' : (unlocked ? `阅读中 ${done}/${total}` : `🔒 Lv.${ch.level} 解锁`);
      chHtml += `
      <div class="acct-chapter ${finished ? 'done' : (unlocked ? 'open' : 'locked')}">
        <div class="acct-chap-head">
          <span class="acct-chap-period">${ch.period}</span>
          <b class="acct-chap-name">${ch.name}</b>
          <span class="acct-chap-status">${status}</span>
        </div>
        <p class="acct-chap-desc">${ch.desc}</p>
        <div class="acct-chap-posts">
          ${posts.map(([pid, p]) => {
            const read = S.isRead(pid);
            const cls = read ? 'read' : (unlocked ? 'unread' : 'still-locked');
            const icon = read ? '✓' : (unlocked ? '○' : '●');
            const link = (unlocked && !read) || read ? `href="post.html?id=${pid}"` : '';
            return `<a class="acct-post ${cls}" ${link}>${icon} ${p.date} · ${p.title}</a>`;
          }).join('')}
        </div>
      </div>`;
    });
    chEl.innerHTML = chHtml;

    /* 阅读记录（最近在前的已读帖子） */
    const rlEl = document.getElementById('acct-readlist');
    const readList = acct.read.slice().reverse();
    if (!readList.length) {
      rlEl.innerHTML = '<p class="acct-empty">还没有阅读记录。<a href="post.html?id=1">从最早的帖子开始 →</a></p>';
    } else {
      rlEl.innerHTML = readList.map(pid => {
        const p = P[pid];
        if (!p) return '';
        return `<a class="acct-read-item" href="post.html?id=${pid}">
          <span>${p.date}</span>${p.title}
          <i class="acct-read-arrow">→</i></a>`;
      }).join('');
    }

    /* 彩蛋指引 */
    if (S.isRegistered() && S.completed()) {
      document.getElementById('acct-egg').style.display = '';
    }
  }

  render();

  /* 未注册 → 弹出注册框 */
  if (!S.isRegistered() && window.v98Popup) {
    setTimeout(() => {
      const nick = document.createElement('input');
      nick.className = 'v98-input';
      nick.maxLength = 16;
      nick.placeholder = '你的网名';
      const dlg = v98Popup({
        title: '注册 - 古时今日',
        icon: 'info',
        html: '还没有账号。注册模块仍在运行（它是这个站里唯一还在工作的东西）。\n注册后开始阅读档案。',
        dismissable: false,
        buttons: []
      });
      dlg.root.querySelector('.v98-text').appendChild(nick);
      const later = document.createElement('button');
      later.className = 'v98-btn'; later.textContent = '稍后';
      later.addEventListener('click', () => dlg.close());
      const ok = document.createElement('button');
      ok.className = 'v98-btn pressed'; ok.textContent = '注册';
      ok.addEventListener('click', () => {
        const n = (nick.value || '').trim();
        if (!n) { nick.focus(); return; }
        S.register(n);
        dlg.close();
        render();
      });
      dlg.addBtn(later);
      dlg.addBtn(ok);
      nick.focus();
    }, 300);
  }
})();
