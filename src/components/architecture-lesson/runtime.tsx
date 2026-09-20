import React, { useEffect, useState } from "react";
import { Chain } from "./foundations";

/* ─── 15 · The agent loop with explicit stop conditions ─────────────── */

const loopStages = ["Goal", "Observe", "Decide", "Select action", "Execute", "Observe result", "Update state", "Continue or stop"];
const stopConditions = ["Goal achieved", "No valid actions", "Max steps", "Timeout", "Cost limit", "Low confidence", "Human escalation", "Fatal tool error"];

type TraceLine = [number, string];
const scenarios: { name: string; goal: string; trace: TraceLine[]; stop: number; outcome: string }[] = [
  {
    name: "Happy path", goal: "Book a 30-minute meeting with Priya this week.", stop: 0, outcome: "Stopped: goal achieved. The invite exists and has been confirmed.",
    trace: [[0, "Goal received with success criterion: an accepted invite"], [1, "Read both calendars"], [2, "Tuesday 10:30 is free for both"], [3, "calendar.create_event"], [4, "Event created · id ev_91"], [5, "Observation confirms the invite was sent"], [6, "state.meeting = ev_91"], [7, "Success criterion met → stop"]],
  },
  {
    name: "Tool keeps failing", goal: "Book a 30-minute meeting with Priya this week.", stop: 7, outcome: "Stopped: fatal tool error after bounded retries. Escalated with context.",
    trace: [[0, "Goal received"], [1, "Read both calendars"], [3, "calendar.create_event"], [4, "503 Service Unavailable"], [6, "retries = 1 · backoff 2s"], [4, "503 Service Unavailable"], [6, "retries = 2 · circuit breaker opens"], [7, "Retry budget exhausted → stop"]],
  },
  {
    name: "Runaway research", goal: "Find the best sources on agent evaluation.", stop: 2, outcome: "Stopped: max steps (12). The partial result is returned and the limit is flagged.",
    trace: [[1, "search: agent evaluation"], [2, "“Maybe there are better sources…”"], [4, "search: agent benchmarks"], [2, "“Maybe there are better sources…”"], [4, "search: agent evaluation 2026"], [6, "step = 9 · no new information"], [4, "search: agent evaluation survey"], [6, "step = 12"], [7, "Max steps reached → stop"]],
  },
  {
    name: "High-risk action", goal: "Close the customer's account as requested.", stop: 6, outcome: "Paused: human escalation. Account closure is irreversible and needs approval.",
    trace: [[0, "Goal: close account 123"], [1, "Read account: two active contracts"], [2, "Closing requires cancelling contracts"], [3, "contracts.cancel (irreversible)"], [7, "Action class = irreversible → escalate"]],
  },
];

export function AgentLoopEngine() {
  const [scenario, setScenario] = useState(0);
  const [line, setLine] = useState(0);
  const current = scenarios[scenario];
  const done = line >= current.trace.length;
  useEffect(() => {
    if (done) return;
    const timer = window.setTimeout(() => setLine(line + 1), 850);
    return () => window.clearTimeout(timer);
  }, [line, done]);
  const stage = current.trace[Math.min(line, current.trace.length) - 1]?.[0] ?? 0;
  return (
    <div className="ax-loop">
      <div className="ax-loop-scenarios" role="group" aria-label="Loop scenario">
        {scenarios.map((item, index) => (
          <button key={item.name} className={scenario === index ? "is-active" : ""} aria-pressed={scenario === index} onClick={() => { setScenario(index); setLine(0); }}>{item.name}</button>
        ))}
      </div>
      <div className="ax-loop-body">
        <div className="ax-loop-ring" aria-label={`Current stage: ${loopStages[stage]}`}>
          {loopStages.map((name, index) => (
            <span key={name} className={stage === index ? "is-active" : ""} style={{ "--step": index } as React.CSSProperties}><b>{index + 1}</b>{name}</span>
          ))}
          <div className="ax-loop-center"><small>stage</small><strong>{loopStages[stage]}</strong></div>
        </div>
        <div className="ax-loop-trace">
          <span className="lesson-label">Goal</span>
          <p className="ax-loop-goal">{current.goal}</p>
          <ol aria-live="polite">
            {current.trace.slice(0, line).map(([stageIndex, text], index) => (
              <li key={`${scenario}-${index}`}><span>{loopStages[stageIndex]}</span>{text}</li>
            ))}
          </ol>
          {done && <div className="ax-loop-outcome">{current.outcome}</div>}
        </div>
      </div>
      <div className="ax-stops">
        <span className="lesson-label">Stop conditions</span>
        <div>{stopConditions.map((name, index) => <span key={name} className={done && current.stop === index ? "is-fired" : ""}>{name}</span>)}</div>
      </div>
    </div>
  );
}

