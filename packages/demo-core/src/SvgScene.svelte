<script lang="ts">
  export let label: string;
  export let viewBox = "0 0 920 420";
</script>

<div class="svg-scene" role="img" aria-label={label}>
  <svg {viewBox} preserveAspectRatio="xMidYMid meet">
    <slot />
  </svg>
</div>

<style>
  .svg-scene {
    overflow-x: auto;
    padding: 16px;
    border: 1px solid var(--color-line, #d7ddd7);
    border-radius: 8px;
    background:
      linear-gradient(180deg, rgba(47, 125, 91, 0.08), transparent 48%),
      #fbfbf8;
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
    }
  }
</style>
