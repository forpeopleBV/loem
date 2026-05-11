import React from "react";
import { Link } from "react-router-dom";

const downloads = [
  {
    name: "Download Artwork Pack",
    description:
      "Complete package with all LOEM artwork assets in one download, including wordmark, motif, signature, and product range icons.",
    url: "/assets/downloads/Loem%20Artwork%20Pack.zip",
    format: "ZIP",
    size: "7.3 MB",
    updated: "11 May 2026",
    usedIn: "All brand assets",
    actionLabel: "Download all",
    featured: true,
  },
  {
    name: "Loem Wordmark",
    description:
      "Wordmark artwork in Ink Black and Cotton White across editable and web-ready formats.",
    url: "/assets/downloads/Loem%20Wordmark.zip",
    format: "ZIP",
    size: "129 KB",
    updated: "11 May 2026",
    usedIn: "Wordmark",
  },
  {
    name: "Loem Signature",
    description:
      "Signature artwork in Ink Black and Cotton White, including static and animated formats.",
    url: "/assets/downloads/Loem%20Signature.zip",
    format: "ZIP",
    size: "4.9 MB",
    updated: "11 May 2026",
    usedIn: "Motif & Signature",
  },
  {
    name: "Loem Motif",
    description:
      "Motif artwork in Ink Black and Cotton White, including static and animated formats.",
    url: "/assets/downloads/Loem%20Motif.zip",
    format: "ZIP",
    size: "2.1 MB",
    updated: "11 May 2026",
    usedIn: "Motif & Signature",
  },
  {
    name: "Loem Product Range Icons",
    description:
      "Product line icon artwork for Core, Sleep, Skin, Jewellery, and Objects.",
    url: "/assets/downloads/Loem%20Product%20Range%20Icons.zip",
    format: "ZIP",
    size: "519 KB",
    updated: "11 May 2026",
    usedIn: "Product Line Icons",
  },
  {
    name: "Martina Plantijn",
    description:
      "Primary brand typeface used for body copy and editorial text across the LOEM site.",
    url: "https://klim.co.nz/fonts/martina-plantijn/",
    format: "External link",
    size: "Klim Type Foundry",
    updated: "Link",
    usedIn: "Typography",
    external: true,
  },
  {
    name: "Greed Condensed",
    description:
      "Condensed display typeface used for headings, navigation, labels, and buttons.",
    url: "https://displaay.net/typeface/greed#condensed",
    format: "External link",
    size: "Displaay Type Foundry",
    updated: "Link",
    usedIn: "Typography",
    external: true,
  },
];

const colours = [
  {
    name: "Cotton",
    description: "Used for base, backgrounds and to create breathing space for other elements.",
    hex: "#FFFAF2",
    usedIn: "Core Colour Palette",
  },
  {
    name: "Umber",
    description:
      "Secondary base, used for bolder expression across campaign, social media and spatial design.",
    hex: "#27160F",
    pantone: "PANTONE 476",
    usedIn: "Core Colour Palette",
  },
  {
    name: "Golden Yellow",
    description:
      "Leading brand colour, used for key brand moments, highlights, signature details, tags and labels.",
    hex: "#FDBC05",
    pantone: "PANTONE 115",
    usedIn: "Core Colour Palette",
  },
  {
    name: "Ink",
    description: "Used only for text, including motif, signature and body copy.",
    hex: "#171A20",
    pantone: "PANTONE Black 6",
    usedIn: "Core Colour Palette",
  },
];

const tableItems = [
  ...downloads.map((download) => ({ ...download, kind: "download" })),
  {
    name: "CORE COLOUR PALETTE",
    format: "Colour",
    kind: "palette",
    url: "core-colour-palette",
  },
];

const copyToClipboard = async (value) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }
  } catch {
    // Fall through to the textarea fallback for browsers that block clipboard writes.
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
};

