import React, { useMemo, useState } from "react";
import { ROMAN } from "../lesson/LessonPlayer";
import { concernLabels, principles, vocabulary, type Concern } from "./data";

/* ─── 21 · Principle VII · design for failure ───────────────────────── */

const pipeline = ["Context", "Model decision", "Tool request", "Tool", "Result", "State", "Loop"];
const mitigations = ["Retries", "Fallbacks", "Timeouts", "Validation", "Idempotency", "Circuit breakers", "State recovery", "Human escalation"];
const failures: { name: string; stage: number; detect: string; recover: string; uses: string[] }[] = [
  { name: "Wrong tool selected", stage: 1, detect: "Per-step tool allow-list rejects the call.", recover: "Return the rejection as an observation so the model re-plans with the permitted tools.", uses: ["Validation"] },
  { name: "Wrong arguments", stage: 2, detect: "Schema validation fails before execution.", recover: "Send the validation error back for correction, at most twice, then escalate.", uses: ["Validation", "Retries", "Human escalation"] },
  { name: "Tool unavailable", stage: 3, detect: "Health check or 503 response.", recover: "Circuit breaker stops hammering the service; a fallback provider or queued retry takes over.", uses: ["Circuit breakers", "Fallbacks"] },
  { name: "Timeout", stage: 3, detect: "Deadline exceeded.", recover: "Retry with backoff, using an idempotency key so a slow success is not executed twice.", uses: ["Timeouts", "Retries", "Idempotency"] },
  { name: "Malformed response", stage: 4, detect: "Parser or schema check on the tool output.", recover: "Retry once, then fall back to a safe default path.", uses: ["Validation", "Retries", "Fallbacks"] },
  { name: "Retrieval failure", stage: 0, detect: "Empty results or low relevance scores.", recover: "Rewrite the query; if still empty, answer “I don't know” instead of guessing.", uses: ["Fallbacks", "Validation"] },
  { name: "Repeated loop", stage: 6, detect: "Same action + arguments seen three times; step budget.", recover: "Stop the loop, return partial progress and escalate.", uses: ["Human escalation"] },
  { name: "Hallucinated assumption", stage: 1, detect: "Grounding check: claims must cite an observation.", recover: "Insert a verification step before any action that depends on the claim.", uses: ["Validation"] },
  { name: "Conflicting state", stage: 5, detect: "Version mismatch on write.", recover: "Reload from the source of truth or restore the last checkpoint, then continue.", uses: ["State recovery", "Idempotency"] },
  { name: "Permission failure", stage: 3, detect: "403 from the authorisation layer.", recover: "Never retry around a denial. Explain and escalate to a human.", uses: ["Human escalation"] },
];

export function FailureInjector() {
  const [selected, setSelected] = useState(3);
  const failure = failures[selected];
  return (
    <div className="ax-failure">
      <div className="ax-failure-list" role="group" aria-label="Inject a failure">
        {failures.map((item, index) => (
          <button key={item.name} className={selected === index ? "is-active" : ""} aria-pressed={selected === index} onClick={() => setSelected(index)}>{item.name}</button>
        ))}
      </div>
      <div className="ax-failure-view" aria-live="polite">
        <ol className="ax-failure-pipeline">
          {pipeline.map((stage, index) => <li key={stage} className={failure.stage === index ? "is-hit" : index < failure.stage ? "is-ok" : ""}>{stage}{failure.stage === index && <b aria-hidden="true">⚡</b>}</li>)}
        </ol>
        <dl>
          <div><dt>Detect</dt><dd>{failure.detect}</dd></div>
          <div><dt>Recover</dt><dd>{failure.recover}</dd></div>
        </dl>
        <div className="ax-mitigations">
          {mitigations.map((name) => <span key={name} className={failure.uses.includes(name) ? "is-used" : ""}>{name}</span>)}
        </div>
      </div>
    </div>
  );
}

/* ─── 22 · Principle VIII · observability ───────────────────────────── */

