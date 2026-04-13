(function () {
  var resumeDownloadLink = document.querySelector(
    "#resume-skills a.resume-block__download"
  );

  function forceResumeDownload(e) {
    if (!resumeDownloadLink) return;
    e.preventDefault();

    var href = resumeDownloadLink.getAttribute("href");
    if (!href) return;

    fetch(href)
      .then(function (res) {
        if (!res.ok) throw new Error("resume download failed");
        return res.blob();
      })
      .then(function (blob) {
        var blobUrl = URL.createObjectURL(blob);
        var tempLink = document.createElement("a");
        var filename = href.split("/").pop() || "resume.pdf";
        tempLink.href = blobUrl;
        tempLink.download = filename;
        document.body.appendChild(tempLink);
        tempLink.click();
        tempLink.remove();
        URL.revokeObjectURL(blobUrl);
      })
      .catch(function () {
        /* Fallback: preserve existing behavior if fetch is blocked */
        window.location.href = href;
      });
  }

  if (resumeDownloadLink) {
    resumeDownloadLink.addEventListener("click", forceResumeDownload);
  }

  var navLinks = document.querySelectorAll(".site-nav a[data-section]");
  var sections = document.querySelectorAll(".page-main .section[id]");
  if (!navLinks.length || !sections.length) return;

  var siteHero = document.querySelector(".site-hero");
  var brandHero = document.querySelector(".brand--hero");
  var brandCompact = document.querySelector(".brand--compact");
  var siteHeader = document.querySelector(".site-header");

  function smoothBehavior() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
  }

  /** Match CSS scroll-padding-top to the real sticky header height (nav can wrap). */
  function syncHeaderHeightVar() {
    if (!siteHeader) return;
    document.documentElement.style.setProperty(
      "--header-height",
      siteHeader.offsetHeight + "px"
    );
  }

  function headerOffsetPx() {
    return siteHeader ? siteHeader.offsetHeight : 0;
  }

  /**
   * Scroll to #top or #id so the target sits with its top edge just under the
   * sticky header (no double offset from scroll-margin + scroll-padding).
   */
  function scrollToHashFromDocument(hash, updateHistory) {
    if (hash === "#" || hash === "" || hash === "#top") {
      window.scrollTo({ top: 0, behavior: smoothBehavior() });
      if (updateHistory !== false) {
        history.pushState(null, "", "#top");
      }
      return;
    }

    var id = hash.slice(1);
    var el = document.getElementById(id);
    if (!el) return;

    var y = el.getBoundingClientRect().top + window.scrollY - headerOffsetPx();

    if (id === "profile" && siteHero) {
      y = Math.max(y, siteHero.offsetHeight);
    }

    y = Math.max(0, y);
    window.scrollTo({ top: y, behavior: smoothBehavior() });
    if (updateHistory !== false) {
      history.pushState(null, "", "#" + id);
    }
  }

  function onInPageLinkClick(e) {
    var a = e.target.closest(".site-hero a[href^='#'], .site-header a[href^='#']");
    if (!a) return;
    var href = a.getAttribute("href");
    if (!href || href === "#") return;
    e.preventDefault();
    scrollToHashFromDocument(href, true);
  }

  document.addEventListener("click", onInPageLinkClick);

  function onResize() {
    syncHeaderHeightVar();
    scheduleUpdate();
  }
  window.addEventListener("resize", onResize);
  syncHeaderHeightVar();

  function updateCompactBrand() {
    if (!siteHero || !brandCompact || !siteHeader) return;
    /* Show compact slightly before the hero clears (avoids subpixel gaps where
       bottom === 0.5 and compact stayed hidden after Profile jump). */
    var COMPACT_SHOW_EARLY_PX = 20;
    var past =
      siteHero.getBoundingClientRect().bottom < COMPACT_SHOW_EARLY_PX;
    brandCompact.classList.toggle("is-visible", past);
    brandCompact.setAttribute("aria-hidden", past ? "false" : "true");
    brandCompact.tabIndex = past ? 0 : -1;
    if (brandHero) {
      brandHero.setAttribute("aria-hidden", past ? "true" : "false");
      if (past) {
        brandHero.setAttribute("tabindex", "-1");
      } else {
        brandHero.removeAttribute("tabindex");
      }
    }
  }

  var VIEWPORT_FOCUS_Y = 0.31;

  function setActive(id) {
    navLinks.forEach(function (a) {
      var on = a.getAttribute("data-section") === id;
      a.classList.toggle("is-active", on);
    });
  }

  function topY(el) {
    return el.getBoundingClientRect().top + window.scrollY;
  }

  function sectionAnchorTopY(section) {
    var inner = section.querySelector(".section-inner");
    return topY(inner || section);
  }

  function updateActiveFromScroll() {
    var vh = window.innerHeight;
    var focusLine = window.scrollY + vh * VIEWPORT_FOCUS_Y;
    var maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    var atBottom = maxScroll <= 0 || window.scrollY >= maxScroll - 1;

    if (atBottom) {
      setActive(sections[sections.length - 1].id);
      return;
    }

    var active = sections[0];
    for (var i = 0; i < sections.length; i++) {
      if (sectionAnchorTopY(sections[i]) <= focusLine) {
        active = sections[i];
      }
    }
    setActive(active.id);
  }

  var scheduled = false;
  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(function () {
      scheduled = false;
      updateActiveFromScroll();
      updateCompactBrand();
    });
  }

  window.addEventListener("scroll", scheduleUpdate, { passive: true });

  function onLoad() {
    syncHeaderHeightVar();
    if (location.hash && location.hash.length > 1) {
      scrollToHashFromDocument(location.hash, false);
    }
    scheduleUpdate();
  }

  if (document.readyState === "complete") {
    onLoad();
  } else {
    window.addEventListener("load", onLoad);
  }
})();
