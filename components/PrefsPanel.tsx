"use client";

import { useFx } from "@/context/FxContext";

export default function PrefsPanel() {
  const { preferences, toggleFxEnabled, toggleSound, toggleSafeMode, playClick } = useFx();

  const fxLevelLabel = preferences.fxEnabled ? preferences.fxLevel.toUpperCase() : "OFF";

  const handleFxToggle = () => {
    playClick();
    toggleFxEnabled();
  };

  const handleSoundToggle = () => {
    toggleSound();
  };

  const handleSafeToggle = () => {
    playClick();
    toggleSafeMode();
  };

  return (
    <div className="prefs-panel">
      <button className={`pref-btn ${preferences.fxEnabled ? "active" : ""}`} type="button" onClick={handleFxToggle}>
        FX {preferences.fxEnabled ? "ON" : "OFF"}
      </button>

      <button className="pref-btn" type="button" onClick={handleSoundToggle}>
        {preferences.soundEnabled ? "SOUND OFF" : "SOUND ON"}
      </button>

      <button className={`pref-btn ${preferences.safeMode ? "active" : ""}`} type="button" onClick={handleSafeToggle}>
        SAFE MODE {preferences.safeMode ? "ON" : "OFF"}
      </button>

      <span className="fx-level">FX: {fxLevelLabel}</span>
    </div>
  );
}
