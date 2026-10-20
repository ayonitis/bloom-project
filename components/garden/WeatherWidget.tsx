"use client";

import { CloudRain, Cloudy, Moon, Sun } from "lucide-react";
import { WEATHER_LABELS } from "@/lib/gardenEngine";
import type { Weather } from "@/types/garden";

const WEATHER_ICONS: Record<Weather, typeof Sun> = {
  sunny: Sun,
  cloudy: Cloudy,
  rain: CloudRain,
  night: Moon,
};

interface WeatherWidgetProps {
  weather: Weather;
  onCycle: () => void;
}

export function WeatherWidget({ weather, onCycle }: WeatherWidgetProps) {
  const Icon = WEATHER_ICONS[weather];

  return (
    <button
      type="button"
      onClick={onCycle}
      aria-label={`Weather: ${WEATHER_LABELS[weather]}. Press to change.`}
      className="focus-ring flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1.5 text-sm font-medium text-bloom-text shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white"
    >
      <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
      {WEATHER_LABELS[weather]}
    </button>
  );
}
