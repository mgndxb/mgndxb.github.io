"use client";

import { useEffect, useState } from "react";

import { sound, type Tuning } from "@/lib/sound";

const DIALS: { key: keyof Tuning; label: string; hint: string }[] = [
  { key: "master", label: "Volume", hint: "Everything" },
  { key: "ambient", label: "Ambience", hint: "The pad, drone and air" },
  { key: "effects", label: "Effects", hint: "Hovers, chimes, notes" },
  { key: "brightness", label: "Brightness", hint: "Dark and soft ↔ clear and airy" },
  { key: "space", label: "Space", hint: "Reverb and echo" },
];

/**
 * A hidden mixing panel for tuning the sound by ear. Only appears with ?tune in the URL.
 * Settings are saved in this browser; the numbers can be copied into DEFAULT_TUNING.
 */
export function SoundTuner() {
  const [visible, setVisible] = useState(false);
  const [tuning, setTuning] = useState<Tuning>(sound.tuning);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("tune")) return;
    sound.loadSavedTuning();
    const off = sound.subscribe(setEnabled);
    const show = window.setTimeout(() => {
      setTuning({ ...sound.tuning });
      setEnabled(sound.enabled);
      setVisible(true);
    }, 0);
    return () => {
      off();
      window.clearTimeout(show);
    };
  }, []);

  if (!visible) return null;

  function change(key: keyof Tuning, value: number) {
    sound.setTuning({ [key]: value });
    setTuning({ ...sound.tuning });
  }

  return (
    <aside
      aria-label="Sound tuner"
      className="fixed bottom-4 left-4 z-[150] w-[min(22rem,calc(100vw-2rem))] rounded-[20px] border border-white/15 bg-surface/95 p-5 font-mono text-[12px] shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9)] backdrop-blur-xl"
    >
      <div className="flex items-center justify-between">
        <p className="text-bone">Sound tuner</p>
        <span className="text-ash">{enabled ? "Sound on" : "Turn sound on first"}</span>
      </div>
      <div className="mt-4 space-y-4">
        {DIALS.map((dial) => (
          <label key={dial.key} className="block">
            <span className="flex justify-between">
              <span className="text-bone">{dial.label}</span>
              <span className="tabular-nums text-ash">{tuning[dial.key].toFixed(2)}</span>
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={tuning[dial.key]}
              onChange={(event) => change(dial.key, Number(event.target.value))}
              className="mt-1.5 w-full accent-mint"
            />
            <span className="text-dim">{dial.hint}</span>
          </label>
        ))}
      </div>
      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={() => {
            sound.resetTuning();
            setTuning({ ...sound.tuning });
          }}
          className="board-btn"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={() => void navigator.clipboard?.writeText(JSON.stringify(tuning))}
          className="board-btn board-btn-strong"
        >
          Copy settings
        </button>
      </div>
    </aside>
  );
}
