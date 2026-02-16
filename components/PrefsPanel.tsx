"use client";

import { useFx } from "@/context/FxContext";

export default function PrefsPanel() {
  const { preferences, toggleSound, toggleSafeMode, playClick } = useFx();

  const handleSoundToggle = () => {
    toggleSound();
  };

  const handleSafeToggle = () => {
    playClick();
    toggleSafeMode();
  };

  return (
    <div className="prefs-panel">
      <button className="pref-btn" type="button" onClick={handleSoundToggle}>
        {preferences.soundEnabled ? "SOUND OFF" : "SOUND ON"}
      </button>

      <button className={`pref-btn ${preferences.safeMode ? "active" : ""}`} type="button" onClick={handleSafeToggle}>
        SAFE MODE {preferences.safeMode ? "ON" : "OFF"}
      </button>

      <span className="fx-level">FX: {preferences.fxLevel.toUpperCase()}</span>
    </div>
  );
}
