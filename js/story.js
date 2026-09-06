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

    /* ------ 排序偏好 ------ */
    getSort() { try { return localStorage.getItem(SORT_KEY) === 'desc' ? 'desc' : 'asc'; } catch (e) { return 'asc'; } },
    setSort(mode) { try { localStorage.setItem(SORT_KEY, mode === 'desc' ? 'desc' : 'asc'); } catch (e) {} },

    /* ------ 下一篇（按当前排序方向） ------ */
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
