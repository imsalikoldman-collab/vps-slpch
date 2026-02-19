"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useFx } from "@/context/FxContext";

const BOOT_LINES = [
  "BOOT SECTOR VERIFIED",
  "LOADING SCU GRID",
  "AUTH CHECK: PASS",
  "SESSION PIPE: ENCRYPTED",
];

export default function RouteFxOverlay() {
  const pathname = usePathname();
  const { playBoot, preferences, transitionActive } = useFx();

  const [bootActive, setBootActive] = useState(true);
  const [progress, setProgress] = useState(12);
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    if (!preferences.fxEnabled) {
      setBootActive(false);
      setProgress(100);
      setLineIndex(0);
      return;
    }

    setBootActive(true);
    setProgress(6);
    setLineIndex(0);
    playBoot();

    const tickInterval = window.setInterval(() => {
      setProgress((prev) => Math.min(99, prev + (preferences.safeMode ? 8 : 14)));
      setLineIndex((prev) => (prev + 1) % BOOT_LINES.length);
    }, preferences.safeMode ? 180 : 90);

    const timeout = window.setTimeout(
      () => {
        setProgress(100);
        setBootActive(false);
      },
      preferences.safeMode ? 860 : 1100,
    );

    return () => {
      window.clearInterval(tickInterval);
      window.clearTimeout(timeout);
    };
  }, [pathname, playBoot, preferences.fxEnabled, preferences.safeMode]);

  const active = preferences.fxEnabled && (bootActive || transitionActive);

  return (
    <div className={`route-overlay ${active ? "active" : ""} ${preferences.safeMode ? "safe" : "max"}`} aria-live="polite">
      <div className="route-overlay-inner">
        <p className="route-line">SCU//INTERNAL.NET</p>
        <p className="route-line">{transitionActive ? "SWITCHING NODE..." : BOOT_LINES[lineIndex]}</p>
        <div className="route-progress">
          <span style={{ width: `${progress}%` }} />
        </div>
        <p className="route-line tiny">{transitionActive ? "STATIC LINK: RE-ROUTED" : "LOADING SECTOR..."}</p>
      </div>
    </div>
  );
}
