(function () {
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  // Typing animation in the home hero
  var typed = document.querySelector('[data-typed]');
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typed && !calm) {
    var words = typed.getAttribute('data-typed').split('|');
    var wi = 0, ci = 0, erasing = false;
    typed.textContent = '';
    (function tick() {
      var w = words[wi];
      if (!erasing) {
        ci++;
        typed.textContent = w.slice(0, ci);
        if (ci >= w.length) { erasing = true; return setTimeout(tick, wi === 0 ? 3600 : 1800); }
        return setTimeout(tick, 80);
      }
      ci--;
      typed.textContent = w.slice(0, ci);
      if (ci <= 0) { erasing = false; wi = (wi + 1) % words.length; return setTimeout(tick, 350); }
      setTimeout(tick, 38);
    })();
  }

  var el = document.querySelector('[data-time]');
  if (!el) return;

  var fmt;
  try {
    fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Dhaka', hour: 'numeric', minute: '2-digit' });
  } catch (e) { return; }

  function gap(minutes) {
    var n = Math.abs(minutes);
    var dir = minutes > 0 ? 'ahead of' : 'behind';
    var amount;
    if (n < 60) amount = n + ' minutes';
    else {
      var h = n / 60;
      amount = (Number.isInteger(h) ? h : h.toFixed(1)) + (h === 1 ? ' hour' : ' hours');
    }
    return amount + ' ' + dir + ' you';
  }

  function update() {
    var now = new Date();
    var time = fmt.format(now).replace(/\s+/g, ' ').toLowerCase();
    var diff = 360 - (-now.getTimezoneOffset()); // Bangladesh is UTC+6, no daylight saving
    el.textContent = "It\u2019s " + time + ' in Bangladesh' +
      (diff === 0 ? ', the same time as where you are.' : ', ' + gap(diff) + '.');
  }

  update();
  setInterval(update, 30000);
})();
