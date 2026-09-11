// 开场页：静默 → 序章逐行浮现 →（等 5 秒）→ 突然全黑 → 猛然弹出 XP 确认框
// 点【否】退出，点【是】进入线索板
(function () {
  const SILENCE_MS = 2600;   // 黑场静默时长
  const HOLD_MS = 5000;      // 文字显示完之后的停顿

  const silence = document.getElementById('act-silence');
  const prologue = document.getElementById('prologue') || document.getElementById('act-prologue');
  const leave = document.getElementById('act-leave');

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
        const d = l.dataset.delay ? parseInt(l.dataset.delay, 10) : 400 + i * 1400;
        last = Math.max(last, d);
        setTimeout(() => l.classList.add('show'), d);
      });
      setTimeout(blackoutAndAsk, last + HOLD_MS);
    }, 1200);
  }

  /* 突然全部变黑 → 猛然弹出 XP 框 */
  function blackoutAndAsk() {
    document.body.classList.add('blackout');
    setTimeout(showXp, 320);
  }

  function showXp() {
    if (!window.xpDialog) return;
    const dlg = xpDialog({
      title: 'Windows XP',
      text: '是否进入本档案？',
      small: '本档案的最后一次更新停留在 2018 年 1 月。进入后所看到的一切，均由当时的记录者留下。'
    });
    dlg.yesNo(
      () => { location.href = 'archive.html'; },
      () => { showLeave(); }
    );
  }

  /* 点否 → 留在黑屏里的一句告别 */
  function showLeave() {
    prologue.style.display = 'none';
    leave.classList.add('show');
    window.scrollTo(0, 0);
  }

  /* 重新打开 */
  const again = document.getElementById('again');
  if (again) {
    again.addEventListener('click', (e) => {
      e.preventDefault();
      leave.classList.remove('show');
      document.body.classList.remove('blackout');
      prologue.style.display = 'block';
      window.scrollTo(0, 0);
      lines().forEach(l => l.classList.add('show'));
      setTimeout(blackoutAndAsk, 900);
    });
  }

  setTimeout(showPrologue, SILENCE_MS);
  console.log('[档案] 开场加载完成');
})();
