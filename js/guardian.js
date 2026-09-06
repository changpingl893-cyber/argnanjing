// 守护者用户主页 → 数据 + 多视图（帖子 / 动态 / 资料）
// 彩蛋：守夜人(1) 的动态里有"2017 最后聚会"旧合影（泛黄，背景是南京博物院）

const GUARDIANS = {
  '1': { name: '守夜人',   uid: '15103256', age: '14.4 年', loc: '江苏', praise: '3969', fans: '3990', sign: '若没人再记得，它们就真的消失了。', about: '协会发起人。守护霁蓝釉瓶十余年。2017-12-31 跨年夜深夜，他发出最后一篇长文，之后网站再无更新。' },
  '2': { name: '青瓷',     uid: '15103257', age: '12.0 年', loc: '浙江', praise: '2103', fans: '1820', sign: '那只碗差点就没了，还好留住了。', about: '守护青花高足碗。2017 年 3 月遭人围攻网暴，主页停留在 2017-03-21 的心碎帖，之后再无动静。' },
  '3': { name: '如意',     uid: '15103258', age: '11.2 年', loc: '北京', praise: '1765', fans: '1502', sign: '有些东西，不该被"请"走。', about: '守护玉如意。疾恶如仇，曾多次警告有人打文物的主意。最后一次发帖是 2017-08-28："我好像知道是谁了……明天再说。"' },
  '4': { name: '长卷',     uid: '15103259', age: '9.8 年',  loc: '安徽', praise: '998',  fans: '760',  sign: '一卷山水，三次被拒。', about: '守护水墨山水长卷。三年打了三次经费申请，都被"重理轻文"驳回。2017 年 9 月底，他在日志里写下"我也该走了"。' },
  '5': { name: '故纸堆',   uid: '15103260', age: '8.4 年',  loc: '河南', praise: '334',  fans: '201',  sign: '新手报道，多多关照。', about: '自称"老物件爱好者"，发言温和得体。2017-07-25 后再未上线。主页数据异常地干净——像刻意清理过。' },
  '6': { name: '过客',     uid: '15103261', age: '3.1 年',  loc: '四川', praise: '56',   fans: '30',   sign: '想加入，可我不知道还能做什么。', about: '2017-02-27 加入，2017-10 告别："有些事我没法说。"给这个走向荒废的论坛，留下一点温暖的痕迹。' },
};

// URL 参数
const params = new URLSearchParams(location.search);
const id = params.get('id') || '1';
const g = GUARDIANS[id] || GUARDIANS['1'];
const auth = (window.AUTHORS && window.AUTHORS[id]) || {};
const posts = (window.POSTS && window.POSTS) || {};
const myPosts = Object.entries(posts).filter(([, p]) => String(p.authorId) === String(id));

function setText(elId, val) { const e = document.getElementById(elId); if (e) e.textContent = val; }

setText('g-avatar', g.name.charAt(0));
setText('g-name', g.name);
setText('g-uid', 'ID ' + g.uid + ' · 吧龄 ' + g.age + ' · ' + g.loc);
setText('g-sign', g.sign);
setText('g-praise', g.praise);
setText('g-fans', g.fans);
if (auth.lv) setText('g-lv', auth.lv);

// 帖子 tab：显示真实发帖数
setText('tab-posts', '帖子 ' + myPosts.length);

// ===== 帖子列表视图 =====
const postListEl = document.getElementById('g-post-list');
if (postListEl) {
  if (myPosts.length) {
    postListEl.innerHTML = myPosts.map(([pid, p]) => `
      <a class="g-post-item" href="post.html?id=${pid}">
        <span class="g-post-badge">${p.badge || ''}</span>
        <span class="g-post-title">${p.title}</span>
        <span class="g-post-date">${p.date} · 回复 ${(p.replies || []).length}</span>
      </a>`).join('');
  } else {
    postListEl.innerHTML = '<p class="g-about-body">该用户没有发过帖子（或帐号已被清理）。</p>';
  }
}