/* ─── 16 · Principle V · bound autonomy ─────────────────────────────── */

const plannedActions: { tool: string; label: string; refund?: number }[] = [
  { tool: "read_crm", label: "Look up the customer and order" },
  { tool: "search", label: "Check the carrier's tracking status" },
  { tool: "read_crm", label: "Read the late-delivery policy" },
  { tool: "issue_refund", label: "Refund the $80 shipping fee", refund: 80 },
  { tool: "send_email", label: "Email the customer an apology" },
];
const toolNames = ["read_crm", "search", "issue_refund", "send_email"];
const STEP_COST = 0.12;

export function AutonomyEnvelope() {
  const [maxSteps, setMaxSteps] = useState(8);
  const [maxCost, setMaxCost] = useState(1);
  const [threshold, setThreshold] = useState(50);
  const [allowed, setAllowed] = useState<string[]>(toolNames);

  const log: { text: string; tone: "ok" | "stop" | "wait" }[] = [];
  let cost = 0;
  let outcome: { text: string; tone: "ok" | "stop" | "wait" } = { text: "Task complete within the envelope.", tone: "ok" };
  for (let index = 0; index < plannedActions.length; index += 1) {
    const action = plannedActions[index];
    if (index >= maxSteps) { outcome = { text: `Stopped at the step limit (${maxSteps}). Partial result returned.`, tone: "stop" }; break; }
    if (cost + STEP_COST > maxCost + 1e-9) { outcome = { text: `Stopped at the cost limit ($${maxCost.toFixed(2)}). Partial result returned.`, tone: "stop" }; break; }
    if (!allowed.includes(action.tool)) { outcome = { text: `Escalated: ${action.tool} is not in the allowed tool set.`, tone: "stop" }; break; }
    if (action.refund && action.refund > threshold) { log.push({ text: `${action.label} → waiting for approval`, tone: "wait" }); outcome = { text: `Paused: a refund over $${threshold} needs human approval.`, tone: "wait" }; break; }
    cost += STEP_COST;
    log.push({ text: `${action.tool} · ${action.label}`, tone: "ok" });
  }

  return (
    <div className="ax-envelope">
      <div className="ax-envelope-controls">
        <p className="ax-envelope-task"><span className="lesson-label">Task</span>“Resolve this customer's complaint about a late order.”</p>
        <label>Max steps <b>{maxSteps}</b><input type="range" min={1} max={10} value={maxSteps} onChange={(event) => setMaxSteps(Number(event.target.value))} /></label>
        <label>Max cost <b>${maxCost.toFixed(2)}</b><input type="range" min={0.1} max={1} step={0.1} value={maxCost} onChange={(event) => setMaxCost(Number(event.target.value))} /></label>
        <label>Approval above <b>${threshold}</b><input type="range" min={0} max={200} step={10} value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} /></label>
        <fieldset>
          <legend>Allowed tools</legend>
          {toolNames.map((tool) => (
            <button key={tool} className={allowed.includes(tool) ? "is-active" : ""} aria-pressed={allowed.includes(tool)} onClick={() => setAllowed(allowed.includes(tool) ? allowed.filter((t) => t !== tool) : [...allowed, tool])}>{tool}</button>
          ))}
        </fieldset>
      </div>
      <div className="ax-envelope-run" aria-live="polite">
        <span className="lesson-label">Simulated run · {log.filter((entry) => entry.tone === "ok").length} actions · ${cost.toFixed(2)}</span>
        <ol>{log.map((entry) => <li key={entry.text} className={`is-${entry.tone}`}>{entry.text}</li>)}</ol>
        <div className={`ax-envelope-outcome is-${outcome.tone}`}>{outcome.text}</div>
        <div className="ax-equation">Useful autonomy = decision freedom + explicit boundaries</div>
      </div>
    </div>
  );
}

