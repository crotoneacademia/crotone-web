import React from "react";
import Link from "@docusaurus/Link";
import {
  Site,
  SectionHeader,
  Principles,
  Arrow,
  TAGLINE,
} from "../components/Site";
import ScientificVisual from "../components/ScientificVisual";
export default function Home() {
  return (
    <Site
      title="Crotone Academia"
      description="An independent initiative for learning, research and exploration across artificial intelligence, science and emerging technology."
    >
      <div className="container">
        <section className="home-hero">
          <div className="hero-copy">
            <p className="eyebrow red">{TAGLINE}</p>
            <h1>
              Knowledge at the
              <br className="desktop-break" /> intersection of
              <br className="desktop-break" /> <em>intelligence,</em>
              <br /> science and discovery.
            </h1>
            <p className="hero-description">
              An independent initiative for learning, research and
              <br className="desktop-break" /> exploration of foundational and
              emerging ideas.
            </p>
            <a className="button" href="#current-work">
              Explore our work <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="hero-art">
            <span className="art-coordinate eyebrow">
              FIG. 01 — CONNECTED IDEAS
            </span>
            <ScientificVisual />
            <div className="art-caption">
              <span>Intelligence. Matter. Information.</span>
              <span aria-hidden="true">[ ∞ ]</span>
            </div>
          </div>
        </section>
        <section id="current-work" className="work-section">
          <SectionHeader label="Current work" aside="Two active initiatives" />
          <div className="project-grid">
            <Link className="project-card" to="/ai-fundamentals">
              <div className="project-art ai-art">
                <div className="art-top">
                  <span>01 / EDUCATION</span>
                  <span className="status">
                    <i /> ONGOING
                  </span>
                </div>
                <ScientificVisual kind="network" />
                <span className="art-bottom">
                  FROM FOUNDATIONS TO INTELLIGENT SYSTEMS
                </span>
              </div>
              <div className="project-copy">
                <h3>
                  AI Fundamentals <Arrow />
                </h3>
                <p>
                  From the foundations of artificial intelligence to modern
                  language models and agentic systems.
                </p>
                <span className="text-link">
                  Explore AI Fundamentals <Arrow />
                </span>
              </div>
            </Link>
            <Link className="project-card" to="/research">
              <div className="project-art research-art">
                <div className="art-top">
                  <span>02 / RESEARCH</span>
                  <span className="status">EXPLORATORY</span>
                </div>
                <ScientificVisual kind="spacetime" />
                <span className="art-bottom">EXPLORING THE CONNECTIONS</span>
              </div>
              <div className="project-copy">
                <h3>
                  AI for Quantum–Relativity
                  <br /> Unification <Arrow />
                </h3>
                <p>
                  Exploring how AI and computational methods may help reveal
                  deeper connections between quantum theory and relativity.
                </p>
                <span className="text-link">
                  Explore the research <Arrow />
                </span>
              </div>
            </Link>
          </div>
        </section>
        <section className="philosophy-section">
          <SectionHeader
            label="A way of thinking"
            aside="Our guiding principles"
          />
          <Principles />
        </section>
        <section className="about-preview">
          <p className="eyebrow red">About Crotone Academia</p>
          <div>
            <h2>
              Deep ideas.
              <br />
              Open inquiry.
            </h2>
            <p>
              We aim to make foundational ideas accessible while creating space
              for open-ended scientific inquiry. A small, independent initiative
              with room for big questions.
            </p>
            <Link className="text-link" to="/about">
              Get to know Crotone Academia <Arrow />
            </Link>
          </div>
        </section>
      </div>
    </Site>
  );
}
