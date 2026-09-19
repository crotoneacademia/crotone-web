import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";

type Phase =
  | "turing"
  | "symbolic"
  | "learning"
  | "agents"
  | "llms"
  | "cloud"
  | "agentic";

type Slide = {
  phase: Phase;
  eyebrow: string;
  content: React.ReactNode;
};

const phaseLabels: Record<Phase, string> = {
  turing: "The question",
  symbolic: "Program intelligence",
  learning: "Learn intelligence",
  agents: "Agents",
  llms: "Transformers",
  cloud: "Software + cloud",
  agentic: "Agentic AI",
};

const deepDives: Record<
  string,
  { title: string; kicker: string; content: React.ReactNode; source?: [string, string] }
> = {
  turing: {
    kicker: "1950 · The imitation game",
    title: "Turing changed the question.",
    content: (
      <>
        <p>
          Rather than trying to define the words <em>machine</em> and <em>think</em>,
          Turing proposed an operational test: can an interrogator distinguish a
          machine from a human through a text conversation?
        </p>
        <div className="lesson-callout">
          <strong>The enduring move</strong>
          Judge intelligence through observable behaviour, while remaining careful
          not to confuse a successful imitation with a complete theory of mind.
        </div>
      </>
    ),
    source: [
      "Read the original paper",
      "https://academic.oup.com/mind/article/LIX/236/433/986238",
    ],
  },
  symbolic: {
    kicker: "1956–1990s · Explicit knowledge",
    title: "Intelligence as rules, search and plans.",
    content: (
      <>
        <p>
          Early AI represented a world as states, encoded legal actions, and
          searched for a path to a goal. Expert systems later separated domain
          knowledge from an inference engine using explicit IF–THEN rules.
        </p>
        <ul>
          <li><strong>Strength:</strong> inspectable reasoning in a defined domain.</li>
          <li><strong>Limit:</strong> expensive knowledge capture and brittle boundaries.</li>
          <li><strong>Legacy:</strong> goals, state, planning and action remain central.</li>
        </ul>
      </>
    ),
  },
  learning: {
    kicker: "1943–2012 · Learned representations",
    title: "Instead of writing the rules, adjust the weights.",
    content: (
      <>
        <p>
          The perceptron learned a decision boundary from examples. Multi-layer
          networks, trained with backpropagation, could construct useful internal
          representations rather than operating directly from raw input to output.
        </p>
        <div className="lesson-equation">error → gradients → weight updates</div>
        <p>
          The later acceleration came from the combination of better algorithms,
          large datasets, parallel compute and deeper architectures.
        </p>
      </>
    ),
    source: [
      "Read the 1986 backpropagation paper",
      "https://www.nature.com/articles/323533a0",
    ],
  },
  agents: {
    kicker: "1990s · Situated intelligence",
    title: "An agent is more than a predictive model.",
    content: (
      <>
        <p>
          An agent is situated in an environment. It perceives, maintains relevant
          state, chooses actions and acts toward goals. Classical descriptions
          emphasise autonomy, reactivity, pro-activeness and social ability.
        </p>
        <div className="lesson-callout">
          A language model can be one reasoning component inside an agent. The
          architecture still needs goals, state, action interfaces and control.
        </div>
      </>
    ),
  },
  transformer: {
    kicker: "2017 · Attention is all you need",
    title: "Every token can look at the relevant context.",
    content: (
      <>
        <p>
          Each token produces Query, Key and Value vectors. Query–Key similarity
          gives attention weights; a weighted combination of Values produces a
          context-sensitive representation.
        </p>
        <div className="lesson-equation">Attention(Q,K,V) = softmax(QKᵀ / √dₖ)V</div>
        <p>
          Removing recurrence from the core architecture also made training far
          more parallelisable.
        </p>
      </>
    ),
    source: ["Read the paper", "https://arxiv.org/abs/1706.03762"],
  },
  cloud: {
    kicker: "A parallel history",
    title: "The digital world became programmable.",
    content: (
      <>
        <p>
          The Web created a shared information layer. APIs made capabilities
          callable. Cloud platforms made compute, storage, identity, events and
          observability available as software-defined services.
        </p>
        <div className="lesson-callout">
          For an agent, an API is an actuator: a small, permissioned vocabulary of
          actions over a much more complex system.
        </div>
      </>
    ),
  },
  harness: {
    kicker: "Production engineering",
    title: "The harness turns capability into behaviour.",
    content: (
      <div className="lesson-detail-grid">
        {[
          ["Context", "Instructions, retrieved knowledge and task state."],
          ["Control", "Routing, loops, stopping rules and retries."],
          ["Tools", "Schemas, API clients, permissions and credentials."],
          ["Memory", "Session state and durable stores."],
          ["Safety", "Policy checks, sandboxes and human approvals."],
          ["Operations", "Tracing, evaluation, cost, latency and audit evidence."],
        ].map(([title, text]) => (
          <div key={title}><strong>{title}</strong><span>{text}</span></div>
        ))}
      </div>
    ),
  },
};

function Flow({ items, loop = false }: { items: string[]; loop?: boolean }) {
  return (
    <div className={`lesson-flow ${loop ? "is-loop" : ""}`}>
      {items.map((item, index) => (
        <React.Fragment key={item}>
          <span className={index === 0 ? "is-accent" : ""}>{item}</span>
          {index < items.length - 1 && <i aria-hidden="true">→</i>}
        </React.Fragment>
      ))}
      {loop && <i className="loop-arrow" aria-hidden="true">↺</i>}
    </div>
  );
}

function CardGrid({ items }: { items: [string, string][] }) {
  return (
    <div className="lesson-card-grid">
      {items.map(([title, text], index) => (
        <article key={title} style={{ "--order": index } as React.CSSProperties}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <h3>{title}</h3>
          <p>{text}</p>
        </article>
      ))}
    </div>
  );
}

function Timeline({
  items,
  onOpen,
  autoPlay = false,
}: {
  items: [string, string, string][];
  onOpen?: () => void;
  autoPlay?: boolean;
}) {
  const [selected, setSelected] = useState(0);
  useEffect(() => {
    if (!autoPlay) return;
    const timer = window.setInterval(() => setSelected((current) => (current + 1) % items.length), 4200);
    return () => window.clearInterval(timer);
  }, [autoPlay, items.length]);
  const illustration = ["corpus", "scale", "context", "instruction"][selected];
  return (
    <div className="lesson-timeline">
      <div className="timeline-track" role="tablist" aria-label="Historical milestones">
        {items.map(([date, title], index) => (
          <button
            role="tab"
            aria-selected={selected === index}
            key={date}
            onClick={() => setSelected(index)}
          >
            <i aria-hidden="true" />
            <span>{date}</span>
            <strong>{title}</strong>
          </button>
        ))}
      </div>
      <div className="timeline-note" role="tabpanel">
        <div className={`timeline-illustration is-${illustration}`} aria-hidden="true"><i /><i /><i /><b /></div>
        <span>{items[selected][0]}</span>
        <p>{items[selected][2]}</p>
        {onOpen && <button onClick={onOpen}>Explore this stream <span aria-hidden="true">↗</span></button>}
      </div>
    </div>
  );
}

