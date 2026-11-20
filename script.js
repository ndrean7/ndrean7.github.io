// 0xndrean7 portfolio — tiny script. No libraries, no tracking.
(function () {
  // Footer year.
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Type the hero command once on load. Skipped if reduced motion is on.
  var target = document.getElementById("typed");
  if (!target) return;
  var text = "whoami";
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    target.textContent = text;
    return;
  }
  var i = 0;
  var timer = setInterval(function () {
    target.textContent = text.slice(0, ++i);
    if (i >= text.length) clearInterval(timer);
  }, 90);
})();
