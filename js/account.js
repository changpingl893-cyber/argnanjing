// 个人主页：全部帖子一览 / 浏览记录 /（全读完后的）彩蛋指引；网名可选
// 去掉游戏化元素：无进度条、无"已恢复"计数，用普通个人主页的表述。

(function () {
  const S = window.Story;
  const P = window.POSTS || {};

  function setText(id, val) { const e = document.getElementById(id); if (e) e.textContent = val; }

  function render() {
    const total = S.totalCount();
    const readCount = S.readList().length;

    /* 个人卡 */
    setText('acct-avatar', S.getNick() ? S.getNick().charAt(0) : '访');
    setText('acct-name', S.getNick() || '访客');
    setText('acct-recovered', '浏览 ' + readCount + ' / ' + total);
    setText('acct-progress-text',
      S.completed() ? '全部看完。' : '注册模块还在运行——它是这个站唯一还在工作的东西。');

    /* 全部帖子一览 */
    const chEl = document.getElementById('acct-chapters');
    let html = '<div class="acct-chapter"><div class="acct-chap-posts">';
    S.allPosts().forEach(([pid, p]) => {
      const read = S.isRead(pid);
      const icon = read ? '✓' : '·';
      const cls = read ? 'read' : 'unread';
      const tag = p.deleted ? '（已删除）' : (p.private ? '（私密）' : '');
      html += `<a class="acct-post ${cls}" href="post.html?id=${pid}">${icon} ${p.date} · ${p.title} ${tag}</a>`;
    });
    html += '</div></div>';
    chEl.innerHTML = html;

    /* 浏览记录（最近在前） */
    const rlEl = document.getElementById('acct-readlist');
    const readList = S.readList().slice().reverse();
    if (!readList.length) {
      rlEl.innerHTML = '<p class="acct-empty">还没有浏览记录。</p>';
    } else {
      rlEl.innerHTML = readList.map(pid => {
        const p = P[pid];
        if (!p) return '';
        return `<a class="acct-read-item" href="post.html?id=${pid}">
          <span>${p.date}</span>${p.title}
          <i class="acct-read-arrow">→</i></a>`;
      }).join('');
    }

    /* 彩蛋指引（全部读完才出现） */
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
