import { BG_PALETTE } from "./config.js";

export function smoothstep(v) {
    const t = Math.max(0, Math.min(1, v));
    return t * t * (3 - 2 * t);
}

export function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function hexToRgb(hex) {
    const value = hex.replace('#', '').trim();
    const normalized = value.length === 3
        ? value.split('').map((ch) => ch + ch).join('')
        : value;
    const intVal = Number.parseInt(normalized, 16);
    return {
        r: (intVal >> 16) & 255,
        g: (intVal >> 8) & 255,
        b: intVal & 255,
    };
}

function mixColor(aHex, bHex, t) {
    const a = hexToRgb(aHex);
    const b = hexToRgb(bHex);
    return {
        r: Math.round(a.r + (b.r - a.r) * t),
        g: Math.round(a.g + (b.g - a.g) * t),
        b: Math.round(a.b + (b.b - a.b) * t),
    };
}

function toRgba(color, alpha) {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${clamp(alpha, 0, 1).toFixed(3)})`;
}

export function paletteColor(blend, alpha = 1) {
    return toRgba(
        mixColor(BG_PALETTE.warm, BG_PALETTE.cool, clamp(blend, 0, 1)),
        alpha
    );
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

export function blendScene(from, to, t) {
    return {
        leftEdge: lerp(from.leftEdge, to.leftEdge, t),
        left: lerp(from.left, to.left, t),
        center: lerp(from.center, to.center, t),
        right: lerp(from.right, to.right, t),
        rightEdge: lerp(from.rightEdge, to.rightEdge, t),
        glowX: lerp(from.glowX, to.glowX, t),
        glowY: lerp(from.glowY, to.glowY, t),
        glowBlend: lerp(from.glowBlend, to.glowBlend, t),
        glowAlpha: lerp(from.glowAlpha, to.glowAlpha, t),
        glowSize: lerp(from.glowSize, to.glowSize, t),
    };
}
