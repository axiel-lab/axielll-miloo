// Basic-strategy lookup for a two-card starting hand.
// Rules assumed: 4 to 8 decks, dealer stands on soft 17, double after split allowed, no surrender.
(function () {
  var a = document.getElementById('bj-a');
  var b = document.getElementById('bj-b');
  var d = document.getElementById('bj-d');
  var out = document.getElementById('bj-out');
  if (!a || !b || !d || !out) return;

  var CARDS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  function fill(select) {
    var first = document.createElement('option');
    first.value = '';
    first.textContent = 'Choose';
    select.appendChild(first);
    CARDS.forEach(function (c) {
      var o = document.createElement('option');
      o.value = c;
      o.textContent = c === '10' ? '10, J, Q or K' : c;
      select.appendChild(o);
    });
  }
  [a, b, d].forEach(fill);

  function num(c) { return c === 'A' ? 11 : parseInt(c, 10); }
  function inRange(x, lo, hi) { return x >= lo && x <= hi; }

  var HIT = { move: 'Hit' };
  var STAND = { move: 'Stand' };
  var SPLIT = { move: 'Split' };
  var DOUBLE = { move: 'Double down', fallback: 'If you can\u2019t double, hit.' };
  var DOUBLE_S = { move: 'Double down', fallback: 'If you can\u2019t double, stand.' };

  function hard(total, dv) {
    if (total <= 8) return HIT;
    if (total === 9) return inRange(dv, 3, 6) ? DOUBLE : HIT;
    if (total === 10) return dv <= 9 ? DOUBLE : HIT;
    if (total === 11) return dv <= 10 ? DOUBLE : HIT;
    if (total === 12) return inRange(dv, 4, 6) ? STAND : HIT;
    if (total <= 16) return dv <= 6 ? STAND : HIT;
    return STAND;
  }

  function soft(other, dv) { // ace plus a card from 2 to 9
    if (other <= 3) return inRange(dv, 5, 6) ? DOUBLE : HIT;
    if (other <= 5) return inRange(dv, 4, 6) ? DOUBLE : HIT;
    if (other === 6) return inRange(dv, 3, 6) ? DOUBLE : HIT;
    if (other === 7) {
      if (inRange(dv, 3, 6)) return DOUBLE_S;
      return (dv === 2 || dv === 7 || dv === 8) ? STAND : HIT;
    }
    return STAND;
  }

  function pair(p, dv) {
    switch (p) {
      case 11: return SPLIT;
      case 10: return STAND;
      case 9: return (dv === 7 || dv >= 10) ? STAND : SPLIT;
      case 8: return SPLIT;
      case 7: return dv <= 7 ? SPLIT : HIT;
      case 6: return dv <= 6 ? SPLIT : HIT;
      case 5: return hard(10, dv);
      case 4: return inRange(dv, 5, 6) ? SPLIT : HIT;
      default: return dv <= 7 ? SPLIT : HIT; // 3s and 2s
    }
  }

  function show(move, why) {
    out.textContent = '';
    var m = document.createElement('p');
    m.className = 'helper-move';
    m.textContent = move;
    var w = document.createElement('p');
    w.className = 'helper-why';
    w.textContent = why;
    out.appendChild(m);
    out.appendChild(w);
  }

  function update() {
    if (!a.value || !b.value || !d.value) {
      out.textContent = '';
      var e = document.createElement('p');
      e.className = 'helper-empty';
      e.textContent = 'Choose your two cards and the dealer\u2019s card.';
      out.appendChild(e);
      return;
    }
    var dv = num(d.value);
    var dealer = d.value === 'A' ? 'an ace' : 'a ' + d.value;
    var x = num(a.value), y = num(b.value);
    var result, label;

    if (a.value === b.value) {
      result = pair(x, dv);
      label = a.value === 'A' ? 'Pair of aces' : 'Pair of ' + a.value + 's';
    } else if (a.value === 'A' || b.value === 'A') {
      var other = a.value === 'A' ? y : x;
      if (other === 10) {
        show('Blackjack', 'Ace and ten. Nothing to decide: take it.');
        return;
      }
      result = soft(other, dv);
      label = 'Soft ' + (11 + other);
    } else {
      result = hard(x + y, dv);
      label = 'Hard ' + (x + y);
    }

    var why = label + ' against ' + dealer + '.';
    if (result.fallback) why += ' ' + result.fallback;
    show(result.move, why);
  }

  [a, b, d].forEach(function (s) { s.addEventListener('change', update); });
  update();
})();
