// 我的归档（账号页）
// 无等级无注册门槛：展示恢复进度 / 章节完成度 / 阅读记录 /（全读完后的）彩蛋指引
// 网名可选，仅作装饰（本机保存）

(function () {
  const S = window.Story;
  const P = window.POSTS || {};

  function setText(id, val) { const e = document.getElementById(id); if (e) e.textContent = val; }

  function render() {
    const total = S.totalCount();
    const recovered = Object.keys(P).filter(id => S.isRestored(id)).length;

    /* 收藏卡 */
    setText('acct-avatar', S.getNick() ? S.getNick().charAt(0) : '访');
    setText('acct-name', S.getNick() || '访客');
    setText('acct-recovered', '已恢复 ' + recovered + '/' + total);
    document.getElementById('acct-bar-fill').style.width = (recovered / total * 100) + '%';
    const lost = S.lostCount();
    setText('acct-progress-text',
      lost > 0
        ? '归档中仍有 ' + lost + ' 篇未能恢复。它们不会出现在列表里——旧帖末尾的"相关帖"里，也许还有它们的痕迹。'
        : '归档已全部恢复。谢谢你来过。');

    /* 章节进度 */
    const chEl = document.getElementById('acct-chapters');
    let chHtml = '';
    S.CHAPTERS.forEach(ch => {
      const posts = S.chapterPosts(ch.id);
      const totalC = posts.length;
      const done = posts.filter(([id]) => S.isRead(id)).length;
      const finished = done >= totalC && totalC > 0;
      chHtml += `
      <div class="acct-chapter ${finished ? 'done' : ''}">
        <div class="acct-chap-head">
          <span class="acct-chap-period">${ch.period}</span>
          <b class="acct-chap-name">${ch.name}</b>
          <span class="acct-chap-status">${finished ? '✅ 全部读毕 ' + done + '/' + totalC : '已恢复 ' + done + '/' + totalC}</span>
        </div>
        <p class="acct-chap-desc">${ch.desc}</p>
        <div class="acct-chap-posts">
          ${posts.map(([pid, p]) => {
            const read = S.isRead(pid);
            const visible = S.isRestored(pid);
            const icon = read ? '✓' : (visible ? '○' : '◆');
            const link = visible ? `href="post.html?id=${pid}"` : '';
            const cls = read ? 'read' : (visible ? 'unread' : 'still-locked');
            const label = visible ? `${p.date} · ${p.title}` : `${p.date} · （未能恢复）`;
            return `<a class="acct-post ${cls}" ${link}>${icon} ${label}</a>`;
          }).join('')}
        </div>
      </div>`;
    });
    chEl.innerHTML = chHtml;

    /* 阅读记录（最近在前的已读帖子） */
    const rlEl = document.getElementById('acct-readlist');
    const readList = S.readList().slice().reverse();
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

    /* 彩蛋指引（只有全部读完才出现） */
    if (S.completed()) {
      document.getElementById('acct-egg').style.display = '';
    }
  }

  render();

  /* 可选网名：点击即改（本机保存，仅装饰） */
  const nickEdit = document.getElementById('acct-nick-edit');
  if (nickEdit && window.v98Popup) {
    nickEdit.style.cursor = 'pointer';
    nickEdit.addEventListener('click', () => {
      const input = document.createElement('input');
      input.className = 'v98-input';
      input.maxLength = 16;
      input.value = S.getNick();
      input.placeholder = '你的网名';
      const dlg = v98Popup({
        title: '起个网名',
        icon: 'info',
        html: '注册模块还在运行——它是这站里唯一还在工作的东西。就当留个记号。',
        dismissable: false,
        buttons: []
      });
      dlg.root.querySelector('.v98-text').appendChild(input);
      const cancel = document.createElement('button');
      cancel.className = 'v98-btn'; cancel.textContent = '算了';
      cancel.addEventListener('click', () => dlg.close());
      const ok = document.createElement('button');
      ok.className = 'v98-btn pressed'; ok.textContent = '记下';
      ok.addEventListener('click', () => {
        const n = (input.value || '').trim();
        S.setNick(n);
        dlg.close();
        render();
      });
      dlg.addBtn(cancel);
      dlg.addBtn(ok);
      input.focus();
    });
  }
})();
