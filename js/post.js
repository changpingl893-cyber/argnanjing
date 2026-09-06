// 文章页：微信推文渲染（标题/作者/阅读数据/正文/图片/评论区/写留言失败/阅读原文/上下篇）

const params = new URLSearchParams(location.search);
const id = params.get('id') || '1';
const P = window.POSTS || {};
const S = window.Story;
const AUTH = window.AUTHORS || {};
const art = P[id] || P['1'] || {};

function el(id) { return document.getElementById(id); }
function setText(id, val) { const e = el(id); if (e) e.textContent = val; }
function fmtLikes(n) { return n >= 1000 ? Math.round(n / 100) / 10 + 'k' : String(n); }

render();

function render() {
  /* 头部 */
  setText('a-title', art.title || '');
  setText('a-author', AUTH[art.author] ? AUTH[art.author].name : (art.authorTag === '留言求助' ? '匿名读者' : '古时今日'));
  setText('a-date', art.date);
  if (art.submitter) { const elSub = el('a-submitter'); if (elSub) { elSub.textContent = '本文据 @' + AUTH[art.submitter].name + ' 来稿整理'; elSub.style.display = 'block'; } }
  const tagEl = el('a-tag');
  if (tagEl) tagEl.textContent = art.authorTag || '原创';

  /* 阅读数据 */
  setText('a-reads', '阅读 ' + S.fmtReads(art.reads) + ' · 赞 ' + fmtLikes(art.likes) + ' · 在看 ' + fmtLikes(art.wawas));

  /* 正文 */
  const body = el('a-body');
  if (body) {
    if (art.deleted) {
      body.innerHTML = `
        <div class="v98-msg" style="display:flex;gap:12px;align-items:flex-start">
          <div class="v98-icon error">✕</div>
          <div class="v98-text" style="white-space:normal">
            <b>该内容已被发布者删除。</b><br><br>
            删除时间：2017-01-15 · 操作：号主（站内排查）<br><br>
            这个号从 2018 年起就没有人登录了，被删除的内容无法恢复。
            <span style="color:#999;font-size:12px;display:block;margin-top:8px">（原篇：青瓷 投稿 · 2016-12-29 · 《我们的 2016》，含合影与聚会记录）</span>
          </div>
        </div>`;
    } else {
      body.innerHTML = art.content.split('\n').map(l => `<p>${l}</p>`).join('');
    }
  }

  /* 图片 */
  const img = el('a-image');
  if (img) {
    if (art.image && !art.deleted) { img.src = art.image; img.style.display = 'block'; }
    else img.style.display = 'none';
  }

  /* 评论数 */
  const cmtCount = el('cmt-count');
  if (cmtCount) cmtCount.textContent = (art.comments || []).length;

  /* 评论区 */
  const cmtEl = el('comment-list');
  if (cmtEl) {
    const list = art.comments || [];
    if (!list.length) {
      cmtEl.innerHTML = '<div class="cmt-empty">暂无留言。</div>';
    } else {
      cmtEl.innerHTML = list.map(c => {
        const sub = c.authorReply ? `
          <div class="cmt-author-reply"><b>作者回复 ${c.authorReply.date}</b>　${c.authorReply.text}</div>` : '';
        return `
        <div class="cmt-item">
          <div class="cmt-avatar">${(c.name || '?').charAt(0)}</div>
          <div class="cmt-main">
            <div class="cmt-name">${c.name}</div>
            <div class="cmt-text">${c.text}</div>
            ${sub}
            <div class="cmt-meta">${c.date} · <span class="cmt-like">赞 ${fmtLikes(c.likes)}</span></div>
          </div>
        </div>`;
      }).join('');
    }
  }

  /* 写留言（必然失败） */
  const wr = el('write-btn');
  if (wr && window.v98Popup) {
    if (art.authorTag === '留言求助') {
      wr.addEventListener('click', () => {
        v98Popup({
          title: '留言失败',
          icon: 'warn',
          text: '留言失败（该留言区已关闭）。\n\n这篇文章发出后，再也没有人回复。',
          buttons: [{ label: '知道了', primary: true }]
        });
      });
    } else {
      wr.addEventListener('click', () => {
        v98Popup({
          title: '留言失败',
          icon: 'warn',
          text: '留言失败：该公众号已很久没有登录。\n\n本号最后更新于 2018 年，留言区已自动关闭。',
          buttons: [{ label: '知道了', primary: true }]
        });
      });
    }
  }

  /* 阅读原文（彩蛋入口：相册与最后长文） */
  const orig = el('read-origin');
  if (orig) {
    if (['27', '18', '5'].includes(id)) {
      orig.style.display = 'block';
    } else {
      orig.style.display = 'none';
    }
  }

  /* 上一篇 / 下一篇（时间倒序） */
  const navEl = el('a-nav');
  if (navEl) {
    const prevId = S.prevOf(id);
    const nextId = S.nextOf(id);
    let h = '';
    if (prevId) h += `<a class="nav-btn" href="post.html?id=${prevId}">← 上一篇 · ${P[prevId].title.slice(0, 14)}</a>`;
    if (nextId) h += `<a class="nav-btn" href="post.html?id=${nextId}">下一篇 · ${P[nextId].title.slice(0, 14)} →</a>`;
    if (!h) h = `<a class="nav-btn" href="index.html">← 返回公众号历史消息</a>`;
    navEl.innerHTML = h;
  }
}
