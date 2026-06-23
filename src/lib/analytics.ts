export const GTM_ID = "GTM-5TN647VF";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown> | unknown[]>;
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: string, payload: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...payload });
}