// ===== 动态视图（彩蛋藏在这里） =====
const dynEl = document.getElementById('g-dyn-body');
if (dynEl) {
  if (id === '1') {
    // 彩蛋：旧合影（四人合照素材）—— 2016-12 早期聚会，藏在守夜人的相册里
    dynEl.innerHTML = `
      <div class="g-about">
        <h2 class="g-about-title">相册 · 2016</h2>
        <div class="egg-album">
          <img src="assets/old_photo2.jpg" alt="2016-12 聚会合影（泛黄旧照）" id="egg-photo">
          <div class="egg-album-cap" id="egg-cap">2016.12 · 我们四个人。第一次，也是唯一一次聚齐。</div>
        </div>
        <p class="g-about-body" style="margin-top:10px">相册里只有这一张照片。存档时间：2018-01-03，之后再无动静。</p>
      </div>`;
    const photoEl = document.getElementById('egg-photo');
    if (photoEl && window.v98Popup) {
      photoEl.addEventListener('click', () => {
        v98Popup({
          title: '相册 · 2016.12',
          icon: 'info',
          html: `<img src="assets/old_photo2.jpg" alt="旧合影" style="width:100%;border-radius:4px;margin-bottom:8px">
                 <b>2016.12 · 我们四个人</b><br>
                 站得整整齐齐。那天青瓷说：照片背后那栋楼像是南京博物院，可我们谁也没进去过。
                 后来人渐渐多了，又渐渐少了，再没凑齐过这四个人。
                 <br><br><span style="color:#999;font-size:12px">—— 照片边缘有一行小字：T1221 ……(M) 已离站</span>`,
          buttons: [{ label: '关闭', primary: true }]
        });
      });
    }
  } else {
    dynEl.innerHTML = `<div class="g-about"><h2 class="g-about-title">动态</h2>
      <p class="g-about-body">该用户的动态已被系统清理（2018-01-01）。</p></div>`;
  }
}

// ===== 资料视图 =====
const accountEl = document.getElementById('g-account');
if (accountEl) {
  accountEl.innerHTML =
    `头衔：${auth.title || '会员'}${auth.lv ? ' / ' + auth.lv : ''}${auth.tag ? ' / ' + auth.tag : ''}<br>` +
    `吧龄：${auth.age || g.age}<br>` +
    `IP 属地：${auth.ip || g.loc}<br>` +
    `注册时间：${auth.age ? '约 ' + auth.age + ' 前' : '未知'}<br>` +
    `最后登录：2018-01-01（之后无记录）`;
}
setText('g-about', g.about);

// ===== tab 切换 =====
document.querySelectorAll('.g-tab').forEach(tab => {
  tab.addEventListener('click', (e) => {
    e.preventDefault();
    activate(tab.getAttribute('data-view'));
  });
});

function activate(view) {
  document.querySelectorAll('.g-tab').forEach(t => t.classList.remove('active'));
  const tab = document.querySelector(`.g-tab[data-view="${view}"]`) || document.querySelector('.g-tab[data-view="posts"]');
  if (tab) tab.classList.add('active');
  ['posts', 'dyn', 'info'].forEach(v => {
    const elV = document.getElementById('view-' + v);
    if (elV) elV.style.display = (v === tab.getAttribute('data-view')) ? '' : 'none';
  });
}

// 支持 ?view=dyn 深链（也便于预览彩蛋相册）
activate(params.get('view') || 'posts');

// ===== 私信 → 复古报错（废弃网站） =====
const msgBtn = document.getElementById('g-msg-btn');
if (msgBtn && window.v98Popup) {
  msgBtn.addEventListener('click', () => {
    v98Popup({
      title: '发私信',
      icon: 'error',
      text: '发送失败（0x800706BA）。\n私信服务已于 2017 年底停用。\n\n该账号的最后登录时间：2018-01-01。',
      buttons: [{ label: '确定', primary: true }]
    });
  });
}

// ===== 关注切换 =====
const followBtn = document.getElementById('g-follow-btn');
if (followBtn) {
  followBtn.addEventListener('click', () => {
    const following = followBtn.textContent === '已关注';
    followBtn.textContent = following ? '+ 关注' : '已关注';
    followBtn.classList.toggle('g-btn-following', !following);
  });
}

console.log('[守护者主页] 当前显示：' + g.name);
