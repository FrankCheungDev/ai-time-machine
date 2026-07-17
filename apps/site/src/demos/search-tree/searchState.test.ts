import type {
  SearchAlgorithm,
  SearchTreeEdge,
  SearchTreeNode,
} from "@ai-history/demo-core";
import { getSearchTreeDemo } from "@ai-history/data";
import { describe, expect, it } from "vitest";
import { runSearch } from "./searchState";

const searchTreeDemo = getSearchTreeDemo("zh-CN");

function runTeachingTree(algorithm: SearchAlgorithm) {
  return runSearch({
    nodes: searchTreeDemo.nodes,
    edges: searchTreeDemo.edges,
    algorithm,
    startNodeId: "start",
    goalNodeId: "goal",
  });
}

describe("deterministic search teaching tree", () => {
  it.each([
    ["bfs", ["start", "a", "b", "c", "a1", "a2", "b1", "goal"]],
    ["dfs", ["start", "a", "a1", "a2", "b", "b1", "c", "goal"]],
    ["astar", ["start", "c", "goal"]],
  ] as const)("runs the exact %s expansion order", (algorithm, expected) => {
    expect(runTeachingTree(algorithm).expansionOrder).toEqual(expected);
  });

  it("records every BFS frontier after the current node is expanded", () => {
    const run = runTeachingTree("bfs");

    expect(
      run.steps.map((step) => step.frontier.map((entry) => entry.nodeId)),
    ).toEqual([
      ["a", "b", "c"],
      ["b", "c", "a1", "a2"],
      ["c", "a1", "a2", "b1"],
      ["a1", "a2", "b1", "goal"],
      ["a2", "b1", "goal"],
      ["b1", "goal"],
      ["goal"],
      [],
    ]);
    expect(run.frontierPeak).toBe(4);
  });

  it("records every DFS frontier with the next node first", () => {
    const run = runTeachingTree("dfs");

    expect(
      run.steps.map((step) => step.frontier.map((entry) => entry.nodeId)),
    ).toEqual([
      ["a", "b", "c"],
      ["a1", "a2", "b", "c"],
      ["a2", "b", "c"],
      ["b", "c"],
      ["b1", "c"],
      ["c"],
      ["goal"],
      [],
    ]);
    expect(run.frontierPeak).toBe(4);
  });

  it("uses f, then h, then insertion order for A* and stops on goal pop", () => {
    const run = runTeachingTree("astar");

    expect(
      run.steps[0]?.frontier.map(({ nodeId, g, h, f }) => ({
        nodeId,
        g,
        h,
        f,
      })),
    ).toEqual([
      { nodeId: "c", g: 1, h: 1, f: 2 },
      { nodeId: "b", g: 1, h: 3, f: 4 },
      { nodeId: "a", g: 1, h: 4, f: 5 },
    ]);
    expect(run.steps[1]?.status).toBe("searching");
    expect(
      run.steps[1]?.frontier.map(({ nodeId, g, h, f }) => ({
        nodeId,
        g,
        h,
        f,
      })),
    ).toEqual([
      { nodeId: "goal", g: 2, h: 0, f: 2 },
      { nodeId: "b", g: 1, h: 3, f: 4 },
      { nodeId: "a", g: 1, h: 4, f: 5 },
    ]);
    expect(run.steps[2]?.status).toBe("found");
    expect(run.steps[2]?.frontier.map((entry) => entry.nodeId)).toEqual([
      "b",
      "a",
    ]);
    expect(run.frontierPeak).toBe(3);
    expect(run.pathNodeIds).toEqual(["start", "c", "goal"]);
    expect(run.pathEdgeIds).toEqual(["start-c", "c-goal"]);
    expect(run.pathCost).toBe(2);
  });

  it("keeps equal A* scores stable by edge insertion order", () => {
    const nodes: SearchTreeNode[] = [
      { id: "start", label: "Start", x: 0, y: 0, heuristicCost: 0 },
      { id: "first", label: "First", x: 0, y: 0, heuristicCost: 1 },
      { id: "second", label: "Second", x: 0, y: 0, heuristicCost: 1 },
      { id: "goal", label: "Goal", x: 0, y: 0, heuristicCost: 0 },
    ];
    const edges: SearchTreeEdge[] = [
      { id: "start-first", from: "start", to: "first", cost: 1 },
      { id: "start-second", from: "start", to: "second", cost: 1 },
      { id: "first-goal", from: "first", to: "goal", cost: 1 },
    ];

    const run = runSearch({
      nodes,
      edges,
      algorithm: "astar",
      startNodeId: "start",
      goalNodeId: "goal",
    });

    expect(run.steps[0]?.frontier.map((entry) => entry.nodeId)).toEqual([
      "first",
      "second",
    ]);
    expect(run.expansionOrder).toEqual(["start", "first", "goal"]);
  });

  it("uses h as the secondary A* ordering key when f is tied", () => {
    const nodes: SearchTreeNode[] = [
      { id: "start", label: "Start", x: 0, y: 0, heuristicCost: 0 },
      { id: "high-h", label: "High h", x: 0, y: 0, heuristicCost: 2 },
      { id: "low-h", label: "Low h", x: 0, y: 0, heuristicCost: 1 },
      { id: "goal", label: "Goal", x: 0, y: 0, heuristicCost: 0 },
    ];
    const edges: SearchTreeEdge[] = [
      { id: "start-high", from: "start", to: "high-h", cost: 1 },
      { id: "start-low", from: "start", to: "low-h", cost: 2 },
      { id: "low-goal", from: "low-h", to: "goal", cost: 1 },
    ];

    const run = runSearch({
      nodes,
      edges,
      algorithm: "astar",
      startNodeId: "start",
      goalNodeId: "goal",
    });

    expect(
      run.steps[0]?.frontier.map(({ nodeId, f, h }) => ({ nodeId, f, h })),
    ).toEqual([
      { nodeId: "low-h", f: 3, h: 1 },
      { nodeId: "high-h", f: 3, h: 2 },
    ]);
  });
});

