export interface DemoStep {
  id: string;
  title: string;
  description: string;
  activeNodeIds: string[];
  activeEdgeIds: string[];
}

export interface DemoMetadata {
  title: string;
  question: string;
  simplificationNote: string;
  learningGoals: string[];
}

export interface PipelineNode {
  id: string;
  label: string;
  description: string;
}

export interface PipelineEdge {
  id: string;
  from: string;
  to: string;
}

export interface PipelineScenario {
  id: string;
  label: string;
  title: string;
  description: string;
  answerPreview: string;
  riskNote: string;
}

export interface PipelineDemo extends DemoMetadata {
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  steps: DemoStep[];
  scenarios?: PipelineScenario[];
}

export interface AttentionToken {
  id: string;
  label: string;
  x: number;
  y: number;
  focusTitle: string;
  focusDescription: string;
}

export interface AttentionLink {
  id: string;
  from: string;
  to: string;
  weight: number;
}

export interface AttentionMapDemo extends DemoMetadata {
  attentionModeCopy: string;
  rnnModeCopy: string;
  tokens: AttentionToken[];
  links: AttentionLink[];
}

export type FoundationModelFindingTone =
  "data" | "base" | "instruction" | "preference" | "boundary";

export interface FoundationModelNode {
  id: string;
  label: string;
  description: string;
  x: number;
  y: number;
}

export interface FoundationModelEdge {
  id: string;
  from: string;
  to: string;
}

export interface FoundationModelStep extends DemoStep {
  nodeId: string;
  statusLabel: string;
  finding: string;
  findingTone: FoundationModelFindingTone;
  outputTitle: string;
  outputPreview: string;
}

export interface FoundationModelDemo extends DemoMetadata {
  nodes: FoundationModelNode[];
  edges: FoundationModelEdge[];
  steps: FoundationModelStep[];
}

export type FeedbackLearningStage = "training" | "runtime";

export type FeedbackLearningFindingTone =
  "state" | "episode" | "comparison" | "update" | "boundary";

export interface FeedbackLearningNode {
  id: string;
  label: string;
  description: string;
  x: number;
  y: number;
}

export interface FeedbackLearningEdge {
  id: string;
  from: string;
  to: string;
}

export interface FeedbackLearningStep extends DemoStep {
  nodeId: string;
  stage: FeedbackLearningStage;
  statusLabel: string;
  finding: string;
  findingTone: FeedbackLearningFindingTone;
  episodeId?: string;
  policySnapshotId?: string;
}

export interface FeedbackLearningTransition {
  id: string;
  episodeId: string;
  fromStateId: string;
  actionId: string;
  toStateId: string;
  actionLabel: string;
  observation: string;
  reward: number;
}

export interface FeedbackLearningEpisode {
  id: string;
  label: string;
  title: string;
  description: string;
  transitionIds: string[];
  actionIds: string[];
  rewards: number[];
  returnValue: number;
  result: string;
}

export interface FeedbackLearningPolicySnapshot {
  id: string;
  label: string;
  leftProbability: number;
  rightProbability: number;
  explanation: string;
}

export interface FeedbackLearningBoundaryView {
  id: FeedbackLearningStage;
  label: string;
  title: string;
  description: string;
  weightStatus: string;
  nextActionStatus: string;
  activeNodeIds: string[];
  activeEdgeIds: string[];
}

export interface FeedbackLearningSignalComparison {
  id: string;
  label: string;
  inputSignal: string;
  timing: string;
  effect: string;
  boundary: string;
}

export interface FeedbackLearningDemo extends DemoMetadata {
  nodes: FeedbackLearningNode[];
  edges: FeedbackLearningEdge[];
  steps: FeedbackLearningStep[];
  transitions: FeedbackLearningTransition[];
  episodes: FeedbackLearningEpisode[];
  policySnapshots: FeedbackLearningPolicySnapshot[];
  boundaryViews: FeedbackLearningBoundaryView[];
  signalComparisons: FeedbackLearningSignalComparison[];
  defaultBoundaryViewId: FeedbackLearningStage;
}

export interface AgentLoopNode {
  id: string;
  label: string;
  description: string;
  x: number;
  y: number;
}

export interface AgentLoopEdge {
  id: string;
  from: string;
  to: string;
}

export interface AgentLoopStep extends DemoStep {
  nodeId: string;
}

