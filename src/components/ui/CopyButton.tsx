"use client";

import { useEffect, useState, type ReactNode } from "react";

/** How long the confirmation stays before the label returns, in ms. */
const RESET_DELAY = 2000;

type CopyButtonProps = {
  text: string;
  label?: string;
  /** Visual content in place of the text label; `label` then becomes the accessible name. */
  idle?: ReactNode;
  /** Shown instead of `idle` once the text is copied. */
  done?: ReactNode;
  className?: string;
};

export function CopyButton({ text, label = "Copy", idle, done, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), RESET_DELAY);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = () => {
    navigator.clipboard.writeText(text).then(
      () => setCopied(true),
      () => setCopied(false),
    );
  };

  if (idle) {
    return (
      <button type="button" onClick={copy} aria-label={label} className={className}>
        {copied ? (done ?? idle) : idle}
        <span aria-live="polite" className="sr-only">
          {copied ? "Copied" : ""}
        </span>
      </button>
    );
  }

  return (
    <button type="button" onClick={copy} className={className}>
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}
