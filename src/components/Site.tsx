import React, { useEffect, useState } from "react";
import Link from "@docusaurus/Link";
import Head from "@docusaurus/Head";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useLocation } from "@docusaurus/router";

// Original supplied logo, preserved without alteration.
export const BRAND_LOGO = "/img/brand/crotone-logo.png";
export const TAGLINE = "EXPLORE • QUESTION • UNDERSTAND";
export function Arrow({ external = false }: { external?: boolean }) {
  return <span aria-hidden="true">{external ? "↗" : "↗"}</span>;
}
export function Wordmark() {
  return (
    <Link to="/" className="wordmark" aria-label="Crotone Academia home">
      <img src={useBaseUrl(BRAND_LOGO)} alt="" width={58} height={55} />
      <span>
        CROTONE<span>ACADEMIA</span>
      </span>
    </Link>
  );
}
export function Site({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  return (
    <>
      <Head>
        <title>
          {title === "Crotone Academia" ? title : `${title} | Crotone Academia`}
        </title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
      </Head>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <Wordmark />
          <button
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="main-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? "Close −" : "Menu +"}
          </button>
          <nav
            id="main-navigation"
            className={open ? "navigation is-open" : "navigation"}
            aria-label="Main navigation"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
                document
                  .querySelector<HTMLButtonElement>(".menu-toggle")
                  ?.focus();
              }
            }}
          >
            {[
              ["AI Fundamentals", "/ai-fundamentals"],
              ["Research", "/research"],
              ["About", "/about"],
            ].map(([label, url]) => (
              <Link
                key={url}
                to={url}
                aria-current={
                  pathname.replace(/\/$/, "") === url ? "page" : undefined
                }
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="site-footer">
        <div className="container">
          <div className="footer-top">
            <Wordmark />
            <p className="eyebrow">{TAGLINE}</p>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Crotone Academia</span>
            <span>Independent inquiry. Open knowledge.</span>
            <a href="https://crotone.academy">
              crotone.academy <Arrow />
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
export function SectionHeader({
  label,
  aside,
}: {
  label: string;
  aside?: string;
}) {
  return (
    <div className="section-heading">
      <h2 className="eyebrow">{label}</h2>
      {aside && <span className="eyebrow muted">{aside}</span>}
    </div>
  );
}
export function Principles() {
  return (
    <div className="principles">
      {[
        [
          "01",
          "Explore",
          "Follow curiosity beyond established boundaries. Find connections across disciplines.",
        ],
        [
          "02",
          "Question",
          "Challenge assumptions. Ask deeper questions and stay open to new perspectives.",
        ],
        [
          "03",
          "Understand",
          "Build knowledge from foundations. Seek understanding beyond the surface.",
        ],
      ].map(([n, title, text]) => (
        <div className="principle" key={n}>
          <span className="principle-symbol" aria-hidden="true">
            {n === "01" ? "↗" : n === "02" ? "＋" : "◎"}
          </span>
          <h3>{title}</h3>
          <p>{text}</p>
        </div>
      ))}
    </div>
  );
}
