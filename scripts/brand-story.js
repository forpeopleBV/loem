import { animate } from "motion";
import { createLightCursor } from "./shared/light-cursor.js";

export function mountBrandStoryPage(options = {}) {
const { navigate } = options;

const lightCursor = document.getElementById("lightCursor");
const scenes = Array.from(document.querySelectorAll("[data-scene]"));
const parallaxImages = Array.from(document.querySelectorAll("[data-parallax]"));
const collectionItems = Array.from(
  document.querySelectorAll(".collection-item"),
);
const overviewItems = Array.from(
  document.querySelectorAll(".brand-overview__item"),
);
const brandOverview = document.querySelector(".brand-overview");
const brandActionCta = document.querySelector(".brand-action-cta");
const brandActionActions = document.querySelector(".brand-action-cta__actions");
const siteFooter = document.querySelector(".site-footer");
const emWhiteVideo = document.getElementById("emWhiteVideo");
const emVideoSection = document.querySelector(".em-video-section");
const topFlowCaption = document.querySelector(".top-flow-caption");
const autoplayVideos = Array.from(
  document.querySelectorAll(".js-autoplay-video"),
);
const flowVideos = Array.from(document.querySelectorAll(".js-flow-video"));
const flowVideoSections = Array.from(
  document.querySelectorAll(".flow-video-section"),
);

const navLabelMap = {
  "BRAND INTRO": "品牌概述",
  "BRAND STORY": "品牌故事",
  "BRAND IN ACTION": "品牌应用",
  "BRAND ASSETS": "品牌素材",
};

function ensureBrandAssetsAction() {
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

ensureBrandAssetsAction();
enhanceNavigationLabels();
const topFadeMask = document.querySelector(".top-fade-mask");
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
let emVideoPlayedOnce = false;
let emWasInSection = false;
let emPlayPending = false;
let flowTopMaskMix = 0;
let darkCursorZoneMix = 0;
const FLOW_ACCENT_BY_STATE = {
  presence: "#d2d20d",
  connection: "#ece7df",
  energy: "#fdbc05",
  boundless: "#7886fa",
};
const FLOW_CAPTION_STICKY_TOP = 68;
const FLOW_CAPTION_START_OFFSET = 52;
let lastFlowCaptionAccent = FLOW_ACCENT_BY_STATE.presence;
let disposed = false;
let frameId = 0;
const videoObservers = [];
let ctaObserver = null;

function playEmVideoOnceWhenReady() {
  if (!emWhiteVideo || emVideoPlayedOnce || emPlayPending) return;
  emPlayPending = true;

  const doPlay = () => {
    emWhiteVideo.currentTime = 0;
    emWhiteVideo
      .play()
      .then(() => {
        emVideoPlayedOnce = true;
        emPlayPending = false;
      })
      .catch(() => {
        emPlayPending = false;
      });
  };

  if (emWhiteVideo.readyState >= 2) {
    doPlay();
  } else {
    const onReady = () => {
      emWhiteVideo.removeEventListener("loadeddata", onReady);
      doPlay();
    };
    emWhiteVideo.addEventListener("loadeddata", onReady, { once: true });
    emWhiteVideo.load();
  }
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
function smoothstep(v) {
  const t = clamp(v, 0, 1);
  return t * t * (3 - 2 * t);
}

function computeFlowTopMaskTarget(vh) {
  if (!flowVideos.length && !brandOverview && !brandActionCta && !siteFooter) {
    return 0;
  }
  const maskHeight = topFadeMask?.offsetHeight || 220;
  const enterRange = Math.max(maskHeight * 1.6, 220);
  let target = 0;

  flowVideos.forEach((video) => {
    const rect = getVirtualRect(video);
    if (rect.bottom <= 0 || rect.top >= vh) return;

    // Darken progressively as each flow video approaches/passes behind top mask.
    const enter = smoothstep((enterRange - rect.top) / enterRange);
    // Fade out smoothly when section leaves the viewport.
    const exit = smoothstep(rect.bottom / Math.max(maskHeight, 1));
    target = Math.max(target, Math.min(enter, exit));
  });

  // Keep the top mask dark over the dark ending zone.
  [brandOverview, brandActionCta, siteFooter].forEach((section) => {
    if (!section) return;
    const rect = getVirtualRect(section);
    if (rect.bottom <= 0 || rect.top >= vh) return;

    const enter = smoothstep((enterRange - rect.top) / enterRange);
    const exit = smoothstep(rect.bottom / Math.max(maskHeight, 1));
    target = Math.max(target, Math.min(enter, exit));
  });

  return clamp(target, 0, 1);
}

function computeDarkCursorZoneTarget(vh) {
  if (!brandOverview) return 0;

  const rect = getRealRect(brandOverview);
  // Start exactly when overview top reaches viewport top, then dissolve in.
  if (rect.top >= 0) return 0;
  return smoothstep(clamp(-rect.top / (vh * 0.24), 0, 1));
}

function computeFlowCaptionPlacement(vh) {
  if (!topFlowCaption || !flowVideos.length) {
    return { y: null, opacity: 0, onVideoTarget: 0, accent: null };
  }

  const firstFlowSectionRect = getRealRect(flowVideoSections[0] || flowVideos[0]);
  const lastFlowSectionRect = getRealRect(
    flowVideoSections[flowVideoSections.length - 1] ||
      flowVideos[flowVideos.length - 1],
  );
  const ySticky = FLOW_CAPTION_STICKY_TOP;
  const yStart = firstFlowSectionRect.top + FLOW_CAPTION_START_OFFSET;
  const yEnd = lastFlowSectionRect.top + ySticky;
  const y = Math.min(Math.max(ySticky, yStart), yEnd);

  const hasEnteredFlow = firstFlowSectionRect.top < vh;
  const hasFlowRemaining = lastFlowSectionRect.bottom > 0;
  const isFlowActive = hasEnteredFlow && hasFlowRemaining;
  const opacity = isFlowActive ? 1 : 0;

  let onVideoTarget = isFlowActive ? 1 : 0;
  let accent = isFlowActive ? lastFlowCaptionAccent : null;
  if (isFlowActive) {
    const captionProbeY = y + (topFlowCaption.offsetHeight || 0) * 0.5;
    let sectionUnderCaption = flowVideoSections.find((section) => {
      const rect = getRealRect(section);
      return rect.top <= captionProbeY && rect.bottom >= captionProbeY;
    });

    // Fallback for sub-pixel gaps between stacked video sections.
    if (!sectionUnderCaption) {
      sectionUnderCaption = flowVideoSections.find((section) => {
        const rect = getRealRect(section);
        return rect.bottom > 0 && rect.top < vh;
      });
    }

    if (sectionUnderCaption) {
      accent =
        FLOW_ACCENT_BY_STATE[sectionUnderCaption.dataset.flowState] ||
        lastFlowCaptionAccent;
      lastFlowCaptionAccent = accent;
    }
  }

  return { y, opacity, onVideoTarget, accent };
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

function getRealRect(element) {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top,
    bottom: rect.bottom,
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

function setBrandActionVisibility(isInZone) {
  if (!brandActionCta) return;

  brandActionCta.classList.toggle("is-visible", isInZone);
  brandActionCta.classList.toggle("is-active", isInZone);
  brandActionActions?.setAttribute("aria-hidden", isInZone ? "false" : "true");
}

function updateScenesAndParallax(now) {
  if (disposed) return;
  lightCursorController.render();

  const vh = window.innerHeight || 1;
  scenes.forEach((scene, sceneIndex) => {
    const rect = getVirtualRect(scene);
    const local = clamp((vh - rect.top) / (vh + rect.height), 0, 1);

    const textIn = smoothstep((local - 0.04) / 0.28);
    const textOut = smoothstep((local - 0.9) / 0.16);
    const textVisible = textIn * (1 - textOut);
    const textEntryStart = sceneIndex === 0 ? 34 : 24;
    const textY = (1 - textIn) * textEntryStart - textOut * 70;

    const imgIn = smoothstep((local - 0.12) / 0.32);
    const imgOut = smoothstep((local - 0.9) / 0.16);
    const imgVisible = imgIn * (1 - imgOut);
    const imgY = (1 - imgIn) * 62 - imgOut * 70;
    const flowVideoY = (0.5 - local) * 12;
    const flowVideoScale = 1.012 - Math.abs(local - 0.5) * 0.006;

    scene.style.setProperty("--text-y", `${textY.toFixed(2)}px`);
    scene.style.setProperty("--text-o", `${textVisible.toFixed(3)}`);
    scene.style.setProperty("--media-y", `${imgY.toFixed(2)}px`);
    scene.style.setProperty("--media-o", `${imgVisible.toFixed(3)}`);
    scene.style.setProperty("--scene-local", local.toFixed(3));
    scene.style.setProperty("--flow-video-y", `${flowVideoY.toFixed(2)}px`);
    scene.style.setProperty(
      "--flow-video-scale",
      flowVideoScale.toFixed(4),
    );
  });

  const collectionScene = document
    .querySelector(".collections")
    ?.closest("[data-scene]");
  if (collectionScene && collectionItems.length) {
    const rect = getVirtualRect(collectionScene);
    const local = clamp((vh - rect.top) / (vh + rect.height), 0, 1);
    const revealProgress = smoothstep((local - 0.02) / 0.54);

    collectionItems.forEach((item, index) => {
      const threshold =
        0.1 + (index / Math.max(1, collectionItems.length - 1)) * 0.24;
      const itemProgress = smoothstep((revealProgress - threshold) / 0.18);
      const itemY = (1 - itemProgress) * (42 + index * 4);
      item.style.setProperty("--collection-o", itemProgress.toFixed(3));
      item.style.setProperty("--collection-y", `${itemY.toFixed(2)}px`);
    });
  }

  if (overviewItems.length) {
    overviewItems.forEach((item, index) => {
      const rect = getVirtualRect(item);
      const local = clamp((vh - rect.top) / (vh + rect.height), 0, 1);
      const reveal = smoothstep((local - 0.02) / 0.28);
      const drift = (1 - reveal) * (index % 2 === 0 ? 26 : 34);
      item.style.setProperty("--overview-o", reveal.toFixed(3));
      item.style.setProperty("--overview-y", `${drift.toFixed(2)}px`);
    });
  }

  parallaxImages.forEach((img) => {
    const depth = Number(img.dataset.parallax || 0.2);
    const isWhatWeDo = img.classList.contains("what-we-do__image-wrap");
    const isPhiloMain = img.classList.contains("philo-main");
    const isPhiloSide = img.classList.contains("philo-side");
    const isLongMedia = isWhatWeDo || isPhiloMain || isPhiloSide;
    const rect = getVirtualRect(img);
    const centerY = rect.top + rect.height * 0.5;
    const centerOffset = (centerY - vh * 0.5) / vh;

    const moveBoost = isPhiloSide
      ? 1.35
      : isPhiloMain
        ? 1.15
        : isWhatWeDo
          ? 0.72
          : 1;
    const scrollShiftY = -centerOffset * depth * 130 * moveBoost;
    const flowX = 0;
    let flowY = scrollShiftY * (isLongMedia ? 0.72 : 1);

    if (isLongMedia) {
      flowY = Math.round(flowY);
    }

    img.style.setProperty("--px", `${flowX.toFixed(2)}px`);
    img.style.setProperty("--py", `${flowY.toFixed(2)}px`);
  });

  if (emWhiteVideo && emVideoSection) {
    const rect = getVirtualRect(emVideoSection);
    const inSection = rect.top < vh * 0.72 && rect.bottom > vh * 0.28;

    // Same pattern as index: trigger only on section entry, play once.
    if (inSection && !emWasInSection && !emVideoPlayedOnce) {
      playEmVideoOnceWhenReady();
    }
    emWasInSection = inSection;
  }

  const flowMaskTarget = computeFlowTopMaskTarget(vh);
  flowTopMaskMix += (flowMaskTarget - flowTopMaskMix) * 0.12;
  if (Math.abs(flowMaskTarget - flowTopMaskMix) < 0.0015) {
    flowTopMaskMix = flowMaskTarget;
  }
  document.body.style.setProperty(
    "--top-fade-video-mix",
    flowTopMaskMix.toFixed(4),
  );

  const darkCursorTarget = computeDarkCursorZoneTarget(vh);
  darkCursorZoneMix += (darkCursorTarget - darkCursorZoneMix) * 0.18;
  if (Math.abs(darkCursorTarget - darkCursorZoneMix) < 0.0015) {
    darkCursorZoneMix = darkCursorTarget;
  }
  document.body.style.setProperty(
    "--dark-cursor-zone-mix",
    darkCursorZoneMix.toFixed(4),
  );

  const flowCaption = computeFlowCaptionPlacement(vh);
  document.body.style.setProperty(
    "--active-flow-accent",
    flowCaption.accent || "var(--top-nav-color)",
  );
  document.body.style.setProperty(
    "--top-flow-caption-y",
    flowCaption.y === null ? "-9999px" : `${flowCaption.y.toFixed(2)}px`,
  );
  document.body.style.setProperty(
    "--top-flow-caption-opacity",
    flowCaption.opacity.toFixed(3),
  );
  document.body.style.setProperty(
    "--top-flow-caption-on-video",
    flowCaption.onVideoTarget.toFixed(4),
  );

  frameId = requestAnimationFrame(updateScenesAndParallax);
}

  requestAnimationFrame(() => {
    if (!disposed) document.body.classList.add("page-in");
  });
  scrollState.y = window.scrollY || 0;
  lastScrollTarget = scrollState.y;
  frameId = requestAnimationFrame(updateScenesAndParallax);

  if (emWhiteVideo) {
    emWhiteVideo.load();
    emWhiteVideo.pause();
    emWhiteVideo.currentTime = 0;
  }

  [...autoplayVideos, ...flowVideos].forEach((video) => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = true;
    video.autoplay = true;
    video.load();
    const tryPlay = () => video.play().catch(() => {});
    video.addEventListener("canplay", tryPlay, { once: true });
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
      { threshold: 0.35 },
    );
    observer.observe(video);
    videoObservers.push(observer);
  });

  if (brandActionCta) {
    if (!("IntersectionObserver" in window)) {
      setBrandActionVisibility(true);
    } else {
      ctaObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const isInZone = entry.isIntersecting && entry.intersectionRatio > 0.28;
            setBrandActionVisibility(isInZone);
          });
        },
        { threshold: [0.28, 0.35, 0.5] },
      );
      ctaObserver.observe(brandActionCta);
    }
  }
;

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

return () => {
  disposed = true;
  cancelAnimationFrame(frameId);
  cancelAnimationFrame(scrollMotionFrame);
  scrollMotionAnimation?.stop();
  window.removeEventListener("scroll", scheduleScrollMotion);
  window.removeEventListener("resize", onResize);
  navLinks.forEach((link) => link.removeEventListener("click", onNavClick));
  lightCursorController.destroy?.();
  videoObservers.forEach((observer) => observer.disconnect());
  ctaObserver?.disconnect();
  [...autoplayVideos, ...flowVideos].forEach((video) => video.pause());
  document.body.classList.remove("page-in", "page-out");
  document.body.style.removeProperty("--top-fade-video-mix");
  document.body.style.removeProperty("--dark-cursor-zone-mix");
  document.body.style.removeProperty("--top-flow-caption-y");
  document.body.style.removeProperty("--top-flow-caption-opacity");
  document.body.style.removeProperty("--top-flow-caption-on-video");
};
}
