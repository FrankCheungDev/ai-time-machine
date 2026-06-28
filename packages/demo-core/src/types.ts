export interface DemoStep {
  id: string;
  title: string;
  description: string;
  activeNodeIds: string[];
  activeEdgeIds: string[];
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

export interface PipelineDemo {
  title: string;
  question: string;
  simplificationNote: string;
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  steps: DemoStep[];
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

export interface AttentionMapDemo {
  title: string;
  question: string;
  simplificationNote: string;
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

export interface AgentLoopDemo {
  title: string;
  question: string;
  simplificationNote: string;
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

export interface ExpertSystemDemo {
  title: string;
  question: string;
  simplificationNote: string;
  conditions: ExpertCondition[];
  exceptionCondition: ExpertCondition;
  rules: ExpertRule[];
  conflictTitle: string;
  conflictDescription: string;
  stableTitle: string;
  stableDescription: string;
}

export interface SearchTreeNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface SearchTreeEdge {
  id: string;
  from: string;
  to: string;
}

export interface SearchStrategy {
  id: string;
  label: string;
  title: string;
  description: string;
  activeNodeIds: string[];
  activeEdgeIds: string[];
  frontierLabel: string;
}

export interface SearchTreeDemo {
  title: string;
  question: string;
  simplificationNote: string;
  nodes: SearchTreeNode[];
  edges: SearchTreeEdge[];
  strategies: SearchStrategy[];
}

export interface BayesUpdateDemo {
  title: string;
  question: string;
  simplificationNote: string;
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

export interface DecisionBoundaryDemo {
  title: string;
  question: string;
  simplificationNote: string;
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
}

export interface CnnScanStep {
  id: string;
  x: number;
  y: number;
  title: string;
  description: string;
}

export interface CnnKernelDemo {
  title: string;
  question: string;
  simplificationNote: string;
  imageGrid: number[][];
  kernels: CnnKernel[];
  scanSteps: CnnScanStep[];
}
