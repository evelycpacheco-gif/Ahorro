/* app.js — eventos de la interfaz y arranque */
(function (P) {
  var $ = P.$, num = P.num, armed = null;

  function update(skipEditor) { P.save(); P.render(skipEditor); }

  /* Botón de dos pasos: el primer clic pide confirmación, el segundo ejecuta. */
  function confirmClick(btn, fn) {
    if (armed && armed.b === btn) { clearTimeout(armed.t); armed = null; fn(); return; }
    if (armed) { clearTimeout(armed.t); armed.b.textContent = armed.l; }
    armed = { b: btn, l: btn.textContent, t: setTimeout(function () { btn.textContent = armed.l; armed = null; }, 3000) };
    btn.textContent = "¿Seguro?";
  }

  function findGoal(id) { return P.state.goals.find(function (g) { return g.id === id; }); }

  // Registrar aporte
  $("f").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var a = num($("fa").value);
    if (!a) return;
    P.state.deposits.push({ id: P.uid(), date: $("fd").value || P.todayStr(), goal: $("fg").value, amount: a, note: $("fn").value.trim() });
    $("fa").value = ""; $("fn").value = "";
    update();
  });

  // Ajustes generales
  $("monthly").addEventListener("change", function () { P.state.monthly = num(this.value); update(true); });
  $("pct").addEventListener("change", function () { P.state.pct = Math.min(100, num(this.value)); update(true); });
  $("emgT").addEventListener("change", function () { P.state.emgTarget = num(this.value); update(true); });
  $("exp").addEventListener("change", function () { P.state.expenses = num(this.value); update(true); });

  // Metas: agregar, editar, reordenar, quitar
  $("addGoal").addEventListener("click", function () {
    P.state.goals.push({ id: P.uid(), name: "Nueva meta", target: 0 });
    update();
  });
  $("geList").addEventListener("change", function (ev) {
    var t = ev.target, id, g;
    if ((id = t.getAttribute("data-n")) && (g = findGoal(id))) { g.name = t.value.trim() || "Meta"; update(true); }
    else if ((id = t.getAttribute("data-t")) && (g = findGoal(id))) { g.target = num(t.value); update(true); }
  });
  $("geList").addEventListener("click", function (ev) {
    var t = ev.target.closest("button");
    if (!t) return;
    var G = P.state.goals, i, tmp;
    if (t.hasAttribute("data-up")) {
      i = +t.getAttribute("data-up");
      if (i > 0) { tmp = G[i]; G[i] = G[i - 1]; G[i - 1] = tmp; update(); }
    } else if (t.hasAttribute("data-dn")) {
      i = +t.getAttribute("data-dn");
      if (i < G.length - 1) { tmp = G[i]; G[i] = G[i + 1]; G[i + 1] = tmp; update(); }
    } else if (t.hasAttribute("data-rm")) {
      var id = t.getAttribute("data-rm");
      confirmClick(t, function () {
        P.state.goals = G.filter(function (g) { return g.id !== id; });
        P.state.deposits = P.state.deposits.filter(function (d) { return d.goal !== id; });
        update();
      });
    }
  });

  // Historial: borrar aporte
  $("hist").addEventListener("click", function (ev) {
    var t = ev.target.closest("button[data-del]");
    if (!t) return;
    var id = t.getAttribute("data-del");
    confirmClick(t, function () {
      P.state.deposits = P.state.deposits.filter(function (d) { return d.id !== id; });
      update(true);
    });
  });

  // Tema claro/oscuro
  $("theme").addEventListener("click", function () {
    var r = document.documentElement, cur = r.getAttribute("data-theme");
    var dark = cur === "dark" || (!cur && matchMedia("(prefers-color-scheme:dark)").matches);
    r.setAttribute("data-theme", dark ? "light" : "dark");
  });

  // Arranque
  $("fd").value = P.todayStr();
  P.render();
  P.connectDb(
    function () { P.render(); },
    function () { $("sync").textContent = "Guardado en tu cuenta y en este navegador."; }
  );
})(window.Plan);
