/**
 * Full-viewport decorative canvas behind the page. Pauses when the tab is
 * hidden or the user prefers reduced motion (static frame instead).
 */
(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var canvas = document.createElement("canvas");
  canvas.className = "site-bg-canvas";
  canvas.setAttribute("aria-hidden", "true");
  canvas.setAttribute("role", "presentation");

  document.body.insertBefore(canvas, document.body.firstChild);

  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var animating = false;
  var rafId = 0;
  var t0 = performance.now();

  function dpr() {
    return Math.min(window.devicePixelRatio || 1, 2);
  }

  function viewSize() {
    return {
      w: window.innerWidth,
      h: window.innerHeight,
    };
  }

  function sizeCanvas() {
    var vw = viewSize();
    var w = vw.w;
    var h = vw.h;
    if (w < 1 || h < 1) return;
    var px = dpr();
    canvas.width = Math.floor(w * px);
    canvas.height = Math.floor(h * px);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(px, 0, 0, px, 0, 0);
  }

  function drawStatic() {
    var vw = viewSize();
    var w = vw.w;
    var h = vw.h;
    if (w < 1 || h < 1) return;
    ctx.clearRect(0, 0, w, h);
    var g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "rgba(124, 58, 237, 0.18)");
    g.addColorStop(0.5, "rgba(90, 45, 95, 0.1)");
    g.addColorStop(1, "rgba(234, 88, 12, 0.16)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function drawFrame(t) {
    var vw = viewSize();
    var w = vw.w;
    var h = vw.h;
    if (w < 1 || h < 1) return;
    var sec = (t - t0) * 0.001;
    ctx.clearRect(0, 0, w, h);

    var x1 = w * (0.35 + 0.25 * Math.sin(sec * 0.45));
    var y1 = h * (0.35 + 0.2 * Math.cos(sec * 0.38));
    var r1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, Math.max(w, h) * 0.55);
    r1.addColorStop(0, "rgba(168, 85, 247, 0.22)");
    r1.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = r1;
    ctx.fillRect(0, 0, w, h);

    var x2 = w * (0.65 + 0.2 * Math.cos(sec * 0.5));
    var y2 = h * (0.55 + 0.18 * Math.sin(sec * 0.42));
    var r2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, Math.max(w, h) * 0.45);
    r2.addColorStop(0, "rgba(100, 50, 130, 0.11)");
    r2.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = r2;
    ctx.fillRect(0, 0, w, h);

    var x3 = w * (0.5 + 0.3 * Math.sin(sec * 0.33 + 1));
    var y3 = h * (0.2 + 0.1 * Math.cos(sec * 0.4));
    var r3 = ctx.createRadialGradient(x3, y3, 0, x3, y3, Math.max(w, h) * 0.42);
    r3.addColorStop(0, "rgba(251, 146, 60, 0.2)");
    r3.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = r3;
    ctx.fillRect(0, 0, w, h);

    var x4 = w * (0.28 + 0.15 * Math.sin(sec * 0.28 + 0.5));
    var y4 = h * (0.72 + 0.12 * Math.cos(sec * 0.36));
    var r4 = ctx.createRadialGradient(x4, y4, 0, x4, y4, Math.max(w, h) * 0.38);
    r4.addColorStop(0, "rgba(234, 88, 12, 0.14)");
    r4.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = r4;
    ctx.fillRect(0, 0, w, h);
  }

  function tick(now) {
    rafId = 0;
    if (!animating) return;
    if (document.hidden || reduceMotion.matches) {
      stopLoop();
      return;
    }
    drawFrame(now);
    rafId = requestAnimationFrame(tick);
  }

  function startLoop() {
    if (reduceMotion.matches) return;
    if (document.hidden) return;
    if (animating) return;
    animating = true;
    t0 = performance.now();
    rafId = requestAnimationFrame(tick);
  }

  function stopLoop() {
    animating = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  function onVisibility() {
    if (document.hidden) {
      stopLoop();
    } else if (!reduceMotion.matches) {
      startLoop();
    }
  }

  function onResize() {
    sizeCanvas();
    if (reduceMotion.matches) {
      drawStatic();
    }
  }

  function onReduceMotionChange() {
    stopLoop();
    sizeCanvas();
    if (reduceMotion.matches) {
      drawStatic();
    } else if (!document.hidden) {
      startLoop();
    }
  }

  document.addEventListener("visibilitychange", onVisibility, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", onReduceMotionChange);
  } else if (reduceMotion.addListener) {
    reduceMotion.addListener(onReduceMotionChange);
  }

  sizeCanvas();
  if (reduceMotion.matches) {
    drawStatic();
  } else if (!document.hidden) {
    startLoop();
  }
})();
