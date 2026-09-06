// 古时今日 · 故事进度系统（注册 / 章节 / 等级 / 阅读进度）
// 设定：废弃网站停更于2018，但"等级权限系统"仍在运行——这是全站唯一还活着的模块。
// 玩家注册账号（Lv.1）→ 按时间线读帖 → 每读完一章升一级 → 逐层解锁。
// 等级规则：Lv.1 注册即有；读完第 N 章 → Lv.N+1（上限 Lv.5）。
// 章帖门槛：章一 Lv.1 / 章二 Lv.2 / 章三 Lv.3 / 章四 Lv.4 / 章五 Lv.5。

(function () {
  const KEY = 'gushijinri.progress.v1';

  const CHAPTERS = [
    { id: 'c1', name: '初雪', period: '2016',        level: 1, desc: '四个人建站的那一年。后来的故事，都从这一年开始。' },
    { id: 'c2', name: '风暴', period: '2017 春',     level: 2, desc: '有人开始怀疑青瓷。网暴来得比想象中快。' },
    { id: 'c3', name: '暗涌', period: '2017 夏 · 秋', level: 3, desc: '大盘不见了。如意说他快知道是谁了。' },
    { id: 'c4', name: '长夜', period: '2017 冬',     level: 4, desc: '过客走了。守夜人发了最后一篇长文。' },
    { id: 'c5', name: '遗响', period: '2018',        level: 5, desc: '最后一条留言。之后再没有人回应。' },
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

    /* ------ 注册 ------ */
    isRegistered() { return !!state().nick; },
    register(nick) { const s = state(); s.nick = nick; s.read = []; save(s); },
    account() {
      const s = state();
      return { nick: s.nick || '', level: api.level(), read: s.read.slice() };
    },

    /* ------ 阅读进度 ------ */
    isRead(id) { return state().read.includes(String(id)); },
    markRead(id) {
      const s = state();
      const i = String(id);
      if (!s.read.includes(i)) { s.read.push(i); save(s); }
    },

    /* ------ 章节 ------ */
    chapterOf(id) { const p = (window.POSTS || {})[id]; return p ? p.chapter : null; },
    chapterInfo(id) {
      const c = api.chapterOf(id) ? api.CHAPTERS.find(x => x.id === api.chapterOf(id)) : null;
      return c || null;
    },
    // 每章全部帖子（未读/已读信息由调用方用 isRead 判断）
    chapterPosts(chapterId) { return postsOf(chapterId); },
    // 已读章节列表
    finishedChapters() {
      return api.CHAPTERS.filter(c => {
        const ids = postsOf(c.id).map(([id]) => id);
        return ids.length > 0 && ids.every(id => state().read.includes(id));
      });
    },
    // 当前等级：Lv.1 + 已读完成章节数（上限 5）
    level() { return Math.min(1 + api.finishedChapters().length, api.CHAPTERS.length); },
    // 全部读完？
    completed() {
      const all = api.CHAPTERS.every(c => postsOf(c.id).length > 0);
      return all && api.finishedChapters().length === api.CHAPTERS.length;
    },
    // 下一篇（按时间线正序）；超过当前可读范围返回 null
    nextOf(id) {
      const P = window.POSTS || {};
      const ids = Object.keys(P).sort((a, b) => P[a].date.localeCompare(P[b].date));
      const i = ids.indexOf(String(id));
      return i >= 0 && i < ids.length - 1 ? ids[i + 1] : null;
    },
    // 是否可读（等级门槛）
    canRead(id) {
      const p = (window.POSTS || {})[id];
      if (!p) return false;
      const c = api.CHAPTERS.find(x => x.id === p.chapter);
      return !!c && api.level() >= c.level;
    },
    // 该帖所在章节门槛（用于展示 "需 Lv.X")
    needLevel(id) {
      const p = (window.POSTS || {})[id];
      if (!p) return null;
      const c = api.CHAPTERS.find(x => x.id === p.chapter);
      return c ? c.level : null;
    },
  };

  window.Story = api;
})();
