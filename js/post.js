// 帖子详情页逻辑
// 隐藏帖（索引损坏）规则：未经"相关帖"链接（?id=X&ref=来源）进入的，一律提示"数据未能恢复"；
// 从相关帖链接进入 → 允许阅读并标记恢复，此后主页正常显示。

const params = new URLSearchParams(location.search);
const id = params.get('id') || '1';
const fromRef = params.get('ref');          // 来源帖 id（相关帖链接携带）
const AUTH = window.AUTHORS || {};
const P = window.POSTS || {};
const S = window.Story;
const post = P[id] || P['1'] || {};

function el(id) { return document.getElementById(id); }
function setText(id, val) { const e = el(id); if (e) e.textContent = val; }
function authorOf(authorId) {
  return AUTH[authorId] || { name: '', title: '', lv: '', tag: '', ip: '', age: '' };
}
function isGuardian(authorId) {
  return ['1', '2', '3', '4', '5', '6'].includes(String(authorId));
}
function titleTagsHtml(a) {
  let html = '';
  if (a.title) html += `<span class="badge-tag text">${a.title}</span>`;
  if (a.lv) html += `<span class="badge-tag lv">${a.lv}</span>`;
  if (a.tag) html += `<span class="badge-tag elite">${a.tag}</span>`;
  return html;
}
function avatarHtml(a) {
  if (a.avatar) return `<img class="floor-avatar-img" src="${a.avatar}" alt="">`;
  return a.name.charAt(0);
}

/* ===== 可读性判定 ===== */
const isHidden = S.isHidden(id);
const canOpen = !isHidden || S.isRead(id) || !!fromRef;

if (!canOpen) {
  renderUnavailable();
} else {
  renderPost();
  if (isHidden && !S.isRead(id)) {
    // 从相关帖恢复：标记已读（此后主页显示）
    S.markRead(id);
  }
}

/* 未恢复的隐藏帖：数据未能恢复提示页（不暴露真实标题） */
function renderUnavailable() {
  const floorOp = el('floor-op');
  if (floorOp) floorOp.style.display = 'none';
  setText('post-title', '〔数据未能恢复 · 归档登记号 #' + id + '〕');
  const badge = el('post-badge');
  if (badge) badge.textContent = '损坏';

  const floors = el('floors');
  if (floors) {
    floors.innerHTML = `
      <div class="floor">
        <div class="floor-body">
          <div class="v98-msg" style="display:flex;gap:12px;align-items:flex-start">
            <div class="v98-icon error">✕</div>
            <div class="v98-text" style="white-space:normal">
              <b>数据未能恢复（0x80004005）。</b><br><br>
              该帖的归档索引已损坏，无法从论坛列表直接打开。<br><br>
              这个站从 2018 年起就没人维护了。损坏的帖子在列表里只剩一个登记号
              （#${id}）——它们不是被删了，是从没被保存下来。<br><br>
              也许，某个仍然完好的旧帖里还留着它的痕迹。
            </div>
          </div>
          <div class="v98-btns">
            <button class="v98-btn" onclick="location.href='index.html'">返回论坛</button>
          </div>
        </div>
      </div>`;
  }
  const replyBtn = el('reply-btn');
  if (replyBtn) replyBtn.style.display = 'none';
  console.log('[帖子详情] 索引损坏不可恢复：' + id);
}

