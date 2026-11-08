"use client";

import { useEffect, useState } from "react";

import { site } from "@/data/site";
import { cn } from "@/lib/cn";

const formatter = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  hourCycle: "h23",
  timeZone: site.timeZone,
});

const PERIODS = [
  { from: 21, label: "Night" },
  { from: 17, label: "Evening" },
  { from: 12, label: "Afternoon" },
  { from: 5, label: "Morning" },
] as const;

const CITY = site.location.split(",")[0] ?? site.location;

function periodAt(date: Date) {
  const hour = Number(formatter.format(date));
  return PERIODS.find((period) => hour >= period.from)?.label ?? "Night";
}

/** "Evening in Bengaluru", in the owner's time zone. */
export function DayPeriod({ className }: { className?: string }) {
  const [period, setPeriod] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setPeriod(periodAt(new Date()));
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className={cn("inline-grid", className)}>
      {PERIODS.map(({ label }) => (
        <span
          key={label}
          className={cn(
            "col-start-1 row-start-1 whitespace-nowrap",
            label !== period && "invisible",
          )}
        >
          {label} in {CITY}
        </span>
      ))}
    </span>
  );
}
