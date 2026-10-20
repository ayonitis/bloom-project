export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export interface SkyPalette {
  gradient: string;
  showStars: boolean;
  showFireflies: boolean;
  label: TimeOfDay;
}

export interface Point {
  x: number;
  y: number;
}