function AttentionDemo() {
  const words = ["The", "rover", "avoided", "the", "rock", "because", "it", "was", "large."];
  const [focus, setFocus] = useState(6);
  const related: Record<number, number[]> = { 1: [0, 2], 2: [1, 4], 4: [2, 6, 8], 6: [1, 4, 8], 8: [4, 6] };
  const links = related[focus] ?? [];
  const position = (index: number) => 70 + (index * 108);
  return (
    <div className="attention-demo">
      <p>Select a token. Its <strong>query</strong> highlights the context tokens whose values it will combine.</p>
      <div className="attention-stage">
        <svg className="attention-links" viewBox="0 0 1000 250" aria-hidden="true">
          <defs><linearGradient id="attention-gradient" x1="0" x2="1"><stop stopColor="#5ac7d8" /><stop offset="1" stopColor="#e55d58" /></linearGradient></defs>
          {links.map((target, index) => <path key={target} className={`attention-link link-${index}`} d={`M ${position(focus)} 205 Q ${(position(focus) + position(target)) / 2} ${35 + (index * 20)} ${position(target)} 205`} />)}
          <circle className="attention-query-dot" cx={position(focus)} cy="205" r="7" />
        </svg>
        <div className="attention-words">
        {words.map((word, index) => (
          <button
            key={`${word}-${index}`}
            className={focus === index ? "is-focus" : links.includes(index) ? "is-related" : ""}
            onClick={() => setFocus(index)}
            style={{ left: `${6 + ((index / (words.length - 1)) * 88)}%` }}
          >
            {word}
          </button>
        ))}
        </div>
      </div>
      <div className="attention-reading">
        <span>Query: <b>{words[focus]}</b></span>
        <i aria-hidden="true">⊕</i>
        <span>Values from: <b>{links.map((index) => words[index]).join(" · ") || "nearby context"}</b></span>
        <i aria-hidden="true">→</i>
        <strong>context-aware representation</strong>
      </div>
    </div>
  );
}