describe("search graph termination", () => {
  const nodes: SearchTreeNode[] = [
    { id: "start", label: "Start", x: 0, y: 0, heuristicCost: 2 },
    { id: "a", label: "A", x: 0, y: 0, heuristicCost: 1 },
    { id: "goal", label: "Goal", x: 0, y: 0, heuristicCost: 0 },
  ];

  it.each(["bfs", "dfs", "astar"] as const)(
    "deduplicates cycles for %s",
    (algorithm) => {
      const run = runSearch({
        nodes,
        edges: [
          { id: "start-a", from: "start", to: "a", cost: 1 },
          { id: "a-start", from: "a", to: "start", cost: 1 },
          { id: "a-goal", from: "a", to: "goal", cost: 1 },
        ],
        algorithm,
        startNodeId: "start",
        goalNodeId: "goal",
      });

      expect(run.expansionOrder).toEqual(["start", "a", "goal"]);
      expect(new Set(run.expansionOrder).size).toBe(run.expansionOrder.length);
    },
  );

  it.each(["bfs", "dfs", "astar"] as const)(
    "reports an unreachable goal when the %s frontier is exhausted",
    (algorithm) => {
      const run = runSearch({
        nodes,
        edges: [
          { id: "start-a", from: "start", to: "a", cost: 1 },
          { id: "a-start", from: "a", to: "start", cost: 1 },
        ],
        algorithm,
        startNodeId: "start",
        goalNodeId: "goal",
      });

      expect(run.status).toBe("unreachable");
      expect(run.expansionOrder).toEqual(["start", "a"]);
      expect(run.steps.at(-1)?.frontier).toEqual([]);
      expect(run.pathNodeIds).toEqual([]);
      expect(run.pathCost).toBeNull();
    },
  );
});
