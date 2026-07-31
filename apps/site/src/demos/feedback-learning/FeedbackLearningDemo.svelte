<script lang="ts">
  import { DemoShell, SvgScene } from "@ai-history/demo-core";
  import type {
    FeedbackLearningEdge,
    FeedbackLearningEpisode,
    FeedbackLearningNode,
    FeedbackLearningTransition,
  } from "@ai-history/demo-core";
  import { getFeedbackLearningDemo, type Locale } from "@ai-history/data";
  import { getLocalizedLearningChapter } from "../../i18n/learning";
  import { getSiteCopy } from "../../i18n/siteCopy";
  import {
    getEpisodeStatus,
    getNextFeedbackLearningState,
    getPolicySnapshotId,
    getPreviousFeedbackLearningState,
    resetFeedbackLearningState,
    setFeedbackLearningMode,
    type EpisodeStatus,
  } from "./feedbackLearningState";

  export let locale: Locale = "zh-CN";

  const nodeWidth = 134;
  const nodeHeight = 78;

  let viewState = resetFeedbackLearningState();

  $: feedbackLearningDemo = getFeedbackLearningDemo(locale);
  $: currentStep =
    feedbackLearningDemo.steps[viewState.currentIndex] ??
    feedbackLearningDemo.steps[0];
  $: boundaryView =
    feedbackLearningDemo.boundaryViews.find(
      ({ id }) => id === viewState.mode,
    ) ?? feedbackLearningDemo.boundaryViews[0];
  $: policySnapshot =
    feedbackLearningDemo.policySnapshots.find(
      ({ id }) => id === getPolicySnapshotId(viewState.currentIndex),
    ) ?? feedbackLearningDemo.policySnapshots[0];
  $: activeNodeIds =
    viewState.mode === "runtime"
      ? boundaryView.activeNodeIds
      : currentStep.activeNodeIds;
  $: activeEdgeIds =
    viewState.mode === "runtime"
      ? boundaryView.activeEdgeIds
      : currentStep.activeEdgeIds;
  $: activityTitle = getLocalizedLearningChapter(
    "reinforcement-learning",
    locale,
  ).activityTitle;
  $: demoCoreCopy = getSiteCopy(locale).demoCore;
  $: copy =
    locale === "en"
      ? {
          sceneLabel:
            "Scripted feedback learning path from state to an updated policy",
          modeSwitchLabel: "Compare training time with runtime",
          trainingMode: "Training time",
          runtimeMode: "Runtime",
          stepLabel: "Step",
          controlsLabel: "Feedback learning walkthrough controls",
          resetLabel: "Reset",
          findingLabel: "Mechanism boundary",
          episodesTitle: "Two fixed episodes",
          episodesDescription:
            "These paths are scripted for comparison; no action is randomly sampled.",
          pendingEpisode: "Not run yet",
          activeEpisode: "Current episode",
          completeEpisode: "Compared",
          actionsLabel: "Actions",
          rewardsLabel: "Rewards",
          returnLabel: "Return",
          resultLabel: "Result",
          pendingValue: "Pending",
          policyTitle: "Illustrative policy",
          leftAction: "Left action",
          rightAction: "Right action",
          policyAriaLabel: (left: number, right: number) =>
            `Illustrative policy: left action ${left} percent, right action ${right} percent`,
          boundaryTitle: "Training / runtime boundary",
          weightsLabel: "Model weights",
          nextActionLabel: "Next action",
          signalsTitle: "What kind of feedback is this?",
          signalsDescription:
            "The same word, feedback, can name signals that act at different stages.",
          signalLabel: "Signal",
          inputLabel: "Input",
          timingLabel: "When it acts",
          effectLabel: "What it changes",
          boundaryLabel: "Boundary",
        }
      : {
          sceneLabel: "从状态到更新后策略的脚本化反馈学习路径",
          modeSwitchLabel: "比较训练时与运行时",
          trainingMode: "训练时",
          runtimeMode: "运行时",
          stepLabel: "步骤",
          controlsLabel: "反馈学习分步演示控制",
          resetLabel: "重置",
          findingLabel: "机制边界",
          episodesTitle: "两个固定 episode",
          episodesDescription: "两条路径均为审核过的脚本，不执行随机动作采样。",
          pendingEpisode: "尚未运行",
          activeEpisode: "当前 episode",
          completeEpisode: "已进入比较",
          actionsLabel: "动作",
          rewardsLabel: "奖励",
          returnLabel: "回报",
          resultLabel: "结果",
          pendingValue: "待运行",
          policyTitle: "示意策略",
          leftAction: "左侧动作",
          rightAction: "右侧动作",
          policyAriaLabel: (left: number, right: number) =>
            `示意策略：左侧动作 ${left}%，右侧动作 ${right}%`,
          boundaryTitle: "训练时 / 运行时边界",
          weightsLabel: "模型权重",
          nextActionLabel: "下一步动作",
          signalsTitle: "这是什么类型的反馈？",
          signalsDescription:
            "同一个“反馈”词语可能指向作用阶段完全不同的信号。",
          signalLabel: "信号",
          inputLabel: "输入",
          timingLabel: "作用时机",
          effectLabel: "改变什么",
          boundaryLabel: "边界",
        };

  function getNode(nodes: FeedbackLearningNode[], nodeId: string) {
    const node = nodes.find(({ id }) => id === nodeId);

    if (!node) {
      throw new Error(
        `Feedback learning path references unknown node "${nodeId}".`,
      );
    }

    return node;
  }

  function getEdgePath(
    edge: FeedbackLearningEdge,
    nodes: FeedbackLearningNode[],
  ) {
    const from = getNode(nodes, edge.from);
    const to = getNode(nodes, edge.to);
    const startX = from.x + nodeWidth;
    const startY = from.y + nodeHeight / 2;
    const endX = to.x;
    const endY = to.y + nodeHeight / 2;

    return `M ${startX} ${startY} L ${endX} ${endY}`;
  }

  function getTransition(transitionId: string): FeedbackLearningTransition {
    const transition = feedbackLearningDemo.transitions.find(
      ({ id }) => id === transitionId,
    );

    if (!transition) {
      throw new Error(
        `Feedback learning episode references unknown transition "${transitionId}".`,
      );
    }

    return transition;
  }

  function getEpisodeActions(episode: FeedbackLearningEpisode): string {
    return episode.transitionIds
      .map((transitionId) => getTransition(transitionId).actionLabel)
      .join(" → ");
  }

  function getEpisodeRewards(episode: FeedbackLearningEpisode): string {
    return episode.rewards
      .map((reward) => `${reward >= 0 ? "+" : ""}${reward}`)
      .join(" → ");
  }

  function getEpisodeStatusLabel(status: EpisodeStatus): string {
    if (status === "active") return copy.activeEpisode;
    if (status === "complete") return copy.completeEpisode;
    return copy.pendingEpisode;
  }

  function toPolicyPercent(probability: number): number {
    return Math.round(probability * 100);
  }

  function isNodeActive(nodeId: string): boolean {
    return activeNodeIds.includes(nodeId);
  }

  function isEdgeActive(edgeId: string): boolean {
    return activeEdgeIds.includes(edgeId);
  }

  function previousStep() {
    viewState = getPreviousFeedbackLearningState(viewState);
  }

  function nextStep() {
    viewState = getNextFeedbackLearningState(
      viewState,
      feedbackLearningDemo.steps.length,
    );
  }

  function resetDemo() {
    viewState = resetFeedbackLearningState();
  }

  function changeMode(event: Event) {
    const input = event.currentTarget;

    if (!(input instanceof HTMLInputElement)) return;

    viewState = setFeedbackLearningMode(
      viewState,
      input.checked ? "runtime" : "training",
      feedbackLearningDemo.steps.length,
    );
  }
