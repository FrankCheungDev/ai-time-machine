<script lang="ts">
  export let label: string;
  export let viewBox = "0 0 920 420";

  $: scrollLabel = `${label}，可横向滚动查看完整图解`;
</script>

<div class="svg-scene" role="img" aria-label={scrollLabel} tabindex="0" data-mobile-scroll-scene>
  <svg {viewBox} preserveAspectRatio="xMidYMid meet">
    <slot />
  </svg>
</div>

<style>
  .svg-scene {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-inline: contain;
    scrollbar-gutter: stable;
    padding: 16px;
    border: 1px solid var(--color-line, #d7ddd7);
    border-radius: 8px;
    background:
      linear-gradient(180deg, rgba(47, 125, 91, 0.08), transparent 48%),
      #fbfbf8;
    box-shadow: inset -18px 0 18px -20px rgba(23, 32, 29, 0.42);
  }

  .svg-scene:focus-visible {
    outline: 3px solid rgba(52, 105, 166, 0.42);
    outline-offset: 3px;
  }

  svg {
    display: block;
    width: 100%;
    min-width: 720px;
    height: auto;
  }

  @media (max-width: 760px) {
    .svg-scene {
      margin-inline: -8px;
      padding: 14px;
    }
  }
</style>
