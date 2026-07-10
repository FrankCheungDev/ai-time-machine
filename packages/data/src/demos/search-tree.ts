import type { SearchTreeDemo } from "@ai-history/demo-core";
import {
  cloneData,
  defaultLocale,
  getLocalizedValue,
  type Locale,
} from "../locales";

const nodes: SearchTreeDemo["nodes"] = [
  { id: "start", label: "Start", x: 420, y: 54 },
  { id: "a", label: "A", x: 214, y: 152 },
  { id: "b", label: "B", x: 420, y: 152 },
  { id: "c", label: "C", x: 626, y: 152 },
  { id: "a1", label: "A1", x: 136, y: 260 },
  { id: "a2", label: "A2", x: 292, y: 260 },
  { id: "b1", label: "B1", x: 420, y: 260 },
  { id: "goal", label: "Goal", x: 626, y: 260 },
];

const edges: SearchTreeDemo["edges"] = [
  { id: "start-a", from: "start", to: "a" },
  { id: "start-b", from: "start", to: "b" },
  { id: "start-c", from: "start", to: "c" },
  { id: "a-a1", from: "a", to: "a1" },
  { id: "a-a2", from: "a", to: "a2" },
  { id: "b-b1", from: "b", to: "b1" },
  { id: "c-goal", from: "c", to: "goal" },
];

const searchTreeDemos = {
  "zh-CN": {
    title: "符号主义与搜索：机器能否通过搜索表现出智能？",
    question: "早期 AI 为什么依赖搜索？为什么会遭遇组合爆炸？",
    simplificationNote:
      "本案例是小型预设搜索树，不运行真实 A*；节点顺序和代价用于解释搜索策略差异。",
    learningGoals: [
      "理解明确规则空间中搜索可以系统地寻找解。",
      "比较 BFS、DFS、A* 在展开顺序和 frontier 成本上的差异。",
      "看到状态空间扩大后为什么会出现组合爆炸。",
    ],
    strategies: [
      {
        id: "bfs",
        label: "BFS 广度优先",
        title: "BFS 逐层展开所有可能",
        description:
          "广度优先不急着猜方向，而是一层一层扩展；可靠但很快遇到状态数量膨胀。",
        activeNodeIds: ["start", "a", "b", "c"],
        activeEdgeIds: ["start-a", "start-b", "start-c"],
        frontierLabel: "frontier：A、B、C，下一层会继续膨胀",
      },
      {
        id: "dfs",
        label: "DFS 深度优先",
        title: "DFS 先沿一条路走到底",
        description:
          "深度优先节省记忆，但可能钻进不好的分支，迟迟看不到更近的目标。",
        activeNodeIds: ["start", "a", "a1", "a2"],
        activeEdgeIds: ["start-a", "a-a1", "a-a2"],
        frontierLabel: "frontier：A1、A2，目标可能还在另一边",
      },
      {
        id: "astar",
        label: "A* 启发式",
        title: "A* 用启发式优先靠近目标",
        description:
          "A* 用估计距离给搜索排序，让明确规则空间中的搜索更像有方向的探索。",
        activeNodeIds: ["start", "c", "goal"],
        activeEdgeIds: ["start-c", "c-goal"],
        frontierLabel: "frontier：Goal 优先，估计代价最低",
      },
    ],
  },
  en: {
    title: "Symbolic AI And Search: Can machines act intelligent by searching?",
    question:
      "Why did early AI rely on search, and why did it encounter combinatorial explosion?",
    simplificationNote:
      "This demo uses a small preset search tree and does not run a real A* algorithm. Node order and costs illustrate differences between search strategies.",
    learningGoals: [
      "Understand how search can systematically find solutions in a space with explicit rules.",
      "Compare BFS, DFS, and A* by expansion order and frontier cost.",
      "See why combinatorial explosion appears as the state space grows.",
    ],
    strategies: [
      {
        id: "bfs",
        label: "BFS breadth-first",
        title: "BFS expands every possibility level by level",
        description:
          "Breadth-first search does not guess a direction immediately. It expands one level at a time, which is reliable but quickly creates many states.",
        activeNodeIds: ["start", "a", "b", "c"],
        activeEdgeIds: ["start-a", "start-b", "start-c"],
        frontierLabel: "frontier: A, B, C; the next level will keep growing",
      },
      {
        id: "dfs",
        label: "DFS depth-first",
        title: "DFS follows one path as far as it can",
        description:
          "Depth-first search saves memory, but it may enter a poor branch and miss a nearby goal for a long time.",
        activeNodeIds: ["start", "a", "a1", "a2"],
        activeEdgeIds: ["start-a", "a-a1", "a-a2"],
        frontierLabel: "frontier: A1, A2; the goal may be on the other side",
      },
      {
        id: "astar",
        label: "A* heuristic",
        title: "A* uses a heuristic to move toward the goal",
        description:
          "A* ranks the search using estimated distance, giving exploration in an explicit rule space a sense of direction.",
        activeNodeIds: ["start", "c", "goal"],
        activeEdgeIds: ["start-c", "c-goal"],
        frontierLabel: "frontier: Goal first, with the lowest estimated cost",
      },
    ],
  },
} satisfies Record<Locale, Omit<SearchTreeDemo, "nodes" | "edges">>;

export function getSearchTreeDemo(
  locale: Locale = defaultLocale,
): SearchTreeDemo {
  return {
    ...getLocalizedValue(searchTreeDemos, locale),
    nodes: cloneData(nodes),
    edges: cloneData(edges),
  };
}

export const searchTreeDemo = getSearchTreeDemo();
