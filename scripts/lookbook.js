import { animate } from "motion";

requestAnimationFrame(() => document.body.classList.add("page-in"));

const mapRevealSection = document.querySelector(".lookbook-section--map");
const mapItems = Array.from(document.querySelectorAll(".js-lookbook-map-item"));
const sceneSections = Array.from(document.querySelectorAll("[data-scene]"));
const parallaxItems = Array.from(document.querySelectorAll("[data-parallax]"));
const revealItems = Array.from(document.querySelectorAll("[data-reveal]")).map(
  (element) => ({
    element,
    scene: element.closest("[data-scene]"),
    kind: element.dataset.reveal || "media",
    start: Number(element.dataset.revealStart || 0.12),
  }),
);
const autoplayVideos = Array.from(
  document.querySelectorAll(".js-autoplay-video"),
);

const SCROLL_EASE = [0.16, 1, 0.3, 1];
const SCROLL_MOTION_DURATION = 0.46;
const SCROLL_TARGET_EPSILON = 0.5;
const scrollState = {
  y: window.scrollY || 0,
};
let scrollMotionAnimation = null;
let scrollMotionFrame = null;
let lastScrollTarget = scrollState.y;

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
    scrollMotionFrame = null;
    animateScrollMotion();
  });
}

function updateMapReveal(vh) {
  if (!mapRevealSection || !mapItems.length) return;

  const rect = getVirtualRect(mapRevealSection);
  const local = clamp((vh - rect.top) / (vh + rect.height), 0, 1);
  const revealProgress = smoothstep((local - 0.03) / 0.34);

  mapItems.forEach((item, index) => {
    const threshold =
      0.06 + (index / Math.max(1, mapItems.length - 1)) * 0.34;
    const itemProgress = smoothstep((revealProgress - threshold) / 0.14);
    const itemY = (1 - itemProgress) * 22;
    item.style.setProperty("--map-o", itemProgress.toFixed(3));
    item.style.setProperty("--map-y", `${itemY.toFixed(2)}px`);
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

function updateParallax(vh, now) {
  const t = now * 0.001;

  parallaxItems.forEach((item, index) => {
    const depth = Number(item.dataset.parallax || 0.24);
    const isLeftCard = item.classList.contains("wordmark-media-card--left");
    const isRightCard = item.classList.contains("wordmark-media-card--right");
    const isGuide = item.classList.contains("wordmark-guide");
    const isParfum = item.classList.contains("wordmark-media-card--parfum");
    const isPhone = item.classList.contains("wordmark-media-card--phone");
    const isBox = item.classList.contains("wordmark-media-card--box");
    const isMotifMark = item.classList.contains("motif-mark");
    const isLongMedia = isRightCard || isParfum || isPhone || isBox;
    const rect = getVirtualRect(item);
    const centerY = rect.top + rect.height * 0.5;
    const centerOffset = (centerY - vh * 0.5) / vh;
    const moveBoost = isParfum
      ? 1.85
      : isRightCard
        ? 1.45
        : isPhone
          ? 1.2
          : isBox
            ? 1.1
            : isMotifMark
              ? 0.75
          : isGuide
            ? 0.85
            : isLeftCard
              ? 0.68
              : 1;
    const flowBoost = isParfum
      ? 1.75
      : isRightCard
        ? 1.35
        : isPhone
          ? 1.05
          : isBox
            ? 0.92
            : isMotifMark
              ? 0.66
          : isGuide
            ? 0.72
            : isLeftCard
              ? 0.62
              : 1;
    const xDir = isParfum || isRightCard || isBox ? 1 : -1;
    const scrollShiftY = -centerOffset * depth * 130 * moveBoost;
    const flowXRaw =
      Math.sin(t * 0.6 + index * 1.37) * depth * 5.5 * flowBoost * xDir;
    const flowYRaw =
      Math.cos(t * 0.73 + index * 1.11) * depth * 7.5 * flowBoost;

    const xFactor = isLongMedia ? 0.24 : 1;
    const yFactor = isLongMedia ? 0.72 : 1;
    let flowX = flowXRaw * xFactor;
    let flowY = (scrollShiftY + flowYRaw) * yFactor;

    if (isLongMedia) {
      flowX = Math.round(flowX);
      flowY = Math.round(flowY);
    }

    item.style.setProperty("--px", `${flowX.toFixed(2)}px`);
    item.style.setProperty("--py", `${flowY.toFixed(2)}px`);
  });
}

function runFrame(now) {
  const vh = window.innerHeight || 1;
  updateMapReveal(vh);
  updateSceneReveal(vh);
  updateParallax(vh, now);
  requestAnimationFrame(runFrame);
}

document.addEventListener("DOMContentLoaded", () => {
  scrollState.y = window.scrollY || 0;
  lastScrollTarget = scrollState.y;
  requestAnimationFrame(runFrame);

  autoplayVideos.forEach((video) => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = true;
    video.autoplay = true;
    video.load();

    const tryPlay = () => video.play().catch(() => {});

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
  });
});

window.addEventListener("scroll", scheduleScrollMotion, { passive: true });
window.addEventListener(
  "resize",
  () => {
    scrollMotionAnimation?.stop();
    scrollState.y = window.scrollY || 0;
    lastScrollTarget = scrollState.y;
  },
  { passive: true },
);

document.querySelectorAll(".js-nav").forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href") || link.getAttribute("data-href");
    if (!href) return;
    event.preventDefault();
    if (href === window.location.pathname) return;
    document.body.classList.add("page-out");
    setTimeout(() => {
      window.location.href = href;
    }, 520);
  });
});

mapItems.forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.dataset.target;
    if (!targetId) return;
    const target = document.getElementById(targetId);
    if (!target) return;

    const targetRect = target.getBoundingClientRect();
    const targetY = Math.max(0, window.scrollY + targetRect.top - 110);
    window.scrollTo({ top: targetY, behavior: "smooth" });
  });
});
