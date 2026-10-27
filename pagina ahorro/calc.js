/* calc.js — saldos y proyección: una meta a la vez, el resto va a emergencia */
(function (P) {
  P.pctOf = function (a, t) { return t > 0 ? Math.min(100, a / t * 100) : 0; };

  P.eta = function (n) {
    if (n == null) return "más de 5 años";
    if (n === 0) return "completa";
    var d = new Date(); d.setMonth(d.getMonth() + n);
    return d.toLocaleDateString("es-CO", { month: "long", year: "numeric" }) + " (" + n + (n === 1 ? " mes" : " meses") + ")";
  };

  P.calc = function () {
    var S = P.state, bal = { emg: 0 };
    S.goals.forEach(function (g) { bal[g.id] = 0; });
    S.deposits.forEach(function (d) { bal[d.goal] = (bal[d.goal] || 0) + d.amount; });

    var b = Object.assign({}, bal), res = {}, budget = S.monthly * S.pct / 100, emg1 = 0;
    S.goals.forEach(function (g) {
      res[g.id] = {
        saved: bal[g.id] || 0,
        need: Math.max(0, (g.target || 0) - (bal[g.id] || 0)),
        done: (g.target > 0 && bal[g.id] >= g.target) ? 0 : null,
        m1: 0
      };
    });

    for (var m = 1; m <= 60; m++) {
      var left = budget, used = 0;
      S.goals.forEach(function (g) {
        var need = Math.max(0, (g.target || 0) - b[g.id]), c = Math.min(need, left);
        left -= c; used += c; b[g.id] += c;
        if (m === 1) res[g.id].m1 = c;
        if (c > 0 && res[g.id].done == null && b[g.id] >= g.target) res[g.id].done = m;
      });
      if (m === 1) emg1 = S.monthly - used;
    }

    var active = S.goals.find(function (g) { return res[g.id].need > 0; });
    return { bal: bal, res: res, active: active, emg1: emg1 };
  };
})(window.Plan);
