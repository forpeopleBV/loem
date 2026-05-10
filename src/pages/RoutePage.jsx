import React, { useEffect } from "react";

const ROUTE_BODY_CLASSES = [
  "landing-page",
  "brand-story-page",
  "brand-in-action-page",
  "lookbook-page",
  "page-loading",
  "page-in",
  "page-out",
];

export function RoutePage({ bodyClassName, markup, mount, navigate }) {
  useEffect(() => {
    document.body.classList.remove(...ROUTE_BODY_CLASSES);
    document.body.classList.add(...bodyClassName.split(/\s+/).filter(Boolean));
    const cleanup = mount?.({ navigate });

    return () => {
      cleanup?.();
      document.body.classList.remove(...ROUTE_BODY_CLASSES);
    };
  }, [bodyClassName, mount, navigate]);

  return <div className="route-page" dangerouslySetInnerHTML={{ __html: markup }} />;
}
