# Agent Notes

This file is for coding agents working on the LOEM site. Keep it current when project structure, commands, navigation, or asset conventions change.

## Project Shape

LOEM is a React/Vite single-page app. React owns the app shell, clean routes, and persistent local music player.

Pages:

- `/` - animated landing page with scroll-driven canvas cards.
- `/brand-story` - editorial brand story page with parallax scenes and videos.
- `/brand-in-action` - Brand In Action experience.
- `/lookbook` - redirects to `/brand-in-action` for backwards compatibility.

`index.html` is the only HTML app shell. Route markup lives under `src/pages`, and legacy animation runtimes are mounted from React route components.

## Commands

```sh
npm install
npm run dev
npm run build
npm run preview
```

The dev server is configured for `http://127.0.0.1:5173`.

Always run `npm run build` after code changes. Run `git diff --check` before handing off.

## File Layout

- `src/` - React app shell, routes, persistent local music player, and generated legacy markup.
- `styles/landing.css` - landing page styles.
- `styles/brand-story.css` - Brand Story styles.
- `styles/lookbook.css` - Brand In Action page styles.
- `styles/shared/` - shared CSS modules, currently cursor and footer.
- `scripts/landing.js` - landing page runtime and canvas animation loop.
- `scripts/landing/` - landing constants and pure utilities.
- `scripts/brand-story.js` - Brand Story runtime.
- `scripts/lookbook.js` - Brand In Action runtime.
- `scripts/shared/` - shared JavaScript modules.
- `public/assets/` - served fonts, images, SVGs, videos, and textures.
- `references/images/` - parked visual references that should not be copied into production builds.

Reference public assets with absolute paths like `/assets/brand/Wordmark.svg`.

## Navigation

The nav is intentionally stable across non-home pages:

- Left: Brand Story
- Center: LOEM wordmark, linked to `/`
- Right: Brand In Action

Public navigation uses clean URLs: `/`, `/brand-story`, and `/brand-in-action`. Vercel and local Vite dev/preview rewrite these routes to the React app shell.

Do not move nav items around to indicate the current page. Use the current/selected state only.

The home page has its own top chrome and final-action links. The Forpeople footer is intentionally not shown on the home page. Internal navigation must use React Router, not `window.location.href`, so the local music player remains mounted.

## Motion And Performance Notes

The landing page animation is sensitive. Preserve the existing scroll-snap behavior unless intentionally testing a motion change.

Key landing details:

- Motion's vanilla `animate()` API drives eased scroll state.
- The canvas render loop remains in `scripts/landing.js`.
- Retina support is intentional via `window.devicePixelRatio`.
- Avoid adding expensive per-frame image processing, layout reads, or DOM writes inside the canvas frame loop.
- Cursor behavior is shared, but landing uses cursor position to add subtle camera wobble.
- The local music player lives in `src/components/MusicPlayer.jsx`; keep it outside routed page content.

## Footer

Brand Story and Brand In Action share a non-sticky footer with the Forpeople logo and `© 2026`.

The logo asset lives at:

- `public/assets/brand/forpeople.svg`

The footer link opens:

- `http://forpeople.com/`

## Style Conventions

- Keep CSS and JavaScript split out of HTML.
- Keep asset paths lowercase at the folder level under `public/assets`.
- Never change the website title. It must stay `Loēm Brand Lookbook` for every route.
- Prefer small shared modules only when they reduce real duplication.
- Keep the React shell thin: preserve existing page runtimes unless intentionally refactoring them.
- Use `apply_patch` for manual edits when working as Codex.

## Handoff Checklist

Before handing work back:

```sh
npm run build
git diff --check
git status --short
```

Mention any checks that could not be run.
