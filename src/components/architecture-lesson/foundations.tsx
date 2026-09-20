import React, { useEffect, useState } from "react";
import { vocabulary } from "./data";

/* ─── Shared primitives ─────────────────────────────────────────────── */

export function Chain({ items, active, vertical = false }: { items: string[]; active?: number; vertical?: boolean }) {
  return (
    <div className={`ax-chain ${vertical ? "is-vertical" : ""}`}>
      {items.map((item, index) => (
        <React.Fragment key={`${item}-${index}`}>
          <span className={active === index ? "is-active" : active !== undefined && index < active ? "is-done" : ""}>{item}</span>
          {index < items.length - 1 && <i aria-hidden="true" />}
        </React.Fragment>
      ))}
    </div>
  );
}

export function Verdict({ tone, children }: { tone: "yes" | "no" | "maybe"; children: React.ReactNode }) {
  return <div className={`ax-verdict is-${tone}`} aria-live="polite">{children}</div>;
}

/* ─── 01 · The vocabulary wall ──────────────────────────────────────── */

const openingTerms = [
  "Agent", "Agentic AI", "Workflow", "Orchestrator", "Harness", "Tool", "Function Calling", "MCP", "A2A",
  "Memory", "State", "Context", "RAG", "Planner", "Router", "Supervisor", "Reflection", "ReAct", "Handoff",
  "Multi-Agent", "Guardrails", "Framework", "LangGraph", "Strands Agents", "Agents SDK", "Observability", "Evaluation",
];