export function AssetDownloadsPage() {
  const [copiedHex, setCopiedHex] = React.useState("");

  React.useEffect(() => {
    document.body.classList.remove(
      "landing-page",
      "brand-story-page",
      "brand-in-action-page",
      "lookbook-page",
      "page-loading",
      "page-in",
      "page-out",
    );
    document.body.classList.add("asset-downloads-page", "page-in");

    return () => {
      document.body.classList.remove("asset-downloads-page", "page-in");
    };
  }, []);

  const handleCopyColour = (hex) => {
    copyToClipboard(hex).finally(() => {
      setCopiedHex(hex);
      window.setTimeout(() => {
        setCopiedHex((currentHex) => (currentHex === hex ? "" : currentHex));
      }, 1600);
    });
  };

  return (
    <div className="route-page asset-downloads">
      <div id="lightCursor" className="light-cursor" aria-hidden="true" />
      <div className="top-fade-mask" aria-hidden="true" />

      <header className="top-nav">
        <Link className="top-link js-nav" to="/brand-story">
          <span className="top-link__main">BRAND STORY</span>
          <span className="top-link__sub">品牌故事</span>
        </Link>
        <Link className="brand-lockup js-nav" to="/" aria-label="LOEM home">
          <img src="/assets/brand/Wordmark.svg" alt="LOEM wordmark" />
        </Link>
        <Link className="top-link right js-nav" to="/brand-in-action">
          <span className="top-link__main">BRAND IN ACTION</span>
          <span className="top-link__sub">品牌应用</span>
        </Link>
      </header>

      <main className="asset-downloads__main" aria-label="Assets">
        <section className="asset-downloads__table-wrap" aria-label="Assets table">
          <table className="asset-downloads__table">
            <thead>
              <tr>
                <th scope="col">Asset</th>
                <th scope="col">Description</th>
                <th scope="col">Source</th>
                <th scope="col">Updated</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {tableItems.map((download) => {
                if (download.kind === "palette") {
                  return (
                    <tr key={download.url} className="asset-downloads__row--palette">
                      <th scope="row" data-label="Asset">
                        <span>{download.name}</span>
                        <small>{download.format}</small>
                      </th>
                      <td colSpan={4} data-label="Values">
                        <div className="asset-downloads__palette-grid">
                          {colours.map((colour) => (
                            <button
                              key={colour.hex}
                              className="asset-downloads__colour-chip"
                              type="button"
                              onClick={() => handleCopyColour(colour.hex)}
                              aria-label={`Copy ${colour.name} HEX value ${colour.hex}`}
                            >
                              <span
                                className="asset-downloads__swatch"
                                style={{ "--asset-colour": colour.hex }}
                                aria-hidden="true"
                              />
                              <span className="asset-downloads__colour-copy">
                                <span className="asset-downloads__colour-name">
                                  {colour.name}
                                </span>
                                <span className="asset-downloads__colour-hex">
                                  {copiedHex === colour.hex ? "Copied" : colour.hex}
                                </span>
                                {colour.pantone ? (
                                  <span className="asset-downloads__colour-pantone">
                                    {colour.pantone}
                                  </span>
                                ) : null}
                              </span>
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={download.url}
                    className={`asset-downloads__row--${download.kind}${
                      download.featured ? " asset-downloads__row--featured" : ""
                    }`}
                  >
                    <th scope="row" data-label="Asset">
                      <span>{download.name}</span>
                      <small>{download.format}</small>
                    </th>
                    <td data-label="Description">
                      <p>{download.description}</p>
                      <small>{download.usedIn}</small>
                    </td>
                    <td data-label="Source">{download.size}</td>
                    <td data-label="Updated">{download.updated}</td>
                    <td data-label="Action">
                      <a
                        className="asset-downloads__download"
                        href={download.url}
                        download={download.external ? undefined : true}
                        target={download.external ? "_blank" : undefined}
                        rel={download.external ? "noopener noreferrer" : undefined}
                      >
                        {download.actionLabel || (download.external ? "Open" : "Download")}
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </main>

      <footer className="site-footer">
        <span className="site-footer__year">ESTABLISHED 2026</span>
        <small className="site-footer__disclaimer">INTERNAL USE ONLY</small>
        <a
          className="site-footer__credit"
          href="https://www.forpeople.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          BY FORPEOPLE
        </a>
      </footer>
    </div>
  );
}