/* ─── 17 · Orchestration ────────────────────────────────────────────── */

export function OrchestrationView() {
  const [mode, setMode] = useState<"code" | "model">("code");
  return (
    <div className="ax-orch">
      <div className="ax-tabs" role="tablist" aria-label="Who orchestrates?">
        <button role="tab" aria-selected={mode === "code"} onClick={() => setMode("code")}><span>A</span>Deterministic orchestrator</button>
        <button role="tab" aria-selected={mode === "model"} onClick={() => setMode("model")}><span>B</span>Agentic orchestrator</button>
      </div>
      <div className={`ax-orch-diagram is-${mode}`}>
        <div className="ax-orch-root"><strong>Orchestrator</strong><small>{mode === "code" ? "state machine in code" : "supervisor model"}</small></div>
        <div className="ax-orch-children">
          <div className="is-agent"><strong>Agent</strong><small>decides within its step</small><span className="ax-orch-tools">Tools</span></div>
          <div><strong>RAG</strong><small>retrieve + generate</small></div>
          <div><strong>Rules</strong><small>eligibility, limits</small></div>
        </div>
      </div>
      <p className="ax-orch-note" aria-live="polite">
        {mode === "code"
          ? "Routing, sequencing and state transitions are ordinary code. The system still contains an agent—but the orchestrator is not one."
          : "A model decides which component runs next. This is a supervisor pattern: more flexible, harder to test, and in need of stronger bounds."}
      </p>
      <div className="ax-equation">Orchestrator ≠ agent</div>
    </div>
  );
}

/* ─── 18 · Pattern explorer ─────────────────────────────────────────── */

type PNode = { id: string; label: string; x: number; y: number; kind?: "model" | "human" | "code" | "end" };
type PEdge = { from: string; to: string; label?: string; bend?: number; back?: boolean };
type Pattern = { name: string; nodes: PNode[]; edges: PEdge[]; when: string; avoid: string; decides: string; example: string };

