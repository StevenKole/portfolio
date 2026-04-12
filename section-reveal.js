/**
 * Profile: reveal animation runs once on window load.
 * Other sections: IntersectionObserver (one-shot). prefers-reduced-motion: all instant.
 */
(function () {
  var sectionEls = document.querySelectorAll(".page-main .section[id]");
  var inners = document.querySelectorAll(".page-main .section[id] .section-inner");
  if (!sectionEls.length || !inners.length) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function revealAllInstant() {
    for (var i = 0; i < inners.length; i++) {
      inners[i].classList.add("is-revealed");
    }
  }

  if (reduceMotion.matches) {
    revealAllInstant();
    return;
  }

  document.documentElement.classList.add("js-section-reveal");

  var presetToggle = false;
  for (var j = 0; j < inners.length; j++) {
    presetToggle = !presetToggle;
    inners[j].classList.add(
      presetToggle ? "section-inner--reveal-a" : "section-inner--reveal-b"
    );
  }

  var profileInner = document.querySelector("#profile .section-inner");

  function revealInnerFromSection(sectionEl) {
    var inner = sectionEl.querySelector(".section-inner");
    if (!inner || inner.classList.contains("is-revealed")) return;
    inner.classList.add("is-revealed");
  }

  var io = new IntersectionObserver(
    function (entries) {
      for (var k = 0; k < entries.length; k++) {
        var entry = entries[k];
        if (!entry.isIntersecting) continue;
        var sectionEl = entry.target;
        (function (sec) {
          requestAnimationFrame(function () {
            revealInnerFromSection(sec);
            io.unobserve(sec);
          });
        })(sectionEl);
      }
    },
    {
      root: null,
      /* Negative bottom inset: section must sit further into the viewport before reveal */
      rootMargin: "0px 0px -35% 0px",
      threshold: 0,
    }
  );

  for (var m = 0; m < sectionEls.length; m++) {
    if (sectionEls[m].id === "profile") continue;
    io.observe(sectionEls[m]);
  }

  window.addEventListener("load", function () {
    if (!profileInner) return;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        profileInner.classList.add("is-revealed");
      });
    });
  });
})();
