import React from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { MusicPlayer } from "./components/MusicPlayer.jsx";
import { AssetDownloadsPage } from "./pages/AssetDownloadsPage.jsx";
import { RoutePage } from "./pages/RoutePage.jsx";
import { landingMarkup, brandStoryMarkup, lookbookMarkup } from "./pages/legacyMarkup.js";
import { mountLandingPage } from "../scripts/landing.js";
import { mountBrandStoryPage } from "../scripts/brand-story.js";
import { mountLookbookPage } from "../scripts/lookbook.js";

function ScrollReset() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

export function App() {
  const navigate = useNavigate();

  return (
    <>
      <ScrollReset />
      <Routes>
        <Route
          path="/"
          element={
            <RoutePage
              bodyClassName="landing-page page-loading"
              markup={landingMarkup}
              mount={mountLandingPage}
              navigate={navigate}
            />
          }
        />
        <Route
          path="/brand-story"
          element={
            <RoutePage
              bodyClassName="brand-story-page"
              markup={brandStoryMarkup}
              mount={mountBrandStoryPage}
              navigate={navigate}
            />
          }
        />
        <Route
          path="/brand-in-action"
          element={
            <RoutePage
              bodyClassName="brand-in-action-page lookbook-page"
              markup={lookbookMarkup}
              mount={mountLookbookPage}
              navigate={navigate}
            />
          }
        />
        <Route path="/lookbook" element={<Navigate to="/brand-in-action" replace />} />
        <Route path="/brand-assets" element={<AssetDownloadsPage />} />
        <Route path="/assets" element={<Navigate to="/brand-assets" replace />} />
        <Route path="/assets-downloads" element={<Navigate to="/brand-assets" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <MusicPlayer />
    </>
  );
}
