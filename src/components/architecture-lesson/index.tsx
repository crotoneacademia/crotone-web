import React, { useCallback } from "react";
import LessonPlayer, { LectureScene, type DeepDive, type LessonSlide } from "../lesson/LessonPlayer";
import { concernLabels, vocabulary, type Concern } from "./data";
import {
  ArchitectureLadder, ConcernStack, ControlContinuum, ReferenceArchitecture, TriageExercise, VocabularyWall, WorkflowVsAgent,
} from "./foundations";
import {
  AuthoritySimulator, ConceptTable, ContextStateMemory, HarnessToggle, McpDiagram, ModelBoundary, ToolChain,
} from "./components";
import {
  AgentLoopEngine, AutonomyEnvelope, FrameworkMap, MultiAgentDecision, OrchestrationView, PatternExplorer,
} from "./runtime";
import {
  EvaluationScorecard, FailureInjector, PrinciplesRecap, SecurityBoundaries, TraceViewer, VocabularySort,
} from "./production";

type Phase = "vocabulary" | "agency" | "reference" | "runtime" | "patterns" | "production" | "synthesis";

const phaseLabels: Record<Phase, string> = {
  vocabulary: "The vocabulary problem",
  agency: "From inference to agency",
  reference: "Reference architecture",
  runtime: "Harness and loop",
  patterns: "Patterns and topology",
  production: "Production principles",
  synthesis: "Synthesis",
};

