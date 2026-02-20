"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface RadioManifest {
  phraseFiles: string[];
  hissFiles: string[];
}

interface RadioChatterPlayerProps {
  enabled: boolean;
}

const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

const PHRASE_VOLUME = 0.18;
const HISS_VOLUME = 0.12;
const PHRASE_GAP_MIN_MS = 1200;
const PHRASE_GAP_MAX_MS = 2800;
const HISS_DURATION_MIN_MS = 900;
const HISS_DURATION_MAX_MS = 2200;
const HISS_CHANCE = 0.7;
const RETRY_DELAY_MS = 1400;

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toFileUrl(file: string): string {
  return `/api/media/radio/${encodeURIComponent(file)}`;
}

export default function RadioChatterPlayer({ enabled }: RadioChatterPlayerProps) {
  const [manifest, setManifest] = useState<RadioManifest | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const runIdRef = useRef(0);
  const phraseIndexRef = useRef(0);

  const sortedManifest = useMemo<RadioManifest | null>(() => {
    if (!manifest) {
      return null;
    }

    return {
      phraseFiles: [...manifest.phraseFiles].sort((a, b) => collator.compare(a, b)),
      hissFiles: [...manifest.hissFiles].sort((a, b) => collator.compare(a, b)),
    };
  }, [manifest]);

  const ensureAudio = useCallback((): HTMLAudioElement => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = "auto";
      audio.loop = false;
      audioRef.current = audio;
    }
    return audioRef.current;
  }, []);

  const stopAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
  }, []);

  const sleep = useCallback((ms: number) => {
    return new Promise<void>((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }, []);

  const playClip = useCallback(
    async (url: string, volume: number, runId: number, maxDurationMs?: number): Promise<boolean> => {
      if (runIdRef.current !== runId) {
        return false;
      }

      const audio = ensureAudio();
      audio.pause();
      audio.src = url;
      audio.currentTime = 0;
      audio.volume = volume;
      audio.loop = false;

      try {
        await audio.play();
      } catch {
        return false;
      }

      const startedAt = performance.now();
      const maxPlayMs = maxDurationMs ?? 45_000;

      while (runIdRef.current === runId) {
        const elapsed = performance.now() - startedAt;
        if (audio.ended || elapsed >= maxPlayMs) {
          break;
        }
        await sleep(80);
      }

      audio.pause();
      audio.currentTime = 0;

      return runIdRef.current === runId;
    },
    [ensureAudio, sleep],
  );

  useEffect(() => {
    const controller = new AbortController();

    const loadManifest = async () => {
      try {
        const response = await fetch("/api/media/radio/manifest", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Failed to load radio manifest.");
        }

        const data = (await response.json()) as Partial<RadioManifest>;
        setManifest({
          phraseFiles: Array.isArray(data.phraseFiles) ? data.phraseFiles : [],
          hissFiles: Array.isArray(data.hissFiles) ? data.hissFiles : [],
        });
      } catch {
        if (!controller.signal.aborted) {
          setManifest({
            phraseFiles: [],
            hissFiles: [],
          });
        }
      }
    };

    void loadManifest();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const runId = runIdRef.current + 1;
    runIdRef.current = runId;
    stopAudio();

    if (!enabled || !sortedManifest || sortedManifest.phraseFiles.length === 0) {
      return () => {
        runIdRef.current += 1;
        stopAudio();
      };
    }

    const playLoop = async () => {
      while (runIdRef.current === runId) {
        const currentIndex = phraseIndexRef.current % sortedManifest.phraseFiles.length;
        const phraseName = sortedManifest.phraseFiles[currentIndex];
        const phraseUrl = toFileUrl(phraseName);
        const phrasePlayed = await playClip(phraseUrl, PHRASE_VOLUME, runId);

        if (!phrasePlayed) {
          await sleep(RETRY_DELAY_MS);
          continue;
        }

        phraseIndexRef.current = (currentIndex + 1) % sortedManifest.phraseFiles.length;

        const baseGapMs = randomInt(PHRASE_GAP_MIN_MS, PHRASE_GAP_MAX_MS);
        const shouldInsertHiss =
          sortedManifest.hissFiles.length > 0 && Math.random() < HISS_CHANCE;

        if (!shouldInsertHiss) {
          await sleep(baseGapMs);
          continue;
        }

        const preHissGapMs = randomInt(350, 1000);
        await sleep(preHissGapMs);
        if (runIdRef.current !== runId) {
          break;
        }

        const hissName =
          sortedManifest.hissFiles[randomInt(0, sortedManifest.hissFiles.length - 1)];
        const hissUrl = toFileUrl(hissName);
        const hissDurationMs = randomInt(HISS_DURATION_MIN_MS, HISS_DURATION_MAX_MS);
        await playClip(hissUrl, HISS_VOLUME, runId, hissDurationMs);

        const postHissGapMs = Math.max(350, baseGapMs - preHissGapMs);
        await sleep(postHissGapMs);
      }
    };

    void playLoop();

    return () => {
      runIdRef.current += 1;
      stopAudio();
    };
  }, [enabled, playClip, sleep, sortedManifest, stopAudio]);

  return null;
}
