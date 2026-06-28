# Motion Guide

Motion should clarify state changes without stealing attention from the explanation.

## Timing

- Hover and card feedback: `160-220ms`.
- Step changes: `260-500ms`.
- Major overview transitions: `600-900ms`.
- Story branch transitions: `900-1600ms` only when needed.

## Properties

Prefer:

- `transform`
- `opacity`
- `stroke-dashoffset`

Avoid frequent animation of:

- `width`, `height`
- `top`, `left`
- `margin`, `padding`
- large blur or filter effects

## Reduced Motion

All interactive demos must remain understandable with reduced motion. Prefer simple opacity and highlight changes when users request reduced motion.

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```
