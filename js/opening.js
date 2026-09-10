// 开场页：静默 → 序章逐段浮现 → 老旧弹窗确认 → 进入档案 / 离开
(function () {
  const SILENCE_MS = 2600;   // 黑场静默时长

  const silence = document.getElementById('act-silence');
  const prologue = document.getElementById('prologue') || document.getElementById('act-prologue');
  const leave = document.getElementById('act-leave');
  const zone = document.getElementById('dialog-zone');

  const lines = () => Array.from(document.querySelectorAll('#prologue .line, #act-prologue .line'));

  function showPrologue() {
    silence.style.opacity = '0';
    setTimeout(() => {
      silence.style.display = 'none';
      prologue.style.display = 'block';
      window.scrollTo(0, 0);
      const ls = lines();
      let last = 400;
      ls.forEach((l, i) => {
        // 优先用元素自带的 data-delay（毫秒）；否则按顺序 1400ms 递进
        const d = l.dataset.delay ? parseInt(l.dataset.delay, 10) : 400 + i * 1400;
        last = Math.max(last, d);
        setTimeout(() => l.classList.add('show'), d);
      });
      setTimeout(askEnter, last + 900);
    }, 1200);
  }

  /* 老旧弹窗：是否进入（作为文档流元素，接在序章文字下方出现） */
  function askEnter() {
    if (!window.v98Popup) return;
    const dlg = v98Popup({
      title: '进入图片档案',
      icon: 'warn',
      html: '共 61 张，其中 7 张是文物。<br><br>' +
            '<span style="color:#8b93a7;font-size:12px">点开看大图，双击翻面看背面的字。<br>' +
            '照片与文字都是原样收着的。</span>',
      dismissable: false,
      buttons: []
    });
    // 把浮层改成文档流内的一块，落在序章下面
    dlg.overlay.style.position = 'static';
    dlg.overlay.style.inset = 'auto';
    dlg.overlay.style.background = 'transparent';
    dlg.overlay.style.display = 'block';
    dlg.root.style.position = 'static';
    dlg.root.style.left = 'auto';
    dlg.root.style.top = 'auto';
    dlg.root.style.transform = 'none';
    dlg.root.style.margin = '0';
    zone.innerHTML = '';
    zone.appendChild(dlg.overlay);
    zone.classList.add('show');

    const yes = document.createElement('button');
    yes.className = 'v98-btn pressed';
    yes.textContent = '进去';
    yes.addEventListener('click', () => {
      dlg.close();
      document.body.style.transition = 'opacity .9s ease';
      document.body.style.opacity = '0';
      setTimeout(() => { location.href = 'gallery.html'; }, 900);
    });

    const no = document.createElement('button');
    no.className = 'v98-btn';
    no.textContent = '先不看';
    no.addEventListener('click', () => {
      dlg.close();
      document.body.style.transition = 'opacity 1.2s ease';
      document.body.style.opacity = '0';
      setTimeout(() => {
        prologue.style.display = 'none';
        leave.classList.add('show');
        document.body.style.opacity = '1';
        document.body.style.background = '#050507';
        window.scrollTo(0, 0);
      }, 1200);
    });

    dlg.addBtn(no);
    dlg.addBtn(yes);
    yes.focus();
  }

  /* 重新打开 */
  const again = document.getElementById('again');
  if (again) {
    again.addEventListener('click', (e) => {
      e.preventDefault();
      leave.classList.remove('show');
      leave.style.display = 'none';
      prologue.style.display = 'block';
      window.scrollTo(0, 0);
      const ls = lines();
      ls.forEach(l => l.classList.add('show'));
      askEnter();
    });
  }

  setTimeout(showPrologue, SILENCE_MS);
  console.log('[档案] 开场加载完成');
})();
