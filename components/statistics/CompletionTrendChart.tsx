import type { DailyActivity } from "@/types/statistics";

interface CompletionTrendChartProps {
  dailyActivity: DailyActivity[];
}

const WEEKDAY_INITIALS = ["S", "M", "T", "W", "T", "F", "S"];

interface Bar {
  label: string;
  date: string;
  completed: number;
  scheduled: number;
}

function bucketByWeek(daily: DailyActivity[]): Bar[] {
  const buckets: Bar[] = [];
  for (let i = 0; i < daily.length; i += 7) {
    const chunk = daily.slice(i, i + 7);
    const completed = chunk.reduce((sum, day) => sum + day.completed, 0);
    const scheduled = chunk.reduce((sum, day) => sum + day.scheduled, 0);
    const start = new Date(`${chunk[0].date}T00:00:00`);
    buckets.push({
      label: `${start.getMonth() + 1}/${start.getDate()}`,
      date: `week of ${chunk[0].date}`,
      completed,
      scheduled,
    });
  }
  return buckets;
}

export function CompletionTrendChart({ dailyActivity }: CompletionTrendChartProps) {
  // For anything longer than ~6 weeks, per-day bars become unreadably
  // thin — fall back to weekly buckets instead of shrinking bars until
  // they're unusable.
  const useWeeklyBuckets = dailyActivity.length > 42;

  const bars: Bar[] = useWeeklyBuckets
    ? bucketByWeek(dailyActivity)
    : dailyActivity.map((day) => ({
        label: WEEKDAY_INITIALS[new Date(`${day.date}T00:00:00`).getDay()],
        date: day.date,
        completed: day.completed,
        scheduled: day.scheduled,
      }));

  const maxScheduled = Math.max(1, ...bars.map((bar) => Math.max(bar.scheduled, bar.completed)));
  const totalCompleted = dailyActivity.reduce((sum, day) => sum + day.completed, 0);
  const totalScheduled = dailyActivity.reduce((sum, day) => sum + day.scheduled, 0);
  const overallRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;

  return (
    <div>
      <div className="flex items-end justify-between gap-1 rounded-2xl border border-black/5 bg-white/70 p-4">
        {bars.map((bar, index) => {
          const completedHeight = (bar.completed / maxScheduled) * 100;
          const scheduledHeight = (bar.scheduled / maxScheduled) * 100;
          const rate = bar.scheduled > 0 ? Math.round((bar.completed / bar.scheduled) * 100) : 0;
          return (
            <div
              key={`${bar.date}-${index}`}
              className="flex flex-1 flex-col items-center gap-1"
              title={`${bar.date}: ${bar.completed} of ${bar.scheduled} completed (${rate}%)`}
            >
              <div className="relative flex h-24 w-full items-end justify-center">
                <div
                  className="absolute bottom-0 w-2/3 rounded-t-sm bg-black/5"
                  style={{ height: `${scheduledHeight}%` }}
                  aria-hidden
                />
                <div
                  className="absolute bottom-0 w-2/3 rounded-t-sm bg-bloom-accent"
                  style={{ height: `${completedHeight}%` }}
                  aria-hidden
                />
              </div>
              <span className="text-[10px] text-bloom-muted">{bar.label}</span>
            </div>
          );
        })}
      </div>

      {/* Accessible text equivalent of the chart above — never rely on the
          bars alone to communicate the numbers. */}
      <p className="mt-2 text-xs text-bloom-muted">
        Completion rate over this period: <span className="font-medium text-bloom-text">{overallRate}%</span> (
        {totalCompleted} of {totalScheduled} scheduled habits completed).
      </p>
    </div>
  );
}
