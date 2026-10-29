"use client";

import type { ReactNode } from "react";

import { useIsHydrated } from "@/hooks/useIsHydrated";
import { usePrefersDark } from "@/hooks/usePrefersDark";
import { ACCENTS, type Accent, type Theme, type Tone } from "@/lib/appearance";
import { cn } from "@/lib/cn";
import { useAppearance } from "@/stores/appearance";

import { CheckIcon, MonitorIcon, MoonIcon, SunIcon } from "./icons";
import { SegmentedControl, type SegmentedOption } from "./SegmentedControl";

const THEME_OPTIONS: SegmentedOption<Theme>[] = [
  { value: "system", label: "System", icon: <MonitorIcon className="size-4" /> },
  { value: "light", label: "Light", icon: <SunIcon className="size-4" /> },
  { value: "dark", label: "Dark", icon: <MoonIcon className="size-4" /> },
];

const TONE_OPTIONS: SegmentedOption<Tone>[] = [
  { value: "soft", label: "Soft" },
  { value: "deep", label: "Deep" },
];

const ACCENT_META: Record<Accent, { label: string; color: string }> = {
  gold: { label: "Gold", color: "var(--color-gold)" },
  orange: { label: "Orange", color: "var(--color-orange)" },
  red: { label: "Red", color: "var(--color-red)" },
  magenta: { label: "Magenta", color: "var(--color-magenta)" },
};

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-display text-p4 text-muted uppercase select-none">{label}</span>
      {children}
    </div>
  );
}

export function AppearanceControls({ className }: { className?: string }) {
  const hydrated = useIsHydrated();
  const { theme, accent, tone, setTheme, setAccent, setTone } = useAppearance();
  const systemDark = usePrefersDark();
  const isDark = hydrated && (theme === "system" ? systemDark : theme === "dark");

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <Group label="Theme">
        <SegmentedControl
          value={hydrated ? theme : null}
          onChange={setTheme}
          options={THEME_OPTIONS}
          aria-label="Color theme"
          pending={!hydrated}
        />
      </Group>

      <Group label="Dark tone">
        <SegmentedControl
          value={hydrated ? tone : null}
          onChange={setTone}
          options={TONE_OPTIONS}
          aria-label="Dark surface tone"
          pending={!hydrated}
          disabled={hydrated && !isDark}
        />
        {hydrated && !isDark && (
          <span className="text-p4 dark:text-muted">Applies when the dark theme is on.</span>
        )}
      </Group>

      <Group label="Accent">
        <div role="radiogroup" aria-label="Accent color" className="flex items-center gap-2.5">
          {ACCENTS.map((value) => {
            const meta = ACCENT_META[value];
            const checked = hydrated && value === accent;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={checked}
                aria-label={meta.label}
                title={meta.label}
                disabled={!hydrated}
                onClick={() => setAccent(value)}
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-manila-light transition",
                  hydrated ? "cursor-pointer" : "cursor-wait",
                  checked &&
                    "ring-2 ring-faded-black ring-offset-2 ring-offset-surface-raised dark:ring-manila-light",
                )}
                style={{ backgroundColor: meta.color }}
              >
                {checked && <CheckIcon className="size-4" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </Group>
    </div>
  );
}
