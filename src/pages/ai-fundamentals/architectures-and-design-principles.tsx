import React from "react";
import Head from "@docusaurus/Head";
import ArchitectureLesson from "../../components/architecture-lesson";

export default function ArchitecturesAndDesignPrinciples() {
  return (
    <>
      <Head>
        <title>Architectures and Design Principles for Agentic AI Systems | Crotone Academia</title>
        <meta name="description" content="An interactive lesson that treats Agentic AI as a systems-architecture problem: components, reusable patterns and ten design principles." />
      </Head>
      <main className="lesson-app">
        <h1 className="lesson-sr-title">Architectures and Design Principles for Agentic AI Systems</h1>
        <ArchitectureLesson />
      </main>
    </>
  );
}
