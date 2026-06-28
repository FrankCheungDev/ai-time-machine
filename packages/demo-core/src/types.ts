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
