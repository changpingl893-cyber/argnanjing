// 古时今日 · 阅读记录（无锁定、无门槛、无章节分组）
// 基础：已读标记、全部帖子（按时间排序）、下一篇导航、排序偏好记忆。

(function () {
  const KEY = 'gushijinri.progress.v2';
  const SORT_KEY = 'gushijinri.sort';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  function state() {
    const s = load();
    if (!Array.isArray(s.read)) s.read = [];
    return s;
  }

  const api = {
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
    completed() {
      const P = window.POSTS || {};
      return Object.keys(P).length > 0 && Object.keys(P).every(id => state().read.includes(id));
    },

    /* ------ 全部帖子（按时间正序；desc 反转） ------ */
    allPosts(desc) {
      const P = window.POSTS || {};
      const list = Object.entries(P).sort((a, b) => a[1].date.localeCompare(b[1].date));
      return desc ? list.reverse() : list;
    },

    /* ------ 排序偏好（asc 最早 / desc 最新 / hot 热门） ------ */
    getSort() {
      try { const v = localStorage.getItem(SORT_KEY); return ['hot', 'desc'].includes(v) ? v : 'asc'; } catch (e) { return 'asc'; }
    },
    setSort(mode) { try { localStorage.setItem(SORT_KEY, ['hot', 'desc'].includes(mode) ? mode : 'asc'); } catch (e) {} },

    /* ------ 帖子热度（赞×2 + 回复×10） ------ */
    hotScore(id) {
      const st = (window.STATS || {})[id] || {};
      const replies = st.replies != null ? st.replies : (((window.POSTS || {})[id] || {}).replies || []).length;
      return (st.likes || 0) * 2 + (replies || 0) * 10;
    },
    statsOf(id) {
      const st = (window.STATS || {})[id] || {};
      const fallback = ((window.POSTS || {})[id] || {}).replies || [];
      return {
        likes: st.likes != null ? st.likes : 0,
        replies: st.replies != null ? st.replies : fallback.length
      };
    },

    /* ------ 全部帖子（asc 时间正序 / desc 时间倒序 / hot 热度） ------ */
    allPosts(mode) {
      const P = window.POSTS || {};
      let list = Object.entries(P);
      if (mode === 'desc') {
        list = list.sort((a, b) => b[1].date.localeCompare(a[1].date));
      } else if (mode === 'hot') {
        list = list.sort((a, b) => api.hotScore(b[0]) - api.hotScore(a[0]));
      } else {
        list = list.sort((a, b) => a[1].date.localeCompare(b[1].date));
      }
      return list;
    },

    /* ------ 上一篇 / 下一篇（按当前排序方向） ------ */
    nextOf(id, desc) {
      const list = api.allPosts(desc).map(([pid]) => pid);
      const i = list.indexOf(String(id));
      return i >= 0 && i < list.length - 1 ? list[i + 1] : null;
    },
    prevOf(id, desc) {
      const list = api.allPosts(desc).map(([pid]) => pid);
      const i = list.indexOf(String(id));
      return i > 0 ? list[i - 1] : null;
    },
  };

  window.Story = api;
})();
