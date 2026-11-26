/* La página lee el dispositivo donde se ejecuta y publica el resultado en el <body>:
   data-orientation = landscape | portrait
   data-short       = 1 cuando la altura útil es baja (típico en horizontal)
   data-viewport    = xs | phone | wide | desktop
   El CSS usa estos atributos para distribuir sin depender de scroll. */
(function () {
  function apply() {
    var w = window.innerWidth || document.documentElement.clientWidth;
    var h = window.innerHeight || document.documentElement.clientHeight;
    var b = document.body;
    if (!b) return;
    b.dataset.orientation = w > h ? "landscape" : "portrait";
    b.dataset.short = h <= 520 ? "1" : "0";
    b.dataset.viewport = w < 380 ? "xs" : w < 560 ? "phone" : w < 900 ? "wide" : "desktop";
    b.dataset.resolution = w + "x" + h;
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
  window.addEventListener("resize", apply);
  window.addEventListener("orientationchange", apply);
})();
