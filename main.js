(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hd = document.querySelector('header.site');
  const reel = document.querySelector('.reel');
  const strip = document.getElementById('strip');
  const cards = strip ? [...strip.children] : [];
  const reveals = [...document.querySelectorAll('.row, .chap, .plates figure')];

  // ---- mobile menu: built from the existing nav so no per-page markup is needed ----
  (function mobileNav() {
    const header = document.querySelector('header.site');
    const nav = header && header.querySelector('nav.pill');
    if (!header || !nav || document.querySelector('.menu-toggle')) return;
    const toggle = document.createElement('button');
    toggle.className = 'menu-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Open menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span></span>';
    const menu = document.createElement('nav');
    menu.className = 'mobile-menu';
    menu.setAttribute('aria-label', 'Mobile');
    nav.querySelectorAll('a').forEach(a => {
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.textContent = a.textContent;
      menu.appendChild(link);
    });
    const cta = document.createElement('a');
    cta.className = 'mm-cta';
    cta.href = 'mailto:fady.career@gmail.com';
    cta.textContent = "Let's talk";
    menu.appendChild(cta);
    (header.querySelector('.head-right') || header).appendChild(toggle);
    document.body.appendChild(menu);
    const setOpen = open => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', e => { if (e.target.tagName === 'A') setOpen(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
    addEventListener('resize', () => { if (innerWidth > 860) setOpen(false); });
  })();

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
