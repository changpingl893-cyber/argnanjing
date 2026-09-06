// 公众号版 · 最小工具集（文章列表顺序、上一篇/下一篇）
window.Story = (function () {
  const api = {
    // 全部文章（时间倒序，微信"历史消息"顺序；置顶目录文由页面单独处理）
    allArticles() {
      const P = window.POSTS || {};
      return Object.entries(P).sort((a, b) => b[1].date.localeCompare(a[1].date));
    },
    nextOf(id) {
      const list = api.allArticles().map(([pid]) => pid);
      const i = list.indexOf(String(id));
      return i >= 0 && i < list.length - 1 ? list[i + 1] : null;
    },
    prevOf(id) {
      const list = api.allArticles().map(([pid]) => pid);
      const i = list.indexOf(String(id));
      return i > 0 ? list[i - 1] : null;
    },
    fmtReads(n) {
      if (n >= 100000) return '10万+';
      if (n >= 10000) return Math.round(n / 1000) / 10 + '万';
      return String(n);
    },
  };
  return api;
})();
