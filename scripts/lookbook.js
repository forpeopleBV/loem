import { animate } from "motion";
import { createLightCursor } from "./shared/light-cursor.js";

export function mountLookbookPage(options = {}) {
const { navigate } = options;

requestAnimationFrame(() => document.body.classList.add("page-in"));

const lightCursor = document.getElementById("lightCursor");
const mapItems = Array.from(document.querySelectorAll(".js-lookbook-map-item"));
const colourCopyButtons = Array.from(
  document.querySelectorAll(".colour-copy-link"),
);
const sceneSections = Array.from(document.querySelectorAll("[data-scene]"));
applyLookbookParallaxDefaults();
const parallaxItems = Array.from(document.querySelectorAll("[data-parallax]"));
const revealItems = Array.from(document.querySelectorAll("[data-reveal]")).map(
  (element) => ({
    element,
    scene: element.closest("[data-scene]"),
    kind: element.dataset.reveal || "media",
    start: Number(element.dataset.revealStart || 0.12),
  }),
);

const navLabelMap = {
  "BRAND INTRO": "品牌概述",
  "BRAND STORY": "品牌故事",
  "BRAND IN ACTION": "品牌应用",
  "BRAND ASSETS": "品牌素材",
};

function ensureBrandAssetsAction() {
  const brandActionActions = document.querySelector(".brand-action-cta__actions");
  if (!brandActionActions || brandActionActions.querySelector('[href="/brand-assets"]')) {
    return;
  }

  brandActionActions.insertAdjacentHTML(
    "beforeend",
    `<a class="brand-action-cta__button js-nav" href="/brand-assets">
      BRAND ASSETS
    </a>`,
  );
}

function enhanceNavigationLabels() {
  document.querySelectorAll(".brand-action-cta__button").forEach((button) => {
    if (button.querySelector(".brand-action-cta__button-main")) return;

    const label = button.textContent.trim().replace(/\s+/g, " ");
    const subLabel = navLabelMap[label.toUpperCase()];
    if (!subLabel) return;

    button.innerHTML = `<span class="brand-action-cta__button-main">${label}</span><span class="brand-action-cta__button-sub">${subLabel}</span>`;
  });
}

function preventSecondaryIntroWidow() {
  const secondaryIntro = document.querySelector(".secondary-colour__intro p");
  if (!secondaryIntro) return;

  secondaryIntro.innerHTML = secondaryIntro.innerHTML.replace(
    /more fluidly\./,
    "more&nbsp;fluidly.",
  );
}

ensureBrandAssetsAction();
enhanceNavigationLabels();
preventSecondaryIntroWidow();
const autoplayVideos = Array.from(
  document.querySelectorAll(".js-autoplay-video"),
);

const lightCursorController = createLightCursor(lightCursor);
const SCROLL_EASE = [0.16, 1, 0.3, 1];
const SCROLL_MOTION_DURATION = 0.46;
const SCROLL_TARGET_EPSILON = 0.5;
const scrollState = {
  y: window.scrollY || 0,
};
let scrollMotionAnimation = null;
let scrollMotionFrame = null;
let lastScrollTarget = scrollState.y;
let disposed = false;
let frameId = 0;
const videoObservers = [];

function applyLookbookParallaxDefaults() {
  const targets = [
    {
      selector: ".motif-mark",
      depth: "0.12",
      reveal: "media",
      revealStart: "0.44",
    },
    {
      selector: ".product-icons-media--box-secondary",
      depth: "0.12",
      reveal: "media",
      revealStart: "0.06",
    },
    { selector: ".secondary-colour__media--left", depth: "0.12" },
    { selector: ".secondary-colour__media--middle", depth: "0.14" },
    { selector: ".secondary-colour__media--blue", depth: "0.16" },
    { selector: ".secondary-colour__palette", depth: "0.12" },
    { selector: ".secondary-colour__application--left", depth: "0.16" },
    { selector: ".secondary-colour__application--right", depth: "0.12" },
    { selector: ".secondary-colour__application--small", depth: "0.1" },
    { selector: ".closing-video", depth: "0.1" },
  ];

  targets.forEach(({ selector, depth, reveal, revealStart }) => {
    document.querySelectorAll(selector).forEach((element) => {
      if (!element.dataset.parallax) {
        element.dataset.parallax = depth;
      }

      if (reveal) {
        element.dataset.reveal = reveal;
        element.dataset.revealStart = revealStart;
        element.classList.add("lookbook-reveal", "lookbook-reveal--media");
        element.classList.remove("lookbook-reveal--text");
      } else {
        element.classList.add("lookbook-parallax-asset");
      }
    });
  });
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function smoothstep(v) {
  const t = clamp(v, 0, 1);
  return t * t * (3 - 2 * t);
}

function getVirtualRect(element) {
  const rect = element.getBoundingClientRect();
  const scrollDelta = (window.scrollY || 0) - scrollState.y;
  return {
    top: rect.top + scrollDelta,
    bottom: rect.bottom + scrollDelta,
    height: rect.height,
  };
}

function animateScrollMotion() {
  const target = window.scrollY || 0;
  if (Math.abs(target - lastScrollTarget) < SCROLL_TARGET_EPSILON) return;

  lastScrollTarget = target;
  scrollMotionAnimation?.stop();
  scrollMotionAnimation = animate(
    scrollState,
    { y: target },
    {
      duration: SCROLL_MOTION_DURATION,
      ease: SCROLL_EASE,
    },
  );
}

function scheduleScrollMotion() {
  if (scrollMotionFrame !== null) return;
  scrollMotionFrame = requestAnimationFrame(() => {
    if (disposed) return;
    scrollMotionFrame = null;
    animateScrollMotion();
  });
}

function updateSceneReveal(vh) {
  sceneSections.forEach((scene) => {
    const rect = getVirtualRect(scene);
    const local = clamp((vh - rect.top) / (vh + rect.height), 0, 1);
    scene.style.setProperty("--scene-local", local.toFixed(3));
  });

  revealItems.forEach((item) => {
    const host = item.scene || item.element;
    const rect = getVirtualRect(host);
    const local = clamp((vh - rect.top) / (vh + rect.height), 0, 1);
    const isText = item.kind === "text";
    const revealStart = isText ? item.start - 0.035 : item.start;
    const revealWindow = isText ? 0.09 : 0.16;
    const revealIn = smoothstep((local - revealStart) / revealWindow);
    const revealOut = smoothstep((local - 0.94) / 0.16);
    const lift = isText ? 24 : 62;
    const y = (1 - revealIn) * lift - revealOut * 70;

    if (isText) {
      item.element.style.setProperty("--text-y", `${y.toFixed(2)}px`);
      return;
    }

    item.element.style.setProperty("--media-y", `${y.toFixed(2)}px`);
  });
}

function updateParallax(vh) {
  const lockedProductIconVideos = [
    document.querySelector(".product-icons-media--iphone"),
    document.querySelector(".product-icons-media--disc"),
  ].filter(Boolean);
  const lockedProductIconVideoSet = new Set(lockedProductIconVideos);
  const lockedSecondaryColourItems = [
    document.querySelector(".secondary-colour__media--left"),
    document.querySelector(".secondary-colour__media--middle"),
    document.querySelector(".secondary-colour__palette"),
  ].filter(Boolean);
  const lockedSecondaryColourSet = new Set(lockedSecondaryColourItems);

  if (lockedSecondaryColourItems.length) {
    const source = lockedSecondaryColourItems[0];
    const depth = Number(source.dataset.parallax || 0.12);
    const rect = getVirtualRect(source);
    const centerY = rect.top + rect.height * 0.5;
    const centerOffset = (centerY - vh * 0.5) / vh;
    const flowX = 0;
    const flowY = Math.round(-centerOffset * depth * 130 * 0.82);

    lockedSecondaryColourItems.forEach((item) => {
      item.style.setProperty("--px", `${flowX.toFixed(2)}px`);
      item.style.setProperty("--py", `${flowY.toFixed(2)}px`);
    });
  }

  if (lockedProductIconVideos.length) {
    const source =
      document.querySelector(".product-icons-media--iphone") ||
      lockedProductIconVideos[0];
    const depth = Number(source.dataset.parallax || 0.22);
    const rect = getVirtualRect(source);
    const centerY = rect.top + rect.height * 0.5;
    const centerOffset = (centerY - vh * 0.5) / vh;
    const flowX = 0;
    const flowY = Math.round(-centerOffset * depth * 130 * 1.55);

    lockedProductIconVideos.forEach((item) => {
      item.style.setProperty("--px", `${flowX.toFixed(2)}px`);
      item.style.setProperty("--py", `${flowY.toFixed(2)}px`);
    });
  }

  parallaxItems.forEach((item) => {
    if (lockedProductIconVideoSet.has(item)) return;
    if (lockedSecondaryColourSet.has(item)) return;

    const depth = Number(item.dataset.parallax || 0.24);
    const isLeftCard = item.classList.contains("wordmark-media-card--left");
    const isRightCard = item.classList.contains("wordmark-media-card--right");
    const isGuide = item.classList.contains("wordmark-guide");
    const isParfum = item.classList.contains("wordmark-media-card--parfum");
    const isPhone = item.classList.contains("wordmark-media-card--phone");
    const isBox = item.classList.contains("wordmark-box-pair");
    const isMotifMark = item.classList.contains("motif-mark");
    const isProductIconsMedia =
      item.classList.contains("product-icons-media") ||
      item.classList.contains("product-icons-strip");
    const isTypographyMedia = item.classList.contains("typography-media");
    const isColourMedia =
      item.classList.contains("colour-media") ||
      item.classList.contains("colour-palette");
    const isSecondaryMedia = item.classList.contains("secondary-colour__media");
    const isSecondaryApplication = item.classList.contains(
      "secondary-colour__application",
    );
    const isClosingVideo = item.classList.contains("closing-video");
    const isEdgeAnchored =
      isParfum ||
      isPhone ||
      isClosingVideo ||
      item.classList.contains("product-icons-media--bag") ||
      item.classList.contains("product-icons-media--iphone") ||
      item.classList.contains("typography-media--label-pull") ||
      item.classList.contains("typography-media--magazin") ||
      item.classList.contains("colour-media--label") ||
      item.classList.contains("secondary-colour__media--blue") ||
      item.classList.contains("secondary-colour__application--left") ||
      item.classList.contains("secondary-colour__application--right") ||
      item.classList.contains("colour-palette");
    const isLongMedia =
      isRightCard ||
      isParfum ||
      isPhone ||
      isBox ||
      isSecondaryApplication ||
      isClosingVideo ||
      isEdgeAnchored;
    const rect = getVirtualRect(item);
    const centerY = rect.top + rect.height * 0.5;
    const centerOffset = (centerY - vh * 0.5) / vh;
    const moveBoost = isParfum
      ? 1.85
      : isClosingVideo
        ? 0.85
      : isRightCard
        ? 1.45
        : isPhone
          ? 1.2
          : isBox
            ? 1.1
            : isSecondaryApplication
              ? 1
              : isSecondaryMedia
                ? 0.82
            : isMotifMark
              ? 0.75
              : isColourMedia
                ? 1.45
                : isTypographyMedia
                  ? 1.5
                  : isProductIconsMedia
                    ? 1.55
                    : isGuide
                      ? 0.85
                      : isLeftCard
                        ? 0.68
                        : 1;
    const scrollShiftY = -centerOffset * depth * 130 * moveBoost;

    const yFactor = isEdgeAnchored ? 1 : isLongMedia ? 0.72 : 1;
    let flowX = 0;
    let flowY = scrollShiftY * yFactor;

    if (isLongMedia) {
      flowX = Math.round(flowX);
      flowY = Math.round(flowY);
    }

    item.style.setProperty("--px", `${flowX.toFixed(2)}px`);
    item.style.setProperty("--py", `${flowY.toFixed(2)}px`);
  });
}

function runFrame() {
  if (disposed) return;
  lightCursorController.render();

  const vh = window.innerHeight || 1;
  updateSceneReveal(vh);
  updateParallax(vh);
  frameId = requestAnimationFrame(runFrame);
}

requestAnimationFrame(() => {
  if (!disposed) document.body.classList.add("page-in");
});
  scrollState.y = window.scrollY || 0;
  lastScrollTarget = scrollState.y;
  frameId = requestAnimationFrame(runFrame);

  autoplayVideos.forEach((video) => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = true;
    video.autoplay = true;
    video.removeAttribute("controls");
    video.load();

    const tryPlay = () => video.play().catch(() => {});
    tryPlay();
    video.addEventListener("loadeddata", tryPlay, { once: true });

    if (!("IntersectionObserver" in window)) {
      tryPlay();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            tryPlay();
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.28 },
    );
    observer.observe(video);
    videoObservers.push(observer);
  });

