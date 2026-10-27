/* utils.js — funciones de apoyo compartidas (namespace global: window.Plan) */
window.Plan = window.Plan || {};
(function (P) {
  var fmt = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

  P.$ = function (id) { return document.getElementById(id); };
  P.money = function (n) { return fmt.format(Math.round(n || 0)); };
  P.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  P.uid = function () { return Math.random().toString(36).slice(2, 9); };
  P.todayStr = function () {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  };
  P.num = function (v) { var n = parseFloat(v); return isFinite(n) && n > 0 ? n : 0; };
})(window.Plan);
