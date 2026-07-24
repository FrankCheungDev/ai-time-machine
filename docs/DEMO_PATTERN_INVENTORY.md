# Demo Pattern Inventory

This inventory applies the Post-MVP rule: extract a shared primitive only after
the interaction pattern has at least three stable uses.

## Current Decisions

| Pattern                |                                    Existing uses | Decision                                                                                                                                    |
| ---------------------- | -----------------------------------------------: | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Demo shell             |                                  All eight demos | Keep `DemoShell` as the shared teaching frame                                                                                               |
| Stepper                |                                    RAG and Agent | Keep `StepperDemo`; do not widen its API until a third step-driven demo exists                                                              |
| SVG viewport           | Search, decision boundary, Attention, RAG, Agent | Keep `SvgScene` as the shared fit/detail and scroll-accessibility primitive                                                                 |
| Pressed choice buttons | Search, Agent, decision boundary, Attention, CNN | Keep local state adapters for now; labels, reset behavior, and downstream state differ enough that one component would hide domain behavior |
| Slider                 |                                            Bayes | Keep local; only one numeric teaching interaction exists                                                                                    |
| Matrix/grid            |                                              CNN | Keep local; no second stable matrix interaction exists                                                                                      |
| Compare                |                  Decision boundary and Attention | Keep local until a third demo shares the same before/after contract                                                                         |
| Story branch           |                                            Agent | Keep local; the retry path is domain-specific                                                                                               |

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

Review the pressed-choice pattern when Safety / Evaluation is implemented. If
Safety introduces the same selection and reset contract as three existing
demos, extract a typed choice primitive in that PR and migrate only the matching
call sites.
