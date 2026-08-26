/* STB Studios — no build step, no dependencies. */
(function () {
  'use strict';

  var WA_NUMBER = '27721049596';
  var PLACEHOLDER_KEY = 'REPLACE_WITH_WEB3FORMS_ACCESS_KEY';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── mobile menu ─────────────────────────────────────────────────── */
  function initMenu() {
    var btn = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-menu]');
    var backdrop = document.querySelector('[data-backdrop]');
    if (!btn || !menu) return;

    // hidden is only there to keep the menu out of the a11y tree before JS
    // runs; the open/close state itself is the data-open attribute.
    menu.hidden = false;
    if (backdrop) backdrop.hidden = false;

    function set(open) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.toggleAttribute('data-open', open);
      if (backdrop) backdrop.toggleAttribute('data-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    }
    function isOpen() { return btn.getAttribute('aria-expanded') === 'true'; }

    btn.addEventListener('click', function () { set(!isOpen()); });
    if (backdrop) backdrop.addEventListener('click', function () { set(false); });
    // The menu itself is inset:0 and sits above the backdrop, so a tap in the
    // empty space never reaches the backdrop. Treat it as a tap outside.
    menu.addEventListener('click', function (e) { if (e.target === menu) set(false); });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { set(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) { set(false); btn.focus(); }
    });
    // Crossing the breakpoint with the menu open would otherwise leave the
    // body scroll-locked behind a menu CSS has already hidden.
    var mq = window.matchMedia('(max-width: 900px)');
    var onChange = function () { if (!mq.matches && isOpen()) set(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* ── scroll reveals ──────────────────────────────────────────────────
     Fails open at every step: a stagger sweep on scroll/resize, a polling
     backstop, and an unconditional reveal-everything after 6s. Nothing on
     this page can end up permanently invisible.                        */
  function initReveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-appear]'));
    if (!els.length) return;

    function revealAll() {
      els.forEach(function (el) { el.dataset.revealed = '1'; el.style.opacity = '1'; });
    }
    if (reduced) { revealAll(); return; }

    var map = { soft: 'in-soft', scale: 'in-scale', side: 'in-side', pop: 'in-pop', stat: 'in-stat' };
    els.forEach(function (el) { if (!el.dataset.revealed) el.style.opacity = '0'; });

    function show(el) {
      if (el.dataset.revealed) return;
      el.dataset.revealed = '1';
      var siblings = el.parentElement
        ? Array.prototype.slice.call(el.parentElement.querySelectorAll('[data-appear]'))
        : [];
      var d = Math.max(0, Math.min(siblings.indexOf(el), 6)) * 0.07;
      el.style.opacity = '1';
      el.style.animation = (map[el.dataset.appear] || 'in-soft') +
        ' 1.05s cubic-bezier(0.16,1,0.3,1) ' + d + 's both';
    }

    var ticking = false, timer = null;
    function teardown() {
      window.removeEventListener('scroll', onScroll, true);
      document.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
      if (timer) clearInterval(timer);
    }
    function sweep() {
      ticking = false;
      var h = window.innerHeight || 800;
      var remaining = 0;
      els.forEach(function (el) {
        if (el.dataset.revealed) return;
        var r = el.getBoundingClientRect();
        if (r.top < h * 0.92 && r.bottom > -80) show(el); else remaining++;
      });
      if (!remaining) teardown();
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(sweep); } }

    window.addEventListener('scroll', onScroll, true);
    document.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    timer = setInterval(sweep, 400);
    requestAnimationFrame(function () { requestAnimationFrame(sweep); });
    setTimeout(revealAll, 6000);
  }

  /* ── contact video ───────────────────────────────────────────────────
     Autoplay is refused for anything the engine does not consider muted,
     and the attribute alone does not always set the property.          */
  function initVideo() {
    var v = document.querySelector('.contact-video');
    if (!v) return;
    v.muted = true; v.defaultMuted = true; v.volume = 0;
    if (reduced) { v.autoplay = false; v.removeAttribute('autoplay'); v.pause(); return; }
    function play() { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    play();
    v.addEventListener('canplay', play, { once: true });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && v.paused) play();
    });
  }

  /* ── enquiry form ────────────────────────────────────────────────────
     Posts to Web3Forms. Until a real access key is pasted into the hidden
     field in index.html, the form must NOT pretend to send: it blocks the
     submit and routes the person to WhatsApp instead.                   */
  function initForm() {
    var form = document.querySelector('[data-enquiry]');
    if (!form) return;
    var status = form.querySelector('[data-status]');
    var btn = form.querySelector('.enquiry-send');
    var keyField = form.querySelector('input[name="access_key"]');
    var configured = keyField && keyField.value && keyField.value !== PLACEHOLDER_KEY;

    function say(msg, state) {
      if (!status) return;
      status.textContent = msg;
      status.setAttribute('data-state', state);
    }

    if (!configured) {
      // Turn the form into an honest WhatsApp handoff rather than a lie.
      form.setAttribute('data-unconfigured', '');
      say('Form not connected yet — send a WhatsApp and we’ll pick it up there.', 'err');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!configured) {
        var d = new FormData(form);
        var lines = [
          'Hi STB Studios, I’d like a website.',
          d.get('name') ? 'Name: ' + d.get('name') : '',
          d.get('business') ? 'Business: ' + d.get('business') : '',
          d.get('email') ? 'Email: ' + d.get('email') : '',
          d.get('message') ? 'Needs: ' + d.get('message') : ''
        ].filter(Boolean).join('\n');
        window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines), '_blank', 'noopener');
        return;
      }

      if (form.querySelector('input[name="botcheck"]').checked) return;

      btn.disabled = true;
      var original = btn.textContent;
      btn.textContent = 'Sending…';
      say('', '');

      fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data && data.success) {
            form.reset();
            btn.textContent = 'Thanks — we’ll be in touch';
            say('Enquiry sent. We usually reply the same day.', 'ok');
          } else {
            throw new Error((data && data.message) || 'send failed');
          }
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = original;
          say('That didn’t send. Please WhatsApp +27 72 104 9596 instead.', 'err');
        });
    });
  }

  initMenu();
  initReveal();
  initVideo();
  initForm();
})();
