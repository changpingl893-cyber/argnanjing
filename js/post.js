// 帖子详情页逻辑
// 全部帖子直接可读。两类特殊帖仅改变内容呈现：
//   - deleted：内容区显示"该帖已被删除"
//   - private：内容区显示"内容已转移至未公开区"

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

renderPost();
if (S) S.markRead(id);

function renderPost() {
  /* ===== 帖子头 ===== */
  if (el('post-badge')) { el('post-badge').textContent = post.badge || ''; el('post-badge').className = 'post-cat-badge ' + (post.badgeClass || (post.deleted ? 'badge-dead' : (post.private ? 'badge-private' : ''))); }
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

  /* ===== 正文（已删除 / 私密 → 特殊提示） ===== */
  const contentEl = el('op-content');
  if (contentEl) {
    if (post.deleted) {
      contentEl.innerHTML = `
        <div class="v98-msg" style="display:flex;gap:12px;align-items:flex-start">
          <div class="v98-icon error">✕</div>
          <div class="v98-text" style="white-space:normal">
            <b>该帖已被删除。</b><br><br>
            删除时间：2017-01-15 · 操作：管理员（站内排查）<br><br>
            这个站从 2018 年起就没有人维护了，被删除的帖子从此无法恢复。
            <span style="color:#999;font-size:12px;display:block;margin-top:8px">（原帖：青瓷 · 2016-12-29 · 《我们的 2016》，含合影与聚会记录）</span>
          </div>
        </div>`;
    } else if (post.private) {
      contentEl.innerHTML = `
        <div class="v98-msg" style="display:flex;gap:12px;align-items:flex-start">
          <div class="v98-icon info">i</div>
          <div class="v98-text" style="white-space:normal">
            <b>该帖内容已转移至站内"未公开区"。</b><br><br>
            2017-07-25 应登记者要求处理：其账号注销后，发布内容不再对外展示。<br><br>
            <span style="color:#999;font-size:12px">（标题仍保留：分类归档、登记号可见）</span>
          </div>
        </div>`;
    } else {
      contentEl.innerHTML = post.content.split('\n').map(l => `<p>${l}</p>`).join('');
    }
  }

  /* ===== 配图（私密/删除帖不显示图） ===== */
  if ((post.deleted || post.private) && el('op-image')) {
    el('op-image').style.display = 'none';
  } else if (post.image && el('op-image')) {
    el('op-image').src = post.image;
    el('op-image').style.display = 'block';
  } else if (el('op-image')) {
    el('op-image').style.display = 'none';
  }

  /* ===== 回复楼层（删除/私密帖无回复） ===== */
  const floors = el('floors');
  if (floors && post.replies && !post.deleted && !post.private) {
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

  /* ===== 上一篇 / 下一篇导航（按当前排序方向） ===== */
  const nextEl = el('post-next');
  if (nextEl && S) {
    const mode = S.getSort();
    const prevId = S.prevOf(id, mode === 'desc');
    const nextId = S.nextOf(id, mode === 'desc');
    const prev = prevId ? P[prevId] : null;
    const next = nextId ? P[nextId] : null;
    let html = '';
    if (prev) {
      html += `
        <div class="next-card">
          <div class="next-label">上一篇 · ${prev.date}</div>
          <a class="next-title" href="post.html?id=${prevId}">${prev.title}</a>
          <div class="next-meta">${prev.authorName} · ${prev.badge || '帖'}</div>
        </div>`;
    }
    if (next) {
      html += `
        <div class="next-card">
          <div class="next-label">下一篇 · ${next.date}</div>
          <a class="next-title" href="post.html?id=${nextId}">${next.title}</a>
          <div class="next-meta">${next.authorName} · ${next.badge || '帖'}</div>
        </div>`;
    }
    if (!html) {
      html = `<div class="next-card next-end">—— 归档中已是第一篇 · 返回<a href="index.html">论坛</a> ——</div>`;
    }
    nextEl.innerHTML = html;
  }

  /* ===== 回复流程（必然失败） ===== */
  const replyBtn = el('reply-btn');
  if (replyBtn && window.v98Popup && !post.deleted && !post.private) {
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
  } else if (replyBtn) {
    replyBtn.style.display = 'none';
  }

  console.log('[帖子详情] post id=' + id + ' 已渲染');
}
