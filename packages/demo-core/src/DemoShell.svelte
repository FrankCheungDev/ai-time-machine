<script lang="ts">
  export let title: string;
  export let question: string;
  export let simplificationNote: string;
</script>

<section class="demo-shell" aria-labelledby="demo-title">
  <div class="demo-heading">
    <p class="demo-kicker">教学型交互案例</p>
    <h2 id="demo-title">{title}</h2>
    <p class="question">{question}</p>
  </div>
  <slot />
  <div class="note">
    <strong>简化说明</strong>
    <p>{simplificationNote}</p>
  </div>
</section>

<style>
  .demo-shell {
    margin-top: 34px;
    padding: clamp(18px, 4vw, 32px);
    background: var(--color-surface, #fff);
    border: 1px solid var(--color-line, #d7ddd7);
    border-radius: 8px;
    box-shadow: var(--shadow-soft, 0 20px 55px rgba(30, 45, 39, 0.12));
  }

  .demo-heading {
    max-width: 760px;
  }

  .demo-kicker {
    margin: 0 0 6px;
    color: var(--color-green, #2f7d5b);
    font-weight: 760;
  }

  h2 {
    margin: 0;
    font-size: clamp(1.6rem, 3vw, 2.4rem);
    line-height: 1.12;
    letter-spacing: 0;
  }

  .question,
  .note {
    color: var(--color-muted, #5f6864);
  }

  .question {
    margin: 10px 0 0;
    font-size: 1.05rem;
  }

  .note {
    margin: 18px 0 0;
    padding-top: 16px;
    border-top: 1px solid var(--color-line, #d7ddd7);
    font-size: 0.94rem;
  }

  .note strong {
    color: var(--color-blue, #3469a6);
  }

  .note p {
    margin: 6px 0 0;
  }
</style>
