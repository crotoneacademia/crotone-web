import React from "react";
import { Initiative } from "../components/Initiative";
import Content from "../../content/ai-fundamentals/overview.mdx";
export default function AI() {
  return (
    <Initiative
      number="01"
      label="Education · Ongoing"
      title="AI Fundamentals"
      description="From the foundations of artificial intelligence to modern language models and agentic systems."
      kind="network"
    >
      <Content />
    </Initiative>
  );
}