export interface AgentLoopScenario {
  id: string;
  label: string;
  description: string;
  stepIds: string[];
}

export interface AgentLoopDemo extends DemoMetadata {
  nodes: AgentLoopNode[];
  edges: AgentLoopEdge[];
  steps: AgentLoopStep[];
  scenarios: AgentLoopScenario[];
  defaultScenarioId: string;
}

export type SafetyEvalFindingTone =
  "pass" | "risk" | "blocked" | "review" | "fixed";

export interface SafetyEvalNode {
  id: string;
  label: string;
  description: string;
  x: number;
  y: number;
}

export interface SafetyEvalEdge {
  id: string;
  from: string;
  to: string;
}

export interface SafetyEvalStep extends DemoStep {
  nodeId: string;
  statusLabel: string;
  finding: string;
  findingTone: SafetyEvalFindingTone;
}

export interface SafetyEvalScenario {
  id: string;
  label: string;
  title: string;
  description: string;
  request: string;
  expectedOutcome: string;
  stepIds: string[];
}

export interface SafetyEvalDemo extends DemoMetadata {
  nodes: SafetyEvalNode[];
  edges: SafetyEvalEdge[];
  steps: SafetyEvalStep[];
  scenarios: SafetyEvalScenario[];
  defaultScenarioId: string;
}

export type LlmSystemFindingTone = "gap" | "context" | "action" | "verified";

export interface LlmSystemNode {
  id: string;
  label: string;
  description: string;
  x: number;
  y: number;
}

export interface LlmSystemEdge {
  id: string;
  from: string;
  to: string;
}

export interface LlmSystemStep extends DemoStep {
  nodeId: string;
  statusLabel: string;
  finding: string;
  findingTone: LlmSystemFindingTone;
}

export interface LlmSystemScenario {
  id: string;
  label: string;
  title: string;
  description: string;
  request: string;
  requirement: string;
  stepIds: string[];
}

export interface LlmSystemDemo extends DemoMetadata {
  nodes: LlmSystemNode[];
  edges: LlmSystemEdge[];
  steps: LlmSystemStep[];
  scenarios: LlmSystemScenario[];
  defaultScenarioId: string;
}

export interface ExpertCondition {
  id: string;
  label: string;
  defaultSelected: boolean;
}

export interface ExpertRule {
  id: string;
  ifAll: string[];
  then: string;
  explanation: string;
}

export interface ExpertSystemDemo extends DemoMetadata {
  conditions: ExpertCondition[];
  exceptionCondition: ExpertCondition;
  rules: ExpertRule[];
  noMatchTitle: string;
  noMatchDescription: string;
  conflictTitle: string;
  conflictDescription: string;
  stableTitle: string;
}

export interface SearchTreeNode {
  id: string;
  label: string;
  x: number;
  y: number;
  heuristicCost: number;
}

export interface SearchTreeEdge {
  id: string;
  from: string;
  to: string;
  cost: number;
}

export type SearchAlgorithm = "bfs" | "dfs" | "astar";

export interface SearchStrategy {
  id: SearchAlgorithm;
  label: string;
  title: string;
  description: string;
}

export interface SearchTreeDemo extends DemoMetadata {
  nodes: SearchTreeNode[];
  edges: SearchTreeEdge[];
  strategies: SearchStrategy[];
}

export interface BayesUpdateDemo extends DemoMetadata {
  priorDefault: number;
  evidenceDefault: number;
  priorLabel: string;
  evidenceLabel: string;
  insight: string;
}

export interface DecisionPoint {
  id: string;
  x: number;
  y: number;
  className: "positive" | "negative";
}

export interface BoundaryMode {
  id: string;
  label: string;
  title: string;
  description: string;
  path: string;
}

export interface DecisionBoundaryDemo extends DemoMetadata {
  points: DecisionPoint[];
  modes: BoundaryMode[];
  outlierLabel: string;
}

export interface CnnKernel {
  id: string;
  label: string;
  title: string;
  description: string;
  matrix: number[][];
  normalizationDivisor: number;
}

export interface CnnScanStep {
  id: string;
  x: number;
  y: number;
  title: string;
  description: string;
}

export interface CnnKernelDemo extends DemoMetadata {
  imageGrid: number[][];
  kernels: CnnKernel[];
  scanSteps: CnnScanStep[];
}