type Span = { name: string; kind: "run" | "model" | "tool" | "guard"; start: number; end: number; attrs: [string, string][]; error?: boolean };
const spans: Span[] = [
  { name: "agent.run", kind: "run", start: 0, end: 4.3, attrs: [["request", "“Why was my refund declined?”"], ["user", "customer 123 (authenticated)"], ["outcome", "answered · 3 model calls · 2 tool calls (1 retried)"], ["tokens", "6,840"], ["cost", "$0.021"]] },
  { name: "model.call #1", kind: "model", start: 0, end: 0.8, attrs: [["context", "instructions + user message"], ["decision", "call orders.lookup"], ["tokens", "1,410"], ["latency", "0.80 s"]] },
  { name: "tool.orders.lookup", kind: "tool", start: 0.8, end: 1.2, attrs: [["arguments", '{ "customer_id": 123 }'], ["result", "order 4471 · refund R-22 · declined"], ["latency", "0.40 s"]] },
  { name: "model.call #2", kind: "model", start: 1.2, end: 1.9, attrs: [["decision", "call policy.get(refunds)"], ["reasoning summary", "needs the rule behind the decline"], ["tokens", "1,960"]] },
  { name: "tool.policy.get", kind: "tool", start: 1.9, end: 2.9, error: true, attrs: [["attempt 1", "timeout after 0.6 s"], ["attempt 2", "200 OK (retry, same idempotency key)"], ["result", "refunds require return within 30 days"], ["state transition", "step 3 → 4"]] },
  { name: "model.call #3", kind: "model", start: 2.9, end: 3.8, attrs: [["context", "order + policy observations"], ["output", "draft answer citing the 30-day rule"], ["tokens", "3,470"]] },
  { name: "guardrail.output", kind: "guard", start: 3.8, end: 4.3, attrs: [["checks", "PII · policy citation present · tone"], ["result", "pass"]] },
];
const TOTAL = 4.3;