function AgentLoop() {
  const steps = ["Goal", "Observe", "Reason", "Use tool", "Read result", "Decide"];
  const descriptions = [
    "Define the outcome and constraints.",
    "Collect the current state of the task.",
    "Choose a useful next action.",
    "Call a permissioned capability.",
    "Bring the environment's response back.",
    "Stop when complete—or begin another cycle.",
  ];
  const [step, setStep] = useState(0);
  const [autoRun, setAutoRun] = useState(true);
  const example = [
    "Find a 30-minute slot with Priya this week.",
    "Read both calendars and the meeting constraints.",
    "Tuesday 10:30 is the earliest shared working-hours slot.",
    "Call calendar.create_event with that candidate time.",
    "The calendar confirms the event and returns its ID.",
    "Report the confirmed invite, then stop the loop.",
  ];
  useEffect(() => {
    if (!autoRun) return;
    const timer = window.setTimeout(() => {
      setStep((current) => {
        if (current >= steps.length - 1) { setAutoRun(false); return current; }
        return current + 1;
      });
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [autoRun, step, steps.length]);
  return (
    <div className="agent-loop-demo">
      <div className="agent-orbit" aria-label={`Agent loop step ${step + 1}: ${steps[step]}`}>
        <div><span>{String(step + 1).padStart(2, "0")}</span><strong>{steps[step]}</strong></div>
        {steps.map((label, index) => (
          <button
            key={label}
            className={step === index ? "is-active" : ""}
            onClick={() => { setAutoRun(false); setStep(index); }}
            aria-label={`Show ${label} step`}
            style={{ "--step": index } as React.CSSProperties}
          >
            {index + 1}
          </button>
        ))}
      </div>
      <div className="agent-loop-copy">
        <span className="lesson-label">Step {step + 1} of {steps.length}</span>
        <h3>{steps[step]}</h3>
        <p>{descriptions[step]}</p>
        <div className="agent-loop-example"><span>Example task</span><strong>{example[step]}</strong></div>
        <button onClick={() => { if (step === steps.length - 1) { setStep(0); setAutoRun(true); } else { setAutoRun(false); setStep((step + 1) % steps.length); } }}>
          {step === steps.length - 1 ? "Replay one cycle" : "Advance example"} <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}

function KnowledgeCheck() {
  const [choice, setChoice] = useState<number | null>(null);
  const answers = [
    "A large language model with a detailed prompt",
    "A model connected to goals, state, tools, controls and an environment",
    "Any autonomous software that runs without a person",
  ];
  return (
    <div className="knowledge-check">
      <p className="lesson-label">Quick check</p>
      <h2>Which description best captures an operational AI agent?</h2>
      <div>
        {answers.map((answer, index) => (
          <button
            key={answer}
            className={choice === index ? (index === 1 ? "is-correct" : "is-wrong") : ""}
            onClick={() => setChoice(index)}
          >
            <span>{String.fromCharCode(65 + index)}</span>{answer}
          </button>
        ))}
      </div>
      {choice !== null && (
        <p className="check-feedback" aria-live="polite">
          {choice === 1
            ? "Exactly. The model supplies capability; the surrounding system supplies agency and operational control."
            : "Not quite. Capability or autonomy alone does not define the whole agent architecture. Try the middle answer."}
        </p>
      )}
    </div>
  );
}

function CinematicFigure({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  return (
    <figure className="lesson-cinematic-figure">
      <img src={src} alt={alt} />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

function LectureScene({
  number,
  title,
  intro,
  points,
  takeaway,
  children,
  wide = false,
}: {
  number: string;
  title: React.ReactNode;
  intro: string;
  points: string[];
  takeaway: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`lecture-scene ${wide ? "is-wide" : ""}`}>
      <header className="lecture-heading">
        <span className="lesson-index">{number}</span>
        <div>
          <h2>{title}</h2>
          <p>{intro}</p>
        </div>
      </header>
      <div className="lecture-body">
        <div className="lecture-visual">{children}</div>
        <aside className="lecture-notes">
          <span className="lesson-label">What to understand</span>
          <ul>
            {points.map((point) => <li key={point}>{point}</li>)}
          </ul>
          <div><span>Key idea</span><strong>{takeaway}</strong></div>
        </aside>
      </div>
    </div>
  );
}

function SymbolicSystemDiagram() {
  return (
    <div className="symbolic-flow" aria-label="Observed facts and expert rules feed an inference engine which produces a traceable recommendation">
      <svg viewBox="0 0 1000 390" role="img" aria-label="Observed facts and expert rules flow through an inference engine to produce an explainable recommendation.">
        <defs><marker id="symbolic-arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="#d95650" /></marker></defs>
        <g className="symbolic-links"><path d="M272 110 C382 110 390 164 468 182" markerEnd="url(#symbolic-arrow)" /><path d="M272 280 C382 280 390 226 468 208" markerEnd="url(#symbolic-arrow)" /><path d="M656 195 L760 195" markerEnd="url(#symbolic-arrow)" /></g>
        <g className="symbolic-node facts"><rect x="50" y="47" width="222" height="126" rx="14" /><text className="flow-kicker" x="76" y="81">OBSERVED FACTS</text><text className="flow-title" x="76" y="117">temperature = 39°C</text><text className="flow-body" x="76" y="145">culture = positive</text></g>
        <g className="symbolic-node rules"><rect x="50" y="217" width="222" height="126" rx="14" /><text className="flow-kicker" x="76" y="251">EXPERT RULES</text><text className="flow-title" x="76" y="287">IF evidence A + B</text><text className="flow-body" x="76" y="315">THEN consider C</text></g>
        <g className="symbolic-engine-node"><path d="M500 88 L625 88 L685 195 L625 302 L500 302 L440 195 Z" /><text className="flow-kicker" x="562" y="159" textAnchor="middle">INFERENCE ENGINE</text><text className="flow-title" x="562" y="193" textAnchor="middle">Match → fire</text><text className="flow-body" x="562" y="221" textAnchor="middle">rules → explain</text></g>
        <g className="symbolic-node recommendation"><rect x="760" y="122" width="195" height="146" rx="14" /><text className="flow-kicker" x="786" y="158">RECOMMENDATION</text><text className="flow-title" x="786" y="197">Consider C</text><text className="flow-body" x="786" y="228">traceable decision</text></g>
      </svg>
    </div>
  );
}

function NeuralLearningDiagram() {
  const inputY = [118, 202, 286];
  const hiddenY = [78, 160, 242, 324];
  return (
    <div className="neural-learning" aria-label="A multi-layer neural network learns by sending predictions forward and error gradients backward">
      <div className="neural-caption"><span>Forward pass</span><strong>weighted connections transform features into a prediction</strong></div>
      <svg className="neural-network-svg" viewBox="0 0 1000 425" role="img" aria-label="Three input neurons connect to four hidden neurons, which connect to one predicted output. Dashed arrows indicate backpropagation in the reverse direction.">
        <defs>
          <marker id="neural-forward" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#d95650" /></marker>
          <marker id="neural-back" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M8,0 L0,4 L8,8 Z" fill="#df918c" /></marker>
        </defs>
        <g className="network-layer-labels"><text x="180" y="34" textAnchor="middle">INPUT LAYER</text><text x="510" y="34" textAnchor="middle">HIDDEN LAYER</text><text x="820" y="34" textAnchor="middle">OUTPUT</text></g>
        <g className="network-connections" aria-hidden="true">
          {inputY.flatMap((from) => hiddenY.map((to) => <line key={`${from}-${to}`} className={(from === 286 && (to === 78 || to === 324)) || (from === 202 && to === 160) ? "weighted" : ""} x1="211" y1={from} x2="480" y2={to} />))}
          {hiddenY.map((from) => <line key={from} className={from === 242 ? "weighted" : ""} x1="540" y1={from} x2="787" y2="202" />)}
        </g>
        <g className="network-weight-labels"><text x="336" y="168">w₃₁ = +0.82</text><text x="337" y="230">w₂₂ = +0.64</text><text x="656" y="215">w₃ŷ = +0.91</text></g>
        <g className="network-backprop" aria-hidden="true"><path d="M780 358 C650 390 410 390 235 358" markerEnd="url(#neural-back)" /></g>
        <g className="network-nodes">
          {inputY.map((y, index) => <g key={y}><circle cx="180" cy={y} r="31" /><text x="180" y={y + 6} textAnchor="middle">x{index + 1}</text></g>)}
          {hiddenY.map((y, index) => <g key={y}><circle cx="510" cy={y} r="31" /><text x="510" y={y + 6} textAnchor="middle">h{index + 1}</text></g>)}
          <g className="prediction"><circle cx="820" cy="202" r="42" /><text x="820" y="209" textAnchor="middle">ŷ</text></g>
        </g>
        <g className="network-annotations"><text x="510" y="405" textAnchor="middle">BACKPROPAGATION · loss gradients update every weight</text></g>
      </svg>
      <div className="learning-steps">
        <span><b>1</b>Predict</span><span><b>2</b>Measure loss</span><span><b>3</b>Backpropagate</span><span><b>4</b>Update weights</span>
      </div>
    </div>
  );
}

function AgentArchitectureDiagram() {
  return (
    <div className="agent-flow" aria-label="An agent observes an environment, updates state, plans toward a goal, acts, and receives a new observation">
      <svg viewBox="0 0 1100 445" role="img" aria-label="Connected agent loop from environment through observation, state, goal and planning to action, returning to the environment.">
        <defs><marker id="agent-arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="#5ac7d8" /></marker></defs>
        <g className="agent-flow-links"><path d="M268 222 L344 222" markerEnd="url(#agent-arrow)" /><path d="M512 222 L588 222" markerEnd="url(#agent-arrow)" /><path d="M756 222 L830 222" markerEnd="url(#agent-arrow)" /><path className="agent-return" d="M910 310 C800 416 297 416 178 310" markerEnd="url(#agent-arrow)" /></g>
        <g className="agent-environment-node"><path d="M66 132 C75 81 155 72 190 118 C242 109 274 151 258 195 C291 239 253 291 205 283 C166 329 88 308 90 264 C43 249 34 177 66 132 Z" /><text className="flow-kicker" x="162" y="187" textAnchor="middle">ENVIRONMENT</text><text className="flow-title" x="162" y="219" textAnchor="middle">World / software</text><text className="flow-body" x="162" y="246" textAnchor="middle">people · data · tools</text></g>
        <g className="agent-core-node"><circle cx="430" cy="222" r="92" /><text className="flow-kicker" x="430" y="192" textAnchor="middle">AGENT STATE</text><text className="flow-title" x="430" y="226" textAnchor="middle">Observe</text><text className="flow-body" x="430" y="253" textAnchor="middle">what is true now?</text></g>
        <g className="agent-goal-node"><path d="M625 135 H715 L752 222 L715 309 H625 L588 222 Z" /><text className="flow-kicker" x="670" y="191" textAnchor="middle">OBJECTIVE</text><text className="flow-title" x="670" y="226" textAnchor="middle">Goal</text><text className="flow-body" x="670" y="253" textAnchor="middle">what outcome?</text></g>
        <g className="agent-plan-node"><rect x="830" y="132" width="200" height="180" rx="18" /><path d="M870 192 H990 M870 222 H956 M870 252 H918" /><text className="flow-kicker" x="930" y="166" textAnchor="middle">POLICY / PLAN</text><text className="flow-title" x="930" y="289" textAnchor="middle">Choose action</text></g>
        <text className="agent-observation-label" x="306" y="196" textAnchor="middle">observation</text><text className="agent-action-label" x="791" y="196" textAnchor="middle">action</text><text className="agent-loop-label" x="544" y="408" textAnchor="middle">THE ACTION CHANGES THE ENVIRONMENT → NEW OBSERVATION</text>
      </svg>
    </div>
  );
}

function ToolBoundaryDiagram() {
  return (
    <div className="tool-flow" aria-label="A language model proposes a structured tool call which software validates before an API executes it and returns an observation">
      <svg viewBox="0 0 1120 425" role="img" aria-label="Foundation model proposes a structured tool call. A policy gate validates it before an API executes it and returns an observation back to the model.">
        <defs>
          <marker id="tool-arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="#d95650" /></marker>
          <marker id="tool-return" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M9,0 L0,4.5 L9,9 Z" fill="#dfa09b" /></marker>
        </defs>
        <g className="tool-flow-links"><path d="M260 189 L350 189" markerEnd="url(#tool-arrow)" /><path d="M576 189 L658 189" markerEnd="url(#tool-arrow)" /><path d="M865 189 L942 189" markerEnd="url(#tool-arrow)" /><path className="tool-return" d="M1005 313 C825 391 315 391 143 313" markerEnd="url(#tool-return)" /></g>
        <g className="tool-flow-model"><circle cx="145" cy="189" r="109" /><circle cx="145" cy="156" r="19" /><path d="M109 220 C118 181 172 181 181 220" /><text className="flow-kicker" x="145" y="257" textAnchor="middle">PROBABILISTIC</text><text className="flow-title" x="145" y="285" textAnchor="middle">Foundation model</text></g>
        <g className="tool-flow-contract"><path d="M368 71 H554 L576 93 V307 H368 Z" /><path d="M554 71 V96 H576" /><text className="flow-kicker" x="398" y="122">STRUCTURED CONTRACT</text><text className="flow-title" x="398" y="162">tool call</text><text className="flow-code" x="398" y="202">send_email(</text><text className="flow-code" x="414" y="229">to: "…"</text><text className="flow-code" x="398" y="256">)</text></g>
        <g className="tool-flow-policy"><path d="M762 65 L850 100 V190 C850 252 812 292 762 318 C712 292 674 252 674 190 V100 Z" /><text className="flow-kicker" x="762" y="145" textAnchor="middle">DETERMINISTIC GATE</text><text className="flow-title" x="762" y="184" textAnchor="middle">Validate + authorise</text><text className="flow-body" x="762" y="215" textAnchor="middle">schema · policy · approval</text><text className="flow-body" x="762" y="239" textAnchor="middle">identity · audit</text></g>
        <g className="tool-flow-api"><rect x="950" y="107" width="135" height="165" rx="40" /><path d="M991 166 H1044 M991 190 H1044 M991 214 H1025" /><text className="flow-kicker" x="1018" y="242" textAnchor="middle">ENVIRONMENT</text><text className="flow-title" x="1018" y="267" textAnchor="middle">API</text></g>
        <text className="tool-return-label" x="575" y="385" textAnchor="middle">OBSERVATION RETURNS TO THE AGENT’S NEXT DECISION</text>
      </svg>
    </div>
  );
}

function HarnessArchitecture() {
  return (
    <div className="harness-flow" aria-label="A foundation model is orchestrated through context and tools, constrained by controls, and monitored by operational evidence">
      <svg viewBox="0 0 1100 470" role="img" aria-label="Agent harness architecture. A foundation model connects to orchestration, context and tools, control gates, and an operational evidence layer.">
        <defs><marker id="harness-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#d95650" /></marker></defs>
        <g className="harness-links"><path d="M540 180 L540 116" markerEnd="url(#harness-arrow)" /><path d="M376 235 L258 235" markerEnd="url(#harness-arrow)" /><path d="M704 235 L842 235" markerEnd="url(#harness-arrow)" /><path d="M540 324 L540 380" markerEnd="url(#harness-arrow)" /></g>
        <g className="harness-node orchestration"><rect x="332" y="35" width="416" height="84" rx="16" /><text className="flow-kicker" x="364" y="69">ORCHESTRATION</text><text className="flow-body" x="364" y="99">goal → planner → loop → router → stop rules</text></g>
        <g className="harness-node context"><rect x="45" y="161" width="215" height="148" rx="16" /><text className="flow-kicker" x="73" y="199">CONTEXT + CAPABILITIES</text><text className="flow-body" x="73" y="232">retrieval · memory</text><text className="flow-body" x="73" y="261">tools · durable state</text></g>
        <g className="harness-model-node"><circle cx="540" cy="252" r="94" /><text className="flow-kicker" x="540" y="215" textAnchor="middle">REASONING ENGINE</text><text className="flow-title" x="540" y="246" textAnchor="middle">Foundation</text><text className="flow-title" x="540" y="273" textAnchor="middle">model</text><text className="flow-body" x="540" y="299" textAnchor="middle">language · perception</text><text className="flow-body" x="540" y="319" textAnchor="middle">decision support</text></g>
        <g className="harness-node controls"><path d="M866 145 L1035 145 L1065 180 V291 L1035 326 H866 L836 291 V180 Z" /><text className="flow-kicker" x="950" y="195" textAnchor="middle">CONTROL PLANE</text><text className="flow-body" x="950" y="228" textAnchor="middle">identity · policy</text><text className="flow-body" x="950" y="256" textAnchor="middle">approval · sandbox</text></g>
        <g className="harness-node operations"><rect x="205" y="370" width="670" height="82" rx="14" /><text className="flow-kicker" x="235" y="405">OPERATIONAL EVIDENCE</text><text className="flow-body" x="510" y="399">logs · traces · evaluation</text><text className="flow-body" x="510" y="427">cost · latency · audit</text></g>
      </svg>
    </div>
  );
}

function AgenticBoundaryDiagram() {
  return <div className="agentic-boundary-flow" aria-label="An AI agent sits inside a wider agentic AI system">
    <svg viewBox="0 0 1050 305" role="img" aria-label="A goal-directed AI agent is embedded in a wider agentic system of software, controls, data, and people.">
      <defs><marker id="boundary-arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="#d95650" /></marker></defs>
      <rect className="boundary-system" x="35" y="30" width="980" height="240" rx="22" /><text className="flow-kicker" x="72" y="68">AGENTIC AI SYSTEM</text>
      <path className="boundary-link" d="M390 153 L532 153" markerEnd="url(#boundary-arrow)" />
      <g className="boundary-agent"><circle cx="280" cy="153" r="86" /><text className="flow-kicker" x="280" y="130" textAnchor="middle">AI AGENT</text><text className="flow-title" x="280" y="160" textAnchor="middle">Observe · reason</text><text className="flow-body" x="280" y="187" textAnchor="middle">act · stop</text></g>
      <g className="boundary-system-parts"><rect x="558" y="92" width="124" height="124" rx="12" /><rect x="704" y="92" width="124" height="124" rx="12" /><rect x="850" y="92" width="124" height="124" rx="12" /><text className="flow-kicker" x="620" y="130" textAnchor="middle">SOFTWARE</text><text className="flow-body" x="620" y="164" textAnchor="middle">APIs · data</text><text className="flow-kicker" x="766" y="130" textAnchor="middle">CONTROLS</text><text className="flow-body" x="766" y="164" textAnchor="middle">policy · audit</text><text className="flow-kicker" x="912" y="130" textAnchor="middle">PEOPLE</text><text className="flow-body" x="912" y="164" textAnchor="middle">approval · review</text></g>
    </svg>
  </div>;
}

function ConvergenceDiagram() {
  return <div className="convergence-flow" aria-label="Three histories converge to form Agentic AI">
    <svg viewBox="0 0 1080 420" role="img" aria-label="Architecture of action, learned capability, and operational environment converge into agentic AI.">
      <defs><marker id="convergence-arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#d95650" /></marker></defs>
      <g className="convergence-links"><path d="M255 180 C330 180 350 284 450 305" markerEnd="url(#convergence-arrow)" /><path d="M540 180 L540 283" markerEnd="url(#convergence-arrow)" /><path d="M825 180 C750 180 730 284 630 305" markerEnd="url(#convergence-arrow)" /></g>
      <g className="convergence-source action"><rect x="40" y="42" width="215" height="138" rx="16" /><text className="flow-kicker" x="68" y="80">01 · ARCHITECTURE</text><text className="flow-title" x="68" y="116">Goals + plans</text><text className="flow-body" x="68" y="148">state · search · action</text></g>
      <g className="convergence-source learning"><rect x="432" y="42" width="215" height="138" rx="16" /><text className="flow-kicker" x="460" y="80">02 · LEARNING</text><text className="flow-title" x="460" y="116">Foundation models</text><text className="flow-body" x="460" y="148">language · perception</text></g>
      <g className="convergence-source software"><rect x="825" y="42" width="215" height="138" rx="16" /><text className="flow-kicker" x="853" y="80">03 · SOFTWARE</text><text className="flow-title" x="853" y="116">Programmable world</text><text className="flow-body" x="853" y="148">APIs · data · identity</text></g>
      <g className="convergence-result"><path d="M415 296 H665 L720 352 L665 408 H415 L360 352 Z" /><text x="540" y="347" textAnchor="middle">AGENTIC AI</text><text x="540" y="376" textAnchor="middle">reason + act + observe + control</text></g>
    </svg>
  </div>;
}

export default function LessonDeck() {
  const [current, setCurrent] = useState(0);
  const [detail, setDetail] = useState<string | null>(null);
  const [isPresenting, setIsPresenting] = useState(false);
  const deckRef = useRef<HTMLElement>(null);
  const lessonAsset = useBaseUrl("img/lessons/");

  const slides = useMemo<Slide[]>(() => [
    {
      phase: "turing",
      eyebrow: "Lesson 01 · The starting question",
      content: (
        <LectureScene
          number="01"
          title={<>A conversation from <em>1950</em> sounds unexpectedly modern.</>}
          intro="Turing used short exchanges like these to make a philosophical question testable: judge the machine through its observable behaviour in conversation."
          points={[
            "The exchange is not from a modern chatbot—it appears in Turing’s 1950 paper.",
            "The imitation game avoids having to define consciousness or thought directly.",
            "It establishes a recurring AI question: which behaviour should count as intelligence?",
          ]}
          takeaway="Turing transformed “Can machines think?” into an operational experiment."
        >
          <div className="lesson-chat-window" aria-label="Turing's specimen dialogue shown as a chat application">
            <div className="chat-window-header"><span><i /><i /><i /></span><strong>Imitation game</strong><small>text-only channel · 1950</small></div>
            <div className="lesson-chat lecture-chat">
              <p className="from-human">Please write me a sonnet on the subject of the Forth Bridge.</p>
              <p className="from-machine">Count me out on this one. I never could write poetry.</p>
              <p className="from-human">Add 34,957 to 70,764.</p>
              <p className="from-machine">105,621.</p>
              <p className="from-human">Do you play chess?</p>
              <p className="from-machine">Yes.</p>
              <div className="dialogue-analysis"><span>language</span><span>calculation</span><span>world knowledge</span><span>deception?</span></div>
            </div>
            <div className="chat-window-input"><span>Message participant…</span><b>↑</b></div>
          </div>
        </LectureScene>
      ),
    },
    {
      phase: "turing",
      eyebrow: "1950 · Computing Machinery and Intelligence",
      content: (
        <LectureScene
          number="02"
          title={<>Turing changes the question.</>}
          intro="Instead of debating an invisible inner state, the imitation game asks whether a machine can participate convincingly in a text conversation."
          points={[
            "The test is behavioural: an interrogator sees only written responses.",
            "Turing also discusses learning machines, objections, and whether machines can surprise us.",
            "Modern chat systems make the setup familiar, but passing a conversation test is not a complete theory of intelligence.",
          ]}
          takeaway="Observable competence is useful evidence, but it does not settle every question about understanding."
        >
          <div className="turing-evidence">
            <CinematicFigure
              src={`${lessonAsset}alan-turing-1951.jpg`}
              alt="Portrait of Alan Turing"
              caption="Alan Turing, 1951 · Wikimedia Commons"
            />
            <div className="imitation-diagram"><span>Human judge</span><div><b>A</b><small>hidden participant</small></div><div><b>B</b><small>hidden participant</small></div><strong>Which is the machine?</strong></div>
          </div>
          <button className="lesson-action" onClick={() => setDetail("turing")}>Read the deeper context <span>↗</span></button>
        </LectureScene>
      ),
    },
    {
      phase: "symbolic",
      eyebrow: "Stream 01 · Program the intelligence",
      content: (
        <LectureScene
          number="03"
          title={<>Early AI made reasoning <em>explicit</em>.</>}
          intro="Researchers represented knowledge using symbols and rules, then built procedures that searched, inferred, and planned over those representations."
          points={[
            "Search explores possible states and actions until it reaches a goal.",
            "Planning adds preconditions and effects: what must be true before an action and what changes afterward.",
            "Expert systems separate a knowledge base from the engine that applies it.",
          ]}
          takeaway="Goals, state, rules and action sequences are old foundations of agentic systems."
        >
          <SymbolicSystemDiagram />
          <div className="case-strip"><span><b>1956</b>Dartmouth names the field</span><span><b>1966–72</b>Shakey plans and moves</span><span><b>1970s</b>MYCIN explains rule paths</span></div>
          <button className="lesson-action" onClick={() => setDetail("symbolic")}>Explore symbolic AI <span>↗</span></button>
        </LectureScene>
      ),
    },
    {
      phase: "symbolic",
      eyebrow: "Search and planning · Goal-directed computation",
      content: (
        <LectureScene
          number="04"
          title={<>A plan is a path through a <em>state space</em>.</>}
          intro="An intelligent system can model its current situation, enumerate legal actions, predict successor states, and search for a sequence that satisfies a goal."
          points={[
            "Breadth-first and depth-first search explore systematically but can become expensive.",
            "A* uses a heuristic—an estimate of remaining cost—to prioritise promising branches.",
            "STRIPS-style planning represents action preconditions and effects explicitly.",
          ]}
          takeaway="The system is not merely classifying input; it is constructing actions that change the world."
        >
          <div className="search-space-svg" aria-label="Annotated search tree from initial state to goal">
            <svg viewBox="0 0 900 390" role="img" aria-label="Search begins at an initial state, branches through possible actions, and follows a selected path to a goal">
              <defs><marker id="search-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#d95650" /></marker></defs>
              <g className="search-links"><path d="M160 182 L289 102" /><path d="M163 195 L287 195" /><path d="M160 208 L289 293" /><path d="M313 92 L492 67" /><path d="M312 99 L493 137" /><path d="M313 193 L492 172" className="pruned" /><path d="M312 198 L493 242" /><path d="M312 302 L493 323" className="pruned" /><path d="M518 66 L704 74" className="selected" markerEnd="url(#search-arrow)" /><path d="M518 137 L706 82" className="pruned" /><path d="M518 242 L709 91" className="pruned" /></g>
              <g className="search-nodes"><circle cx="140" cy="195" r="23" className="start" /><circle cx="300" cy="95" r="13" /><circle cx="300" cy="195" r="13" /><circle cx="300" cy="300" r="13" /><circle cx="505" cy="65" r="13" /><circle cx="505" cy="140" r="13" /><circle cx="505" cy="170" r="13" /><circle cx="505" cy="245" r="13" /><circle cx="505" cy="325" r="13" /><circle cx="730" cy="75" r="25" className="goal" /></g>
              <g className="search-labels"><text x="140" y="202" textAnchor="middle">S</text><text x="140" y="245" textAnchor="middle">initial state</text><text x="505" y="372" textAnchor="middle">candidate states</text><text x="730" y="82" textAnchor="middle">G</text><text x="730" y="125" textAnchor="middle">goal</text><text x="470" y="30">heuristic ranks promising branches</text></g>
            </svg>
            <div className="search-legend"><span>state</span><span>legal action</span><span>pruned path</span><span>selected plan</span></div>
          </div>
          <Flow items={["Represent state", "Generate actions", "Estimate cost", "Choose branch", "Reach goal"]} />
        </LectureScene>
      ),
    },
    {
      phase: "learning",
      eyebrow: "Stream 02 · Learn the intelligence",
      content: (
        <LectureScene
          number="05"
          title={<>Neural networks learn <em>representations</em> from examples.</>}
          intro="A perceptron adjusts weights to improve a prediction. Multi-layer networks extend the idea: hidden layers can learn intermediate features that designers did not explicitly encode."
          points={[
            "A neuron combines inputs using learned weights, adds a bias, then applies an activation.",
            "A forward pass produces a prediction; a loss measures its error.",
            "Backpropagation uses the chain rule to assign responsibility and update weights throughout the network.",
          ]}
          takeaway="Learning moves part of system design from hand-written rules into parameters shaped by data."
        >
          <NeuralLearningDiagram />
          <div className="lesson-equation">ŷ = f(Wx + b) · minimise L(ŷ, y)</div>
          <button className="lesson-action" onClick={() => setDetail("learning")}>Explore the learning arc <span>↗</span></button>
        </LectureScene>
      ),
    },
    {
      phase: "learning",
      eyebrow: "2012 · The deep-learning inflection",
      content: (
        <LectureScene
          number="06"
          title={<>Why did neural networks suddenly <em>accelerate?</em></>}
          intro="The ideas were decades old. What changed was the surrounding engineering system: enough data, parallel compute, scalable optimisation, and architectures suited to different signals."
          points={[
            "GPUs made large matrix operations dramatically faster.",
            "Datasets such as ImageNet supplied millions of labelled examples.",
            "CNNs exploited spatial structure; recurrent models handled sequences; attention later improved long-range context.",
          ]}
          takeaway="Breakthroughs often come from systems convergence, not a single new algorithm."
        >
          <CardGrid items={[
            ["Compute", "GPUs turn weeks of serial work into massively parallel training."],
            ["Data", "Internet-scale datasets provide diverse statistical evidence."],
            ["Optimisation", "Better initialisation, activations and training recipes stabilise depth."],
            ["Architecture", "Model structure increasingly matches the structure of the problem."],
          ]} />
          <div className="inflection-line"><span>1958 · perceptron</span><span>1986 · backprop</span><span>2012 · AlexNet</span><span>2017 · Transformer</span></div>
        </LectureScene>
      ),
    },
    {
      phase: "agents",
      eyebrow: "Intelligent agents · Long before LLMs",
      content: (
        <LectureScene
          number="07"
          title={<>An agent is an actor inside an <em>environment</em>.</>}
          intro="Classical agent theory focuses on the loop between perception and action. An agent maintains enough state to choose what to do next in pursuit of a goal or utility."
          points={[
            "Reactive agents map the current observation directly to an action.",
            "Model-based agents maintain an internal description of what is not directly visible.",
            "Goal- and utility-based agents compare possible future states before choosing.",
          ]}
          takeaway="Agency is a systems property: model + state + objective + action + feedback."
        >
          <AgentArchitectureDiagram />
          <div className="agent-taxonomy"><span>Reactive<small>respond now</small></span><span>Model-based<small>remember state</small></span><span>Goal-based<small>plan ahead</small></span><span>Learning<small>improve from experience</small></span></div>
          <button className="lesson-action" onClick={() => setDetail("agents")}>Explore classical agent theory <span>↗</span></button>
        </LectureScene>
      ),
    },
    {
      phase: "agents",
      eyebrow: "Autonomy in the physical world",
      content: (
        <LectureScene
          number="08"
          title={<>Agents and autonomous systems have already <em>left the planet</em>.</>}
          intro="Space missions make the agent loop concrete: communication is delayed, the environment is uncertain, and local software must sense, decide, act, monitor, and recover."
          points={[
            "Deep Space 1’s Remote Agent planned, scheduled, executed and diagnosed onboard.",
            "Mars AutoNav builds terrain models and evaluates safe candidate paths locally.",
            "Webb uses autonomous control and fault protection—but that does not make it an LLM agent.",
          ]}
          takeaway="Autonomy predates generative AI; precise terminology helps us see what is genuinely new."
          wide
        >
          <div className="mission-gallery">
            <article><img src={`${lessonAsset}deep-space-1.jpg`} alt="NASA Deep Space 1 spacecraft" /><div><span>Deep Space 1 · 1999</span><h3>Plan + diagnose</h3><p>High-level goals become scheduled spacecraft activities.</p></div></article>
            <article><img src={`${lessonAsset}mars-autonav.jpg`} alt="NASA Mars rover autonomous navigation visualisation" /><div><span>Mars AutoNav</span><h3>Perceive + navigate</h3><p>Stereo imagery becomes terrain, hazards, and safe motion.</p></div></article>
            <article><img src={`${lessonAsset}james-webb-space-telescope.jpg`} alt="James Webb Space Telescope" /><div><span>James Webb</span><h3>Control + protect</h3><p>Autonomous safing protects a remote scientific instrument.</p></div></article>
          </div>
        </LectureScene>
      ),
    },
    {
      phase: "llms",
      eyebrow: "2017 · The Transformer",
      content: (
        <LectureScene
          number="09"
          title={<>Attention builds a representation from <em>relevant context</em>.</>}
          intro="Each token creates a query, key, and value. Query–key similarity becomes a set of weights; the weighted values produce a context-sensitive representation."
          points={[
            "A query asks what information the current token needs.",
            "Keys advertise what each token can contribute; values carry that information forward.",
            "Multiple heads can represent different relationships in parallel.",
          ]}
          takeaway="The same word can acquire a different representation depending on the words around it."
        >
          <AttentionDemo />
          <div className="attention-formula"><code>softmax(QKᵀ / √dₖ)V</code><span>compare → normalise → combine</span></div>
          <button className="lesson-action" onClick={() => setDetail("transformer")}>Open the Transformer explainer <span>↗</span></button>
        </LectureScene>
      ),
    },
    {
      phase: "llms",
      eyebrow: "Foundation models · A reusable capability layer",
      content: (
        <LectureScene
          number="10"
          title={<>Pretraining turns one model into a <em>general interface</em>.</>}
          intro="Large Transformers learn broad statistical representations from extensive corpora. Tasks can then be specified through prompts, examples, fine-tuning, or tool schemas instead of building a separate model from scratch."
          points={[
            "GPT-1 and BERT helped establish broad pretraining as a reusable strategy.",
            "GPT-3 demonstrated strong in-context learning from instructions and examples.",
            "Instruction tuning and human feedback made general models easier to direct conversationally.",
          ]}
          takeaway="Natural language becomes a programmable interface to a broad learned capability."
        >
          <Timeline autoPlay items={[
            ["2018", "Pretraining", "GPT-1 and BERT reuse learned language representations across tasks."],
            ["2019", "Scaling", "GPT-2 demonstrates stronger coherent generation and zero-shot behaviour."],
            ["2020", "In-context learning", "GPT-3 performs new tasks from instructions and examples in the prompt."],
            ["2022", "Instruction following", "Chat interfaces make model capability accessible to a much larger audience."],
          ]} />
          <div className="foundation-transfer"><span>Broad pretraining</span><i>→</i><b>one reusable model</b><i>→</i><span>many prompted tasks</span></div>
        </LectureScene>
      ),
    },
    {
      phase: "cloud",
      eyebrow: "Stream 03 · Software becomes an actionable environment",
      content: (
        <LectureScene
          number="11"
          title={<>The Web, APIs and cloud gave intelligence somewhere to <em>act</em>.</>}
          intro="A capable model alone cannot book a flight, query a private database, or send an email. Modern software exposes those capabilities through machine-readable interfaces and operates them at scale."
          points={[
            "APIs hide system complexity behind a small vocabulary of named operations.",
            "Cloud platforms make compute, storage, identity, queues and telemetry programmable.",
            "SaaS and digitised workflows create a rich environment of real actions and observations.",
          ]}
          takeaway="An API is an actuator: it lets a reasoning system change a digital environment."
        >
          <Timeline onOpen={() => setDetail("cloud")} items={[
            ["1989–90s", "Web", "Networked information becomes globally addressable."],
            ["1990s–2000s", "Web APIs", "Software capabilities become callable by other software."],
            ["2006", "Elastic cloud", "Compute and storage become on-demand services."],
            ["2010s→", "Platforms", "Identity, data, events and observability become composable infrastructure."],
          ]} />
          <div className="api-examples"><code>search_flights()</code><code>query_customer()</code><code>send_email()</code><code>request_approval()</code></div>
        </LectureScene>
      ),
    },
    {
      phase: "agentic",
      eyebrow: "From token prediction to tool use",
      content: (
        <LectureScene
          number="12"
          title={<>The model gets connected—but software keeps <em>control</em>.</>}
          intro="The model proposes a structured action. Deterministic software validates the schema, checks permission and policy, asks for approval when necessary, executes the API, and returns an observation."
          points={[
            "Retrieval adds current or private information to the model’s context.",
            "Structured outputs make a model decision consumable by ordinary code.",
            "The model does not literally send the payment or email; credentialed software executes it.",
          ]}
          takeaway="Separate probabilistic reasoning from deterministic execution and authorization."
        >
          <ToolBoundaryDiagram />
          <div className="control-legend"><span>model proposes</span><span>software validates</span><span>policy authorises</span><span>service executes</span></div>
        </LectureScene>
      ),
    },
    {
      phase: "agentic",
      eyebrow: "Multi-step work · Reason, act, observe",
      content: (
        <LectureScene
          number="13"
          title={<>The agent loop turns one decision into a <em>workflow</em>.</>}
          intro="Real goals require several dependent actions. After every tool call, the environment changes. The system brings the result back into context, updates task state, and chooses whether to continue or stop."
          points={[
            "A goal and explicit success condition define what completion means.",
            "Observations prevent the agent from assuming that an action succeeded.",
            "Maximum steps, timeouts, retries and approval gates keep the loop bounded.",
          ]}
          takeaway="An agent is not a single model response; it is a controlled feedback process."
        >
          <AgentLoop />
          <div className="loop-guardrails"><span>max 12 steps</span><span>tool allow-list</span><span>argument validation</span><span>human approval</span><span>explicit stop rule</span></div>
        </LectureScene>
      ),
    },
    {
      phase: "agentic",
      eyebrow: "Production architecture · The agent harness",
      content: (
        <LectureScene
          number="14"
          title={<>The model is one component inside an <em>operational system</em>.</>}
          intro="The harness assembles context, exposes tools, manages state, runs the loop, enforces policy, records evidence, and decides when a human needs to intervene."
          points={[
            "Orchestration turns a high-level goal into bounded decisions and tool calls.",
            "Identity and permissions constrain which actions are possible for this user and task.",
            "Tracing and evaluation reveal what happened, why, how long it took, and whether it worked.",
          ]}
          takeaway="Most production reliability and safety lives outside the foundation model."
        >
          <HarnessArchitecture />
          <button className="lesson-action" onClick={() => setDetail("harness")}>Inspect every harness layer <span>↗</span></button>
        </LectureScene>
      ),
    },
    {
      phase: "agentic",
      eyebrow: "Concept check · Agent versus agentic system",
      content: (
        <LectureScene
          number="15"
          title={<>An AI agent is the actor. Agentic AI is the <em>wider paradigm</em>.</>}
          intro="The distinction matters because a useful system includes much more than reasoning: deterministic services, data, identity, controls, human decisions, and operational evidence."
          points={[
            "A single research agent with search, memory and report generation can be agentic.",
            "A multi-agent arrangement is one architecture pattern, not the definition of Agentic AI.",
            "Enterprise workflows are usually hybrid systems: agents plus ordinary software and people.",
          ]}
          takeaway="Judge the whole system boundary, not just the component labelled ‘agent’."
        >
          <AgenticBoundaryDiagram />
          <KnowledgeCheck />
        </LectureScene>
      ),
    },
    {
      phase: "agentic",
      eyebrow: "Lesson synthesis · Three histories converge",
      content: (
        <LectureScene
          number="16"
          title={<>Nothing appeared from nowhere. Three mature histories <em>converged</em>.</>}
          intro="Agentic AI combines the architecture of action, the learned capability of foundation models, and the operational environment of modern software."
          points={[
            "Intelligent systems contribute goals, planning, state, action and coordination.",
            "Machine intelligence contributes perception, language, representation learning and flexible generalisation.",
            "Software and cloud contribute tools, connectivity, data, identity, scale and observability.",
          ]}
          takeaway="Agents are not new. AI is not new. Cloud is not new. Their convergence at this capability and scale is."
          wide
        >
          <ConvergenceDiagram />
          <div className="recap-prompts"><span>Can it reason?</span><span>Can it act?</span><span>Can it observe results?</span><span>Can it be controlled?</span><span>Can we explain what happened?</span></div>
        </LectureScene>
      ),
    },
  ], [lessonAsset]);

  const active = slides[current];
  const firstByPhase = useMemo(() => {
    const map = {} as Record<Phase, number>;
    slides.forEach((slide, index) => { if (map[slide.phase] === undefined) map[slide.phase] = index; });
    return map;
  }, [slides]);

  const show = (index: number) => setCurrent(Math.max(0, Math.min(slides.length - 1, index)));

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (detail) { if (event.key === "Escape") setDetail(null); return; }
      if (event.key === "Escape" && isPresenting) {
        if (document.fullscreenElement) void document.exitFullscreen?.();
        setIsPresenting(false);
        return;
      }
      if (["ArrowRight", "PageDown"].includes(event.key) || (event.key === " " && event.target === document.body)) {
        event.preventDefault(); show(current + 1);
      }
      if (["ArrowLeft", "PageUp"].includes(event.key)) { event.preventDefault(); show(current - 1); }
      if (event.key === "Home") show(0);
      if (event.key === "End") show(slides.length - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, detail, isPresenting, slides.length]);

  useEffect(() => {
    const syncPresentationMode = () => setIsPresenting(document.fullscreenElement === deckRef.current);
    document.addEventListener("fullscreenchange", syncPresentationMode);
    return () => document.removeEventListener("fullscreenchange", syncPresentationMode);
  }, []);

  useEffect(() => {
    deckRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [current]);

  useEffect(() => {
    if (!detail) return;
    const previous = document.activeElement as HTMLElement | null;
    document.querySelector<HTMLButtonElement>(".lesson-modal-close")?.focus();
    return () => previous?.focus();
  }, [detail]);

  const modal = detail ? deepDives[detail] : null;
  const togglePresentation = async () => {
    if (isPresenting) {
      if (document.fullscreenElement) {
        try { await document.exitFullscreen?.(); } catch { /* state still exits below */ }
      }
      setIsPresenting(false);
      return;
    }
    setIsPresenting(true);
    try {
      await deckRef.current?.requestFullscreen?.();
    } catch {
      // The expanded player still works when native fullscreen is unavailable.
    }
  };

  return (
    <section className={`lesson-shell ${isPresenting ? "is-presenting" : ""}`} ref={deckRef} aria-label="Interactive lesson: From Turing to Agentic AI">
      <aside className="lesson-rail">
        <Link to="/ai-fundamentals" className="lesson-rail-back">← Course index</Link>
        <div className="lesson-rail-title"><span>AI Fundamentals</span><strong>From Turing<br />to Agentic AI</strong></div>
        <nav aria-label="Lesson chapters">
          {(Object.keys(phaseLabels) as Phase[]).map((phase) => (
            <button key={phase} aria-label={phaseLabels[phase]} aria-current={active.phase === phase ? "step" : undefined} onClick={() => show(firstByPhase[phase])}><span>{String(firstByPhase[phase] + 1).padStart(2, "0")}</span>{phaseLabels[phase]}</button>
          ))}
        </nav>
        <div className="lesson-rail-footer"><span>Scene</span><strong>{String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</strong><small>← → to navigate</small></div>
      </aside>

      <div className="lesson-player">
        <div className="lesson-stage" key={current}>
          <div className="lesson-stage-meta"><span>{active.eyebrow}</span><span>{String(current + 1).padStart(2, "0")} / {slides.length}</span></div>
          <div className="lesson-stage-content">{active.content}</div>
        </div>

        <div className="lesson-controls">
          <button onClick={() => show(current - 1)} disabled={current === 0} aria-label="Previous slide">←</button>
          <div className="lesson-progress" aria-label={`${current + 1} of ${slides.length} slides`}><i style={{ width: `${((current + 1) / slides.length) * 100}%` }} /></div>
          <button onClick={() => show(current + 1)} disabled={current === slides.length - 1} aria-label="Next slide">→</button>
          <button className="lesson-fullscreen" onClick={togglePresentation} aria-label={isPresenting ? "Exit presentation" : "Enter presentation"} aria-pressed={isPresenting}>
            {isPresenting ? "×" : "↗"} <span>{isPresenting ? "Exit presentation" : "Present"}</span>
          </button>
        </div>
      </div>

      {modal && (
        <div className="lesson-modal" role="dialog" aria-modal="true" aria-labelledby="lesson-modal-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setDetail(null); }}>
          <div className="lesson-modal-panel">
            <button className="lesson-modal-close" onClick={() => setDetail(null)} aria-label="Close deep dive">×</button>
            <span className="lesson-label">{modal.kicker}</span>
            <h2 id="lesson-modal-title">{modal.title}</h2>
            <div className="lesson-modal-content">{modal.content}</div>
            {modal.source && <a className="lesson-source" href={modal.source[1]} target="_blank" rel="noreferrer">{modal.source[0]} <span>↗</span></a>}
          </div>
        </div>
      )}
    </section>
  );
}
