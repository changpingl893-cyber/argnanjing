// 推理黑板：渲染线索卡热区 + 红线 + 档案弹窗
(function () {
  const A = window.ARCHIVE || { cards: [] };
  const cards = A.cards || [];
  const board = document.getElementById('board');
  const pins = document.getElementById('pins');
  const svg = document.getElementById('lines');
  const mask = document.getElementById('sheet-mask');

  const TYPE_NAME = { photo: '照片', paper: '字条', press: '剪报', doc: '文件', clue: '线索' };
  const STAMP_TEXT = { photo: '馆藏影记', paper: '手书 · 存档', press: '剪报 · 存档', doc: '已核 · 存档', clue: '待考 · 存疑' };
  const pinEls = {};

  /* ===== 渲染线索卡 ===== */
  cards.forEach(c => {
    const el = document.createElement('div');
    el.className = 'pin pin-' + (c.type || 'photo');
    el.style.left = c.x + '%';
    el.style.top = c.y + '%';
    el.dataset.id = c.id;
    el.innerHTML = `
      <div class="pin-inner">
        <div class="pin-pin"></div>
        ${c.image ? `<img src="${c.image}" alt="${c.label}">` : ''}
        <div class="pin-label">${c.label}</div>
        <div class="pin-sum">${c.summary || ''}</div>
      </div>`;
    el.addEventListener('click', () => openSheet(c.id));
    pins.appendChild(el);
    pinEls[c.id] = el;
  });
  document.getElementById('card-count').textContent = cards.length;

  /* ===== 红线 ===== */
  let linesOn = true;
  function drawLines() {
    svg.innerHTML = '';
    if (!linesOn || window.innerWidth <= 700) return;
    const rect = board.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
    svg.setAttribute('width', rect.width);
    svg.setAttribute('height', rect.height);

    const drawn = new Set();
    cards.forEach(c => {
      (c.related || []).forEach(rid => {
        const key = [c.id, rid].sort().join('|');
        if (drawn.has(key)) return;
        drawn.add(key);
        const a = pinEls[c.id], b = pinEls[rid];
        if (!a || !b) return;
        const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
        const x1 = ra.left - rect.left + ra.width / 2;
        const y1 = ra.top - rect.top + ra.height / 2;
        const x2 = rb.left - rect.left + rb.width / 2;
        const y2 = rb.top - rect.top + rb.height / 2;
        // 微微下垂的曲线，像真绷着的红线
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + Math.abs(x2 - x1) * 0.06 + 12;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`);
        path.setAttribute('stroke', 'rgba(184,53,47,.55)');
        path.setAttribute('stroke-width', '1.6');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        svg.appendChild(path);
        // 端点小点
        [[x1, y1], [x2, y2]].forEach(([x, y]) => {
          const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          dot.setAttribute('cx', x); dot.setAttribute('cy', y); dot.setAttribute('r', '2.4');
          dot.setAttribute('fill', 'rgba(184,53,47,.7)');
          svg.appendChild(dot);
        });
      });
    });
  }

  const relToggle = document.getElementById('rel-toggle');
  if (relToggle) {
    relToggle.addEventListener('click', (e) => {
      e.preventDefault();
      linesOn = !linesOn;
      drawLines();
    });
  }

  /* ===== 档案弹窗 ===== */
  function openSheet(id) {
    const c = cards.find(x => x.id === id);
    if (!c) return;
    document.getElementById('s-type').textContent = TYPE_NAME[c.type] || '档案';
    document.getElementById('s-title').textContent = c.label;
    const stamp = document.getElementById('s-stamp');
    if (stamp) stamp.textContent = STAMP_TEXT[c.type] || '古时今日 · 存档';
    const img = document.getElementById('s-img');
    if (c.image) { img.src = c.image; img.style.display = 'block'; }
    else img.style.display = 'none';
    document.getElementById('s-body').innerHTML = (c.detail || []).map(p => `<p>${p}</p>`).join('');

    const rel = document.getElementById('s-rel');
    const rels = (c.related || []).map(rid => cards.find(x => x.id === rid)).filter(Boolean);
    rel.innerHTML = rels.length
      ? rels.map(r => `<span class="rel-chip" data-goto="${r.id}">${r.label} · ${r.summary || ''}</span>`).join('')
      : '<span style="color:#8a8577;font-size:12px">（暂无关联）</span>';
    rel.querySelectorAll('.rel-chip').forEach(chip => {
      chip.addEventListener('click', () => openSheet(chip.dataset.goto));
    });

    mask.classList.add('show');
    document.getElementById('sheet').scrollTop = 0;
  }

  document.getElementById('s-close').addEventListener('click', () => mask.classList.remove('show'));
  mask.addEventListener('click', (e) => { if (e.target === mask) mask.classList.remove('show'); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') mask.classList.remove('show'); });

  window.addEventListener('resize', () => { clearTimeout(window.__rt); window.__rt = setTimeout(drawLines, 160); });
  setTimeout(drawLines, 120);
  window.addEventListener('load', drawLines);
  console.log('[档案] 线索卡 ' + cards.length + ' 张');
})();
