import React from "react";
import { Initiative } from "../components/Initiative";
import Content from "../../content/research/overview.mdx";
export default function Research() {
  return (
    <Initiative
      number="02"
      label="Exploratory research"
      title="AI for Quantum–Relativity Unification"
      description="Exploring how artificial intelligence and computational methods may assist the search for deeper connections between quantum theory and relativity."
      kind="spacetime"
    >
      <Content />
    </Initiative>
  );
}
