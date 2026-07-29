# Demo Pattern Inventory

This inventory applies the Post-MVP rule: extract a shared primitive only after
the interaction pattern has at least three stable uses.

## Current Decisions

| Pattern                |                                                                           Existing uses | Decision                                                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------: | -------------------------------------------------------------------------------------------------------------------------------------- |
| Demo shell             |                                                                        All eleven demos | Keep `DemoShell` as the shared teaching frame                                                                                          |
| Stepper                |                                Foundation model, LLM systems, RAG, Agent, Safety / Eval | Keep the typed, unit-tested `StepperDemo`; five call sites confirm its existing step contract without requiring a wider API            |
| SVG viewport           | Search, decision boundary, Attention, foundation model, LLM systems, RAG, Agent, Safety | Keep `SvgScene` as the shared fit/detail and scroll-accessibility primitive                                                            |
| Pressed choice buttons |                   Search, Agent, decision boundary, Attention, CNN, LLM systems, Safety | Keep local state adapters for now; LLM systems and Safety reset scenario traces while the other controls change different state graphs |
| Slider                 |                                                                                   Bayes | Keep local; only one numeric teaching interaction exists                                                                               |
| Matrix/grid            |                                                                                     CNN | Keep local; no second stable matrix interaction exists                                                                                 |
| Compare                |                                                         Decision boundary and Attention | Keep local until a third demo shares the same before/after contract                                                                    |
| Story branch           |                                                                                   Agent | Keep local; the retry path is domain-specific                                                                                          |

## Extraction Gate

A new shared primitive must provide:

- a typed public interface;
- keyboard and screen-reader behavior;
- a focused unit test;
- at least three call sites with the same state transition contract;
- less call-site code than the local implementations it replaces.

Visual similarity alone is not sufficient. If scenarios reset different state,
activate different diagram topology, or expose different semantic roles, they
remain local adapters over existing HTML controls.

## Next Review

LLM systems adds a second scenario switch that resets a trace, but it resolves
task-specific step lists while Safety / Eval changes risk states within one
fixed flow. Agent also resolves domain-specific branches, and the remaining
controls mutate different state graphs. Revisit a choice primitive only when a
future self-check or demo matches an existing behavioral contract, not merely
the button appearance.
