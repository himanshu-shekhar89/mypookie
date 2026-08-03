"use client";

import { useEffect, useRef, useState } from "react";

export type SoundtrackSettings = {
  enabled: boolean;
  audioUrl: string;
  name: string;
  startMode: string;
  startBlockId: string;
  startSeconds: string;
  templateId?: string;
};
type SoundtrackBlock = { id: string; name: string };

export function GiftSoundtrack({
  settings,
  blocks,
  step,
}: {
  settings: SoundtrackSettings;
  blocks: SoundtrackBlock[];
  step: number;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const initialized = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [mediaPlaying, setMediaPlaying] = useState(false);
  const startIndex =
    settings.startMode === "From a specific block"
      ? Math.max(
          0,
          blocks.findIndex(
            (block) => block.id === (settings.startBlockId || blocks[0]?.id),
          ),
        )
      : 0;
  const ready = step >= startIndex;
  useEffect(() => {
    const listener = (event: Event) =>
      setMediaPlaying(
        Boolean((event as CustomEvent<{ playing: boolean }>).detail?.playing),
      );
    window.addEventListener("mypookie-media-playing", listener);
    return () => window.removeEventListener("mypookie-media-playing", listener);
  }, []);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!settings.enabled || !playing || !ready || mediaPlaying) {
      audio.pause();
      return;
    }
    audio.volume = 0.14;
    if (!initialized.current) {
      const seek = Math.max(0, Number(settings.startSeconds) || 0);
      audio.currentTime = Number.isFinite(audio.duration)
        ? Math.min(seek, Math.max(audio.duration - 0.25, 0))
        : seek;
      initialized.current = true;
    }
    void audio.play().catch(() => {});
  }, [mediaPlaying, playing, ready, settings.enabled, settings.startSeconds]);
  useEffect(() => {
    initialized.current = false;
  }, [settings.audioUrl, settings.startBlockId, settings.startMode]);
  if (!settings.enabled) return null;
  const target = blocks[startIndex]?.name || "the first block";
  return (
    <div
      className={`recipient-soundtrack ${playing && !mediaPlaying ? "playing" : ""}`}
    >
      <button
        disabled={!settings.audioUrl}
        onClick={() => setPlaying((value) => !value)}
        aria-label={playing ? "Pause soundtrack" : "Play soundtrack"}
      >
        {playing && !mediaPlaying ? "Ⅱ" : "♫"}
      </button>
      <div>
        <strong>{settings.name || "Soothing soundtrack"}</strong>
        <small>
          {mediaPlaying
            ? "Paused for this voice or video"
            : playing && !ready
              ? `Queued for ${target}`
              : playing
                ? "Soft background · SFX stay louder"
                : settings.startMode === "From a specific block"
                  ? `Starts at ${target}`
                  : "Tap to play softly"}
        </small>
      </div>
      {settings.audioUrl && (
        <audio ref={audioRef} src={settings.audioUrl} loop preload="metadata" />
      )}
    </div>
  );
}

export function signalGiftMedia(playing: boolean) {
  if (typeof window !== "undefined")
    window.dispatchEvent(
      new CustomEvent("mypookie-media-playing", { detail: { playing } }),
    );
}
