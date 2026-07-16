(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hd = document.querySelector('header.site');
  const reel = document.querySelector('.reel');
  const strip = document.getElementById('strip');
  const cards = strip ? [...strip.children] : [];
  const reveals = [...document.querySelectorAll('.row, .chap, .plates figure')];

  if (reduce) {
    reveals.forEach(r => r.classList.add('vis'));
    return;
  }

  // One update routine; driven by rAF polling AND scroll/resize events so it
  // works even in environments where one of the two is throttled or absent.
  let lastY = -1, lastW = -1;
  function update(force) {
    if (!force && scrollY === lastY && innerWidth === lastW) return;
    lastY = scrollY; lastW = innerWidth;
    if (hd) hd.classList.toggle('scrolled', scrollY > 40);

    if (reel && strip) {
      const r = reel.getBoundingClientRect();
      const span = r.height - innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / span));
      const total = strip.scrollWidth - innerWidth * .92;
      strip.style.transform = `translateX(${innerWidth * .04 - p * total}px)`;
      for (const c of cards) {
        const cr = c.getBoundingClientRect();
        const n = (cr.left + cr.width / 2 - innerWidth / 2) / innerWidth;
        c.style.transform = `translateY(${(-n * n * 130).toFixed(1)}px) rotate(${(n * 7).toFixed(2)}deg)`;
      }
    }
    for (const el of reveals) {
      if (!el.classList.contains('vis') && el.getBoundingClientRect().top < innerHeight * .82) {
        el.classList.add('vis');
      }
    }
  }
  addEventListener('scroll', () => update(), { passive: true });
  addEventListener('resize', () => update(true));
  addEventListener('load', () => update(true));
  (function loop() { update(); requestAnimationFrame(loop); })();
  update(true);
})();
