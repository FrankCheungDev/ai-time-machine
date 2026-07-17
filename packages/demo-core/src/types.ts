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

export interface AgentLoopStep extends DemoStep {
  loopLabel: string;
}

export interface AgentBranchOption {
  id: string;
  label: string;
  targetStepId: string;
  description: string;
}

export interface AgentLoopDemo extends DemoMetadata {
  steps: AgentLoopStep[];
  branchOptions: AgentBranchOption[];
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