export function TraceViewer() {
  const [selected, setSelected] = useState(4);
  const span = spans[selected];
  return (
    <div className="ax-trace">
      <div className="ax-trace-head"><span>trace 9f1c…e2 · refund question</span><span>0 s</span><span>{TOTAL} s</span></div>
      <div className="ax-trace-rows" role="list">
        {spans.map((item, index) => (
          <button
            key={item.name}
            role="listitem"
            className={`is-${item.kind} ${selected === index ? "is-active" : ""} ${item.error ? "has-error" : ""}`}
            onClick={() => setSelected(index)}
            aria-label={`${item.name}, ${(item.end - item.start).toFixed(1)} seconds${item.error ? ", includes a retried error" : ""}`}
          >
            <span className="ax-trace-name">{index > 0 && <i aria-hidden="true">└</i>}{item.name}</span>
            <span className="ax-trace-track"><b style={{ left: `${(item.start / TOTAL) * 100}%`, width: `${((item.end - item.start) / TOTAL) * 100}%` }} /></span>
            <span className="ax-trace-dur">{(item.end - item.start).toFixed(1)}s</span>
          </button>
        ))}
      </div>
      <div className="ax-trace-attrs" aria-live="polite">
        <span className="lesson-label">Span attributes · {span.name}</span>
        <dl>{span.attrs.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>
      </div>
    </div>
  );
}

/* ─── 23 · Principle IX · security ──────────────────────────────────── */

const boundaries: { name: string; between: string; threats: string[]; controls: string[] }[] = [
  { name: "Input boundary", between: "User → model", threats: ["Prompt injection", "Jailbreak attempts", "Impersonation"], controls: ["Authentication", "Input filtering", "Instruction hierarchy"] },
  { name: "Context boundary", between: "Retrieved data → model", threats: ["Malicious retrieved data", "Indirect prompt injection", "Poisoned documents"], controls: ["Treat content as data", "Source allow-lists", "Provenance tagging"] },
  { name: "Action boundary", between: "Model → tool", threats: ["Tool misuse", "Excessive permissions", "Unsafe generated commands"], controls: ["Least privilege", "Policy enforcement", "Sandboxing", "Human approval"] },
  { name: "Egress boundary", between: "System → world", threats: ["Data leakage", "Credential exposure", "Exfiltration via links"], controls: ["Output guardrails", "Secret isolation", "Egress allow-lists", "Audit"] },
];

export function SecurityBoundaries() {
  const [selected, setSelected] = useState(2);
  const boundary = boundaries[selected];
  const nodes = ["User", "Model", "Tool", "External system"];
  return (
    <div className="ax-security">
      <div className="ax-sec-map">
        <button className={`ax-sec-data ${selected === 1 ? "is-active" : ""}`} onClick={() => setSelected(1)}>Retrieved data <span aria-hidden="true">↘ model</span></button>
        <div className="ax-sec-row">
          {nodes.map((node, index) => (
            <React.Fragment key={node}>
              <span className="ax-sec-node">{node}</span>
              {index < nodes.length - 1 && (
                <button className={`ax-sec-edge ${selected === [0, 2, 3][index] ? "is-active" : ""}`} onClick={() => setSelected([0, 2, 3][index])} aria-label={boundaries[[0, 2, 3][index]].name}>
                  <i aria-hidden="true" />
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="ax-sec-tabs" role="tablist" aria-label="Trust boundaries">
          {boundaries.map((item, index) => (
            <button key={item.name} role="tab" aria-selected={selected === index} onClick={() => setSelected(index)}><strong>{item.name}</strong><span>{item.between}</span></button>
          ))}
        </div>
      </div>
      <div className="ax-sec-detail" aria-live="polite">
        <div><span className="lesson-label">Threats entering here</span><ul>{boundary.threats.map((threat) => <li key={threat}>{threat}</li>)}</ul></div>
        <div><span className="lesson-label">Controls outside the model</span><ul>{boundary.controls.map((control) => <li key={control}>{control}</li>)}</ul></div>
      </div>
    </div>
  );
}

/* ─── 24 · Principle X · evaluate the system ────────────────────────── */

const metrics: [string, number, number, boolean?][] = [
  ["Task completion", 71, 88],
  ["Correct tool selection", 84, 93],
  ["Correct tool arguments", 79, 96],
  ["Retrieval quality", 62, 85],
  ["Recovery after tool error", 38, 81],
  ["Policy violations", 7, 1, true],
  ["Cost per task (¢)", 42, 11, true],
  ["p95 latency (s)", 19, 8, true],
];

export function EvaluationScorecard() {
  const [view, setView] = useState<"model" | "system">("model");
  return (
    <div className="ax-eval">
      <div className="ax-tabs" role="tablist" aria-label="Evaluation view">
        <button role="tab" aria-selected={view === "model"} onClick={() => setView("model")}><span>A</span>Model benchmark</button>
        <button role="tab" aria-selected={view === "system"} onClick={() => setView("system")}><span>B</span>System evaluation</button>
      </div>
      <div className="ax-eval-systems"><span className="is-a">System A · frontier model, thin harness</span><span className="is-b">System B · smaller model, engineered harness</span></div>
      {view === "model" ? (
        <div className="ax-eval-bars">
          <div className="ax-eval-row"><span>Reasoning benchmark</span><div><b className="is-a" style={{ width: "92%" }}>92</b><b className="is-b" style={{ width: "78%" }}>78</b></div></div>
          <p className="ax-eval-verdict">On the model benchmark, A clearly wins.</p>
        </div>
      ) : (
        <div className="ax-eval-bars">
          {metrics.map(([name, a, b, lower]) => {
            const max = Math.max(a, b, 1);
            return (
              <div className="ax-eval-row" key={name}>
                <span>{name}{lower && <small> · lower is better</small>}</span>
                <div><b className="is-a" style={{ width: `${(a / max) * 100}%` }}>{a}</b><b className="is-b" style={{ width: `${(b / max) * 100}%` }}>{b}</b></div>
              </div>
            );
          })}
          <p className="ax-eval-verdict">Measured on real tasks, B is the better system.</p>
        </div>
      )}
      <p className="ax-illustrative">Illustrative figures for teaching, not measured results.</p>
      <div className="ax-equation">System quality ≠ model quality</div>
    </div>
  );
}

/* ─── 25 · Sort the vocabulary ──────────────────────────────────────── */

export function VocabularySort() {
  const [placed, setPlaced] = useState<Record<string, Concern>>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [miss, setMiss] = useState<Concern | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const order = useMemo(() => [...vocabulary].sort((a, b) => ((a.term.length * 7) % 11) - ((b.term.length * 7) % 11) || a.term.localeCompare(b.term)), []);
  const pool = order.filter((term) => !placed[term.term]);
  const pickedTerm = vocabulary.find((term) => term.term === picked);
  const infoTerm = vocabulary.find((term) => term.term === info);

  const drop = (concern: Concern) => {
    if (!pickedTerm) return;
    if (pickedTerm.concern === concern) {
      setPlaced({ ...placed, [pickedTerm.term]: concern });
      setInfo(pickedTerm.term);
      setPicked(null);
      setMiss(null);
    } else {
      setMiss(concern);
    }
  };

  return (
    <div className="ax-sort">
      <div className="ax-sort-status">
        <span>{Object.keys(placed).length} / {vocabulary.length} placed</span>
        <span aria-live="polite">
          {pickedTerm
            ? miss ? `Not “${concernLabels[miss].label}”. Ask: which question does ${pickedTerm.term} answer?` : `Now choose a home for “${pickedTerm.term}”.`
            : pool.length ? "Pick a term, then the concern it belongs to." : "Every term has somewhere to belong."}
        </span>
        <button className="ax-button" onClick={() => { setPlaced(Object.fromEntries(vocabulary.map((term) => [term.term, term.concern]))); setPicked(null); setMiss(null); }}>Reveal all</button>
        {Object.keys(placed).length > 0 && <button className="ax-button" onClick={() => { setPlaced({}); setInfo(null); }}>Reset</button>}
      </div>
      {pool.length > 0 && (
        <div className="ax-sort-pool">
          {pool.map((term) => (
            <button key={term.term} className={picked === term.term ? "is-picked" : ""} aria-pressed={picked === term.term} onClick={() => { setPicked(picked === term.term ? null : term.term); setMiss(null); }}>{term.term}</button>
          ))}
        </div>
      )}
      <div className="ax-sort-bins">
        {(Object.keys(concernLabels) as Concern[]).map((concern) => (
          <div
            key={concern}
            className={`ax-bin ${pickedTerm ? "is-target" : ""} ${miss === concern ? "is-miss" : ""}`}
            role={pickedTerm ? "button" : undefined}
            tabIndex={pickedTerm ? 0 : -1}
            onClick={() => drop(concern)}
            onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); drop(concern); } }}
            aria-label={pickedTerm ? `Place ${pickedTerm.term} in ${concernLabels[concern].label}` : undefined}
          >
            <strong>{concernLabels[concern].label}</strong>
            <small>{concernLabels[concern].question}</small>
            <div>
              {vocabulary.filter((term) => placed[term.term] === concern).map((term) => (
                <span key={term.term} className={info === term.term ? "is-info" : ""} onClick={(event) => { event.stopPropagation(); setInfo(term.term); }}>{term.term}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      {infoTerm && <p className="ax-sort-info"><b>{infoTerm.term}</b> {infoTerm.definition}</p>}
    </div>
  );
}

/* ─── 26 · Principles and a design review ───────────────────────────── */

const review: { scenario: string; answer: number; options: number[] }[] = [
  { scenario: "A team wraps a currency-conversion API in an agent “for flexibility”.", answer: 2, options: [1, 2, 6, 10] },
  { scenario: "The model is given the payments API key and calls the API directly.", answer: 3, options: [3, 4, 5, 8] },
  { scenario: "Five “expert” agents share the same tools, permissions and context.", answer: 6, options: [4, 6, 7, 9] },
  { scenario: "After an incident, nobody can explain why the refund was issued.", answer: 8, options: [5, 7, 8, 10] },
];

export function PrinciplesRecap() {
  const [question, setQuestion] = useState(0);
  const [choices, setChoices] = useState<(number | null)[]>(() => review.map(() => null));
  const item = review[question];
  const choice = choices[question];
  return (
    <div className="ax-recap">
      <ol className="ax-principles">
        {principles.map(([title, gloss], index) => (
          <li key={title} className={choice !== null && item.answer === index + 1 ? "is-highlight" : ""}>
            <b>{ROMAN[index]}</b><div><strong>{title}</strong><span>{gloss}</span></div>
          </li>
        ))}
      </ol>
      <div className="ax-review">
        <span className="lesson-label">Design review · {question + 1} of {review.length}</span>
        <p>{item.scenario}</p>
        <span className="ax-review-ask">Which principle is violated?</span>
        <div className="ax-review-options">
          {item.options.map((option) => (
            <button
              key={option}
              disabled={choice !== null}
              className={choice === option ? (option === item.answer ? "is-correct" : "is-wrong") : choice !== null && option === item.answer ? "is-correct" : ""}
              onClick={() => setChoices(choices.map((value, i) => (i === question ? option : value)))}
            >
              <b>{ROMAN[option - 1]}</b>{principles[option - 1][0]}
            </button>
          ))}
        </div>
        {choice !== null && <p className="check-feedback" aria-live="polite">{choice === item.answer ? "Correct." : `Principle ${ROMAN[item.answer - 1]} is the one at stake.`} {principles[item.answer - 1][1]}</p>}
        <button className="ax-button" onClick={() => setQuestion((question + 1) % review.length)}>Next case <span aria-hidden="true">→</span></button>
      </div>
    </div>
  );
}
