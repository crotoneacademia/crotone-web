import React from "react";
import { Site } from "./Site";
import ScientificVisual from "./ScientificVisual";
export function Initiative({
  number,
  label,
  title,
  description,
  kind,
  children,
}: {
  number: string;
  label: string;
  title: string;
  description: string;
  kind: "network" | "spacetime";
  children: React.ReactNode;
}) {
  return (
    <Site title={title} description={description}>
      <div className="container">
        <section className="initiative-hero">
          <div>
            <p className="eyebrow red">
              {number} / {label}
            </p>
            <h1>{title}</h1>
            <p className="hero-description">{description}</p>
          </div>
          <div
            className={`initiative-art ${kind === "network" ? "ai-art" : "research-art"}`}
          >
            <ScientificVisual kind={kind} />
            <span className="eyebrow">Conceptual illustration</span>
          </div>
        </section>
        <article className="editorial-content">{children}</article>
      </div>
    </Site>
  );
}
const topics = [
  "Foundations & History of AI",
  "Intelligent Systems & Agents",
  "Neural Networks",
  "Backpropagation & Learning",
  "Deep Learning",
  "Attention & Transformers",
  "Large Language Models",
  "Generative AI",
  "Tool Use & Reasoning",
  "Agentic AI",
  "Multi-agent Systems",
  "AI Safety & Controls",
];
export function LearningJourney() {
  return (
    <ol className="learning-journey">
      {topics.map((topic, i) => (
        <li key={topic}>
          <span>{String(i + 1).padStart(2, "0")}</span>
          <h3>{topic}</h3>
          <span aria-hidden="true">↓</span>
        </li>
      ))}
    </ol>
  );
}
export function ResearchThemes() {
  return (
    <div className="theme-map">
      <div className="theme-center">
        One question.
        <br />
        <strong>Connected perspectives.</strong>
      </div>
      <ul>
        {[
          "Quantum states",
          "Quantum entanglement",
          "Relativity",
          "Spacetime",
          "Information",
          "Entropy",
          "Mathematical structures",
          "AI-assisted scientific discovery",
          "Computational modelling",
          "Simulation",
        ].map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
}
