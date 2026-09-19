import React from "react";
import Link from "@docusaurus/Link";
import {
  Site,
  Principles,
  SectionHeader,
  TAGLINE,
  Arrow,
} from "../components/Site";
export default function About() {
  return (
    <Site
      title="About"
      description="Crotone Academia is an independent initiative for learning, research and intellectual exploration."
    >
      <div className="container">
        <section className="about-hero">
          <p className="eyebrow red">{TAGLINE}</p>
          <h1>
            Curiosity is
            <br />
            our starting point.
          </h1>
          <p className="hero-description">About Crotone Academia</p>
        </section>
        <section className="content-section">
          <p className="eyebrow red">Our mission</p>
          <div>
            <h2>
              Build understanding.
              <br />
              Make space for discovery.
            </h2>
            <p>
              Crotone Academia is an independent initiative for learning,
              research and intellectual exploration across artificial
              intelligence, science and emerging technology.
            </p>
            <p>
              Our aim is to encourage deeper understanding—starting from
              foundations, questioning established assumptions and exploring new
              ideas across disciplinary boundaries.
            </p>
          </div>
        </section>
        <section className="philosophy-section">
          <SectionHeader label="Our principles" />
          <Principles />
        </section>
        <section className="content-section">
          <p className="eyebrow red">What we do</p>
          <div className="detail-grid">
            <div>
              <h2>Learning</h2>
              <p>
                Develop educational material that connects foundational ideas
                with modern developments.
              </p>
              <Link className="text-link" to="/ai-fundamentals">
                AI Fundamentals <Arrow />
              </Link>
            </div>
            <div>
              <h2>Research</h2>
              <p>
                Explore open scientific and technological questions using
                mathematical, computational and AI-assisted approaches.
              </p>
              <Link className="text-link" to="/research">
                Our research <Arrow />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Site>
  );
}
