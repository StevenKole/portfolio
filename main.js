(function () {
  var header = document.querySelector(".site-header");
  var navLinks = document.querySelectorAll(".site-nav a[data-section]");
  var sections = document.querySelectorAll(".page-main .section[id]");
  if (!navLinks.length || !sections.length) return;

  var sectionById = {};
  sections.forEach(function (el) {
    sectionById[el.id] = el;
  });

  function headerOffsetPx() {
    return header && header.offsetHeight ? header.offsetHeight : 64;
  }

  function setActive(id) {
    navLinks.forEach(function (a) {
      var on = a.getAttribute("data-section") === id;
      a.classList.toggle("is-active", on);
    });
  }

  function observeSections() {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          setActive(entry.target.id);
        });
      },
      {
        root: null,
        rootMargin: "-" + headerOffsetPx() + "px 0px -60% 0px",
        threshold: 0,
      }
    );
    sections.forEach(function (section) {
      observer.observe(section);
    });
    return observer;
  }

  var io = observeSections();

  if (header && typeof ResizeObserver !== "undefined") {
    var ro = new ResizeObserver(function () {
      io.disconnect();
      io = observeSections();
    });
    ro.observe(header);
  }

  var initial = window.location.hash.replace(/^#/, "");
  if (initial && sectionById[initial]) {
    setActive(initial);
  } else {
    setActive(sections[0].id);
  }
})();