const patterns: Pattern[] = [
  {
    name: "Sequential pipeline", when: "The sequence is known and stable.", avoid: "Inputs vary so much that steps must be skipped or reordered.", decides: "Developer", example: "Extract → validate → summarise an invoice.",
    nodes: [{ id: "i", label: "Input", x: 60, y: 150, kind: "end" }, { id: "a", label: "Extract", x: 190, y: 150 }, { id: "b", label: "Validate", x: 320, y: 150, kind: "code" }, { id: "c", label: "Summarise", x: 450, y: 150 }, { id: "o", label: "Output", x: 580, y: 150, kind: "end" }],
    edges: [{ from: "i", to: "a" }, { from: "a", to: "b" }, { from: "b", to: "c" }, { from: "c", to: "o" }],
  },
  {
    name: "Router", when: "One runtime decision selects a branch.", avoid: "Branches need further dynamic decisions—consider an agent inside a branch.", decides: "Model once, then developer", example: "Classify a ticket to billing, support or sales.",
    nodes: [{ id: "i", label: "Input", x: 70, y: 150, kind: "end" }, { id: "r", label: "Router", x: 250, y: 150, kind: "model" }, { id: "a", label: "Billing", x: 500, y: 60, kind: "code" }, { id: "b", label: "Support", x: 500, y: 150, kind: "code" }, { id: "c", label: "Sales", x: 500, y: 240, kind: "code" }],
    edges: [{ from: "i", to: "r" }, { from: "r", to: "a" }, { from: "r", to: "b" }, { from: "r", to: "c" }],
  },
  {
    name: "Parallel fan-out", when: "Independent sub-tasks can run concurrently.", avoid: "Sub-tasks depend on each other's results.", decides: "Developer", example: "Check credit, identity and fraud signals at once.",
    nodes: [{ id: "i", label: "Input", x: 70, y: 150, kind: "end" }, { id: "a", label: "Credit", x: 300, y: 60 }, { id: "b", label: "Identity", x: 300, y: 150 }, { id: "c", label: "Fraud", x: 300, y: 240 }, { id: "g", label: "Aggregate", x: 540, y: 150, kind: "code" }],
    edges: [{ from: "i", to: "a" }, { from: "i", to: "b" }, { from: "i", to: "c" }, { from: "a", to: "g" }, { from: "b", to: "g" }, { from: "c", to: "g" }],
  },
  {
    name: "Agent loop", when: "The number and order of actions are unknown.", avoid: "The path is predictable—use a workflow.", decides: "Model", example: "Debug a failing build until the tests pass.",
    nodes: [{ id: "r", label: "Reason", x: 160, y: 80, kind: "model" }, { id: "a", label: "Act", x: 480, y: 80, kind: "code" }, { id: "o", label: "Observe", x: 320, y: 235 }],
    edges: [{ from: "r", to: "a", label: "tool call" }, { from: "a", to: "o", label: "result" }, { from: "o", to: "r", label: "new context", back: true }],
  },
  {
    name: "Planner–executor", when: "Long tasks benefit from an explicit, inspectable plan.", avoid: "The environment changes faster than the plan can be revised.", decides: "Model plans; executor follows", example: "Migrate a codebase module by module.",
    nodes: [{ id: "g", label: "Goal", x: 70, y: 120, kind: "end" }, { id: "p", label: "Planner", x: 225, y: 120, kind: "model" }, { id: "l", label: "Plan", x: 380, y: 120, kind: "code" }, { id: "e", label: "Executor", x: 545, y: 120 }],
    edges: [{ from: "g", to: "p" }, { from: "p", to: "l" }, { from: "l", to: "e" }, { from: "e", to: "p", label: "feedback · replan", bend: -110, back: true }],
  },
  {
    name: "Evaluator–optimiser", when: "Quality criteria are clear and iteration measurably helps.", avoid: "No reliable evaluator exists—the loop amplifies noise.", decides: "Evaluator", example: "Draft, critique and revise a translation.",
    nodes: [{ id: "g", label: "Generate", x: 90, y: 110, kind: "model" }, { id: "e", label: "Evaluate", x: 320, y: 110, kind: "model" }, { id: "f", label: "Finish", x: 555, y: 110, kind: "end" }, { id: "r", label: "Revise", x: 320, y: 245, kind: "model" }],
    edges: [{ from: "g", to: "e" }, { from: "e", to: "f", label: "accept" }, { from: "e", to: "r", label: "reject", bend: 45 }, { from: "r", to: "e", bend: 45, back: true }],
  },
  {
    name: "Human-in-the-loop", when: "Actions are high-impact, irreversible or regulated.", avoid: "Approvals are so frequent that people approve without reading.", decides: "Human at the gate", example: "Approve a payment above a threshold.",
    nodes: [{ id: "a", label: "Agent", x: 70, y: 130, kind: "model" }, { id: "p", label: "Proposal", x: 235, y: 130, kind: "code" }, { id: "h", label: "Approve?", x: 400, y: 130, kind: "human" }, { id: "x", label: "Execute", x: 565, y: 130, kind: "code" }],
    edges: [{ from: "a", to: "p" }, { from: "p", to: "h" }, { from: "h", to: "x", label: "yes" }, { from: "h", to: "a", label: "no · revise", bend: -120, back: true }],
  },
  {
    name: "Supervisor–specialist", when: "Sub-tasks need genuinely different tools, permissions or context.", avoid: "Specialists are only personas sharing the same tools.", decides: "Supervisor model", example: "Research, code and finance specialists on one proposal.",
    nodes: [{ id: "s", label: "Supervisor", x: 320, y: 65, kind: "model" }, { id: "r", label: "Research", x: 120, y: 235 }, { id: "c", label: "Code", x: 320, y: 235 }, { id: "f", label: "Finance", x: 520, y: 235 }],
    edges: [{ from: "s", to: "r", bend: 18 }, { from: "s", to: "c", bend: 18 }, { from: "s", to: "f", bend: 18 }, { from: "r", to: "s", bend: 18, back: true }, { from: "c", to: "s", bend: 18, back: true }, { from: "f", to: "s", bend: 18, back: true }],
  },
];

