"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import RadioChatterPlayer from "@/components/RadioChatterPlayer";
import { useFx } from "@/context/FxContext";
import { RADIO_CHATTER_STORAGE_KEY } from "@/constants/storage";

import AccessBar from "@/components/AccessBar";
import AdminLoginOverlay from "@/components/AdminLoginOverlay";
import PrefsPanel from "@/components/PrefsPanel";
import RouteFxOverlay from "@/components/RouteFxOverlay";
import StatusFooter from "@/components/StatusFooter";
import TopHeader from "@/components/TopHeader";

interface RetroShellProps {
  children: ReactNode;
}

export default function RetroShell({ children }: RetroShellProps) {
  const { preferences } = useFx();
  const [loginOpen, setLoginOpen] = useState(false);
  const [radioEnabled, setRadioEnabled] = useState(true);
  const fxClass = preferences.fxEnabled ? (preferences.safeMode ? "fx-safe" : "fx-max") : "fx-off";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(RADIO_CHATTER_STORAGE_KEY);
    if (stored === "on") {
      setRadioEnabled(true);
      return;
    }
    if (stored === "off") {
      setRadioEnabled(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(RADIO_CHATTER_STORAGE_KEY, radioEnabled ? "on" : "off");
  }, [radioEnabled]);

  return (
    <div className={`retro-root ${fxClass}`}>
      <div className="monitor-stage" aria-hidden />

      <div className="retro-window">
        <TopHeader onBadgeClick={() => setLoginOpen(true)} />
        <AccessBar />
        <PrefsPanel radioEnabled={radioEnabled} onToggleRadio={() => setRadioEnabled((prev) => !prev)} />

        <main className="retro-content">{children}</main>
        <StatusFooter />

        {preferences.fxEnabled ? <div className="crt-layer scanlines" aria-hidden /> : null}
        {preferences.fxEnabled ? <div className="crt-layer noise" aria-hidden /> : null}
        {preferences.fxEnabled ? <div className="crt-layer vignette" aria-hidden /> : null}
      </div>

      <RouteFxOverlay />
      <AdminLoginOverlay open={loginOpen} onClose={() => setLoginOpen(false)} />
      <RadioChatterPlayer enabled={radioEnabled} />
    </div>
  );
}
