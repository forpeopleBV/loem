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

const FORPEOPLE_CREDIT =
  '<a class="site-footer__credit" href="https://www.forpeople.com/" target="_blank" rel="noopener noreferrer">BY FORPEOPLE</a>';

function withFooterCredit(markup) {
  if (!markup.includes("site-footer") || markup.includes("site-footer__credit")) {
    return markup;
  }

  return markup.replace("</footer>", `      ${FORPEOPLE_CREDIT}\n    </footer>`);
}

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

  const pageMarkup = React.useMemo(() => withFooterCredit(markup), [markup]);

  return <div className="route-page" dangerouslySetInnerHTML={{ __html: pageMarkup }} />;
}
