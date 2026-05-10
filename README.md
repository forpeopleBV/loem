# LOEM Site

React/Vite single-page site for the LOEM brand intro, brand story, and brand-in-action experience.

## Pages

- `/` - animated brand intro with scroll-driven canvas composition.
- `/brand-story` - brand story page with parallax scenes, collection icons, and video sections.
- `/brand-in-action` - Brand In Action experience.
- `/lookbook` - redirects to `/brand-in-action` for backwards compatibility.

The app keeps a persistent local music player mounted at the bottom-left of the viewport during in-site navigation.

## Local Development

```sh
npm install
npm run dev
npm run build
npm run preview
```

The dev server runs on `http://127.0.0.1:5173`.

## Deployment

The project is configured for Vercel as a Vite SPA. Production builds use `npm run build` and publish the `dist` directory. Clean routes rewrite to the React app shell.

## Authentication

Deployed URLs are protected by Vercel Routing Middleware using HTTP Basic Auth. Set `SITE_USERNAME` and `SITE_PASSWORD` in Vercel for Production and Preview. `SITE_USERNAME` defaults to `admin` if omitted; `SITE_PASSWORD` is required.

## Assets

Public media and fonts live under `public/assets`. Reference public files with absolute lowercase paths, for example `/assets/brand/Wordmark.svg` or `/assets/fonts/MartinaPlantijn-Light.woff2`.

Parked visual references live under `references/images` so they are not copied into production builds.

Asset folders are grouped by role:

- `brand` - logos, marks, and brand graphics.
- `cursors` - custom cursor artwork.
- `fonts` - served font files.
- `icons/product-ranges` - collection and product-range icons.
- `images/landing` - landing page imagery.
- `images/brand-story` - brand story imagery.
- `videos/landing` and `videos/brand-story` - page-specific motion assets.

## Runtime Structure

React owns the persistent app shell, routing, and local music player. The existing canvas/parallax runtimes are mounted from route components so their behavior remains page-local while navigation stays client-side.