</script>

<DemoShell
  title={activityTitle ?? feedbackLearningDemo.title}
  question={feedbackLearningDemo.question}
  simplificationNote={feedbackLearningDemo.simplificationNote}
  learningGoals={feedbackLearningDemo.learningGoals}
  demoKicker={demoCoreCopy.demoKicker}
  learningGoalsLabel={demoCoreCopy.learningGoalsLabel}
  simplificationLabel={demoCoreCopy.simplificationLabel}
>
  <section class="boundary-toolbar" aria-labelledby="boundary-view-title">
    <div class="boundary-view-copy" aria-live="polite">
      <span>{copy.boundaryTitle}</span>
      <strong id="boundary-view-title">{boundaryView.title}</strong>
      <p>{boundaryView.description}</p>
    </div>
    <label class="mode-switch">
      <span>{copy.trainingMode}</span>
      <input
        type="checkbox"
        role="switch"
        aria-label={copy.modeSwitchLabel}
        checked={viewState.mode === "runtime"}
        on:change={changeMode}
      />
      <i aria-hidden="true"></i>
      <span>{copy.runtimeMode}</span>
    </label>
  </section>

  <div class="walkthrough">
    <div class="walkthrough-scene" data-feedback-mode={viewState.mode}>
      <SvgScene
        label={copy.sceneLabel}
        viewBox="0 0 1160 330"
        fitLabel={demoCoreCopy.fitLabel}
        detailLabel={demoCoreCopy.detailLabel}
        scrollSuffix={demoCoreCopy.scrollSuffix}
      >
        <defs>
          <marker
            id="feedback-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path class="arrow-muted" d="M 0 0 L 10 5 L 0 10 z"></path>
          </marker>
          <marker
            id="feedback-arrow-active"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path class="arrow-active" d="M 0 0 L 10 5 L 0 10 z"></path>
          </marker>
        </defs>

        <rect
          class:runtime-zone={viewState.mode === "runtime"}
          class="phase-zone"
          x="8"
          y="52"
          width="1144"
          height="220"
          rx="8"
        ></rect>
        <text class="phase-label" x="28" y="82">{boundaryView.label}</text>

        {#each feedbackLearningDemo.edges as edge}
          <path
            id={`feedback-edge-${edge.id}`}
            data-role="arrow"
            class="feedback-edge"
            class:edge-active={isEdgeActive(edge.id)}
            class:edge-muted={!isEdgeActive(edge.id)}
            d={getEdgePath(edge, feedbackLearningDemo.nodes)}
            marker-end={isEdgeActive(edge.id)
              ? "url(#feedback-arrow-active)"
              : "url(#feedback-arrow)"}
          />
        {/each}

        {#each feedbackLearningDemo.nodes as node}
          <g
            id={`feedback-node-${node.id}`}
            data-role="node"
            class:node-active={isNodeActive(node.id)}
            class:node-muted={!isNodeActive(node.id)}
            class:node-current={viewState.mode === "training" &&
              currentStep.nodeId === node.id}
            class:node-boundary={viewState.mode === "runtime" &&
              isNodeActive(node.id)}
          >
            <rect
              x={node.x}
              y={node.y}
              width={nodeWidth}
              height={nodeHeight}
              rx="8"
            ></rect>
            <text
              class="node-label"
              x={node.x + nodeWidth / 2}
              y={node.y + 31}
              text-anchor="middle">{node.label}</text
            >
            <text
              class="node-caption"
              x={node.x + nodeWidth / 2}
              y={node.y + 55}
              text-anchor="middle">{node.description}</text
            >
          </g>
        {/each}
      </SvgScene>
    </div>

    <section
      class={`step-content ${currentStep.findingTone}`}
      data-feedback-finding={currentStep.findingTone}
      aria-live="polite"
    >
      <span
        >{copy.stepLabel}
        {viewState.currentIndex + 1} / {feedbackLearningDemo.steps.length}</span
      >
      <h3>{currentStep.title}</h3>
      <p>{currentStep.description}</p>
      <div class="finding">
        <small>{copy.findingLabel}</small>
        <strong>{currentStep.statusLabel}</strong>
        <p>{currentStep.finding}</p>
      </div>
    </section>

    <div class="walkthrough-controls" aria-label={copy.controlsLabel}>
      <button
        type="button"
        on:click={previousStep}
        disabled={viewState.currentIndex === 0}
        >{demoCoreCopy.previousLabel}</button
      >
      <button
        class="next"
        type="button"
        on:click={nextStep}
        disabled={viewState.currentIndex ===
          feedbackLearningDemo.steps.length - 1}
        >{demoCoreCopy.nextLabel}</button
      >
      <button class="reset" type="button" on:click={resetDemo}
        >{copy.resetLabel}</button
      >
    </div>
  </div>

  <section class="episode-section" aria-labelledby="episode-heading">
    <div class="section-heading">
      <h3 id="episode-heading">{copy.episodesTitle}</h3>
      <p>{copy.episodesDescription}</p>
    </div>
    <div class="episode-grid">
      {#each feedbackLearningDemo.episodes as episode}
        {@const episodeStatus = getEpisodeStatus(
          viewState.currentIndex,
          episode.id === "exploration" ? "exploration" : "baseline",
        )}
        {@const episodeRevealed = episodeStatus !== "pending"}
        <article
          class:active={episodeStatus === "active"}
          class:complete={episodeStatus === "complete"}
          data-feedback-episode={episode.id}
          data-episode-status={episodeStatus}
        >
          <span>{episode.label} · {getEpisodeStatusLabel(episodeStatus)}</span>
          <h4>{episode.title}</h4>
          <p>{episode.description}</p>
          <dl>
            <div>
              <dt>{copy.actionsLabel}</dt>
              <dd>
                {episodeRevealed
                  ? getEpisodeActions(episode)
                  : copy.pendingValue}
              </dd>
            </div>
            <div>
              <dt>{copy.rewardsLabel}</dt>
              <dd>
                {episodeRevealed
                  ? getEpisodeRewards(episode)
                  : copy.pendingValue}
              </dd>
            </div>
            <div>
              <dt>{copy.returnLabel}</dt>
              <dd>
                {episodeRevealed
                  ? `${episode.returnValue >= 0 ? "+" : ""}${episode.returnValue}`
                  : copy.pendingValue}
              </dd>
            </div>
          </dl>
          {#if episodeRevealed}
            <p class="episode-result">
              <strong>{copy.resultLabel}</strong>
              {episode.result}
            </p>
          {/if}
        </article>
      {/each}
    </div>
  </section>

  <div class="learning-boundary-grid">
    <section
      class="policy-panel"
      data-testid="feedback-policy"
      data-policy-snapshot={policySnapshot.id}
      aria-labelledby="policy-heading"
    >
      <span>{copy.policyTitle}</span>
      <h3 id="policy-heading">{policySnapshot.label}</h3>
      <div
        class="policy-bars"
        role="img"
        aria-label={copy.policyAriaLabel(
          toPolicyPercent(policySnapshot.leftProbability),
          toPolicyPercent(policySnapshot.rightProbability),
        )}
      >
        <div>
          <strong>{copy.leftAction}</strong>
          <div class="policy-track">
            <i
              style={`width: ${toPolicyPercent(policySnapshot.leftProbability)}%`}
            ></i>
          </div>
          <span>{toPolicyPercent(policySnapshot.leftProbability)}%</span>
        </div>
        <div>
          <strong>{copy.rightAction}</strong>
          <div class="policy-track right">
            <i
              style={`width: ${toPolicyPercent(policySnapshot.rightProbability)}%`}
            ></i>
          </div>
          <span>{toPolicyPercent(policySnapshot.rightProbability)}%</span>
        </div>
      </div>
      <p>{policySnapshot.explanation}</p>
    </section>

    <section
      class:runtime={viewState.mode === "runtime"}
      class="boundary-panel"
      data-feedback-boundary={viewState.mode}
      aria-labelledby="boundary-heading"
      aria-live="polite"
    >
      <span>{copy.boundaryTitle}</span>
      <h3 id="boundary-heading">{boundaryView.title}</h3>
      <dl>
        <div>
          <dt>{copy.weightsLabel}</dt>
          <dd>{boundaryView.weightStatus}</dd>
        </div>
        <div>
          <dt>{copy.nextActionLabel}</dt>
          <dd>{boundaryView.nextActionStatus}</dd>
        </div>
      </dl>
    </section>
  </div>

  <section class="signal-section" aria-labelledby="signal-heading">
    <div class="section-heading">
      <h3 id="signal-heading">{copy.signalsTitle}</h3>
      <p>{copy.signalsDescription}</p>
    </div>
    <table aria-label={copy.signalsTitle}>
      <thead>
        <tr>
          <th scope="col">{copy.signalLabel}</th>
          <th scope="col">{copy.inputLabel}</th>
          <th scope="col">{copy.timingLabel}</th>
          <th scope="col">{copy.effectLabel}</th>
          <th scope="col">{copy.boundaryLabel}</th>
        </tr>
      </thead>
      <tbody>
        {#each feedbackLearningDemo.signalComparisons as signal}
          <tr data-feedback-signal={signal.id}>
            <th scope="row" data-label={copy.signalLabel}>{signal.label}</th>
            <td data-label={copy.inputLabel}>{signal.inputSignal}</td>
            <td data-label={copy.timingLabel}>{signal.timing}</td>
            <td data-label={copy.effectLabel}>{signal.effect}</td>
            <td data-label={copy.boundaryLabel}>{signal.boundary}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>
</DemoShell>

<style>
  .boundary-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-top: 20px;
    padding: 16px;
    border: 1px solid var(--color-line, #d7ddd7);
    border-radius: 8px;
    background: #f6f9fd;
  }

  .boundary-view-copy {
    min-width: 0;
  }

  .boundary-view-copy > span,
  .policy-panel > span,
  .boundary-panel > span {
    color: var(--color-blue, #3469a6);
    font-size: 0.82rem;
    font-weight: 760;
  }

  .boundary-view-copy strong {
    display: block;
    margin-top: 3px;
    color: var(--color-ink, #17201d);
  }

  .boundary-view-copy p {
    margin: 4px 0 0;
    color: var(--color-muted, #5f6864);
  }

  .mode-switch {
    display: grid;
    grid-template-columns: auto 52px auto;
    align-items: center;
    flex: 0 0 auto;
    gap: 9px;
    min-height: 44px;
    color: var(--color-ink, #17201d);
    font-size: 0.88rem;
    font-weight: 720;
    cursor: pointer;
  }

  .mode-switch input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
  }

  .mode-switch i {
    position: relative;
    grid-column: 2;
    grid-row: 1;
    width: 52px;
    height: 30px;
    border: 2px solid var(--color-blue, #3469a6);
    border-radius: 999px;
    background: white;
    transition: background 180ms ease;
  }

  .mode-switch i::after {
    position: absolute;
    top: 4px;
    left: 4px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--color-blue, #3469a6);
    content: "";
    transition:
      background 180ms ease,
      transform 180ms ease;
  }

  .mode-switch input:checked + i {
    border-color: var(--color-green, #2f7d5b);
    background: #eaf6ef;
  }

  .mode-switch input:checked + i::after {
    background: var(--color-green, #2f7d5b);
    transform: translateX(22px);
  }

  .mode-switch input:focus-visible + i {
    outline: 3px solid rgba(52, 105, 166, 0.42);
    outline-offset: 3px;
  }

  .walkthrough {
    display: grid;
    grid-template-areas:
      "scene content"
      "scene controls";
    grid-template-columns: minmax(0, 1fr) minmax(290px, 350px);
    gap: 14px 18px;
    align-items: start;
    margin-top: 24px;
  }

  .walkthrough-scene {
    grid-area: scene;
    min-width: 0;
  }

  .walkthrough-scene :global(.svg-scene-shell) {
    margin-top: 0;
  }

  .phase-zone {
    fill: #f6f9fd;
    stroke: #c9d9ec;
    stroke-dasharray: 8 8;
    transition:
      fill 180ms ease,
      stroke 180ms ease;
  }

  .phase-zone.runtime-zone {
    fill: #f2faf5;
    stroke: #c7dfd1;
  }

  .phase-label {
    fill: var(--color-blue, #3469a6);
    font-size: 13px;
    font-weight: 780;
  }

  [data-feedback-mode="runtime"] .phase-label {
    fill: var(--color-green, #2f7d5b);
  }

  .feedback-edge {
    fill: none;
    stroke: #9ba9a1;
    stroke-width: 3;
    transition:
      opacity 180ms ease,
      stroke 180ms ease,
      stroke-width 180ms ease;
  }

  .arrow-muted {
    fill: #9ba9a1;
  }

  .arrow-active {
    fill: var(--color-green, #2f7d5b);
  }

  .edge-active {
    stroke: var(--color-green, #2f7d5b);
    stroke-width: 5;
    opacity: 1;
  }

  .edge-muted {
    opacity: 0.22;
  }

  g rect {
    fill: white;
    stroke: var(--color-line, #d7ddd7);
    stroke-width: 2;
    transition:
      fill 180ms ease,
      opacity 180ms ease,
      stroke 180ms ease;
  }

  .node-active rect {
    fill: #eef4fb;
    stroke: var(--color-blue, #3469a6);
  }

  .node-current rect {
    fill: #eaf6ef;
    stroke: var(--color-green, #2f7d5b);
    stroke-width: 4;
  }

  .node-boundary rect {
    fill: #fff8e8;
    stroke: var(--color-amber, #b87918);
    stroke-width: 3;
  }

  .node-muted {
    opacity: 0.34;
  }

  .node-label {
    fill: var(--color-ink, #17201d);
    font-size: 11px;
    font-weight: 780;
  }

  .node-caption {
    fill: var(--color-muted, #5f6864);
    font-size: 9px;
    font-weight: 620;
  }

  .step-content {
    grid-area: content;
    min-height: 238px;
    padding: 18px;
    border: 1px solid var(--color-line, #d7ddd7);
    border-left: 4px solid var(--color-blue, #3469a6);
    border-radius: 8px;
    background: #f7faf8;
  }

  .step-content.update {
    border-left-color: var(--color-green, #2f7d5b);
  }

  .step-content.boundary {
    border-left-color: var(--color-amber, #b87918);
  }

  .step-content > span {
    color: var(--color-blue, #3469a6);
    font-weight: 760;
  }

  .step-content h3,
  .section-heading h3,
  .policy-panel h3,
  .boundary-panel h3,
  .episode-grid h4 {
    letter-spacing: 0;
  }

  .step-content h3 {
    margin: 6px 0 8px;
    font-size: 1.18rem;
  }

  .step-content > p {
    margin: 0;
    color: var(--color-muted, #5f6864);
  }

  .finding {
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid var(--color-line, #d7ddd7);
  }

  .finding small,
  .finding strong {
    display: block;
  }

  .finding small {
    color: var(--color-muted, #5f6864);
    font-weight: 720;
  }

  .finding strong {
    margin-top: 3px;
    color: var(--color-green, #2f7d5b);
  }

  .finding p {
    margin: 5px 0 0;
    color: var(--color-ink, #17201d);
  }

  .walkthrough-controls {
    display: grid;
    grid-area: controls;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .walkthrough-controls button {
    min-width: 0;
    min-height: 44px;
    padding: 0 14px;
    border: 1px solid var(--color-line, #d7ddd7);
    border-radius: 8px;
    color: var(--color-ink, #17201d);
    background: white;
    font: inherit;
    font-weight: 720;
    cursor: pointer;
  }

  .walkthrough-controls .next {
    color: white;
    border-color: var(--color-green, #2f7d5b);
    background: var(--color-green, #2f7d5b);
  }

  .walkthrough-controls .reset {
    grid-column: 1 / -1;
    color: var(--color-blue, #3469a6);
    border-color: var(--color-blue, #3469a6);
  }

  .walkthrough-controls button:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  .episode-section,
  .signal-section {
    margin-top: 24px;
  }

  .section-heading h3 {
    margin: 0;
    font-size: 1.25rem;
  }

  .section-heading p {
    margin: 5px 0 0;
    color: var(--color-muted, #5f6864);
  }

  .episode-grid,
  .learning-boundary-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    margin-top: 14px;
  }

  .episode-grid article,
  .policy-panel,
  .boundary-panel {
    min-width: 0;
    padding: 18px;
    border: 1px solid var(--color-line, #d7ddd7);
    border-radius: 8px;
    background: white;
    transition:
      background 180ms ease,
      border 180ms ease,
      box-shadow 180ms ease;
  }

  .episode-grid article.active {
    border-color: var(--color-blue, #3469a6);
    box-shadow: 0 12px 28px rgba(52, 105, 166, 0.12);
  }

  .episode-grid article.complete {
    border-color: #c7dfd1;
    background: #f7faf8;
  }

  .episode-grid article > span {
    color: var(--color-blue, #3469a6);
    font-size: 0.82rem;
    font-weight: 760;
  }

  .episode-grid h4 {
    margin: 5px 0 7px;
    font-size: 1.08rem;
  }

  .episode-grid article > p {
    margin: 0;
    color: var(--color-muted, #5f6864);
  }

  .episode-grid dl,
  .boundary-panel dl {
    display: grid;
    gap: 9px;
    margin: 14px 0 0;
  }

  .episode-grid dl div,
  .boundary-panel dl div {
    display: grid;
    grid-template-columns: minmax(86px, auto) minmax(0, 1fr);
    gap: 12px;
  }

  dt {
    color: var(--color-muted, #5f6864);
    font-size: 0.84rem;
    font-weight: 720;
  }

  dd {
    min-width: 0;
    margin: 0;
    overflow-wrap: anywhere;
    color: var(--color-ink, #17201d);
    font-weight: 720;
  }

  .episode-result {
    margin-top: 14px !important;
    padding-top: 12px;
    border-top: 1px solid var(--color-line, #d7ddd7);
  }

  .episode-result strong {
    color: var(--color-green, #2f7d5b);
  }

  .learning-boundary-grid {
    margin-top: 14px;
  }

  .policy-panel h3,
  .boundary-panel h3 {
    margin: 5px 0 0;
    font-size: 1.08rem;
  }

  .policy-bars {
    display: grid;
    gap: 10px;
    margin-top: 15px;
  }

  .policy-bars > div {
    display: grid;
    grid-template-columns: minmax(88px, auto) minmax(100px, 1fr) 44px;
    align-items: center;
    gap: 9px;
  }

  .policy-bars strong,
  .policy-bars span {
    font-size: 0.86rem;
  }

  .policy-bars span {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .policy-track {
    overflow: hidden;
    height: 12px;
    border-radius: 999px;
    background: #e9eeeb;
  }

  .policy-track i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--color-blue, #3469a6);
    transition: width 220ms ease;
  }

  .policy-track.right i {
    background: var(--color-green, #2f7d5b);
  }

  .policy-panel > p {
    margin: 14px 0 0;
    color: var(--color-muted, #5f6864);
  }

  .boundary-panel {
    border-left: 4px solid var(--color-blue, #3469a6);
    background: #f6f9fd;
  }

  .boundary-panel.runtime {
    border-left-color: var(--color-amber, #b87918);
    background: #fffaf0;
  }

  .signal-section table {
    width: 100%;
    margin-top: 14px;
    border: 1px solid var(--color-line, #d7ddd7);
    border-collapse: separate;
    border-spacing: 0;
    border-radius: 8px;
    table-layout: fixed;
    overflow: hidden;
    background: white;
  }

  .signal-section th,
  .signal-section td {
    padding: 12px;
    border-bottom: 1px solid var(--color-line, #d7ddd7);
    overflow-wrap: anywhere;
    text-align: left;
    vertical-align: top;
  }

  .signal-section thead th {
    color: var(--color-blue, #3469a6);
    background: #f6f9fd;
    font-size: 0.82rem;
  }

  .signal-section tbody th {
    color: var(--color-ink, #17201d);
    font-size: 0.9rem;
  }

  .signal-section td {
    color: var(--color-muted, #5f6864);
    font-size: 0.88rem;
  }

  .signal-section tr:last-child th,
  .signal-section tr:last-child td {
    border-bottom: 0;
  }

  @media (max-width: 960px) {
    .walkthrough {
      grid-template-areas:
        "scene"
        "content"
        "controls";
      grid-template-columns: 1fr;
    }

    .step-content {
      min-height: 0;
    }
  }

  @media (max-width: 760px) {
    .boundary-toolbar,
    .episode-grid,
    .learning-boundary-grid {
      grid-template-columns: 1fr;
    }

    .boundary-toolbar {
      display: grid;
    }

    .mode-switch {
      justify-self: stretch;
      grid-template-columns: 1fr 52px 1fr;
    }

    .mode-switch span:last-child {
      text-align: right;
    }

    .signal-section table,
    .signal-section tbody,
    .signal-section tr,
    .signal-section th,
    .signal-section td {
      display: block;
      width: 100%;
    }

    .signal-section table {
      border: 0;
      background: transparent;
    }

    .signal-section thead {
      position: absolute;
      overflow: hidden;
      width: 1px;
      height: 1px;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
    }

    .signal-section tbody {
      display: grid;
      gap: 12px;
    }

    .signal-section tr {
      overflow: hidden;
      border: 1px solid var(--color-line, #d7ddd7);
      border-radius: 8px;
      background: white;
    }

    .signal-section tbody th,
    .signal-section td {
      box-sizing: border-box;
      padding: 10px 12px;
      border-bottom: 1px solid var(--color-line, #d7ddd7);
    }

    .signal-section tbody th::before,
    .signal-section td::before {
      display: block;
      margin-bottom: 3px;
      color: var(--color-blue, #3469a6);
      content: attr(data-label);
      font-size: 0.74rem;
      font-weight: 760;
    }

    .signal-section tr:last-child th,
    .signal-section tr:not(:last-child) td:last-child,
    .signal-section tr:last-child td:last-child {
      border-bottom: 0;
    }

    .policy-bars > div {
      grid-template-columns: minmax(76px, auto) minmax(80px, 1fr) 42px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .mode-switch i,
    .mode-switch i::after,
    .phase-zone,
    .feedback-edge,
    g rect,
    .episode-grid article,
    .policy-track i {
      transition-duration: 0.001ms !important;
    }
  }
</style>