window.addEventListener("scroll", scheduleScrollMotion, { passive: true });
const onResize = () => {
    scrollMotionAnimation?.stop();
    scrollState.y = window.scrollY || 0;
    lastScrollTarget = scrollState.y;
  };
window.addEventListener("resize", onResize, { passive: true });

const navLinks = Array.from(document.querySelectorAll(".js-nav"));
const onNavClick = (event) => {
  const href =
    event.currentTarget.getAttribute("href") ||
    event.currentTarget.getAttribute("data-href");
  if (!href) return;
  const target = href.replace(/\.html$/, "") || "/";
  event.preventDefault();
  if (target === window.location.pathname) return;
  document.body.classList.add("page-out");
  setTimeout(() => {
    if (disposed) return;
    if (navigate) {
      navigate(target);
    } else {
      window.location.href = target;
    }
  }, 520);
};
navLinks.forEach((link) => link.addEventListener("click", onNavClick));

const onMapClick = (event) => {
    const button = event.currentTarget;
    const targetId = button.dataset.target;
    if (!targetId) return;
    const target = document.getElementById(targetId);
    if (!target) return;

    const targetRect = target.getBoundingClientRect();
    const targetY = Math.max(0, window.scrollY + targetRect.top - 110);
    window.scrollTo({ top: targetY, behavior: "smooth" });
  };
