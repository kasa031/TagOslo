import type { MapPinSummary, PoliticianSummary, PollSummary } from "@/types";
import type { PinDetail } from "@/types/pin-detail";

/** Tomme lister — ingen falske stemmer eller innhold i produksjon. */
export const DEMO_PINS: MapPinSummary[] = [];
export const DEMO_PIN_DETAILS: Record<string, PinDetail> = {};
export const DEMO_POLITICIANS: PoliticianSummary[] = [];
export const DEMO_POLLS: PollSummary[] = [];
