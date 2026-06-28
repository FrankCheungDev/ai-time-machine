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
