# Design Guide

The visual direction is clear, warm, modern, restrained, and screenshot-friendly. The site should feel like a product-quality illustrated atlas, not a paper appendix, game UI, or default framework template.

## Tokens

Use CSS variables from `apps/site/src/styles/tokens.css` for color, radius, shadows, and motion. Add tokens there before creating local one-off values.

Core semantic colors:

- `--color-green`: improvement, active learning flow, successful path.
- `--color-blue`: neural/foundation-model emphasis and selected controls.
- `--color-amber`: symbolic/statistical contrast and caution.
- `--color-coral`: failure, conflict, repair, and limitation states.

Cards and framed tools use `8px` radius. Avoid nested cards; use full-width sections or unframed layouts for page structure.

## Diagram Semantics

- Solid arrows: data or computation flow.
- Dashed arrows: influence or weaker relationship.
- Thick arrows: active main path.
- Muted nodes: background context.
- Highlighted nodes: current focus.
- Coral borders: failure or limitation.

Keep text legible at desktop and mobile widths. A screenshot of one demo state should still communicate the core idea.
