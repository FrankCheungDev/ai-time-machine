const storyAnchorSafetyGap = 16;

export function scrollStoryAnchorIntoView(storyId: string): void {
  window.requestAnimationFrame(() => {
    const target = document.getElementById(`story-${storyId}`);
    if (!(target instanceof HTMLElement) || target.hidden) {
      return;
    }

    const header = document.querySelector<HTMLElement>(".site-header");
    const targetDocumentTop =
      window.scrollY + target.getBoundingClientRect().top;
    const headerHeight = header?.getBoundingClientRect().height ?? 0;

    window.scrollTo({
      top: Math.max(0, targetDocumentTop - headerHeight - storyAnchorSafetyGap),
      behavior: "auto",
    });
  });
}