const NODE_W = 104;
const NODE_H = 48;

function trim(fromX: number, fromY: number, toX: number, toY: number) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const t = Math.min(Math.abs(dx) > 0 ? (NODE_W / 2 + 3) / Math.abs(dx) : Infinity, Math.abs(dy) > 0 ? (NODE_H / 2 + 3) / Math.abs(dy) : Infinity);
  return [fromX + dx * t, fromY + dy * t];
}

function PatternDiagram({ pattern }: { pattern: Pattern }) {
  const byId = Object.fromEntries(pattern.nodes.map((node) => [node.id, node]));
  return (
    <svg className="ax-pattern-svg" viewBox="0 0 640 300" role="img" aria-label={`${pattern.name} diagram`}>
      <defs>
        <marker id="ax-arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="#b3271f" /></marker>
        <marker id="ax-arrow-back" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="#1b7c89" /></marker>
      </defs>
      {pattern.edges.map((edge, index) => {
        const a = byId[edge.from];
        const b = byId[edge.to];
        const bend = edge.bend ?? 0;
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        const cx = mx + (-(b.y - a.y) / length) * bend;
        const cy = my + ((b.x - a.x) / length) * bend;
        const [sx, sy] = trim(a.x, a.y, bend ? cx : b.x, bend ? cy : b.y);
        const [ex, ey] = trim(b.x, b.y, bend ? cx : a.x, bend ? cy : a.y);
        const d = bend ? `M${sx},${sy} Q${cx},${cy} ${ex},${ey}` : `M${sx},${sy} L${ex},${ey}`;
        const lx = bend ? (sx + 2 * cx + ex) / 4 : mx;
        const ly = bend ? (sy + 2 * cy + ey) / 4 : my;
        return (
          <g key={`${edge.from}-${edge.to}-${index}`} className={`ax-pedge ${edge.back ? "is-back" : ""}`} style={{ "--i": index } as React.CSSProperties}>
            <path d={d} markerEnd={`url(#${edge.back ? "ax-arrow-back" : "ax-arrow"})`} />
            {edge.label && <text x={lx} y={ly - 9} textAnchor="middle">{edge.label}</text>}
          </g>
        );
      })}
      {pattern.nodes.map((node) => (
        <g key={node.id} className={`ax-pnode is-${node.kind ?? "step"}`}>
          <rect x={node.x - NODE_W / 2} y={node.y - NODE_H / 2} width={NODE_W} height={NODE_H} rx={node.kind === "end" ? 24 : 10} />
          <text x={node.x} y={node.y + 6} textAnchor="middle">{node.label}</text>
        </g>
      ))}
    </svg>
  );
}

export function PatternExplorer({ onSource }: { onSource: () => void }) {
  const [selected, setSelected] = useState(0);
  const pattern = patterns[selected];
  return (
    <div className="ax-patterns">
      <div className="ax-pattern-list" role="tablist" aria-label="Architectural patterns">
        {patterns.map((item, index) => (
          <button key={item.name} role="tab" aria-selected={selected === index} onClick={() => setSelected(index)}>
            <span>{String(index + 1).padStart(2, "0")}</span>{item.name}
          </button>
        ))}
      </div>
      <div className="ax-pattern-view" role="tabpanel">
        <div className="ax-pattern-figure" key={selected}><PatternDiagram pattern={pattern} /><span className="diagram-scroll-hint" aria-hidden="true">Scroll the diagram sideways →</span></div>
        <div className="ax-pattern-legend"><span className="is-model">model</span><span className="is-code">deterministic code</span><span className="is-human">human</span><span className="is-back">feedback edge</span></div>
        <dl className="ax-pattern-facts">
          <div><dt>Use when</dt><dd>{pattern.when}</dd></div>
          <div><dt>Avoid when</dt><dd>{pattern.avoid}</dd></div>
          <div><dt>Who decides next</dt><dd>{pattern.decides}</dd></div>
          <div><dt>Example</dt><dd>{pattern.example}</dd></div>
        </dl>
        <button className="lesson-action" onClick={onSource}>Pattern sources and further reading <span>↗</span></button>
      </div>
    </div>
  );
}

