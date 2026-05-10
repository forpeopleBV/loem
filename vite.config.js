import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const spaRoutes = new Set([
  "/brand-story",
  "/brand-story/",
  "/lookbook",
  "/lookbook/",
  "/brand-in-action",
  "/brand-in-action/",
  "/brand-assets",
  "/brand-assets/",
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
});
