<script lang="ts">
  export let label: string;
  export let viewBox = "0 0 920 420";

  $: scrollLabel = `${label}，可适配屏幕或横向滚动查看完整图解`;
  $: controlKey =
    label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
    "diagram";
  $: controlName = `svg-scene-view-${controlKey}`;
  $: fitControlId = `${controlName}-fit`;
  $: detailControlId = `${controlName}-detail`;
</script>

<div class="svg-scene-shell">
  <input
    class="svg-scene-view-input"
    type="radio"
    id={fitControlId}
    name={controlName}
    value="fit"
    checked
  />
  <input
    class="svg-scene-view-input"
    type="radio"
    id={detailControlId}
    name={controlName}
    value="detail"
  />

  <div class="svg-scene-controls">
    <label for={fitControlId} data-view-option="fit">适配屏幕</label>
    <label for={detailControlId} data-view-option="detail">放大查看</label>
  </div>

  <div
    class="svg-scene"
    role="img"
    aria-label={scrollLabel}
    tabindex="0"
    data-mobile-scroll-scene
  >
    <svg {viewBox} preserveAspectRatio="xMidYMid meet">
      <slot />
    </svg>
  </div>
</div>

<style>
  .svg-scene-shell {
    display: grid;
    gap: 12px;
  }

  .svg-scene-controls {
    display: none;
    gap: 10px;
  }

  .svg-scene-view-input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  .svg-scene-controls label {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 0 16px;
    border: 1px solid var(--color-line, #d7ddd7);
    border-radius: 8px;
    color: var(--color-ink, #17201d);
    background: white;
    font: inherit;
    font-weight: 720;
  }

  .svg-scene-view-input:focus-visible ~ .svg-scene-controls {
    outline: 3px solid rgba(52, 105, 166, 0.42);
    outline-offset: 3px;
  }

  .svg-scene-view-input[value="fit"]:checked
    ~ .svg-scene-controls
    [data-view-option="fit"],
  .svg-scene-view-input[value="detail"]:checked
    ~ .svg-scene-controls
    [data-view-option="detail"] {
    color: white;
    background: var(--color-green, #2f7d5b);
    border-color: var(--color-green, #2f7d5b);
  }

  .svg-scene {
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-inline: contain;
    scrollbar-gutter: stable;
    padding: 16px;
    border: 1px solid var(--color-line, #d7ddd7);
    border-radius: 8px;
    background:
      linear-gradient(180deg, rgba(47, 125, 91, 0.08), transparent 48%),
      #fbfbf8;
  }

  .svg-scene:focus-visible {
    outline: 3px solid rgba(52, 105, 166, 0.42);
    outline-offset: 3px;
  }

  svg {
    display: block;
    width: 100%;
    min-width: 0;
    height: auto;
  }

  .svg-scene-view-input[value="detail"]:checked ~ .svg-scene {
    overflow-x: auto;
    box-shadow: inset -18px 0 18px -20px rgba(23, 32, 29, 0.42);
  }

  .svg-scene-view-input[value="detail"]:checked ~ .svg-scene svg {
    min-width: 720px;
  }

  @media (max-width: 760px) {
    .svg-scene-controls {
      display: flex;
    }

    .svg-scene-controls label {
      flex: 1;
    }

    .svg-scene {
      margin-inline: -8px;
      padding: 14px;
    }
  }
</style>
