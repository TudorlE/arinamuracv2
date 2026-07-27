(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------------------
     Sticky nav background on scroll
     ---------------------------------------------------------------------- */
  const siteNav = document.getElementById("siteNav");

  const updateNavBackground = () => {
    if (window.scrollY > 24) {
      siteNav.classList.add("is-scrolled");
    } else {
      siteNav.classList.remove("is-scrolled");
    }
  };
  updateNavBackground();
  window.addEventListener("scroll", updateNavBackground, { passive: true });

  /* ----------------------------------------------------------------------
     Mobile menu (full-screen overlay)
     ---------------------------------------------------------------------- */
  const navToggle = document.getElementById("navToggle");
  const navOverlay = document.getElementById("navOverlay");
  const navOverlayLinks = navOverlay.querySelectorAll("a");

  const closeMenu = () => {
    navOverlay.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("nav-open");
  };

  const openMenu = () => {
    navOverlay.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close menu");
    document.body.classList.add("nav-open");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = navOverlay.classList.contains("is-open");
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  navOverlayLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navOverlay.classList.contains("is-open")) {
      closeMenu();
    }
  });

  /* ----------------------------------------------------------------------
     Active section highlight on scroll
     ---------------------------------------------------------------------- */
  const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
  const sectionIds = navLinks
    .map((link) => link.getAttribute("href"))
    .filter((href) => href && href.startsWith("#"))
    .map((href) => href.slice(1));

  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const setActiveLink = (id) => {
      navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${id}`;
        link.classList.toggle("is-active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveLink(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0,
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ----------------------------------------------------------------------
     Scroll reveal animations
     ---------------------------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ----------------------------------------------------------------------
     Language bar fill-on-reveal
     ---------------------------------------------------------------------- */
  const barFills = document.querySelectorAll(".bar-fill");

  barFills.forEach((bar) => {
    const width = bar.getAttribute("data-width") || "0";
    bar.style.setProperty("--target-width", `${width}%`);
  });

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    barFills.forEach((bar) => bar.classList.add("is-filled"));
  } else {
    const barObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-filled");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    barFills.forEach((bar) => barObserver.observe(bar));
  }

  /* ----------------------------------------------------------------------
     Lightbox
     ---------------------------------------------------------------------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");

  let currentGalleryTiles = [];
  let currentIndex = -1;
  let lastFocusedEl = null;

  const buildGalleryTiles = (galleryName) => {
    return Array.from(document.querySelectorAll(`.media-tile[data-full]`)).filter((tile) => {
      const grid = tile.closest("[data-gallery]");
      return grid && grid.getAttribute("data-gallery") === galleryName;
    });
  };

  const showImageAt = (index) => {
    if (!currentGalleryTiles.length) return;
    currentIndex = (index + currentGalleryTiles.length) % currentGalleryTiles.length;
    const tile = currentGalleryTiles[currentIndex];
    const full = tile.getAttribute("data-full");
    const caption = tile.getAttribute("data-caption") || "";
    const altText = tile.querySelector("img") ? tile.querySelector("img").getAttribute("alt") : caption;

    lightboxImg.src = full;
    lightboxImg.alt = altText || caption;
    lightboxCaption.textContent = caption;
  };

  const openLightbox = (tile) => {
    const grid = tile.closest("[data-gallery]");
    const galleryName = grid ? grid.getAttribute("data-gallery") : "default";
    currentGalleryTiles = buildGalleryTiles(galleryName);
    const index = currentGalleryTiles.indexOf(tile);

    lastFocusedEl = document.activeElement;

    showImageAt(index === -1 ? 0 : index);

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");

    lightboxClose.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    lightboxImg.src = "";

    if (lastFocusedEl && typeof lastFocusedEl.focus === "function") {
      lastFocusedEl.focus();
    }
  };

  document.querySelectorAll(".media-tile[data-full]").forEach((tile) => {
    tile.addEventListener("click", () => openLightbox(tile));
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", () => showImageAt(currentIndex - 1));
  lightboxNext.addEventListener("click", () => showImageAt(currentIndex + 1));

  // Click outside the figure closes the lightbox
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;

    if (e.key === "Escape") {
      closeLightbox();
    } else if (e.key === "ArrowRight") {
      showImageAt(currentIndex + 1);
    } else if (e.key === "ArrowLeft") {
      showImageAt(currentIndex - 1);
    } else if (e.key === "Tab") {
      // simple focus trap among lightbox controls
      const focusable = [lightboxPrev, lightboxNext, lightboxClose];
      const activeIdx = focusable.indexOf(document.activeElement);
      e.preventDefault();
      let nextIdx;
      if (e.shiftKey) {
        nextIdx = activeIdx <= 0 ? focusable.length - 1 : activeIdx - 1;
      } else {
        nextIdx = activeIdx === -1 || activeIdx === focusable.length - 1 ? 0 : activeIdx + 1;
      }
      focusable[nextIdx].focus();
    }
  });
})();
