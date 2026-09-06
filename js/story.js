// 古时今日 · 阅读记录（无锁定、无门槛：进站即读全部帖子）
// 保留：章节分组、已读标记（驱动"我的归档"与彩蛋指引）、下一篇导航。
// 特殊帖子（已删除/私密）只是内容展示形态，不影响可访问性。

(function () {
  const KEY = 'gushijinri.progress.v2';

  const CHAPTERS = [
    { id: 'c1', name: '初雪', period: '2016',        desc: '四个人建站的那一年。后来的故事，都从这一年开始。' },
    { id: 'c2', name: '风暴', period: '2017 春',     desc: '有人开始怀疑青瓷。网暴来得比想象中快。' },
    { id: 'c3', name: '暗涌', period: '2017 夏 · 秋', desc: '大盘不见了。如意说他快知道是谁了。' },
    { id: 'c4', name: '长夜', period: '2017 冬',     desc: '过客走了。守夜人发了最后一篇长文。' },
    { id: 'c5', name: '遗响', period: '2018',        desc: '最后一条留言。之后再没有人回应。' },
  ];

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  function state() {
    const s = load();
    if (!Array.isArray(s.read)) s.read = [];
    return s;
  }

  function postsOf(chapterId) {
    const P = window.POSTS || {};
    return Object.entries(P)
      .filter(([, p]) => p.chapter === chapterId)
      .sort((a, b) => a[1].date.localeCompare(b[1].date));
  }

  const api = {
    CHAPTERS,

    /* ------ 昵称（可选，仅归档页装饰） ------ */
    getNick() { return state().nick || ''; },
    setNick(n) { const s = state(); s.nick = n; save(s); },

    /* ------ 阅读记录 ------ */
    isRead(id) { return state().read.includes(String(id)); },
    markRead(id) {
      const s = state();
      const i = String(id);
      if (!s.read.includes(i)) { s.read.push(i); save(s); }
    },
    readList() { return state().read.slice(); },
    totalCount() { return Object.keys(window.POSTS || {}).length; },

    /* ------ 章节 ------ */
    chapterOf(id) { const p = (window.POSTS || {})[id]; return p ? p.chapter : null; },
    chapterPosts(chapterId) { return postsOf(chapterId); },
    finishedChapters() {
      return api.CHAPTERS.filter(c => {
        const ids = postsOf(c.id).map(([id]) => id);
        return ids.length > 0 && ids.every(id => api.isRead(id));
      });
    },
    completed() {
      return api.CHAPTERS.every(c => {
        const ids = postsOf(c.id).map(([id]) => id);
        return ids.length > 0 && ids.every(id => api.isRead(id));
      });
    },

    /* ------ 下一篇（时间线正序） ------ */
    nextOf(id) {
      const P = window.POSTS || {};
      const ids = Object.keys(P).sort((a, b) => P[a].date.localeCompare(P[b].date));
      const i = ids.indexOf(String(id));
      return i >= 0 && i < ids.length - 1 ? ids[i + 1] : null;
    },
  };

  window.Story = api;
})();
