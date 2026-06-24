export type SolLevel = "sol" | "delvis" | "skyet" | "natt" | "regn";

export type SunCondition = {
  pinId: string;
  level: SolLevel;
  label: string;
  cloudPercent: number;
  sunElevation: number;
  temperature: number | null;
  precipitation: number;
  isSunnyNow: boolean;
  checkedAt: string;
  forecastTime: string;
  source: "yr" | "estimate";
};

export type SunCheckLocation = {
  id: string;
  latitude: number;
  longitude: number;
};
