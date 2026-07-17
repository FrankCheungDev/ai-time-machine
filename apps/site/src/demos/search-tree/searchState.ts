import type {
  SearchAlgorithm,
  SearchTreeEdge,
  SearchTreeNode,
} from "@ai-history/demo-core";

export type SearchStatus = "searching" | "found" | "unreachable";

export interface SearchFrontierEntry {
  nodeId: string;
  g: number;
  h: number;
  f: number;
  insertionOrder: number;
}

export interface SearchStepState {
  current: SearchFrontierEntry;
  expandedNodeIds: string[];
  frontier: SearchFrontierEntry[];
  frontierPeak: number;
  discoveredEdgeIds: string[];
  nodeScores: SearchFrontierEntry[];
  status: SearchStatus;
  pathNodeIds: string[];
  pathEdgeIds: string[];
  pathCost: number | null;
}

export interface SearchRun {
  algorithm: SearchAlgorithm;
  steps: SearchStepState[];
  expansionOrder: string[];
  frontierPeak: number;
  status: Exclude<SearchStatus, "searching">;
  pathNodeIds: string[];
  pathEdgeIds: string[];
  pathCost: number | null;
}

interface RunSearchOptions {
  nodes: SearchTreeNode[];
  edges: SearchTreeEdge[];
  algorithm: SearchAlgorithm;
  startNodeId: string;
  goalNodeId: string;
}

function copyEntry(entry: SearchFrontierEntry): SearchFrontierEntry {
  return { ...entry };
}

function sortAStarFrontier(
  frontier: SearchFrontierEntry[],
): SearchFrontierEntry[] {
  return [...frontier].sort(
    (left, right) =>
      left.f - right.f ||
      left.h - right.h ||
      left.insertionOrder - right.insertionOrder,
  );
}

function buildPath(
  startNodeId: string,
  goalNodeId: string,
  parentByNodeId: Map<string, string>,
  parentEdgeByNodeId: Map<string, string>,
): { nodeIds: string[]; edgeIds: string[] } {
  const nodeIds = [goalNodeId];
  const edgeIds: string[] = [];
  let currentNodeId = goalNodeId;

  while (currentNodeId !== startNodeId) {
    const parentNodeId = parentByNodeId.get(currentNodeId);
    const parentEdgeId = parentEdgeByNodeId.get(currentNodeId);

    if (parentNodeId === undefined || parentEdgeId === undefined) {
      throw new Error("The completed search path is missing a parent link.");
    }

    nodeIds.push(parentNodeId);
    edgeIds.push(parentEdgeId);
    currentNodeId = parentNodeId;
  }

  return {
    nodeIds: nodeIds.reverse(),
    edgeIds: edgeIds.reverse(),
  };
}

function validateGraph({
  nodes,
  edges,
  startNodeId,
  goalNodeId,
}: Pick<
  RunSearchOptions,
  "nodes" | "edges" | "startNodeId" | "goalNodeId"
>): Map<string, SearchTreeNode> {
  const nodeById = new Map<string, SearchTreeNode>();

  for (const node of nodes) {
    if (nodeById.has(node.id)) {
      throw new Error(`Duplicate search node ID: ${node.id}`);
    }

    if (!Number.isFinite(node.heuristicCost) || node.heuristicCost < 0) {
      throw new RangeError(
        `Search node ${node.id} must have a non-negative heuristic cost.`,
      );
    }

    nodeById.set(node.id, node);
  }

  if (!nodeById.has(startNodeId)) {
    throw new Error(`Unknown search start node: ${startNodeId}`);
  }

  if (!nodeById.has(goalNodeId)) {
    throw new Error(`Unknown search goal node: ${goalNodeId}`);
  }

  const edgeIds = new Set<string>();
  for (const edge of edges) {
    if (edgeIds.has(edge.id)) {
      throw new Error(`Duplicate search edge ID: ${edge.id}`);
    }

    if (!nodeById.has(edge.from) || !nodeById.has(edge.to)) {
      throw new Error(`Search edge ${edge.id} references an unknown node.`);
    }

    if (!Number.isFinite(edge.cost) || edge.cost <= 0) {
      throw new RangeError(`Search edge ${edge.id} must have a positive cost.`);
    }

    edgeIds.add(edge.id);
  }

  return nodeById;
}

