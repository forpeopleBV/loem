export function createLightCursor(element, options = {}) {
  const {
    initialScale = 0.9,
    visibleScale = 1,
    followEase = 0.16,
    scaleEase = 0.12,
    onMove,
    onRender,
  } = options;

  const state = {
    targetX: window.innerWidth * 0.5,
    targetY: window.innerHeight * 0.5,
    x: window.innerWidth * 0.5,
    y: window.innerHeight * 0.5,
    scale: initialScale,
    targetScale: initialScale,
    hasMoved: false,
  };

  function updateTarget(clientX, clientY) {
    state.targetX = clientX;
    state.targetY = clientY;
    state.targetScale = visibleScale;
    if (!state.hasMoved) {
      state.x = clientX;
      state.y = clientY;
      state.hasMoved = true;
    }
    onMove?.(state);
  }

  function render() {
    if (!element || !state.hasMoved) return state;

    state.x += (state.targetX - state.x) * followEase;
    state.y += (state.targetY - state.y) * followEase;
    state.scale += (state.targetScale - state.scale) * scaleEase;
    element.style.transform = `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 0) translate(-50%, -50%) scale(${state.scale.toFixed(3)})`;
    onRender?.(state);
    return state;
  }

  window.addEventListener(
    "mousemove",
    (event) => {
      updateTarget(event.clientX, event.clientY);
      element?.classList.add("is-visible");
    },
    { passive: true },
  );

  window.addEventListener(
    "mouseenter",
    (event) => {
      updateTarget(event.clientX, event.clientY);
      element?.classList.add("is-visible");
    },
    { passive: true },
  );

  window.addEventListener(
    "mouseleave",
    () => {
      state.targetScale = initialScale;
      element?.classList.remove("is-visible");
    },
    { passive: true },
  );

  return {
    state,
    render,
  };
}
