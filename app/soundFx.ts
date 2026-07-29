"use client";

export type SoundEffect =
  | "envelope"
  | "celebration"
  | "correct"
  | "incorrect"
  | "wheel"
  | "win"
  | "tile"
  | "scratch"
  | "page"
  | "lever"
  | "reveal";

let audioContext: AudioContext | null = null;
let lastScratchAt = 0;

function context() {
  if (typeof window === "undefined") return null;
  audioContext ??= new AudioContext();
  if (audioContext.state === "suspended") void audioContext.resume();
  return audioContext;
}

function note(ctx: AudioContext, frequency: number, start: number, duration: number, volume = .035, type: OscillatorType = "sine") {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + .012);
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + .02);
}

function noise(ctx: AudioContext, duration: number, volume = .018) {
  const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < length; index++) data[index] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1800;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + duration);
  source.buffer = buffer;
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start();
}

export function playSound(effect: SoundEffect) {
  const ctx = context();
  if (!ctx) return;
  const now = ctx.currentTime;
  if (effect === "scratch") {
    const timestamp = performance.now();
    if (timestamp - lastScratchAt < 75) return;
    lastScratchAt = timestamp;
    noise(ctx, .07, .009);
    return;
  }
  if (effect === "envelope") {
    noise(ctx, .12, .012);
    note(ctx, 392, now, .13, .025);
    note(ctx, 587, now + .08, .18, .025);
  } else if (effect === "celebration") {
    [659, 784, 988].forEach((frequency, index) => note(ctx, frequency, now + index * .055, .22, .024));
  } else if (effect === "correct") {
    note(ctx, 523, now, .13, .03);
    note(ctx, 784, now + .09, .2, .035);
  } else if (effect === "incorrect") {
    note(ctx, 220, now, .16, .025, "triangle");
    note(ctx, 185, now + .09, .18, .022, "triangle");
  } else if (effect === "wheel") {
    for (let index = 0; index < 18; index++) note(ctx, 850 + index * 13, now + index * .075, .035, .012, "square");
  } else if (effect === "win") {
    [523, 659, 784, 1047].forEach((frequency, index) => note(ctx, frequency, now + index * .09, .3, .03));
  } else if (effect === "tile") {
    note(ctx, 330, now, .055, .018, "triangle");
    note(ctx, 440, now + .035, .06, .016, "triangle");
  } else if (effect === "page") {
    noise(ctx, .16, .014);
    note(ctx, 420, now + .04, .12, .014);
  } else if (effect === "lever") {
    note(ctx, 180, now, .1, .025, "square");
    note(ctx, 110, now + .08, .15, .022, "triangle");
  } else if (effect === "reveal") {
    note(ctx, 440, now, .15, .025);
    note(ctx, 660, now + .08, .2, .027);
  }
}
