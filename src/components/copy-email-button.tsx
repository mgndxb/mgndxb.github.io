"use client";

import { useEffect, useRef, useState } from "react";

import { sound } from "@/lib/sound";

export function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  function swapTo(next: boolean) {
    setSwapping(true);
    timers.current.push(
      window.setTimeout(() => {
        setCopied(next);
        setSwapping(false);
      }, 120),
    );
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // Clipboard access can be blocked; the mailto link next to this button still works.
      return;
    }
    sound.success();
    swapTo(true);
    timers.current.push(window.setTimeout(() => swapTo(false), 2000));
  }

  return (
    <button type="button" onClick={copy} className="pill pill-ghost min-w-[11rem] justify-center">
      <span className="swap-label" data-swapping={swapping}>
        {copied ? "Copied" : "Copy address"}
      </span>
      <span className="sr-only" aria-live="polite">
        {copied ? "Email address copied" : ""}
      </span>
    </button>
  );
}
