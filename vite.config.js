import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

const spaRoutes = new Set([
  "/brand-story",
  "/brand-story/",
  "/lookbook",
  "/lookbook/",
  "/brand-in-action",
  "/brand-in-action/",
  "/brand-assets",
  "/brand-assets/",
  "/assets",
  "/assets/",
  "/assets-downloads",
  "/assets-downloads/",
]);

function spaCleanRoutes() {
  const rewrite = (req, _res, next) => {
    const [pathname, query] = (req.url || "").split("?");
    if (spaRoutes.has(pathname)) {
      req.url = query ? `/index.html?${query}` : "/index.html";
    }
    next();
  };

  return {
    name: "spa-clean-routes",
    configureServer(server) {
      server.middlewares.use(rewrite);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite);
    },
  };
}

export default defineConfig({
  plugins: [react(), spaCleanRoutes()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        brandStory: resolve(__dirname, "brand-story.html"),
        brandInAction: resolve(__dirname, "brand-in-action.html"),
        lookbook: resolve(__dirname, "lookbook.html"),
        brandAssets: resolve(__dirname, "brand-assets.html"),
        assets: resolve(__dirname, "assets.html"),
        assetsDownloads: resolve(__dirname, "assets-downloads.html"),
      },
    },
  },
});
