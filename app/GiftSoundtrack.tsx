"use client";

import { useEffect, useRef, useState } from "react";

function playableAudioUrl(url: string) {
  const match = url.match(/^\/music\/([^/]+)\.mp3$/);
  return match ? `/api/music/${match[1]}` : url;
}

export type SoundtrackSettings = {
  enabled: boolean;
  audioUrl: string;
  name: string;
  startMode: string;
  startBlockId: string;
  startSeconds: string;
  endSeconds?: string;
  fadeInSeconds?: string;
  fadeOutSeconds?: string;
  fadeIn?: boolean;
  fadeOut?: boolean;
  loop?: boolean;
  allowMultiple?: boolean;
  tracks?: Array<{
    id: string;
    name: string;
    url: string;
    startSeconds?: string;
    endSeconds?: string;
  }>;
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
  const [playing, setPlaying] = useState(Boolean(settings.enabled));
  const [playbackError, setPlaybackError] = useState(false);
  const [mediaPlaying, setMediaPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const tracks = (
    settings.tracks?.length
      ? settings.tracks
      : [
          {
            id: settings.templateId || "soundtrack",
            name: settings.name,
            url: settings.audioUrl,
          },
        ]
  ).map((track) => ({ ...track, url: playableAudioUrl(track.url) }));
  const activeTrack = tracks[Math.min(trackIndex, tracks.length - 1)];
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
    if (!settings.enabled) return;
    const unlock = () => {
      const audio = audioRef.current;
      if (!audio || !activeTrack.url || !ready || mediaPlaying) return;
      setPlaying(true);
      audio.volume = 0.14;
      void audio.play().then(() => setPlaybackError(false)).catch(() => setPlaybackError(true));
    };
    document.addEventListener("pointerdown", unlock, { once: true, capture: true });
    document.addEventListener("touchend", unlock, { once: true, capture: true });
    return () => {
      document.removeEventListener("pointerdown", unlock, true);
      document.removeEventListener("touchend", unlock, true);
    };
  }, [settings.enabled, activeTrack.url, ready, mediaPlaying]);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!settings.enabled || !playing || !ready || mediaPlaying) {
      audio.pause();
      return;
    }
    audio.volume = 0.14;
    if (!initialized.current) {
      const seek = Math.max(
        0,
        Number(activeTrack.startSeconds ?? settings.startSeconds) || 0,
      );
      audio.currentTime = Number.isFinite(audio.duration)
        ? Math.min(seek, Math.max(audio.duration - 0.25, 0))
        : seek;
      initialized.current = true;
    }
    void audio.play().catch(() => {});
    const updateVolumeAndTrim = () => {
      const start = Math.max(
        0,
        Number(activeTrack.startSeconds ?? settings.startSeconds) || 0,
      );
      const configuredEnd =
        Number(activeTrack.endSeconds ?? settings.endSeconds) || 0;
      const end =
        configuredEnd > start
          ? Math.min(configuredEnd, audio.duration || configuredEnd)
          : audio.duration;
      const fadeIn = settings.fadeIn === false ? 0 : 2;
      const fadeOut = settings.fadeOut === false ? 0 : 2;
      if (Number.isFinite(end) && audio.currentTime >= end) {
        if (settings.loop) {
          audio.currentTime = start;
          audio.volume = fadeIn ? 0 : 0.14;
        } else if (trackIndex < tracks.length - 1) {
          initialized.current = false;
          setTrackIndex((value) => value + 1);
        } else {
          audio.pause();
          setPlaying(false);
        }
        return;
      }
      const inGain = fadeIn
        ? Math.min(1, Math.max(0, (audio.currentTime - start) / fadeIn))
        : 1;
      const outGain =
        fadeOut && Number.isFinite(end)
          ? Math.min(1, Math.max(0, (end - audio.currentTime) / fadeOut))
          : 1;
      audio.volume = 0.14 * Math.min(inGain, outGain);
    };
    audio.addEventListener("timeupdate", updateVolumeAndTrim);
    updateVolumeAndTrim();
    return () => audio.removeEventListener("timeupdate", updateVolumeAndTrim);
  }, [
    mediaPlaying,
    playing,
    ready,
    settings.enabled,
    settings.startSeconds,
    settings.endSeconds,
    settings.fadeIn,
    settings.fadeOut,
    settings.loop,
    activeTrack.startSeconds,
    activeTrack.endSeconds,
    trackIndex,
    tracks.length,
  ]);
  useEffect(() => {
    initialized.current = false;
  }, [activeTrack.url, settings.startBlockId, settings.startMode]);
  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio || !activeTrack.url) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      setPlaybackError(false);
      return;
    }
    setPlaybackError(false);
    setPlaying(true);
    if (!ready || mediaPlaying) return;
    audio.volume = 0.14;
    try {
      await audio.play();
    } catch {
      setPlaying(false);
      setPlaybackError(true);
    }
  }
  if (!settings.enabled) return null;
  return (
    <div
      className={`recipient-soundtrack ${playing && !mediaPlaying ? "playing" : ""}`}
    >
      <button
        disabled={!activeTrack.url}
        onClick={togglePlayback}
        aria-label={
          playbackError
            ? "Try playing soundtrack again"
            : playing
              ? "Pause soundtrack"
              : "Play soundtrack"
        }
      >
        {playing && !mediaPlaying ? "Ⅱ" : "♫"}
      </button>
      {activeTrack.url && (
        <audio ref={audioRef} src={activeTrack.url} preload="metadata" />
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
