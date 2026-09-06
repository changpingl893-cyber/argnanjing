// 我的归档（账号页）
// 无锁定无门槛：展示阅读进度 / 章节完成度 / 阅读记录 /（全读完后的）彩蛋指引
// 网名可选，仅作装饰（本机保存）

(function () {
  const S = window.Story;
  const P = window.POSTS || {};

  function setText(id, val) { const e = document.getElementById(id); if (e) e.textContent = val; }

  function render() {
    const total = S.totalCount();
    const readCount = S.readList().length;

    /* 归档卡 */
    setText('acct-avatar', S.getNick() ? S.getNick().charAt(0) : '访');
    setText('acct-name', S.getNick() || '访客');
    setText('acct-recovered', '已读 ' + readCount + '/' + total);
    document.getElementById('acct-bar-fill').style.width = (readCount / total * 100) + '%';
    setText('acct-progress-text',
      S.completed() ? '全部读完。谢谢你来过。'
        : '按时间线从最早的帖子读起即可。其中两帖已被删除/设为私密，只留下标题。');

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
          <span class="acct-chap-status">${finished ? '✅ 全部读毕 ' + done + '/' + totalC : done + '/' + totalC}</span>
        </div>
        <p class="acct-chap-desc">${ch.desc}</p>
        <div class="acct-chap-posts">
          ${posts.map(([pid, p]) => {
            const read = S.isRead(pid);
            const icon = read ? '✓' : '○';
            const cls = read ? 'read' : 'unread';
            const tag = p.deleted ? '（已删除）' : (p.private ? '（私密）' : '');
            return `<a class="acct-post ${cls}" href="post.html?id=${pid}">${icon} ${p.date} · ${p.title} ${tag}</a>`;
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
