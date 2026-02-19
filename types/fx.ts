export interface FxPreferences {
  fxEnabled: boolean;
  soundEnabled: boolean;
  safeMode: boolean;
  fxLevel: "max" | "safe";
}

export interface FxContextValue {
  preferences: FxPreferences;
  transitionActive: boolean;
  toggleFxEnabled: () => void;
  toggleSound: () => void;
  toggleSafeMode: () => void;
  playTransition: () => Promise<void>;
  playClick: () => void;
  playBoot: () => void;
}
