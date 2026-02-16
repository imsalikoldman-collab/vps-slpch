export interface FxPreferences {
  soundEnabled: boolean;
  safeMode: boolean;
  fxLevel: "max" | "safe";
}

export interface FxContextValue {
  preferences: FxPreferences;
  transitionActive: boolean;
  toggleSound: () => void;
  toggleSafeMode: () => void;
  playTransition: () => Promise<void>;
  playClick: () => void;
  playBoot: () => void;
}
