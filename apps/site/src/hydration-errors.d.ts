export {};

declare global {
  interface Window {
    __aiHistoryHydrationErrors?: WeakSet<HTMLElement>;
    __aiHistoryUserInteracted?: boolean;
  }
}