export function VocabularyWall() {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className={`ax-wall ${revealed ? "is-revealed" : ""}`}>
      <div className="ax-wall-cloud" aria-label="Agentic AI terminology">
        {openingTerms.map((term, index) => (
          <span key={term} className={`size-${index % 4}`} style={{ "--i": index } as React.CSSProperties}>{term}</span>
        ))}
      </div>
      <div className="ax-wall-question">
        {!revealed ? (
          <>
            <p>Do we need to memorise all of these before we can design Agentic AI systems?</p>
            <button className="ax-button is-primary" onClick={() => setRevealed(true)}>Reveal the answer <span aria-hidden="true">→</span></button>
          </>
        ) : (
          <>
            <strong className="ax-wall-no">No.</strong>
            <p>Almost every term answers one of a small number of <b>architectural questions</b>. Learn the architecture first and the vocabulary falls into place.</p>
            <button className="ax-button" onClick={() => setRevealed(false)}>Show the wall again</button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── 02 · Seven architectural concerns ─────────────────────────────── */

const concerns: [string, string, string[]][] = [
  ["Goal", "What outcome is the system pursuing, and how will we know it is complete?", ["success criteria", "task", "stop rule"]],
  ["Reasoning", "Where does interpretation, inference and choice come from?", ["LLM", "foundation model", "RAG"]],
  ["Control flow", "Who decides which step happens next—code or model?", ["workflow", "router", "loop", "planner"]],
  ["State", "What does the system see now, know about this run, and retain?", ["context", "state", "memory"]],
  ["Capabilities", "How can the system obtain information or change something?", ["tools", "APIs", "MCP"]],
  ["Environment", "Which systems, data and people does it act upon?", ["CRM", "databases", "users"]],
  ["Controls", "What constrains, observes and verifies its behaviour?", ["IAM", "guardrails", "approval", "tracing"]],
];

export function ConcernStack() {
  const [selected, setSelected] = useState(2);
  return (
    <div className="ax-concerns">
      <ol className="ax-concern-list">
        {concerns.map(([name], index) => (
          <li key={name}>
            <button className={selected === index ? "is-active" : ""} onClick={() => setSelected(index)} aria-pressed={selected === index}>
              <span>{index === 0 ? "" : "+"}</span>{name}
            </button>
          </li>
        ))}
      </ol>
      <div className="ax-concern-detail" aria-live="polite">
        <span className="lesson-label">Concern {String(selected + 1).padStart(2, "0")} / 07</span>
        <h3>{concerns[selected][0]}</h3>
        <p>{concerns[selected][1]}</p>
        <div className="ax-tags">{concerns[selected][2].map((tag) => <span key={tag}>{tag}</span>)}</div>
      </div>
      <div className="ax-questions">
        {[
          ["01", "What are the architectural components of an Agentic AI system?"],
          ["02", "How can those components be organised into reusable patterns?"],
          ["03", "Which design principles govern when and how we use agentic behaviour?"],
        ].map(([n, q]) => <div key={n}><b>{n}</b><span>{q}</span></div>)}
      </div>
    </div>
  );
}

/* ─── 03 · From inference to agency ─────────────────────────────────── */

const ladder: { tab: string; flow: string[]; loop?: boolean; tone: "yes" | "no" | "maybe"; verdict: string; who: string }[] = [
  { tab: "Inference", flow: ["Input", "Model", "Output"], tone: "no", verdict: "Not agentic. One pass of model inference.", who: "Nobody chooses: there is only one path." },
  { tab: "+ Retrieval", flow: ["Input", "Retrieval", "Model", "Output"], tone: "maybe", verdict: "RAG—not necessarily agentic. Retrieval always runs.", who: "The developer fixed the path: always retrieve, then generate." },
  { tab: "+ Tool", flow: ["Input", "Model", "Tool", "Result"], tone: "maybe", verdict: "Tool use—still not necessarily agentic.", who: "One model decision; the surrounding path is still predetermined." },
  { tab: "+ Runtime control", flow: ["Goal", "Observe", "Decide", "Act", "Observe"], loop: true, tone: "yes", verdict: "Agentic behaviour: decisions now steer control flow.", who: "The model chooses the next step on every iteration—and when to stop." },
];

export function ArchitectureLadder() {
  const [stage, setStage] = useState(0);
  const current = ladder[stage];
  return (
    <div className="ax-ladder">
      <div className="ax-tabs" role="tablist" aria-label="Architecture stages">
        {ladder.map((item, index) => (
          <button key={item.tab} role="tab" aria-selected={stage === index} onClick={() => setStage(index)}>
            <span>{String(index + 1).padStart(2, "0")}</span>{item.tab}
          </button>
        ))}
      </div>
      <div className="ax-ladder-stage" role="tabpanel">
        <p className="ax-ladder-ask">Is this an Agentic AI system?</p>
        <div className={`ax-ladder-flow ${current.loop ? "is-loop" : ""}`} key={stage}>
          <Chain items={current.flow} />
          {current.loop && <span className="ax-loop-back" aria-label="loops back to decide">↺ repeat until a stop condition</span>}
        </div>
        <Verdict tone={current.tone}>{current.verdict}</Verdict>
        <div className="ax-who"><span>Who decides the next step?</span><strong>{current.who}</strong></div>
      </div>
      <button className="ax-button" onClick={() => setStage((stage + 1) % ladder.length)}>
        {stage === ladder.length - 1 ? "Start again" : "Add the next capability"} <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}

/* ─── 04 · Principle I · reasoning vs control flow ──────────────────── */

const continuum: [string, number, string][] = [
  ["Fixed workflow", 0, "Every transition is written in code. The model, if present, only transforms text inside a step."],
  ["Workflow with LLM nodes", 10, "Code owns the path; model calls summarise, extract or classify inside predetermined steps."],
  ["Model-based routing", 30, "One runtime decision selects a branch. Everything after the branch is still predefined."],
  ["Tool-using agent", 55, "The model chooses which tool to call, with which arguments, and whether to continue."],
  ["Planning agent", 75, "The model decomposes the goal, orders the steps and revises the plan from observations."],
  ["Adaptive multi-agent system", 90, "Models delegate, hand off and coordinate: most transitions are decided at runtime."],
];

export function ControlContinuum() {
  const [level, setLevel] = useState(3);
  const [name, share, text] = continuum[level];
  return (
    <div className="ax-control">
      <div className="ax-control-compare">
        <div>
          <span className="lesson-label">Deterministic control</span>
          <Chain items={["A", "B", "C", "D"]} />
          <p>The developer wrote every edge.</p>
        </div>
        <div>
          <span className="lesson-label">Model-directed control</span>
          <div className="ax-fan">
            <span className="ax-node">Input</span><i aria-hidden="true" />
            <span className="ax-node is-accent">Decide</span>
            <div>{["Search", "Database", "Ask human", "Finish"].map((option) => <span key={option}>{option}</span>)}</div>
          </div>
          <p>The model picks the edge at runtime.</p>
        </div>
      </div>
      <div className="ax-slider">
        <label htmlFor="continuum">Move along the continuum</label>
        <input id="continuum" type="range" min={0} max={continuum.length - 1} step={1} value={level} onChange={(event) => setLevel(Number(event.target.value))} aria-valuetext={name} />
        <div className="ax-slider-ends"><span>Deterministic</span><span>Highly agentic</span></div>
      </div>
      <div className="ax-authority" aria-live="polite">
        <strong>{name}</strong>
        <div className="ax-authority-bar" aria-label={`Model decides about ${share}% of transitions`}>
          <span style={{ width: `${100 - share}%` }}>developer</span>
          <b style={{ width: `${share}%` }}>{share > 0 ? "model" : ""}</b>
        </div>
        <p>{text}</p>
      </div>
      <div className="ax-equation">Agenticity ≈ degree of runtime decision authority</div>
    </div>
  );
}

/* ─── 05 · Workflow vs agent ────────────────────────────────────────── */

const requests: { request: string; path: string[]; note: string }[] = [
  { request: "Refund for order #4471 — receipt attached", path: ["Retrieve?", "Call API?", "Finish?"], note: "Evidence was complete, so the agent went straight to the refund API." },
  { request: "Refund for an order I can't find", path: ["Search?", "Ask user?", "Retrieve?", "Call API?", "Finish?"], note: "The order was missing, so the agent searched, then asked for the order email." },
  { request: "Refund for a business account over $5,000", path: ["Retrieve?", "Delegate?", "Finish?"], note: "Policy required a specialist, so the agent delegated to the finance team." },
];

const agentOptions = ["Search?", "Retrieve?", "Call API?", "Ask user?", "Delegate?", "Finish?"];
const workflowSteps = ["Validate", "Retrieve", "Generate", "Check", "Return"];

export function WorkflowVsAgent() {
  const [request, setRequest] = useState(0);
  const [tick, setTick] = useState(0);
  const path = requests[request].path;
  const total = Math.max(path.length, workflowSteps.length);
  useEffect(() => {
    if (tick >= total) return;
    const timer = window.setTimeout(() => setTick((value) => value + 1), 750);
    return () => window.clearTimeout(timer);
  }, [tick, total]);
  const run = (index: number) => { setRequest(index); setTick(0); };
  const agentStep = Math.min(tick, path.length) - 1;
  return (
    <div className="ax-wva">
      <div className="ax-requests" role="group" aria-label="Choose an incoming request">
        {requests.map((item, index) => (
          <button key={item.request} className={request === index ? "is-active" : ""} onClick={() => run(index)} aria-pressed={request === index}>{item.request}</button>
        ))}
      </div>
      <div className="ax-lanes">
        <div className="ax-lane">
          <header><span className="lesson-label">Workflow</span><strong>encodes a path</strong></header>
          <Chain items={workflowSteps} active={Math.min(tick, workflowSteps.length) - 1} vertical />
          <p>Same five steps for every request.</p>
        </div>
        <div className="ax-lane is-agent">
          <header><span className="lesson-label">Agent</span><strong>selects a path</strong></header>
          <div className="ax-options">
            <span className="ax-node is-accent">Goal → Agent</span>
            <div>
              {agentOptions.map((option) => {
                const order = path.indexOf(option);
                const lit = order !== -1 && order <= agentStep;
                return <span key={option} className={lit ? "is-lit" : ""}>{lit && <b>{order + 1}</b>}{option}</span>;
              })}
            </div>
          </div>
          <p aria-live="polite">{tick >= path.length ? requests[request].note : "Choosing the next step…"}</p>
        </div>
      </div>
      <div className="ax-callout"><strong>Most real systems are hybrids.</strong> A workflow can contain an agent step, and an agent can call a deterministic workflow as one of its tools.</div>
    </div>
  );
}

/* ─── 06 · Principle II · triage ────────────────────────────────────── */

type Choice = "function" | "router" | "agent";
const choiceLabels: Record<Choice, string> = { function: "Function / workflow", router: "Router", agent: "Agent" };
const triage: { task: string; answer: Choice; path: string[]; why: string }[] = [
  { task: "Retrieve a customer's current account balance.", answer: "function", path: ["Authenticate", "Validate", "Account API", "Return"], why: "The path is fully known. An agent would only add latency, cost and uncertainty." },
  { task: "Classify an incoming email and send it to billing, support or sales.", answer: "router", path: ["Email", "Classify", "Billing | Support | Sales"], why: "One runtime judgement selects a branch; everything after it is predefined." },
  { task: "Investigate why a mortgage application has stalled and decide what should happen next.", answer: "agent", path: ["Investigate", "Documents? Credit? Identity? Policy?", "Escalate?"], why: "The next step depends on what is discovered. Runtime decision authority earns its cost here." },
  { task: "Answer a policy question from the employee handbook.", answer: "function", path: ["Retrieve", "Generate", "Cite"], why: "A fixed RAG pipeline is enough. Using a model does not make it agentic, and it doesn't need to be." },
  { task: "Fix a failing CI build: read logs, try a fix, rerun tests, repeat.", answer: "agent", path: ["Read logs", "Hypothesise", "Edit", "Test", "↺"], why: "The number and order of actions are unknown in advance. This is a feedback loop." },
];

export function TriageExercise() {
  const [answers, setAnswers] = useState<(Choice | null)[]>(() => triage.map(() => null));
  const [index, setIndex] = useState(0);
  const item = triage[index];
  const picked = answers[index];
  const score = answers.filter((answer, i) => answer === triage[i].answer).length;
  const answered = answers.filter(Boolean).length;
  return (
    <div className="ax-triage">
      <div className="ax-triage-head">
        <span className="lesson-label">Design exercise · {index + 1} of {triage.length}</span>
        <span className="ax-score">{score}/{answered} correct</span>
      </div>
      <p className="ax-triage-task">“{item.task}”</p>
      <div className="ax-triage-choices" role="group" aria-label="What should implement this?">
        {(Object.keys(choiceLabels) as Choice[]).map((choice) => (
          <button
            key={choice}
            className={picked === choice ? (choice === item.answer ? "is-correct" : "is-wrong") : picked && choice === item.answer ? "is-correct" : ""}
            onClick={() => setAnswers((previous) => previous.map((value, i) => (i === index && !value ? choice : value)))}
            disabled={picked !== null}
          >
            {choiceLabels[choice]}
          </button>
        ))}
      </div>
      {picked && (
        <div className="ax-triage-feedback" aria-live="polite">
          <strong>{picked === item.answer ? "Right." : `Better as: ${choiceLabels[item.answer]}.`}</strong> {item.why}
          <Chain items={item.path} />
        </div>
      )}
      <div className="ax-triage-nav">
        {triage.map((entry, i) => (
          <button key={entry.task} className={`${i === index ? "is-current" : ""} ${answers[i] ? (answers[i] === entry.answer ? "is-correct" : "is-wrong") : ""}`} onClick={() => setIndex(i)} aria-label={`Scenario ${i + 1}`} />
        ))}
        <button className="ax-button" onClick={() => setIndex((index + 1) % triage.length)}>Next scenario <span aria-hidden="true">→</span></button>
      </div>
    </div>
  );
}

/* ─── 07 · Reference architecture ───────────────────────────────────── */

type Layer = { id: string; name: string; parts: string[]; role: string; terms: string[] };
const layers: Layer[] = [
  { id: "user", name: "User", parts: ["person", "system", "schedule"], role: "Originates the goal. Can be a person, another service, or an event.", terms: ["Goal", "Request"] },
  { id: "interface", name: "Interface / API layer", parts: ["chat", "REST", "events"], role: "Authenticates the caller and turns a request into a task the system can run.", terms: ["API", "IAM"] },
  { id: "orchestration", name: "Orchestration", parts: ["Workflow", "Agent", "Rules"], role: "Coordinates execution: routes work, sequences steps and manages state transitions. Often deterministic.", terms: ["Orchestrator", "Workflow", "Router", "Planner", "Supervisor", "Handoff"] },
  { id: "harness", name: "Agent harness", parts: ["Model", "State", "Memory"], role: "The runtime around the model: assembles context, runs the loop, validates calls, enforces limits.", terms: ["Harness", "Agent Loop", "LLM", "Context", "State", "Memory", "ReAct", "Reflection"] },
  { id: "tools", name: "Tool selection", parts: ["APIs", "MCP", "RAG", "Code / apps"], role: "Capabilities the model may request. Software executes them after validation and authorisation.", terms: ["Tool", "Function Calling", "MCP", "RAG"] },
  { id: "external", name: "External systems", parts: ["CRM", "databases", "SaaS", "people"], role: "The environment that is read and changed. Every action here has real consequences.", terms: ["API", "A2A", "Environment"] },
];
const controls = ["Identity", "Permissions", "Guardrails", "Human approval", "Observability", "Evaluation"];

export function ReferenceArchitecture() {
  const [selected, setSelected] = useState("harness");
  const layer = layers.find((item) => item.id === selected);
  return (
    <div className="ax-refarch">
      <div className="ax-refarch-map">
        <div className="ax-refarch-stack">
          {layers.map((item) => (
            <button key={item.id} className={`ax-layer is-${item.id} ${selected === item.id ? "is-active" : ""}`} onClick={() => setSelected(item.id)} aria-pressed={selected === item.id}>
              <strong>{item.name}</strong>
              <span>{item.parts.map((part) => <em key={part}>{part}</em>)}</span>
            </button>
          ))}
        </div>
        <button className={`ax-controls-rail ${selected === "controls" ? "is-active" : ""}`} onClick={() => setSelected("controls")} aria-pressed={selected === "controls"}>
          <strong>Cross-cutting controls</strong>
          {controls.map((control) => <span key={control}>{control}</span>)}
        </button>
      </div>
      <div className="ax-refarch-detail" aria-live="polite">
        {layer ? (
          <>
            <span className="lesson-label">Layer</span>
            <h3>{layer.name}</h3>
            <p>{layer.role}</p>
            <span className="lesson-label">Vocabulary that lives here</span>
            <div className="ax-tags">{layer.terms.map((term) => <span key={term}>{term}</span>)}</div>
          </>
        ) : (
          <>
            <span className="lesson-label">Applies to every layer</span>
            <h3>Cross-cutting controls</h3>
            <p>Controls are not a layer you pass through once. They constrain, record and verify every boundary, from request to external action.</p>
            <div className="ax-tags">{vocabulary.filter((term) => term.concern === "production").map((term) => <span key={term.term}>{term.term}</span>)}</div>
          </>
        )}
      </div>
    </div>
  );
}
