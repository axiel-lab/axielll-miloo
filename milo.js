/* Milo the cat: follows the cursor, suggests pages, and guides visitors.
   No inline styles or inline scripts, so it works with the strict CSP. */
(function () {
  'use strict';

  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var S = 84;

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

  /* ---------- pages ---------- */
  var navA = document.querySelector('.site-head nav a');
  var root = navA && navA.getAttribute('href').charAt(0) === '/' ? '/' : '';
  var PAGES = {
    home:    { file: 'index.html',   label: 'Home',    icon: '\uD83C\uDFE0', tone: 'sun',   ask: 'Back to the start? \uD83C\uDFE0' },
    about:   { file: 'about.html',   label: 'About',   icon: '\uD83D\uDC4B', tone: 'lilac', ask: 'Wanna meet Ishrak? \uD83D\uDC4B' },
    work:    { file: 'work.html',    label: 'Work',    icon: '\uD83D\uDCBB', tone: 'mint',  ask: 'Want to see our work? \uD83D\uDC40' },
    stack:   { file: 'stack.html',   label: 'Stack',   icon: '\uD83E\uDDF0', tone: 'sky',   ask: 'Curious about our tools? \uD83E\uDDF0' },
    contact: { file: 'contact.html', label: 'Contact', icon: '\uD83D\uDC8C', tone: 'pink',  ask: 'Say hi! Contact us \uD83D\uDC8C' }
  };
  var ORDER = ['home', 'about', 'work', 'stack', 'contact'];
  var m = document.body.className.match(/\bp-(\w+)/);
  var current = m ? m[1] : 'home';
  var PAGE_TONE = { home: 'sun', about: 'lilac', work: 'mint', stack: 'sky', contact: 'pink', missing: 'red' };

  function url(key) { return root + PAGES[key].file; }

  var GREET = {
    home:    { t: 'Welcome! I\u2019m Milo, I live here \uD83D\uDC3E Want to see Ishrak\u2019s work?', go: 'work' },
    about:   { t: 'This is Ishrak\u2019s story! Scroll down and I\u2019ll point things out \u2728', go: 'stack' },
    work:    { t: 'Projects! There\u2019s a blackjack helper you can actually play \uD83C\uDCCF', go: 'contact' },
    stack:   { t: 'Tools and tech! Python is the main one \uD83D\uDC0D', go: 'work' },
    contact: { t: 'Say hi! Email is great for long notes, WhatsApp for quick ones \uD83D\uDC8C', go: 'home' },
    missing: { t: 'Oopsie, this page doesn\u2019t exist \uD83D\uDE48 Let me take you home!', go: 'home' }
  };

  /* ---------- build the cat ---------- */
  var svg = [
    '<svg class="milo-svg" viewBox="0 0 120 120" aria-hidden="true" focusable="false">',
    '<ellipse class="m-shadow" cx="60" cy="113" rx="30" ry="5"/>',
    '<g class="m-tail"><path class="m-tail-out" d="M90 98 C112 98 116 72 104 62"/><path class="m-tail-in" d="M90 98 C112 98 116 72 104 62"/></g>',
    '<g class="m-body">',
    '<ellipse class="m-fur" cx="60" cy="90" rx="30" ry="23"/>',
    '<ellipse class="m-belly" cx="60" cy="96" rx="17" ry="14"/>',
    '<g class="m-pl"><ellipse class="m-fur" cx="45" cy="108" rx="10" ry="6.5"/><path class="m-line" d="M42 108 v3 M48 108 v3"/></g>',
    '<g class="m-pr"><ellipse class="m-fur" cx="75" cy="108" rx="10" ry="6.5"/><path class="m-line" d="M72 108 v3 M78 108 v3"/></g>',
    '<path class="m-collar" d="M39 79 Q60 93 81 79"/><path class="m-collar-in" d="M39 79 Q60 93 81 79"/>',
    '<circle class="m-bell" cx="60" cy="90" r="5.5"/><path class="m-line" d="M57 91 h6"/>',
    '</g>',
    '<g class="m-head-look"><g class="m-head">',
    '<path class="m-fur" d="M25 46 L28 14 L53 31 Z"/><path class="m-inner" d="M31 38 L33 22 L45 31 Z"/>',
    '<path class="m-fur" d="M95 46 L92 14 L67 31 Z"/><path class="m-inner" d="M89 38 L87 22 L75 31 Z"/>',
    '<ellipse class="m-fur" cx="60" cy="52" rx="38" ry="30"/>',
    '<path class="m-stripe" d="M60 24 V33 M51 26 L52 34 M69 26 L68 34"/>',
    '<ellipse class="m-blush" cx="34" cy="62" rx="6.5" ry="4"/><ellipse class="m-blush" cx="86" cy="62" rx="6.5" ry="4"/>',
    '<g class="m-eyes-look">',
    '<g class="m-open"><g class="m-eye-g"><ellipse class="m-eye" cx="44" cy="52" rx="7" ry="8.5"/><circle class="m-hl" cx="46.5" cy="48.5" r="2.7"/><circle class="m-hl" cx="42" cy="55" r="1.2"/></g>',
    '<g class="m-eye-g"><ellipse class="m-eye" cx="76" cy="52" rx="7" ry="8.5"/><circle class="m-hl" cx="78.5" cy="48.5" r="2.7"/><circle class="m-hl" cx="74" cy="55" r="1.2"/></g></g>',
    '<g class="m-happy"><path class="m-line" d="M36 55 Q44 45 52 55"/><path class="m-line" d="M68 55 Q76 45 84 55"/></g>',
    '<g class="m-sleep"><path class="m-line" d="M36 52 Q44 59 52 52"/><path class="m-line" d="M68 52 Q76 59 84 52"/></g>',
    '</g>',
    '<path class="m-nose" d="M56 60 L64 60 L60 65.5 Z"/>',
    '<path class="m-line m-mouth" d="M60 65.5 Q56.5 71 51 68 M60 65.5 Q63.5 71 69 68"/>',
    '<g class="m-mouth-open"><path class="m-tongue" d="M52 68 Q60 82 68 68 Z"/></g>',
    '<path class="m-line" d="M29 62 L12 58 M29 67 L12 69 M91 62 L108 58 M91 67 L108 69"/>',
    '</g></g>',
    '</svg>'
  ].join('');

  var rootEl = document.createElement('div');
  rootEl.className = 'milo';
  rootEl.innerHTML =
    '<div class="milo-bubble" data-tone="sun"><button type="button" class="milo-x" aria-label="Close Milo\u2019s message">\u00D7</button>' +
    '<span class="milo-body"></span><div class="milo-chips"></div></div>' +
    '<button type="button" class="milo-cat" aria-label="Milo the cat. Press to say hi and get help finding pages">' + svg +
    '<span class="milo-zzz" aria-hidden="true">z z z</span></button>' +
    '<div class="milo-fx" aria-hidden="true"></div>' +
    '<div class="sr-only" role="status" aria-live="polite"></div>';
  document.body.appendChild(rootEl);

  var bubble = rootEl.querySelector('.milo-bubble');
  var bodyEl = rootEl.querySelector('.milo-body');
  var chipsEl = rootEl.querySelector('.milo-chips');
  var closeBtn = rootEl.querySelector('.milo-x');
  var catBtn = rootEl.querySelector('.milo-cat');
  var svgEl = rootEl.querySelector('.milo-svg');
  var fxEl = rootEl.querySelector('.milo-fx');
  var srEl = rootEl.querySelector('.sr-only');
  var eyesLook = rootEl.querySelector('.m-eyes-look');
  var headLook = rootEl.querySelector('.m-head-look');

  /* ---------- state ---------- */
  var pos = { x: 0, y: 0 };
  var saved = null;
  try { saved = JSON.parse(ssGet('milo-pos') || 'null'); } catch (e) {}
  if (saved && typeof saved.x === 'number') { pos.x = saved.x; pos.y = saved.y; }
  else { pos.x = window.innerWidth - S / 2 - 18; pos.y = window.innerHeight - S / 2 - 18; }

  var mouse = { x: 0, y: 0, has: false };
  var chasing = false, travel = 0, lastSay = 0, arrivedAt = 0, needSay = false;
  var pinned = false, bubbleOpen = false, sleeping = false, hovering = 0;
  var spot = null, spotCb = null;
  var lastMoveT = 0, lastActivity = performance.now();
  var hideTimer = 0, typeTimer = 0, tilt = 0;
  var suggestIdx = 0, tourSteps = [], tourIdx = -1, spotEl = null;
  var STOP = 66, LEASH = 230;

  /* ---------- helpers ---------- */
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function make(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function clampPos() {
    pos.x = clamp(pos.x, S / 2 + 4, window.innerWidth - S / 2 - 4);
    pos.y = clamp(pos.y, S / 2 + 4, window.innerHeight - S / 2 - 4);
  }
  function place() {
    clampPos();
    rootEl.style.transform = 'translate3d(' + (pos.x - S / 2).toFixed(1) + 'px,' + (pos.y - S / 2).toFixed(1) + 'px,0)';
    svgEl.style.setProperty('--tilt', tilt.toFixed(1) + 'deg');
  }
  function pulse(cls, ms) {
    rootEl.classList.add(cls);
    setTimeout(function () { rootEl.classList.remove(cls); }, ms);
  }
  function jump() { rootEl.classList.remove('jump'); void rootEl.offsetWidth; pulse('jump', 650); }
  function happy(ms) { pulse('happy', ms || 1500); }
  function hearts() {
    fxEl.textContent = '';
    for (var i = 0; i < 3; i++) fxEl.appendChild(make('span', 'milo-heart', '\u2665'));
    setTimeout(function () { fxEl.textContent = ''; }, 1500);
  }
  function wake() {
    lastActivity = performance.now();
    if (sleeping) { sleeping = false; rootEl.classList.remove('sleeping'); jump(); }
  }

  /* ---------- bubble ---------- */
  function positionBubble() {
    if (!bubbleOpen) return;
    var bw = bubble.offsetWidth, bh = bubble.offsetHeight;
    var want = pos.x - bw / 2;
    var left = clamp(want, 8, window.innerWidth - 8 - bw);
    var rootLeft = pos.x - S / 2;
    bubble.style.setProperty('--bx', (left - rootLeft).toFixed(1) + 'px');
    bubble.style.setProperty('--px', clamp(pos.x - left, 22, bw - 22).toFixed(1) + 'px');
    var below = pos.y - S / 2 - bh - 16 < 8;
    rootEl.classList.toggle('below', below);
  }

  function closeBubble(fromUser) {
    clearTimeout(hideTimer); clearInterval(typeTimer);
    bubbleOpen = false; pinned = false;
    bubble.classList.remove('is-open');
    if (fromUser) lastSay = performance.now();
    if (spotEl) { spotEl.classList.remove('milo-spot'); spotEl = null; }
    tourIdx = -1;
  }

  function typeInto(node, text, done) {
    clearInterval(typeTimer);
    var chars = Array.from(text), i = 0;
    var tail = node.querySelector('.milo-go');
    function set(str) {
      node.textContent = str;
      if (tail) node.appendChild(tail);
    }
    if (reduce) { set(text); positionBubble(); if (done) done(); return; }
    set('');
    typeTimer = setInterval(function () {
      i++;
      set(chars.slice(0, i).join(''));
      positionBubble();
      if (i >= chars.length) { clearInterval(typeTimer); if (done) done(); }
    }, 24);
  }

  function addChip(c) {
    var e;
    if (c.href) { e = make('a', 'milo-chip'); e.href = c.href; e.setAttribute('data-nav', '1'); }
    else { e = make('button', 'milo-chip'); e.type = 'button'; }
    e.setAttribute('data-tone', c.tone || 'white');
    if (c.here) { e.classList.add('is-here'); e.setAttribute('aria-current', 'page'); }
    if (c.quiet) e.classList.add('is-quiet');
    e.textContent = (c.icon ? c.icon + ' ' : '') + c.label;
    if (c.fn) e.addEventListener('click', function (ev) { ev.preventDefault(); c.fn(); });
    chipsEl.appendChild(e);
  }

  /* say({text, href, tone, chips, pin, ttl, announce}) */
  function say(o) {
    clearTimeout(hideTimer);
    if (spotEl && !o.keepSpot) { spotEl.classList.remove('milo-spot'); spotEl = null; }
    wake();
    pinned = !!o.pin;
    bubbleOpen = true;
    lastSay = performance.now();

    // body: a link (the suggestion text is clickable) or plain text
    var newBody;
    if (o.href) {
      newBody = make('a', 'milo-body'); newBody.href = o.href; newBody.setAttribute('data-nav', '1');
      newBody.appendChild(make('span', 'milo-go', '\u2192'));
    } else {
      newBody = make('span', 'milo-body');
    }
    bodyEl.replaceWith(newBody); bodyEl = newBody;
    chipsEl.textContent = '';
    bubble.setAttribute('data-tone', o.tone || 'sun');
    bubble.classList.remove('is-open'); void bubble.offsetWidth; bubble.classList.add('is-open');
    positionBubble();

    if (o.announce) { srEl.textContent = ''; setTimeout(function () { srEl.textContent = o.text; }, 50); }

    typeInto(bodyEl, o.text, function () {
      (o.chips || []).forEach(addChip);
      positionBubble();
    });

    if (reduce) { /* chips appear immediately via done callback */ }
    if (o.ttl && !o.pin) armHide(o.ttl);
  }

  function armHide(ms) {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      if (hovering > 0) { armHide(3500); return; }
      closeBubble(true);
    }, ms);
  }

  /* ---------- behaviors ---------- */
  function pageChips(skipCurrent) {
    var out = [];
    ORDER.forEach(function (k) {
      var p = PAGES[k];
      if (k === current) {
        if (!skipCurrent) out.push({ label: p.label + ' (you\u2019re here)', icon: p.icon, tone: p.tone, here: true, fn: function () { say({ text: 'You\u2019re already here, silly! \uD83D\uDE38 Pick another page?', tone: PAGE_TONE[current], chips: pageChips(false), pin: true }); happy(); } });
      } else {
        out.push({ label: p.label, icon: p.icon, tone: p.tone, href: url(k) });
      }
    });
    return out;
  }

  function openMenu() {
    jump(); happy(2200); hearts();
    var chips = pageChips(false);
    if (document.querySelector('[data-milo]')) chips.push({ label: 'Guide me \u2728', tone: 'white', fn: startTour });
    chips.push({ label: 'shh, hide me \uD83D\uDE48', quiet: true, tone: 'white', fn: function () { setOff(true); } });
    say({ text: 'haiiiiii, my name is Milo, how can i help u', tone: 'sun', chips: chips, pin: true, announce: true });
    armPinnedIdle();
  }

  var pinnedIdleT = 0;
  function armPinnedIdle() {
    clearTimeout(pinnedIdleT);
    pinnedIdleT = setTimeout(function () {
      if (pinned && tourIdx < 0) {
        if (hovering > 0) { armPinnedIdle(); return; }
        closeBubble(true);
      }
    }, 45000);
  }

  function suggest() {
    var others = ORDER.filter(function (k) { return k !== current; });
    var n = suggestIdx++;
    if (n % 4 === 3) {
      say({ text: 'Psst\u2026 click me and I\u2019ll guide you around! \u2728', tone: 'sun', ttl: 7000,
            chips: [{ label: 'Open the menu', tone: 'sun', fn: openMenu }] });
      return;
    }
    var key = others[n % others.length];
    say({ text: PAGES[key].ask, href: url(key), tone: PAGES[key].tone, ttl: 8000 });
  }

  function tipFor(el) {
    var chips = [];
    var go = el.getAttribute('data-milo-go');
    if (go) { var p = go.split('|'); chips.push({ label: p[1] || 'Go', href: root + p[0], tone: 'white' }); }
    say({ text: el.getAttribute('data-milo'), tone: PAGE_TONE[current] || 'sun', chips: chips, ttl: 9000 });
  }

  function goTo(href) {
    closeBubble();
    jump(); happy(900);
    if (reduce) { window.location.href = href; return; }
    pinned = true;
    say({ text: 'Let\u2019s goooo! \uD83D\uDC3E', tone: 'sun', pin: true });
    setTimeout(function () { window.location.href = href; }, 650);
  }

  /* ---------- tour ---------- */
  function startTour() {
    tourSteps = [].slice.call(document.querySelectorAll('[data-milo]'));
    if (!tourSteps.length) return;
    closeBubble();
    tourIdx = -1;
    pinned = true;
    walkTo(window.innerWidth - S / 2 - 16, window.innerHeight - S / 2 - 16, nextStep);
  }
  function nextStep() {
    tourIdx++;
    if (tourIdx >= tourSteps.length) { endTour(); return; }
    var el = tourSteps[tourIdx];
    if (spotEl) spotEl.classList.remove('milo-spot');
    spotEl = el; el.classList.add('milo-spot');
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    var last = tourIdx === tourSteps.length - 1;
    var chips = [];
    var go = el.getAttribute('data-milo-go');
    if (go) { var p = go.split('|'); chips.push({ label: p[1] || 'Go', href: root + p[0], tone: 'white' }); }
    chips.push({ label: last ? 'Finish \u2713' : 'Next \u2192', tone: 'sun', fn: nextStep });
    chips.push({ label: 'Stop', tone: 'white', quiet: true, fn: function () { closeBubble(true); } });
    say({ text: el.getAttribute('data-milo'), tone: PAGE_TONE[current] || 'sun', chips: chips, pin: true, keepSpot: true, announce: true });
    if (tourIdx > 0) hearts();
  }
  function endTour() {
    tourIdx = -1;
    if (spotEl) { spotEl.classList.remove('milo-spot'); spotEl = null; }
    happy(2000); hearts();
    say({ text: 'That\u2019s the tour! Where to next? \uD83D\uDC3E', tone: 'sun', chips: pageChips(true), pin: true, announce: true });
    armPinnedIdle();
  }

  function walkTo(x, y, cb) {
    if (reduce) { pos.x = x; pos.y = y; place(); if (cb) cb(); return; }
    spot = { x: x, y: y }; spotCb = cb || null;
  }

  /* ---------- off switch ---------- */
  var toggleBtn = document.querySelector('[data-milo-toggle]');
  function setOff(off) {
    lsSet('milo-off', off ? '1' : '0');
    if (off) { closeBubble(); rootEl.hidden = true; }
    else { rootEl.hidden = false; place(); wake(); jump(); setTimeout(function () { say({ text: 'Yay, I\u2019m back! \uD83D\uDE3A', tone: 'sun', ttl: 4000 }); }, 300); }
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-pressed', off ? 'false' : 'true');
      toggleBtn.textContent = 'Milo the cat: ' + (off ? 'off' : 'on');
    }
  }
  if (toggleBtn) toggleBtn.addEventListener('click', function () { setOff(rootEl.hidden ? false : true); });
  if (lsGet('milo-off') === '1') {
    rootEl.hidden = true;
    if (toggleBtn) { toggleBtn.setAttribute('aria-pressed', 'false'); toggleBtn.textContent = 'Milo the cat: off'; }
  }

  /* ---------- events ---------- */
  function onPointer(e) {
    wake();
    if (e.pointerType === 'touch' && e.type === 'pointermove') return;
    if (rootEl.contains(e.target)) return;
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.has = true;
  }
  document.addEventListener('pointermove', onPointer, { passive: true });
  document.addEventListener('pointerdown', onPointer, { passive: true });
  ['keydown', 'scroll', 'touchstart'].forEach(function (ev) { window.addEventListener(ev, wake, { passive: true }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && bubbleOpen) closeBubble(true);
  });

  [catBtn, bubble].forEach(function (n) {
    n.addEventListener('pointerenter', function () { hovering++; });
    n.addEventListener('pointerleave', function () { hovering = Math.max(0, hovering - 1); });
  });

  catBtn.addEventListener('click', function () {
    wake();
    if (bubbleOpen && pinned) { closeBubble(true); happy(800); return; }
    openMenu();
  });
  closeBtn.addEventListener('click', function () { closeBubble(true); });
  bubble.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-nav]');
    if (!a) return;
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button === 1) return;
    e.preventDefault();
    goTo(a.href);
  });

  window.addEventListener('resize', function () { place(); positionBubble(); });
  window.addEventListener('pagehide', function () { ssSet('milo-pos', JSON.stringify({ x: pos.x, y: pos.y })); });

  /* ---------- animation loop ---------- */
  function stepTo(dx, dy, d, stop, t) {
    var speed = Math.min(7.5, 1.6 + (d - stop) * 0.07);
    speed = Math.min(speed, Math.max(d - stop, 0.5));
    var vx = dx / d * speed, vy = dy / d * speed;
    pos.x += vx; pos.y += vy;
    travel += speed;
    lastMoveT = t;
    tilt += (clamp(vx * 2.2, -11, 11) - tilt) * 0.25;
  }

  function frame(t) {
    requestAnimationFrame(frame);
    if (rootEl.hidden) return;

    var dx, dy, d;
    var moved = false;

    if (spot) {
      dx = spot.x - pos.x; dy = spot.y - pos.y; d = Math.hypot(dx, dy);
      if (d > 3) { stepTo(dx, dy, d, 0, t); moved = true; }
      else { var cb = spotCb; spot = null; spotCb = null; if (cb) cb(); }
    } else if (!pinned && !reduce && mouse.has && hovering === 0) {
      dx = mouse.x - pos.x; dy = mouse.y - pos.y; d = Math.hypot(dx, dy) || 1;
      var leash = bubbleOpen ? LEASH : STOP;
      if (!chasing && d > leash) {
        chasing = true;
        if (bubbleOpen) closeBubble();
        if (sleeping) wake();
      }
      if (chasing) {
        if (d <= STOP) { chasing = false; needSay = true; arrivedAt = t; }
        else { stepTo(dx, dy, d, STOP, t); moved = true; }
      }
    }

    if (!moved) tilt += (0 - tilt) * 0.2;

    // eyes and head look at the cursor
    var lx = 0, ly = 0;
    if (mouse.has && !sleeping) {
      var gx = mouse.x - pos.x, gy = mouse.y - pos.y, gd = Math.hypot(gx, gy) || 1;
      var k = Math.min(1, gd / 120);
      lx = gx / gd * 3.4 * k; ly = gy / gd * 2.6 * k;
    }
    eyesLook.setAttribute('transform', 'translate(' + lx.toFixed(2) + ' ' + ly.toFixed(2) + ')');
    headLook.setAttribute('transform', 'rotate(' + (lx * 1.4).toFixed(2) + ' 60 80)');

    rootEl.classList.toggle('walking', t - lastMoveT < 110);
    if (moved || bubbleOpen) place();
    else if (t - lastMoveT < 400) place();

    // arrived: suggest a page
    if (needSay && !chasing && !spot && t - arrivedAt > 650) {
      needSay = false;
      if (!bubbleOpen && !pinned && travel > 140 && t - lastSay > 3500) { suggest(); travel = 0; }
    }

    // nap when nothing happens
    if (!sleeping && !bubbleOpen && !pinned && !chasing && t - lastActivity > 45000) {
      sleeping = true; rootEl.classList.add('sleeping');
    }
  }

  /* ---------- section tips while scrolling ---------- */
  var seen = new WeakSet();
  if ('IntersectionObserver' in window) {
    var timers = new WeakMap();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var el = en.target;
        if (en.isIntersecting) {
          var id = setTimeout(function () {
            if (seen.has(el) || rootEl.hidden || bubbleOpen || pinned || chasing || spot) return;
            if (performance.now() - lastSay < 7000) return;
            seen.add(el); tipFor(el);
          }, 1200);
          timers.set(el, id);
        } else {
          clearTimeout(timers.get(el));
        }
      });
    }, { threshold: 0.55 });
    [].slice.call(document.querySelectorAll('[data-milo]')).forEach(function (el) { io.observe(el); });
  }

  /* ---------- start ---------- */
  place();
  requestAnimationFrame(frame);
  setTimeout(function () {
    if (rootEl.hidden) return;
    jump();
    var g = GREET[current] || GREET.home;
    say({ text: g.t, tone: PAGE_TONE[current] || 'sun', ttl: 11000,
          chips: [{ label: PAGES[g.go].label + ' \u2192', icon: PAGES[g.go].icon, tone: PAGES[g.go].tone, href: url(g.go) }] });
  }, 1100);
})();
