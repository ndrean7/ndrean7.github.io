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

// ---- 3D background: perspective particle field on a fixed canvas.
// No libraries, no CDN. Points fly toward the viewer (depth = z),
// with faint motion trails, a slow drift and pointer parallax.
// Light on phones: DPR capped, fewer particles on small screens,
// animation pauses when the tab is hidden or motion is reduced.
(function () {
  var canvas = document.getElementById("bg3d");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;
  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var W = 0, H = 0, CX = 0, CY = 0, F = 420;
  var points = [];
  var px = 0, py = 0, tx = 0, ty = 0; // pointer parallax (lerped)
  var running = false, raf = 0, last = 0;

  function count() {
    var area = window.innerWidth * window.innerHeight;
    var n = Math.round(area / 11000);
    return Math.max(45, Math.min(window.innerWidth < 640 ? 80 : 150, n));
  }

  function seed() {
    points = [];
    var n = count();
    for (var k = 0; k < n; k++) {
      points.push({
        x: (Math.random() * 2 - 1) * 1.1,
        y: (Math.random() * 2 - 1) * 0.7,
        z: 0.2 + Math.random() * 0.8, // 0.2 = near, 1 = far
        s: 0.4 + Math.random() * 0.6, // speed factor
        hue: Math.random()
      });
    }
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5); // HD, capped
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    CX = W / 2;
    CY = H / 2;
    F = Math.min(W, H) * 0.85; // focal length, px
    seed();
  }

  // Classic perspective divide: nearer (small z) = bigger + further out.
  function project(p) {
    var depth = 1 - p.z; // 0 far .. 0.8 near
    var inv = 1 / p.z;
    return {
      x: CX + (p.x * F * 0.55 + px * 30 * depth) * inv,
      y: CY + (p.y * F * 0.55 + py * 20 * depth) * inv,
      r: 0.5 + depth * depth * 2.4,
      a: 0.08 + depth * depth * 0.75
    };
  }

  function draw(now) {
    var dt = Math.min((now - last) / 1000 || 0.016, 0.05);
    last = now;
    // ease pointer parallax toward target
    px += (tx - px) * 0.04;
    py += (ty - py) * 0.04;
    ctx.clearRect(0, 0, W, H);
    for (var k = 0; k < points.length; k++) {
      var p = points[k];
      var a = project(p);
      // fly toward the viewer, then recycle to the far plane
      p.z -= dt * 0.09 * p.s;
      if (p.z <= 0.18) {
        p.z = 1;
        p.x = (Math.random() * 2 - 1) * 1.1;
        p.y = (Math.random() * 2 - 1) * 0.7;
      }
      var b = project(p);
      // motion trail: short line from previous position to current
      ctx.strokeStyle = p.hue < 0.12
        ? "rgba(255,180,84," + (a.a * 0.55) + ")"
        : "rgba(61,255,122," + (a.a * 0.5) + ")";
      ctx.lineWidth = Math.max(0.6, b.r * 0.7);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      // glowing head dot
      ctx.fillStyle = p.hue < 0.12
        ? "rgba(255,180,84," + a.a + ")"
        : "rgba(61,255,122," + a.a + ")";
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, 6.2832);
      ctx.fill();
    }
    if (running) raf = requestAnimationFrame(draw);
  }

  function start() {
    if (running || document.hidden) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(draw);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
  }

  window.addEventListener("pointermove", function (e) {
    tx = (e.clientX / window.innerWidth - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else start();
  });
  var resizeTimer = 0;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 180);
  });

  resize();
  if (reduceMotion) {
    // one static frame, no animation
    last = performance.now();
    draw(performance.now());
  } else {
    start();
  }
})();
