import React, { useCallback, useEffect, useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import LessonPlayer, { LectureScene, type DeepDive, type LessonSlide } from "./lesson/LessonPlayer";
import { Diagram } from "./lesson/diagram";

type Phase =
  | "turing"
  | "symbolic"
  | "learning"
  | "agents"
  | "llms"
  | "cloud"
  | "agentic";

type Slide = LessonSlide<Phase>;

const phaseLabels: Record<Phase, string> = {
  turing: "The question",
  symbolic: "Program intelligence",
  learning: "Learn intelligence",
  agents: "Agents",
  llms: "Transformers",
  cloud: "Software + cloud",
  agentic: "Agentic AI",
};

const deepDives: Record<string, DeepDive> = {
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

function ScrollHint() {
  return <span className="diagram-scroll-hint" aria-hidden="true">Scroll the diagram sideways →</span>;
}

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

type GenStep = { token: string; weights: Record<number, number>; dist: [string, number][] };

const PROMPT = ["The", "rover", "avoided", "the", "rock", "because", "it"];
const GEN: GenStep[] = [
  { token: "was", weights: { 6: 0.31, 1: 0.24, 4: 0.22, 2: 0.13 }, dist: [["was", 0.58], ["looked", 0.17], ["seemed", 0.11]] },
  { token: "large", weights: { 4: 0.34, 1: 0.21, 7: 0.19, 2: 0.11 }, dist: [["large", 0.62], ["heavy", 0.19], ["sharp", 0.08]] },
  { token: ".", weights: { 8: 0.38, 4: 0.21, 1: 0.14 }, dist: [[".", 0.71], [",", 0.12], ["and", 0.07]] },
];

function DecoderDemo() {
  const [step, setStep] = useState(0);
  const [attending, setAttending] = useState(true);
  const [running, setRunning] = useState(true);

  const shown = PROMPT.concat(GEN.slice(0, step).map((g) => g.token));
  const current = GEN[step];
  const finished = step >= GEN.length - 1 && !attending;

  useEffect(() => {
    if (!running) return;
    if (finished) { setRunning(false); return; }
    const timer = window.setTimeout(() => {
      if (attending) setAttending(false);
      else { setStep((value) => Math.min(value + 1, GEN.length - 1)); setAttending(true); }
    }, attending ? 1700 : 1100);
    return () => window.clearTimeout(timer);
  }, [running, attending, step, finished]);

  const advance = () => {
    setRunning(false);
    if (finished) { setStep(0); setAttending(true); setRunning(true); return; }
    if (attending) setAttending(false);
    else { setStep(Math.min(step + 1, GEN.length - 1)); setAttending(true); }
  };

  const W = 98;
  const GAP = 9;
  const X0 = 26;
  const centre = (index: number) => X0 + index * (W + GAP) + W / 2;
  const nextIndex = shown.length;
  const attended = Object.entries(current.weights).map(([index, weight]) => [Number(index), weight] as const);

  return (
    <div className="decoder-demo">
      <div className="dg-wrap decoder-arch">
        <Diagram
          width={520}
          height={470}
          minWidth={320}
          label="A decoder block: tokens and positions enter masked self-attention, then a feed-forward layer, then a linear and softmax head that produces the next-token distribution. The sampled token is appended to the input."
          nodes={[
            { id: "in", x: 148, y: 54, tone: "data", kicker: "Input", lines: ["tokens so far"] },
            { id: "attn", x: 148, y: 184, tone: "model", kicker: "Masked self-attention", lines: ["each position sees", "only earlier tokens"] },
            { id: "ff", x: 148, y: 312, tone: "control", kicker: "Feed-forward", lines: ["per-position transform"] },
            { id: "head", x: 148, y: 424, tone: "code", kicker: "Linear + softmax", lines: ["next-token distribution"] },
          ]}
          edges={[
            { from: "in", to: "attn" },
            { from: "attn", to: "ff" },
            { from: "ff", to: "head" },
            { from: "head", to: "in", bend: 215, dashed: true, animate: true, label: "append · repeat" },
          ]}
        />
      </div>

      <div className="decoder-run">
        <p className="decoder-caption">
          The model generates <strong>one token at a time</strong>. Each new position attends only to tokens
          <strong> already written</strong>—never to the future.
        </p>
        <div className="decoder-strip">
          <svg viewBox={`0 0 ${X0 * 2 + (PROMPT.length + GEN.length + 1) * (W + GAP)} 210`} role="img" aria-label={`Generating token ${step + 1}. Attention flows from the next position back to earlier tokens.`}>
            {attending && attended.map(([index, weight]) => {
              const x1 = centre(nextIndex);
              const x2 = centre(index);
              const lift = 132 - Math.min(78, Math.abs(x1 - x2) * 0.1);
              return (
                <path
                  key={index}
                  className="decoder-link"
                  style={{ strokeWidth: 2 + weight * 14, opacity: 0.35 + weight }}
                  d={`M${x1},${138} C${x1},${lift} ${x2},${lift} ${x2},${138}`}
                />
              );
            })}
            {shown.map((token, index) => (
              <g key={`${token}-${index}`} className={`decoder-token ${index >= PROMPT.length ? "is-generated" : ""} ${attending && current.weights[index] ? "is-attended" : ""}`}>
                <rect x={centre(index) - W / 2} y="144" width={W} height="46" rx="9" />
                <text x={centre(index)} y="173" textAnchor="middle">{token}</text>
                {attending && current.weights[index] && (
                  <text className="decoder-weight" x={centre(index)} y="206" textAnchor="middle">{current.weights[index].toFixed(2)}</text>
                )}
              </g>
            ))}
            <g className={`decoder-token is-next ${attending ? "is-pending" : "is-emitted"}`}>
              <rect x={centre(nextIndex) - W / 2} y="144" width={W} height="46" rx="9" />
              <text x={centre(nextIndex)} y="173" textAnchor="middle">{attending ? "?" : current.token}</text>
            </g>
            <text className="decoder-axis" x={centre(0) - W / 2} y="26">WRITTEN SO FAR</text>
            <text className="decoder-axis is-next" x={centre(nextIndex) - W / 2} y="26">NEXT</text>
          </svg>
        </div>

        <div className="decoder-panel">
          <div className="decoder-dist">
            <span className="lesson-label">Next-token distribution</span>
            {current.dist.map(([token, probability], index) => (
              <div key={token} className={index === 0 && !attending ? "is-chosen" : ""}>
                <b>{token}</b>
                <i style={{ width: `${probability * 100}%` }} />
                <small>{probability.toFixed(2)}</small>
              </div>
            ))}
          </div>
          <div className="decoder-actions">
            <p aria-live="polite">
              {attending
                ? `Position ${nextIndex + 1} reads the tokens before it.`
                : `“${current.token}” is appended, and becomes context for the next step.`}
            </p>
            <button className="lesson-action" onClick={advance}>
              {finished ? "Replay generation" : attending ? "Sample the token" : "Generate next token"} <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoopCycle({ steps, active, onSelect }: { steps: string[]; active: number; onSelect: (index: number) => void }) {
  const R = 150;
  const C = 230;
  const at = (index: number, radius = R) => {
    const angle = ((-90 + index * (360 / steps.length)) * Math.PI) / 180;
    return [C + radius * Math.cos(angle), C + radius * Math.sin(angle)] as const;
  };
  const arc = (index: number) => {
    const span = 360 / steps.length;
    const pad = 20;
    const a1 = ((-90 + index * span + pad) * Math.PI) / 180;
    const a2 = ((-90 + (index + 1) * span - pad) * Math.PI) / 180;
    return `M${C + R * Math.cos(a1)},${C + R * Math.sin(a1)} A${R},${R} 0 0 1 ${C + R * Math.cos(a2)},${C + R * Math.sin(a2)}`;
  };
  return (
    <svg className="loop-cycle" viewBox="0 0 460 460" role="group" aria-label="The agent loop as a cycle of six steps">
      <defs>
        <marker id="loop-arrow" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="9" refX="11" refY="4.5" orient="auto">
          <path d="M0,0 L12,4.5 L0,9 Z" />
        </marker>
      </defs>
      {steps.map((_, index) => (
        <path key={index} className={`loop-arc ${active === index ? "is-active" : ""}`} d={arc(index)} markerEnd="url(#loop-arrow)" />
      ))}
      <circle className="loop-hub" cx={C} cy={C} r="78" />
      <text className="loop-hub-step" x={C} y={C - 14} textAnchor="middle">STEP {active + 1} OF {steps.length}</text>
      <text className="loop-hub-name" x={C} y={C + 16} textAnchor="middle">{steps[active]}</text>
      {steps.map((label, index) => {
        const [x, y] = at(index);
        return (
          <g
            key={label}
            className={`loop-node ${active === index ? "is-active" : ""}`}
            role="button"
            tabIndex={0}
            aria-label={`Show step ${index + 1}: ${label}`}
            aria-current={active === index ? "step" : undefined}
            onClick={() => onSelect(index)}
            onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(index); } }}
          >
            <rect x={x - 62} y={y - 23} width="124" height="46" rx="10" />
            <text className="loop-node-index" x={x - 44} y={y + 5} textAnchor="middle">{index + 1}</text>
            <text className="loop-node-label" x={x + 10} y={y + 5} textAnchor="middle">{label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function AgentLoop() {
  const steps = ["Goal", "Observe", "Reason", "Use tool", "Read result", "Decide"];
  const descriptions = [
    "Define the outcome and the condition that counts as done.",
    "Collect the current state of the task before deciding.",
    "Choose one useful next action from what is now known.",
    "Call a permissioned capability with validated arguments.",
    "Bring the environment's response back as new context.",
    "Stop when the success condition holds—or run another cycle.",
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
  const select = (index: number) => { setAutoRun(false); setStep(index); };
  return (
    <div className="agent-loop-demo">
      <LoopCycle steps={steps} active={step} onSelect={select} />
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

function SymbolicSystemDiagram() {
  return (
    <div className="dg-wrap" aria-label="Observed facts and expert rules feed an inference engine which produces a traceable recommendation">
      <Diagram
        width={1080}
        height={330}
        label="Observed facts and expert rules flow into an inference engine, which fires matching rules and returns an explainable recommendation."
        nodes={[
          { id: "facts", x: 170, y: 108, tone: "data", kicker: "Observed facts", lines: ["temperature = 39°C", "culture = positive"], mono: true },
          { id: "rules", x: 170, y: 276, tone: "data", kicker: "Expert rules", lines: ["IF evidence A + B", "THEN consider C"], mono: true },
          { id: "engine", x: 560, y: 192, shape: "hex", tone: "model", kicker: "Inference engine", title: "Match → fire", lines: ["applies rules in order"] },
          { id: "out", x: 900, y: 192, tone: "code", kicker: "Recommendation", title: "Consider C", lines: ["with the rule path"] },
        ]}
        edges={[
          { from: "facts", to: "engine" },
          { from: "rules", to: "engine" },
          { from: "engine", to: "out" },
        ]}
      />
      <ScrollHint />
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
          <marker id="neural-forward" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#b3271f" /></marker>
          <marker id="neural-back" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M8,0 L0,4 L8,8 Z" fill="#b4564e" /></marker>
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
    <div className="dg-wrap" aria-label="An agent observes an environment, updates state, compares against a goal, chooses an action, and changes the environment again">
      <Diagram
        width={1160}
        height={380}
        label="The environment is observed by the agent, which holds state, compares it against a goal, chooses an action through its policy, and changes the environment again."
        nodes={[
          { id: "env", x: 152, y: 168, shape: "cloud", tone: "data", kicker: "Environment", title: "World / software", lines: ["people · data · tools"] },
          { id: "state", x: 500, y: 168, shape: "circle", tone: "model", kicker: "Agent state", title: "Observe", lines: ["what is true now?"] },
          { id: "goal", x: 800, y: 168, shape: "hex", tone: "code", kicker: "Objective", title: "Goal", lines: ["what outcome?"] },
          { id: "policy", x: 1040, y: 168, tone: "control", kicker: "Policy / plan", title: "Choose action", lines: ["which step next?"] },
        ]}
        edges={[
          { from: "env", to: "state", label: "observation", tone: "data" },
          { from: "state", to: "goal", tone: "data" },
          { from: "goal", to: "policy", label: "action", tone: "data" },
          { from: "policy", to: "env", bend: -185, dashed: true, animate: true, label: "the action changes the environment → new observation" },
        ]}
      />
      <ScrollHint />
    </div>
  );
}

function ToolBoundaryDiagram() {
  return (
    <div className="dg-wrap" aria-label="A language model proposes a structured tool call which software validates and authorises before an API executes it">
      <Diagram
        width={1180}
        height={360}
        label="A foundation model proposes a structured tool call. Deterministic software validates and authorises it, an API executes it, and the observation returns to the model."
        nodes={[
          { id: "model", x: 165, y: 158, shape: "circle", tone: "model", kicker: "Probabilistic", title: "Foundation model" },
          { id: "call", x: 500, y: 158, shape: "doc", tone: "model", kicker: "Structured contract", lines: ["send_email(", "  to: \"…\"", ")"], mono: true },
          { id: "gate", x: 820, y: 158, shape: "shield", tone: "code", kicker: "Deterministic gate", title: "Validate + authorise", lines: ["schema · policy · approval"] },
          { id: "api", x: 1085, y: 158, shape: "stadium", tone: "data", kicker: "Environment", title: "API" },
        ]}
        edges={[
          { from: "model", to: "call", label: "proposes" },
          { from: "call", to: "gate" },
          { from: "gate", to: "api" },
          { from: "api", to: "model", bend: -150, dashed: true, animate: true, label: "observation returns to the agent’s next decision" },
        ]}
      />
      <ScrollHint />
    </div>
  );
}

function HarnessArchitecture() {
  return (
    <div className="dg-wrap" aria-label="A foundation model sits inside a harness of orchestration, context, controls and operational evidence">
      <Diagram
        width={1140}
        height={520}
        label="Orchestration drives a foundation model, which draws on context and capabilities, is constrained by a control plane, and emits operational evidence."
        nodes={[
          { id: "orch", x: 570, y: 70, tone: "control", kicker: "Orchestration", lines: ["goal → planner → loop → router → stop rules"] },
          { id: "model", x: 570, y: 262, shape: "circle", tone: "model", kicker: "Reasoning engine", title: "Foundation model", lines: ["language · decisions"] },
          { id: "ctx", x: 172, y: 262, tone: "data", kicker: "Context + capabilities", lines: ["retrieval · memory", "tools · durable state"] },
          { id: "ctrl", x: 968, y: 262, shape: "hex", tone: "code", kicker: "Control plane", lines: ["identity · policy", "approval · sandbox"] },
          { id: "ops", x: 570, y: 452, kicker: "Operational evidence", lines: ["logs · traces · evaluation · cost · latency · audit"] },
        ]}
        edges={[
          { from: "orch", to: "model", label: "bounded task" },
          { from: "model", to: "ctx", label: "reads" },
          { from: "model", to: "ctrl", label: "checked by" },
          { from: "model", to: "ops", label: "records" },
        ]}
      />
      <ScrollHint />
    </div>
  );
}

function AgenticBoundaryDiagram() {
  return (
    <div className="dg-wrap" aria-label="An AI agent sits inside a wider agentic AI system of software, controls and people">
      <Diagram
        width={1120}
        height={400}
        label="A goal-directed AI agent is one component inside a wider agentic system that also contains software, controls and people."
        nodes={[
          { id: "agent", x: 258, y: 228, shape: "circle", tone: "model", kicker: "AI agent", title: "Observe · reason", lines: ["act · stop"] },
          { id: "software", x: 620, y: 150, tone: "data", kicker: "Software", lines: ["APIs · data"] },
          { id: "controls", x: 620, y: 290, tone: "code", kicker: "Controls", lines: ["policy · audit"] },
          { id: "people", x: 910, y: 215, tone: "control", kicker: "People", lines: ["approval · review"] },
        ]}
        edges={[
          { from: "agent", to: "software" },
          { from: "agent", to: "controls" },
          { from: "software", to: "people", tone: "data" },
          { from: "controls", to: "people", tone: "data" },
        ]}
      >
        <g className="dg-frame">
          <rect x="40" y="48" width="1040" height="326" rx="24" />
          <text x="72" y="80">AGENTIC AI SYSTEM</text>
        </g>
      </Diagram>
      <ScrollHint />
    </div>
  );
}

function ConvergenceDiagram() {
  return (
    <div className="dg-wrap" aria-label="Three histories converge to form Agentic AI">
      <Diagram
        width={1120}
        height={430}
        label="Intelligent-systems architecture, machine learning and programmable software converge into agentic AI."
        nodes={[
          { id: "arch", x: 190, y: 110, tone: "data", kicker: "01 · Architecture", title: "Goals + plans", lines: ["state · search · action"] },
          { id: "learn", x: 560, y: 110, tone: "control", kicker: "02 · Learning", title: "Foundation models", lines: ["language · perception"] },
          { id: "soft", x: 930, y: 110, tone: "code", kicker: "03 · Software", title: "Programmable world", lines: ["APIs · data · identity"] },
          { id: "agentic", x: 560, y: 340, shape: "hex", tone: "accent", title: "AGENTIC AI", lines: ["reason + act + observe + control"] },
        ]}
        edges={[
          { from: "arch", to: "agentic" },
          { from: "learn", to: "agentic" },
          { from: "soft", to: "agentic" },
        ]}
      />
      <ScrollHint />
    </div>
  );
}

export default function LessonDeck() {
  const lessonAsset = useBaseUrl("img/lessons/");

  const buildSlides = useCallback((setDetail: (id: string) => void): Slide[] => [
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
          wide
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
              <defs><marker id="search-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#b3271f" /></marker></defs>
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
          wide
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
          title={<>A decoder writes <em>one token at a time</em>.</>}
          intro="Each token forms a query, a key and a value. In a decoder, masked self-attention lets a position read only the tokens already written; the model then scores the vocabulary, samples one token, appends it, and repeats."
          points={[
            "A query asks what the current position needs; keys advertise what each earlier token offers.",
            "The causal mask hides future positions—this is what makes generation autoregressive.",
            "Every sampled token becomes part of the context for the next step.",
          ]}
          takeaway="Generation is a loop: attend over what exists, predict the next token, append it, repeat."
          wide
        >
          <DecoderDemo />
          <div className="attention-formula"><code>softmax(QKᵀ / √dₖ + mask)V</code><span>compare → mask the future → normalise → combine</span></div>
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
          wide
        >
          <Timeline autoPlay items={[
            ["2018", "Pretraining", "GPT-1 and BERT reuse learned language representations across tasks."],
            ["2019", "Scaling", "GPT-2 demonstrates stronger coherent generation and zero-shot behaviour."],
            ["2020", "In-context learning", "GPT-3 performs new tasks from instructions and examples in the prompt."],
            ["2022", "Instruction following", "Chat interfaces make model capability accessible to a much larger audience."],
          ]} />
          <div className="dg-wrap">
            <Diagram
              width={1140}
              height={330}
              label="Large text corpora are used for pretraining, which produces one reusable foundation model that many different tasks are then prompted from."
              nodes={[
                { id: "corpus", x: 130, y: 165, tone: "data", kicker: "Text corpora", lines: ["books · web · code"] },
                { id: "pre", x: 410, y: 165, tone: "control", kicker: "Pretraining", lines: ["predict the next token", "at scale"] },
                { id: "model", x: 690, y: 165, shape: "circle", tone: "model", kicker: "One model", title: "Foundation" },
                { id: "t1", x: 1000, y: 48, title: "Summarise" },
                { id: "t2", x: 1000, y: 126, title: "Classify" },
                { id: "t3", x: 1000, y: 204, title: "Translate" },
                { id: "t4", x: 1000, y: 282, title: "Write code" },
              ]}
              edges={[
                { from: "corpus", to: "pre" },
                { from: "pre", to: "model" },
                { from: "model", to: "t1" },
                { from: "model", to: "t2" },
                { from: "model", to: "t3" },
                { from: "model", to: "t4" },
              ]}
            />
            <ScrollHint />
          </div>
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
          wide
        >
          <Timeline onOpen={() => setDetail("cloud")} items={[
            ["1989–90s", "Web", "Networked information becomes globally addressable."],
            ["1990s–2000s", "Web APIs", "Software capabilities become callable by other software."],
            ["2006", "Elastic cloud", "Compute and storage become on-demand services."],
            ["2010s→", "Platforms", "Identity, data, events and observability become composable infrastructure."],
          ]} />
          <div className="dg-wrap">
            <Diagram
              width={1210}
              height={430}
              label="The web made information addressable, APIs made capabilities callable, cloud made infrastructure programmable and SaaS digitised workflows, so a reasoning system now has real actions available."
              nodes={[
                { id: "web", x: 300, y: 56, w: 500, tone: "data", kicker: "Web · 1989–90s", lines: ["information becomes addressable"] },
                { id: "api", x: 300, y: 172, w: 500, tone: "data", kicker: "Web APIs · 1990s–2000s", lines: ["capabilities become callable"] },
                { id: "cloud", x: 300, y: 288, w: 500, tone: "control", kicker: "Cloud · 2006→", lines: ["compute, storage and identity on demand"] },
                { id: "saas", x: 300, y: 386, w: 500, tone: "code", kicker: "Platforms · 2010s→", lines: ["workflows, events and telemetry"] },
                { id: "act", x: 920, y: 220, shape: "hex", tone: "model", kicker: "For an agent", title: "An API is an actuator", lines: ["search_flights() · send_email()", "query_customer() · request_approval()"], mono: false },
              ]}
              edges={[
                { from: "web", to: "api" },
                { from: "api", to: "cloud" },
                { from: "cloud", to: "saas" },
                { from: "api", to: "act", tone: "data" },
                { from: "saas", to: "act", tone: "data" },
              ]}
            />
            <ScrollHint />
          </div>
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
          wide
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
          wide
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
          wide
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

  return (
    <LessonPlayer
      ariaLabel="Interactive lesson: From Turing to Agentic AI"
      course="AI Fundamentals"
      railTitle={<>From Turing<br />to Agentic AI</>}
      phaseLabels={phaseLabels}
      buildSlides={buildSlides}
      deepDives={deepDives}
      nextLesson={{ label: "Lesson 02", to: "/ai-fundamentals/architectures-and-design-principles" }}
    />
  );
}
