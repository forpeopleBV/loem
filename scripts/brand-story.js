import { createLightCursor } from "./shared/light-cursor.js";

const lightCursor = document.getElementById("lightCursor");
const scenes = Array.from(document.querySelectorAll("[data-scene]"));
const parallaxImages = Array.from(document.querySelectorAll("[data-parallax]"));
const collectionItems = Array.from(
  document.querySelectorAll(".collection-item"),
);
const emWhiteVideo = document.getElementById("emWhiteVideo");
const emVideoSection = document.querySelector(".em-video-section");
const flowVideos = Array.from(document.querySelectorAll(".js-flow-video"));
const lightCursorController = createLightCursor(lightCursor);
let emVideoPlayedOnce = false;
let emWasInSection = false;
let emPlayPending = false;

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

function updateScenesAndParallax(now) {
  lightCursorController.render();

  const vh = window.innerHeight || 1;
  const t = now * 0.001;

  scenes.forEach((scene, sceneIndex) => {
    const rect = scene.getBoundingClientRect();
    const local = clamp((vh - rect.top) / (vh + rect.height), 0, 1);

    // Text arrives earlier than image.
    const textIn = smoothstep((local - 0.07) / 0.36);
    const textOut = smoothstep((local - 0.62) / 0.34);
    const textVisible = textIn * (1 - textOut);
    const textEntryStart = sceneIndex === 0 ? 320 : 220;
    const textY = (1 - textIn) * textEntryStart - textOut * 210;

    const imgIn = smoothstep((local - 0.18) / 0.38);
    const imgOut = smoothstep((local - 0.62) / 0.32);
    const imgVisible = imgIn * (1 - imgOut);
    const imgY = (1 - imgIn) * 300 - imgOut * 260;

    scene.style.setProperty("--text-y", `${textY.toFixed(2)}px`);
    scene.style.setProperty("--text-o", `${textVisible.toFixed(3)}`);
    scene.style.setProperty("--media-y", `${imgY.toFixed(2)}px`);
    scene.style.setProperty("--media-o", `${imgVisible.toFixed(3)}`);
  });

  const collectionScene = document
    .querySelector(".collections")
    ?.closest("[data-scene]");
  if (collectionScene && collectionItems.length) {
    const rect = collectionScene.getBoundingClientRect();
    const local = clamp((vh - rect.top) / (vh + rect.height), 0, 1);
    const revealProgress = smoothstep((local - 0.08) / 0.66);

    collectionItems.forEach((item, index) => {
      const threshold =
        0.28 + (index / Math.max(1, collectionItems.length - 1)) * 0.34;
      item.classList.toggle("is-visible", revealProgress >= threshold);
    });
  }

  parallaxImages.forEach((img, idx) => {
    const depth = Number(img.dataset.parallax || 0.2);
    const isHeroLeft = img.classList.contains("hero-left");
    const isHeroCenter = img.classList.contains("hero-center");
    const isPhiloMain = img.classList.contains("philo-main");
    const isPhiloSide = img.classList.contains("philo-side");
    const rect = img.getBoundingClientRect();
    const centerY = rect.top + rect.height * 0.5;
    const centerOffset = (centerY - vh * 0.5) / vh;

    const moveBoost = isPhiloSide
      ? 2.8
      : isPhiloMain
        ? 1.45
        : isHeroCenter
          ? 2.2
          : isHeroLeft
            ? 0.45
            : 1;
    const flowBoost = isPhiloSide
      ? 2.5
      : isPhiloMain
        ? 1.35
        : isHeroCenter
          ? 2.4
          : isHeroLeft
            ? 0.4
            : 1;
    const xDir = isPhiloSide
      ? 1
      : isPhiloMain
        ? -1
        : isHeroCenter
          ? 1
          : isHeroLeft
            ? -1
            : 1;

    const scrollShiftY = -centerOffset * depth * 130 * moveBoost;
    const mouseShiftX = 0;
    const mouseShiftY = 0;
    const flowX =
      Math.sin(t * 0.6 + idx * 1.37) * depth * 5.5 * flowBoost * xDir;
    const flowY = Math.cos(t * 0.73 + idx * 1.11) * depth * 7.5 * flowBoost;

    img.style.setProperty("--px", `${(mouseShiftX + flowX).toFixed(2)}px`);
    img.style.setProperty(
      "--py",
      `${(scrollShiftY + mouseShiftY + flowY).toFixed(2)}px`,
    );
  });

  if (emWhiteVideo && emVideoSection) {
    const rect = emVideoSection.getBoundingClientRect();
    const inSection = rect.top < vh * 0.72 && rect.bottom > vh * 0.28;

    // Same pattern as index: trigger only on section entry, play once.
    if (inSection && !emWasInSection && !emVideoPlayedOnce) {
      playEmVideoOnceWhenReady();
    }
    emWasInSection = inSection;
  }

  requestAnimationFrame(updateScenesAndParallax);
}

document.addEventListener("DOMContentLoaded", () => {
  requestAnimationFrame(() => document.body.classList.add("page-in"));
  requestAnimationFrame(updateScenesAndParallax);

  if (emWhiteVideo) {
    emWhiteVideo.load();
    emWhiteVideo.pause();
    emWhiteVideo.currentTime = 0;
  }

  flowVideos.forEach((video) => {
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
  });
});

document.querySelectorAll(".js-nav").forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href) return;
    event.preventDefault();
    if (href === window.location.pathname) return;
    document.body.classList.add("page-out");
    setTimeout(() => {
      window.location.href = href;
    }, 520);
  });
});
