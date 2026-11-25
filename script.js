/* ==========================================================
   Sanjay P S | Portfolio interactions
   Theme, loader, particles, navigation, reveal, counters,
   typing, tilt, magnetic buttons, project details, contact.
   ========================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Safe storage helpers ---------- */
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  /* ---------- Toast ---------- */
  var toast = $('#toast'), toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }

  /* ---------- Theme toggle (persisted) ---------- */
  var themeBtn = $('#themeToggle');
  function syncThemeButton() {
    var light = root.getAttribute('data-theme') === 'light';
    themeBtn.setAttribute('aria-pressed', String(light));
    themeBtn.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
  }
  themeBtn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    store('theme', next);
    syncThemeButton();
    readParticleColors();
  });
  syncThemeButton();

  /* ---------- Loader ---------- */
  document.body.classList.add('is-loading');
  var loaded = false;
  function finishLoading() {
    if (loaded) return;
    loaded = true;
    $('#loader').classList.add('done');
    document.body.classList.remove('is-loading');
    root.classList.add('ready');
    startTyping();
  }
  var minWait = new Promise(function (r) { setTimeout(r, reduceMotion ? 100 : 1500); });
  var pageReady = new Promise(function (r) {
    if (document.readyState === 'complete') r(); else window.addEventListener('load', r);
  });
  Promise.all([minWait, pageReady]).then(finishLoading);
  setTimeout(finishLoading, 4000); // safety net if fonts are slow

  /* ---------- Typing effect for hero role ---------- */
  function startTyping() {
    var el = $('#typed');
    var words = ['Java Full Stack Developer', 'Backend and Full Stack Builder', 'Open-source Contributor', 'Hackathon Participant'];
    if (reduceMotion) { el.textContent = words[0]; return; }
    var w = 0, c = words[0].length, deleting = true;
    el.textContent = words[0];
    function tick() {
      var word = words[w], delay = deleting ? 38 : 85;
      if (!deleting && c === word.length) { deleting = true; delay = 2200; }
      else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; delay = 350; }
      else { c += deleting ? -1 : 1; el.textContent = word.slice(0, c); }
      setTimeout(tick, delay);
    }
    setTimeout(tick, 2600); // keep the full role visible before cycling
  }

  /* ---------- Header: scroll state and progress bar ---------- */
  var header = $('#header'), progress = $('#progress');
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    progress.style.transform = 'scaleX(' + (max > 0 ? h.scrollTop / max : 0) + ')';
    header.classList.toggle('scrolled', h.scrollTop > 20);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var menuBtn = $('#menuBtn'), nav = $('#nav');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  $$('.nav-link').forEach(function (l) { l.addEventListener('click', function () { setMenu(false); }); });
  window.addEventListener('resize', function () { if (window.innerWidth > 960) setMenu(false); movePill(); });

  /* ---------- Active section indicator + sliding pill ---------- */
  var links = $$('.nav-link'), pill = $('#navPill'), current = null;
  function movePill() {
    var active = $('.nav-link.active');
    if (!active || window.innerWidth <= 960) { pill.style.opacity = 0; return; }
    pill.style.width = active.offsetWidth + 'px';
    pill.style.transform = 'translateX(' + active.offsetLeft + 'px)';
    pill.style.opacity = 1;
  }
  function setActive(id) {
    if (id === current) return;
    current = id;
    links.forEach(function (l) {
      var on = l.getAttribute('href') === '#' + id;
      l.classList.toggle('active', on);
      if (on) l.setAttribute('aria-current', 'page'); else l.removeAttribute('aria-current');
    });
    movePill();
  }
  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(function (s) { sectionObserver.observe(s); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(movePill);

  /* ---------- Scroll reveal ---------- */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      revealObserver.unobserve(e.target);
      $$('[data-count]', e.target).forEach(countUp);
      $$('.ring', e.target).forEach(fillRing);
    });
  }, { threshold: 0.15 });
  $$('.reveal').forEach(function (el) { revealObserver.observe(el); });

  /* ---------- Animated counters ---------- */
  function countUp(el) {
    var target = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || '0', 10);
    if (reduceMotion) { el.textContent = target.toFixed(dec); return; }
    var start = performance.now(), dur = 1600;
    (function step(now) {
      var p = Math.min((now - start) / dur, 1), eased = 1 - Math.pow(1 - p, 4);
      el.textContent = (target * eased).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  /* ---------- Skill rings ---------- */
  function fillRing(ring) {
    var n = parseFloat(ring.dataset.n), of = parseFloat(ring.dataset.of);
    ring.querySelector('.r-fg').style.strokeDashoffset = 113 * (1 - n / of);
  }

  /* ---------- Project details (accordion) ---------- */
  $$('.more').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      btn.firstChild.textContent = open ? 'Show details ' : 'Hide details ';
      panel.classList.toggle('open', !open);
    });
  });

  /* ---------- Tilt cards (pointer devices only) ---------- */
  var heroCard = $('.hero-card');
  heroCard.addEventListener('animationend', function () { heroCard.classList.add('settled'); });
  if (finePointer && !reduceMotion) {
    $$('[data-tilt]').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transition = 'transform .15s ease-out, border-color .4s, box-shadow .4s';
        card.style.transform = 'perspective(900px) rotateX(' + (-y * 6) + 'deg) rotateY(' + (x * 6) + 'deg) translateY(-4px)';
      });
      card.addEventListener('pointerleave', function () {
        card.style.transition = 'transform .7s cubic-bezier(.22,1,.36,1), border-color .4s, box-shadow .4s';
        card.style.transform = '';
        setTimeout(function () { card.style.transition = ''; }, 700);
      });
    });

    /* Magnetic buttons */
    $$('[data-magnetic]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.22) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- Copy to clipboard ---------- */
  $$('.copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.dataset.copy;
      function ok() { showToast('Copied: ' + text); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(ok, fallback);
      } else fallback();
      function fallback() {
        var t = document.createElement('textarea');
        t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
        document.body.appendChild(t); t.select();
        try { document.execCommand('copy'); ok(); } catch (e) { showToast('Copy failed. Select the text manually.'); }
        document.body.removeChild(t);
      }
    });
  });

  /* ---------- Contact form (opens the visitor's email app) ---------- */
  var form = $('#contactForm'), err = $('#formError');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.name.value.trim(), email = form.email.value.trim(), msg = form.message.value.trim();
    if (!name || !email || !msg) { err.textContent = 'Please fill in your name, email and message.'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = 'Enter a valid email address, like name@example.com.'; return; }
    err.textContent = '';
    var subject = encodeURIComponent('Portfolio message from ' + name);
    var body = encodeURIComponent(msg + '\n\nFrom: ' + name + ' (' + email + ')');
    window.location.href = 'mailto:sanjayps2407@gmail.com?subject=' + subject + '&body=' + body;
    showToast('Opening your email app');
  });

  /* ---------- Footer year ---------- */
  $('#year').textContent = new Date().getFullYear();

  /* ---------- Particle network background ---------- */
  var canvas = $('#bg'), ctx = canvas.getContext('2d');
  var particles = [], W = 0, H = 0, dpr = 1, mouse = { x: -999, y: -999 };
  var pc = { dot: '124,92,255', line: '34,211,238' };
  function readParticleColors() {
    pc = root.getAttribute('data-theme') === 'light'
      ? { dot: '91,61,245', line: '8,145,178' }
      : { dot: '150,130,255', line: '34,211,238' };
  }
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var count = Math.min(Math.floor((W * H) / 16000), 90);
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 1.6 + .6 });
    }
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      if (!reduceMotion) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
      ctx.fillStyle = 'rgba(' + pc.dot + ',.7)'; ctx.fill();
      for (var j = i + 1; j < particles.length; j++) {
        var q = particles[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
        if (d < 14400) {
          ctx.strokeStyle = 'rgba(' + pc.line + ',' + (0.16 * (1 - d / 14400)) + ')';
          ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      var mx = p.x - mouse.x, my = p.y - mouse.y, md = mx * mx + my * my;
      if (md < 19600) {
        ctx.strokeStyle = 'rgba(' + pc.dot + ',' + (0.35 * (1 - md / 19600)) + ')';
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
    if (!reduceMotion && !document.hidden) requestAnimationFrame(draw);
  }
  window.addEventListener('pointermove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  window.addEventListener('pointerleave', function () { mouse.x = mouse.y = -999; });
  var resizeTimer;
  window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(function () { resize(); if (reduceMotion) draw(); }, 150); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden && !reduceMotion) requestAnimationFrame(draw); });
  readParticleColors(); resize(); draw();
})();
