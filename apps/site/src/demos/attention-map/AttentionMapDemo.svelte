<script lang="ts">
  import { DemoShell, SvgScene } from "@ai-history/demo-core";
  import { attentionMapDemo } from "@ai-history/data";

  type Mode = "attention" | "rnn";

  let selectedTokenId = "model";
  let mode: Mode = "attention";

  $: selectedToken = attentionMapDemo.tokens.find((token) => token.id === selectedTokenId) ?? attentionMapDemo.tokens[0];
  $: tokenById = Object.fromEntries(attentionMapDemo.tokens.map((token) => [token.id, token]));
  $: activeLinks = attentionMapDemo.links.filter((link) => link.from === selectedTokenId || link.to === selectedTokenId);

  function selectToken(id: string) {
    selectedTokenId = id;
    mode = "attention";
  }

  function linkIsActive(id: string) {
    return activeLinks.some((link) => link.id === id);
  }
</script>

<DemoShell
  title={attentionMapDemo.title}
  question={attentionMapDemo.question}
  simplificationNote={attentionMapDemo.simplificationNote}
  learningGoals={attentionMapDemo.learningGoals}
>
  <div class="mode-switch" aria-label="模式切换">
    <button type="button" class:active={mode === "attention"} on:click={() => (mode = "attention")}>Attention 模式</button>
    <button type="button" class:active={mode === "rnn"} on:click={() => (mode = "rnn")}>RNN 模式</button>
  </div>

  <div class="token-row" aria-label="选择 token">
    {#each attentionMapDemo.tokens as token}
      <button type="button" class:active={selectedTokenId === token.id} on:click={() => selectToken(token.id)}>
        {token.label}
      </button>
    {/each}
  </div>

  <SvgScene label="Attention token relationship map" viewBox="0 0 860 360">
    <defs>
      <marker id="attention-dot" viewBox="0 0 8 8" refX="4" refY="4" markerWidth="4" markerHeight="4">
        <circle cx="4" cy="4" r="4"></circle>
      </marker>
    </defs>

    {#if mode === "attention"}
      {#each attentionMapDemo.links as link}
        {@const from = tokenById[link.from]}
        {@const to = tokenById[link.to]}
        <line
          id={`attention-link-${link.id}`}
          class:link-active={linkIsActive(link.id)}
          class:link-muted={!linkIsActive(link.id)}
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke-width={2 + link.weight * 4}
          marker-end="url(#attention-dot)"
        />
      {/each}
    {:else}
      {#each attentionMapDemo.tokens.slice(0, -1) as token, index}
        {@const nextToken = attentionMapDemo.tokens[index + 1]}
        <line
          id={`rnn-chain-${token.id}-${nextToken.id}`}
          class="rnn-chain"
          x1={token.x}
          y1={token.y}
          x2={nextToken.x}
          y2={nextToken.y}
        />
      {/each}
    {/if}

    {#each attentionMapDemo.tokens as token}
      <g class:token-active={selectedTokenId === token.id} class:token-muted={mode === "attention" && selectedTokenId !== token.id}>
        <circle id={`token-${token.id}`} cx={token.x} cy={token.y} r="34"></circle>
        <text x={token.x} y={token.y + 5} text-anchor="middle">{token.label}</text>
      </g>
    {/each}
  </SvgScene>

  <div class="explanation" aria-live="polite">
    <span>{mode === "attention" ? "Attention 观察" : "RNN 对比"}</span>
    {#if mode === "attention"}
      <h3>{selectedToken.focusTitle}</h3>
      <p>{selectedToken.focusDescription}</p>
      <p>{attentionMapDemo.attentionModeCopy}</p>
    {:else}
      <h3>RNN 只能沿序列逐步传递</h3>
      <p>{attentionMapDemo.rnnModeCopy}</p>
    {/if}
  </div>
</DemoShell>

<style>
  .mode-switch,
  .token-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 18px;
  }

  button {
    min-height: 40px;
    padding: 0 14px;
    border: 1px solid var(--color-line, #d7ddd7);
    border-radius: 8px;
    color: var(--color-ink, #17201d);
    background: white;
    font: inherit;
    font-weight: 720;
    cursor: pointer;
  }

  button.active {
    color: white;
    background: var(--color-blue, #3469a6);
    border-color: var(--color-blue, #3469a6);
  }

  line {
    stroke: var(--color-blue, #3469a6);
    transition:
      opacity 160ms ease,
      stroke-width 160ms ease;
  }

  marker circle {
    fill: var(--color-blue, #3469a6);
  }

  .link-active {
    opacity: 1;
  }

  .link-muted {
    opacity: 0.16;
  }

  .rnn-chain {
    stroke: #9ba9a1;
    stroke-width: 3;
    stroke-dasharray: 8 10;
    opacity: 0.72;
  }

  circle {
    fill: white;
    stroke: var(--color-line, #d7ddd7);
    stroke-width: 2;
    transition:
      fill 160ms ease,
      stroke 160ms ease,
      opacity 160ms ease;
  }

  .token-active circle {
    fill: #eaf0fa;
    stroke: var(--color-blue, #3469a6);
    stroke-width: 4;
  }

  .token-muted {
    opacity: 0.58;
  }

  text {
    fill: var(--color-ink, #17201d);
    font-size: 16px;
    font-weight: 780;
  }

  .explanation {
    min-height: 150px;
    margin-top: 18px;
    padding: 18px;
    border: 1px solid var(--color-line, #d7ddd7);
    border-radius: 8px;
    background: #f7faf8;
  }

  .explanation span {
    color: var(--color-blue, #3469a6);
    font-weight: 760;
  }

  h3 {
    margin: 6px 0 8px;
    font-size: 1.2rem;
    letter-spacing: 0;
  }

  p {
    margin: 0 0 8px;
    color: var(--color-muted, #5f6864);
  }
</style>
