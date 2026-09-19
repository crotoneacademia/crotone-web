import React from "react";
import Head from "@docusaurus/Head";
import LessonDeck from "../../components/LessonDeck";

export default function TuringToAgenticAI() {
  return (
    <>
      <Head>
        <title>From Turing to Agentic AI | Crotone Academia</title>
        <meta name="description" content="An interactive visual lesson tracing the ideas, systems and infrastructure that converged to make Agentic AI possible." />
      </Head>
      <main className="lesson-app">
        <h1 className="lesson-sr-title">From Turing to Agentic AI</h1>
        <LessonDeck />
      </main>
    </>
  );
}
