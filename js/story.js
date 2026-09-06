// 古时今日 · 归档 / 恢复系统
// 设定：网站 2018 年停更后年久失修，部分帖子的归档索引已损坏——
// 它们不会出现在论坛列表里，只能通过旧帖里残留的"相关帖"链接找到（读过即恢复，此后正常显示）。
// 无等级、无注册门槛；进度只记录在本机（localStorage）。

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

    /* ------ 阅读 / 恢复 ------ */
    isRead(id) { return state().read.includes(String(id)); },
    markRead(id) {
      const s = state();
      const i = String(id);
      if (!s.read.includes(i)) { s.read.push(i); save(s); }
    },
    readList() { return state().read.slice(); },

    /* ------ 帖子可见性 ------ */
    isHidden(id) {
      const p = (window.POSTS || {})[id];
      return !!(p && p.hidden);
    },
    // 归档列表是否显示该帖（隐藏帖在恢复前不显示，只留残迹）
    isRestored(id) { return !api.isHidden(id) || api.isRead(id); },
    lostCount() {
      const P = window.POSTS || {};
      return Object.keys(P).filter(id => api.isHidden(id) && !api.isRead(id)).length;
    },
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

    /* ------ 下一篇（时间线正序；隐藏帖未恢复 → 返回 null + 由页面显示"未能恢复"） ------ */
    nextOf(id) {
      const P = window.POSTS || {};
      const ids = Object.keys(P).sort((a, b) => P[a].date.localeCompare(P[b].date));
      const i = ids.indexOf(String(id));
      return i >= 0 && i < ids.length - 1 ? ids[i + 1] : null;
    },
    prevOf(id) {
      const P = window.POSTS || {};
      const ids = Object.keys(P).sort((a, b) => P[a].date.localeCompare(P[b].date));
      const i = ids.indexOf(String(id));
      return i > 0 ? ids[i - 1] : null;
    },
  };

  window.Story = api;
})();
