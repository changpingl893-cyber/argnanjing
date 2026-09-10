// 线索板：背景卡层层叠压（无说明）＋ 主线索卡（点开看大图 / 双击翻面看档案）＋ 红线
(function () {
  const A = window.ARCHIVE || { cards: [] };
  const all = A.cards || [];
  const mains = all.filter(c => c.kind === 'main');
  const bgs = all.filter(c => c.kind === 'bg');

  const board = document.getElementById('board');
  const pinBox = document.getElementById('pins');
  const svg = document.getElementById('lines');
  const lb = document.getElementById('lb');
  let cur = 0;

  /* ===== 背景卡：只当垫底的照片，不写字、不可点 ===== */
  bgs.forEach(c => {
    const el = document.createElement('div');
    el.className = 'bgcard';
    el.style.left = c.x + '%';
    el.style.top = c.y + '%';
    el.style.width = (c.w || 130) + 'px';
    el.style.transform = `translate(-50%, -50%) rotate(${c.rot || 0}deg)`;
    el.style.zIndex = c.z || 1;
    el.innerHTML = `<img src="${c.file}" alt="" loading="lazy">`;
    pinBox.appendChild(el);
  });

  /* ===== 主线索卡：可点、可翻面 ===== */
  const pinEls = {};
  mains.forEach((c, i) => {
    const el = document.createElement('div');
    el.className = 'pin pin-main';
    el.style.left = c.x + '%';
    el.style.top = c.y + '%';
    el.style.width = (c.w || 170) + 'px';
    el.style.zIndex = c.z || 10;
    el.dataset.id = c.id;

    el.innerHTML = `
      <div class="pin-inner" style="transform: rotate(${c.rot || 0}deg)">
        <div class="pin-pin"></div>
        <span class="pin-no">${String(i + 1).padStart(2, '0')}</span>
        <img src="${c.file}" alt="${c.name}">
        <div class="pin-label">${c.name}</div>
        <div class="pin-sum">${c.era || ''}</div>
      </div>`;

    let timer = null;
    el.addEventListener('click', () => {
      if (timer) return;
      timer = setTimeout(() => { timer = null; open(c.id); }, 220);
    });
    el.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      clearTimeout(timer); timer = null;
      open(c.id, true);
    });
    pinBox.appendChild(el);
    pinEls[c.id] = el;
  });
  document.getElementById('card-count').textContent = mains.length;

  /* ===== 红线（只连主线索卡） ===== */
  let linesOn = true;
  function drawLines() {
    svg.innerHTML = '';
    if (!linesOn || window.innerWidth <= 700) return;
    const rect = board.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
    svg.setAttribute('width', rect.width);
    svg.setAttribute('height', rect.height);
    const drawn = new Set();
    mains.forEach(c => {
      (c.related || []).forEach(rid => {
        const key = [c.id, rid].sort().join('|');
        if (drawn.has(key)) return;
        drawn.add(key);
        const a = pinEls[c.id], b = pinEls[rid];
        if (!a || !b) return;
        const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
        const x1 = ra.left - rect.left + ra.width / 2, y1 = ra.top - rect.top + ra.height / 2;
        const x2 = rb.left - rect.left + rb.width / 2, y2 = rb.top - rect.top + rb.height / 2;
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + Math.abs(x2 - x1) * 0.06 + 12;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`);
        path.setAttribute('stroke', 'rgba(255, 40, 60, .5)');
        path.setAttribute('stroke-width', '1.5');
        path.setAttribute('fill', 'none');
        svg.appendChild(path);
        [[x1, y1], [x2, y2]].forEach(([x, y]) => {
          const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          dot.setAttribute('cx', x); dot.setAttribute('cy', y); dot.setAttribute('r', '2.4');
          dot.setAttribute('fill', 'rgba(255, 40, 60, .65)');
          svg.appendChild(dot);
        });
      });
    });
  }
  const relToggle = document.getElementById('rel-toggle');
  if (relToggle) relToggle.addEventListener('click', (e) => { e.preventDefault(); linesOn = !linesOn; drawLines(); });

  /* ===== 看大图 + 双击翻面 ===== */
  function open(id, flip) {
    const i = mains.findIndex(c => c.id === id);
    cur = i < 0 ? 0 : i;
    paint();
    lb.classList.toggle('flipped', !!flip);
    lb.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function close() { lb.classList.remove('show', 'flipped'); document.body.style.overflow = ''; }
  function step(d) { cur = (cur + d + mains.length) % mains.length; lb.classList.remove('flipped'); setTimeout(paint, 120); }
  function paint() {
    const c = mains[cur];
    if (!c) return;
    document.getElementById('lb-img').src = c.file;
    document.getElementById('lb-img').alt = c.name;
    document.getElementById('lb-name').textContent = c.name;
    document.getElementById('lb-era').textContent = c.era || '—';
    document.getElementById('lb-source').textContent = c.source || '—';
    document.getElementById('lb-state').textContent = c.state || '—';
    document.getElementById('lb-note').textContent = c.note || '';
    document.getElementById('lb-index').textContent =
      String(cur + 1).padStart(2, '0') + ' / ' + String(mains.length).padStart(2, '0');
  }

  document.getElementById('lb-close').addEventListener('click', close);
  document.getElementById('lb-prev').addEventListener('click', () => step(-1));
  document.getElementById('lb-next').addEventListener('click', () => step(1));
  document.getElementById('lb-stage').addEventListener('dblclick', () => lb.classList.toggle('flipped'));
  lb.addEventListener('click', (e) => { if (e.target.id === 'lb' || e.target.classList.contains('lb-stage')) close(); });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('show')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
    if (e.key === ' ') { e.preventDefault(); lb.classList.toggle('flipped'); }
  });

  window.addEventListener('resize', () => { clearTimeout(window.__rt); window.__rt = setTimeout(drawLines, 160); });
  setTimeout(drawLines, 150);
  window.addEventListener('load', drawLines);

  /* 直达：#open=r06 打开某张；#open=r06&flip=1 直接翻到背面 */
  const hash = location.hash.replace('#', '');
  if (hash) {
    const p = new URLSearchParams(hash);
    const oid = p.get('open');
    if (oid) open(oid, !!p.get('flip'));
  }

  console.log('[线索板] 主卡 ' + mains.length + ' · 背景卡 ' + bgs.length);
})();
