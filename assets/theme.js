/* ═════════════════════════════════════════════════════════════════
   Dr Collagen — Shared Luxury JS Runtime
   Self-contained (no dependencies). Loaded on every page via
   layout/theme.liquid. Per-page scripts may still run their own
   logic on top of this baseline.
   ═════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const REDUCED_MOTION =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const TOUCH =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0);

  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  /* ─── REVEAL ENGINE ───────────────────────────────────────────── */
  function initReveal() {
    var dcSelector = '.dc-reveal, .dc-reveal-up, .dc-reveal-scale, .dc-reveal-blur, .dc-reveal-letters';

    if (REDUCED_MOTION) {
      document.querySelectorAll(dcSelector).forEach((el) => el.classList.add('is-visible'));
      // Also flip homepage .reveal elements to visible if reduced motion.
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
      return;
    }

    var io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    document.querySelectorAll(dcSelector).forEach((el) => io.observe(el));

    /*
     * Safety net for the homepage and product snippets, which use a `.reveal`
     * class that starts at opacity:0 and waits for Motion One's `inView` to
     * flip it to `.visible`. If Motion fails to load, its API changes, or its
     * inView never fires for any reason, the affected sections become
     * invisible (appearing "missing"). This native observer guarantees that
     * any `.reveal` element will become `.visible` as soon as it scrolls into
     * view, regardless of what Motion is doing.
     */
    var legacyIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('visible');
          legacyIo.unobserve(entry.target);
        });
      },
      { threshold: 0.10, rootMargin: '0px 0px -6% 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => legacyIo.observe(el));
  }

  /* ─── LETTER SPLITTER ─────────────────────────────────────────── */
  function initLetterSplit() {
    document.querySelectorAll('.dc-reveal-letters').forEach((el) => {
      if (el.dataset.dcSplit === '1') return;
      el.dataset.dcSplit = '1';
      const text = el.textContent;
      el.textContent = '';
      let i = 0;
      for (const ch of text) {
        const span = document.createElement('span');
        if (ch === ' ') {
          span.className = 'dc-letter dc-letter--space';
          span.innerHTML = '&nbsp;';
        } else {
          span.className = 'dc-letter';
          span.textContent = ch;
        }
        span.style.transitionDelay = (i * 0.025).toFixed(3) + 's';
        el.appendChild(span);
        i++;
      }
    });
  }

  /* ─── COUNTER ANIMATION ───────────────────────────────────────── */
  function initCounters() {
    const counters = document.querySelectorAll('.dc-counter');
    if (!counters.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseFloat(el.dataset.target || el.textContent || '0');
          const duration = parseInt(el.dataset.duration || '1500', 10);
          const decimals = parseInt(el.dataset.decimals || '0', 10);
          const start = performance.now();
          function step(now) {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            const value = eased * target;
            el.textContent = decimals
              ? value.toFixed(decimals)
              : Math.round(value).toLocaleString();
            if (t < 1) requestAnimationFrame(step);
            else
              el.textContent = decimals
                ? target.toFixed(decimals)
                : target.toLocaleString();
          }
          requestAnimationFrame(step);
          io.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => io.observe(c));
  }

  /* ─── PARALLAX LAYERS ─────────────────────────────────────────── */
  function initParallax() {
    if (REDUCED_MOTION) return;
    const layers = document.querySelectorAll('.dc-parallax');
    if (!layers.length) return;

    let ticking = false;
    function update() {
      const vh = window.innerHeight;
      layers.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        const speed = parseFloat(el.dataset.speed || '0.18');
        const center = rect.top + rect.height / 2 - vh / 2;
        const y = -center * speed;
        el.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
      });
      ticking = false;
    }
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  /* ─── MAGNETIC CARDS (radial glow follows cursor) ─────────────── */
  function initMagnet() {
    if (REDUCED_MOTION || TOUCH) return;
    document.querySelectorAll('.dc-magnet-glow').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (((e.clientX - r.left) / r.width) * 100).toFixed(1);
        const y = (((e.clientY - r.top) / r.height) * 100).toFixed(1);
        card.style.setProperty('--dc-mx', x + '%');
        card.style.setProperty('--dc-my', y + '%');
        card.style.background =
          'radial-gradient(circle at ' +
          x +
          '% ' +
          y +
          '%, rgba(232,183,46,.07) 0%, transparent 55%), #ffffff';
      });
      card.addEventListener('mouseleave', () => {
        card.style.background = '';
      });
    });
  }

  /* ─── STICKY HEADER BLUR ──────────────────────────────────────── */
  function initStickyNav() {
    const nav = document.querySelector('[data-dc-nav]');
    if (!nav) return;
    function update() {
      nav.classList.toggle('is-scrolled', window.scrollY > 80);
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ─── BACK TO TOP ─────────────────────────────────────────────── */
  function initBackToTop() {
    const btn = document.querySelector('.dc-back-to-top');
    if (!btn) return;
    function update() {
      btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.8);
    }
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
    });
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ─── MOBILE DRAWER ───────────────────────────────────────────── */
  function initDrawer() {
    const btn = document.querySelector('[data-dc-drawer-toggle]');
    const drawer = document.querySelector('[data-dc-drawer]');
    if (!btn || !drawer) return;
    function setOpen(open) {
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      drawer.classList.toggle('is-open', open);
      drawer.setAttribute('aria-hidden', String(!open));
      document.body.classList.toggle('dc-drawer-open', open);
    }
    btn.addEventListener('click', () => {
      setOpen(!drawer.classList.contains('is-open'));
    });
    drawer.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => setOpen(false));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
        setOpen(false);
        btn.focus();
      }
    });
  }

  /* ─── AMBIENT PARTICLES ───────────────────────────────────────── */
  function initParticles() {
    if (REDUCED_MOTION) return;
    const canvas = document.querySelector('.dc-particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    function rand(min, max) { return Math.random() * (max - min) + min; }

    resize();
    window.addEventListener('resize', resize);

    const count = Math.min(45, Math.max(20, Math.floor(window.innerWidth / 36)));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: rand(0, W),
        y: rand(0, H),
        r: rand(0.3, 1.6),
        vx: rand(-0.15, 0.15),
        vy: rand(-0.2, -0.05),
        alpha: rand(0.05, 0.28),
        hue: Math.random() > 0.6 ? 'rgba(232,205,135,' : 'rgba(200,160,96,'
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.hue + p.alpha + ')';
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -4) p.y = H + 4;
        if (p.x < -4) p.x = W + 4;
        if (p.x > W + 4) p.x = -4;
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ─── INIT ALL ────────────────────────────────────────────────── */
  onReady(function () {
    initLetterSplit();
    initReveal();
    initCounters();
    initParallax();
    initMagnet();
    initStickyNav();
    initBackToTop();
    initDrawer();
    initParticles();
    initQuantityStepper();
  });

  /* ─── QUANTITY STEPPER ─────────────────────────────────────────────
     Wires up +/- buttons on .dc-qty controls. Delegated so it works
     on any number of forms (hero + CTA on each product page).
     ───────────────────────────────────────────────────────────────── */
  function initQuantityStepper() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.dc-qty__btn');
      if (!btn) return;
      e.preventDefault();
      var wrap = btn.closest('.dc-qty');
      if (!wrap) return;
      var input = wrap.querySelector('.dc-qty__input');
      if (!input) return;
      var current = parseInt(input.value, 10);
      if (isNaN(current)) current = 1;
      var min = parseInt(input.min, 10) || 1;
      var max = parseInt(input.max, 10) || 99;
      if (btn.dataset.qty === 'plus') {
        current = Math.min(max, current + 1);
      } else {
        current = Math.max(min, current - 1);
      }
      input.value = current;
      // Fire change so any cart listeners get the update.
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  // Expose minimal API for per-page scripts
  window.DC = window.DC || {};
  window.DC.reduceMotion = REDUCED_MOTION;
  window.DC.refreshReveal = initReveal;
})();
