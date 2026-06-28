# Diagram Guide

Diagrams are reusable teaching assets. They should be easy to screenshot, bind to interaction state, and inspect in code.

## Workflow

1. Sketch in Figma, Excalidraw, Mermaid, or by hand in SVG.
2. Export or assemble SVG.
3. Optimize with SVGO when useful.
4. Add stable ids and semantic roles.
5. Bind state in a Svelte demo or render as a static Astro page.

## SVG Naming

Use predictable ids:

- `node-*`
- `arrow-*`
- `label-*`
- `group-*`
- `highlight-*`
- `background-*`

Example:

```svg
<g id="node-query" data-role="node" data-step="1"></g>
```

## Screenshot-Friendly States

Before capturing, choose a state that shows one core idea. Keep the title, active node, key arrow, and simplification note visible. Avoid dense parameter panels and overlapping labels.

## Export Notes

Prefer SVG for diagrams that need interaction. Export PNG only for share previews, documentation thumbnails, or platforms that cannot embed SVG.