/* ─── 19 · Principle VI · should we split into multiple agents? ─────── */

const reasons: [string, boolean][] = [
  ["Different tools", true],
  ["Different permissions", true],
  ["Different context / knowledge", true],
  ["Different responsibilities", true],
  ["Different execution environment", true],
  ["It sounds sophisticated", false],
];

export function MultiAgentDecision() {
  const [checked, setChecked] = useState<number[]>([5]);
  const genuine = checked.filter((index) => reasons[index][1]).length;
  const verdict = genuine === 0
    ? { tone: "no", title: "Keep a single agent.", text: "Nothing structural differs. Two prompts with different names are a persona, not an architecture." }
    : genuine === 1
      ? { tone: "maybe", title: "Probably one agent with scoped tools—or a router.", text: "One difference can often be handled by conditional tools or a routing step. Splitting adds handoffs, latency and failure modes." }
      : { tone: "yes", title: "Decomposition has architectural value.", text: "Separate agents now encapsulate real boundaries: distinct capabilities, access and context that should not be mixed." };
  return (
    <div className="ax-multi">
      <div className="ax-multi-q">
        <span className="lesson-label">Proposal: split into a Finance agent and a Legal agent</span>
        <p>What genuinely differs between them?</p>
        <div className="ax-checks">
          {reasons.map(([reason, valid], index) => (
            <button key={reason} className={`${checked.includes(index) ? "is-active" : ""} ${valid ? "" : "is-poor"}`} aria-pressed={checked.includes(index)} onClick={() => setChecked(checked.includes(index) ? checked.filter((i) => i !== index) : [...checked, index])}>
              <i aria-hidden="true">{checked.includes(index) ? "✓" : ""}</i>{reason}
            </button>
          ))}
        </div>
      </div>
      <div className={`ax-multi-verdict is-${verdict.tone}`} aria-live="polite">
        <strong>{verdict.title}</strong>
        <p>{verdict.text}</p>
        {genuine >= 2 && (
          <div className="ax-multi-agents">
            <div><b>Finance agent</b><span>finance tools</span><span>ledger: read/write</span><span>finance context</span></div>
            <div><b>Legal agent</b><span>legal knowledge base</span><span>restricted documents</span><span>read-only</span></div>
          </div>
        )}
      </div>
      <div className="ax-equation">A persona is not an architecture.</div>
    </div>
  );
}

/* ─── 20 · Frameworks come last ─────────────────────────────────────── */

const frameworks: [string, string][] = [
  ["LangGraph", "Graph-based, stateful orchestration with checkpoints and human-in-the-loop interrupts."],
  ["Strands Agents", "Model-driven agent loop from AWS: a model, a prompt and a set of tools."],
  ["OpenAI Agents SDK", "Lightweight agents with tools, handoffs, guardrails and tracing."],
  ["Microsoft Agent Framework", "Microsoft's agent framework, bringing together ideas from AutoGen and Semantic Kernel."],
  ["Semantic Kernel", "SDK for integrating models into applications through plugins and planners."],
  ["LlamaIndex", "Data framework: indexing, retrieval, agents and event-driven workflows."],
];

export function FrameworkMap() {
  return (
    <div className="ax-frameworks">
      <div className="ax-framework-orders">
        <div className="is-right">
          <span className="ax-mark">✓</span>
          <Chain items={["Architecture", "Patterns", "Implementation choice", "Framework"]} vertical />
        </div>
        <div className="is-wrong">
          <span className="ax-mark">✕</span>
          <Chain items={["Framework", "Architecture"]} vertical />
          <p>The tool's defaults quietly become your design.</p>
        </div>
      </div>
      <div className="ax-framework-grid">
        {frameworks.map(([name, text]) => <div key={name}><strong>{name}</strong><span>{text}</span></div>)}
      </div>
    </div>
  );
}