const deepDives: Record<string, DeepDive> = {
  glossary: {
    kicker: "Reference · 38 terms, 8 concerns",
    title: "Agentic AI glossary",
    content: (
      <div className="ax-glossary">
        {(Object.keys(concernLabels) as Concern[]).map((concern) => (
          <section key={concern}>
            <h3>{concernLabels[concern].label}<small>{concernLabels[concern].question}</small></h3>
            <dl>
              {vocabulary.filter((term) => term.concern === concern).map((term) => (
                <div key={term.term}><dt>{term.term}</dt><dd>{term.definition}</dd></div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    ),
  },
  patterns: {
    kicker: "Further reading · Patterns",
    title: "Start with the simplest pattern that works.",
    content: (
      <>
        <p>
          Anthropic's engineering guidance distinguishes <em>workflows</em>, where
          models and tools are orchestrated through predefined code paths, from
          <em> agents</em>, where models dynamically direct their own process and
          tool use. It describes prompt chaining, routing, parallelisation,
          orchestrator–workers and evaluator–optimiser as building blocks.
        </p>
        <div className="lesson-callout">
          <strong>The recurring advice</strong>
          Add agentic complexity only when it demonstrably improves outcomes, and
          keep the agent's tools, instructions and stopping conditions simple and
          transparent.
        </div>
        <p>
          ReAct (Yao et al., 2022) introduced the interleaving of reasoning traces
          with actions and observations that underlies most modern agent loops.
        </p>
      </>
    ),
    source: ["Read “Building effective agents”", "https://www.anthropic.com/engineering/building-effective-agents"],
  },
  mcp: {
    kicker: "Interoperability · Model Context Protocol",
    title: "MCP standardises connections, not decisions.",
    content: (
      <>
        <p>
          In MCP, a <em>host</em> application runs one or more <em>clients</em>,
          each connected to a <em>server</em>. Servers expose three kinds of
          primitive: <strong>tools</strong> the model may invoke,
          <strong> resources</strong> that supply context, and
          <strong> prompts</strong> offered as reusable templates.
        </p>
        <div className="lesson-callout">
          <strong>Architectural placement</strong>
          MCP sits on the boundary between the harness and external capabilities.
          Authorisation, approval and limits are still your system's
          responsibility.
        </div>
      </>
    ),
    source: ["Read the MCP specification", "https://modelcontextprotocol.io"],
  },
};

export default function ArchitectureLesson() {
  const buildSlides = useCallback((setDetail: (id: string) => void): LessonSlide<Phase>[] => [
    {
      phase: "vocabulary",
      eyebrow: "Lesson 02 · The Agentic AI vocabulary problem",
      content: (
        <LectureScene
          number="01"
          title={<>Agentic AI arrives with a <em>wall of words</em>.</>}
          intro="Agents, harnesses, orchestrators, MCP, A2A, ReAct, supervisors, frameworks… The terminology grows faster than the ideas underneath it. This lesson takes a different route through it."
          points={[
            "Many terms describe the same concern at different levels: a pattern, a protocol and a product can all be called “agentic”.",
            "Memorising the list does not tell you how to design a system.",
            "Every term on this wall will have a precise home by the end of the lesson.",
          ]}
          takeaway="Agentic AI is best understood as a systems-architecture problem, not a collection of buzzwords."
        >
          <VocabularyWall />
        </LectureScene>
      ),
    },
    {
      phase: "vocabulary",
      eyebrow: "The lesson in one frame",
      content: (
        <LectureScene
          number="02"
          title={<>Seven architectural concerns organise <em>almost everything</em>.</>}
          intro="Goal, reasoning, control flow, state, capabilities, environment and controls. Nearly every agentic term refines one of these concerns. We learn the architecture first; the vocabulary then has somewhere to belong."
          points={[
            "Select each concern to see the question it answers and the vocabulary it absorbs.",
            "The lesson answers three questions: components, patterns and principles.",
            "Ten named design principles will be collected as we go. Track them in the rail.",
          ]}
          takeaway="Learn the architecture first. The terminology then falls naturally into place."
        >
          <ConcernStack />
        </LectureScene>
      ),
    },
    {
      phase: "agency",
      eyebrow: "Start from the simplest AI architecture",
      content: (
        <LectureScene
          number="03"
          title={<>When does a system become <em>agentic</em>?</>}
          intro="Add one capability at a time to a plain model call. Retrieval adds knowledge; tools add action. Neither, on its own, makes the system agentic. The transition happens when decisions begin to steer what happens next."
          points={[
            "Model inference: one input, one output, one path.",
            "RAG and single tool calls still follow a path the developer fixed in advance.",
            "The loop matters: observe, decide, act, observe again, and decide whether to stop.",
          ]}
          takeaway="Agentic behaviour begins when decision-making influences control flow and action at runtime."
        >
          <ArchitectureLadder />
        </LectureScene>
      ),
    },
    {
      phase: "agency",
      principle: 1,
      eyebrow: "Architecture principle I",
      content: (
        <LectureScene
          number="04"
          principle={1}
          title={<>Separate reasoning from <em>control flow</em>.</>}
          intro="The presence of an LLM is not the difference. The question is who determines the next step. In a workflow, the developer defines control flow. In an agentic system, some of those decisions are delegated to the model at runtime."
          points={[
            "Agenticity is a continuum, not a binary label.",
            "Each step to the right trades predictability for adaptability.",
            "Design explicitly: which transitions does code own, and which may the model choose?",
          ]}
          takeaway="Agenticity ≈ the degree of runtime decision authority delegated to the model."
        >
          <ControlContinuum />
        </LectureScene>
      ),
    },
    {
      phase: "agency",
      eyebrow: "Formalising the distinction",
      content: (
        <LectureScene
          number="05"
          title={<>A workflow encodes a path. An agent <em>selects</em> one.</>}
          intro="A workflow is an explicit execution structure whose sequence and transitions are known beforehand. An agent holds decision authority over some part of execution. Send three different requests through both and compare."
          points={[
            "The workflow runs the same five steps whatever arrives.",
            "The agent's path depends on what it discovers along the way.",
            "Production systems usually combine both: agents inside workflows, workflows as tools.",
          ]}
          takeaway="A workflow encodes a path. An agent selects a path. Real systems frequently contain both."
        >
          <WorkflowVsAgent />
        </LectureScene>
      ),
    },
    {
      phase: "agency",
      principle: 2,
      eyebrow: "Architecture principle II",
      content: (
        <LectureScene
          number="06"
          principle={2}
          title={<>Do not use an agent where a <em>function</em> will do.</>}
          intro="Use deterministic software wherever uncertainty is unnecessary. Runtime decision authority costs latency, money, testability and predictability. Spend it only where the path genuinely depends on what is discovered."
          points={[
            "Retrieving a balance has a known path: authenticate, validate, call, return.",
            "Investigating a stalled mortgage does not: the next step depends on the evidence.",
            "Using a model inside a step does not make that step an agent.",
          ]}
          takeaway="Use deterministic software wherever uncertainty is unnecessary."
        >
          <TriageExercise />
        </LectureScene>
      ),
    },
    {
      phase: "reference",
      eyebrow: "A reference architecture for Agentic AI",
      content: (
        <LectureScene
          number="07"
          title={<>One architecture to place <em>every component</em>.</>}
          intro="Requests enter through an interface, are coordinated by orchestration, reasoned over inside an agent harness, and act through tools on external systems. Controls cut across every layer. The rest of the lesson zooms into this map."
          points={[
            "Orchestration can combine workflows, agents and rules. It is not the same as an agent.",
            "The harness wraps the model with state, memory and loop machinery.",
            "Identity, permissions, guardrails, approval, observability and evaluation apply everywhere.",
          ]}
          takeaway="Every buzzword can be placed somewhere on this architecture."
        >
          <ReferenceArchitecture />
        </LectureScene>
      ),
    },
    {
      phase: "reference",
      eyebrow: "Component · The model",
      content: (
        <LectureScene
          number="08"
          title={<>The model is a reasoning component, <em>not the system</em>.</>}
          intro="A foundation model contributes language understanding, semantic reasoning, extraction, planning, tool selection and generation. It does not bring state, truth guarantees, data access, credentials, permissions or loop control."
          points={[
            "Each missing property is supplied by a specific part of the surrounding system.",
            "Treating the model as the whole system is the root of many production failures.",
            "A better model improves one component. The architecture determines the rest.",
          ]}
          takeaway="The model is a reasoning component, not the whole system."
        >
          <ModelBoundary />
        </LectureScene>
      ),
    },
    {
      phase: "reference",
      eyebrow: "Component · State, context and memory",
      content: (
        <LectureScene
          number="09"
          title={<>Context, state and memory are <em>three different things</em>.</>}
          intro="Follow one mortgage enquiry across two turns and a new session the next day. Watch what enters the model's context, what the system records about execution, and what it deliberately retains."
          points={[
            "Context is rebuilt on every call. It is what this invocation sees.",
            "State is structured, owned by the system, and survives beyond one call through checkpoints.",
            "Memory is a design decision: what to keep, for how long, and for whom.",
          ]}
          takeaway="Context is what the model sees. State is what the system knows about execution. Memory is what the system deliberately retains."
        >
          <ContextStateMemory />
        </LectureScene>
      ),
    },
    {
      phase: "reference",
      eyebrow: "Component · Tools",
      content: (
        <LectureScene
          number="10"
          title={<>The LLM proposes the tool call. <em>Software executes it.</em></>}
          intro="A tool is a capability that lets the agent obtain information or affect an external environment. Between the model's request and the real effect sits a chain of ordinary, deterministic software."
          points={[
            "Function calling produces a structured request, not an action.",
            "The harness validates arguments and checks authorisation before anything runs.",
            "The result returns as an observation: new context for the next decision.",
          ]}
          takeaway="The LLM proposes the tool call. Software executes it."
        >
          <ToolChain />
        </LectureScene>
      ),
    },
    {
      phase: "reference",
      principle: 3,
      eyebrow: "Architecture principle III",
      content: (
        <LectureScene
          number="11"
          principle={3}
          title={<>Separate decision authority from <em>execution authority</em>.</>}
          intro="A model may decide “transfer $500”. That does not mean it should hold unrestricted credentials. Configure the request, then run it through the gates. Try a large amount, a new payee, or an instruction smuggled in through a retrieved email."
          points={[
            "The model's output is a structured request, evaluated by deterministic policy.",
            "Human approval is triggered by risk, not by default.",
            "The executor holds a scoped credential the model never sees.",
          ]}
          takeaway="Decision authority can be probabilistic. Execution authority must be deterministic and permissioned."
        >
          <AuthoritySimulator />
        </LectureScene>
      ),
    },
    {
      phase: "reference",
      eyebrow: "Interoperability · APIs, protocols and MCP",
      content: (
        <LectureScene
          number="12"
          title={<>MCP solves an <em>integration</em> problem.</>}
          intro="An API defines what operations a system exposes. A protocol defines how systems communicate. MCP is a protocol for connecting AI applications to tools, resources and prompts in a standard way. Agent-to-agent protocols address a parallel concern between agents."
          points={[
            "MCP replaces many bespoke integrations with one standard interface.",
            "It does not decide, plan, orchestrate or authorise.",
            "Flip each myth to test your model of where MCP sits.",
          ]}
          takeaway="MCP is not an agent, not an orchestration framework, and does not make a system agentic."
        >
          <McpDiagram />
          <button className="lesson-action" onClick={() => setDetail("mcp")}>How MCP is structured <span>↗</span></button>
        </LectureScene>
      ),
    },
    {
      phase: "reference",
      principle: 4,
      eyebrow: "Architecture principle IV",
      content: (
        <LectureScene
          number="13"
          principle={4}
          title={<>Separate architecture from <em>implementation technology</em>.</>}
          intro="Much confusion comes from answering one question with a term that belongs to another. Before revealing each row, say aloud which question the concept answers."
          points={[
            "Agent, workflow and harness describe architecture.",
            "Pattern describes organisation; protocol and API describe interfaces.",
            "A framework is an implementation choice that should follow the design.",
          ]}
          takeaway="Name the question first. Then choose the concept, and only then the technology."
        >
          <ConceptTable />
        </LectureScene>
      ),
    },
    {
      phase: "runtime",
      eyebrow: "Deep dive · The agent harness",
      content: (
        <LectureScene
          number="14"
          title={<>Most production engineering happens <em>in the harness</em>.</>}
          intro="The harness is the machinery around the model: instructions, tools, memory, state, loop control, validation, permissions, guardrails, retries, approval, tracing and cost limits. Switch components off and read the incident log."
          points={[
            "Each harness component exists because of a specific failure mode.",
            "Capability, control, safety and operations are distinct responsibilities.",
            "Swapping in a stronger model fixes none of these incidents.",
          ]}
          takeaway="Most production Agentic AI engineering happens in the harness rather than inside the foundation model."
        >
          <HarnessToggle />
        </LectureScene>
      ),
    },
    {
      phase: "runtime",
      eyebrow: "Formalising the agent loop",
      content: (
        <LectureScene
          number="15"
          title={<>A loop is only as good as its <em>stop conditions</em>.</>}
          intro="Goal, observe, decide, select, execute, observe the result, update state, then continue or stop. Run four scenarios and see which stop condition ends each one."
          points={[
            "Stopping is a design decision, not an afterthought.",
            "Success must be defined as a checkable condition.",
            "Failure paths should end with preserved progress and a clear escalation.",
          ]}
          takeaway="Every agent loop needs explicit, observable reasons to stop."
          wide
        >
          <AgentLoopEngine />
        </LectureScene>
      ),
    },
    {
      phase: "runtime",
      principle: 5,
      eyebrow: "Architecture principle V",
      content: (
        <LectureScene
          number="16"
          principle={5}
          title={<>Autonomy must be <em>bounded</em>, not assumed.</>}
          intro="Autonomy never simply means “let the agent keep going”. It is the freedom to decide inside an explicit envelope of tools, data, actions, steps, cost, time and approvals. Adjust the envelope and watch the same task change outcome."
          points={[
            "Tight bounds produce safe, partial results. Loose bounds produce risk.",
            "Approval thresholds turn high-impact actions into human decisions.",
            "Every boundary is enforced by the harness, never by the prompt alone.",
          ]}
          takeaway="Useful autonomy = decision freedom + explicit boundaries."
        >
          <AutonomyEnvelope />
        </LectureScene>
      ),
    },
    {
      phase: "runtime",
      eyebrow: "Coordination · Orchestration",
      content: (
        <LectureScene
          number="17"
          title={<>An orchestrator coordinates. It need not <em>decide</em>.</>}
          intro="Orchestration is the mechanism that coordinates execution, routing, state transitions and interactions across components. It can be a plain state machine or a supervising model."
          points={[
            "Deterministic orchestrators are testable, cheap and predictable.",
            "Agentic orchestrators trade predictability for flexibility.",
            "Many good systems place an agent inside a deterministic orchestrator.",
          ]}
          takeaway="Orchestrator ≠ agent."
        >
          <OrchestrationView />
        </LectureScene>
      ),
    },
    {
      phase: "patterns",
      eyebrow: "From components to reusable architectures",
      content: (
        <LectureScene
          number="18"
          title={<>Eight patterns cover most <em>agentic designs</em>.</>}
          intro="Patterns are reusable arrangements of components. They progress from fully deterministic pipelines to model-directed loops and supervised teams. Each has conditions where it fits and where it fails."
          points={[
            "Choose the pattern from the shape of the task, not from fashion.",
            "Colour shows who decides at each node: model, code or human.",
            "Patterns compose: a router can dispatch to an agent loop with a human gate.",
          ]}
          takeaway="Start with the simplest pattern whose control structure matches the problem."
          wide
        >
          <PatternExplorer onSource={() => setDetail("patterns")} />
        </LectureScene>
      ),
    },
    {
      phase: "patterns",
      principle: 6,
      eyebrow: "Architecture principle VI",
      content: (
        <LectureScene
          number="19"
          principle={6}
          title={<>Prefer a single agent unless decomposition <em>earns its place</em>.</>}
          intro="Why create multiple agents? Valid reasons are genuine differences in capabilities, tools, permissions, context, responsibilities or execution environment. “It sounds sophisticated” is not one of them."
          points={[
            "Every extra agent adds handoffs, latency, cost and new failure modes.",
            "Separation is valuable when it enforces a real boundary, such as restricted documents.",
            "Tick the differences that are genuinely true and read the verdict.",
          ]}
          takeaway="A persona is not an architecture. Prefer the simplest topology that solves the problem."
        >
          <MultiAgentDecision />
        </LectureScene>
      ),
    },
    {
      phase: "patterns",
      eyebrow: "Implementation · Frameworks",
      content: (
        <LectureScene
          number="20"
          title={<>Frameworks implement architectures. They should not <em>choose</em> them.</>}
          intro="LangGraph, Strands Agents, the OpenAI Agents SDK, Microsoft Agent Framework, Semantic Kernel and LlamaIndex offer useful abstractions. Each makes some patterns easy and others awkward, so decide the design before choosing the tool."
          points={[
            "Map your chosen patterns to framework features, not the reverse.",
            "Framework defaults quietly encode architectural decisions.",
            "Once the design is clear, choosing a framework becomes a comparison of fit.",
          ]}
          takeaway="Frameworks provide implementation abstractions. They should not determine the architecture."
        >
          <FrameworkMap />
        </LectureScene>
      ),
    },
    {
      phase: "production",
      principle: 7,
      eyebrow: "Architecture principle VII",
      content: (
        <LectureScene
          number="21"
          principle={7}
          title={<>Design for <em>failure</em>.</>}
          intro="Agentic systems combine probabilistic components with unreliable external systems. Failure is a normal operating condition. Inject a failure, see where it lands, and see which mechanism detects and recovers from it."
          points={[
            "Each failure needs a detection mechanism and a recovery path.",
            "Idempotency makes retries safe; circuit breakers make them polite.",
            "Some failures, such as a permission denial, must never be retried around.",
          ]}
          takeaway="Retries, fallbacks, timeouts, validation, idempotency and escalation are architecture, not afterthoughts."
        >
          <FailureInjector />
        </LectureScene>
      ),
    },
    {
      phase: "production",
      principle: 8,
      eyebrow: "Architecture principle VIII",
      content: (
        <LectureScene
          number="22"
          principle={8}
          title={<>Observability is part of the <em>architecture</em>.</>}
          intro="Every transition, from request to model call, tool selection, execution, observation, decision and result, should be traceable. Open each span of this trace and reconstruct why the agent answered as it did."
          points={[
            "Capture context, decision, tool, arguments, result, latency, tokens, cost, state change and errors.",
            "The retried span shows why silent recovery still needs a record.",
            "Traces feed debugging, audit, evaluation and cost control.",
          ]}
          takeaway="If you cannot reconstruct why the system took an action, you do not fully control the system."
        >
          <TraceViewer />
        </LectureScene>
      ),
    },
    {
      phase: "production",
      principle: 9,
      eyebrow: "Architecture principle IX",
      content: (
        <LectureScene
          number="23"
          principle={9}
          title={<>Security is a <em>systems</em> problem.</>}
          intro="Threats enter at every boundary: from users, from retrieved content, at the tool interface, and on the way out. Controls therefore need to exist outside the model, where they cannot be talked out of."
          points={[
            "Retrieved content is data, never instructions.",
            "Least privilege limits the damage of any single bad decision.",
            "IAM, policy enforcement, sandboxing, validation, approval and audit are architectural controls.",
          ]}
          takeaway="Treat security and safety as properties of the whole system, enforced at its boundaries."
        >
          <SecurityBoundaries />
        </LectureScene>
      ),
    },
    {
      phase: "production",
      principle: 10,
      eyebrow: "Architecture principle X",
      content: (
        <LectureScene
          number="24"
          principle={10}
          title={<>Evaluate the system, <em>not only the model</em>.</>}
          intro="A model benchmark measures one component. An agentic system must also be judged on task completion, tool choice, arguments, retrieval, steps, latency, cost, safety and recovery. Switch views and compare two systems."
          points={[
            "Evaluate end-to-end tasks from real traces, not isolated prompts.",
            "Include failure-recovery and safety cases, not just happy paths.",
            "Track cost and latency as quality attributes.",
          ]}
          takeaway="The best model does not guarantee the best agentic system."
        >
          <EvaluationScorecard />
        </LectureScene>
      ),
    },
    {
      phase: "synthesis",
      eyebrow: "Return to the wall",
      content: (
        <LectureScene
          number="25"
          title={<>Now every term has <em>somewhere to belong</em>.</>}
          intro="The wall from the opening now sorts into eight concerns: architecture, intelligence, control, state, action, interoperability, implementation and production. Pick a term, then place it. Placed terms reveal their definition."
          points={[
            "Ask which question the term answers, not what it sounds like.",
            "Frameworks and protocols are the easiest to misplace as “architecture”.",
            "The full glossary is always available from the lesson rail.",
          ]}
          takeaway="Do not memorise the vocabulary. Understand the architecture, and the vocabulary has somewhere to belong."
          wide
        >
          <VocabularySort />
        </LectureScene>
      ),
    },
    {
      phase: "synthesis",
      eyebrow: "Lesson synthesis · Ten design principles",
      content: (
        <LectureScene
          number="26"
          title={<>Ten principles for <em>designing</em> Agentic AI systems.</>}
          intro="Taken together, the principles form a design review. Test them on four real-world decisions. Each case violates exactly one of them."
          points={[
            "Principles I–IV separate the concerns: control, determinism, authority and technology.",
            "Principles V–VI bound how much autonomy and how many agents.",
            "Principles VII–X make the system operable, secure and measurable.",
          ]}
          takeaway="Architecture first, patterns second, frameworks last, with autonomy always bounded."
          wide
        >
          <PrinciplesRecap />
        </LectureScene>
      ),
    },
  ], []);

  return (
    <LessonPlayer
      ariaLabel="Interactive lesson: Architectures and Design Principles for Agentic AI Systems"
      course="AI Fundamentals · Lesson 02"
      railTitle={<>Architectures &amp; Design Principles for Agentic AI</>}
      phaseLabels={phaseLabels}
      buildSlides={buildSlides}
      deepDives={deepDives}
      railActions={[{ label: "Glossary", detail: "glossary" }]}
    />
  );
}