export function runSearch(options: RunSearchOptions): SearchRun {
  const { nodes, edges, algorithm, startNodeId, goalNodeId } = options;
  const nodeById = validateGraph(options);
  const outgoingEdges = new Map<string, SearchTreeEdge[]>(
    nodes.map((node) => [node.id, []]),
  );

  for (const edge of edges) {
    outgoingEdges.get(edge.from)!.push(edge);
  }

  let insertionOrder = 0;
  const startNode = nodeById.get(startNodeId)!;
  const startEntry: SearchFrontierEntry = {
    nodeId: startNodeId,
    g: 0,
    h: startNode.heuristicCost,
    f: startNode.heuristicCost,
    insertionOrder,
  };
  let frontier = [startEntry];
  let frontierPeak = frontier.length;
  const expandedNodeIds: string[] = [];
  const expandedNodeSet = new Set<string>();
  const bestCostByNodeId = new Map<string, number>([[startNodeId, 0]]);
  const scoreByNodeId = new Map<string, SearchFrontierEntry>([
    [startNodeId, startEntry],
  ]);
  const parentByNodeId = new Map<string, string>();
  const parentEdgeByNodeId = new Map<string, string>();
  const discoveredEdgeIds: string[] = [];
  const discoveredEdgeIdSet = new Set<string>();
  const steps: SearchStepState[] = [];

  while (frontier.length > 0) {
    const current = frontier.shift()!;

    if (expandedNodeSet.has(current.nodeId)) {
      continue;
    }

    expandedNodeSet.add(current.nodeId);
    expandedNodeIds.push(current.nodeId);

    let status: SearchStatus = "searching";
    let pathNodeIds: string[] = [];
    let pathEdgeIds: string[] = [];
    let pathCost: number | null = null;

    if (current.nodeId === goalNodeId) {
      status = "found";
      const path = buildPath(
        startNodeId,
        goalNodeId,
        parentByNodeId,
        parentEdgeByNodeId,
      );
      pathNodeIds = path.nodeIds;
      pathEdgeIds = path.edgeIds;
      pathCost = current.g;
    } else {
      const newEntries: SearchFrontierEntry[] = [];

      for (const edge of outgoingEdges.get(current.nodeId) ?? []) {
        if (expandedNodeSet.has(edge.to)) {
          continue;
        }

        const nextCost = current.g + edge.cost;
        const knownCost = bestCostByNodeId.get(edge.to);
        const shouldDiscover =
          algorithm === "astar"
            ? knownCost === undefined || nextCost < knownCost
            : knownCost === undefined;

        if (!shouldDiscover) {
          continue;
        }

        const targetNode = nodeById.get(edge.to)!;
        insertionOrder += 1;
        const nextEntry: SearchFrontierEntry = {
          nodeId: edge.to,
          g: nextCost,
          h: targetNode.heuristicCost,
          f: nextCost + targetNode.heuristicCost,
          insertionOrder,
        };

        bestCostByNodeId.set(edge.to, nextCost);
        scoreByNodeId.set(edge.to, nextEntry);
        parentByNodeId.set(edge.to, current.nodeId);
        parentEdgeByNodeId.set(edge.to, edge.id);
        newEntries.push(nextEntry);

        if (!discoveredEdgeIdSet.has(edge.id)) {
          discoveredEdgeIdSet.add(edge.id);
          discoveredEdgeIds.push(edge.id);
        }

        if (algorithm === "astar") {
          frontier = frontier.filter((entry) => entry.nodeId !== edge.to);
        }
      }

      if (algorithm === "dfs") {
        frontier = [...newEntries, ...frontier];
      } else {
        frontier.push(...newEntries);
      }

      if (algorithm === "astar") {
        frontier = sortAStarFrontier(frontier);
      }

      frontierPeak = Math.max(frontierPeak, frontier.length);
      if (frontier.length === 0) {
        status = "unreachable";
      }
    }

    steps.push({
      current: copyEntry(current),
      expandedNodeIds: [...expandedNodeIds],
      frontier: frontier.map(copyEntry),
      frontierPeak,
      discoveredEdgeIds: [...discoveredEdgeIds],
      nodeScores: [...scoreByNodeId.values()].map(copyEntry),
      status,
      pathNodeIds,
      pathEdgeIds,
      pathCost,
    });

    if (status !== "searching") {
      break;
    }
  }

  const finalStep = steps.at(-1)!;

  return {
    algorithm,
    steps,
    expansionOrder: [...finalStep.expandedNodeIds],
    frontierPeak: finalStep.frontierPeak,
    status: finalStep.status as Exclude<SearchStatus, "searching">,
    pathNodeIds: [...finalStep.pathNodeIds],
    pathEdgeIds: [...finalStep.pathEdgeIds],
    pathCost: finalStep.pathCost,
  };
}
