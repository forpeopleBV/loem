export const SECTION_TITLES = [
    "Section 1",
    "Section 2",
    "Section 3",
    "Section 4",
    "Section 5",
    "Section 6",
];

export const BASE_IMAGE_PATHS = [
    "/assets/images/landing/cards/Frame 2090055623.jpg",
    "/assets/images/landing/cards/Frame 2090055627.jpg",
    "/assets/images/landing/cards/Frame 2090055634.jpg",
    "/assets/images/landing/cards/Frame 2090055643.jpg",
    "/assets/images/landing/cards/Frame 2090055661.jpg",
    "/assets/images/landing/cards/Screenshot 2026-04-21 at 10.39.14 2.jpg",
    "/assets/images/landing/cards/e43fda12-4792-434d-8942-bc44fea8206f 2.jpg",
    "/assets/images/landing/cards/loreworld_1768413242_3810047991433109308_65923060496 9.jpg",
    "/assets/images/landing/cards/marvin-leuvrey_stills_025 4.jpg",
    "/assets/images/landing/cards/samuelpasquier_1691943848_3168577116093411413_9420069 5.jpg",
];

export const CENTER_VIDEO_PATH = "/assets/videos/landing/Loem-Black.mp4";
export const CENTER_VIDEO_FALLBACK_PATH = "/assets/videos/landing/A-Black.mp4";
export const CENTER_STEPS = [
    { type: 'text', text: "A modern living practice," },
    { type: 'text', text: "redefining daily essentials—for flow." },
    { type: 'text', text: "Where the mind awakens," },
    { type: 'text', text: "the self dissolves," },
    { type: 'text', text: "And everything moves effortlessly." },
    { type: 'video', videoPath: CENTER_VIDEO_PATH },
];
export const CENTER_SLIDE_DISTANCE_RATIO = 0.36;

export const BG_PALETTE = {
    warm: '#FFE9AC',
    cool: '#CED2F1',
};
export const BG_SCENES = [
    { leftEdge: 0.03, left: 0.05, center: 0.08, right: 0.10, rightEdge: 0.14, glowX: 65, glowY: 44, glowBlend: 0.02, glowAlpha: 0.42, glowSize: 58 },
    { leftEdge: 0.03, left: 0.06, center: 0.13, right: 0.26, rightEdge: 0.36, glowX: 58, glowY: 43, glowBlend: 0.04, glowAlpha: 0.36, glowSize: 54 },
    { leftEdge: 0.04, left: 0.08, center: 0.34, right: 0.72, rightEdge: 0.90, glowX: 27, glowY: 45, glowBlend: 0.04, glowAlpha: 0.34, glowSize: 50 },
    { leftEdge: 0.12, left: 0.18, center: 0.52, right: 0.84, rightEdge: 0.96, glowX: 24, glowY: 43, glowBlend: 0.06, glowAlpha: 0.30, glowSize: 48 },
    { leftEdge: 0.94, left: 0.82, center: 0.62, right: 0.36, rightEdge: 0.16, glowX: 80, glowY: 45, glowBlend: 0.18, glowAlpha: 0.28, glowSize: 50 },
    { leftEdge: 0.99, left: 0.94, center: 0.82, right: 0.64, rightEdge: 0.36, glowX: 88, glowY: 45, glowBlend: 0.28, glowAlpha: 0.24, glowSize: 44 },
];

export const CARDS_PER_SECTION = 10;
export const TOTAL_TURNS = 0.3;
export const TILT_X = 14 * Math.PI / 180;
export const PHASE_PER_SECTION = Math.PI * 0.4;
export const CENTER_DEPTH = 0.5;
export const SCROLL_EASE = [0.2, 0.95, 0.25, 1];
export const SCROLL_MOTION_DURATION = 0.16;
export const BG_MOTION_DURATION = 0.26;
export const MOTION_TARGET_EPSILON = 0.0002;
export const CARD_REVEAL_DURATION = 1.05;
export const CARD_TRANSITION_OPACITY_DROP = 0.22;
export const IDLE_START_DELTA = 0.00025;
export const IDLE_DRIFT_DELAY = 0.7;
export const IDLE_DRIFT_RAMP_DURATION = 2.4;
export const IDLE_DRIFT_X_RATIO = 0.0016;
export const IDLE_DRIFT_Y_RATIO = 0.0018;
export const CAMERA_WOBBLE_X_RATIO = 0.018;
export const CAMERA_WOBBLE_Y_RATIO = 0.014;
export const CAMERA_WOBBLE_SPIN = 0.026;
export const WORLD_RADIUS = 0.57;
export const HORIZONTAL_SPREAD = 1.9;
export const CARD_SIZE_BOOST = 1.68;
export const CORNER_BOOST_X_STRONG = 1.28;
export const CORNER_BOOST_Y_STRONG = 1.18;
export const CORNER_BOOST_X_SOFT = 1.14;
export const CORNER_BOOST_Y_SOFT = 1.08;
export const PHI = Math.PI * (3 - Math.sqrt(5));
export const COS_TILT_X = Math.cos(TILT_X);
export const SIN_TILT_X = Math.sin(TILT_X);
