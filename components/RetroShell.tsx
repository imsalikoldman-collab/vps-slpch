"use client";

import type { ReactNode } from "react";

import { useFx } from "@/context/FxContext";

import AccessBar from "@/components/AccessBar";
import PrefsPanel from "@/components/PrefsPanel";
import RouteFxOverlay from "@/components/RouteFxOverlay";
import StatusFooter from "@/components/StatusFooter";
import TopHeader from "@/components/TopHeader";

interface RetroShellProps {
  children: ReactNode;
}

export default function RetroShell({ children }: RetroShellProps) {
  const { preferences } = useFx();

  return (
    <div className={`retro-root ${preferences.safeMode ? "fx-safe" : "fx-max"}`}>
      <div className="monitor-stage" aria-hidden />

      <div className="retro-window">
        <TopHeader />
        <AccessBar />
        <PrefsPanel />

        <main className="retro-content">{children}</main>
        <StatusFooter />

        <div className="crt-layer scanlines" aria-hidden />
        <div className="crt-layer noise" aria-hidden />
        <div className="crt-layer vignette" aria-hidden />
      </div>

      <RouteFxOverlay />
    </div>
  );
}
