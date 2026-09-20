export type Concern =
  | "architecture"
  | "intelligence"
  | "control"
  | "state"
  | "action"
  | "interop"
  | "implementation"
  | "production";

export const concernLabels: Record<Concern, { label: string; question: string }> = {
  architecture: { label: "Architecture", question: "What kind of system is this?" },
  intelligence: { label: "Intelligence", question: "Where does reasoning come from?" },
  control: { label: "Control", question: "Who decides what happens next?" },
  state: { label: "State", question: "What does the system see and remember?" },
  action: { label: "Action", question: "How does it affect the world?" },
  interop: { label: "Interoperability", question: "How do components talk?" },
  implementation: { label: "Implementation", question: "What software builds it?" },
  production: { label: "Production", question: "How is it controlled and trusted?" },
};

export type Term = { term: string; concern: Concern; definition: string };

export const vocabulary: Term[] = [
  { term: "Agent", concern: "architecture", definition: "A component with decision authority over part of execution in pursuit of a goal." },
  { term: "Agentic AI", concern: "architecture", definition: "A system in which model decisions influence control flow and action at runtime." },
  { term: "Workflow", concern: "architecture", definition: "An explicit execution structure whose steps and transitions are defined ahead of time." },
  { term: "Orchestrator", concern: "architecture", definition: "The mechanism coordinating routing, state transitions and component interactions. It can be fully deterministic." },
  { term: "Harness", concern: "architecture", definition: "The runtime machinery around a model: context assembly, tools, loop control, permissions, validation and logging." },
  { term: "LLM", concern: "intelligence", definition: "A large language model: a probabilistic next-token predictor trained on large text corpora." },
  { term: "Foundation Model", concern: "intelligence", definition: "A broadly pretrained model reused across many tasks through prompting or adaptation." },
  { term: "RAG", concern: "intelligence", definition: "Retrieval-augmented generation: retrieved documents are added to context before the model generates." },
  { term: "Reasoning", concern: "intelligence", definition: "The model's capacity to interpret, infer, plan and choose among options from its context." },
  { term: "Agent Loop", concern: "control", definition: "The repeated cycle of observe → decide → act → observe until a stop condition holds." },
  { term: "Router", concern: "control", definition: "A single runtime decision that selects one of several predefined branches." },
  { term: "Planner", concern: "control", definition: "A component that decomposes a goal into an ordered set of steps before execution." },
  { term: "Supervisor", concern: "control", definition: "A coordinating agent that delegates sub-tasks to specialists and combines their results." },
  { term: "Reflection", concern: "control", definition: "A pattern in which output or a plan is critiqued and revised before it is accepted." },
  { term: "ReAct", concern: "control", definition: "A pattern interleaving reasoning traces with actions and observations (Yao et al., 2022)." },
  { term: "Handoff", concern: "control", definition: "Transfer of control and relevant context from one agent to another." },
  { term: "Multi-Agent", concern: "control", definition: "A topology in which several agents with distinct responsibilities cooperate." },
  { term: "Context", concern: "state", definition: "Everything the model can see during one invocation." },
  { term: "State", concern: "state", definition: "The system's structured record of where the current execution stands." },
  { term: "Memory", concern: "state", definition: "Information deliberately retained for use in future steps or sessions." },
  { term: "Checkpoint", concern: "state", definition: "A persisted snapshot of execution state so a run can resume, replay or pause for review." },
  { term: "Tool", concern: "action", definition: "A capability exposed to the agent to obtain information or affect an external environment." },
  { term: "Function Calling", concern: "action", definition: "The model emits a structured request naming a function and its arguments; software executes it." },
  { term: "API", concern: "action", definition: "The set of operations a system exposes to other software." },
  { term: "MCP", concern: "interop", definition: "Model Context Protocol: a standard way for AI applications to connect to tools, resources and prompts." },
  { term: "A2A", concern: "interop", definition: "Agent-to-agent protocols: standard ways for independently built agents to discover each other and exchange tasks." },
  { term: "Protocol", concern: "interop", definition: "The agreed rules for how systems communicate and interoperate." },
  { term: "Framework", concern: "implementation", definition: "A software library providing abstractions for implementing an architecture." },
  { term: "LangGraph", concern: "implementation", definition: "A library for building stateful agent workflows as graphs, from the LangChain team." },
  { term: "Strands Agents", concern: "implementation", definition: "An open-source SDK from AWS for building model-driven agents." },
  { term: "Agents SDK", concern: "implementation", definition: "OpenAI's framework for agents with tools, handoffs, guardrails and tracing." },
  { term: "Semantic Kernel", concern: "implementation", definition: "Microsoft's SDK for integrating models into applications through plugins." },
  { term: "LlamaIndex", concern: "implementation", definition: "A framework for connecting models to data: indexing, retrieval, agents and workflows." },
  { term: "Guardrails", concern: "production", definition: "Checks on inputs, outputs and actions that enforce policy outside the model." },
  { term: "IAM", concern: "production", definition: "Identity and access management: who or what may perform which action on which resource." },
  { term: "Human Approval", concern: "production", definition: "A gate where a person must confirm a proposed high-impact action before it executes." },
  { term: "Observability", concern: "production", definition: "Traces, logs and metrics that let you reconstruct what the system did and why." },
  { term: "Evaluation", concern: "production", definition: "Systematic measurement of task success, cost, latency, safety and failure behaviour." },
];

export const principles: [string, string][] = [
  ["Separate reasoning from control flow.", "Decide explicitly which transitions the developer owns and which the model may choose."],
  ["Use deterministic software where uncertainty is unnecessary.", "Do not use an agent where a function will do."],
  ["Separate decision authority from execution authority.", "The model proposes; validated, permissioned software executes."],
  ["Separate architecture from implementation technology.", "Choose the design first; the framework second."],
  ["Bound autonomy explicitly.", "Tools, data, steps, cost, time and approvals define the envelope."],
  ["Prefer the simplest agent topology that solves the problem.", "A persona is not an architecture."],
  ["Design for failure.", "Retries, fallbacks, timeouts, idempotency and escalation are part of the design."],
  ["Make observability part of the architecture.", "If you cannot reconstruct an action, you do not control the system."],
  ["Treat security and safety as system properties.", "Controls live at every boundary, outside the model."],
  ["Evaluate the system, not only the model.", "The best model does not guarantee the best agentic system."],
];
