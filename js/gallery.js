// 图库导览：网格渲染 / 分类筛选 / 点击放大 / 双击翻面看档案
(function () {
  const CLUES = window.CLUES || [];
  const CATS = window.CATS || [{ key: 'all', label: '全部' }];
  const grid = document.getElementById('grid');
  const lb = document.getElementById('lb');
  let list = CLUES.slice();     // 当前筛选后的列表
  let cur = 0;                  // lightbox 当前索引

  /* ===== 渲染网格 ===== */
  function render() {
    grid.innerHTML = list.map((c, i) => `
      <div class="card card-cat-${c.cat}" data-i="${i}">
        <div class="card-inner">
          <div class="card-face card-front">
            <img src="${c.file}" alt="${c.name}" loading="lazy">
            <div class="card-meta"><i>${String(i + 1).padStart(2, '0')}</i><b>${c.name}</b></div>
          </div>
          <div class="card-face card-back">
            <div class="cb-name">${c.name}</div>
            <div class="cb-note">${c.note || ''}</div>
            <div class="cb-foot"><span>${c.era || ''}</span><span class="cb-stamp">档案</span></div>
          </div>
        </div>
      </div>`).join('');

    document.getElementById('count').textContent = list.length;

    grid.querySelectorAll('.card').forEach(card => {
      const i = Number(card.dataset.i);
      let timer = null, flipped = false;
      // 单击 → 打开大图；双击 → 在原位翻面
      card.addEventListener('click', () => {
        if (timer) return;
        timer = setTimeout(() => { timer = null; open(i); }, 230);
      });
      card.addEventListener('dblclick', () => {
        clearTimeout(timer); timer = null;
        flipped = !flipped;
        card.classList.toggle('flipped', flipped);
      });
    });
  }

  /* ===== 分类筛选（支持 ?cat=relic 直达） ===== */
  const catBox = document.getElementById('cats');
  const wantCat = new URLSearchParams(location.search).get('cat');
  CATS.forEach((cat, idx) => {
    const b = document.createElement('button');
    b.className = 'g-cat' + ((idx === 0 && !wantCat) || cat.key === wantCat ? ' on' : '');
    b.textContent = cat.label;
    b.addEventListener('click', () => {
      catBox.querySelectorAll('.g-cat').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      list = cat.key === 'all' ? CLUES.slice() : CLUES.filter(c => c.cat === cat.key);
      render();
    });
    catBox.appendChild(b);
  });
  if (wantCat) {
    const f = CLUES.filter(c => c.cat === wantCat);
    if (f.length) list = f;
  }

  /* ===== 放大欣赏 ===== */
  function open(i) {
    cur = i;
    lb.classList.remove('flipped');
    paint();
    lb.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lb.classList.remove('show', 'flipped');
    document.body.style.overflow = '';
  }
  function step(d) {
    cur = (cur + d + list.length) % list.length;
    lb.classList.remove('flipped');
    setTimeout(paint, 120);
  }
  function paint() {
    const c = list[cur];
    if (!c) return;
    document.getElementById('lb-img').src = c.file;
    document.getElementById('lb-img').alt = c.name;
    document.getElementById('lb-name').textContent = c.name;
    document.getElementById('lb-era').textContent = c.era || '—';
    document.getElementById('lb-source').textContent = c.source || '—';
    document.getElementById('lb-state').textContent = c.state || '—';
    document.getElementById('lb-note').textContent = c.note || '';
    document.getElementById('lb-index').textContent =
      String(cur + 1).padStart(2, '0') + ' / ' + String(list.length).padStart(2, '0');
  }

  document.getElementById('lb').addEventListener('click', (e) => {
    if (e.target.id === 'lb' || e.target.classList.contains('lb-stage')) close();
  });
  document.getElementById('lb-close').addEventListener('click', close);
  document.getElementById('lb-prev').addEventListener('click', () => step(-1));
  document.getElementById('lb-next').addEventListener('click', () => step(1));
  // 双击翻面（大图任意位置）
  document.getElementById('lb-stage').addEventListener('dblclick', () => lb.classList.toggle('flipped'));
  // 单击大图也翻面不冲突：只翻「背面 → 正面」由双击处理，避免误触
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('show')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
    if (e.key === ' ') { e.preventDefault(); lb.classList.toggle('flipped'); }
  });

  render();

  /* 直达：#open=3 打开第 3 张；#open=3&flip=1 直接翻到背面 */
  const hash = location.hash.replace('#', '');
  if (hash) {
    const p = new URLSearchParams(hash);
    if (p.get('open') != null) {
      const i = parseInt(p.get('open'), 10) || 0;
      open(Math.min(Math.max(i, 0), list.length - 1));
      if (p.get('flip')) setTimeout(() => lb.classList.add('flipped'), 400);
    }
  } else {
    // 点击封面文物阵列带过来：?item=xxx
    const item = new URLSearchParams(location.search).get('item');
    if (item) {
      const i = list.findIndex(c => c.id === item);
      if (i >= 0) open(i);
    }
  }

  console.log('[图库] 共 ' + CLUES.length + ' 张');
})();
