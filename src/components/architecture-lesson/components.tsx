import React, { useEffect, useState } from "react";

/* ─── 08 · The model ────────────────────────────────────────────────── */

const provides = ["language understanding", "semantic reasoning", "classification", "extraction", "planning", "tool selection", "generation"];
const gaps: [string, string][] = [
  ["No persistent state", "State store + checkpoints"],
  ["No guaranteed truth", "Retrieval, grounding + validation"],
  ["No database access", "Tools with scoped queries"],
  ["No API credentials", "Executor + secret store"],
  ["No permissions", "IAM + policy engine"],
  ["No reliable loop control", "Harness loop controller"],
  ["No guaranteed execution", "Orchestrator, retries + idempotency"],
];

export function ModelBoundary() {
  const [assigned, setAssigned] = useState(false);
  return (
    <div className="ax-model">
      <div className="ax-model-core">
        <span className="lesson-label">The model provides</span>
        <div className="ax-model-orb"><strong>Foundation model</strong><small>reasoning component</small></div>
        <div className="ax-tags">{provides.map((item) => <span key={item}>{item}</span>)}</div>
      </div>
      <div className="ax-model-gaps">
        <span className="lesson-label">It does not inherently provide</span>
        <ul>
          {gaps.map(([gap, owner], index) => (
            <li key={gap} className={assigned ? "is-assigned" : ""} style={{ "--i": index } as React.CSSProperties}>
              <span>{gap}</span>
              <i aria-hidden="true">→</i>
              <b>{assigned ? owner : "?"}</b>
            </li>
          ))}
        </ul>
        <button className="ax-button is-primary" onClick={() => setAssigned(!assigned)}>
          {assigned ? "Hide the owners" : "Assign each gap to the system"} <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}

/* ─── 09 · Context, state and memory ────────────────────────────────── */

type Entry = [string, boolean?];
const turns: { label: string; moment: string; context: Entry[]; state: Entry[]; memory: Entry[] }[] = [
  {
    label: "Turn 1",
    moment: "“Why is my mortgage application stalled?”",
    context: [["System instructions + policies"], ["User message", true], ["Retrieved: document checklist", true]],
    state: [["run_id = r-7f2", true], ["customer_id = 123", true], ["application = M-889", true], ["workflow_step = 1", true]],
    memory: [["Prefers email contact (long-term)"]],
  },
  {
    label: "Turn 2",
    moment: "Agent calls documents.list(M-889)",
    context: [["System instructions + policies"], ["User message"], ["Retrieved: document checklist"], ["Tool result: payslip missing", true]],
    state: [["run_id = r-7f2"], ["customer_id = 123"], ["application = M-889"], ["workflow_step = 3", true], ["missing_docs = [payslip]", true], ["approval_status = pending", true]],
    memory: [["Prefers email contact (long-term)"]],
  },
  {
    label: "Next day",
    moment: "New session: “I uploaded the payslip.”",
    context: [["System instructions + policies"], ["User message", true], ["Recalled: M-889 awaiting payslip", true]],
    state: [["run_id = r-9c4", true], ["restored from checkpoint r-7f2", true], ["workflow_step = 4", true]],
    memory: [["Prefers email contact (long-term)"], ["M-889 awaiting payslip (task)", true]],
  },
];

export function ContextStateMemory() {
  const [turn, setTurn] = useState(0);
  const current = turns[turn];
  const column = (title: string, subtitle: string, entries: Entry[], tone: string) => (
    <div className={`ax-csm-col is-${tone}`}>
      <header><strong>{title}</strong><span>{subtitle}</span></header>
      <ul key={turn}>
        {entries.map(([text, fresh]) => <li key={text} className={fresh ? "is-new" : ""}>{text}{fresh && <b>new</b>}</li>)}
      </ul>
    </div>
  );
  return (
    <div className="ax-csm">
      <div className="ax-tabs" role="tablist" aria-label="Conversation moments">
        {turns.map((item, index) => (
          <button key={item.label} role="tab" aria-selected={turn === index} onClick={() => setTurn(index)}><span>{String(index + 1).padStart(2, "0")}</span>{item.label}</button>
        ))}
      </div>
      <p className="ax-csm-moment">{current.moment}</p>
      <div className="ax-csm-grid">
        {column("Context", "what the model sees now", current.context, "context")}
        {column("State", "what the system knows about execution", current.state, "state")}
        {column("Memory", "what is deliberately retained", current.memory, "memory")}
      </div>
    </div>
  );
}

/* ─── 10 · Tool execution chain ─────────────────────────────────────── */

const toolSteps: [string, string, string][] = [
  ["LLM", "Decides it needs order data.", "“I should look up the order before answering.”"],
  ["Tool request", "Emits a structured call—not an action.", '{ "tool": "orders.lookup", "args": { "order_id": "4471" } }'],
  ["Harness", "Receives the request and resolves the tool.", "orders.lookup → OrderService.get()"],
  ["Validate arguments", "Checks the schema and types.", "order_id: string, matches /^\\d{4,}$/ ✓"],
  ["Authorisation", "Is this user allowed to read this order?", "customer 123 owns order 4471 ✓"],
  ["Execute", "Software calls the API with its own credential.", "GET /orders/4471 → 200 OK"],
  ["Observation", "The result is returned as new context.", '{ "status": "shipped", "carrier": "DHL" }'],
  ["LLM", "Reasons over the observation.", "“Your order shipped yesterday with DHL.”"],
];

export function ToolChain() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      if (step >= toolSteps.length - 1) setPlaying(false);
      else setStep(step + 1);
    }, 1300);
    return () => window.clearTimeout(timer);
  }, [playing, step]);
  return (
    <div className="ax-toolchain">
      <ol className="ax-toolchain-steps">
        {toolSteps.map(([label], index) => (
          <li key={`${label}-${index}`}>
            <button
              className={`${step === index ? "is-active" : index < step ? "is-done" : ""} ${index === 0 || index === toolSteps.length - 1 ? "is-model" : index >= 2 && index <= 5 ? "is-software" : ""}`}
              onClick={() => { setPlaying(false); setStep(index); }}
            >
              <span>{index + 1}</span>{label}
            </button>
          </li>
        ))}
      </ol>
      <div className="ax-toolchain-detail" aria-live="polite">
        <span className="lesson-label">{step === 0 || step === toolSteps.length - 1 ? "Model" : step === 1 || step === 6 ? "Contract" : "Deterministic software"}</span>
        <h3>{toolSteps[step][0]}</h3>
        <p>{toolSteps[step][1]}</p>
        <code>{toolSteps[step][2]}</code>
        <button className="ax-button" onClick={() => { if (step === toolSteps.length - 1) { setStep(0); setPlaying(true); } else { setPlaying(false); setStep(step + 1); } }}>
          {step === toolSteps.length - 1 ? "Replay" : "Next step"} <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}

