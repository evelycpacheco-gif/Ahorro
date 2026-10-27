/* render.js — dibuja la pantalla a partir del estado */
(function (P) {
  var $ = P.$, esc = P.esc, money = P.money, pctOf = P.pctOf, eta = P.eta;

  function renderTotals(c) {
    var goalsSaved = 0;
    P.state.goals.forEach(function (g) { goalsSaved += c.res[g.id].saved; });
    $("total").textContent = money(goalsSaved + c.bal.emg);
    $("split").textContent = "Metas " + money(goalsSaved) + " · Emergencia " + money(c.bal.emg);
  }

  function renderHero(c) {
    var h = $("hero");
    if (c.active) {
      var g = c.active, r = c.res[g.id], p = pctOf(r.saved, g.target);
      h.className = "card hero";
      h.innerHTML =
        '<div class="lbl">Ahorrando ahora para</div><h2>' + esc(g.name) + '</h2>' +
        '<div class="row"><span class="pct num">' + Math.floor(p) + '%</span><span class="num">' + money(r.saved) + ' de ' + money(g.target) + '</span></div>' +
        '<div class="gauge" role="progressbar" aria-valuenow="' + Math.floor(p) + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + p + '%"></i></div>' +
        '<div class="facts"><div><b class="num">' + money(r.need) + '</b><span>Falta</span></div>' +
        '<div><b class="num">' + money(r.m1) + '</b><span>Aporte de este mes</span></div>' +
        '<div><b>' + esc(eta(r.done)) + '</b><span>Fecha estimada</span></div></div>';
    } else {
      h.className = "card hero done";
      h.innerHTML = '<div class="lbl">Estado</div><h2>Todas las metas están completas</h2><div class="row"><span class="pct">100%</span></div>' +
        '<p class="sub">Agrega una meta nueva o deja que el ahorro siga creciendo en emergencia.</p>';
    }
  }

  function renderPockets(c) {
    var S = P.state, html = "";
    S.goals.forEach(function (g) {
      var r = c.res[g.id], p = pctOf(r.saved, g.target), isA = c.active && c.active.id === g.id, cmp = g.target > 0 && r.need === 0, st;
      if (!(g.target > 0)) st = "Sin monto objetivo aún";
      else if (cmp) st = "Completa";
      else if (isA) st = "Activa · listo en " + eta(r.done);
      else st = "En cola · listo en " + eta(r.done);
      html += '<div class="card pocket' + (cmp ? " cmp" : "") + '"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><h3>' + esc(g.name) + '</h3>' +
        (isA ? '<span class="tag on">Activa</span>' : cmp ? '<span class="tag">Lista</span>' : "") + '</div>' +
        '<div class="amt num">' + money(r.saved) + '</div><div class="meta num">' + (g.target > 0 ? "de " + money(g.target) : "") + '</div>' +
        '<div class="gauge"><i style="width:' + p + '%"></i></div><div class="meta">' + esc(st) + '</div></div>';
    });
    var ep = pctOf(c.bal.emg, S.emgTarget);
    var cov = S.expenses > 0 ? "Cubre " + (c.bal.emg / S.expenses).toFixed(1).replace(".", ",") + " meses de gastos" : "";
    html += '<div class="card pocket emg"><h3>Fondo de emergencia</h3><div class="amt num">' + money(c.bal.emg) + '</div>' +
      '<div class="meta num">' + (S.emgTarget > 0 ? "de " + money(S.emgTarget) : "Sin meta definida") + '</div>' +
      '<div class="gauge"><i style="width:' + ep + '%"></i></div>' +
      '<div class="meta">Este mes suma ' + money(c.emg1) + (cov ? " · " + cov : "") + '</div></div>';
    $("pockets").innerHTML = html;
  }

  function renderForm() {
    var gs = $("fg"), cur = gs.value, opts = "";
    P.state.goals.forEach(function (g) { opts += '<option value="' + esc(g.id) + '">' + esc(g.name) + '</option>'; });
    opts += '<option value="emg">Fondo de emergencia</option>';
    gs.innerHTML = opts;
    if (cur) gs.value = cur;
    if (!gs.value) gs.selectedIndex = 0;
  }

  function renderHistory() {
    var name = { emg: "Fondo de emergencia" }, hh = "";
    P.state.goals.forEach(function (g) { name[g.id] = g.name; });
    P.state.deposits.slice().sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; }).forEach(function (d) {
      hh += '<li><div><b>' + esc(name[d.goal] || "Meta eliminada") + '</b><small>' + esc(d.date.split("-").reverse().join("/")) + (d.note ? " · " + esc(d.note) : "") + '</small></div>' +
        '<div style="display:flex;gap:8px;align-items:center"><span class="a num">' + money(d.amount) + '</span>' +
        '<button class="ghost" data-del="' + esc(d.id) + '" aria-label="Borrar aporte">Borrar</button></div></li>';
    });
    $("hist").innerHTML = hh || '<li class="empty">Aún no hay aportes.</li>';
  }

  function renderSettings(skipEditor) {
    var S = P.state;
    $("monthly").value = S.monthly; $("pct").value = S.pct;
    $("emgT").value = S.emgTarget || ""; $("exp").value = S.expenses || "";
    if (skipEditor) return;
    var e = "";
    S.goals.forEach(function (g, i) {
      e += '<div class="ge"><div><label>Meta</label><input data-n="' + esc(g.id) + '" value="' + esc(g.name) + '" maxlength="40"></div>' +
        '<div><label>Monto objetivo</label><input type="number" min="0" step="50000" data-t="' + esc(g.id) + '" value="' + (g.target || "") + '"></div>' +
        '<div class="btns"><button class="ghost" data-up="' + i + '" aria-label="Subir prioridad">▲</button>' +
        '<button class="ghost" data-dn="' + i + '" aria-label="Bajar prioridad">▼</button>' +
        '<button class="ghost warn" data-rm="' + esc(g.id) + '">Quitar</button></div></div>';
    });
    $("geList").innerHTML = e;
  }

  /* skipEditor = true evita reconstruir la lista de metas mientras la persona está escribiendo en ella */
  P.render = function (skipEditor) {
    var c = P.calc();
    renderTotals(c); renderHero(c); renderPockets(c);
    renderForm(); renderHistory(); renderSettings(skipEditor);
  };
})(window.Plan);
