"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { FX_STORAGE_KEY } from "@/constants/storage";
import type { FxContextValue, FxPreferences } from "@/types/fx";

const DEFAULT_PREFERENCES: FxPreferences = {
  fxEnabled: true,
  soundEnabled: false,
  safeMode: false,
  fxLevel: "max",
};

const FxContext = createContext<FxContextValue | null>(null);

function clampVolume(value: number): number {
  return Math.max(0.001, Math.min(0.6, value));
}

export function FxProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<FxPreferences>(DEFAULT_PREFERENCES);
  const [transitionActive, setTransitionActive] = useState(false);

  const audioRef = useRef<AudioContext | null>(null);
  const transitionResolverRef = useRef<(() => void) | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(FX_STORAGE_KEY);
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as Partial<FxPreferences>;
      const fxEnabled = typeof parsed.fxEnabled === "boolean" ? parsed.fxEnabled : true;
      if (
        typeof parsed.soundEnabled === "boolean" &&
        typeof parsed.safeMode === "boolean" &&
        (parsed.fxLevel === "max" || parsed.fxLevel === "safe")
      ) {
        setPreferences({
          fxEnabled,
          soundEnabled: parsed.soundEnabled,
          safeMode: parsed.safeMode,
          fxLevel: parsed.fxLevel,
        });
      }
    } catch {
      window.localStorage.removeItem(FX_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(FX_STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const ensureAudioContext = useCallback(async (): Promise<AudioContext | null> => {
    if (typeof window === "undefined") {
      return null;
    }

    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) {
      return null;
    }

    if (!audioRef.current) {
      audioRef.current = new AudioCtor();
    }

    if (audioRef.current.state === "suspended") {
      await audioRef.current.resume();
    }

    return audioRef.current;
  }, []);

  const clearTransitionState = useCallback(() => {
    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    setTransitionActive(false);
    transitionResolverRef.current?.();
    transitionResolverRef.current = null;
  }, []);

  const playTone = useCallback(
    async (frequency: number, durationMs: number, waveform: OscillatorType, baseGain: number) => {
      if (!preferences.fxEnabled || !preferences.soundEnabled) {
        return;
      }

      const audio = await ensureAudioContext();
      if (!audio) {
        return;
      }

      const now = audio.currentTime;
      const osc = audio.createOscillator();
      const gain = audio.createGain();

      const gainValue = preferences.safeMode ? baseGain * 0.5 : baseGain;
      osc.type = waveform;
      osc.frequency.setValueAtTime(frequency, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(clampVolume(gainValue), now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

      osc.connect(gain);
      gain.connect(audio.destination);

      osc.start(now);
      osc.stop(now + durationMs / 1000 + 0.02);
    },
    [ensureAudioContext, preferences.fxEnabled, preferences.safeMode, preferences.soundEnabled],
  );

  const playNoiseBurst = useCallback(
    async (durationMs: number, baseGain: number) => {
      if (!preferences.fxEnabled || !preferences.soundEnabled) {
        return;
      }

      const audio = await ensureAudioContext();
      if (!audio) {
        return;
      }

      const frameCount = Math.floor(audio.sampleRate * (durationMs / 1000));
      const noiseBuffer = audio.createBuffer(1, frameCount, audio.sampleRate);
      const channel = noiseBuffer.getChannelData(0);

      for (let i = 0; i < frameCount; i += 1) {
        channel[i] = Math.random() * 2 - 1;
      }

      const source = audio.createBufferSource();
      source.buffer = noiseBuffer;

      const filter = audio.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.setValueAtTime(preferences.safeMode ? 700 : 1200, audio.currentTime);

      const gain = audio.createGain();
      gain.gain.value = clampVolume(preferences.safeMode ? baseGain * 0.4 : baseGain);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(audio.destination);

      source.start();
      source.stop(audio.currentTime + durationMs / 1000);
    },
    [ensureAudioContext, preferences.fxEnabled, preferences.safeMode, preferences.soundEnabled],
  );

  const toggleFxEnabled = useCallback(() => {
    setPreferences((prev) => ({
      ...prev,
      fxEnabled: !prev.fxEnabled,
    }));

    if (preferences.fxEnabled) {
      clearTransitionState();
    }
  }, [clearTransitionState, preferences.fxEnabled]);

  const toggleSafeMode = useCallback(() => {
    setPreferences((prev) => {
      const nextSafe = !prev.safeMode;
      return {
        ...prev,
        safeMode: nextSafe,
        fxLevel: nextSafe ? "safe" : "max",
      };
    });
  }, []);

  const toggleSound = useCallback(() => {
    const nextEnabled = !preferences.soundEnabled;

    setPreferences((prev) => ({
      ...prev,
      soundEnabled: nextEnabled,
    }));

    if (!nextEnabled || !preferences.fxEnabled) {
      return;
    }

    void ensureAudioContext().then((audio) => {
      if (!audio) {
        return;
      }

      const now = audio.currentTime;
      const osc = audio.createOscillator();
      const gain = audio.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(760, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.06, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    });
  }, [ensureAudioContext, preferences.fxEnabled, preferences.soundEnabled]);

  const playClick = useCallback(() => {
    if (!preferences.fxEnabled) {
      return;
    }
    void playTone(980, 90, "square", 0.04);
  }, [playTone, preferences.fxEnabled]);

  const playBoot = useCallback(() => {
    if (!preferences.fxEnabled) {
      return;
    }

    void playNoiseBurst(180, 0.07);
    window.setTimeout(() => {
      void playTone(240, 120, "sawtooth", 0.035);
    }, preferences.safeMode ? 55 : 25);
  }, [playNoiseBurst, playTone, preferences.fxEnabled, preferences.safeMode]);

  const playTransition = useCallback(async () => {
    if (!preferences.fxEnabled) {
      clearTransitionState();
      return;
    }

    if (transitionTimeoutRef.current !== null) {
      return;
    }

    const duration = preferences.safeMode ? 480 : 720;
    setTransitionActive(true);
    void playNoiseBurst(Math.min(260, duration), 0.1);

    return new Promise<void>((resolve) => {
      transitionResolverRef.current = resolve;
      transitionTimeoutRef.current = window.setTimeout(() => {
        setTransitionActive(false);
        transitionTimeoutRef.current = null;
        transitionResolverRef.current?.();
        transitionResolverRef.current = null;
      }, duration);
    });
  }, [clearTransitionState, playNoiseBurst, preferences.fxEnabled, preferences.safeMode]);

  const value = useMemo<FxContextValue>(
    () => ({
      preferences,
      transitionActive,
      toggleFxEnabled,
      toggleSound,
      toggleSafeMode,
      playTransition,
      playClick,
      playBoot,
    }),
    [
      playBoot,
      playClick,
      playTransition,
      preferences,
      toggleFxEnabled,
      toggleSafeMode,
      toggleSound,
      transitionActive,
    ],
  );

  return <FxContext.Provider value={value}>{children}</FxContext.Provider>;
}

export function useFx(): FxContextValue {
  const context = useContext(FxContext);
  if (!context) {
    throw new Error("useFx must be used inside FxProvider.");
  }
  return context;
}
