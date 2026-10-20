export function HabitListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2.5" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-4 rounded-2xl border border-black/5 bg-white/60 px-4 py-4"
        >
          <div className="h-11 w-11 shrink-0 rounded-xl bg-black/5" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-1/3 rounded-full bg-black/5" />
            <div className="h-3 w-1/2 rounded-full bg-black/5" />
          </div>
          <div className="h-9 w-9 shrink-0 rounded-full bg-black/5" />
        </div>
      ))}
    </div>
  );
}
