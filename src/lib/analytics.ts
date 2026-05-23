export const GTM_ID = "GTM-5TN647VF";

type DataLayerEvent = Record<string, unknown> & { event: string };

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
  }
}

export function track(event: string, payload: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...payload });
}