function renderPost() {
  /* ===== 恢复正常显示后：标记已读 ===== */
  if (S && !S.isRead(id)) S.markRead(id);

  /* ===== 帖子头 ===== */
  if (el('post-badge')) { el('post-badge').textContent = post.badge || ''; el('post-badge').className = 'post-cat-badge ' + (post.badgeClass || ''); }
  setText('post-title', post.title || '帖子标题');

  const lastReply = (post.replies && post.replies.length) ? post.replies[post.replies.length - 1].date : post.date;
  const lockNote = el('post-lock-note');
  if (lockNote && lastReply) {
    lockNote.textContent = `本贴最后回复于 ${lastReply} · 管理人员已于 2018 年 1 月离任，帖子自动锁定`;
    lockNote.style.display = 'block';
  }

  /* ===== 楼主 ===== */
  const opAuthor = authorOf(post.authorId);
  if (el('op-avatar')) el('op-avatar').innerHTML = avatarHtml(opAuthor);
  setText('op-name', post.authorName || opAuthor.name);
  if (el('op-tags')) el('op-tags').innerHTML = titleTagsHtml(opAuthor);
  setText('op-ip', 'IP属地：' + (post.ip || opAuthor.ip || '—'));
  const opLink = document.querySelector('#floor-op .floor-user a');
  if (opLink) {
    if (isGuardian(post.authorId)) {
      opLink.href = 'guardian.html?id=' + post.authorId;
    } else {
      opLink.outerHTML = `<div>${opLink.innerHTML}</div>`;
    }
  }

  /* ===== 正文 ===== */
  const contentEl = el('op-content');
  if (contentEl) {
    contentEl.innerHTML = post.content.split('\n').map(l => `<p>${l}</p>`).join('');
  }

  /* ===== 配图 ===== */
  if (post.image && el('op-image')) {
    el('op-image').src = post.image;
    el('op-image').style.display = 'block';
  } else if (el('op-image')) {
    el('op-image').style.display = 'none';
  }

  /* ===== 回复楼层 ===== */
  const floors = el('floors');
  if (floors && post.replies) {
    const repliesHtml = post.replies.map((r, i) => {
      const ra0 = authorOf(r.authorId);
      const ra = Object.assign({}, ra0, { name: r.authorName || ra0.name });
      const userBlock = `
        <div class="floor-avatar">${avatarHtml(ra)}</div>
        <div class="floor-username">${r.authorName || ra0.name}</div>`;
      return `
      <div class="floor">
        <div class="floor-user">
          ${isGuardian(r.authorId)
            ? `<a href="guardian.html?id=${r.authorId}">${userBlock}</a>`
            : `<div style="color:inherit">${userBlock}</div>`}
          <div class="floor-tags">${titleTagsHtml(ra0)}</div>
          <div class="floor-rank floor-rank-reply">${i + 1}楼</div>
        </div>
        <div class="floor-body">
          <div class="floor-content"><p>${r.text}</p></div>
          <div class="floor-date">${r.date}</div>
          <div class="floor-ip">IP属地：${r.ip || ra.ip}</div>
        </div>
      </div>`;
    }).join('');
    floors.innerHTML = repliesHtml;
  }

  /* ===== 下一篇导航（时间线正序；未恢复的隐藏帖 → 显示"未能恢复"卡） ===== */
  const nextEl = el('post-next');
  if (nextEl && S) {
    const nextId = S.nextOf(id);
    const next = nextId ? P[nextId] : null;
    if (next) {
      const nextLost = S.isHidden(nextId) && !S.isRead(nextId);
      if (nextLost) {
        nextEl.innerHTML = `
          <div class="next-card next-locked">
            <div class="next-label">下一篇 · ${next.date}</div>
            <div class="next-title next-title-lost">〔数据未能恢复〕</div>
            <div class="next-meta">归档登记号 #${nextId} · 索引损坏</div>
            <div class="next-hint">本篇无法从归档中打开。也许某个旧帖里还留着它的痕迹——留心帖子末尾的"相关帖"。</div>
          </div>`;
      } else {
        nextEl.innerHTML = `
          <div class="next-card">
            <div class="next-label">下一篇 · ${next.date}</div>
            <a class="next-title" href="post.html?id=${nextId}">${next.title}</a>
            <div class="next-meta">${next.authorName} · ${next.badge || '帖'}</div>
          </div>`;
      }
    } else {
      const lost = S.lostCount();
      nextEl.innerHTML = `
        <div class="next-card next-end">—— 已经是归档中最后一篇 · 返回<a href="index.html">论坛存档</a> ——</div>
        ${lost > 0 ? `<div class="next-hint" style="text-align:center">归档中仍有 ${lost} 篇未能恢复。它们就藏在旧帖的"相关帖"里。</div>` : ''}`;
    }
  }

  /* ===== 回复流程（必然失败） ===== */
  const replyBtn = el('reply-btn');
  if (replyBtn && window.v98Popup) {
    replyBtn.addEventListener('click', () => {
      const ta = document.createElement('textarea');
      ta.className = 'v98-input';
      ta.rows = 4;
      ta.placeholder = '友善发言…（其实发不出去）';
      let sent = false;
      const dlg = v98Popup({
        title: '发表回复',
        icon: 'info',
        html: `回复 <b>${post.authorName || '楼主'}</b>：`,
        dismissable: false,
        onClose: () => { if (!sent) ta.value = ''; },
        buttons: []
      });
      dlg.root.querySelector('.v98-text').appendChild(ta);
      const send = document.createElement('button');
      send.className = 'v98-btn';
      send.textContent = '发表回复';
      const cancel = document.createElement('button');
      cancel.className = 'v98-btn';
      cancel.textContent = '放弃';
      cancel.addEventListener('click', () => dlg.close());
      dlg.addBtn(cancel);
      dlg.addBtn(send);
      send.addEventListener('click', () => {
        send.disabled = true;
        cancel.disabled = true;
        send.textContent = '发送中…';
        const textEl = dlg.root.querySelector('.v98-text');
        textEl.innerHTML = '<span class="v98-spin">☺</span> 正在连接服务器（timeout: 30s）…';
        setTimeout(() => {
          sent = true;
          dlg.setText('');
          dlg.setHTML(
            '发送失败（错误 0x800706BA：服务器 RPC 不可用）。\n\n' +
            '该贴最后一楼发布于 ' + lastReply + '。站长已于 2018 年 1 月离任，' +
            '此贴已自动锁定，不再接受回复。'
          );
          const ok = document.createElement('button');
          ok.className = 'v98-btn pressed';
          ok.textContent = '确定';
          ok.addEventListener('click', () => dlg.close());
          dlg.addBtn(ok);
        }, 1100);
      });
    });
  }

  console.log('[帖子详情] post id=' + id + ' 已渲染');
}
