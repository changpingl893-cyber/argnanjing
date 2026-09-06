// 帖子详情页逻辑
// 等级门槛检查 → 权限不足提示；内容缺失(损坏)帖 → 破旧感提示；已读标记；回复失败流程；下一篇导航。

const params = new URLSearchParams(location.search);
const id = params.get('id') || '1';
const AUTH = window.AUTHORS || {};
const P = window.POSTS || {};
const S = window.Story;
const post = P[id] || P['1'] || {};

function el(id) { return document.getElementById(id); }
function setText(id, val) { const e = el(id); if (e) e.textContent = val; }
function authorOf(authorId) {
  return AUTH[authorId] || { name: '', title: '', lv: '', tag: '', ip: '', age: '' };
}
// 仅六位守护者有真实用户主页；游客作者显示为普通文本
function isGuardian(authorId) {
  return ['1', '2', '3', '4', '5', '6'].includes(String(authorId));
}
function userWrap(authorId, authorName, inner) {
  if (isGuardian(authorId)) return `<a href="guardian.html?id=${authorId}">${inner}</a>`;
  return `<div style="color:inherit">${inner}</div>`;
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

/* ===== 等级门槛检查 ===== */
if (S && !S.canRead(id)) {
  const need = S.needLevel(id);
  // 用"楼层"区域换成一个权限提示（diegetic：权限系统还在运行）
  const floorOp = el('floor-op');
  if (floorOp) floorOp.style.display = 'none';
  setText('post-title', post.title || '未知帖子');
  const note = el('post-lock-note');
  if (note) {
    note.textContent = `该帖需 Lv.${need} 可见 · 当前等级 Lv.${S.level()} · 管理员已离任，权限系统仍在运行`;
    note.style.display = 'block';
  }
  const floors = el('floors');
  if (floors) {
    floors.innerHTML = `
      <div class="floor">
        <div class="floor-body">
          <div class="v98-msg" style="display:flex;gap:12px;align-items:flex-start">
            <div class="v98-icon warn">!</div>
            <div class="v98-text">
              阅读权限不足（0x80004005）。\n\n
              <b>${post.title || '未知帖子'}</b> 需要 Lv.${need} 才能查看。\n
              等级按"读完的章节数"计算：每读完一章 +1。\n\n
              已解锁的章节：${S.finishedChapters().map(c => c.name).join('、') || '（无）'}
            </div>
          </div>
          <div class="v98-btns">
            <button class="v98-btn" onclick="location.href='index.html'">返回论坛</button>
          </div>
        </div>
      </div>`;
  }
  el('reply-btn') && (el('reply-btn').style.display = 'none');
  console.log('[帖子详情] 权限不足：' + id);
} else {
  renderPost();
}

function renderPost() {
  /* ===== 已读标记（读完即打勾，驱动升级） ===== */
  if (S) S.markRead(id);

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

  /* ===== 正文（损坏帖 → 破旧感提示） ===== */
  const contentEl = el('op-content');
  if (contentEl) {
    if (post.content == null) {
      contentEl.innerHTML = `
        <div class="v98-msg" style="display:flex;gap:12px;align-items:flex-start">
          <div class="v98-icon error">✕</div>
          <div class="v98-text" style="white-space:normal">
            <b>无法显示帖子内容。</b><br><br>
            错误（0x80004005）：找不到该帖保存的任何数据。<br><br>
            这个网站从来不做备份——管理员离任后，大部分帖子只剩下标题还挂在列表里。
            它们不是被删了，只是从没被保存下来。
          </div>
        </div>`;
    } else {
      contentEl.innerHTML = post.content.split('\n').map(l => `<p>${l}</p>`).join('');
    }
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

  /* ===== 下一篇导航（时间线正序；锁定下一章 → 提示） ===== */
  const nextEl = el('post-next');
  if (nextEl && S) {
    const nextId = S.nextOf(id);
    const next = nextId ? P[nextId] : null;
    if (next) {
      if (S.canRead(nextId)) {
        nextEl.innerHTML = `
          <div class="next-card">
            <div class="next-label">下一篇 · ${next.date}</div>
            <a class="next-title" href="post.html?id=${nextId}">${next.title}</a>
            <div class="next-meta">${next.authorName} · ${next.badge || '帖'}${next.content == null ? ' · 内容缺失' : ''}</div>
          </div><div class="next-hint">读完本章所有帖子后，等级 +1</div>`;
      } else {
        nextEl.innerHTML = `
          <div class="next-card next-locked">
            <div class="next-label">下一篇 · ${next.date}</div>
            <div class="next-title">${next.title}</div>
            <div class="next-meta">🔒 需 Lv.${S.needLevel(nextId)} 可见 —— ${next.authorName}</div>
            <div class="next-hint">把本章剩下的帖子读完（还差 ${unsolvedInChapter()} 篇），就能解锁。</div>
          </div>`;
      }
    } else {
      nextEl.innerHTML = `<div class="next-card next-end">—— 已是本章最后一篇 · 返回<a href="index.html">论坛存档</a> ——</div>`;
    }
  }

  function unsolvedInChapter() {
    const chId = S.chapterOf(id);
    const posts = S.chapterPosts(chId);
    return posts.filter(([pid]) => !S.isRead(pid)).length;
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

  console.log('[帖子详情] post id=' + id + ' 已渲染 · 标记已读');
}
