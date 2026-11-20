// 0xndrean7 portfolio — tiny script. No libraries, no tracking.
(function () {
  // Footer year.
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Scroll-reveal: sections + cards fade/rise in. Content stays visible
  // without JS (hidden state only applies once .js is set in <head>).
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (reduceMotion) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else if ("IntersectionObserver" in window) {
    // Stagger cards inside each grid (max ~350ms).
    Array.prototype.forEach.call(document.querySelectorAll(".cards"), function (grid) {
      Array.prototype.forEach.call(grid.querySelectorAll(".card"), function (card, i) {
        card.style.setProperty("--rd", Math.min(i, 5) * 70 + "ms");
      });
    });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { observer.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

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