mapItems.forEach((button) => button.addEventListener("click", onMapClick));

const copyToClipboard = async (value) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
};

const onColourCopyClick = (event) => {
  const button = event.currentTarget;
  const hexValue = button.dataset.hex;
  if (!hexValue) return;

  copyToClipboard(hexValue)
    .then(() => {
      const originalLabel = button.dataset.label || button.textContent.trim();
      button.dataset.label = originalLabel;
      button.textContent = `Copied ${hexValue}`;
      button.classList.add("is-copied");

      window.setTimeout(() => {
        if (!button.isConnected) return;
        button.textContent = originalLabel;
        button.classList.remove("is-copied");
      }, 1400);
    })
    .catch(() => {
      button.textContent = "Copy failed";
      window.setTimeout(() => {
        if (!button.isConnected) return;
        button.textContent = button.dataset.label || "Copy HEX value";
      }, 1400);
    });
};
colourCopyButtons.forEach((button) =>
  button.addEventListener("click", onColourCopyClick),
);

return () => {
  disposed = true;
  cancelAnimationFrame(frameId);
  cancelAnimationFrame(scrollMotionFrame);
  scrollMotionAnimation?.stop();
  window.removeEventListener("scroll", scheduleScrollMotion);
  window.removeEventListener("resize", onResize);
  navLinks.forEach((link) => link.removeEventListener("click", onNavClick));
  mapItems.forEach((button) => button.removeEventListener("click", onMapClick));
  colourCopyButtons.forEach((button) =>
    button.removeEventListener("click", onColourCopyClick),
  );
  lightCursorController.destroy?.();
  videoObservers.forEach((observer) => observer.disconnect());
  autoplayVideos.forEach((video) => video.pause());
  document.body.classList.remove("page-in", "page-out");
};
}
