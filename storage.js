/* storage.js — estado, datos iniciales y guardado (navegador + cuenta de Claude si está disponible) */
(function (P) {
  var KEY = "plan-ahorro-v1", ref = null, timer = null;

  function defaults() {
    return {
      monthly: 600000, pct: 50, emgTarget: 0, expenses: 0,
      goals: [
        { id: "juanita", name: "Graduación de Juanita", target: 1600000 },
        { id: "pc", name: "PC", target: 2500000 },
        { id: "viaje", name: "Viaje con mis papás", target: 2500000 },
        { id: "celular", name: "Celular", target: 0 }
      ],
      deposits: [
        { id: "d1", date: "2026-10-08", goal: "juanita", amount: 1000000, note: "Del ahorro que ya tenía" },
        { id: "d2", date: "2026-10-08", goal: "emg", amount: 2000000, note: "Del ahorro que ya tenía" }
      ]
    };
  }

  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY));
      if (s && s.goals && s.deposits) return s;
    } catch (e) {}
    return null;
  }

  function push() {
    if (ref) ref.set({ plan: P.state, updated: Date.now() }).catch(function () {});
  }

  P.state = load() || defaults();

  /* Guarda en localStorage al instante y en la base de datos con un pequeño retraso. */
  P.save = function () {
    try { localStorage.setItem(KEY, JSON.stringify(P.state)); } catch (e) {}
    clearTimeout(timer);
    timer = setTimeout(push, 500);
  };

  /* Si la página corre dentro de claude.ai, sincroniza con la cuenta (datos privados por persona). */
  P.connectDb = async function (onLoaded, onReady) {
    try {
      var u = await claude.use("user"), db = await claude.use("db");
      if (!u || !db) return;
      var id = await u.id();
      if (!id) return;
      ref = db.collection("data/users/" + id).doc("plan");
      var snap = await ref.get();
      if (snap.exists && snap.data() && snap.data().plan && snap.data().plan.goals) {
        P.state = JSON.parse(JSON.stringify(snap.data().plan));
        try { localStorage.setItem(KEY, JSON.stringify(P.state)); } catch (e) {}
        onLoaded();
      } else {
        push();
      }
      onReady();
    } catch (e) { /* fuera de claude.ai: se queda solo con localStorage */ }
  };
})(window.Plan);