/* ─── 11 · Principle III · decision vs execution authority ──────────── */

type GateState = "idle" | "pass" | "fail" | "wait";
const gateNames = ["Model decision", "Structured request", "Policy + validation", "Human approval", "Authorised executor", "Action"];

export function AuthoritySimulator() {
  const [amount, setAmount] = useState(500);
  const [payee, setPayee] = useState<"saved" | "new">("saved");
  const [source, setSource] = useState<"user" | "document">("user");
  const [progress, setProgress] = useState(-1);
  const [approval, setApproval] = useState<"pending" | "approved" | "rejected" | null>(null);

  const needsApproval = amount > 1000 || payee === "new";
  const policyFailure =
    source === "document" ? "Blocked: the instruction came from retrieved content, not the authenticated user."
      : amount > 10000 ? "Blocked: exceeds the $10,000 per-transfer limit." : null;

  const gates: GateState[] = gateNames.map((_, index) => {
    if (index > progress) return "idle";
    if (index === 2 && policyFailure) return "fail";
    if (index === 3) {
      if (!needsApproval) return "pass";
      return approval === "approved" ? "pass" : approval === "rejected" ? "fail" : "wait";
    }
    return "pass";
  });
  const halted = gates.some((gate) => gate === "fail" || gate === "wait");

  useEffect(() => {
    if (progress < 0 || progress >= gateNames.length - 1 || halted) return;
    const timer = window.setTimeout(() => setProgress(progress + 1), 650);
    return () => window.clearTimeout(timer);
  }, [progress, halted]);

  useEffect(() => { if (approval === "approved") setProgress((value) => Math.max(value, 3)); }, [approval]);

  const reset = () => { setProgress(-1); setApproval(null); };
  const run = () => { setApproval(null); setProgress(0); };
  const notes = [
    `Model proposes: transfer $${amount.toLocaleString("en")} to ${payee === "saved" ? "a saved payee" : "a new payee"}.`,
    `payments.transfer({ amount: ${amount}, currency: "USD", payee: "${payee === "saved" ? "p-102" : "NEW"}" })`,
    policyFailure ?? "Schema valid · within limits · request originated from the user.",
    needsApproval ? (approval === "approved" ? "Approved by a person." : approval === "rejected" ? "Rejected by a person. Nothing executes." : "Waiting for a person to approve.") : "Below approval threshold—no human needed.",
    "Uses a scoped service credential the model never sees.",
    `Transfer executed. Audit record written.`,
  ];

  return (
    <div className="ax-authority-sim">
      <div className="ax-sim-controls">
        <fieldset>
          <legend>Amount</legend>
          {[50, 500, 5000, 25000].map((value) => (
            <button key={value} className={amount === value ? "is-active" : ""} onClick={() => { setAmount(value); reset(); }} aria-pressed={amount === value}>${value.toLocaleString("en")}</button>
          ))}
        </fieldset>
        <fieldset>
          <legend>Payee</legend>
          <button className={payee === "saved" ? "is-active" : ""} onClick={() => { setPayee("saved"); reset(); }} aria-pressed={payee === "saved"}>Saved</button>
          <button className={payee === "new" ? "is-active" : ""} onClick={() => { setPayee("new"); reset(); }} aria-pressed={payee === "new"}>New</button>
        </fieldset>
        <fieldset>
          <legend>Instruction came from</legend>
          <button className={source === "user" ? "is-active" : ""} onClick={() => { setSource("user"); reset(); }} aria-pressed={source === "user"}>The user</button>
          <button className={source === "document" ? "is-active" : ""} onClick={() => { setSource("document"); reset(); }} aria-pressed={source === "document"}>A retrieved email</button>
        </fieldset>
        <button className="ax-button is-primary" onClick={run}>Run the request <span aria-hidden="true">→</span></button>
      </div>
      <ol className="ax-gates">
        {gateNames.map((name, index) => (
          <li key={name} className={`is-${gates[index]} ${index <= 1 ? "is-model" : ""}`}>
            <span className="ax-gate-mark" aria-hidden="true">{gates[index] === "pass" ? "✓" : gates[index] === "fail" ? "✕" : gates[index] === "wait" ? "…" : index + 1}</span>
            <div>
              <strong>{name}</strong>
              {index <= progress && <small>{notes[index]}</small>}
              {index === 3 && gates[3] === "wait" && (
                <span className="ax-approve">
                  <button onClick={() => setApproval("approved")}>Approve</button>
                  <button onClick={() => setApproval("rejected")}>Reject</button>
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
      <div className="ax-authority-split"><span><b>Decision authority</b> probabilistic · model</span><span><b>Execution authority</b> deterministic · software + people</span></div>
    </div>
  );
}

/* ─── 12 · APIs, protocols and MCP ──────────────────────────────────── */

const myths: [string, string][] = [
  ["MCP is an agent.", "No. MCP is a protocol. It has no goals and makes no decisions."],
  ["MCP is an orchestration framework.", "No. It does not sequence steps, route work or run a loop."],
  ["Adding MCP makes a system agentic.", "No. It standardises how tools and context are connected: an integration problem."],
];

export function McpDiagram() {
  const [flipped, setFlipped] = useState<number[]>([]);
  return (
    <div className="ax-mcp">
      <div className="ax-mcp-defs">
        <div><span className="lesson-label">API</span><strong>What operations a system exposes.</strong><code>POST /tickets · GET /orders/:id</code></div>
        <div><span className="lesson-label">Protocol</span><strong>How systems communicate and interoperate.</strong><code>message format · discovery · lifecycle</code></div>
      </div>
      <div className="ax-mcp-flow" aria-label="An AI application uses an MCP client to talk to MCP servers exposing tools, resources and prompts">
        <div className="ax-mcp-host">
          <span className="lesson-label">Host</span>
          <strong>AI application</strong>
          <span className="ax-mcp-client">MCP client</span>
        </div>
        <div className="ax-mcp-wire"><span>MCP · JSON-RPC</span></div>
        <div className="ax-mcp-servers">
          {[["CRM server", "tools"], ["Docs server", "resources"], ["Team server", "prompts"]].map(([name, kind]) => (
            <div key={name}><strong>{name}</strong><span>{kind}</span></div>
          ))}
        </div>
      </div>
      <div className="ax-myths">
        {myths.map(([claim, truth], index) => {
          const open = flipped.includes(index);
          return (
            <button key={claim} className={open ? "is-open" : ""} onClick={() => setFlipped(open ? flipped.filter((i) => i !== index) : [...flipped, index])} aria-pressed={open}>
              <span>{open ? "Reality" : "Myth"}</span>
              <strong>{open ? truth : claim}</strong>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── 13 · Principle IV · concept map ───────────────────────────────── */

const conceptRows: [string, string, string][] = [
  ["Agent", "Who makes goal-directed decisions?", "a triage agent"],
  ["Workflow", "How does execution proceed?", "validate → retrieve → answer"],
  ["Harness", "What runtime machinery surrounds the model?", "loop, limits, validation, logs"],
  ["Pattern", "How are components organised?", "planner–executor"],
  ["Protocol", "How do components communicate?", "MCP, A2A"],
  ["API", "What capability is exposed?", "orders.lookup"],
  ["Framework", "What software helps implement the design?", "LangGraph, Strands Agents"],
];

export function ConceptTable() {
  const [shown, setShown] = useState<number[]>([]);
  const all = shown.length === conceptRows.length;
  return (
    <div className="ax-concepts">
      <div className="ax-concepts-head"><span>Concept</span><span>Question it answers</span><span>Example</span></div>
      {conceptRows.map(([concept, question, example], index) => {
        const open = shown.includes(index);
        return (
          <button key={concept} className={`ax-concept-row ${open ? "is-open" : ""}`} onClick={() => setShown(open ? shown.filter((i) => i !== index) : [...shown, index])} aria-expanded={open}>
            <strong>{concept}</strong>
            <span>{open ? question : "Think first, then reveal"}</span>
            <em>{open ? example : "·"}</em>
          </button>
        );
      })}
      <button className="ax-button" onClick={() => setShown(all ? [] : conceptRows.map((_, i) => i))}>{all ? "Hide all" : "Reveal all"}</button>
    </div>
  );
}

/* ─── 14 · The harness: remove a part, see what breaks ──────────────── */

const harnessParts: [string, string, string][] = [
  ["Instructions / context", "context", "The model does not know the task, the policies or the user."],
  ["Tools", "capability", "The agent can describe an action but cannot perform one."],
  ["Memory", "capability", "The user repeats their preferences in every session."],
  ["RAG", "capability", "Answers ignore current or private knowledge."],
  ["State management", "control", "The agent forgets it already sent the email and sends it twice."],
  ["Loop control", "control", "The agent repeats the same search 47 times."],
  ["Error handling", "control", "One tool exception ends the whole conversation."],
  ["Retry / timeout", "control", "A slow API hangs the run indefinitely."],
  ["Permissions", "safety", "The agent can call delete_account for any customer."],
  ["Validation", "safety", "An invalid date, 31/02, reaches the booking API."],
  ["Guardrails", "safety", "A reply includes another customer's personal data."],
  ["Human approval", "safety", "A $20,000 transfer executes without review."],
  ["Logging / tracing", "ops", "Nobody can explain why the refund was issued."],
  ["Cost limits", "ops", "A single request consumes $180 of tokens overnight."],
];

export function HarnessToggle() {
  const [off, setOff] = useState<number[]>([5]);
  const toggle = (index: number) => setOff(off.includes(index) ? off.filter((i) => i !== index) : [...off, index]);
  const health = Math.round(((harnessParts.length - off.length) / harnessParts.length) * 100);
  return (
    <div className="ax-harness">
      <div className="ax-harness-box">
        <span className="ax-harness-label">Agent harness</span>
        <div className="ax-harness-model">Foundation model</div>
        <div className="ax-harness-parts">
          {harnessParts.map(([name, group], index) => (
            <button key={name} className={`is-${group} ${off.includes(index) ? "is-off" : ""}`} onClick={() => toggle(index)} aria-pressed={!off.includes(index)}>
              <i aria-hidden="true" />{name}
            </button>
          ))}
        </div>
      </div>
      <div className="ax-harness-feed" aria-live="polite">
        <div className="ax-harness-health"><span>Production readiness</span><strong>{health}%</strong><i style={{ width: `${health}%` }} /></div>
        <span className="lesson-label">Incident log · switch components off</span>
        {off.length === 0 ? <p className="ax-feed-ok">All components on. The model's capability is now usable, bounded behaviour.</p> : (
          <ul>
            {off.map((index) => <li key={index}><b>{harnessParts[index][0]} off</b>{harnessParts[index][2]}</li>)}
          </ul>
        )}
      </div>
    </div>
  );
}
